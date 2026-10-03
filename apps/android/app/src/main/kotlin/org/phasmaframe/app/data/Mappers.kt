package org.phasmaframe.app.data

import org.phasmaframe.app.data.entity.BloodPressureReadingEntity
import org.phasmaframe.app.data.entity.PatientEntity
import org.phasmaframe.app.data.entity.VisitNoteEntity
import org.phasmaframe.core.model.BloodPressureReading
import org.phasmaframe.core.model.EntrySourceCodec
import org.phasmaframe.core.model.Patient
import org.phasmaframe.core.model.VisitNote

/**
 * Pure entity<->domain mapping between Room entities (`:app`) and core domain models
 * (`:core`). The provenance string encoding is delegated to [EntrySourceCodec] so the
 * persisted form matches the transferred (Protobuf) form.
 */
object Mappers {

    fun PatientEntity.toDomain(): Patient = Patient(id = id, displayLabel = displayLabel)

    fun Patient.toEntity(): PatientEntity = PatientEntity(id = id, displayLabel = displayLabel)

    fun BloodPressureReadingEntity.toDomain(): BloodPressureReading = BloodPressureReading(
        id = id,
        patientId = patientId,
        systolic = systolic,
        diastolic = diastolic,
        measuredAtEpochMillis = measuredAtEpochMillis,
        measuredBy = measuredBy,
        enteredAtEpochMillis = enteredAtEpochMillis,
        enteredBy = enteredBy,
        note = note,
        source = EntrySourceCodec.decode(source),
    )

    fun BloodPressureReading.toEntity(): BloodPressureReadingEntity = BloodPressureReadingEntity(
        id = id,
        patientId = patientId,
        systolic = systolic,
        diastolic = diastolic,
        measuredAtEpochMillis = measuredAtEpochMillis,
        measuredBy = measuredBy,
        enteredAtEpochMillis = enteredAtEpochMillis,
        enteredBy = enteredBy,
        note = note,
        source = EntrySourceCodec.encode(source),
    )

    fun VisitNoteEntity.toDomain(): VisitNote = VisitNote(
        id = id,
        patientId = patientId,
        author = author,
        createdAtEpochMillis = createdAtEpochMillis,
        text = text,
        source = EntrySourceCodec.decode(source),
    )

    fun VisitNote.toEntity(): VisitNoteEntity = VisitNoteEntity(
        id = id,
        patientId = patientId,
        author = author,
        createdAtEpochMillis = createdAtEpochMillis,
        text = text,
        source = EntrySourceCodec.encode(source),
    )
}
