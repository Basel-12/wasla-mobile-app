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
// import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
// import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
// import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker
// import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerResult
import com.google.mediapipe.tasks.vision.holisticlandmarker.HolisticLandmarker
import com.google.mediapipe.tasks.vision.holisticlandmarker.HolisticLandmarkerResult
// import java.util.concurrent.ExecutorService
// import java.util.concurrent.Executors
// import java.util.concurrent.Future
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


class ActivationGate(
    private val velocityThreshold: Float = 0.02f
) {
    private var prevLandmarks: FloatArray? = null

    fun check(leftHand: FloatArray?, rightHand: FloatArray?): Boolean {
        if (leftHand == null && rightHand == null) {
            prevLandmarks = null
            return false
        }

        val current = FloatArray(126).also { buf ->
            leftHand?.copyInto(buf, 0)
            rightHand?.copyInto(buf, 63)
        }

        val prev = prevLandmarks
        prevLandmarks = current.copyOf()

        if (prev == null) return true

        var sumSq = 0f
        for (i in current.indices) {
            val diff = current[i] - prev[i]
            sumSq += diff * diff
        }
        val velocity = Math.sqrt(sumSq.toDouble()).toFloat()
        return velocity >= velocityThreshold
    }

    fun reset() { prevLandmarks = null }
}

