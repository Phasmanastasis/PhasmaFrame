package org.phasmaframe.core.nav

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class DestinationTest {

    @Test
    fun siteMap_coversAllSddDestinations() {
        val routes = Destination.entries.map { it.route }
        // Every SDD site-map node is present.
        assertThat(routes).containsAtLeast(
            "home", "patients", "patients/summary",
            "patients/add-reading", "patients/add-visit-note", "patients/rhu-summary",
            "transfer/send", "transfer/receive", "transfer/review", "transfer/receipt",
        )
    }

    @Test
    fun routes_areUnique() {
        val routes = Destination.entries.map { it.route }
        assertThat(routes).containsNoDuplicates()
    }

    @Test
    fun start_isHomeRoleChoice() {
        assertThat(Destination.START).isEqualTo(Destination.HOME_ROLE_CHOICE)
    }

    @Test
    fun bothRoles_routeToAnEntryPoint() {
        assertThat(Destination.entryPointFor(UserRole.PATIENT_OR_CAREGIVER))
            .isEqualTo(Destination.PATIENT_LIST)
        assertThat(Destination.entryPointFor(UserRole.BHW))
            .isEqualTo(Destination.PATIENT_LIST)
    }

    @Test
    fun sendAndReceive_areVisibleEntryPoints() {
        assertThat(Destination.transferEntryPoints)
            .containsExactly(Destination.SEND_RECORD, Destination.RECEIVE_RECORD)
    }

    @Test
    fun rhuSummary_reachableFromPatientSummary() {
        assertThat(Destination.reachableFromPatientSummary).contains(Destination.RHU_SUMMARY)
    }
}
