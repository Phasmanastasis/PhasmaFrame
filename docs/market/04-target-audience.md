# Target Audience Identification

> Source issue: **PHASM-15**. Parent: PHASM-11. Milestone: MVP. Status: Done.

Roles are kept separate so the buyer is never conflated with the user or beneficiary.

## Primary user / implementer

Barangay health workers (BHWs) who visit or support hypertension patients in far-flung or
low-connectivity communities and can access an Android phone or tablet.

## Beneficiary and record contributor

The patient or caregiver who can record measured blood-pressure readings offline on a
compatible Android device and manually transfer the patient's record to the BHW device.

## Next care destination

The local RHU/YAKAP clinic. The MVP lets the BHW **export the summary as CSV** (for Excel)
and provide it to the RHU through the **existing process**. There is **no** direct digital
BHW-to-RHU transfer.

## Buyer / payer hypothesis

Likely an LGU, municipal/city health office, or health-program partner. **This is
unvalidated.** Hospitals and medical professionals are potential outreach/referral
partners, not the MVP buyer assumption.

## Constraints and exclusions

- Android 6+, low-end or shared devices.
- Weak or absent internet.
- App-storage target ≤ 512 MB (device storage up to 32 GB).
- No SMS or USSD.
- The core manual transfer requires access to **two** compatible devices at the handoff.
- The app does not supply measurement equipment or guarantee household cuff access.

## Pain points to validate (hypotheses, not interview findings)

- Patient readings may be scattered across paper or multiple devices.
- A BHW may lack recent history during a visit.
- Connectivity may prevent live retrieval.

## Done criteria (met)

The MVP segment, the user/beneficiary/implementer distinction, the buyer hypothesis, the
device constraints, and the exclusions are all explicit. **Still open:** validate the
buyer and the workflow with BHW/RHU users.

## Related

- Problem grounding: [`01-problem-market-opportunity.md`](./01-problem-market-opportunity.md) (PHASM-11).
- Sizing method: [`05-market-validation-sizing.md`](./05-market-validation-sizing.md) (PHASM-16).
