# Product Value & Pitch Strategy

> Source issue: **PHASM-12**. Parent: PHASM-7. Milestone: MVP.

Turns the current problem framing and available evidence into a concise value proposition
and competition story. Market claims remain **provisional** until user interviews or
source verification are completed.

## Lead message

User-initiated **offline transfer** of a patient's blood-pressure history from a
patient/caregiver device to a BHW phone or tablet. The BHW reviews the summary and can
**export it as CSV** (for Excel) to provide to the RHU through the existing process.

## Pitch boundary

- Direct BHW-to-RHU digital transfer is **future work**, not an MVP claim.
- Do **not** claim reduced strokes, improved outcomes, complete interoperability, medicine
  availability, or adoption without supporting evidence.

## Two-minute demo narrative

Use **synthetic** records only (a local patient label and a generated ID, never a national
ID). Keep the **Send/Receive** controls visible on screen.

1. **Record** a blood-pressure reading offline: systolic, diastolic, time, who measured,
   who entered (measurer and enterer may differ); optional note; optional heart rate.
2. **Transfer** one patient record device-to-device and **confirm the import** on the BHW
   device.
3. **Review** the imported history and add a BHW visit note or reading.
4. **Export** the summary as **CSV** (for Excel) to hand to the RHU through the existing
   process.

Briefly explain **Protobuf** as the record data format and the chosen Android **transport**
as an implementation detail — Protobuf is the format, not the channel. **Nearby
Connections** is the candidate transport; its compatibility with the team's actual devices
and app stack still needs testing.

## Why it should win on the rubric

Evaluation weights (from the competition guidelines): MVP stability 30%, problem/domain
fit 25%, technology/automation judgment 25%, innovation 15%, pitch delivery 5%.

- **Stability (30%)** — The demo is a deterministic, single-record manual handoff. No
  background sync, no automatic merge, no network dependency during the demo.
- **Problem/domain fit (25%)** — Targets a concrete Philippine community-care workflow:
  BHW follow-up for hypertension in low-connectivity areas.
- **Technology/automation judgment (25%)** — Scope is cut aggressively; the transport is a
  simple, device-appropriate Android choice (**Nearby Connections** candidate, pending
  device/stack compatibility testing); Protobuf gives a compact, deterministic record
  format within the storage target.
- **Innovation (15%)** — The offline patient-to-BHW handoff is the differentiator.
- **Pitch (5%)** — The four-step narrative maps directly to the live demo.

## Required-technology story

Show concrete Kiro and Amazon Quick use in the project workflow:

- **Kiro** — spec/PRD/SDD authoring and implementation assistance (this document set is an
  example artifact).
- **Amazon Quick** — research synthesis that informed the problem framing (treated as
  background, not validated evidence).

Do not add AI features solely to satisfy the tool requirement.

## Related

- Value proposition sentence: [`03-value-proposition-messaging.md`](./03-value-proposition-messaging.md) (PHASM-17).
- Problem grounding: [`01-problem-market-opportunity.md`](./01-problem-market-opportunity.md) (PHASM-11).
