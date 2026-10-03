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
- `pnpm --filter @app/patient exec expo install --check`
- Start Expo web at port 4322 and run Impeccable detect against `/?demo=1`.
- Exported native Android config must set minSdk 23 (Android 6). Native emulator verification is unavailable on this host; report that separately.

## Notes

This is a local prototype. It does not diagnose, recommend treatment, or connect to a BHW device yet. Transfer status is a local demonstration state.

## Detector outcome

The final 360×640 detector run reports two `transition: padding` findings. Browser inspection found the only matching element is a safe-area inset sentinel: hidden, zero by zero pixels, with a 0.05s padding transition. It has no visible content. Contrast and text-size findings were corrected.

## Android 6 / Pages compatibility follow-up

- Expo SDK 51 is used because [Expo's SDK matrix](https://docs.expo.dev/versions/v51.0.0/) lists Android 6+, React Native 0.74, and API 34 for SDK 51. `expo prebuild --platform android --no-install` generated `android/build.gradle` with `minSdkVersion` defaulting to 23.
- Tailwind 3.4 with PostCSS and Autoprefixer replaces Tailwind 4 so the web styling supports Android 6-era Chrome 106. Tailwind 4 requires Chrome 111 or newer according to its [browser compatibility guide](https://tailwindcss.com/docs/compatibility).
- The Astro Pages build runs its normal build, exports this app for web, then stages `index.html`, `_expo/`, and Expo's font assets at the Pages root.
- Local exported web UI was checked at 360×640. A 119/78 reading saved to browser storage remained after reload, and the page had no horizontal overflow.
- `adb` and `emulator` are not installed here. The minSdk was inspected in generated Gradle config, but native installation on Android 6 was not exercised.
