package org.phasmaframe.core.usecase

import com.google.common.truth.Truth.assertThat
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertThrows
import org.junit.Test
import org.phasmaframe.core.model.BloodPressureReading
import org.phasmaframe.core.model.EntrySource
import org.phasmaframe.core.model.VisitNote
import org.phasmaframe.core.transfer.TransferBundleCodec

class PatientRepositoryTest {

    private fun reading(id: String, patientId: String = "p1") = BloodPressureReading(
        id = id, patientId = patientId, systolic = 120, diastolic = 80,
        measuredAtEpochMillis = 10, measuredBy = "A", enteredAtEpochMillis = 20,
        enteredBy = "B", note = null, source = EntrySource.PATIENT_OR_CAREGIVER,
    )

    @Test
    fun recordReading_appendsAndCreatesPatient() = runTest {
        val store = FakeLocalStore()
        val repo = PatientRepository(store)

        val wrote = repo.recordReading(reading("r1"))

        assertThat(wrote).isTrue()
        assertThat(store.patientCount()).isEqualTo(1)
        assertThat(store.readingCount()).isEqualTo(1)
    }

    @Test
    fun recordReading_isRepeatSafe() = runTest {
        val store = FakeLocalStore()
        val repo = PatientRepository(store)
        repo.recordReading(reading("r1"))

        val secondWrote = repo.recordReading(reading("r1"))

        assertThat(secondWrote).isFalse()
        assertThat(store.readingCount()).isEqualTo(1)
    }

    @Test
    fun addVisitNote_appends() = runTest {
        val store = FakeLocalStore()
        val repo = PatientRepository(store)
        store.insertPatientIfAbsent(org.phasmaframe.core.model.Patient("p1", "Juan"))

        repo.addVisitNote(
            VisitNote("n1", "p1", "BHW", 5, "hello", EntrySource.BHW),
        )

        assertThat(store.noteCount()).isEqualTo(1)
    }

    @Test
    fun buildBundle_collectsHistory_withCurrentSchemaVersion() = runTest {
        val store = FakeLocalStore()
        val repo = PatientRepository(store)
        repo.recordReading(reading("r1"))
        repo.recordReading(reading("r2"))

        val bundle = repo.buildBundle("p1", bundleId = "b1", createdAtEpochMillis = 999)

        assertThat(bundle.schemaVersion).isEqualTo(TransferBundleCodec.SCHEMA_VERSION)
        assertThat(bundle.patient.id).isEqualTo("p1")
        assertThat(bundle.readings).hasSize(2)
        assertThat(bundle.entryCount).isEqualTo(2)
    }

    @Test
    fun buildBundle_unknownPatient_throws() = runTest {
        val repo = PatientRepository(FakeLocalStore())
        assertThrows(IllegalArgumentException::class.java) {
            kotlinx.coroutines.runBlocking { repo.buildBundle("ghost", "b1", 1) }
        }
    }
}
