package org.phasmaframe.core.validation

/**
 * Validates raw blood-pressure reading form input (#22). Pure and JVM-unit-testable; the
 * `:app` record screen/ViewModel calls this and renders the returned errors.
 *
 * Rules (clinical plausibility bounds, not diagnosis):
 * - systolic and diastolic are required integers in a plausible range,
 * - systolic must be greater than diastolic,
 * - measurer and recorder are required (they may differ but neither may be blank),
 * - measurement time must be present and not in the future.
 */
object ReadingInputValidator {

    const val SYSTOLIC_MIN = 50
    const val SYSTOLIC_MAX = 300
    const val DIASTOLIC_MIN = 30
    const val DIASTOLIC_MAX = 200

    enum class Field { SYSTOLIC, DIASTOLIC, MEASURED_BY, ENTERED_BY, MEASURED_AT }

    data class Error(val field: Field, val message: String)

    data class Input(
        val systolicText: String,
        val diastolicText: String,
        val measuredBy: String,
        val enteredBy: String,
        val measuredAtEpochMillis: Long?,
    )

    data class Result(val errors: List<Error>) {
        val isValid: Boolean get() = errors.isEmpty()
        fun errorFor(field: Field): String? = errors.firstOrNull { it.field == field }?.message
    }

    fun validate(input: Input, nowEpochMillis: Long): Result {
        val errors = mutableListOf<Error>()

        val systolic = input.systolicText.trim().toIntOrNull()
        when {
            input.systolicText.isBlank() ->
                errors += Error(Field.SYSTOLIC, "Enter the systolic value.")
            systolic == null ->
                errors += Error(Field.SYSTOLIC, "Systolic must be a whole number.")
            systolic !in SYSTOLIC_MIN..SYSTOLIC_MAX ->
                errors += Error(Field.SYSTOLIC, "Systolic must be $SYSTOLIC_MIN–$SYSTOLIC_MAX.")
        }

        val diastolic = input.diastolicText.trim().toIntOrNull()
        when {
            input.diastolicText.isBlank() ->
                errors += Error(Field.DIASTOLIC, "Enter the diastolic value.")
            diastolic == null ->
                errors += Error(Field.DIASTOLIC, "Diastolic must be a whole number.")
            diastolic !in DIASTOLIC_MIN..DIASTOLIC_MAX ->
                errors += Error(Field.DIASTOLIC, "Diastolic must be $DIASTOLIC_MIN–$DIASTOLIC_MAX.")
        }

        if (systolic != null && diastolic != null && systolic <= diastolic) {
            errors += Error(Field.SYSTOLIC, "Systolic must be higher than diastolic.")
        }

        if (input.measuredBy.isBlank()) {
            errors += Error(Field.MEASURED_BY, "Enter who measured the reading.")
        }
        if (input.enteredBy.isBlank()) {
            errors += Error(Field.ENTERED_BY, "Enter who entered the reading.")
        }

        when (val t = input.measuredAtEpochMillis) {
            null -> errors += Error(Field.MEASURED_AT, "Enter the measurement time.")
            else -> if (t > nowEpochMillis) {
                errors += Error(Field.MEASURED_AT, "Measurement time can't be in the future.")
            }
        }

        return Result(errors)
    }
}
