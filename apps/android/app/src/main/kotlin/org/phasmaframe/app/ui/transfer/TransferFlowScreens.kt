package org.phasmaframe.app.ui.transfer

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.phasmaframe.core.transferflow.TransferState

/**
 * Send/Receive transfer flow UI (#25), driven by the `:core` transfer state machine
 * (`SendTransferController` / `ReceiveTransferController`). The composables are thin: they
 * render the current [TransferState] and surface confirm/retry/cancel actions. All flow
 * logic + failure handling is tested in `:core`.
 */

@Composable
fun ReceiveTransferScreen(
    state: TransferState,
    onConfirmImport: () -> Unit,
    onRetry: () -> Unit,
    onCancel: () -> Unit,
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text("Receive a record")
        when (state) {
            is TransferState.Idle -> Text("Searching for a nearby device…")
            is TransferState.Discovering ->
                Text("Found: ${state.endpoints.joinToString().ifEmpty { "searching…" }}")
            is TransferState.Verifying ->
                Text("Confirm this code matches the sender: ${state.token}")
            is TransferState.Preview -> {
                Text("Patient: ${state.preview.patientLabel}")
                Text("Entries to import: ${state.preview.totalEntryCount} " +
                    "(${state.preview.readingCount} readings, ${state.preview.visitNoteCount} notes)")
                Button(onClick = onConfirmImport, modifier = Modifier.fillMaxWidth()) {
                    Text("Confirm import")
                }
            }
            is TransferState.Importing -> Text("Importing…")
            is TransferState.Receipt -> {
                Text("Import complete.")
                Text("Imported: ${state.result.importedCount}")
                Text("Skipped (already had): ${state.result.skippedCount}")
            }
            is TransferState.Failure -> {
                Text("Transfer failed: ${state.reason}")
                if (state.canRetry) {
                    Button(onClick = onRetry, modifier = Modifier.fillMaxWidth()) { Text("Retry") }
                }
            }
            else -> Text("…")
        }
        OutlinedButton(onClick = onCancel, modifier = Modifier.fillMaxWidth()) { Text("Cancel") }
    }
}

@Composable
fun SendTransferScreen(
    state: TransferState,
    patientLabel: String,
    onStartSend: () -> Unit,
    onRetry: () -> Unit,
    onCancel: () -> Unit,
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text("Send record — $patientLabel")
        when (state) {
            is TransferState.Idle ->
                Button(onClick = onStartSend, modifier = Modifier.fillMaxWidth()) { Text("Send") }
            is TransferState.Advertising -> Text("Waiting for the BHW device to connect…")
            is TransferState.Verifying -> Text("Confirm code with receiver: ${state.token}")
            is TransferState.Sending -> Text("Sending…")
            is TransferState.Sent -> Text("Sent. The BHW will confirm the import.")
            is TransferState.Failure -> {
                Text("Send failed: ${state.reason}")
                if (state.canRetry) {
                    Button(onClick = onRetry, modifier = Modifier.fillMaxWidth()) { Text("Retry") }
                }
            }
            else -> Text("…")
        }
        OutlinedButton(onClick = onCancel, modifier = Modifier.fillMaxWidth()) { Text("Cancel") }
    }
}
