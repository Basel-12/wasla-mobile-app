package expo.modules.mediapipe

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.graphics.Matrix
import android.graphics.Rect
import android.graphics.SurfaceTexture
import android.hardware.camera2.*
import android.media.ImageReader
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import android.util.Size
import android.view.Surface
import android.view.TextureView
import android.graphics.YuvImage
import androidx.core.content.ContextCompat
import android.hardware.camera2.CameraMetadata
import android.graphics.RectF
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
// import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerOptions
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker
// import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerOptions
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerResult
import java.io.ByteArrayOutputStream

class MediapipeCameraView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {

  private val onLandmarks by EventDispatcher()
  private val onError by EventDispatcher()
  private val onReady by EventDispatcher()

  private var textureView: TextureView
  private var handLandmarker: HandLandmarker? = null
  private var faceLandmarker: FaceLandmarker? = null

  private var cameraDevice: CameraDevice? = null
  private var captureSession: CameraCaptureSession? = null
  private var imageReader: ImageReader? = null

  private var cameraThread: HandlerThread? = null
  private var cameraHandler: Handler? = null

  private var isRunning = false
  private var lastProcessedTime = 0L
  private val PROCESS_INTERVAL_MS = 66L

  private var facing = "front"
  private var previewSize = Size(1280, 720)

  init {
    textureView = TextureView(context)
    addView(textureView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))

