package org.phasmaframe.core.transferflow

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.phasmaframe.core.model.TransferBundle
import org.phasmaframe.core.transfer.TransferBundleCodec
import org.phasmaframe.core.transport.TransportAdapter

/**
 * Sender-side transfer flow (#25): select one patient's [TransferBundle], advertise,
 * transmit the encoded payload, and report completion/retry. Pure Kotlin; JVM-testable.
 */
class SendTransferController(
    private val transport: TransportAdapter,
) {
    private val _state = MutableStateFlow<TransferState>(TransferState.Idle)
    val state: StateFlow<TransferState> = _state.asStateFlow()

    /** Advertise this device so a nearby receiver can discover it. */
    suspend fun startSending(localName: String) {
        try {
            transport.startAdvertising(localName)
            _state.value = TransferState.Advertising
        } catch (e: Exception) {
            _state.value = TransferState.Failure(e.message ?: "Could not start sending. Try again.")
        }
    }

    /** Transmit the selected one-patient bundle to the connected receiver. */
    suspend fun send(bundle: TransferBundle) {
        _state.value = TransferState.Sending
        try {
            transport.send(TransferBundleCodec.encode(bundle))
            _state.value = TransferState.Sent
        } catch (e: Exception) {
            _state.value = TransferState.Failure(e.message ?: "Send failed. Try again.")
        }
    }

    suspend fun cancel() {
        transport.stop()
        _state.value = TransferState.Idle
    }
}
