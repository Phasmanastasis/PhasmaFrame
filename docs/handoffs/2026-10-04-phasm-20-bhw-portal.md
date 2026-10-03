# PHASM-20 BHW portal handoff

## Scope

The Astro web app is now a BHW-only portal. Patient and caregiver entry belongs to the separate Expo app. The portal uses seeded, synthetic patient records stored in browser local storage for demo continuity.

The web styles use Tailwind 3.4 with PostCSS and Autoprefixer for Android 6's Chrome 106 floor. The visit-reading sheet uses a `vh` height cap, and mobile page content leaves clearance below fixed navigation.

## BHW paths

- Home: recent readings and entry points to patient follow-up and sample import.
- Patients: searchable list with local patient code, age, area, latest value, and follow-up status.
- Patient record: date and time, systolic/diastolic values, measurer, recorder, and source for each reading; add a BHW reading; read or edit a visit note.
- Receive record: choose a sample packet, review its values, confirm import, retry an interrupted import, and recover from empty or conflicting packets. Matching records merge unique reading IDs; duplicate IDs are skipped. Device discovery and transfer are not connected.
- RHU/YAKAP summary: print and CSV export for the existing handoff process. There is no direct RHU integration.
- Visit note: add, edit, or explicitly remove a saved note. Search, reading entry, and packet review include actionable empty or invalid states.

All displayed patient details and readings are synthetic. The web demo has no API, authentication, or clinical guidance. Atkinson Hyperlegible Next is bundled locally for readable data and offline use.

## Verification

- `pnpm --filter @app/web run check` — passed, zero errors, warnings, or hints.
- `pnpm --filter @app/web run build` — passed.
- Independent 390 × 844 mobile review found no horizontal overflow and clear primary action hierarchy. It flagged the fixed navigation overlap at the viewport edge; mobile content clearance was increased from 7rem to 8rem.
- Impeccable detector at `http://localhost:4321/?demo=1` — final pass is pending the draft PR update.

## Remaining limitation

The receive path is a front-end walkthrough only. Imported packets and BHW changes persist in browser local storage; nearby-device discovery, authentication, and backend integration remain out of scope. This is a local demo, not a clinical record system.
