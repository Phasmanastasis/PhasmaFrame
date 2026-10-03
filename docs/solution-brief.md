# Offline Hypertension Follow-Up — MVP Solution Brief

> Companion to [`prd.md`](./prd.md) and [`sdd.md`](./sdd.md).

**Decision:** Build a patient/caregiver-to-BHW manual transfer workflow that works offline.
Prepare an RHU-ready summary, but leave BHW-to-RHU digital transfer outside the MVP.

## Problem and goal

People with hypertension in far-flung or low-connectivity communities may have difficulty
maintaining a usable record between home and barangay health worker visits. BHWs need a
simple way to review recorded readings and continue follow-up, even when devices have no
internet.

The MVP tests whether user-initiated, phone-to-phone or phone-to-tablet transfer can make
that handoff practical.

## Users and roles

- **Patient or caregiver:** records measured blood-pressure readings and basic status
  information on an Android device, including while offline.
- **Barangay health worker (BHW):** receives the patient's record on a phone or tablet,
  reviews its history, and adds readings or visit notes with their source and time.
- **RHU/YAKAP clinic:** intended next care destination. The BHW can prepare a concise
  summary for review there; digital transfer to the RHU is not part of this MVP.

## Core workflow

1. Patient or caregiver records a blood-pressure reading offline. The entry records the
   value, unit, date/time, and who measured or entered it.
2. During a visit, the patient/caregiver starts a manual transfer to the BHW's phone or
   tablet and confirms the receiving device.
3. The BHW reviews the transferred history, then adds any visit reading or note. The app
   keeps patient-entered and BHW-entered information distinguishable.
4. The BHW reviews a concise patient summary that can support the next RHU/YAKAP visit.

## Offline transfer and data handling

Transfer is manual and user-initiated. The app does not sync in the background and does not
require internet for the handoff.

Protocol Buffers (Protobuf) is the proposed structured record format; it does not provide
the transfer channel. The Android transport remains an implementation choice. A local
peer-to-peer option such as Nearby Connections may be evaluated, subject to Android
compatibility, permissions, and available development time.

Transfer one patient's selected record at a time. Show the receiving device and ask the
user to confirm before import. Avoid automatic merging or background replication in the
MVP.

## Scope boundaries

**In scope:** offline entry and viewing; patient/caregiver-to-BHW manual transfer; source-
and time-labeled readings; BHW review and visit notes; an RHU-ready patient summary.

**Out of scope:** automatic sync; BHW-to-RHU digital transfer; predicting future medicine
needs; diagnosis or treatment recommendations; measuring blood pressure through the app;
medication supply or procurement; SMS/USSD.

The app records readings from external equipment. The team does not control who operates a
cuff or whether a household has one. The record should identify who measured and who
entered the reading when those are different.

## Constraints and demo checks

Target low-cost Android devices running Android 6 or later, with unreliable connectivity
and a stated app-storage ceiling of 512 MB on devices with up to 32 GB storage. Verify the
chosen transfer library against this minimum before committing.

**Demo checks:** create readings offline; transfer one patient's record between two devices
after an explicit confirmation; show the same readings and their source/time on the BHW
device; add a BHW visit note; display the RHU-ready summary.

## Pitch rationale

Lead with the working offline handoff for chronic-care follow-up. It directly addresses a
community workflow and demonstrates a deliberate, reliable transfer choice. Explain the RHU
summary as the next handoff step, while positioning direct RHU device transfer as future
work if the MVP is stable.

Use Kiro and Amazon Quick in the project workflow as required by the competition. Show
concrete evidence of how each was used; do not add an unnecessary AI feature to the patient
app.
