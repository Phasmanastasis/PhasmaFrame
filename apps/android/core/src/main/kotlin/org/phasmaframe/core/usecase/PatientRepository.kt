package org.phasmaframe.core.usecase

import org.phasmaframe.core.data.LocalStore
import org.phasmaframe.core.model.BloodPressureReading
import org.phasmaframe.core.model.Patient
import org.phasmaframe.core.model.TransferBundle
import org.phasmaframe.core.model.VisitNote
import org.phasmaframe.core.transfer.TransferBundleCodec

/**
 * Repository sitting between the UI and the [LocalStore]/transport. Provides the
 * record-reading, add-note, and build-bundle operations. Append-only semantics are
 * enforced by the store; this layer never overwrites existing entries.
 */
class PatientRepository(private val store: LocalStore) {

    /** Records a reading for an existing patient. Appends only. */
    suspend fun recordReading(reading: BloodPressureReading): Boolean =
        store.runInTransaction {
            store.insertPatientIfAbsent(Patient(reading.patientId, reading.patientId))
            store.insertReadingIfAbsent(reading)
        }

    /** Adds a visit note (author + time already set on the note). Appends only. */
    suspend fun addVisitNote(note: VisitNote): Boolean =
        store.runInTransaction {
            store.insertVisitNoteIfAbsent(note)
        }

    /**
     * Builds a one-patient [TransferBundle] from the patient's current history, stamped
     * with the current schema version. One patient per bundle.
     *
     * @throws IllegalArgumentException if the patient does not exist locally.
     */
    suspend fun buildBundle(
        patientId: String,
        bundleId: String,
        createdAtEpochMillis: Long,
    ): TransferBundle {
        val patient = store.getPatient(patientId)
            ?: throw IllegalArgumentException("Unknown patient: $patientId")
        return TransferBundle(
            id = bundleId,
            schemaVersion = TransferBundleCodec.SCHEMA_VERSION,
            patient = patient,
            readings = store.listReadings(patientId),
            visitNotes = store.listVisitNotes(patientId),
            createdAtEpochMillis = createdAtEpochMillis,
        )
    }
}
