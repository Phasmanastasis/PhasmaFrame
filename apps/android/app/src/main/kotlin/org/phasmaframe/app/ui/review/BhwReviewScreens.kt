package org.phasmaframe.app.ui.review

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.phasmaframe.core.model.BloodPressureReading
import org.phasmaframe.core.model.EntrySource
import org.phasmaframe.core.summary.RhuSummary
import org.phasmaframe.core.summary.RhuSummaryBuilder

/**
 * BHW review & summary screens (#24). After an import the BHW can review the dated
 * history, add a visit note, and open the RHU-ready summary. Rendering logic only; the
 * data/formatting lives in `:core` (`RhuSummaryBuilder`) and is unit-tested there.
 */

/** Patient summary & history: dated readings with values, time, measurer, recorder, provenance. */
@Composable
fun PatientHistoryScreen(
    readings: List<BloodPressureReading>,
    onAddVisitNote: () -> Unit,
    onOpenRhuSummary: () -> Unit,
) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Patient summary & history")
        Button(onClick = onAddVisitNote, modifier = Modifier.fillMaxWidth()) {
            Text("Add visit note")
        }
        Button(onClick = onOpenRhuSummary, modifier = Modifier.fillMaxWidth()) {
            Text("Open RHU-ready summary")
        }
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(readings) { r -> ReadingRow(r) }
        }
    }
}

@Composable
private fun ReadingRow(r: BloodPressureReading) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(12.dp)) {
            val flag = if (RhuSummaryBuilder.isHigh(r)) "  ⚠ high" else ""
            Text("${r.systolic}/${r.diastolic} mmHg$flag")
            Text("Measured at: ${r.measuredAtEpochMillis}")
            // Measurer and recorder shown distinctly.
            Text("Measured by: ${r.measuredBy}   •   Entered by: ${r.enteredBy}")
            val provenance = when (r.source) {
                EntrySource.PATIENT_OR_CAREGIVER -> "Patient/caregiver-entered"
                EntrySource.BHW -> "BHW-entered"
            }
            Text(provenance)
            r.note?.let { Text("Note: $it") }
        }
    }
}

/** Add visit note screen. Saving reuses PatientRepository.addVisitNote (see host). */
@Composable
fun AddVisitNoteScreen(
    author: String,
    text: String,
    onAuthorChange: (String) -> Unit,
    onTextChange: (String) -> Unit,
    onSave: () -> Unit,
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Add visit note")
        OutlinedTextField(author, onAuthorChange, label = { Text("Author (BHW)") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(text, onTextChange, label = { Text("Note") }, modifier = Modifier.fillMaxWidth())
        Button(onClick = onSave, modifier = Modifier.fillMaxWidth()) { Text("Save note") }
    }
}

/** RHU-ready summary screen rendering the :core summary and offering CSV export/share. */
@Composable
fun RhuSummaryScreen(
    summary: RhuSummary,
    onExportCsv: () -> Unit,
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text("RHU-ready summary — ${summary.patientLabel}")
        Text("Readings: ${summary.readingCount}  (patient: ${summary.patientEnteredReadingCount}, BHW: ${summary.bhwEnteredReadingCount})")
        Text("Visit notes: ${summary.visitNoteCount}")
        Text("Flagged high: ${summary.highReadingCount}")
        if (summary.latestSystolic != null) {
            Text("Latest: ${summary.latestSystolic}/${summary.latestDiastolic} mmHg")
        }
        Button(onClick = onExportCsv, modifier = Modifier.fillMaxWidth()) {
            Text("Export CSV for RHU")
        }
    }
}
