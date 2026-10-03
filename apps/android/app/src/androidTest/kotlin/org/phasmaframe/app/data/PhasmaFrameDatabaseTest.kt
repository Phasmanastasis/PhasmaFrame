package org.phasmaframe.app.data

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.google.common.truth.Truth.assertThat
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.phasmaframe.app.data.entity.BloodPressureReadingEntity
import org.phasmaframe.app.data.entity.PatientEntity

/**
 * Instrumented test for the Room layer (#19). Requires the Android SDK + an emulator or
 * device; it is NOT runnable on a plain JVM. Run with:
 *   just android-connected-test
 *
 * Covers: a reading is saved and re-read (survives a database reopen = app restart);
 * append-only inserts never overwrite an existing id; measurer vs recorder persist
 * distinctly.
 */
@RunWith(AndroidJUnit4::class)
class PhasmaFrameDatabaseTest {

    private lateinit var db: PhasmaFrameDatabase

    private fun newDb(): PhasmaFrameDatabase =
        Room.databaseBuilder(
            ApplicationProvider.getApplicationContext(),
            PhasmaFrameDatabase::class.java,
            "restart-test.db",
        ).build()

    @Before
    fun setUp() {
        ApplicationProvider.getApplicationContext<android.content.Context>()
            .deleteDatabase("restart-test.db")
        db = newDb()
    }

    @After
    fun tearDown() {
        db.close()
        ApplicationProvider.getApplicationContext<android.content.Context>()
            .deleteDatabase("restart-test.db")
    }

    @Test
    fun readingSurvivesDatabaseReopen() = runBlocking {
        db.patientDao().insertIgnore(PatientEntity("p1", "Juan D."))
        db.bloodPressureReadingDao().insertIgnore(
            BloodPressureReadingEntity(
                id = "r1",
                patientId = "p1",
                systolic = 140,
                diastolic = 90,
                measuredAtEpochMillis = 1_000L,
                measuredBy = "Nurse A",
                enteredAtEpochMillis = 2_000L,
                enteredBy = "Caregiver B",
                note = "after walk",
                source = "PATIENT_OR_CAREGIVER",
            ),
        )
        db.close()

        // Reopen = simulates app restart.
        db = newDb()
        val reloaded = db.bloodPressureReadingDao().listForPatient("p1")
        assertThat(reloaded).hasSize(1)
        assertThat(reloaded.first().systolic).isEqualTo(140)
        assertThat(reloaded.first().measuredBy).isEqualTo("Nurse A")
        assertThat(reloaded.first().enteredBy).isEqualTo("Caregiver B")
    }

    @Test
    fun insertIsAppendOnly_existingIdIgnoredNotOverwritten() = runBlocking {
        db.patientDao().insertIgnore(PatientEntity("p1", "Juan D."))
        val original = BloodPressureReadingEntity(
            "r1", "p1", 140, 90, 1_000L, "Nurse A", 2_000L, "Caregiver B", null,
            "PATIENT_OR_CAREGIVER",
        )
        val first = db.bloodPressureReadingDao().insertIgnore(original)
        val second = db.bloodPressureReadingDao().insertIgnore(original.copy(systolic = 999))

        assertThat(first).isNotEqualTo(-1L)
        assertThat(second).isEqualTo(-1L) // ignored
        val rows = db.bloodPressureReadingDao().listForPatient("p1")
        assertThat(rows).hasSize(1)
        assertThat(rows.first().systolic).isEqualTo(140) // not overwritten
    }

    @Test
    fun existingIds_detectsDuplicates() = runBlocking {
        db.patientDao().insertIgnore(PatientEntity("p1", "Juan D."))
        db.bloodPressureReadingDao().insertIgnore(
            BloodPressureReadingEntity(
                "r1", "p1", 120, 80, 1L, "A", 2L, "B", null, "BHW",
            ),
        )
        val existing = db.bloodPressureReadingDao().existingIds(listOf("r1", "r2"))
        assertThat(existing).containsExactly("r1")
    }
}
