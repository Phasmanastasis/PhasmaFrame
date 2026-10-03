package org.phasmaframe.core.model

/**
 * Stable string encoding for [EntrySource], shared by the Room mappers (#19) and the
 * Protobuf codec (#18) so persisted and transferred provenance values agree. Pure and
 * JVM-unit-testable.
 */
object EntrySourceCodec {

    fun encode(source: EntrySource): String = when (source) {
        EntrySource.PATIENT_OR_CAREGIVER -> "PATIENT_OR_CAREGIVER"
        EntrySource.BHW -> "BHW"
    }

    /**
     * Decodes a stored/transferred source string. Unknown or null values fall back to
     * [EntrySource.PATIENT_OR_CAREGIVER] so legacy rows never crash reads; callers that
     * must reject unknown values should validate before calling.
     */
    fun decode(raw: String?): EntrySource = when (raw) {
        "BHW" -> EntrySource.BHW
        else -> EntrySource.PATIENT_OR_CAREGIVER
    }
}
