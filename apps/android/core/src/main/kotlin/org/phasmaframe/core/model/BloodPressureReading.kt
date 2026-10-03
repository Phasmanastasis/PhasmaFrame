package org.phasmaframe.core.model

/**
 * Who originally entered a record. Keeps patient/caregiver-entered data distinguishable
 * from BHW-entered data (PRD/SDD: "patient-entered vs BHW-entered remain distinguishable").
 */
enum class EntrySource {
    PATIENT_OR_CAREGIVER,
    BHW,
}

/**
 * A single blood-pressure reading.
 *
 * Per the SDD ERD, measurer (`measuredBy`) and recorder (`enteredBy`) are stored
 * **distinctly** because the person who took the reading may differ from the person who
 * entered it. Timestamps are epoch milliseconds (UTC) to keep the model free of any
 * Android/`java.time` desugaring concerns in the pure-JVM module.
 *
 * @property id stable reading UUID (string form); the unit of append-only de-duplication
 * @property patientId owning patient's UUID
 * @property systolic systolic value (mmHg)
 * @property diastolic diastolic value (mmHg)
 * @property measuredAtEpochMillis when the reading was physically taken
 * @property measuredBy who measured (free-text label)
 * @property enteredAtEpochMillis when the reading was entered into the app
 * @property enteredBy who entered the reading (free-text label)
 * @property note optional free-text note
 * @property source whether this originated from the patient/caregiver or the BHW
 */
data class BloodPressureReading(
    val id: String,
    val patientId: String,
    val systolic: Int,
    val diastolic: Int,
    val measuredAtEpochMillis: Long,
    val measuredBy: String,
    val enteredAtEpochMillis: Long,
    val enteredBy: String,
    val note: String? = null,
    val source: EntrySource = EntrySource.PATIENT_OR_CAREGIVER,
)
