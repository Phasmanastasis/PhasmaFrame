package org.phasmaframe.core.transport

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * In-memory [TransportAdapter] used for JVM tests and local demos. Two instances created
 * from the same [Link] behave like two paired devices: a payload sent by one is received
 * by the other. No Android, no hardware — proves the adapter contract and lets the #25
 * transfer state machine be tested end to end without Nearby Connections.
 */
class FakeLoopbackTransport private constructor(
    private val self: Endpoint,
    private val peer: Endpoint,
) : TransportAdapter {

    private val _state = MutableStateFlow(TransportState.IDLE)
    override val state: Flow<TransportState> = _state.asStateFlow()

    override suspend fun startAdvertising(localName: String) {
        self.name = localName
        self.advertising = true
        _state.value = TransportState.ADVERTISING
    }

    override fun discoverEndpoints(): Flow<List<RemoteEndpoint>> {
        _state.value = TransportState.DISCOVERING
        return peer.discoveredAs
    }

    override suspend fun connect(endpoint: RemoteEndpoint) {
        _state.value = TransportState.CONNECTED
    }

    override suspend fun verificationToken(): String =
        // Deterministic, order-independent token both sides compute identically.
        listOf(self.id, peer.id).sorted().joinToString("-").hashCode().toString(16)

    override suspend fun send(payload: ByteArray) {
        peer.inbox.emit(payload)
    }

    override fun incomingPayloads(): Flow<ByteArray> = self.inbox

    override suspend fun stop() {
        self.advertising = false
        _state.value = TransportState.IDLE
    }

    /** Shared mutable state for one virtual device. */
    class Endpoint(val id: String) {
        var name: String = id
        var advertising: Boolean = false
        val inbox = MutableSharedFlow<ByteArray>(replay = 0, extraBufferCapacity = 16)
        val discoveredAs = MutableStateFlow<List<RemoteEndpoint>>(emptyList())
    }

    /** A pair of paired adapters standing in for two nearby devices. */
    class Link {
        private val a = Endpoint("device-A")
        private val b = Endpoint("device-B")

        val sender: TransportAdapter = FakeLoopbackTransport(a, b)
        val receiver: TransportAdapter = FakeLoopbackTransport(b, a)

        /** Make the sender discoverable to the receiver under [name]. */
        fun advertiseSender(name: String) {
            a.discoveredAs.value = listOf(RemoteEndpoint(a.id, name))
        }

        fun senderEndpoint(name: String = "Sender") = RemoteEndpoint(a.id, name)
    }
}
