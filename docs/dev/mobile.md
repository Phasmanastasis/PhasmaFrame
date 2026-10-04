# Running the mobile app (`apps/mobile`) on Android

`apps/mobile` is the Expo / React Native app for Kasigla — a real native UI (not a
WebView wrapper, not just the web PWA). It uses expo-router for navigation, a pure
TypeScript domain layer in `src/domain/`, and an in-memory store seeded with synthetic
demo data. The web target is also enabled (`app.json` → `web.output: "static"`), so the
same code can be exported as a static web bundle with `expo export --platform web`.

> Scope note: device-to-device transfer in `apps/mobile` is a **mock loopback**
> (`src/domain/transport.ts`), not real peer-to-peer. The PRD's offline phone-to-phone
> transfer (Google Nearby Connections) needs a native module and is **not** implemented
> here; it would require a custom development build, not Expo Go.

This guide documents what was verified running the app on a physical Android phone over
USB with Expo Go, after upgrading the app from Expo SDK 51 to SDK 57.

## TL;DR verdict (verified)

- The app **runs and stays open** on a physical Android 15 device (Redmi, HyperOS 2.0)
  via **Expo Go 57** over USB. Home screen renders; navigating to the patient list works;
  it survives backgrounding and stays up well past a minute.
- This only works **after** upgrading `apps/mobile` to **Expo SDK 57**. On the previous
  SDK 51, the app bundled and rendered one frame, then crashed with a native
  `UIManager` error (see [What failed](#what-failed-and-why)).
- No Expo account, no EAS cloud build, and no dev build were needed. `npx expo start` +
  Expo Go is enough to run it.

## Versions this was verified on

| Thing | Version |
| --- | --- |
| Expo SDK | 57.0.26 |
| React Native | 0.86.3 |
| React / react-dom | 19.2.3 |
| expo-router | 57.0.24 |
| TypeScript (mobile) | 6.0.3 |
| Expo Go (Android client for SDK 57) | 57.0.9 |
| Node | 22.23.1 (meets Expo's Node 20.19+ / 22.12+) |
| pnpm | 10.33.0 |
| Host OS | Fedora Linux 45 |
| Test device | Redmi 23021RAAEG (`tapas`), Android 15 (API 35), HyperOS 2.0 |

React 19.2 in `apps/mobile` coexists with React 18.2 in `apps/patient` (still SDK 51)
because pnpm keeps each workspace's dependencies isolated and the repo has no root
`pnpm.overrides` forcing a single React version. `pnpm check` passes for all workspaces.

## Prerequisites

### General (any OS)

- **Node 20.19+ or 22.12+** and **pnpm 10+** — see [getting-started.md](./getting-started.md).
- **Android platform-tools** (`adb`) to talk to a device or emulator.
- Either a **physical Android phone** with USB debugging, or an **Android emulator**
  (an AVD plus a system image).
- **Expo Go** on the device, matching the SDK (57 → Expo Go 57.x). Get it from the Play
  Store, or download a specific version from <https://expo.dev/go>.

`apps/mobile` needs **no `.env`** of its own — only `apps/api` uses `.env`. The app runs
on seeded synthetic data.

### Fedora specifics (what this spike used)

The host had `adb` but no Android SDK and no usable JDK. Everything below was installed in
**user space, no `sudo`**, and is fully removable.

1. **A real JDK 17.** Fedora's `java` was JRE-only (no `javac`), which `sdkmanager` and
   Gradle reject. A Temurin JDK 17 tarball was unpacked under `~/jdks/` and used via
   `JAVA_HOME`. (JDK 17 only matters for the Android SDK tooling and dev builds; running
   the app in Expo Go does not compile Java.)
2. **Android command-line tools + SDK** under `~/Android/Sdk` (set `ANDROID_HOME`):
   `platform-tools`, `emulator`, `platforms;android-34`, `build-tools;34.0.0`, and a
   `system-images;android-34;google_apis;x86_64` image. Only needed if you want an
   **emulator**; a USB phone needs just `platform-tools` (`adb`).
3. **KVM** for emulator acceleration: `/dev/kvm` must be accessible (it was, world
   read-write; the CPU had `vmx`/`svm`). No root needed on this host.

Environment used for Android tooling:

```bash
export JAVA_HOME="$HOME/jdks/jdk-17.0.20.1+1"      # a real JDK 17
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

## Run it on a physical phone over USB (verified path)

This needs no Wi-Fi and no Expo account.

1. Enable **Developer options → USB debugging** on the phone, connect USB, and approve
   the "Allow USB debugging?" prompt. Confirm the device is attached:
   ```bash
   adb devices -l          # the phone shows as a serial; an emulator shows as emulator-5554
   ```
2. Install **Expo Go for the matching SDK** on the phone. For SDK 57 that is Expo Go
   57.x. Either install from the Play Store, or sideload a known version:
   ```bash
   adb install -r /path/to/Expo-Go-57.0.9.apk     # package id: host.exp.exponent
   ```
3. Start the dev server from the repo root (Metro bundler):
   ```bash
   pnpm --filter @app/mobile dev        # = expo start, serves on http://localhost:8081
   ```
4. Make the phone reach Metro over USB, then open the app in Expo Go:
   ```bash
   adb reverse tcp:8081 tcp:8081
   adb shell am start -a android.intent.action.VIEW \
     -d "exp://127.0.0.1:8081" host.exp.exponent
   ```

The first launch bundles the app (~1500 modules; a few seconds), then the Kasigla home
screen appears. Verified: the home screen renders, tapping **Patient or caregiver** opens
the seeded patient list (Patient A/B/C), and the app survives backgrounding.

### Inspecting the running app without extra tools

Plain `adb` is enough to see and drive the screen (no skill or MCP required):

```bash
adb exec-out screencap -p > screen.png          # screenshot
adb shell uiautomator dump /sdcard/ui.xml && adb pull /sdcard/ui.xml   # view hierarchy / text
adb shell input tap <x> <y>                      # tap at coordinates
adb logcat -s ReactNativeJS:*                    # JS console + errors from the app
```

## Run it on an emulator (alternative)

If you have no phone, create and boot an AVD (requires the SDK packages above):

```bash
avdmanager create avd -n phasma34 \
  -k "system-images;android-34;google_apis;x86_64" -d pixel_6
emulator -avd phasma34 -no-window -no-audio -gpu swiftshader_indirect -accel on &
adb wait-for-device
```

Then install Expo Go on the emulator and run the same `expo start` / `adb reverse` /
`am start` steps as above. A headless emulator with KVM booted to
`sys.boot_completed=1` in a few seconds on this host.

## Upgrading the SDK (what was done, SDK 51 → 57)

Done with Expo's documented upgrade path, from inside `apps/mobile`:

```bash
npx expo install expo@latest   # moved expo to ~57.0.26
npx expo install --fix         # aligned RN/React/router/etc. to SDK 57
npx expo-doctor                # 21/21 checks after the fixes below
```

`expo install --fix` also added the `expo-sqlite` **config plugin** to `app.json`
(required for native modules under SDK 57). Two follow-up fixes were needed:

- **Missing expo-router peers.** `expo-doctor` flagged `expo-constants` and `expo-linking`
  as required peers of `expo-router` that were not installed (strict pnpm does not provide
  unlisted peers). Added both at SDK 57 versions:
  ```bash
  npx expo install expo-constants expo-linking
  ```
- **`@babel/runtime`.** The manifest pinned `^8.0.5`; `babel-preset-expo` peers
  `@babel/runtime@^7.20.0`, and 8.x lacks the `./regenerator` exports subpath, which
  produced a Metro resolution warning. Pinned to `^7.28.0`.
- **TypeScript 6 / `tsconfig.json`.** SDK 57 pulls TypeScript 6, which deprecates
  `baseUrl`. Removed `baseUrl` (the `@/*` path alias resolves relative to the tsconfig
  without it) and added `"types": ["node"]` so the `node:test` / `node:assert` imports in
  `__tests__/` still resolve under TypeScript 6's bundler resolution.

### Verify after upgrading

```bash
pnpm --filter @app/mobile exec expo-doctor   # expect 21/21
just test-mobile                             # expect 65 passing
pnpm --filter @app/mobile check              # tsc, expect 0 errors
pnpm --filter @app/mobile build:web          # Metro web export, expect all routes
```

All four passed on SDK 57. Metro resolves the pnpm workspace correctly thanks to
`apps/mobile/metro.config.js` (it sets `watchFolders` to the repo root and
`nodeModulesPaths` for the hoisted store); no extra Metro changes were needed for the
upgrade.

## What failed and why

| # | Symptom (verified) | Root cause | Fix / outcome |
| --- | --- | --- | --- |
| 1 | On **SDK 51**, app bundled and rendered the home screen for ~4 s, then crashed to the launcher. `adb logcat` showed `java.lang.IllegalStateException: Unable to attach a rootView to ReactInstance when UIManager is not properly initialized` and `Exception in HostObject::get for prop 'UIManager'`. | Expo Go SDK 51's React Native runtime failed to initialize `UIManager` for this app (New-Architecture init failure in the Expo Go client). A real native crash, not a layout bug — the home screen itself used only `View`/`Text`/`Pressable`. | Not fixable by app code or device settings on SDK 51. **Upgrading to SDK 57 resolved it**: the app now logs `Running "main" ... "fabric":true` and stays open. |
| 2 | After `expo install --fix`, `expo-doctor` failed one check: missing peer deps. | `expo-router` requires `expo-constants` and `expo-linking` as peers; strict pnpm did not install them because they were not listed in `apps/mobile/package.json`. | Added both at SDK 57 versions. `expo-doctor` → 21/21. |
| 3 | Metro warning: `@babel/runtime .../regenerator` not in `exports`. | `@babel/runtime` was pinned to `^8.0.5`; the preset peers `^7.20.0`, and 8.x removed/changed the `./regenerator` subpath. | Pinned `@babel/runtime` to `^7.28.0`. Warning gone. |
| 4 | `pnpm --filter @app/mobile check` failed under TypeScript 6: `baseUrl` deprecated, then `node:test` not found. | TypeScript 6 (pulled by SDK 57) deprecates `baseUrl`; removing it changed type resolution so `@types/node` was no longer implicitly included. | Removed `baseUrl`, added `"types": ["node"]`. `tsc` clean. |

## Known device quirks (MIUI / HyperOS)

On the Redmi test device (HyperOS 2.0 / MIUI), aggressive background management can
force-stop a foregrounded Expo Go on the first transient error. This did **not** cause the
SDK 51 crash (that was the native `UIManager` crash above), and on SDK 57 the app is
stable regardless. If you see Expo Go getting killed quickly on a Xiaomi device, in
**Settings → Apps → Expo Go**:

- Turn **off** "Pause app activity if unused".
- Set **Power / Battery saver** to **No restrictions**.

These are device-side settings, not project changes.

## Not verified / out of scope

- **iOS**: not tested in this spike.
- **Dev build** (`npx expo run:android`): not needed and not run, since Expo Go worked
  after the upgrade. A dev build is still what you'd need for real Nearby-Connections P2P.
- **`npx expo run:android` / EAS cloud builds**: not run (local-only spike, no account).
- **`apps/patient` web build is broken on `master`** (pre-existing, unrelated to this
  upgrade): `expo export --platform web` there fails with
  `Cannot find module 'metro/src/lib/TerminalReporter'`. Reproduced on a clean checkout of
  `master` before any changes here. Track and fix separately; this spike did not touch
  `apps/patient`.
