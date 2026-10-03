package org.phasmaframe.core.usecase

import com.google.common.truth.Truth.assertThat
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertThrows
import org.junit.Test
import org.phasmaframe.core.model.BloodPressureReading
import org.phasmaframe.core.model.EntrySource
import org.phasmaframe.core.model.Patient
import org.phasmaframe.core.model.TransferBundle
import org.phasmaframe.core.model.VisitNote
import org.phasmaframe.core.transfer.TransferBundleCodec
import org.phasmaframe.core.transfer.UnsupportedSchemaVersionException

class ImportBundleUseCaseTest {

    private fun reading(id: String) = BloodPressureReading(
        id = id, patientId = "p1", systolic = 130, diastolic = 85,
        measuredAtEpochMillis = 1_000, measuredBy = "Nurse", enteredAtEpochMillis = 1_100,
        enteredBy = "Caregiver", note = null, source = EntrySource.PATIENT_OR_CAREGIVER,
    )

    private fun note(id: String) = VisitNote(
        id = id, patientId = "p1", author = "BHW", createdAtEpochMillis = 2_000,
        text = "note $id", source = EntrySource.BHW,
    )

    private fun bundle(
        readings: List<BloodPressureReading> = listOf(reading("r1"), reading("r2")),
        notes: List<VisitNote> = listOf(note("n1")),
    ) = TransferBundle(
        id = "b1",
        schemaVersion = TransferBundleCodec.SCHEMA_VERSION,
        patient = Patient("p1", "Juan D."),
        readings = readings,
        visitNotes = notes,
        createdAtEpochMillis = 3_000,
    )

    @Test
    fun freshImport_importsAll_countsCorrect() = runTest {
        val store = FakeLocalStore()
        val result = ImportBundleUseCase(store).commit(bundle())

        assertThat(result.importedReadingCount).isEqualTo(2)
        assertThat(result.importedVisitNoteCount).isEqualTo(1)
        assertThat(result.skippedCount).isEqualTo(0)
        assertThat(result.patientCreated).isTrue()
        assertThat(store.readingCount()).isEqualTo(2)
        assertThat(store.noteCount()).isEqualTo(1)
    }

    @Test
    fun duplicateReimport_skipsAll_noDuplicates() = runTest {
        val store = FakeLocalStore()
        val useCase = ImportBundleUseCase(store)
        useCase.commit(bundle())

        val second = useCase.commit(bundle())

        assertThat(second.importedCount).isEqualTo(0)
        assertThat(second.skippedReadingCount).isEqualTo(2)
        assertThat(second.skippedVisitNoteCount).isEqualTo(1)
        assertThat(second.patientCreated).isFalse()
        // Store unchanged — no duplicates.
        assertThat(store.readingCount()).isEqualTo(2)
        assertThat(store.noteCount()).isEqualTo(1)
    }

    @Test
    fun partialReimport_importsOnlyNew() = runTest {
        val store = FakeLocalStore()
        val useCase = ImportBundleUseCase(store)
        useCase.commit(bundle(readings = listOf(reading("r1")), notes = emptyList()))

        // Now a bundle that re-sends r1 and adds r2.
        val result = useCase.commit(
            bundle(readings = listOf(reading("r1"), reading("r2")), notes = listOf(note("n1"))),
        )

        assertThat(result.importedReadingCount).isEqualTo(1) // only r2
        assertThat(result.skippedReadingCount).isEqualTo(1)  // r1 skipped
        assertThat(result.importedVisitNoteCount).isEqualTo(1)
        assertThat(store.readingCount()).isEqualTo(2)
    }

    @Test
    fun interruptedImport_rollsBack_noPartialState() = runTest {
        // Store throws when it reaches r2, mid-commit.
        val store = FakeLocalStore(failOnReadingId = "r2")
        val useCase = ImportBundleUseCase(store)

        assertThrows(IllegalStateException::class.java) {
            // runTest's scope: use runBlocking-style by rethrow
            kotlinx.coroutines.runBlocking { useCase.commit(bundle()) }
        }

        // Nothing committed: patient + r1 that were written before the failure are rolled back.
        assertThat(store.patientCount()).isEqualTo(0)
        assertThat(store.readingCount()).isEqualTo(0)
        assertThat(store.noteCount()).isEqualTo(0)
    }

    @Test
    fun unknownSchemaVersion_isRejected_beforeAnyWrite() = runTest {
        val store = FakeLocalStore()
        val useCase = ImportBundleUseCase(store)

        // Encode a bundle then tamper: build raw bytes with a bad version via the proto.
        val badBytes = org.phasmaframe.core.proto.TransferBundleProto.newBuilder()
            .setId("b1")
            .setSchemaVersion(TransferBundleCodec.SCHEMA_VERSION + 99)
            .build()
            .toByteArray()

        assertThrows(UnsupportedSchemaVersionException::class.java) {
            useCase.decode(badBytes)
        }
        assertThat(store.readingCount()).isEqualTo(0)
    }

    @Test
    fun preview_reportsPatientAndCounts_withoutWriting() = runTest {
        val store = FakeLocalStore()
        val preview = ImportBundleUseCase(store).preview(bundle())

        assertThat(preview.patientId).isEqualTo("p1")
        assertThat(preview.patientLabel).isEqualTo("Juan D.")
        assertThat(preview.readingCount).isEqualTo(2)
        assertThat(preview.visitNoteCount).isEqualTo(1)
        assertThat(preview.totalEntryCount).isEqualTo(3)
        assertThat(store.readingCount()).isEqualTo(0) // no write
    }

    @Test
    fun endToEnd_encodeThenImportFromBytes() = runTest {
        val store = FakeLocalStore()
        val bytes = TransferBundleCodec.encode(bundle())
        val result = ImportBundleUseCase(store).importFromBytes(bytes)

        assertThat(result.importedCount).isEqualTo(3)
        assertThat(store.readingCount()).isEqualTo(2)
        assertThat(store.noteCount()).isEqualTo(1)
    }
}
