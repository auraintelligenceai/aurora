package aura.android.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class aura_intelligenceProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", aura_intelligenceCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", aura_intelligenceCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", aura_intelligenceCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", aura_intelligenceCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", aura_intelligenceCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", aura_intelligenceCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", aura_intelligenceCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", aura_intelligenceCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", aura_intelligenceCapability.Canvas.rawValue)
    assertEquals("camera", aura_intelligenceCapability.Camera.rawValue)
    assertEquals("screen", aura_intelligenceCapability.Screen.rawValue)
    assertEquals("voiceWake", aura_intelligenceCapability.VoiceWake.rawValue)
  }

  @Test
  fun screenCommandsUseStableStrings() {
    assertEquals("screen.record", aura_intelligenceScreenCommand.Record.rawValue)
  }
}
