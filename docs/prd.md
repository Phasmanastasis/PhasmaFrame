# Offline Hypertension Follow-Up — PRD

> Frozen product-requirements document for the hackathon MVP. Companion to
> [`sdd.md`](./sdd.md) and [`solution-brief.md`](./solution-brief.md).

## Problem

- **Problem:** People with hypertension in far-flung or low-connectivity communities can
  have difficulty keeping blood-pressure history available to a BHW during follow-up.
- **Solution:** An offline Android app lets a patient or caregiver record readings, then
  manually transfer one patient's record to a BHW phone or tablet. The BHW reviews the
  record and prepares an RHU/YAKAP-ready summary.
- **Value:** The handoff works without live internet and gives the BHW a dated history to
  review. It does not promise clinical outcomes or medicine availability.
- **Evidence:** Team case notes and a Quick research synthesis are discovery signals.
  Market size, workflow frequency, and user demand remain unvalidated.

## Measures of success

The demo passes when:

1. A reading saves offline and remains after app restart.
2. The sender starts a one-patient transfer and the receiver explicitly accepts.
3. The BHW device shows the imported values, time, measurer, and recorder.
4. A repeated transfer does not duplicate readings.
5. The BHW can add a visit note and view the RHU-ready summary.
6. The flow completes without internet.

**Target constraints:** Android 6+ devices; app storage ≤ 512 MB on low-end devices with
up to 32 GB storage. Confirm transfer-library compatibility before implementation.

## Scope / features

**In scope:** offline patient record; blood-pressure entry (systolic, diastolic, time, who
measured, who entered; optional note); manual patient/caregiver-to-BHW transfer; BHW
review, visit note, and RHU-ready summary.

**Out of scope:** automatic/background sync; BHW-to-RHU digital transfer; SMS/USSD;
diagnosis, treatment advice, medicine prediction or procurement; app-based measurement;
mental-health screening or extra conditions.

**Assumptions:** readings come from external equipment. The app records who measured and
who entered the reading; it does not control cuff access. Demo data is synthetic.

## User stories

**Patient / caregiver** — As someone managing hypertension, I want to save a measured
reading offline and send my record to a BHW device during a visit, so the BHW can review
my history without needing internet.

- *Acceptance:* I can enter systolic and diastolic values, measurement time, measurer,
  recorder, and an optional note; I can select one record to send; I see whether the
  transfer completed or needs retry.

**BHW** — As a BHW, I want to receive and review the patient's dated readings, add my visit
note, and open a concise summary, so I can support the next RHU/YAKAP visit.

- *Acceptance:* I see the patient identifier and entry count before import; I confirm
  import; duplicates are skipped and existing readings are not overwritten; interrupted or
  invalid imports do not partially change the record.
