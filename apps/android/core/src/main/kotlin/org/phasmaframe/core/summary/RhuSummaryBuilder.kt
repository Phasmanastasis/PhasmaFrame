package org.phasmaframe.core.summary

import org.phasmaframe.core.model.BloodPressureReading
import org.phasmaframe.core.model.EntrySource
import org.phasmaframe.core.model.Patient
import org.phasmaframe.core.model.VisitNote

/**
 * A concise, RHU/YAKAP-ready summary of one patient's history (#24). Pure data computed
 * by [RhuSummaryBuilder]; the `:app` summary screen renders it and offers CSV export (the
 * RHU handoff per the SDD/PRD — direct BHW→RHU digital transfer is out of scope).
 */
data class RhuSummary(
    val patientId: String,
    val patientLabel: String,
    val readingCount: Int,
    val visitNoteCount: Int,
    val patientEnteredReadingCount: Int,
    val bhwEnteredReadingCount: Int,
    val earliestReadingAtEpochMillis: Long?,
    val latestReadingAtEpochMillis: Long?,
    val latestSystolic: Int?,
    val latestDiastolic: Int?,
    val highReadingCount: Int,
)

/**
 * Builds an [RhuSummary] and a CSV export from a patient's history. Deterministic and
 * JVM-unit-testable (no Android).
 */
object RhuSummaryBuilder {

    /** Stage-2 hypertension threshold used only to *flag* readings for review, not to diagnose. */
    const val HIGH_SYSTOLIC = 140
    const val HIGH_DIASTOLIC = 90

    fun isHigh(reading: BloodPressureReading): Boolean =
        reading.systolic >= HIGH_SYSTOLIC || reading.diastolic >= HIGH_DIASTOLIC

    fun build(
        patient: Patient,
        readings: List<BloodPressureReading>,
        visitNotes: List<VisitNote>,
    ): RhuSummary {
        val byMeasuredAt = readings.sortedBy { it.measuredAtEpochMillis }
        val latest = byMeasuredAt.lastOrNull()
        return RhuSummary(
            patientId = patient.id,
            patientLabel = patient.displayLabel,
            readingCount = readings.size,
            visitNoteCount = visitNotes.size,
            patientEnteredReadingCount =
                readings.count { it.source == EntrySource.PATIENT_OR_CAREGIVER },
            bhwEnteredReadingCount = readings.count { it.source == EntrySource.BHW },
            earliestReadingAtEpochMillis = byMeasuredAt.firstOrNull()?.measuredAtEpochMillis,
            latestReadingAtEpochMillis = latest?.measuredAtEpochMillis,
            latestSystolic = latest?.systolic,
            latestDiastolic = latest?.diastolic,
            highReadingCount = readings.count { isHigh(it) },
        )
    }

    /**
     * CSV export of the dated readings for the RHU's existing process. One header row plus
     * one row per reading (newest first). Fields are CSV-escaped. The `source` column keeps
     * patient-entered vs BHW-entered distinguishable; `flagged_high` marks readings at/above
     * the review threshold.
     */
    fun toCsv(
        patient: Patient,
        readings: List<BloodPressureReading>,
    ): String {
        val sb = StringBuilder()
        sb.append("patient_id,patient_label,reading_id,measured_at_epoch_millis,systolic,")
        sb.append("diastolic,measured_by,entered_by,source,flagged_high,note\n")
        readings.sortedByDescending { it.measuredAtEpochMillis }.forEach { r ->
            sb.append(
                listOf(
                    patient.id,
                    patient.displayLabel,
                    r.id,
                    r.measuredAtEpochMillis.toString(),
                    r.systolic.toString(),
                    r.diastolic.toString(),
                    r.measuredBy,
                    r.enteredBy,
                    r.source.name,
                    isHigh(r).toString(),
                    r.note ?: "",
                ).joinToString(",") { csvEscape(it) },
            )
            sb.append("\n")
        }
        return sb.toString()
    }

    private fun csvEscape(value: String): String =
        if (value.any { it == ',' || it == '"' || it == '\n' || it == '\r' }) {
            "\"" + value.replace("\"", "\"\"") + "\""
        } else {
            value
        }
}
