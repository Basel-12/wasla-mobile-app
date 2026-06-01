package expo.modules.mediapipe

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MediapipeModule : Module() {

  override fun definition() = ModuleDefinition {
    Name("Mediapipe")

    View(MediapipeCameraView::class) {
      Events("onLandmarks", "onError", "onReady", "onSignDetected")

      Prop("facing") { view: MediapipeCameraView, facing: String ->
        view.setFacing(facing)
      }
    }
  }
}
