package expo.modules.mediapipe

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.ImageFormat
import android.graphics.Matrix
import android.graphics.SurfaceTexture
import android.hardware.camera2.*
import android.media.ImageReader
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import android.util.Size
import android.view.Surface
import android.view.TextureView
import androidx.core.content.ContextCompat
import android.hardware.camera2.CameraMetadata
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerResult
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.Future
import org.json.JSONObject
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel
import java.util.ArrayDeque
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark


// ── Face landmark indices — must match FACE_IDX in inference.py exactly ───────
private val FACE_IDX = intArrayOf(0, 1, 13, 14, 17, 33, 61, 199, 263, 291)

// ─── Normalization ────────────────────────────────────────────────────────────

fun normalizeHand(landmarks: List<NormalizedLandmark>): FloatArray {
    val raw = FloatArray(landmarks.size * 3)
    for (i in landmarks.indices) {
        raw[i * 3]     = landmarks[i].x()
        raw[i * 3 + 1] = landmarks[i].y()
        raw[i * 3 + 2] = landmarks[i].z()
    }

    // Center on wrist (index 0)
    val wristX = raw[0]; val wristY = raw[1]; val wristZ = raw[2]
    for (i in raw.indices step 3) {
        raw[i] -= wristX; raw[i + 1] -= wristY; raw[i + 2] -= wristZ
    }

    // Scale by MAX L2 norm of any single point
    var maxNorm = 0f
    for (i in 0 until landmarks.size) {
        val x = raw[i * 3]; val y = raw[i * 3 + 1]; val z = raw[i * 3 + 2]
        val norm = Math.sqrt((x * x + y * y + z * z).toDouble()).toFloat()
        if (norm > maxNorm) maxNorm = norm
    }
    if (maxNorm > 0f) for (i in raw.indices) raw[i] /= maxNorm

    return raw // 63 floats
}


fun normalizeFace(allLandmarks: List<NormalizedLandmark>): FloatArray {
    // Extract only the 10 specific face indices
    val raw = FloatArray(FACE_IDX.size * 3)
    for ((outIdx, faceIdx) in FACE_IDX.withIndex()) {
        val lm = allLandmarks.getOrNull(faceIdx) ?: continue
        raw[outIdx * 3]     = lm.x()
        raw[outIdx * 3 + 1] = lm.y()
        raw[outIdx * 3 + 2] = lm.z()
    }

    // Center on centroid (mean of all 10 points)
    var meanX = 0f; var meanY = 0f; var meanZ = 0f
    for (i in 0 until FACE_IDX.size) {
        meanX += raw[i * 3]; meanY += raw[i * 3 + 1]; meanZ += raw[i * 3 + 2]
    }
    meanX /= FACE_IDX.size; meanY /= FACE_IDX.size; meanZ /= FACE_IDX.size
    for (i in raw.indices step 3) {
        raw[i] -= meanX; raw[i + 1] -= meanY; raw[i + 2] -= meanZ
    }

    // Scale by max L2 norm of any single point from centroid
    var maxNorm = 0f
    for (i in 0 until FACE_IDX.size) {
        val x = raw[i * 3]; val y = raw[i * 3 + 1]; val z = raw[i * 3 + 2]
        val norm = Math.sqrt((x * x + y * y + z * z).toDouble()).toFloat()
        if (norm > maxNorm) maxNorm = norm
    }
    if (maxNorm > 0f) for (i in raw.indices) raw[i] /= maxNorm

    return raw // 30 floats
}


// ─── Sliding Window Voter ─────────────────────────────────────────────────────

class SlidingWindowVoter(
    private val windowSize: Int      = 5,
    private val minVotes: Int        = 3,
    private val minConfidence: Float = 0.70f
) {
    private val window = ArrayDeque<Pair<String, Float>>()

    fun push(label: String, confidence: Float): Pair<String, Float>? {
        if (label == "__no_hands__") { window.clear(); return null }

        window.addLast(label to confidence)
        if (window.size > windowSize) window.removeFirst()
        if (window.size < windowSize) return null

        val topLabel = window.map { it.first }
            .groupingBy { it }.eachCount()
            .maxByOrNull { it.value }!!.key

        val votes   = window.count { it.first == topLabel }
        val avgConf = window.map { it.second }.average().toFloat()

        return if (votes >= minVotes && avgConf >= minConfidence)
            topLabel to avgConf
        else null
    }

    fun reset() = window.clear()
}


