package org.phasmaframe.app.transport

import android.content.Context
import com.google.android.gms.nearby.Nearby
import com.google.android.gms.nearby.connection.AdvertisingOptions
import com.google.android.gms.nearby.connection.ConnectionInfo
import com.google.android.gms.nearby.connection.ConnectionLifecycleCallback
import com.google.android.gms.nearby.connection.ConnectionResolution
import com.google.android.gms.nearby.connection.ConnectionsClient
import com.google.android.gms.nearby.connection.DiscoveryOptions
import com.google.android.gms.nearby.connection.EndpointDiscoveryCallback
import com.google.android.gms.nearby.connection.DiscoveredEndpointInfo
import com.google.android.gms.nearby.connection.Payload
import com.google.android.gms.nearby.connection.PayloadCallback
import com.google.android.gms.nearby.connection.PayloadTransferUpdate
import com.google.android.gms.nearby.connection.Strategy
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.suspendCancellableCoroutine
import org.phasmaframe.core.transport.RemoteEndpoint
import org.phasmaframe.core.transport.TransportAdapter
import org.phasmaframe.core.transport.TransportState
import kotlin.coroutines.resume

/**
 * Google Nearby Connections implementation of [TransportAdapter] (#20). Lives in `:app`
 * because it needs Google Play services and Android. It moves opaque payload bytes; the
 * bundle codec stays in `:core`.
 *
 * Uses the P2P_POINT_TO_POINT strategy (a single sender↔receiver pair, matching
 * "one patient bundle at a time"). Offline: Nearby uses Bluetooth/BLE/Wi-Fi direct and
 * does not require internet.
 *
 * NOT exercisable without two physical devices with Google Play services; see
 * docs/dev/nearby-transport-spike.md for the compatibility findings and the manual
 * two-device test procedure.
 */
class NearbyTransport(
    context: Context,
    private val serviceId: String = "org.phasmaframe.transfer",
) : TransportAdapter {

    private val client: ConnectionsClient = Nearby.getConnectionsClient(context.applicationContext)
    private val strategy = Strategy.P2P_POINT_TO_POINT

    private val _state = MutableStateFlow(TransportState.IDLE)
    override val state: Flow<TransportState> = _state.asStateFlow()

    private val _incoming = MutableSharedFlow<ByteArray>(replay = 0, extraBufferCapacity = 16)

    private var connectedEndpointId: String? = null
    private var pendingAuthDigits: String? = null

    private val payloadCallback = object : PayloadCallback() {
        override fun onPayloadReceived(endpointId: String, payload: Payload) {
            payload.asBytes()?.let { _incoming.tryEmit(it) }
        }

        override fun onPayloadTransferUpdate(endpointId: String, update: PayloadTransferUpdate) = Unit
    }

    private val connectionLifecycle = object : ConnectionLifecycleCallback() {
        override fun onConnectionInitiated(endpointId: String, info: ConnectionInfo) {
            // Capture the authentication digits for user verification, then accept.
            pendingAuthDigits = info.authenticationDigits
            client.acceptConnection(endpointId, payloadCallback)
        }

        override fun onConnectionResult(endpointId: String, result: ConnectionResolution) {
            if (result.status.isSuccess) {
                connectedEndpointId = endpointId
                _state.value = TransportState.CONNECTED
            } else {
                _state.value = TransportState.ERROR
            }
        }

        override fun onDisconnected(endpointId: String) {
            if (connectedEndpointId == endpointId) connectedEndpointId = null
            _state.value = TransportState.IDLE
        }
    }

    override suspend fun startAdvertising(localName: String) {
        _state.value = TransportState.ADVERTISING
        client.startAdvertising(
            localName, serviceId, connectionLifecycle,
            AdvertisingOptions.Builder().setStrategy(strategy).build(),
        )
    }

    override fun discoverEndpoints(): Flow<List<RemoteEndpoint>> = callbackFlow {
        _state.value = TransportState.DISCOVERING
        val found = linkedMapOf<String, RemoteEndpoint>()
        val cb = object : EndpointDiscoveryCallback() {
            override fun onEndpointFound(endpointId: String, info: DiscoveredEndpointInfo) {
                found[endpointId] = RemoteEndpoint(endpointId, info.endpointName)
                trySend(found.values.toList())
            }

            override fun onEndpointLost(endpointId: String) {
                found.remove(endpointId)
                trySend(found.values.toList())
            }
        }
        client.startDiscovery(
            serviceId, cb,
            DiscoveryOptions.Builder().setStrategy(strategy).build(),
        )
        awaitClose { client.stopDiscovery() }
    }

    override suspend fun connect(endpoint: RemoteEndpoint) =
        suspendCancellableCoroutine { cont ->
            client.requestConnection("PhasmaFrame", endpoint.id, connectionLifecycle)
                .addOnSuccessListener { cont.resume(Unit) }
                .addOnFailureListener { _state.value = TransportState.ERROR; cont.resume(Unit) }
        }

    override suspend fun verificationToken(): String =
        pendingAuthDigits ?: "----"

    override suspend fun send(payload: ByteArray) {
        val id = connectedEndpointId ?: error("Not connected")
        client.sendPayload(id, Payload.fromBytes(payload))
    }

    override fun incomingPayloads(): Flow<ByteArray> = _incoming

    override suspend fun stop() {
        client.stopAdvertising()
        client.stopDiscovery()
        client.stopAllEndpoints()
        connectedEndpointId = null
        _state.value = TransportState.IDLE
    }
}
