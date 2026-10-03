package org.phasmaframe.core.model

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class EntrySourceCodecTest {

    @Test
    fun encodeDecode_roundTrips_allValues() {
        for (source in EntrySource.entries) {
            val encoded = EntrySourceCodec.encode(source)
            assertThat(EntrySourceCodec.decode(encoded)).isEqualTo(source)
        }
    }

    @Test
    fun encode_isStableWireString() {
        assertThat(EntrySourceCodec.encode(EntrySource.BHW)).isEqualTo("BHW")
        assertThat(EntrySourceCodec.encode(EntrySource.PATIENT_OR_CAREGIVER))
            .isEqualTo("PATIENT_OR_CAREGIVER")
    }

    @Test
    fun decode_unknownOrNull_fallsBackToPatient() {
        assertThat(EntrySourceCodec.decode(null)).isEqualTo(EntrySource.PATIENT_OR_CAREGIVER)
        assertThat(EntrySourceCodec.decode("nonsense"))
            .isEqualTo(EntrySource.PATIENT_OR_CAREGIVER)
    }

    @Test
    fun measurerAndRecorder_areDistinctFields() {
        // Guards the SDD requirement that measuredBy and enteredBy are stored distinctly.
        val reading = BloodPressureReading(
            id = "r1",
            patientId = "p1",
            systolic = 120,
            diastolic = 80,
            measuredAtEpochMillis = 1_000L,
            measuredBy = "Nurse A",
            enteredAtEpochMillis = 2_000L,
            enteredBy = "Caregiver B",
            note = null,
        )
        assertThat(reading.measuredBy).isNotEqualTo(reading.enteredBy)
    }
}
