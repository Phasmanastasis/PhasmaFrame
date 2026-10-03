package org.phasmaframe.app.data

import androidx.room.withTransaction
import org.phasmaframe.app.data.Mappers.toDomain
import org.phasmaframe.app.data.Mappers.toEntity
import org.phasmaframe.core.data.LocalStore
import org.phasmaframe.core.model.BloodPressureReading
import org.phasmaframe.core.model.Patient
import org.phasmaframe.core.model.VisitNote

/**
 * Room-backed [LocalStore]. Append-only inserts are implemented by the DAOs' IGNORE
 * strategy (a -1 row id means "already existed"); [runInTransaction] delegates to Room's
 * [withTransaction], which rolls back on any thrown exception — satisfying the atomic
 * import requirement (#21).
 */
class RoomLocalStore(
    private val db: PhasmaFrameDatabase,
) : LocalStore {

    private val patientDao = db.patientDao()
    private val readingDao = db.bloodPressureReadingDao()
    private val noteDao = db.visitNoteDao()

    override suspend fun getPatient(id: String): Patient? =
        patientDao.findById(id)?.toDomain()

    override suspend fun listReadings(patientId: String): List<BloodPressureReading> =
        readingDao.listForPatient(patientId).map { it.toDomain() }

    override suspend fun listVisitNotes(patientId: String): List<VisitNote> =
        noteDao.listForPatient(patientId).map { it.toDomain() }

    override suspend fun existingReadingIds(ids: Collection<String>): Set<String> =
        readingDao.existingIds(ids.toList()).toSet()

    override suspend fun existingVisitNoteIds(ids: Collection<String>): Set<String> =
        noteDao.existingIds(ids.toList()).toSet()

    override suspend fun insertPatientIfAbsent(patient: Patient): Boolean =
        patientDao.insertIgnore(patient.toEntity()) != -1L

    override suspend fun insertReadingIfAbsent(reading: BloodPressureReading): Boolean =
        readingDao.insertIgnore(reading.toEntity()) != -1L

    override suspend fun insertVisitNoteIfAbsent(note: VisitNote): Boolean =
        noteDao.insertIgnore(note.toEntity()) != -1L

    override suspend fun <T> runInTransaction(block: suspend () -> T): T =
        db.withTransaction { block() }
}
