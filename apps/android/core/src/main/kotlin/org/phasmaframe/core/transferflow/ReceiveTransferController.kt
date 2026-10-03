package org.phasmaframe.core.transferflow

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import org.phasmaframe.core.model.TransferBundle
import org.phasmaframe.core.transfer.BundleCodecException
import org.phasmaframe.core.transfer.MalformedBundleException
import org.phasmaframe.core.transfer.UnsupportedSchemaVersionException
import org.phasmaframe.core.transport.RemoteEndpoint
import org.phasmaframe.core.transport.TransportAdapter
import org.phasmaframe.core.usecase.ImportBundleUseCase

/**
 * Receiver-side transfer flow (#25). Drives [TransferState] through
 * discover → connect → verify → receive → preview → (confirm) → import → receipt, reusing
 * the [TransportAdapter] (#20), the bundle codec (#18), and [ImportBundleUseCase] (#21).
 *
 * Failure handling (SDD): any transport/decode/import error moves to
 * [TransferState.Failure] with a clear reason and **no change to local data** — the import
 * use-case only writes inside an atomic transaction, and this controller never writes
 * except via [ImportBundleUseCase.commit].
 *
 * Pure Kotlin; JVM-testable with `FakeLoopbackTransport` + a fake `LocalStore`.
 */
class ReceiveTransferController(
    private val transport: TransportAdapter,
    private val importUseCase: ImportBundleUseCase,
) {
    private val _state = MutableStateFlow<TransferState>(TransferState.Idle)
    val state: StateFlow<TransferState> = _state.asStateFlow()

    private var decodedBundle: TransferBundle? = null

    /** Discover senders, connect to [choose]'s pick, verify, receive bytes, decode, preview. */
    suspend fun discoverAndPreview(choose: (List<RemoteEndpoint>) -> RemoteEndpoint?) {
        try {
            val endpoints = transport.discoverEndpoints().first { it.isNotEmpty() }
            _state.value = TransferState.Discovering(endpoints.map { it.displayName })

            val target = choose(endpoints)
                ?: run { _state.value = TransferState.Failure("No device selected."); return }

            transport.connect(target)
            _state.value = TransferState.Verifying(transport.verificationToken())

            val payload = transport.incomingPayloads().first()
            val bundle = importUseCase.decode(payload) // throws on unknown version/malformed
            decodedBundle = bundle
            _state.value = TransferState.Preview(importUseCase.preview(bundle))
        } catch (e: UnsupportedSchemaVersionException) {
            _state.value = TransferState.Failure(
                "This record uses an unsupported version (${e.foundVersion}). Ask the sender to update the app.",
                canRetry = false,
            )
        } catch (e: MalformedBundleException) {
            _state.value = TransferState.Failure("The received record was corrupted. Try again.")
        } catch (e: BundleCodecException) {
            _state.value = TransferState.Failure(e.message ?: "Could not read the record.")
        } catch (e: Exception) {
            _state.value = TransferState.Failure(e.message ?: "Transfer failed. Try again.")
        }
    }

    /** After the user confirms the preview, commit atomically and show the receipt. */
    suspend fun confirmImport() {
        val bundle = decodedBundle ?: run {
            _state.value = TransferState.Failure("Nothing to import.")
            return
        }
        _state.value = TransferState.Importing
        try {
            val result = importUseCase.commit(bundle) // atomic; rolls back on failure
            _state.value = TransferState.Receipt(result)
        } catch (e: Exception) {
            // commit is atomic: data is unchanged on failure.
            _state.value = TransferState.Failure(e.message ?: "Import failed; nothing was changed.")
        }
    }

    /** Cancel/reset to idle (also stops the transport). */
    suspend fun cancel() {
        decodedBundle = null
        transport.stop()
        _state.value = TransferState.Idle
    }
}
