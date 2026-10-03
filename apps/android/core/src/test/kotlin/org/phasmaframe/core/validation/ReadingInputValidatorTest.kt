package org.phasmaframe.core.validation

import com.google.common.truth.Truth.assertThat
import org.junit.Test
import org.phasmaframe.core.validation.ReadingInputValidator.Field
import org.phasmaframe.core.validation.ReadingInputValidator.Input

class ReadingInputValidatorTest {

    private val now = 1_700_000_000_000L

    private fun input(
        sys: String = "120",
        dia: String = "80",
        measuredBy: String = "Nurse A",
        enteredBy: String = "Caregiver B",
        measuredAt: Long? = 1_699_000_000_000L,
    ) = Input(sys, dia, measuredBy, enteredBy, measuredAt)

    @Test
    fun validInput_passes() {
        assertThat(ReadingInputValidator.validate(input(), now).isValid).isTrue()
    }

    @Test
    fun blankSystolic_fails() {
        val r = ReadingInputValidator.validate(input(sys = ""), now)
        assertThat(r.errorFor(Field.SYSTOLIC)).isNotNull()
    }

    @Test
    fun nonNumericSystolic_fails() {
        val r = ReadingInputValidator.validate(input(sys = "12x"), now)
        assertThat(r.errorFor(Field.SYSTOLIC)).contains("whole number")
    }

    @Test
    fun outOfRangeValues_fail() {
        assertThat(ReadingInputValidator.validate(input(sys = "400"), now).isValid).isFalse()
        assertThat(ReadingInputValidator.validate(input(dia = "10"), now).isValid).isFalse()
    }

    @Test
    fun systolicNotAboveDiastolic_fails() {
        val r = ReadingInputValidator.validate(input(sys = "80", dia = "90"), now)
        assertThat(r.errorFor(Field.SYSTOLIC)).contains("higher than diastolic")
    }

    @Test
    fun blankMeasurerOrRecorder_fail() {
        assertThat(ReadingInputValidator.validate(input(measuredBy = ""), now).errorFor(Field.MEASURED_BY))
            .isNotNull()
        assertThat(ReadingInputValidator.validate(input(enteredBy = ""), now).errorFor(Field.ENTERED_BY))
            .isNotNull()
    }

    @Test
    fun measurerAndRecorderMayDiffer() {
        val r = ReadingInputValidator.validate(
            input(measuredBy = "Nurse A", enteredBy = "Caregiver B"), now,
        )
        assertThat(r.isValid).isTrue()
    }

    @Test
    fun missingTime_fails() {
        assertThat(ReadingInputValidator.validate(input(measuredAt = null), now).errorFor(Field.MEASURED_AT))
            .isNotNull()
    }

    @Test
    fun futureTime_fails() {
        val r = ReadingInputValidator.validate(input(measuredAt = now + 60_000), now)
        assertThat(r.errorFor(Field.MEASURED_AT)).contains("future")
    }
}