// ─── Sign Classifier ──────────────────────────────────────────────────────────

class ESLClassifier(private val context: Context) {

    private var interpreter: Interpreter? = null
    private var idx2label: Map<Int, String> = emptyMap()
    private val voter = SlidingWindowVoter()

    // ── Emotion classes order (must match EMOTION_CLASSES in inference.py) ─────────
    // ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]
    // neutral = index 4
    private val neutralEmotion = floatArrayOf(0f, 0f, 0f, 0f, 1f, 0f, 0f)

    fun load() {
        // Load TFLite model
        val assetFd  = context.assets.openFd("models/model_v2.tflite")
        val inputStream = FileInputStream(assetFd.fileDescriptor)
        val fileChannel = inputStream.channel
        val model: MappedByteBuffer = fileChannel.map(
            FileChannel.MapMode.READ_ONLY,
            assetFd.startOffset,
            assetFd.declaredLength
        )
        interpreter = Interpreter(model)

        // Load label map (inverted from label2idx → idx2label)
        val json = context.assets.open("models/label2idx.json")
            .bufferedReader().readText()
        val obj = JSONObject(json)
        idx2label = obj.keys().asSequence()
            .associate { key -> obj.getInt(key) to key }

        Log.d("ESLClassifier", "Loaded — ${idx2label.size} classes")
    }

    fun classify(
        leftHand:  FloatArray?,   // 63 floats or null if not detected
        rightHand: FloatArray?,   // 63 floats or null if not detected
        face:      FloatArray?,   // 30 floats or null
    ): Map<String, Any>? {
        val interp = interpreter ?: return null

        val left  = leftHand  ?: FloatArray(63)  // zeros = not detected
        val right = rightHand ?: FloatArray(63)
        val faceVec  = face      ?: FloatArray(30) 

        // Build 163-float input: left(63) + right(63) + face(30) + emotion(7)
        val input = left + right + faceVec + neutralEmotion

        // Run inference
        val numClasses = idx2label.size
        val output = Array(1) { FloatArray(numClasses) }
        interp.run(arrayOf(input), output)

        val probs  = output[0]
        val maxIdx = probs.indices.maxByOrNull { probs[it] } ?: return null
        val label  = idx2label[maxIdx] ?: return null
        val conf   = probs[maxIdx]


        val sortedIndices = probs.indices.sortedByDescending { probs[it] }
        val top1Idx  = sortedIndices[0]
        val top2Idx  = sortedIndices[1]
        val top1Conf = probs[top1Idx]
        val top2Conf = probs[top2Idx]
        val margin   = top1Conf - top2Conf  // the key signal

        // No hands at all → reset voter
        if (leftHand == null && rightHand == null) {
            voter.reset()
            return mapOf("label" to "__no_hands__", "confidence" to 0f, "committed" to false)
        }


        // If top-1 and top-2 are too close, the model is confused → skip this frame
        // This handles مكار/كداب confusion without slowing down clean detections
        if (margin < 0.25f) {
            return mapOf(
                "label"      to label,
                "confidence" to top1Conf,
                "committed"  to false  // don't push to voter
            )
        }

        // Apply sliding window smoothing
        val committed = voter.push(label, conf)

        return mapOf(
            "label"      to (committed?.first ?: label),
            "confidence" to (committed?.second ?: conf),
            "committed"  to (committed != null)  // true = stable prediction ready for UI
        )
    }

    fun reset() = voter.reset()

    fun close() { interpreter?.close(); interpreter = null }
}

class MediapipeCameraView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {

    private val onLandmarks by EventDispatcher()
    private val onError     by EventDispatcher()
    private val onReady     by EventDispatcher()
    private val onSignDetected by EventDispatcher() 

