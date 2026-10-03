package org.phasmaframe.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import org.phasmaframe.core.nav.Destination
import org.phasmaframe.core.nav.UserRole

/**
 * Navigation graph for the MVP site map (#23). Every [Destination] is bound to a
 * placeholder screen; later feature PRs (#22/#24/#25) replace the placeholders with real
 * content. Role choice on Home routes to the right entry point; Send/Receive are visible
 * on-screen (not dev-only).
 *
 * Designed for low-end Android (API 23+): large buttons, simple vertical layout.
 */
@Composable
fun PhasmaFrameNavHost(navController: NavHostController = rememberNavController()) {
    NavHost(navController = navController, startDestination = Destination.START.route) {
        composable(Destination.HOME_ROLE_CHOICE.route) {
            HomeRoleChoiceScreen(
                onChooseRole = { role ->
                    navController.navigate(Destination.entryPointFor(role).route)
                },
                onReceive = { navController.navigate(Destination.RECEIVE_RECORD.route) },
            )
        }
        composable(Destination.PATIENT_LIST.route) {
            PlaceholderScreen(
                title = "Patients",
                actions = listOf(
                    "Open patient summary" to { navController.navigate(Destination.PATIENT_SUMMARY.route) },
                ),
            )
        }
        composable(Destination.PATIENT_SUMMARY.route) {
            PlaceholderScreen(
                title = "Patient summary & history",
                actions = listOf(
                    "Add reading" to { navController.navigate(Destination.ADD_READING.route) },
                    "Add visit note" to { navController.navigate(Destination.ADD_VISIT_NOTE.route) },
                    "RHU-ready summary" to { navController.navigate(Destination.RHU_SUMMARY.route) },
                    "Send record" to { navController.navigate(Destination.SEND_RECORD.route) },
                ),
            )
        }
        composable(Destination.ADD_READING.route) { PlaceholderScreen("Add reading") }
        composable(Destination.ADD_VISIT_NOTE.route) { PlaceholderScreen("Add visit note") }
        composable(Destination.RHU_SUMMARY.route) { PlaceholderScreen("RHU-ready summary") }
        composable(Destination.SEND_RECORD.route) {
            PlaceholderScreen(
                title = "Send record",
                actions = listOf(
                    "Review & confirm" to { navController.navigate(Destination.TRANSFER_REVIEW.route) },
                ),
            )
        }
        composable(Destination.RECEIVE_RECORD.route) {
            PlaceholderScreen(
                title = "Receive record",
                actions = listOf(
                    "Review & confirm" to { navController.navigate(Destination.TRANSFER_REVIEW.route) },
                ),
            )
        }
        composable(Destination.TRANSFER_REVIEW.route) {
            PlaceholderScreen(
                title = "Transfer review & confirmation",
                actions = listOf(
                    "Confirm import" to { navController.navigate(Destination.IMPORT_RECEIPT.route) },
                ),
            )
        }
        composable(Destination.IMPORT_RECEIPT.route) { PlaceholderScreen("Import receipt") }
    }
}

@Composable
private fun HomeRoleChoiceScreen(
    onChooseRole: (UserRole) -> Unit,
    onReceive: () -> Unit,
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp).verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text("PhasmaFrame", style = MaterialTheme.typography.headlineMedium)
        Text("Choose your role", style = MaterialTheme.typography.titleMedium)
        BigButton("I'm a patient / caregiver") { onChooseRole(UserRole.PATIENT_OR_CAREGIVER) }
        BigButton("I'm a BHW") { onChooseRole(UserRole.BHW) }
        // Send/Receive must be visible from the start, not hidden behind a dev trigger.
        BigButton("Receive a record") { onReceive() }
    }
}

@Composable
private fun PlaceholderScreen(
    title: String,
    actions: List<Pair<String, () -> Unit>> = emptyList(),
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp).verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(title, style = MaterialTheme.typography.headlineSmall)
        Text(
            "Offline — placeholder screen. Content arrives in a later feature PR.",
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Start,
        )
        actions.forEach { (label, onClick) -> BigButton(label, onClick) }
    }
}

@Composable
private fun BigButton(label: String, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
    ) {
        Text(label, style = MaterialTheme.typography.titleMedium)
    }
}
