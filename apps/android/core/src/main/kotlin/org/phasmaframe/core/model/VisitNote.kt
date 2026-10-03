package org.phasmaframe.core.model

/**
 * A BHW visit note attached to a patient.
 *
 * Per the SDD ERD: note UUID, patient UUID, author, createdAt, text.
 *
 * @property id stable note UUID (string form) used for append-only duplicate detection
 * @property patientId owning patient's UUID
 * @property author who wrote the note
 * @property createdAtEpochMillis when the note was created
 * @property text the note body
 * @property source whether this originated from the patient/caregiver or the BHW
 */
data class VisitNote(
    val id: String,
    val patientId: String,
    val author: String,
    val createdAtEpochMillis: Long,
    val text: String,
    val source: EntrySource = EntrySource.BHW,
)
