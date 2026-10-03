package org.phasmaframe.core.summary

import com.google.common.truth.Truth.assertThat
import org.junit.Test
import org.phasmaframe.core.model.BloodPressureReading
import org.phasmaframe.core.model.EntrySource
import org.phasmaframe.core.model.Patient
import org.phasmaframe.core.model.VisitNote

class RhuSummaryBuilderTest {

    private val patient = Patient("p1", "Juan D.")

    private fun r(
        id: String, sys: Int, dia: Int, at: Long,
        source: EntrySource = EntrySource.PATIENT_OR_CAREGIVER, note: String? = null,
    ) = BloodPressureReading(
        id = id, patientId = "p1", systolic = sys, diastolic = dia,
        measuredAtEpochMillis = at, measuredBy = "M", enteredAtEpochMillis = at + 1,
        enteredBy = "E", note = note, source = source,
    )

    @Test
    fun build_computesCountsRangeLatestAndFlags() {
        val readings = listOf(
            r("r1", 120, 80, 1_000, EntrySource.PATIENT_OR_CAREGIVER),
            r("r2", 150, 95, 3_000, EntrySource.BHW),          // high
            r("r3", 142, 85, 2_000, EntrySource.PATIENT_OR_CAREGIVER), // high (systolic)
        )
        val notes = listOf(VisitNote("n1", "p1", "BHW", 5_000, "ok", EntrySource.BHW))

        val s = RhuSummaryBuilder.build(patient, readings, notes)

        assertThat(s.readingCount).isEqualTo(3)
        assertThat(s.visitNoteCount).isEqualTo(1)
        assertThat(s.patientEnteredReadingCount).isEqualTo(2)
        assertThat(s.bhwEnteredReadingCount).isEqualTo(1)
        assertThat(s.earliestReadingAtEpochMillis).isEqualTo(1_000)
        assertThat(s.latestReadingAtEpochMillis).isEqualTo(3_000)
        assertThat(s.latestSystolic).isEqualTo(150)
        assertThat(s.latestDiastolic).isEqualTo(95)
        assertThat(s.highReadingCount).isEqualTo(2)
    }

    @Test
    fun build_emptyHistory_hasNullsAndZeroes() {
        val s = RhuSummaryBuilder.build(patient, emptyList(), emptyList())
        assertThat(s.readingCount).isEqualTo(0)
        assertThat(s.latestSystolic).isNull()
        assertThat(s.earliestReadingAtEpochMillis).isNull()
        assertThat(s.highReadingCount).isEqualTo(0)
    }

    @Test
    fun isHigh_usesThresholds() {
        assertThat(RhuSummaryBuilder.isHigh(r("x", 139, 89, 0))).isFalse()
        assertThat(RhuSummaryBuilder.isHigh(r("x", 140, 80, 0))).isTrue()
        assertThat(RhuSummaryBuilder.isHigh(r("x", 120, 90, 0))).isTrue()
    }

    @Test
    fun toCsv_hasHeaderAndRowPerReading_newestFirst() {
        val readings = listOf(
            r("r1", 120, 80, 1_000),
            r("r2", 150, 95, 3_000),
        )
        val csv = RhuSummaryBuilder.toCsv(patient, readings)
        val lines = csv.trim().split("\n")

        assertThat(lines[0]).startsWith("patient_id,patient_label,reading_id,")
        assertThat(lines).hasSize(3) // header + 2 rows
        // newest (r2 at 3000) first
        assertThat(lines[1]).contains("r2")
        assertThat(lines[2]).contains("r1")
    }

    @Test
    fun toCsv_escapesCommasAndQuotes() {
        val readings = listOf(r("r1", 120, 80, 1_000, note = "needs, review \"urgent\""))
        val csv = RhuSummaryBuilder.toCsv(patient, readings)
        // the note field must be quoted and inner quotes doubled
        assertThat(csv).contains("\"needs, review \"\"urgent\"\"\"")
    }

    @Test
    fun toCsv_sourceColumnKeepsProvenance() {
        val readings = listOf(
            r("r1", 120, 80, 1_000, EntrySource.PATIENT_OR_CAREGIVER),
            r("r2", 130, 85, 2_000, EntrySource.BHW),
        )
        val csv = RhuSummaryBuilder.toCsv(patient, readings)
        assertThat(csv).contains("PATIENT_OR_CAREGIVER")
        assertThat(csv).contains("BHW")
    }
}
