package org.phasmaframe.core.usecase

import org.phasmaframe.core.data.LocalStore
import org.phasmaframe.core.model.BloodPressureReading
import org.phasmaframe.core.model.Patient
import org.phasmaframe.core.model.VisitNote

/**
 * In-memory [LocalStore] for tests. Implements real append-only semantics and real
 * atomic transactions: [runInTransaction] snapshots state, and on any throw restores the
 * snapshot so no partial writes survive (mirrors a SQLite transaction rollback).
 *
 * [failOnReadingId] lets a test simulate an interrupted/failing commit mid-way to prove
 * the rollback guarantee.
 */
class FakeLocalStore(
    private val failOnReadingId: String? = null,
) : LocalStore {

    private val patients = linkedMapOf<String, Patient>()
    private val readings = linkedMapOf<String, BloodPressureReading>()
    private val notes = linkedMapOf<String, VisitNote>()

    override suspend fun getPatient(id: String): Patient? = patients[id]

    override suspend fun listReadings(patientId: String): List<BloodPressureReading> =
        readings.values.filter { it.patientId == patientId }

    override suspend fun listVisitNotes(patientId: String): List<VisitNote> =
        notes.values.filter { it.patientId == patientId }

    override suspend fun existingReadingIds(ids: Collection<String>): Set<String> =
        ids.filterTo(mutableSetOf()) { readings.containsKey(it) }

    override suspend fun existingVisitNoteIds(ids: Collection<String>): Set<String> =
        ids.filterTo(mutableSetOf()) { notes.containsKey(it) }

    override suspend fun insertPatientIfAbsent(patient: Patient): Boolean {
        if (patients.containsKey(patient.id)) return false
        patients[patient.id] = patient
        return true
    }

    override suspend fun insertReadingIfAbsent(reading: BloodPressureReading): Boolean {
        if (reading.id == failOnReadingId) error("simulated failure on reading ${reading.id}")
        if (readings.containsKey(reading.id)) return false
        readings[reading.id] = reading
        return true
    }

    override suspend fun insertVisitNoteIfAbsent(note: VisitNote): Boolean {
        if (notes.containsKey(note.id)) return false
        notes[note.id] = note
        return true
    }

    override suspend fun <T> runInTransaction(block: suspend () -> T): T {
        val pSnap = LinkedHashMap(patients)
        val rSnap = LinkedHashMap(readings)
        val nSnap = LinkedHashMap(notes)
        return try {
            block()
        } catch (t: Throwable) {
            patients.clear(); patients.putAll(pSnap)
            readings.clear(); readings.putAll(rSnap)
            notes.clear(); notes.putAll(nSnap)
            throw t
        }
    }

    // Test inspection helpers.
    fun readingCount(): Int = readings.size
    fun noteCount(): Int = notes.size
    fun patientCount(): Int = patients.size
}
