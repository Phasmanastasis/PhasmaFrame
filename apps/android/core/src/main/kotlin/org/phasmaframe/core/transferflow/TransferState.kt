package org.phasmaframe.core.transferflow

import org.phasmaframe.core.usecase.ImportPreview
import org.phasmaframe.core.usecase.ImportResult

/**
 * States of the user-initiated transfer flow (#25), shared vocabulary for the sender and
 * receiver UIs. Kept in `:core` so the flow is a testable state machine independent of
 * Compose/Nearby.
 *
 * On any failure the device data is left unchanged and the UI offers retry/cancel.
 */
sealed interface TransferState {

    /** Nothing happening yet. */
    data object Idle : TransferState

    // --- sender ---
    /** Sender is advertising and waiting for a receiver to connect. */
    data object Advertising : TransferState
    /** Sender has transmitted the bundle and is waiting for the receiver to finish. */
    data object Sending : TransferState
    /** Sender's part is done. */
    data object Sent : TransferState

    // --- receiver ---
    /** Receiver is discovering nearby senders. */
    data class Discovering(val endpoints: List<String>) : TransferState
    /** Connected; both sides show [token] to verify they are the right pair. */
    data class Verifying(val token: String) : TransferState
    /** Decoded + previewed; waiting for the BHW to confirm import. */
    data class Preview(val preview: ImportPreview) : TransferState
    /** Import committing. */
    data object Importing : TransferState
    /** Import finished; receipt shows imported/skipped counts. */
    data class Receipt(val result: ImportResult) : TransferState

    // --- shared ---
    /** Something failed; data unchanged. [canRetry] tells the UI whether to offer retry. */
    data class Failure(val reason: String, val canRetry: Boolean = true) : TransferState
}
