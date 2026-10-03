package org.phasmaframe.app.ui.record

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.phasmaframe.core.validation.ReadingInputValidator.Field

/**
 * Offline reading-entry screen (#22). Captures systolic/diastolic, measurement time, who
 * measured and who entered (distinct), and an optional note; shows inline validation
 * errors; saves locally via the ViewModel. The entry then appears in the patient's dated
 * history (the history/summary screen is #24).
 *
 * Note: the date/time picker is represented here by the ViewModel's `measuredAt`; a real
 * Material date/time picker is wired in the screen host. Kept minimal for API 23+.
 */
@Composable
fun RecordReadingScreen(viewModel: RecordReadingViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp).verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Record blood-pressure reading")

        OutlinedTextField(
            value = state.systolic,
            onValueChange = viewModel::onSystolicChange,
            label = { Text("Systolic (mmHg)") },
            isError = state.errors.containsKey(Field.SYSTOLIC),
            supportingText = { state.errors[Field.SYSTOLIC]?.let { Text(it) } },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = state.diastolic,
            onValueChange = viewModel::onDiastolicChange,
            label = { Text("Diastolic (mmHg)") },
            isError = state.errors.containsKey(Field.DIASTOLIC),
            supportingText = { state.errors[Field.DIASTOLIC]?.let { Text(it) } },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = state.measuredBy,
            onValueChange = viewModel::onMeasuredByChange,
            label = { Text("Who measured") },
            isError = state.errors.containsKey(Field.MEASURED_BY),
            supportingText = { state.errors[Field.MEASURED_BY]?.let { Text(it) } },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = state.enteredBy,
            onValueChange = viewModel::onEnteredByChange,
            label = { Text("Who entered") },
            isError = state.errors.containsKey(Field.ENTERED_BY),
            supportingText = { state.errors[Field.ENTERED_BY]?.let { Text(it) } },
            modifier = Modifier.fillMaxWidth(),
        )
        // Measurement time: the host supplies the picker and calls onMeasuredAtChange.
        state.errors[Field.MEASURED_AT]?.let { Text(it) }
        OutlinedTextField(
            value = state.note,
            onValueChange = viewModel::onNoteChange,
            label = { Text("Note (optional)") },
            modifier = Modifier.fillMaxWidth(),
        )
        Button(onClick = viewModel::save, modifier = Modifier.fillMaxWidth()) {
            Text("Save")
        }
        if (state.saved) {
            Text("Saved offline. It will appear in the patient's history.")
        }
    }
}
