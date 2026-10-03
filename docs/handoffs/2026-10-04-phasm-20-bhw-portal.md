# PHASM-20 BHW portal handoff

## Scope

The Astro web app is now a BHW-only portal. Patient and caregiver entry belongs to the separate Expo app. The portal uses seeded, synthetic patient records stored in browser local storage for demo continuity.

## BHW paths

- Home: recent readings and entry points to patient follow-up and sample import.
- Patients: searchable list with local patient code, age, area, latest value, and follow-up status.
- Patient record: date and time, systolic/diastolic values, measurer, recorder, and source for each reading; add a BHW reading; read or edit a visit note.
- Receive record: review and explicit confirmation walkthrough. Device discovery and transfer are not connected.
- RHU/YAKAP summary: print and CSV export for the existing handoff process. There is no direct RHU integration.

All displayed patient details and readings are synthetic. The web demo has no API, authentication, or clinical guidance. Atkinson Hyperlegible Next is bundled locally for readable data and offline use.

## Verification

- `pnpm --filter @app/web run check` — passed, zero errors, warnings, or hints.
- `pnpm --filter @app/web run build` — passed.
- Impeccable detector at `http://localhost:4321/?demo=1` — final pass reports one remaining generic `nested-cards` finding. Earlier contrast, small-text, kicker, and dev-runtime findings were corrected. The quick-action surfaces and hero decoration were flattened or removed; no script error remains.

## Remaining limitation

The receive path is a front-end walkthrough only. Nearby-device discovery, import persistence, authentication, and backend integration remain out of scope for this frontend slice. Review the remaining detector card-nesting heuristic before treating the portal as visually cleared.