    private var textureView: TextureView

    private var handLandmarker: HandLandmarker? = null
    private var faceLandmarker: FaceLandmarker? = null

    private var cameraDevice:    CameraDevice?         = null
    private var captureSession:  CameraCaptureSession? = null
    private var inferenceReader: ImageReader?          = null

    private val INFERENCE_WIDTH  = 640
    private val INFERENCE_HEIGHT = 480

    private var cameraThread: HandlerThread? = null
    private var cameraHandler: Handler?      = null

    // [FIX] These are now var + nullable so they can be recreated on every startCamera() call.
    //       Previously they were val initialized once at construction — after onDetachedFromWindow()
    //       called quitSafely()/shutdown() on them they were permanently dead, making re-entry
    //       to the screen produce a blank camera with no inference ever running.
    private var modelThread:       HandlerThread?   = null
    private var modelHandler:      Handler?         = null
    private var inferenceExecutor: ExecutorService? = null

    @Volatile private var modelsReady = false

    private var reusableBitmap:    Bitmap?   = null
    private var reusableArgbArray: IntArray? = null

    private var isRunning         = false
    private var lastProcessedTime = 0L
    private val PROCESS_INTERVAL_MS = 66L

    private var facing      = "front"
    private val eslClassifier = ESLClassifier(context)
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

    private fun getOptimalPreviewSize(
        cameraManager: CameraManager,
        cameraId: String,
        targetWidth: Int,
        targetHeight: Int
    ): Size {
        val characteristics = cameraManager.getCameraCharacteristics(cameraId)
        val map = characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP)
            ?: return Size(1280, 720)

        val outputSizes = map.getOutputSizes(SurfaceTexture::class.java)
        val targetRatio = targetHeight.toDouble() / targetWidth.toDouble()

