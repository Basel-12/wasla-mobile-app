package expo.modules.mediapipe

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MediapipeModule : Module() {

  override fun definition() = ModuleDefinition {
    Name("Mediapipe")

    Function("preloadModels") {
        val context = appContext.reactContext ?: return@Function null
        ModelManager.preload(context)
        null
    }

    View(MediapipeCameraView::class) {
      Events("onLandmarks", "onError", "onReady", "onSignDetected", "onEmotionDetected")

      Prop("facing") { view: MediapipeCameraView, facing: String ->
        view.setFacing(facing)
      }
    }
  }
}
