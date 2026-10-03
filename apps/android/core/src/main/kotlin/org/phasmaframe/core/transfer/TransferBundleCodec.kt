package org.phasmaframe.core.transfer

import com.google.protobuf.InvalidProtocolBufferException
import org.phasmaframe.core.model.BloodPressureReading
import org.phasmaframe.core.model.EntrySource
import org.phasmaframe.core.model.Patient
import org.phasmaframe.core.model.TransferBundle
import org.phasmaframe.core.model.VisitNote
import org.phasmaframe.core.proto.BloodPressureReadingProto
import org.phasmaframe.core.proto.EntrySourceProto
import org.phasmaframe.core.proto.PatientProto
import org.phasmaframe.core.proto.TransferBundleProto
import org.phasmaframe.core.proto.VisitNoteProto

/**
 * Encodes/decodes a [TransferBundle] to/from the Protobuf wire format (#18).
 *
 * - **Versioned:** every encoded bundle carries [SCHEMA_VERSION]. [decode] rejects any
 *   other version with [UnsupportedSchemaVersionException].
 * - **Lossless round-trip:** all fields (values, timestamps, measurer, recorder, note,
 *   source) survive encode→decode.
 * - **Deterministic:** the same bundle always encodes to the same bytes. proto3 field
 *   encoding is deterministic for scalar fields, and `repeated` fields preserve the input
 *   list order, so callers get stable, comparable output suitable for size checks.
 *
 * The payload is independent of any transport (Nearby Connections, file, etc.).
 */
object TransferBundleCodec {

    /** The only bundle schema version this build understands. */
    const val SCHEMA_VERSION: Int = 1

    fun encode(bundle: TransferBundle): ByteArray = toProto(bundle).toByteArray()

    /**
     * Decodes a bundle from [bytes].
     *
     * @throws MalformedBundleException if the bytes are not a valid TransferBundle.
     * @throws UnsupportedSchemaVersionException if the bundle's schema version is not
     *   [SCHEMA_VERSION].
     */
    fun decode(bytes: ByteArray): TransferBundle {
        val proto = try {
            TransferBundleProto.parseFrom(bytes)
        } catch (e: InvalidProtocolBufferException) {
            throw MalformedBundleException(e)
        }
        if (proto.schemaVersion != SCHEMA_VERSION) {
            throw UnsupportedSchemaVersionException(proto.schemaVersion, SCHEMA_VERSION)
        }
        return fromProto(proto)
    }

    // --- domain -> proto ---

    private fun toProto(bundle: TransferBundle): TransferBundleProto {
        val builder = TransferBundleProto.newBuilder()
            .setId(bundle.id)
            // Always stamp the current schema version regardless of the in-memory value,
            // so encoders cannot emit an inconsistent version.
            .setSchemaVersion(SCHEMA_VERSION)
            .setPatient(toProto(bundle.patient))
            .setCreatedAtEpochMillis(bundle.createdAtEpochMillis)
        bundle.readings.forEach { builder.addReadings(toProto(it)) }
        bundle.visitNotes.forEach { builder.addVisitNotes(toProto(it)) }
        return builder.build()
    }

    private fun toProto(patient: Patient): PatientProto =
        PatientProto.newBuilder()
            .setId(patient.id)
            .setDisplayLabel(patient.displayLabel)
            .build()

    private fun toProto(r: BloodPressureReading): BloodPressureReadingProto =
        BloodPressureReadingProto.newBuilder()
            .setId(r.id)
            .setPatientId(r.patientId)
            .setSystolic(r.systolic)
            .setDiastolic(r.diastolic)
            .setMeasuredAtEpochMillis(r.measuredAtEpochMillis)
            .setMeasuredBy(r.measuredBy)
            .setEnteredAtEpochMillis(r.enteredAtEpochMillis)
            .setEnteredBy(r.enteredBy)
            .setNote(r.note ?: "")
            .setSource(toProto(r.source))
            .build()

    private fun toProto(n: VisitNote): VisitNoteProto =
        VisitNoteProto.newBuilder()
            .setId(n.id)
            .setPatientId(n.patientId)
            .setAuthor(n.author)
            .setCreatedAtEpochMillis(n.createdAtEpochMillis)
            .setText(n.text)
            .setSource(toProto(n.source))
            .build()

    private fun toProto(source: EntrySource): EntrySourceProto = when (source) {
        EntrySource.PATIENT_OR_CAREGIVER -> EntrySourceProto.ENTRY_SOURCE_PATIENT_OR_CAREGIVER
        EntrySource.BHW -> EntrySourceProto.ENTRY_SOURCE_BHW
    }

    // --- proto -> domain ---

    private fun fromProto(p: TransferBundleProto): TransferBundle = TransferBundle(
        id = p.id,
        schemaVersion = p.schemaVersion,
        patient = fromProto(p.patient),
        readings = p.readingsList.map(::fromProto),
        visitNotes = p.visitNotesList.map(::fromProto),
        createdAtEpochMillis = p.createdAtEpochMillis,
    )

    private fun fromProto(p: PatientProto): Patient =
        Patient(id = p.id, displayLabel = p.displayLabel)

    private fun fromProto(p: BloodPressureReadingProto): BloodPressureReading =
        BloodPressureReading(
            id = p.id,
            patientId = p.patientId,
            systolic = p.systolic,
            diastolic = p.diastolic,
            measuredAtEpochMillis = p.measuredAtEpochMillis,
            measuredBy = p.measuredBy,
            enteredAtEpochMillis = p.enteredAtEpochMillis,
            enteredBy = p.enteredBy,
            // Empty string encodes "no note"; map it back to null.
            note = p.note.ifEmpty { null },
            source = fromProto(p.source),
        )

    private fun fromProto(p: VisitNoteProto): VisitNote = VisitNote(
        id = p.id,
        patientId = p.patientId,
        author = p.author,
        createdAtEpochMillis = p.createdAtEpochMillis,
        text = p.text,
        source = fromProto(p.source),
    )

    private fun fromProto(source: EntrySourceProto): EntrySource = when (source) {
        EntrySourceProto.ENTRY_SOURCE_BHW -> EntrySource.BHW
        // UNSPECIFIED / PATIENT_OR_CAREGIVER / UNRECOGNIZED all map to patient/caregiver.
        else -> EntrySource.PATIENT_OR_CAREGIVER
    }
}
