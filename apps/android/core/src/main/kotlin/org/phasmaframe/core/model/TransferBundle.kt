package org.phasmaframe.core.model

/**
 * One patient's selected history, packaged for device-to-device transfer.
 *
 * Per the SDD ERD: bundle UUID, schema version, patient UUID, readings, visit notes,
 * createdAt. A bundle always concerns exactly one patient (one patient bundle at a time).
 *
 * The [schemaVersion] is explicit so a receiver can reject unknown versions (#18 codec).
 *
 * @property id bundle UUID (string form)
 * @property schemaVersion the bundle schema version the sender produced
 * @property patient the single patient this bundle is about
 * @property readings the selected blood-pressure readings
 * @property visitNotes the selected visit notes
 * @property createdAtEpochMillis when the bundle was assembled
 */
data class TransferBundle(
    val id: String,
    val schemaVersion: Int,
    val patient: Patient,
    val readings: List<BloodPressureReading>,
    val visitNotes: List<VisitNote>,
    val createdAtEpochMillis: Long,
) {
    /** Total number of importable entries (readings + notes), used for preview counts. */
    val entryCount: Int get() = readings.size + visitNotes.size
}
