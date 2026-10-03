package org.phasmaframe.core.transport

import com.google.common.truth.Truth.assertThat
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.yield
import org.junit.Test
import org.phasmaframe.core.model.BloodPressureReading
import org.phasmaframe.core.model.EntrySource
import org.phasmaframe.core.model.Patient
import org.phasmaframe.core.model.TransferBundle
import org.phasmaframe.core.transfer.TransferBundleCodec

class FakeLoopbackTransportTest {

    private fun bundle() = TransferBundle(
        id = "b1",
        schemaVersion = TransferBundleCodec.SCHEMA_VERSION,
        patient = Patient("p1", "Juan D."),
        readings = listOf(
            BloodPressureReading(
                "r1", "p1", 130, 85, 1_000, "Nurse", 1_100, "Caregiver", null,
                EntrySource.PATIENT_OR_CAREGIVER,
            ),
        ),
        visitNotes = emptyList(),
        createdAtEpochMillis = 2_000,
    )

    @Test
    fun discover_connect_verify_transfer_roundTrips() = runTest {
        val link = FakeLoopbackTransport.Link()
        val sender = link.sender
        val receiver = link.receiver

        link.advertiseSender("Patient phone")

        val discovered = receiver.discoverEndpoints().first()
        assertThat(discovered).hasSize(1)
        assertThat(discovered.first().displayName).isEqualTo("Patient phone")

        receiver.connect(discovered.first())
        sender.connect(link.senderEndpoint())

        // Both sides derive the same verification token.
        assertThat(sender.verificationToken()).isEqualTo(receiver.verificationToken())

        // Subscribe before sending to avoid a race (SharedFlow has no replay).
        val received = CompletableDeferred<ByteArray>()
        val job = launch { received.complete(receiver.incomingPayloads().first()) }
        yield() // let the collector subscribe

        sender.send(TransferBundleCodec.encode(bundle()))

        val decoded = TransferBundleCodec.decode(received.await())
        job.cancel()
        assertThat(decoded.patient.id).isEqualTo("p1")
        assertThat(decoded.readings).hasSize(1)
        assertThat(decoded.readings.first().measuredBy).isEqualTo("Nurse")
    }

    @Test
    fun verificationToken_isStableAndOrderIndependent() = runTest {
        val link = FakeLoopbackTransport.Link()
        assertThat(link.sender.verificationToken()).isEqualTo(link.receiver.verificationToken())
    }
}
