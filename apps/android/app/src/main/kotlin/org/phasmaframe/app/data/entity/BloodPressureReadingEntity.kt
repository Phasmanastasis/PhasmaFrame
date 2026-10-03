package org.phasmaframe.app.data.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Room entity for a blood-pressure reading. Mirrors
 * [org.phasmaframe.core.model.BloodPressureReading].
 *
 * Measurer (`measuredBy`) and recorder (`enteredBy`) are stored in **distinct columns**
 * (SDD ERD; PRD measure 3). `source` records patient- vs BHW-entered provenance.
 * Indexed by `patientId` for history queries.
 */
@Entity(
    tableName = "blood_pressure_reading",
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
data class BloodPressureReadingEntity(
    @PrimaryKey val id: String,
    val patientId: String,
    val systolic: Int,
    val diastolic: Int,
    @ColumnInfo(name = "measured_at") val measuredAtEpochMillis: Long,
    @ColumnInfo(name = "measured_by") val measuredBy: String,
    @ColumnInfo(name = "entered_at") val enteredAtEpochMillis: Long,
    @ColumnInfo(name = "entered_by") val enteredBy: String,
    val note: String?,
    val source: String,
)
