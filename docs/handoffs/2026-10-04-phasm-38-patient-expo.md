# PHASM-38 patient Expo implementation handoff

## Context

This branch replaces the patient reading-entry portion of Kotlin PR #39 with an Expo / React Native patient and caregiver app. BHW review remains in the separate Astro web portal. The PRD requires offline reading persistence and manual one-patient transfer; this demo uses synthetic local data and must not imply clinical advice or completed hardware transport.

## Scope

- Patient/caregiver setup using a clearly synthetic demo profile.
- Material Design 3 interface through React Native Paper.
- Blood-pressure entry for systolic, diastolic, time, measurer, recorder, optional note.
- Locally persisted reading history.
- One-patient transfer initiation, status, and retry demo.
- Expo web and native app entry points.

## Verification

- `pnpm --filter @app/patient run check`
- `pnpm --filter @app/patient run build`
- Start Expo web at port 4322 and run Impeccable detect against `/?demo=1`.
- Native emulator verification is unavailable on this host; report that separately.

## Notes

This is a local prototype. It does not diagnose, recommend treatment, or connect to a BHW device yet. Transfer status is a local demonstration state.
