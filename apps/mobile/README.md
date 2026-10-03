# `@app/mobile` — PhasmaFrame (Expo managed)

Expo / React Native app for the offline hypertension follow-up MVP, replacing the
earlier native Kotlin/Gradle skeleton (see PHASM-33 / #32). Managed workflow, with the
web target enabled so it also runs as a PWA alongside the Astro web app.

## Architecture (MVP, mock-first)

- **Expo managed + expo-router** for file-based navigation. Web output is `static`
  (`app.json → web.output`), so `expo export --platform web` produces a PWA-capable bundle.
- **Domain layer** (`src/domain/`) is pure TypeScript, ported from the native `core`
  models/use-cases:
  - `models.ts` — Patient, BloodPressureReading, VisitNote, TransferBundle.
  - `store.ts` — `LocalStore` with an in-memory implementation seeded with synthetic
    demo data. A SQLite-backed implementation can slot in behind the same interface via
    `expo-sqlite`; in-memory is the default so it runs on web/PWA with no native binding.
  - `transport.ts` — mock **loopback** transport replacing Nearby Connections (which
    needs a native module unavailable in managed Expo). Simulates discovery + a confirmed
    device-to-device transfer in-process.
  - `validation.ts` — reading validation + local-ID generation.
  - `seed.ts` / `demo.ts` — synthetic records only; no national ID is collected.

## Screens (mirror `docs/app-sitemap.md`)

- `/` — role choice (patient/caregiver vs BHW)
- `/patients` — patient list
- `/patients/[id]` — patient summary (role-aware actions)
- `/patients/[id]/history` — reading history
- `/patients/[id]/add-reading` — add reading (validated, offline)
- `/patients/[id]/add-note` — add visit note (BHW)
- `/patients/[id]/summary` — RHU/YAKAP summary + CSV export (BHW)
- `/patients/[id]/send` — send record (discovery → transfer → result/retry)
- `/receive` — receive record (discover → preview → confirm import → receipt)

## Run

```sh
pnpm install
pnpm --filter @app/mobile web        # dev server (web/PWA)
pnpm --filter @app/mobile build:web  # static web/PWA export
pnpm --filter @app/mobile check      # typecheck
```

## MVP boundaries

One patient record per transfer, confirmed by the receiver. Data stays local except
during a confirmed transfer. No sign-in, cloud sync, background sync, clinical advice, or
direct RHU integration. Transfer uses a mock loopback adapter in this MVP.
