package org.phasmaframe.app.data.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Room entity for a visit note. Mirrors [org.phasmaframe.core.model.VisitNote].
 * Indexed by `patientId`. `source` records patient- vs BHW-entered provenance.
 */
@Entity(
    tableName = "visit_note",
    foreignKeys = [
        ForeignKey(
            entity = PatientEntity::class,
            parentColumns = ["id"],
            childColumns = ["patientId"],
            onDelete = ForeignKey.CASCADE,
        ),
    ],
    indices = [Index("patientId")],
)
data class VisitNoteEntity(
    @PrimaryKey val id: String,
    val patientId: String,
    val author: String,
    @ColumnInfo(name = "created_at") val createdAtEpochMillis: Long,
    val text: String,
    val source: String,
)
