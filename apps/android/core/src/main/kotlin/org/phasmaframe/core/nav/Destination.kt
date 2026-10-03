package org.phasmaframe.core.nav

/**
 * The two user roles from the SDD. Role choice routes to the right entry points.
 */
enum class UserRole {
    PATIENT_OR_CAREGIVER,
    BHW,
}

/**
 * Canonical catalog of the MVP site-map destinations (SDD "Site map"). Kept in `:core`
 * so the navigation structure is data that can be unit-tested without the Android SDK;
 * the `:app` NavHost binds a composable to each [route].
 *
 * SDD site map:
 * Home / role choice → Patient list → Patient summary & history → Add reading or visit
 * note → Send record / Receive record → Transfer review & confirmation → Import receipt.
 * The RHU-ready summary is reachable from Patient summary.
 */
enum class Destination(val route: String) {
    HOME_ROLE_CHOICE("home"),
    PATIENT_LIST("patients"),
    PATIENT_SUMMARY("patients/summary"),
    ADD_READING("patients/add-reading"),
    ADD_VISIT_NOTE("patients/add-visit-note"),
    RHU_SUMMARY("patients/rhu-summary"),
    SEND_RECORD("transfer/send"),
    RECEIVE_RECORD("transfer/receive"),
    TRANSFER_REVIEW("transfer/review"),
    IMPORT_RECEIPT("transfer/receipt"),
    ;

    companion object {
        /** The start destination of the app. */
        val START: Destination = HOME_ROLE_CHOICE

        /**
         * Where a role lands after choosing on the Home screen. Both roles reach the
         * patient list; the patient/caregiver flow centres on recording + sending, the
         * BHW flow on receiving + review, but both share the same list entry point.
         */
        fun entryPointFor(role: UserRole): Destination = when (role) {
            UserRole.PATIENT_OR_CAREGIVER -> PATIENT_LIST
            UserRole.BHW -> PATIENT_LIST
        }

        /**
         * Destinations that must be reachable directly from the Patient summary screen
         * (history is the summary itself; the RHU summary and the per-patient add/send
         * actions branch off it).
         */
        val reachableFromPatientSummary: Set<Destination> = setOf(
            ADD_READING,
            ADD_VISIT_NOTE,
            RHU_SUMMARY,
            SEND_RECORD,
        )

        /** Transfer destinations that must be visible/entry-point reachable (not dev-only). */
        val transferEntryPoints: Set<Destination> = setOf(SEND_RECORD, RECEIVE_RECORD)
    }
}
