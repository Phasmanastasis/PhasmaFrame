package org.phasmaframe.app.ui.record

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.phasmaframe.core.model.BloodPressureReading
import org.phasmaframe.core.model.EntrySource
import org.phasmaframe.core.usecase.PatientRepository
import org.phasmaframe.core.validation.ReadingInputValidator
import java.util.UUID

/** UI state for the record-reading screen. */
data class RecordReadingUiState(
    val systolic: String = "",
    val diastolic: String = "",
    val measuredBy: String = "",
    val enteredBy: String = "",
    val measuredAtEpochMillis: Long? = null,
    val note: String = "",
    val errors: Map<ReadingInputValidator.Field, String> = emptyMap(),
    val saved: Boolean = false,
)

/**
 * ViewModel for the offline record-reading screen (#22). Validation is delegated to the
 * pure `:core` [ReadingInputValidator]; saving goes through [PatientRepository] (append-
 * only, offline). The screen observes [uiState].
 */
class RecordReadingViewModel(
    private val patientId: String,
    private val repository: PatientRepository,
    private val now: () -> Long = { System.currentTimeMillis() },
    private val idGenerator: () -> String = { UUID.randomUUID().toString() },
) : ViewModel() {

    private val _uiState = MutableStateFlow(RecordReadingUiState())
    val uiState: StateFlow<RecordReadingUiState> = _uiState.asStateFlow()

    fun onSystolicChange(v: String) = _uiState.update { it.copy(systolic = v, saved = false) }
    fun onDiastolicChange(v: String) = _uiState.update { it.copy(diastolic = v, saved = false) }
    fun onMeasuredByChange(v: String) = _uiState.update { it.copy(measuredBy = v, saved = false) }
    fun onEnteredByChange(v: String) = _uiState.update { it.copy(enteredBy = v, saved = false) }
    fun onNoteChange(v: String) = _uiState.update { it.copy(note = v, saved = false) }
    fun onMeasuredAtChange(ts: Long?) =
        _uiState.update { it.copy(measuredAtEpochMillis = ts, saved = false) }

    fun save() {
        val s = _uiState.value
        val result = ReadingInputValidator.validate(
            ReadingInputValidator.Input(
                systolicText = s.systolic,
                diastolicText = s.diastolic,
                measuredBy = s.measuredBy,
                enteredBy = s.enteredBy,
                measuredAtEpochMillis = s.measuredAtEpochMillis,
            ),
            nowEpochMillis = now(),
        )
        if (!result.isValid) {
            _uiState.update { st -> st.copy(errors = result.errors.associate { it.field to it.message }) }
            return
        }
        val reading = BloodPressureReading(
            id = idGenerator(),
            patientId = patientId,
            systolic = s.systolic.trim().toInt(),
            diastolic = s.diastolic.trim().toInt(),
            measuredAtEpochMillis = s.measuredAtEpochMillis!!,
            measuredBy = s.measuredBy.trim(),
            enteredAtEpochMillis = now(),
            enteredBy = s.enteredBy.trim(),
            note = s.note.ifBlank { null },
            source = EntrySource.PATIENT_OR_CAREGIVER,
        )
        viewModelScope.launch {
            repository.recordReading(reading)
            _uiState.update { it.copy(errors = emptyMap(), saved = true) }
        }
    }
}
