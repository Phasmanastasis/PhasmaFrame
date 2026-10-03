package org.phasmaframe.core.data

import org.phasmaframe.core.model.BloodPressureReading
import org.phasmaframe.core.model.Patient
import org.phasmaframe.core.model.VisitNote

/**
 * Persistence port for the domain layer, implemented by the Room-backed store in `:app`
 * and by fakes in tests. Kept in `:core` so the repository/use-case logic (#21) is
 * Android-free and fully JVM-unit-testable.
 *
 * All writes are **append-only**: an id that already exists must be left untouched (the
 * `insert*IfAbsent` methods return `true` only when a new row was actually written). This
 * is the basis for repeat-safe import.
 *
 * [runInTransaction] must execute its block **atomically**: if the block throws, every
 * write performed inside it must be rolled back so no partial state remains.
 */
interface LocalStore {

    // --- queries ---

    suspend fun getPatient(id: String): Patient?
    suspend fun listReadings(patientId: String): List<BloodPressureReading>
    suspend fun listVisitNotes(patientId: String): List<VisitNote>

    /** Of the given reading ids, which already exist. */
    suspend fun existingReadingIds(ids: Collection<String>): Set<String>

    /** Of the given note ids, which already exist. */
    suspend fun existingVisitNoteIds(ids: Collection<String>): Set<String>

    // --- append-only writes (must run inside runInTransaction for atomic imports) ---

    /** @return true if a new patient was written; false if the id already existed. */
    suspend fun insertPatientIfAbsent(patient: Patient): Boolean

    /** @return true if a new reading was written; false if the id already existed. */
    suspend fun insertReadingIfAbsent(reading: BloodPressureReading): Boolean

    /** @return true if a new note was written; false if the id already existed. */
    suspend fun insertVisitNoteIfAbsent(note: VisitNote): Boolean

    /**
     * Runs [block] atomically. Implementations must guarantee all-or-nothing: a throw from
     * [block] rolls back every write made inside it. Returns the block's result.
     */
    suspend fun <T> runInTransaction(block: suspend () -> T): T
}
