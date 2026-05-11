package expo.modules.mediapipe

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.graphics.Matrix
import android.hardware.camera2.*
import android.media.ImageReader
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerOptions
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerOptions
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerResult

class MediapipeModule : Module() {

  private var handLandmarker: HandLandmarker? = null
  private var faceLandmarker: FaceLandmarker? = null

  private var cameraDevice: CameraDevice? = null
  private var captureSession: CameraCaptureSession? = null
  private var imageReader: ImageReader? = null

  private var cameraThread: HandlerThread? = null
  private var cameraHandler: Handler? = null

  private var isRunning = false
  private var lastProcessedTime = 0L
  private val PROCESS_INTERVAL_MS = 100L // process 10fps for MediaPipe

  override fun definition() = ModuleDefinition {

    Name("Mediapipe")

    Events("onLandmarks", "onError", "onReady")

    // ─── Start ────────────────────────────────────────────
    AsyncFunction("startDetection") {
      val context = appContext.reactContext ?: run {
        sendEvent("onError", mapOf("message" to "No context available"))
        return@AsyncFunction
      }

      if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA)
        != PackageManager.PERMISSION_GRANTED) {
        sendEvent("onError", mapOf("message" to "Camera permission not granted"))
        return@AsyncFunction
      }

      try {
        initHandLandmarker(context)
        initFaceLandmarker(context)
        startCamera(context)
        sendEvent("onReady", mapOf("status" to "ready"))
      } catch (e: Exception) {
        Log.e("Mediapipe", "Error starting detection: ${e.message}")
        sendEvent("onError", mapOf("message" to (e.message ?: "Unknown error")))
      }
    }

    // ─── Stop ─────────────────────────────────────────────
    AsyncFunction("stopDetection") {
      stopCamera()
    }
  }

  // ─── Init Hand Landmarker ─────────────────────────────
  private fun initHandLandmarker(context: Context) {
    val baseOptions = BaseOptions.builder()
      .setModelAssetPath("models/hand_landmarker.task")
      .setDelegate(Delegate.GPU)
      .build()

    val options = HandLandmarkerOptions.builder()
      .setBaseOptions(baseOptions)
      .setNumHands(2)
      .setMinHandDetectionConfidence(0.5f)
      .setMinHandPresenceConfidence(0.5f)
      .setMinTrackingConfidence(0.5f)
      .setRunningMode(RunningMode.IMAGE)
      .build()

    handLandmarker = HandLandmarker.createFromOptions(context, options)
    Log.d("Mediapipe", "HandLandmarker ready")
  }

  // ─── Init Face Landmarker ─────────────────────────────
  private fun initFaceLandmarker(context: Context) {
    val baseOptions = BaseOptions.builder()
      .setModelAssetPath("models/face_landmarker.task")
      .setDelegate(Delegate.GPU)
      .build()

    val options = FaceLandmarkerOptions.builder()
      .setBaseOptions(baseOptions)
      .setNumFaces(1)
      .setMinFaceDetectionConfidence(0.5f)
      .setMinFacePresenceConfidence(0.5f)
      .setMinTrackingConfidence(0.5f)
      .setRunningMode(RunningMode.IMAGE)
      .build()

    faceLandmarker = FaceLandmarker.createFromOptions(context, options)
    Log.d("Mediapipe", "FaceLandmarker ready")
  }

  // ─── Start Camera2 ────────────────────────────────────
  private fun startCamera(context: Context) {
    cameraThread = HandlerThread("MediaPipeCameraThread").also { it.start() }
    cameraHandler = Handler(cameraThread!!.looper)

    imageReader = ImageReader.newInstance(640, 480, ImageFormat.JPEG, 2)
    imageReader!!.setOnImageAvailableListener({ reader ->
      val image = reader.acquireLatestImage() ?: return@setOnImageAvailableListener
      try {
        val now = System.currentTimeMillis()
        if (now - lastProcessedTime >= PROCESS_INTERVAL_MS) {
          lastProcessedTime = now
          val buffer = image.planes[0].buffer
          val bytes = ByteArray(buffer.remaining())
          buffer.get(bytes)
          val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
          if (bitmap != null) {
            // flip bitmap for front camera
            val matrix = Matrix().apply { postScale(-1f, 1f, bitmap.width / 2f, bitmap.height / 2f) }
            val flipped = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
            processFrame(flipped)
          }
        }
      } finally {
        image.close()
      }
    }, cameraHandler)

    val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    val cameraId = cameraManager.cameraIdList.firstOrNull { id ->
      cameraManager.getCameraCharacteristics(id)
        .get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_FRONT
    } ?: run {
      sendEvent("onError", mapOf("message" to "No front camera found"))
      return
    }

    isRunning = true

    cameraManager.openCamera(cameraId, object : CameraDevice.StateCallback() {
      override fun onOpened(camera: CameraDevice) {
        cameraDevice = camera
        val surfaces = listOf(imageReader!!.surface)

        camera.createCaptureSession(
          surfaces,
          object : CameraCaptureSession.StateCallback() {
            override fun onConfigured(session: CameraCaptureSession) {
              captureSession = session
              val request = camera.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW).apply {
                addTarget(imageReader!!.surface)
              }.build()
              session.setRepeatingRequest(request, null, cameraHandler)
              Log.d("Mediapipe", "Camera capture started")
            }
            override fun onConfigureFailed(session: CameraCaptureSession) {
              sendEvent("onError", mapOf("message" to "Camera configure failed"))
            }
          },
          cameraHandler
        )
      }

      override fun onDisconnected(camera: CameraDevice) {
        camera.close()
        cameraDevice = null
      }

      override fun onError(camera: CameraDevice, error: Int) {
        camera.close()
        cameraDevice = null
        sendEvent("onError", mapOf("message" to "Camera error code: $error"))
      }
    }, cameraHandler)
  }

  // ─── Process Frame ────────────────────────────────────
  private fun processFrame(bitmap: Bitmap) {
    if (!isRunning) return

    try {
      val mpImage = BitmapImageBuilder(bitmap).build()

      // detect hands
      val handResult: HandLandmarkerResult? = handLandmarker?.detect(mpImage)
      // detect face
      val faceResult: FaceLandmarkerResult? = faceLandmarker?.detect(mpImage)

      // build hands data
      val handsData = handResult?.landmarks()?.map { hand ->
        hand.map { lm ->
          mapOf("x" to lm.x(), "y" to lm.y(), "z" to lm.z())
        }
      } ?: emptyList()

      // build handedness data
      val handednessData = handResult?.handednesses()?.map { h ->
        h.firstOrNull()?.categoryName() ?: "Unknown"
      } ?: emptyList()

      // build face data
      val faceData = faceResult?.faceLandmarks()?.firstOrNull()?.map { lm ->
        mapOf("x" to lm.x(), "y" to lm.y(), "z" to lm.z())
      } ?: emptyList()

      sendEvent("onLandmarks", mapOf(
        "hands"      to handsData,
        "handedness" to handednessData,
        "face"       to faceData,
        "timestamp"  to System.currentTimeMillis(),
      ))

    } catch (e: Exception) {
      Log.e("Mediapipe", "Frame processing error: ${e.message}")
    }
  }

  // ─── Stop Camera ──────────────────────────────────────
  private fun stopCamera() {
    isRunning = false
    try {
      captureSession?.stopRepeating()
      captureSession?.close()
      cameraDevice?.close()
      imageReader?.close()
      cameraThread?.quitSafely()
    } catch (e: Exception) {
      Log.e("Mediapipe", "Error stopping camera: ${e.message}")
    } finally {
      captureSession = null
      cameraDevice = null
      imageReader = null
      cameraThread = null
      cameraHandler = null
    }
  }
}