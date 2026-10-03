# Nearby Connections — compatibility spike (#20)

Compatibility findings and the manual two-device test for the offline device-to-device
transport. The transport is abstracted behind
[`TransportAdapter`](../../apps/android/core/src/main/kotlin/org/phasmaframe/core/transport/TransportAdapter.kt)
(in `:core`); the Google Nearby Connections implementation
([`NearbyTransport`](../../apps/android/app/src/main/kotlin/org/phasmaframe/app/transport/NearbyTransport.kt))
lives in `:app`. Protobuf (#18) is the **payload**, not the transport — the adapter moves
opaque `ByteArray`.

> Status: desk research + API review. **Not validated on hardware** in this environment
> (no Android SDK, no devices). The checklist below is what a human must confirm on real
> target devices.

## API 23 (Android 6) compatibility

- Google Nearby Connections (`com.google.android.gms:play-services-nearby`) supports
  **Android API 16+**, so **API 23 is supported**. `minSdk` is 23.
- On API ≤ 30, Nearby's P2P strategies require **location to be turned on** (not just the
  permission granted) for BLE/Wi-Fi scanning. The app must prompt the user to enable
  location services, even though the app itself does not use location.

## Google Play services availability

- Nearby Connections is part of **Google Play services**, which must be present and
  up to date on both devices. Many low-end/"Android Go" and most non-GMS devices
  (e.g. some budget or China-market phones) **may lack Play services**.
- The app should call `GoogleApiAvailability.isGooglePlayServicesAvailable()` at startup
  of a transfer and show a clear message if it is missing, pointing to the fallback.
- **Fallback decision (if Play services is unviable on target devices):** because the
  payload is a self-contained Protobuf bundle and the transport is behind an interface,
  a non-Nearby `TransportAdapter` (e.g. QR-chunked display/scan, or Wi-Fi Direct sockets,
  or exported-file + manual copy) can be added **without touching** the codec, repository,
  import, or UI. This is the reason the adapter is decoupled from the payload.

## Permission behavior by OS version

| API level | Permissions needed for Nearby P2P |
| --------- | --------------------------------- |
| 23–28     | `ACCESS_COARSE_LOCATION` (+ location **on**), Bluetooth, Wi-Fi state |
| 29–30     | `ACCESS_FINE_LOCATION` (+ location **on**), Bluetooth, Wi-Fi state |
| 31+       | `BLUETOOTH_ADVERTISE`, `BLUETOOTH_CONNECT`, `BLUETOOTH_SCAN` (runtime), Wi-Fi state |
| 32+       | may use `NEARBY_WIFI_DEVICES` (with `neverForLocation`) instead of fine location for Wi-Fi |

The manifest declares this full set (with `maxSdkVersion` on the legacy Bluetooth
permissions). The app must still request the **runtime** permissions appropriate to the
device's API level before advertising/discovering, and handle denial gracefully (show
retry/cancel; never crash).

## Manual two-device test (human, required)

Prerequisites: two physical Android devices (API 23+) **with Google Play services**, both
with Bluetooth + Wi-Fi on and (API ≤ 30) location on. Build/install:

```bash
just android-build      # assembles the debug APK (needs the Android SDK)
# install the APK on both devices (adb install, or Android Studio Run)
```

Steps:
1. Device A (patient): record at least one reading offline, then **Send** → advertise.
2. Device B (BHW): open **Receive** → discover → confirm Device A appears.
3. Verify the **verification token/digits** match on both screens; confirm.
4. Device B sees the **preview** (patient + entry count), confirms import.
5. Device B shows the **import receipt** with imported/skipped counts.
6. Repeat the transfer: confirm the second import reports everything **skipped** (no
   duplicates), and that an interrupted transfer leaves both devices' data unchanged.
7. Turn off Wi-Fi/mobile data entirely and confirm the whole flow still works (offline).

Record results (device models, OS versions, Play services versions, pass/fail) back in
this doc.
