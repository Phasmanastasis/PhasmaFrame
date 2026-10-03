package org.phasmaframe.core.transport

import kotlinx.coroutines.flow.Flow

/** A nearby device discovered by a [TransportAdapter], shown to the user for verification. */
data class RemoteEndpoint(
    val id: String,
    val displayName: String,
)

/** High-level transport state surfaced to the UI (the detailed flow lives in #25). */
enum class TransportState { IDLE, ADVERTISING, DISCOVERING, CONNECTED, ERROR }

/**
 * Abstraction over an offline device-to-device transport (#20). Intentionally **decoupled
 * from the Protobuf payload**: it moves opaque `ByteArray` payloads, so the bundle codec
 * (#18) and this transport evolve independently. The real implementation is Google Nearby
 * Connections (`:app`); a fake loopback impl in tests exercises the contract without
 * hardware.
 *
 * Lifecycle mirrors the SDD transport flow: discover → connect → verify → transmit/receive.
 */
interface TransportAdapter {

    val state: Flow<TransportState>

    /** Sender side: advertise this device so a receiver can discover it. */
    suspend fun startAdvertising(localName: String)

    /** Receiver side: discover advertising devices. Emits the current endpoint list. */
    fun discoverEndpoints(): Flow<List<RemoteEndpoint>>

    /** Connect to a chosen endpoint. Returns once the connection is established. */
    suspend fun connect(endpoint: RemoteEndpoint)

    /**
     * A short human-verifiable token both sides can display so users confirm they are
     * connected to the right peer before any transfer (SDD "verify the displayed
     * patient/device").
     */
    suspend fun verificationToken(): String

    /** Send an opaque payload (e.g. an encoded TransferBundle) to the connected peer. */
    suspend fun send(payload: ByteArray)

    /** Incoming payloads from the connected peer. */
    fun incomingPayloads(): Flow<ByteArray>

    /** Tear down advertising/discovery/connection and return to IDLE. */
    suspend fun stop()
}
