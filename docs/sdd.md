# Offline Hypertension Follow-Up — SDD

> Frozen software-design document for the hackathon MVP. Companion to [`prd.md`](./prd.md)
> and [`solution-brief.md`](./solution-brief.md).

## ERD

- **Patient** — local UUID and minimal display label/code; **no national identifier**.
- **BloodPressureReading** — reading UUID, patient UUID, systolic, diastolic, measuredAt,
  measuredBy, enteredAt, enteredBy, optional note.
- **VisitNote** — note UUID, patient UUID, author, createdAt, text.
- **TransferBundle** — bundle UUID, schema version, patient UUID, readings, visit notes,
  createdAt.

**Relationships:** one Patient has many readings and notes; one TransferBundle contains
one Patient's selected history. Stable reading/note IDs support duplicate detection.
Imports **append new IDs only** after explicit review; they never overwrite existing
entries.

## Architecture

Single Android app with patient/caregiver and BHW workflows; offline local storage
(Room/SQLite for a greenfield Kotlin app); repository/use-case layer; Protobuf
encoder/decoder; peer-to-peer transport adapter. **Keep the current Kiro project stack if
it already exists; do not replatform.**

## Transport

Evaluate **Google Nearby Connections** for offline device-to-device transfer. Protobuf is
the **payload format, not the transport**. Verify **API 23** compatibility, Google Play
services availability, and Android permission behavior before committing.

Official references:

- Nearby Connections overview — <https://developers.google.com/nearby/connections/overview>
- Protocol Buffers overview — <https://protobuf.dev/overview/>

## User flows

**Record reading:** open patient record → enter systolic/diastolic values and measurement
time → identify measurer and recorder → add optional note → save locally → confirm it
appears in dated history while offline.

**Manual transfer:** sender selects one patient and taps **Send** → receiver opens
**Receive** → nearby devices are discovered → both users verify the displayed
patient/device and confirm → sender transmits the Protobuf bundle → receiver validates
schema and preview → BHW confirms import → app commits **atomically** and shows counts.

**Failure handling:** if discovery, connection, validation, or import fails, keep both
devices' existing data unchanged and show retry/cancel. If a bundle or entry ID was
already imported, report it and skip duplicates. Reject unknown schema versions.

## User story

As a BHW, I want to receive a patient's record from a nearby patient/caregiver device
without internet, so I can review its history during a visit.

**System acceptance:** transfer is user-initiated; receiver confirms before import; one
patient bundle is handled at a time; readings retain values, units, timestamps, measurer,
and recorder; import is atomic and repeat-safe; no background sync or cloud service is
used.

## User journey

At home, a patient or caregiver records measured readings on an Android phone. During a
BHW visit, they initiate a nearby transfer. The BHW reviews the imported history, adds a
visit note, and opens an RHU/YAKAP-ready summary. Direct digital transfer to the RHU is
future work.

## Site map

Home / role choice → Patient list → Patient summary and history → Add reading or visit note
→ Send record or Receive record → Transfer review and confirmation → Import receipt. The
RHU-ready summary is available from Patient summary.