        return outputSizes
            .filter { it.width <= 1920 && it.height <= 1080 }
            .minByOrNull { size ->
                val ratio = size.width.toDouble() / size.height.toDouble()
                kotlin.math.abs(ratio - targetRatio)
            } ?: outputSizes.firstOrNull() ?: Size(1280, 720)
    }

    private fun configureTransform(viewWidth: Int, viewHeight: Int) {
        if (viewWidth == 0 || viewHeight == 0) return
        val matrix  = Matrix()
        val centerX = viewWidth  / 2f
        val centerY = viewHeight / 2f
        val scaleX  = viewWidth.toFloat()  / previewSize.height
        val scaleY  = viewHeight.toFloat() / previewSize.width
        val scale   = maxOf(scaleX, scaleY)
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

            eslClassifier.load()

            modelsReady = true
            Log.d("MediapipeCameraView", "All models ready — inference enabled")

        } catch (e: Exception) {
            Log.e("MediapipeCameraView", "Error initializing landmarkers: ${e.message}")
            onError(mapOf("message" to (e.message ?: "Failed to initialize landmarkers")))
        }
    }

    private fun startCamera() {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED
        ) {
            onError(mapOf("message" to "Camera permission not granted"))
            return
        }

        try {
            // [FIX] Create fresh instances of modelThread, modelHandler, and inferenceExecutor
            //       on every startCamera() call. The previous instances were shut down in
            //       stopCamera() (called by onDetachedFromWindow on screen exit), so reusing
            //       them on re-entry would silently drop all model loading and inference tasks.
            modelsReady = false

            modelThread  = HandlerThread("ModelLoadThread").also { it.start() }
            modelHandler = Handler(modelThread!!.looper)
            inferenceExecutor = Executors.newFixedThreadPool(2)

            // Kick off model loading in parallel with camera hardware open
            modelHandler!!.post { initLandmarkers() }

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

            previewSize = getOptimalPreviewSize(
                cameraManager, cameraId, textureView.width, textureView.height
            )
            Log.d("MediapipeCameraView", "Preview size: ${previewSize.width}x${previewSize.height}")

            inferenceReader = ImageReader.newInstance(
                INFERENCE_WIDTH, INFERENCE_HEIGHT, ImageFormat.YUV_420_888, 2
            )

            inferenceReader!!.setOnImageAvailableListener({ reader ->
                val image = reader.acquireLatestImage() ?: return@setOnImageAvailableListener
                try {
                    val now = System.currentTimeMillis()
                    if (now - lastProcessedTime >= PROCESS_INTERVAL_MS && modelsReady) {
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
        val camera         = cameraDevice ?: return
        val surfaceTexture = textureView.surfaceTexture ?: return
        val previewSurface = Surface(surfaceTexture)
        val surfaces       = listOf(previewSurface, inferenceReader!!.surface)

        camera.createCaptureSession(
            surfaces,
            object : CameraCaptureSession.StateCallback() {
                override fun onConfigured(session: CameraCaptureSession) {
                    captureSession = session

                    val requestBuilder =
                        camera.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW).apply {
                            addTarget(previewSurface)
                            addTarget(inferenceReader!!.surface)
                            set(CaptureRequest.CONTROL_AF_MODE,
                                CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_PICTURE)
                            set(CaptureRequest.CONTROL_AE_MODE,
                                CaptureRequest.CONTROL_AE_MODE_ON)
                            set(CaptureRequest.CONTROL_AWB_MODE,
                                CaptureRequest.CONTROL_AWB_MODE_AUTO)
                            set(CaptureRequest.CONTROL_MODE,
                                CameraMetadata.CONTROL_MODE_AUTO)
                            set(CaptureRequest.NOISE_REDUCTION_MODE,
                                CaptureRequest.NOISE_REDUCTION_MODE_FAST)
                            set(CaptureRequest.EDGE_MODE,
                                CaptureRequest.EDGE_MODE_FAST)
                        }

                    session.setRepeatingRequest(requestBuilder.build(), null, cameraHandler)
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
            val width      = image.width
            val height     = image.height
            val pixelCount = width * height

            val argbArray = reusableArgbArray
                ?.takeIf { it.size == pixelCount }
                ?: IntArray(pixelCount).also { reusableArgbArray = it }

            val yPlane        = image.planes[0]
            val uPlane        = image.planes[1]
            val yBuf          = yPlane.buffer
            val uBuf          = uPlane.buffer
            val vBuf          = image.planes[2].buffer
            val yRowStride    = yPlane.rowStride
            val uvRowStride   = uPlane.rowStride
            val uvPixelStride = uPlane.pixelStride

            for (row in 0 until height) {
                for (col in 0 until width) {
                    val yIndex  = row * yRowStride + col
                    val uvIndex = (row / 2) * uvRowStride + (col / 2) * uvPixelStride

                    val y = (yBuf.get(yIndex).toInt() and 0xFF) - 16
                    val u = (uBuf.get(uvIndex).toInt() and 0xFF) - 128
                    val v = (vBuf.get(uvIndex).toInt() and 0xFF) - 128

                    val r = (1.164f * y + 1.596f * v).toInt().coerceIn(0, 255)
                    val g = (1.164f * y - 0.813f * v - 0.391f * u).toInt().coerceIn(0, 255)
                    val b = (1.164f * y + 2.018f * u).toInt().coerceIn(0, 255)

                    argbArray[row * width + col] = (0xFF shl 24) or (r shl 16) or (g shl 8) or b
                }
            }

            val bitmap = reusableBitmap
                ?.takeIf { it.width == width && it.height == height }
                ?: Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                    .also { reusableBitmap = it }

            bitmap.setPixels(argbArray, 0, width, 0, 0, width, height)

            // Rotate raw sensor frame to match portrait orientation seen by the user.
            // Front camera: 270° + horizontal mirror. Back camera: 90°.
            val degrees = if (facing == "front") 270f else 90f
            val rotMatrix = Matrix().apply {
                postRotate(degrees)
                // if (facing == "front") {
                //     postScale(-1f, 1f, bitmap.width / 2f, bitmap.height / 2f)
                // }
            }
            val rotated = Bitmap.createBitmap(bitmap, 0, 0, width, height, rotMatrix, true)
            processFrame(rotated)
            rotated.recycle()

        } catch (e: Exception) {
            Log.e("MediapipeCameraView", "YUV processing error: ${e.message}")
        }
    }

    private fun processFrame(bitmap: Bitmap) {
        // [FIX] Guard against a null/shutdown executor (can happen during teardown race)
        val executor = inferenceExecutor ?: return

        try {
            val mpImageForHands = BitmapImageBuilder(bitmap).build()
            val mpImageForFace  = BitmapImageBuilder(bitmap).build()

            val handFuture: Future<HandLandmarkerResult?> =
                executor.submit<HandLandmarkerResult?> {
                    handLandmarker?.detect(mpImageForHands)
                }
            val faceFuture: Future<FaceLandmarkerResult?> =
                executor.submit<FaceLandmarkerResult?> {
                    faceLandmarker?.detect(mpImageForFace)
                }

            val handResult = handFuture.get()
            val faceResult = faceFuture.get()

            var leftHandNorm:  FloatArray? = null
            var rightHandNorm: FloatArray? = null

            handResult?.landmarks()?.forEachIndexed { i, hand ->
                val side = handResult.handednesses()
                    .getOrNull(i)?.firstOrNull()?.categoryName() ?: return@forEachIndexed
                    val normalized = normalizeHand(hand)
                    if (side == "Left")  leftHandNorm  = normalized
                    if (side == "Right") rightHandNorm = normalized
            }

              // ── Sign classification ───────────────────────────────────────────
            val faceNorm = faceResult?.faceLandmarks()
            ?.firstOrNull()
            ?.let { normalizeFace(it) }

            val signResult = eslClassifier.classify(leftHandNorm, rightHandNorm, faceNorm)

              // ── Build landmark payload for JS (unchanged) ─────────────────────
            val handsData = handResult?.landmarks()?.map { hand ->
                hand.map { lm -> mapOf("x" to lm.x(), "y" to lm.y(), "z" to lm.z()) }
            } ?: emptyList()

            val handednessData = handResult?.handednesses()?.map { h ->
                h.firstOrNull()?.categoryName() ?: "Unknown"
            } ?: emptyList()

            val faceData = faceResult?.faceLandmarks()?.firstOrNull()?.map { lm ->
                mapOf("x" to lm.x(), "y" to lm.y(), "z" to lm.z())
            } ?: emptyList()

            // ── Emit landmark event (unchanged) ──────────────────────────────
            onLandmarks(mapOf(
                "hands"      to handsData,
                "handedness" to handednessData,
                "face"       to faceData,
                "timestamp"  to System.currentTimeMillis()
            ))

            // ── Emit sign event (new) ─────────────────────────────────────────
            if (signResult != null) {
                onSignDetected(signResult)
            }


        } catch (e: Exception) {
            Log.e("MediapipeCameraView", "Frame processing error: ${e.message}")
        }
    }

    // [FIX] stopCamera() now also shuts down modelThread and inferenceExecutor,
    //       because startCamera() will always create fresh ones on the next call.
    //       Previously these were only torn down in onDetachedFromWindow(), which meant
    //       they were never recreated when the screen was re-entered.
    private fun stopCamera() {
        isRunning   = false
        modelsReady = false
        try {
            captureSession?.stopRepeating()
            captureSession?.close()
            cameraDevice?.close()
            inferenceReader?.close()
            cameraThread?.quitSafely()
            handLandmarker?.close()
            faceLandmarker?.close()
            // Tear down the per-session threads — startCamera() recreates them
            modelThread?.quitSafely()
            inferenceExecutor?.shutdown()
        } catch (e: Exception) {
            Log.e("MediapipeCameraView", "Error stopping camera: ${e.message}")
        } finally {
            captureSession    = null
            cameraDevice      = null
            inferenceReader   = null
            cameraThread      = null
            cameraHandler     = null
            handLandmarker    = null
            faceLandmarker    = null
            modelThread       = null
            modelHandler      = null
            inferenceExecutor = null
            reusableBitmap?.recycle()
            reusableBitmap    = null
            reusableArgbArray = null
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        // stopCamera() already handles full cleanup including threads now
        stopCamera()
    }
}