package org.phasmaframe.app.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Room entity for a patient. Mirrors [org.phasmaframe.core.model.Patient].
 * Local UUID + minimal display label only; no national identifier (SDD ERD).
 */
@Entity(tableName = "patient")
data class PatientEntity(
    @PrimaryKey val id: String,
    val displayLabel: String,
)
