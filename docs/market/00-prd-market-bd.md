# PRD — Market Research / Business Development

> Source issue: **PHASM-7** (trunk). Milestone: MVP.
> Covers market evidence, target audience, value proposition, MVP priorities, and the
> competition narrative for the offline hypertension follow-up app.

This is a working product-requirements and market document for a hackathon MVP. Treat all
market claims as **provisional**: they are grounded in the team's case context and a
Quick-generated research synthesis, not in validated user interviews or verified
population statistics. Unknowns are marked explicitly throughout.

## 1. Product in one line

For people with hypertension in far-flung, low-connectivity communities, the app lets a
patient or caregiver record blood-pressure readings offline and **manually transfer one
patient's history** to a barangay health worker (BHW) phone or tablet, so the BHW can
review the record and prepare an RHU/YAKAP-ready summary without live internet.

## 2. Current MVP scope

In scope:

- Patient/caregiver records blood-pressure readings offline.
- Manual, user-initiated transfer of **one** patient record, device to device, with
  explicit confirmation on the receiving device.
- BHW reviews imported history, adds visit readings or notes.
- BHW views a concise RHU/YAKAP-ready patient summary.

Out of scope for the MVP (revisit only after the handoff demo is stable):

- Automatic or background sync; multi-record or bulk replication; automatic merging.
- Direct BHW-to-RHU digital transfer.
- QR registry as the core exchange mechanism.
- Mental-health screening, multiple-condition screening, predictive medicine need,
  end-to-end referral tracking.
- Measuring blood pressure, diagnosis, prescribing, medicine procurement.

## 3. Users, beneficiaries, implementers, buyer

These roles are kept separate on purpose. See
[`04-target-audience.md`](./04-target-audience.md) for detail.

| Role | Who | Status |
| --- | --- | --- |
| Primary user / implementer | BHW visiting hypertension patients | Working hypothesis |
| Record contributor | Patient or caregiver recording readings | Working hypothesis |
| Beneficiary | Patient whose history becomes reviewable | Working hypothesis |
| Next care destination | RHU / YAKAP clinic | Direction, not an MVP integration |
| Likely buyer / payer | LGU, municipal/city health office, or program partner | **Unvalidated** |

## 4. Evidence approach (Carlos Dela Torre matrix + 5 Whys)

The problem and opportunity analysis applies the five-part matrix (Real, Large,
Significant, Relevant, Urgent) and a 5 Whys chain. See
[`01-problem-market-opportunity.md`](./01-problem-market-opportunity.md). The evidence
state is explicitly separated into: firsthand/anecdotal signals, desk research, verified
evidence, assumptions, and open questions. No unverified statistic is used as fact.

## 5. Value proposition and pitch

The value proposition and competition narrative, including the two-minute demo script,
are in [`02-product-value-pitch.md`](./02-product-value-pitch.md) and
[`03-value-proposition-messaging.md`](./03-value-proposition-messaging.md).

Pitch boundary: the working **offline handoff** is the main demo. The RHU-ready summary
is framed as the next care step; direct RHU device transfer is future work. Do not claim
reduced strokes, improved outcomes, full interoperability, medicine availability, or
adoption without supporting evidence.

## 6. Required technologies

Kiro and Amazon Quick are required. Show **concrete** use in the project workflow (e.g.,
Kiro for spec/implementation work, Quick for research synthesis). Do not add an AI feature
solely to satisfy the tool requirement.

## 7. Document set

| File | Source issue | Status in Linear |
| --- | --- | --- |
| [`01-problem-market-opportunity.md`](./01-problem-market-opportunity.md) | PHASM-11 | Todo |
| [`02-product-value-pitch.md`](./02-product-value-pitch.md) | PHASM-12 | In Progress |
| [`03-value-proposition-messaging.md`](./03-value-proposition-messaging.md) | PHASM-17 | Done |
| [`04-target-audience.md`](./04-target-audience.md) | PHASM-15 | Done |
| [`05-market-validation-sizing.md`](./05-market-validation-sizing.md) | PHASM-16 | Todo |

## References

- Solution brief: *BHW Chronic-Care Continuity — Problem Definition*
  (Google Doc, team-held).
- Carlos Dela Torre's Winning Hackathon Manual (problem matrix + 5 Whys).
- Competition guidelines: Build Over Nights — Kiro x Quick Hackathon.
