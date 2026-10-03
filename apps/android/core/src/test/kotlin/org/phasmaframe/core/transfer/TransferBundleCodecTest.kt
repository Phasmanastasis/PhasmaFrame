package org.phasmaframe.core.transfer

import com.google.common.truth.Truth.assertThat
import org.junit.Test
import org.junit.Assert.assertThrows
import org.phasmaframe.core.model.BloodPressureReading
import org.phasmaframe.core.model.EntrySource
import org.phasmaframe.core.model.Patient
import org.phasmaframe.core.model.TransferBundle
import org.phasmaframe.core.model.VisitNote
import org.phasmaframe.core.proto.TransferBundleProto

class TransferBundleCodecTest {

    private fun sampleBundle(version: Int = TransferBundleCodec.SCHEMA_VERSION) = TransferBundle(
        id = "bundle-1",
        schemaVersion = version,
        patient = Patient(id = "p1", displayLabel = "Juan D."),
        readings = listOf(
            BloodPressureReading(
                id = "r1",
                patientId = "p1",
                systolic = 140,
                diastolic = 90,
                measuredAtEpochMillis = 1_700_000_000_000L,
                measuredBy = "Nurse A",
                enteredAtEpochMillis = 1_700_000_100_000L,
                enteredBy = "Caregiver B",
                note = "after walk",
                source = EntrySource.PATIENT_OR_CAREGIVER,
            ),
            BloodPressureReading(
                id = "r2",
                patientId = "p1",
                systolic = 128,
                diastolic = 82,
                measuredAtEpochMillis = 1_700_000_200_000L,
                measuredBy = "Self",
                enteredAtEpochMillis = 1_700_000_300_000L,
                enteredBy = "Self",
                note = null,
                source = EntrySource.BHW,
            ),
        ),
        visitNotes = listOf(
            VisitNote(
                id = "n1",
                patientId = "p1",
                author = "BHW Rosa",
                createdAtEpochMillis = 1_700_000_400_000L,
                text = "Advised low-salt diet.",
                source = EntrySource.BHW,
            ),
        ),
        createdAtEpochMillis = 1_700_000_500_000L,
    )

    @Test
    fun roundTrip_isLossless() {
        val original = sampleBundle()
        val decoded = TransferBundleCodec.decode(TransferBundleCodec.encode(original))

        // schemaVersion is normalized to the current version on encode; everything else
        // must survive exactly.
        assertThat(decoded.id).isEqualTo(original.id)
        assertThat(decoded.schemaVersion).isEqualTo(TransferBundleCodec.SCHEMA_VERSION)
        assertThat(decoded.patient).isEqualTo(original.patient)
        assertThat(decoded.readings).isEqualTo(original.readings)
        assertThat(decoded.visitNotes).isEqualTo(original.visitNotes)
        assertThat(decoded.createdAtEpochMillis).isEqualTo(original.createdAtEpochMillis)
        assertThat(decoded.entryCount).isEqualTo(3)
    }

    @Test
    fun measurerAndRecorder_surviveDistinctly() {
        val decoded = TransferBundleCodec.decode(TransferBundleCodec.encode(sampleBundle()))
        val r1 = decoded.readings.first { it.id == "r1" }
        assertThat(r1.measuredBy).isEqualTo("Nurse A")
        assertThat(r1.enteredBy).isEqualTo("Caregiver B")
    }

    @Test
    fun encode_isDeterministic() {
        val bundle = sampleBundle()
        val a = TransferBundleCodec.encode(bundle)
        val b = TransferBundleCodec.encode(bundle)
        assertThat(a).isEqualTo(b)
    }

    @Test
    fun decode_rejectsUnknownSchemaVersion() {
        // Build raw proto bytes that declare an unsupported version.
        val raw = TransferBundleProto.newBuilder()
            .setId("x")
            .setSchemaVersion(TransferBundleCodec.SCHEMA_VERSION + 1)
            .build()
            .toByteArray()

        val ex = assertThrows(UnsupportedSchemaVersionException::class.java) {
            TransferBundleCodec.decode(raw)
        }
        assertThat(ex.foundVersion).isEqualTo(TransferBundleCodec.SCHEMA_VERSION + 1)
        assertThat(ex.supportedVersion).isEqualTo(TransferBundleCodec.SCHEMA_VERSION)
    }

    @Test
    fun decode_rejectsMalformedBytes() {
        // Protobuf wire format: a byte sequence that is not a valid message.
        val garbage = byteArrayOf(0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte(), 0x7F)
        assertThrows(MalformedBundleException::class.java) {
            TransferBundleCodec.decode(garbage)
        }
    }

    @Test
    fun emptyNote_roundTripsAsNull() {
        val decoded = TransferBundleCodec.decode(TransferBundleCodec.encode(sampleBundle()))
        assertThat(decoded.readings.first { it.id == "r2" }.note).isNull()
    }
}
