package org.phasmaframe.core.usecase

/**
 * What a received bundle contains, shown to the BHW **before** import so they can verify
 * the patient and entry count (SDD manual-transfer flow; PRD BHW acceptance).
 *
 * @property patientId the single patient the bundle concerns
 * @property patientLabel human-readable patient label for verification
 * @property readingCount readings in the bundle
 * @property visitNoteCount visit notes in the bundle
 */
data class ImportPreview(
    val patientId: String,
    val patientLabel: String,
    val readingCount: Int,
    val visitNoteCount: Int,
) {
    val totalEntryCount: Int get() = readingCount + visitNoteCount
}

/**
 * Outcome of a committed import, used to build the receipt UI.
 *
 * @property importedReadingCount new readings actually written
 * @property skippedReadingCount readings skipped because their id already existed
 * @property importedVisitNoteCount new notes actually written
 * @property skippedVisitNoteCount notes skipped because their id already existed
 * @property patientCreated whether the patient row was newly created by this import
 */
data class ImportResult(
    val importedReadingCount: Int,
    val skippedReadingCount: Int,
    val importedVisitNoteCount: Int,
    val skippedVisitNoteCount: Int,
    val patientCreated: Boolean,
) {
    val importedCount: Int get() = importedReadingCount + importedVisitNoteCount
    val skippedCount: Int get() = skippedReadingCount + skippedVisitNoteCount
}
