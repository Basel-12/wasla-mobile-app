package expo.modules.mediapipe

import android.content.Context
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.holisticlandmarker.HolisticLandmarker

object ModelManager {
    @Volatile var holisticLandmarker: HolisticLandmarker? = null
    @Volatile var eslClassifier:      ESLClassifier?      = null
    @Volatile var emotionClassifier:  EmotionClassifier?  = null
    @Volatile var isReady   = false
    @Volatile var isLoading = false

    private val thread  = HandlerThread("ModelPreloadThread").also { it.start() }
    private val handler = Handler(thread.looper)

    fun preload(context: Context) {
        if (isReady || isLoading) return
        isLoading = true
        handler.post { load(context.applicationContext) }
    }

    private fun load(context: Context) {
        try {
            val baseOptions = BaseOptions.builder()
                .setModelAssetPath("models/holistic_landmarker.task")
                .setDelegate(Delegate.GPU)
                .build()

            val options = HolisticLandmarker.HolisticLandmarkerOptions.builder()
                .setBaseOptions(baseOptions)
                .setMinFaceDetectionConfidence(0.5f)
                .setMinFacePresenceConfidence(0.5f)
                .setMinHandLandmarksConfidence(0.5f)
                .setRunningMode(RunningMode.IMAGE)
                .build()

            holisticLandmarker = HolisticLandmarker.createFromOptions(context, options)

            val esl = ESLClassifier(context)
            esl.load()
            eslClassifier = esl

            val emotion = EmotionClassifier(context)
            emotion.load()
            emotionClassifier = emotion

            isReady   = true
            isLoading = false
            Log.d("ModelManager", "All models ready")

        } catch (e: Exception) {
            isLoading = false
            Log.e("ModelManager", "Failed to load models: ${e.message}")
        }
    }

    fun release() {
        holisticLandmarker?.close(); holisticLandmarker = null
        eslClassifier?.close();      eslClassifier      = null
        emotionClassifier?.close();  emotionClassifier  = null
        isReady   = false
        isLoading = false
    }
}
