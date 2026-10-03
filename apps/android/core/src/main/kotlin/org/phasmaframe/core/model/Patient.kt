package org.phasmaframe.core.model

/**
 * A patient whose blood-pressure history is tracked locally and transferred to a BHW.
 *
 * Per the SDD ERD, a patient is identified by a **local UUID** and a minimal display
 * label/code only. There is deliberately **no national identifier** stored.
 *
 * @property id stable local UUID (string form) used for append-only duplicate detection
 * @property displayLabel minimal human-readable label/code shown in lists and previews
 */
data class Patient(
    val id: String,
    val displayLabel: String,
)
