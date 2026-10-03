package org.phasmaframe.app.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow
import org.phasmaframe.app.data.entity.BloodPressureReadingEntity

@Dao
interface BloodPressureReadingDao {

    /**
     * Append-only insert. Returns the inserted row id, or -1 when the reading id already
     * exists (IGNORE conflict). Callers use the -1 signal for repeat-safe skip counting.
     */
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertIgnore(reading: BloodPressureReadingEntity): Long

    /** Reading ids that already exist from the given set (duplicate detection). */
    @Query("SELECT id FROM blood_pressure_reading WHERE id IN (:ids)")
    suspend fun existingIds(ids: List<String>): List<String>

    /** Dated history for a patient, newest measured first. */
    @Query(
        "SELECT * FROM blood_pressure_reading WHERE patientId = :patientId " +
            "ORDER BY measured_at DESC",
    )
    fun observeForPatient(patientId: String): Flow<List<BloodPressureReadingEntity>>

    @Query(
        "SELECT * FROM blood_pressure_reading WHERE patientId = :patientId " +
            "ORDER BY measured_at DESC",
    )
    suspend fun listForPatient(patientId: String): List<BloodPressureReadingEntity>
}