// Crop face region from bitmap using face landmarks bounding box
fun cropFace(
    bitmap: Bitmap,
    faceLandmarks: List<NormalizedLandmark>
): Bitmap? {
    if (faceLandmarks.isEmpty()) return null

    val w = bitmap.width.toFloat()
    val h = bitmap.height.toFloat()

    // Get bounding box from landmarks
    var minX = Float.MAX_VALUE; var maxX = Float.MIN_VALUE
    var minY = Float.MAX_VALUE; var maxY = Float.MIN_VALUE

    for (lm in faceLandmarks) {
        if (lm.x() < minX) minX = lm.x()
        if (lm.x() > maxX) maxX = lm.x()
        if (lm.y() < minY) minY = lm.y()
        if (lm.y() > maxY) maxY = lm.y()
    }

    // Add 20% padding around face
    val padX = (maxX - minX) * 0.2f
    val padY = (maxY - minY) * 0.2f

    val left   = ((minX - padX) * w).toInt().coerceIn(0, bitmap.width)
    val top    = ((minY - padY) * h).toInt().coerceIn(0, bitmap.height)
    val right  = ((maxX + padX) * w).toInt().coerceIn(0, bitmap.width)
    val bottom = ((maxY + padY) * h).toInt().coerceIn(0, bitmap.height)

    if (right <= left || bottom <= top) return null

    return Bitmap.createBitmap(bitmap, left, top, right - left, bottom - top)
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

        // No hands at all → reset voter
        if (leftHand == null && rightHand == null) {
            voter.reset()
            return mapOf("label" to "__no_hands__", "confidence" to 0f, "committed" to false)
        }

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




        // If top-1 and top-2 are too close, the model is confused → skip this frame
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


// ─── Emotion Classifier ──────────────────────────────────────────────────────────
class EmotionClassifier(private val context: Context) {

    private var interpreter: Interpreter? = null

        // DeepFace model output order — what the TFLite model actually outputs
    private val DEEPFACE_ORDER = listOf(
        "angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"
    )
    
        // ESL model expected one-hot order — must match EMOTION_CLASSES in inference.py
    private val ESL_ORDER = listOf(
        "angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"
    )
    
    private val NEUTRAL_IDX_ESL = ESL_ORDER.indexOf("neutral")  // 4


    fun load() {
        val assetFd     = context.assets.openFd("models/emotion_model.tflite")
        val inputStream = FileInputStream(assetFd.fileDescriptor)
        val fileChannel = inputStream.channel
        val model: MappedByteBuffer = fileChannel.map(
            FileChannel.MapMode.READ_ONLY,
            assetFd.startOffset,
            assetFd.declaredLength
        )
        interpreter = Interpreter(model)
        Log.d("EmotionClassifier", "Loaded emotion model")
    }

    data class EmotionOutput(
        val oneHot:     FloatArray,
        val confidence: Float
    )

    // Returns one-hot float array of length 7
    // Input: 48×48 grayscale face crop from the camera frame

    fun classify(faceBitmap: Bitmap): EmotionOutput {
        val interp = interpreter ?: return EmotionOutput(
            oneHot = neutralOneHot(),
            confidence = 0f
        )       

        // Resize to 48×48 grayscale
        val resized = Bitmap.createScaledBitmap(faceBitmap, 48, 48, true)

        // Fill input tensor: shape (1, 48, 48, 1), float32, normalized [0,1]
        val input = Array(1) { Array(48) { Array(48) { FloatArray(1) } } }

        for (y in 0 until 48) {
            for (x in 0 until 48) {
                val pixel = resized.getPixel(x, y)
                // Convert to grayscale: Y = 0.299R + 0.587G + 0.114B
                val r = (pixel shr 16) and 0xFF
                val g = (pixel shr 8)  and 0xFF
                val b =  pixel         and 0xFF
                input[0][y][x][0] = (0.299f * r + 0.587f * g + 0.114f * b) / 255f
            }
        }
        resized.recycle()

        val output = Array(1) { FloatArray(7) }
        interp.run(input, output)

        val probs = output[0]

        // Step 1: argmax in DeepFace output order
        val deepfaceIdx =
            probs.indices.maxByOrNull { probs[it] }
                ?: return EmotionOutput(
                    oneHot = neutralOneHot(),
                    confidence = 0f
                )

        //confidence
        val confidence  = probs[deepfaceIdx]

        // Step 2: get the emotion string using DeepFace order
        val emotionStr = DEEPFACE_ORDER[deepfaceIdx]

        // Step 3: find index in ESL order
        val eslIdx = ESL_ORDER.indexOf(emotionStr).takeIf { it >= 0 } ?: NEUTRAL_IDX_ESL

        Log.d("EmotionClassifier", "DeepFace[$deepfaceIdx]=$emotionStr → ESL[$eslIdx]")

        // Step 4: return one-hot in ESL order
        return EmotionOutput(
            oneHot     = FloatArray(7).also { it[eslIdx] = 1f },
            confidence = confidence
        )
    }

    fun neutralOneHot(): FloatArray = FloatArray(7).also { it[NEUTRAL_IDX_ESL] = 1f }

    fun close() { interpreter?.close(); interpreter = null }
}

// ─── MediapipeCameraView ──────────────────────────────────────────────────────────

class MediapipeCameraView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {

    private val onLandmarks by EventDispatcher()
    private val onError     by EventDispatcher()
    private val onReady     by EventDispatcher()
    private val onSignDetected by EventDispatcher()
    private val onEmotionDetected by EventDispatcher()

    private var textureView: TextureView

    private var cameraDevice:    CameraDevice?         = null
    private var captureSession:  CameraCaptureSession? = null
    private var inferenceReader: ImageReader?          = null

    private val INFERENCE_WIDTH  = 1280
    private val INFERENCE_HEIGHT = 720

    private var cameraThread: HandlerThread? = null
    private var cameraHandler: Handler?      = null


    private var reusableBitmap:    Bitmap?   = null
    private var reusableArgbArray: IntArray? = null

    private var isRunning         = false
    private var lastProcessedTime = 0L
    private val PROCESS_INTERVAL_MS = 66L

    private var facing      = "front"
    private val eslClassifier = ESLClassifier(context)
    private val activationGate = ActivationGate(velocityThreshold = 0.02f) 
    private val emotionClassifier  = EmotionClassifier(context)
    @Volatile
    private var cachedEmotion =
        EmotionClassifier.EmotionOutput(
            oneHot = FloatArray(7).also { it[4] = 1f },
            confidence = 1f
        )
    private var emotionFrameCount  = 0
    private val EMOTION_INTERVAL   = 20 // run emotion every 20 frames

    private var previewSize = Size(1280, 720)

    private val ESL_EMOTION_CLASSES = listOf(
        "angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"
    )

    private fun emotionOneHotToString(oneHot: FloatArray): String {
        val idx = oneHot.indices.maxByOrNull { oneHot[it] } ?: 4
        return ESL_EMOTION_CLASSES.getOrElse(idx) { "neutral" }
    }

    init {

        ModelManager.preload(context)
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

        val matrix = Matrix()

        val viewW = viewWidth.toFloat()
        val viewH = viewHeight.toFloat()

        val bufferW = previewSize.height.toFloat()
        val bufferH = previewSize.width.toFloat()

        val scale = maxOf(viewW / bufferW, viewH / bufferH)

        val dx = (viewW - bufferW * scale) / 2f
        val dy = (viewH - bufferH * scale) / 2f

        matrix.setScale(scale, scale)
        matrix.postTranslate(dx, dy)


        textureView.setTransform(matrix)
    }



    private fun startCamera() {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED
        ) {
            onError(mapOf("message" to "Camera permission not granted"))
            return
        }

        try {

            // Kick off model loading in parallel with camera hardware open

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
                    if (now - lastProcessedTime >= PROCESS_INTERVAL_MS && ModelManager.isReady) {
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
                            set(CaptureRequest.CONTROL_ZOOM_RATIO, 1.0f)
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
        if (!isRunning || !ModelManager.isReady) return
        try {
            val mpImageForHolistic = BitmapImageBuilder(bitmap).build()

            val result: HolisticLandmarkerResult = ModelManager.holisticLandmarker?.detect(mpImageForHolistic) ?: return

            // ── Force-cast Java raw types to typed Kotlin lists ───────────────────────────
            @Suppress("UNCHECKED_CAST")
            val leftLandmarks  = result.leftHandLandmarks()  as? List<NormalizedLandmark> ?: emptyList()
            @Suppress("UNCHECKED_CAST")
            val rightLandmarks = result.rightHandLandmarks() as? List<NormalizedLandmark> ?: emptyList()
            @Suppress("UNCHECKED_CAST")
            val faceLandmarks  = result.faceLandmarks()      as? List<NormalizedLandmark> ?: emptyList()

            val leftHandNorm:  FloatArray? = if (leftLandmarks.isNotEmpty())  normalizeHand(leftLandmarks)  else null
            val rightHandNorm: FloatArray? = if (rightLandmarks.isNotEmpty()) normalizeHand(rightLandmarks) else null
            val faceNorm:      FloatArray? = if (faceLandmarks.isNotEmpty())  normalizeFace(faceLandmarks)  else null

            // ── Emotion — run every N frames, cache result ────────────────────────────
            emotionFrameCount++
            if (emotionFrameCount >= EMOTION_INTERVAL && faceLandmarks.isNotEmpty()) {
                emotionFrameCount = 0
                val faceCrop = cropFace(bitmap, faceLandmarks)
                if (faceCrop != null) {
                    ModelManager.emotionClassifier?.classify(faceCrop)?.let {
                        cachedEmotion = it
                    }
                    faceCrop.recycle()

                    val emotionStr = emotionOneHotToString(cachedEmotion.oneHot)
                    onEmotionDetected(mapOf(
                        "emotion" to emotionStr, 
                        "confidence" to cachedEmotion.confidence,
                        "timestamp" to System.currentTimeMillis()
                        ))
                }
            }

            val isActive = activationGate.check(leftHandNorm, rightHandNorm)
            val signResult: Map<String, Any>? = if (isActive) {
                ModelManager.eslClassifier?.classify(leftHandNorm, rightHandNorm, faceNorm)
            } else {
                ModelManager.eslClassifier?.reset()
                null
            }

            // ── Build JS payload ──────────────────────────────────────────────────────────
            val handsData = mutableListOf<List<Map<String, Float>>>()

            if (leftLandmarks.isNotEmpty()) {
                val leftList = mutableListOf<Map<String, Float>>()
                for (lm: NormalizedLandmark in leftLandmarks) {
                    leftList.add(mapOf<String, Float>("x" to lm.x(), "y" to lm.y(), "z" to lm.z()))
                }
                handsData.add(leftList)
            }

            if (rightLandmarks.isNotEmpty()) {
                val rightList = mutableListOf<Map<String, Float>>()
                for (lm: NormalizedLandmark in rightLandmarks) {
                    rightList.add(mapOf<String, Float>("x" to lm.x(), "y" to lm.y(), "z" to lm.z()))
                }
                handsData.add(rightList)
            }

            val handednessData = mutableListOf<String>()
            if (leftLandmarks.isNotEmpty())  handednessData.add("Left")
            if (rightLandmarks.isNotEmpty()) handednessData.add("Right")

            val faceData = mutableListOf<Map<String, Float>>()
            for (lm: NormalizedLandmark in faceLandmarks) {
                faceData.add(mapOf<String, Float>("x" to lm.x(), "y" to lm.y(), "z" to lm.z()))
            }

            onLandmarks(mapOf(
                "hands"     to handsData,
                "handedness" to handednessData,
                "face"      to faceData,
                "timestamp" to System.currentTimeMillis()
            ))

            if (signResult != null) {
                onSignDetected(signResult)
            }
        } catch (e: Exception) {
            Log.e("MediapipeCameraView", "Frame processing error: ${e.message}")
        }
    }

    private fun stopCamera() {
        isRunning   = false
        try {
            captureSession?.stopRepeating()
            captureSession?.close()
            cameraDevice?.close()
            inferenceReader?.close()
            cameraThread?.quitSafely()
            // handLandmarker?.close()
            // faceLandmarker?.close()
            activationGate.reset() // reset velocity tracker
        } catch (e: Exception) {
            Log.e("MediapipeCameraView", "Error stopping camera: ${e.message}")
        } finally {
            captureSession    = null
            cameraDevice      = null
            inferenceReader   = null
            cameraThread      = null
            cameraHandler     = null
            // handLandmarker    = null
            // faceLandmarker    = null
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