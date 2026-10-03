package org.phasmaframe.core.usecase

import org.phasmaframe.core.data.LocalStore
import org.phasmaframe.core.model.TransferBundle
import org.phasmaframe.core.transfer.TransferBundleCodec

/**
 * Imports a received [TransferBundle] in three stages (SDD manual-transfer flow):
 *
 * 1. **validate + decode** — [decode] parses the Protobuf payload and rejects unknown
 *    schema versions / malformed bytes (delegated to [TransferBundleCodec]).
 * 2. **preview** — [preview] reports the patient and entry counts for the BHW to confirm
 *    *before* any write.
 * 3. **commit** — [commit] writes atomically.
 *
 * Commit guarantees:
 * - **Atomic:** all writes happen inside [LocalStore.runInTransaction]; a failure mid-way
 *   rolls back everything (no partial import).
 * - **Append-only by id:** existing readings/notes are never overwritten.
 * - **Repeat-safe:** entries whose ids already exist are skipped and counted, so a
 *   repeated transfer never duplicates data.
 * - Returns [ImportResult] with imported/skipped counts for the receipt.
 *
 * One patient bundle is handled at a time.
 */
class ImportBundleUseCase(private val store: LocalStore) {

    /** Stage 1: decode + validate raw payload bytes. Throws on unknown version/malformed. */
    fun decode(payload: ByteArray): TransferBundle = TransferBundleCodec.decode(payload)

    /** Stage 2: preview a decoded bundle (no writes). */
    fun preview(bundle: TransferBundle): ImportPreview = ImportPreview(
        patientId = bundle.patient.id,
        patientLabel = bundle.patient.displayLabel,
        readingCount = bundle.readings.size,
        visitNoteCount = bundle.visitNotes.size,
    )

    /** Convenience: decode + preview straight from bytes. */
    fun previewFromBytes(payload: ByteArray): ImportPreview = preview(decode(payload))

    /**
     * Stage 3: commit the bundle atomically. Safe to call repeatedly with the same
     * bundle; the second call imports nothing and reports everything as skipped.
     */
    suspend fun commit(bundle: TransferBundle): ImportResult = store.runInTransaction {
        val patientCreated = store.insertPatientIfAbsent(bundle.patient)

        var importedReadings = 0
        var skippedReadings = 0
        for (reading in bundle.readings) {
            if (store.insertReadingIfAbsent(reading)) importedReadings++ else skippedReadings++
        }

        var importedNotes = 0
        var skippedNotes = 0
        for (note in bundle.visitNotes) {
            if (store.insertVisitNoteIfAbsent(note)) importedNotes++ else skippedNotes++
        }

        ImportResult(
            importedReadingCount = importedReadings,
            skippedReadingCount = skippedReadings,
            importedVisitNoteCount = importedNotes,
            skippedVisitNoteCount = skippedNotes,
            patientCreated = patientCreated,
        )
    }

    /** Decode + validate + commit from raw bytes (preview/confirm happens in the UI). */
    suspend fun importFromBytes(payload: ByteArray): ImportResult = commit(decode(payload))
}