    textureView.surfaceTextureListener = object : TextureView.SurfaceTextureListener {
      override fun onSurfaceTextureAvailable(surface: SurfaceTexture, width: Int, height: Int) {
        startCamera()
      }

      override fun onSurfaceTextureSizeChanged(surface: SurfaceTexture, width: Int, height: Int) {
        configureTransform(width, height)
      }

      override fun onSurfaceTextureDestroyed(surface: SurfaceTexture): Boolean {
        stopCamera()
        return true
      }

      override fun onSurfaceTextureUpdated(surface: SurfaceTexture) {}
    }
  }

  fun setFacing(newFacing: String) {
    if (facing != newFacing) {
      facing = newFacing
      if (textureView.isAvailable) {
        stopCamera()
        startCamera()
      }
    }
  }


  private fun getOptimalPreviewSize(cameraManager: CameraManager, cameraId: String, targetWidth: Int, targetHeight: Int): Size {
    val characteristics = cameraManager.getCameraCharacteristics(cameraId)
    val map = characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP)
        ?: return Size(1280, 720)
    
    val outputSizes = map.getOutputSizes(SurfaceTexture::class.java)
    
    // Target aspect ratio of the view
    val targetRatio = targetHeight.toDouble() / targetWidth.toDouble()  // Portrait
    
    // Find size with closest aspect ratio, prefer sizes <= 1080p for performance
    return outputSizes
        .filter { it.width <= 1920 && it.height <= 1080 }
        .minByOrNull { size ->
            val ratio = size.width.toDouble() / size.height.toDouble()
            kotlin.math.abs(ratio - targetRatio)
        } ?: outputSizes.firstOrNull() ?: Size(1280, 720)
}

  private fun configureTransform(viewWidth: Int, viewHeight: Int) {
      if (viewWidth == 0 || viewHeight == 0) return
  
      val matrix = Matrix()
      val centerX = viewWidth / 2f
      val centerY = viewHeight / 2f
      
      val scaleX = viewWidth.toFloat() / previewSize.height
      val scaleY = viewHeight.toFloat() / previewSize.width
      val scale = maxOf(scaleX, scaleY)
      
      matrix.setScale(scale, scale, centerX, centerY)
      textureView.setTransform(matrix)
  }

  private fun initLandmarkers() {
    try {
      val baseHandOptions = BaseOptions.builder()
        .setModelAssetPath("models/hand_landmarker.task")
        .setDelegate(Delegate.GPU)
        .build()

      val handOptions = HandLandmarker.HandLandmarkerOptions.builder()
        .setBaseOptions(baseHandOptions)
        .setNumHands(2)
        .setMinHandDetectionConfidence(0.5f)
        .setMinHandPresenceConfidence(0.5f)
        .setMinTrackingConfidence(0.5f)
        .setRunningMode(RunningMode.IMAGE)
        .build()

      handLandmarker = HandLandmarker.createFromOptions(context, handOptions)
      Log.d("MediapipeCameraView", "HandLandmarker ready")

      val baseFaceOptions = BaseOptions.builder()
        .setModelAssetPath("models/face_landmarker.task")
        .setDelegate(Delegate.GPU)
        .build()

      val faceOptions = FaceLandmarker.FaceLandmarkerOptions.builder()
        .setBaseOptions(baseFaceOptions)
        .setNumFaces(1)
        .setMinFaceDetectionConfidence(0.5f)
        .setMinFacePresenceConfidence(0.5f)
        .setMinTrackingConfidence(0.5f)
        .setRunningMode(RunningMode.IMAGE)
        .build()

      faceLandmarker = FaceLandmarker.createFromOptions(context, faceOptions)
      Log.d("MediapipeCameraView", "FaceLandmarker ready")
    } catch (e: Exception) {
      Log.e("MediapipeCameraView", "Error initializing landmarkers: ${e.message}")
      onError(mapOf("message" to (e.message ?: "Failed to initialize landmarkers")))
    }
  }

  private fun startCamera() {
    if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA)
      != PackageManager.PERMISSION_GRANTED) {
      onError(mapOf("message" to "Camera permission not granted"))
      return
    }

    try {
      initLandmarkers()

      cameraThread = HandlerThread("MediaPipeCameraThread").also { it.start() }
      cameraHandler = Handler(cameraThread!!.looper)

      val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
      val lensFacing = if (facing == "front")
        CameraCharacteristics.LENS_FACING_FRONT
      else
        CameraCharacteristics.LENS_FACING_BACK

      val cameraId = cameraManager.cameraIdList.firstOrNull { id ->
        cameraManager.getCameraCharacteristics(id)
          .get(CameraCharacteristics.LENS_FACING) == lensFacing
      } ?: run {
        onError(mapOf("message" to "No $facing camera found"))
        return
      }

      previewSize = getOptimalPreviewSize(cameraManager, cameraId, textureView.width, textureView.height)
      Log.d("MediapipeCameraView", "Using preview size: ${previewSize.width}x${previewSize.height}")

      imageReader = ImageReader.newInstance(
        previewSize.width,
        previewSize.height,
        ImageFormat.YUV_420_888,
        2
      )

      imageReader!!.setOnImageAvailableListener({ reader ->
        val image = reader.acquireLatestImage() ?: return@setOnImageAvailableListener
        try {
          val now = System.currentTimeMillis()
          if (now - lastProcessedTime >= PROCESS_INTERVAL_MS) {
            lastProcessedTime = now
            processYuvImage(image)
          }
        } finally {
          image.close()
        }
      }, cameraHandler)

      isRunning = true

      textureView.surfaceTexture?.setDefaultBufferSize(previewSize.width, previewSize.height)
      configureTransform(textureView.width, textureView.height)

      cameraManager.openCamera(cameraId, object : CameraDevice.StateCallback() {
        override fun onOpened(camera: CameraDevice) {
          cameraDevice = camera
          createCaptureSession()
        }

        override fun onDisconnected(camera: CameraDevice) {
          camera.close()
          cameraDevice = null
        }

        override fun onError(camera: CameraDevice, error: Int) {
          camera.close()
          cameraDevice = null
          onError(mapOf("message" to "Camera error code: $error"))
        }
      }, cameraHandler)

    } catch (e: Exception) {
      Log.e("MediapipeCameraView", "Error starting camera: ${e.message}")
      onError(mapOf("message" to (e.message ?: "Failed to start camera")))
    }
  }

  private fun createCaptureSession() {
    val camera = cameraDevice ?: return
    val surfaceTexture = textureView.surfaceTexture ?: return

    val previewSurface = Surface(surfaceTexture)
    val surfaces = listOf(previewSurface, imageReader!!.surface)

    camera.createCaptureSession(
      surfaces,
      object : CameraCaptureSession.StateCallback() {
        override fun onConfigured(session: CameraCaptureSession) {
          captureSession = session
          val requestBuilder = camera.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW).apply {

            addTarget(previewSurface)
            addTarget(imageReader!!.surface)
        
            // Autofocus
            set(
                CaptureRequest.CONTROL_AF_MODE,
                CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_PICTURE
            )
        
            // Auto Exposure
            set(
                CaptureRequest.CONTROL_AE_MODE,
                CaptureRequest.CONTROL_AE_MODE_ON
            )
        
            // Auto White Balance
            set(
                CaptureRequest.CONTROL_AWB_MODE,
                CaptureRequest.CONTROL_AWB_MODE_AUTO
            )
        
            // Better FPS stability
            set(
                CaptureRequest.CONTROL_MODE,
                CameraMetadata.CONTROL_MODE_AUTO
            )
        
            // Optional: smoother video look
            set(
                CaptureRequest.NOISE_REDUCTION_MODE,
                CaptureRequest.NOISE_REDUCTION_MODE_FAST
            )
        
            // Optional: better image quality
            set(
                CaptureRequest.EDGE_MODE,
                CaptureRequest.EDGE_MODE_FAST
            )
        }
        
        session.setRepeatingRequest(
            requestBuilder.build(),
            null,
            cameraHandler
        )
          Log.d("MediapipeCameraView", "Camera capture started")
          onReady(mapOf("status" to "ready"))
        }

        override fun onConfigureFailed(session: CameraCaptureSession) {
          onError(mapOf("message" to "Camera configure failed"))
        }
      },
      cameraHandler
    )
  }

  private fun processYuvImage(image: android.media.Image) {
    if (!isRunning) return

    try {
      val yBuffer = image.planes[0].buffer
      val uBuffer = image.planes[1].buffer
      val vBuffer = image.planes[2].buffer

      val ySize = yBuffer.remaining()
      val uSize = uBuffer.remaining()
      val vSize = vBuffer.remaining()

      val nv21 = ByteArray(ySize + uSize + vSize)
      yBuffer.get(nv21, 0, ySize)
      vBuffer.get(nv21, ySize, vSize)
      uBuffer.get(nv21, ySize + vSize, uSize)

      val yuvImage = YuvImage(nv21, ImageFormat.NV21, image.width, image.height, null)
      val out = ByteArrayOutputStream()
      yuvImage.compressToJpeg(Rect(0, 0, image.width, image.height), 90, out)
      val bitmap = BitmapFactory.decodeByteArray(out.toByteArray(), 0, out.size())

      if (bitmap != null) {
        processFrame(bitmap)
        bitmap.recycle()
      }
    } catch (e: Exception) {
      Log.e("MediapipeCameraView", "YUV processing error: ${e.message}")
    }
  }

  private fun processFrame(bitmap: Bitmap) {
    try {
      val mpImage = BitmapImageBuilder(bitmap).build()

      val handResult: HandLandmarkerResult? = handLandmarker?.detect(mpImage)
      val faceResult: FaceLandmarkerResult? = faceLandmarker?.detect(mpImage)

      val handsData = handResult?.landmarks()?.map { hand ->
        hand.map { lm ->
          mapOf("x" to lm.x(), "y" to lm.y(), "z" to lm.z())
        }
      } ?: emptyList()

      val handednessData = handResult?.handednesses()?.map { h ->
        h.firstOrNull()?.categoryName() ?: "Unknown"
      } ?: emptyList()

      val faceData = faceResult?.faceLandmarks()?.firstOrNull()?.map { lm ->
        mapOf("x" to lm.x(), "y" to lm.y(), "z" to lm.z())
      } ?: emptyList()

      onLandmarks(mapOf(
        "hands" to handsData,
        "handedness" to handednessData,
        "face" to faceData,
        "timestamp" to System.currentTimeMillis()
      ))

    } catch (e: Exception) {
      Log.e("MediapipeCameraView", "Frame processing error: ${e.message}")
    }
  }

  private fun stopCamera() {
    isRunning = false
    try {
      captureSession?.stopRepeating()
      captureSession?.close()
      cameraDevice?.close()
      imageReader?.close()
      cameraThread?.quitSafely()
      handLandmarker?.close()
      faceLandmarker?.close()
    } catch (e: Exception) {
      Log.e("MediapipeCameraView", "Error stopping camera: ${e.message}")
    } finally {
      captureSession = null
      cameraDevice = null
      imageReader = null
      cameraThread = null
      cameraHandler = null
      handLandmarker = null
      faceLandmarker = null
    }
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    stopCamera()
  }
}
