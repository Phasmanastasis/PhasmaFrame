package org.phasmaframe.app.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow
import org.phasmaframe.app.data.entity.PatientEntity

@Dao
interface PatientDao {

    /** Append-only: an existing patient id is ignored, never overwritten. */
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertIgnore(patient: PatientEntity): Long

    @Query("SELECT * FROM patient ORDER BY displayLabel COLLATE NOCASE ASC")
    fun observeAll(): Flow<List<PatientEntity>>

    @Query("SELECT * FROM patient WHERE id = :id")
    suspend fun findById(id: String): PatientEntity?

    @Query("SELECT COUNT(*) FROM patient WHERE id = :id")
    suspend fun exists(id: String): Int
}
