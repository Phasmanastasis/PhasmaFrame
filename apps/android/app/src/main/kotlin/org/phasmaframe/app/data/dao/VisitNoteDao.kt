package org.phasmaframe.app.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow
import org.phasmaframe.app.data.entity.VisitNoteEntity

@Dao
interface VisitNoteDao {

    /** Append-only insert; returns -1 when the note id already exists. */
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertIgnore(note: VisitNoteEntity): Long

    @Query("SELECT id FROM visit_note WHERE id IN (:ids)")
    suspend fun existingIds(ids: List<String>): List<String>

    @Query("SELECT * FROM visit_note WHERE patientId = :patientId ORDER BY created_at DESC")
    fun observeForPatient(patientId: String): Flow<List<VisitNoteEntity>>

    @Query("SELECT * FROM visit_note WHERE patientId = :patientId ORDER BY created_at DESC")
    suspend fun listForPatient(patientId: String): List<VisitNoteEntity>
}
