# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Patients or caregivers record blood pressure and heart rate measured with an external device.
- Barangay health workers review a patient's readings on a phone or tablet.

## Product Purpose

Keep a dated record of patient readings available offline and prepare it for review by a barangay health worker. Success means a patient can record readings and a BHW can review them in a concise history.

## Positioning

The workflow supports a deliberate, one-patient-at-a-time handoff that can work without live internet. This web prototype uses synthetic data and does not transfer records between devices.

## Operating Context

Patients or caregivers record systolic pressure, diastolic pressure, heart rate, measurement time, and who measured the reading. BHWs review records on mobile phones and tablets, add visit context, and prepare an RHU/YAKAP-ready summary.

## Capabilities and Constraints

- Preserve the existing Astro, React, Tailwind, and SQLite-backed API project stack.
- The user prefers SQLite for internal storage, Protocol Buffers for device transfer, and CSV for BHW export.
- The first screen offers a patient/caregiver or BHW role choice; this is the working default because the first-screen preference was unanswered.
- This frontend prototype currently stores synthetic demo data in browser storage. Real device-to-device transfer and its Protobuf payload are not implemented here.
- BHW summaries may be exported as CSV. Do not claim direct RHU transfer.
- Do not add diagnosis or treatment advice, automatic sync, or unsupported product claims.

## Evidence on Hand

- Product requirements and workflow: `docs/prd.md` and `docs/sdd.md`.
- The current BHW prototype is in `apps/web/src/components/HealthHub.tsx`.
- Demo data must remain synthetic; no production patient data or clinical evidence is supplied.

## Product Principles

- Keep reading values, dates, and authorship easy to find.
- Make offline and handoff states explicit in plain language.
- Require people to review and confirm imported records.
- Keep the patient and BHW flows usable on phone and tablet screens.
- Never present readings as a diagnosis or treatment recommendation.

## Accessibility & Inclusion

Use readable type, strong contrast, large touch controls, plain-language instructions, and accessible labels. Older adults are a confirmed audience for the interface.
