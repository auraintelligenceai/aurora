package aura.android.ui

import androidx.compose.runtime.Composable
import aura.android.MainViewModel
import aura.android.ui.chat.ChatSheetContent

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
