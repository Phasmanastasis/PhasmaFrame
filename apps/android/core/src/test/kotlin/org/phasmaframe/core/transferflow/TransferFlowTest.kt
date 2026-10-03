package org.phasmaframe.core.transferflow

import com.google.common.truth.Truth.assertThat
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.yield
import org.junit.Test
import org.phasmaframe.core.model.BloodPressureReading
import org.phasmaframe.core.model.EntrySource
import org.phasmaframe.core.model.Patient
import org.phasmaframe.core.model.TransferBundle
import org.phasmaframe.core.transfer.TransferBundleCodec
import org.phasmaframe.core.transport.FakeLoopbackTransport
import org.phasmaframe.core.usecase.FakeLocalStore
import org.phasmaframe.core.usecase.ImportBundleUseCase

class TransferFlowTest {

    private fun bundle(version: Int = TransferBundleCodec.SCHEMA_VERSION) = TransferBundle(
        id = "b1",
        schemaVersion = version,
        patient = Patient("p1", "Juan D."),
        readings = listOf(
            BloodPressureReading(
                "r1", "p1", 150, 95, 1_000, "Nurse", 1_100, "Caregiver", null,
                EntrySource.PATIENT_OR_CAREGIVER,
            ),
        ),
        visitNotes = emptyList(),
        createdAtEpochMillis = 2_000,
    )

    @Test
    fun happyPath_discoverVerifyPreviewConfirmReceipt() = runTest {
        val link = FakeLoopbackTransport.Link()
        link.advertiseSender("Patient phone")
        val store = FakeLocalStore()
        val receiver = ReceiveTransferController(link.receiver, ImportBundleUseCase(store))
        val sender = SendTransferController(link.sender)

        // Receiver starts discovering/previewing in the background.
        val job = launch {
            receiver.discoverAndPreview { endpoints -> endpoints.first() }
        }
        yield()
        // Sender transmits.
        sender.send(bundle())
        job.join()

        // Preview reached.
        val preview = receiver.state.value
        assertThat(preview).isInstanceOf(TransferState.Preview::class.java)
        assertThat((preview as TransferState.Preview).preview.totalEntryCount).isEqualTo(1)

        // Confirm import -> receipt with counts.
        receiver.confirmImport()
        val receipt = receiver.state.value
        assertThat(receipt).isInstanceOf(TransferState.Receipt::class.java)
        assertThat((receipt as TransferState.Receipt).result.importedCount).isEqualTo(1)
        assertThat(store.readingCount()).isEqualTo(1)
    }

    @Test
    fun duplicateReimport_isSkipped_noDuplicates() = runTest {
        val store = FakeLocalStore()
        ImportBundleUseCase(store).commit(bundle()) // already imported once

        val link = FakeLoopbackTransport.Link()
        link.advertiseSender("Patient phone")
        val receiver = ReceiveTransferController(link.receiver, ImportBundleUseCase(store))
        val sender = SendTransferController(link.sender)

        val job = launch { receiver.discoverAndPreview { it.first() } }
        yield()
        sender.send(bundle())
        job.join()
        receiver.confirmImport()

        val receipt = receiver.state.value as TransferState.Receipt
        assertThat(receipt.result.importedCount).isEqualTo(0)
        assertThat(receipt.result.skippedCount).isEqualTo(1)
        assertThat(store.readingCount()).isEqualTo(1) // no duplicate
    }

    @Test
    fun unknownSchemaVersion_failsClearly_noWrite() = runTest {
        val link = FakeLoopbackTransport.Link()
        link.advertiseSender("Patient phone")
        val store = FakeLocalStore()
        val receiver = ReceiveTransferController(link.receiver, ImportBundleUseCase(store))

        val job = launch { receiver.discoverAndPreview { it.first() } }
        yield()
        // Send bytes with an unsupported version.
        link.sender.send(
            org.phasmaframe.core.proto.TransferBundleProto.newBuilder()
                .setId("b1").setSchemaVersion(TransferBundleCodec.SCHEMA_VERSION + 5)
                .build().toByteArray(),
        )
        job.join()

        val st = receiver.state.value
        assertThat(st).isInstanceOf(TransferState.Failure::class.java)
        assertThat((st as TransferState.Failure).canRetry).isFalse()
        assertThat(store.readingCount()).isEqualTo(0)
    }

    @Test
    fun interruptedImport_leavesDataUnchanged() = runTest {
        // Store that throws mid-commit on reading r1.
        val store = FakeLocalStore(failOnReadingId = "r1")
        val link = FakeLoopbackTransport.Link()
        link.advertiseSender("Patient phone")
        val receiver = ReceiveTransferController(link.receiver, ImportBundleUseCase(store))
        val sender = SendTransferController(link.sender)

        val job = launch { receiver.discoverAndPreview { it.first() } }
        yield()
        sender.send(bundle())
        job.join()

        receiver.confirmImport()
        val st = receiver.state.value
        assertThat(st).isInstanceOf(TransferState.Failure::class.java)
        assertThat(store.readingCount()).isEqualTo(0) // rolled back, unchanged
        assertThat(store.patientCount()).isEqualTo(0)
    }

    @Test
    fun senderReportsSent() = runTest {
        val link = FakeLoopbackTransport.Link()
        val sender = SendTransferController(link.sender)
        sender.startSending("Patient phone")
        assertThat(sender.state.value).isEqualTo(TransferState.Advertising)
        sender.send(bundle())
        assertThat(sender.state.value).isEqualTo(TransferState.Sent)
    }
}
