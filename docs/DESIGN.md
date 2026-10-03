# Kasigla Brand Specifications

**Edition:** 01  
**Year:** 2025  
**Brand promise:** Reliable, continuous healthcare regardless of location.  
**Core line:** A calm path to trusted care, wherever home may be.

---

## 1. Brand Foundation

Kasigla is a patient-first healthcare identity designed for communities across the Philippines, including provinces, villages, and areas with limited connectivity.

The name combines:

- **Kalinga:** care, protection, and attentive support
- **Sigla:** vitality, energy, and renewed strength

### Brand attributes

1. **Warm** — patient and reassuring without appearing childish
2. **Reliable** — steady, legible, and structurally grounded
3. **Accessible** — understandable across language, location, and device quality
4. **Connected** — care continues across physical and digital distance
5. **Community-oriented** — designed around shared access rather than institutional authority

### Visual principles

- Prefer organic curves over sharp clinical geometry.
- Use strong silhouettes that remain recognizable at small sizes.
- Communicate healthcare through care, access, connection, and trust—not generic medical symbols.
- Avoid using crosses, pills, stethoscopes, or mascots as brand decoration.
- Keep layouts calm, spacious, and easy to scan.
- Use Dawn Gold sparingly as a focal signal rather than a dominant brand color.

---

## 2. Logo System

### Primary mark

The Kasigla mark is a rounded-square app icon containing a stylized **K**.

- The vertical stem establishes stability and continuous access.
- The two curved petals form the arms of the K.
- The petals suggest care, growth, vitality, and a heart-like gesture without becoming a generic heart symbol.
- The upper and lower petals spread from one shared junction to preserve the K silhouette.

### Wordmark

The wordmark uses a heavy, rounded **Nunito** construction.

- Use title case: **Kasigla**
- Preserve the compact letter spacing.
- The optional Dawn Gold dot represents the warmth and vitality of *sigla*.

### Clear space

Maintain clear space around the logo equal to at least **25% of the icon width**.

For a 120-unit mark:

- Minimum clear space: 30 units on all sides
- Do not allow text, photography, borders, or other marks to enter this area

### Minimum sizes

| Use | Minimum size |
| --- | ---: |
| Browser favicon | 16 × 16 px |
| Compact UI icon | 24 × 24 px |
| Standard app/UI mark | 32 × 32 px |
| Print mark | 10 mm wide |
| Logo with wordmark | 120 px wide |

At 16–24 px:

- Use the icon without the wordmark.
- Avoid adding shadows, outlines, or secondary details.
- Confirm that the K remains visually distinct from the background.

### Approved backgrounds

- Deep Sea Teal
- Deep Abyss Teal
- Night Tide Teal
- Pure White
- Surface Tint
- Mint Subtle

On dark backgrounds, use the light/mint logo treatment.  
On light backgrounds, use the Deep Sea Teal wordmark.

### Do not

- Stretch, skew, rotate, or crop the logo.
- Separate the two petals from their shared base.
- Replace the approved colors with unrelated hues.
- add gradients that reduce small-size clarity.
- Add medical crosses, shields, pills, or other symbols to the mark.
- Place the mark over visually noisy photography without a solid or sufficiently dark overlay.

### Export

The brand kit exports the standalone logo as:

- **Format:** PNG
- **Dimensions:** 2048 × 2048 px
- **Filename:** `kasigla-logo.png`
- **Contents:** Logo only; no presentation frame or wordmark

---

## 3. Color Palette

### Foundational darks

Used for app-icon backgrounds, navigation, dark containers, headings, body text, and high-contrast surfaces.

| Token | Name | Hex | Primary uses |
| --- | --- | --- | --- |
| `--color-deep-abyss` | Deep Abyss Teal | `#021C22` | Deepest backgrounds, vignettes, shadows |
| `--color-deep-teal` | Deep Sea Teal | `#04323A` | Brand primary, logo field, headings |
| `--color-night-tide` | Night Tide Teal | `#084E5B` | Secondary dark surfaces, subtitles |
| `--color-dark-pine` | Dark Pine Teal | `#0F766E` | Badges, supporting text, dark accents |

### Care and identity colors

Used for icon strokes, buttons, interactions, active states, and core brand accents.

| Token | Name | Hex | Primary uses |
| --- | --- | --- | --- |
| `--color-kelp` | Deep Kelp | `#0D9488` | Stroke shading, links, active navigation |
| `--color-teal` | Kasigla Teal | `#14B8A6` | Primary actions, care strokes |

### Radiant mint and outreach

Used for vitality, highlights, active gestures, and uplifting details.

| Token | Name | Hex | Primary uses |
| --- | --- | --- | --- |
| `--color-mint-glow` | Glowing Mint | `#2DD4BF` | Upper K petal, active highlights |
| `--color-seafoam` | Bright Seafoam | `#5EEAD4` | Bright edges, outreach accents |
| `--color-mint-light` | Soft Pale Mint | `#99F6E4` | Tags, secondary glow, soft accents |

### Surfaces and washes

Used for cards, page backgrounds, dividers, quiet containers, and large light areas.

| Token | Name | Hex | Primary uses |
| --- | --- | --- | --- |
| `--color-foam-wash` | Tinted Foam Mint | `#CCFBF1` | Pills, gentle highlights |
| `--color-mint-subtle` | Mint Subtle | `#E2F4F0` | Card fills, logo stem, soft panels |
| `--color-surface` | Surface Tint | `#F2FAF8` | Main page canvas |
| `--color-pure-white` | Crisp Canvas White | `#FFFFFF` | Crisp cards and content surfaces |

### Warm accent

| Token | Name | Hex | Primary uses |
| --- | --- | --- | --- |
| `--color-dawn-gold` | Golden Dawn | `#FBBF24` | Focal dots, attention, hope, vitality |
| — | Sunlight Yellow Tint | `#FDE047` | Rare highlight and radiant edge |

### Recommended color ratio

- **55% foundational dark or neutral**
- **25% teal/mint identity colors**
- **15% light surfaces**
- **5% Dawn Gold**

Dawn Gold should identify one important focal point. Do not use it as a large background or routine decorative color.

### CSS tokens

```css
:root {
  --color-deep-abyss:  #021C22;
  --color-deep-teal:   #04323A;
  --color-night-tide:  #084E5B;
  --color-dark-pine:   #0F766E;

  --color-kelp:        #0D9488;
  --color-teal:        #14B8A6;

  --color-mint-glow:   #2DD4BF;
  --color-seafoam:     #5EEAD4;
  --color-mint-light:  #99F6E4;

  --color-foam-wash:   #CCFBF1;
  --color-mint-subtle: #E2F4F0;
  --color-surface:     #F2FAF8;
  --color-pure-white:  #FFFFFF;

  --color-dawn-gold:   #FBBF24;
}
```

---

## 4. Typography

### Heading family

**Manrope**

- Recommended weights: 700 and 800
- Use for campaign headlines, page titles, and major section headings
- Character: confident, contemporary, and highly legible
- Web-safe fallback: `Arial, Helvetica, sans-serif`

```css
font-family: "Manrope", Arial, Helvetica, sans-serif;
```

### Subheading and UI family

**Nunito**

- Recommended weights: 600, 700, and 800
- Use for navigation, buttons, labels, card titles, and short patient-facing messages
- Character: warm, rounded, and approachable
- Web-safe fallback: `"Trebuchet MS", Arial, sans-serif`

```css
font-family: "Nunito", "Trebuchet MS", Arial, sans-serif;
```

### Body family

**Atkinson Hyperlegible**

- Recommended weights: 400 and 700
- Use for instructions, notifications, forms, explanatory copy, and long-form information
- Character: accessible and distinguishable at small sizes
- Web-safe fallback: `Verdana, Arial, sans-serif`

```css
font-family: "Atkinson Hyperlegible", Verdana, Arial, sans-serif;
```

### Recommended type scale

| Style | Size / line height | Weight | Use |
| --- | --- | ---: | --- |
| Display | 64 / 68 px | 800 | Major campaign messages |
| H1 | 44 / 50 px | 800 | Page titles |
| H2 | 32 / 38 px | 700–800 | Major sections |
| H3 | 22 / 28 px | 600–700 | Cards and subsections |
| Body | 16 / 25 px | 400 | Standard reading |
| Body small | 14 / 21 px | 400 | Secondary information |
| Caption | 12 / 18 px | 600–700 | Labels and metadata |

### Typography rules

- Use sentence case for headings and controls.
- Avoid full paragraphs in uppercase.
- Use uppercase only for brief labels with increased letter spacing.
- Keep body text at 16 px whenever practical.
- Do not use body text smaller than 14 px in patient-facing UI.
- Keep paragraphs between approximately 45 and 75 characters per line.
- Prefer direct Tagalog or plain English over technical healthcare language.

### Use-case examples

**Campaign headline**

> Care reaches every place.

**Patient-facing UI heading**

> Kumusta ang pakiramdam mo?

**Body message**

> Your care request has been received. We will send an update even when your connection is limited.

**Tagalog support message**

> Ang iyong request ay natanggap na. Magpapadala kami ng update sa lalong madaling panahon.

---

## 5. Iconography

### Primary library

**Lucide Icons**

- Use rounded outline icons.
- Standard icon canvas: 24 × 24 px
- Standard stroke: 1.75–2 px
- Use round line caps and joins.
- Default color: Deep Sea Teal
- Active color: Deep Kelp or Kasigla Teal
- Attention color: Dawn Gold

### Approved fallback

**Material Symbols Rounded**

Use the Rounded family and match the visual weight of adjacent Lucide icons.

Do not mix icon families within the same navigation bar, toolbar, or card group.

### Recommended concepts

- Home
- Community
- Location
- Schedule
- Message
- Offline availability
- Trusted or verified state
- Route or journey
- Notifications

### Usage guidelines

1. Pair unfamiliar icons with visible text labels.
2. Use one icon style and stroke weight per interface.
3. Keep a minimum 44 × 44 px touch target around interactive icons.
4. Use icons to clarify actions, not as decoration.
5. Use filled icons only for selected navigation states.
6. Avoid crosses, pills, syringes, and stethoscopes as general brand decoration.
7. Do not communicate warnings or status through color alone.

---

## 6. Photography

### Direction

Photography should feel observational, respectful, and locally grounded.

Prioritize:

- Real communities and shared everyday activity
- Provincial, rural, coastal, and agricultural environments
- Natural daylight
- Genuine interaction rather than staged clinical poses
- Wide environmental context that communicates distance and place
- Patient dignity and personal agency

Avoid:

- Images that portray communities as helpless
- Tokenistic or overly staged healthcare scenes
- Excessively sterile hospitals unless the specific content requires one
- Dramatic medical imagery
- Images where text would cover a person’s face

### Image treatment

- Use a Deep Sea or Deep Abyss overlay at 60–75% for text-heavy campaign layouts.
- Keep skin tones natural.
- Use mint as a supporting wash, not a heavy color cast.
- Maintain sufficient text contrast.
- Crop with room for headlines and calls to action.
- Add descriptive alternative text in digital products.

### Example sources

The brand-kit examples use photography from Unsplash:

- Bernd Dittrich — rural community activity
- Omri D. Cohen — rice fields and mountain landscape

Production projects must confirm the applicable image license and retain required attribution.

---

## 7. Layout and Shape Language

### Core geometry

- Rounded containers: 16–30 px radius
- Compact UI cards: 10–16 px radius
- Pills and tags: fully rounded
- Organic contour lines: thin and low contrast
- Icon containers: rounded squares

### Spacing

Use a 4 px base grid.

Recommended spacing steps:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80`

### Borders and shadows

- Use subtle teal borders at approximately 8–14% opacity.
- Prefer borders and surface contrast over large shadows.
- Use soft shadows only for floating navigation, app icons, phones, and other elevated objects.
- Do not use harsh black shadows.

### Motion

- Standard transitions: 160–220 ms
- Use gentle opacity and vertical movement.
- Avoid bouncing, flashing, or distracting health-related motion.
- Respect `prefers-reduced-motion`.

---

## 8. Voice and Messaging

### Voice

Kasigla speaks with calm confidence. Copy should feel like guidance from a trusted community partner.

Use language that is:

- Direct
- Patient
- Encouraging
- Respectful
- Actionable
- Easy to translate

Avoid:

- Technical jargon
- Alarmist health language
- Institutional or bureaucratic phrasing
- Promises the service cannot guarantee
- Infantilizing language

### Example messages

**Brand line**

> A calm path to trusted care, wherever home may be.

**Tagalog campaign**

> Maaasahang kalinga, nasaan ka man.

**Community line**

> Kalinga sa bawat sulok ng bayan.

**Offline reassurance**

> Handa kahit offline. Ipapadala kapag may signal na.

**Action label**

> Humingi ng tulong

---

## 9. Application Guidance

### Social media

- Use a strong environmental photo or a simple Deep Sea background.
- Keep the logo in a protected corner with adequate clear space.
- Limit each post to one headline and one action.
- Use mint for category labels and Dawn Gold for a single focal detail.
- Recommended format: 1080 × 1080 px.

### Campaign banners and ads

- Apply a 60–75% dark teal photo overlay behind white text.
- Keep headlines short enough to read at a distance.
- Keep calls to action visible but secondary to the message.
- Place the logo away from faces and high-detail areas.
- Recommended digital formats:
  - 1200 × 628 px
  - 1920 × 1080 px
  - 1080 × 1350 px

### Product UI

- Make the primary action obvious and reachable.
- Include offline and low-connectivity states.
- Use reassuring confirmations after patient actions.
- Prioritize readable text over decorative density.
- Use Tagalog and English according to community context.
- Keep interactive touch targets at least 44 × 44 px.
- Always provide a text label for critical icons.

---

## 10. Product Scope and Navigation Model

> Sections 10-12 extend the brand system with product implementation detail for the
> Offline Hypertension Follow-Up MVP. They are inferred from [`prd.md`](./prd.md) and
> [`sdd.md`](./sdd.md) and are written platform-agnostically: a "screen" is one primary
> view, "navigation" is movement between screens, and a "component" is a reusable UI
> element. Map these to the chosen platform's idioms (web routes/pages or Android
> navigation destinations) during implementation. All visual styling follows the brand
> tokens, type scale, iconography, and layout rules in Sections 1-9.

### Product summary

An offline-first application for two roles that share one device model:

- **Patient / caregiver** records measured blood-pressure readings and sends one
  patient's record to a health worker during an in-person visit.
- **Barangay Health Worker (BHW)** receives and reviews the record, adds a visit note,
  and opens an RHU/YAKAP-ready summary.

All core flows must complete without internet. Transfer is manual, user-initiated,
device-to-device, and handles one patient at a time. Imports are atomic and repeat-safe:
existing data is never overwritten, and duplicate entries are skipped.

### Navigation map

```
Home / role choice
  |- Patient list
  |    `- Patient summary & history
  |         |- Add reading
  |         |- Add visit note
  |         |- RHU-ready summary
  |         `- Send record --> Transfer review & confirmation --> Import receipt
  `- Receive record ---------> Transfer review & confirmation --> Import receipt
```

Both roles share the same navigation. **Send record** starts from a selected patient
(sender side); **Receive record** is reachable from Home (receiver side). Both transfer
paths converge on a shared review/confirmation step and end at an import receipt.

### Core data concepts (from the ERD)

Screens read and write these entities; see [`sdd.md`](./sdd.md) for the authoritative ERD.

- **Patient** - local UUID and a minimal display label/code. No national identifier.
- **BloodPressureReading** - systolic, diastolic, `measuredAt`, `measuredBy`,
  `enteredAt`, `enteredBy`, optional note.
- **VisitNote** - author, `createdAt`, text.
- **TransferBundle** - schema version, one patient, selected readings and notes.

### Cross-cutting UI requirements

Every screen must honor these, consistent with Sections 9 and 13:

- **Offline-first:** no screen may depend on live connectivity except the active transfer
  step. Show a calm offline/low-connectivity indicator rather than blocking errors.
- **Reassurance:** confirm patient actions with gentle, plain-language confirmations
  (Tagalog or English per community context).
- **Touch targets:** interactive elements maintain a minimum 44 x 44 px target.
- **Labels:** icon-only controls always carry a text label (Section 5).
- **Contrast and focus:** WCAG 2.2 AA contrast and visible focus states (Section 13).
- **State coverage:** each screen defines its empty, loading, error, and (where relevant)
  offline states.

---

## 11. Screen Specifications

Each screen below lists its purpose, the data it shows, key components, primary actions,
and states. Styling tokens refer to Sections 3 (color), 4 (typography), 5 (iconography),
and 7 (layout).

### 11.1 Home / role choice

- **Purpose:** entry point; the user chooses the Patient/caregiver path or the BHW path.
- **Content:** app logo and brand line (Section 2); two large role options; a persistent
  offline indicator.
- **Components:** Role card (x2), Offline banner, App header.
- **Primary actions:** choose **Patient / caregiver** -> Patient list; choose **BHW** with
  a quick entry to **Receive record**.
- **States:** default only. No network required.
- **Styling:** Deep Sea Teal field acceptable for the brand area; role cards use light
  surfaces (Surface Tint / White) with teal borders; headings in Manrope, labels in
  Nunito.

### 11.2 Patient list

- **Purpose:** browse and select a patient to view or send.
- **Content:** list of patients by display label/code; count; search/filter if present;
  action to add a patient.
- **Components:** Patient list item, Search field (optional), Empty-state panel, Primary
  action button ("Add patient").
- **Primary actions:** open a patient -> Patient summary & history; add a patient.
- **States:**
  - *Empty:* reassuring message with a clear "Add patient" action.
  - *Populated:* scannable list; items show label/code and last-reading date if available.
  - *Loading:* lightweight placeholder.
- **Styling:** cards at 10-16 px radius; Atkinson Hyperlegible for list metadata.

### 11.3 Patient summary & history

- **Purpose:** central hub for one patient; dated history and entry points to all patient
  actions.
- **Content:** patient display label/code; chronological list of BloodPressureReadings
  (systolic/diastolic, `measuredAt`, `measuredBy`, `enteredBy`, note indicator); VisitNotes;
  summary header.
- **Components:** Patient header, BP reading card, Visit note card, Section dividers,
  action group (Add reading, Add visit note, Send record, RHU-ready summary).
- **Primary actions:** Add reading; Add visit note; **Send record**; open **RHU-ready
  summary**.
- **States:**
  - *Empty history:* prompt to add the first reading.
  - *Populated:* readings grouped by date, newest first.
  - *Offline:* fully functional; offline indicator visible.
- **Styling:** H3 for the patient name; Body for reading values; Dawn Gold reserved for a
  single focal signal (e.g., an attention state), not routine.

### 11.4 Add reading

- **Purpose:** capture one blood-pressure reading offline.
- **Content / fields:** systolic, diastolic, measurement time (`measuredAt`), who measured
  (`measuredBy`), who entered (`enteredBy`, may default to current user), optional note.
- **Components:** Reading entry form, numeric inputs, date/time picker, person selectors
  for measurer/recorder, optional note field, Save button, Cancel.
- **Primary actions:** Save locally -> return to Patient summary with the new reading
  visible; Cancel discards.
- **States:**
  - *Validation:* systolic/diastolic required and within plausible ranges; measurement
    time required; non-color validation cues (Sections 5 and 13).
  - *Save confirmation:* reassuring confirmation; the reading persists across app restart.
- **Styling:** Atkinson Hyperlegible for inputs and helper text; 4 px spacing grid.

### 11.5 Add visit note

- **Purpose:** BHW records a free-text note for a patient during a visit.
- **Content / fields:** note text, author (`createdAt` set on save).
- **Components:** Visit note form (multiline text), Save, Cancel.
- **Primary actions:** Save -> note appears in Patient summary history; Cancel discards.
- **States:** empty text disables Save; save confirmation on success.
- **Styling:** generous line length (45-75 characters per Section 4).

### 11.6 Send record (sender)

- **Purpose:** sender selects one patient and begins a nearby device transfer.
- **Content:** the selected patient's identity for confirmation; a discovery list of
  nearby receiving devices; transfer status.
- **Components:** Patient confirmation banner, Transfer discovery list (nearby devices),
  Device item, Cancel/Retry controls, status indicator.
- **Primary actions:** pick the receiving device -> proceed to Transfer review &
  confirmation; Cancel.
- **States:**
  - *Discovering:* searching for nearby devices (this step is the only connectivity-
    dependent flow; it uses device-to-device transport, not internet).
  - *No devices found:* retry/cancel guidance.
  - *Error:* discovery/connection failure keeps data unchanged; offer retry/cancel.
- **Styling:** calm status copy; avoid alarmist language (Section 8).

### 11.7 Receive record (receiver)

- **Purpose:** receiver (typically BHW) makes the device discoverable and accepts an
  incoming transfer.
- **Content:** discoverable status; incoming request with sender/patient identity.
- **Components:** Receive status panel, Incoming request prompt, Accept/Decline controls.
- **Primary actions:** Accept -> Transfer review & confirmation; Decline/Cancel.
- **States:** waiting; incoming request; connection error (data unchanged, retry/cancel).
- **Styling:** consistent with Send record for a coherent transfer experience.

### 11.8 Transfer review & confirmation (shared)

- **Purpose:** both users verify the bundle before any data changes; receiver confirms
  import.
- **Content:** patient identifier/label; entry counts (readings and notes); schema version
  validity; a preview of what will be imported.
- **Components:** Bundle preview panel, Entry-count summary, Patient/device verification
  row, Confirm import button, Cancel.
- **Primary actions:** Confirm import (receiver) -> atomic commit -> Import receipt; Cancel
  leaves both devices unchanged.
- **States:**
  - *Valid bundle:* show counts and preview; enable Confirm.
  - *Unknown/invalid schema version:* reject with a clear message; no import.
  - *Validation failure:* no partial change; retry/cancel.
- **Styling:** verification details legible (Atkinson Hyperlegible); Confirm is the
  obvious primary action.

### 11.9 Import receipt (shared)

- **Purpose:** confirm the outcome of a completed import.
- **Content:** counts of newly imported readings and notes; count of duplicates skipped;
  confirmation that existing data was preserved.
- **Components:** Receipt summary, counts list, Done/Return action.
- **Primary actions:** Done -> return to Patient summary (showing merged history).
- **States:** success with counts; "nothing new (all duplicates skipped)" variant.
- **Styling:** reassuring confirmation tone; Dawn Gold may mark the single key success
  figure if a focal accent is wanted.

### 11.10 RHU / YAKAP-ready summary

- **Purpose:** present a concise, shareable summary of a patient's history for the next
  RHU/YAKAP visit.
- **Content:** patient label/code; condensed reading history with values, time, measurer,
  recorder; visit notes; generated-on timestamp. (Direct digital transfer to the RHU is
  out of scope / future work per prd.md.)
- **Components:** Summary header, Readings table/list, Visit notes section, Export/share
  affordance (print or share-sheet as the platform allows).
- **Primary actions:** view; export/share if available; return to Patient summary.
- **States:** populated; empty (no readings yet).
- **Styling:** optimized for legibility and, where printed, for a dark-on-light layout per
  Section 13 contrast guidance.

---

## 12. Component Inventory

Reusable components referenced by Section 11. All inherit brand tokens, the type scale,
and layout geometry from Sections 3-7.

| Component | Used by | Notes |
| --- | --- | --- |
| App header | All screens | Logo/brand area, optional back action. |
| Offline banner | All screens | Calm connectivity indicator; never blocks offline use. |
| Role card | Home | Large, high-contrast choice target; >= 44 x 44 px. |
| Patient list item | Patient list | Label/code + last-reading date; opens summary. |
| Search field | Patient list | Optional; filters by label/code. |
| Empty-state panel | Patient list, history | Reassuring copy + a clear primary action. |
| Patient header | Summary, RHU summary | Patient label/code and summary context. |
| BP reading card | Summary, RHU summary | Systolic/diastolic, time, measurer, recorder, note. |
| Visit note card | Summary, RHU summary | Author, date, text. |
| Reading entry form | Add reading | Numeric inputs, date/time picker, person selectors, note. |
| Visit note form | Add visit note | Multiline text; author/createdAt on save. |
| Person selector | Add reading | Choose/record measurer and recorder. |
| Transfer discovery list | Send record | Nearby devices; device items with status. |
| Receive status panel | Receive record | Discoverable state + incoming request prompt. |
| Bundle preview panel | Transfer review | Patient identity, entry counts, schema validity. |
| Confirmation dialog | Transfer review, destructive actions | Verify before committing. |
| Receipt summary | Import receipt | Imported counts and duplicates skipped. |
| Primary action button | Many | One obvious primary action per screen (Section 9). |
| Confirmation toast/snackbar | Add reading/note, import | Gentle success feedback. |

Component rules:

- One icon family and stroke weight across the app (Section 5).
- Primary actions are reachable and obvious; secondary actions stay visually quieter.
- All interactive components meet the 44 x 44 px target and expose text labels.
- Error and offline states use copy and iconography, never color alone (Sections 5, 13).

---
## 13. Accessibility

- Target WCAG 2.2 AA contrast for text and interactive controls.
- Do not place mint body text on white backgrounds.
- Use Deep Sea Teal for primary text on light surfaces.
- Use White or Mint Subtle for text on Deep Sea Teal.
- Do not communicate success, warning, or urgency through color alone.
- Support keyboard navigation and visible focus states.
- Use descriptive labels for icon-only controls.
- Provide alternative text for meaningful photography.
- Keep critical patient instructions concise and available in the relevant local language.
- Design for slow connections and intermittent network access.

---

## 14. Implementation Checklist

Before publishing a Kasigla touchpoint, confirm:

- [ ] The current approved logo is used without distortion.
- [ ] Logo clear space is preserved.
- [ ] The palette uses approved tokens.
- [ ] Dawn Gold is limited to a focal accent.
- [ ] Heading, UI, and body fonts follow the type system.
- [ ] Web-safe fallbacks are included.
- [ ] Icons use one approved rounded icon family.
- [ ] Critical icons include text labels.
- [ ] Photography is respectful, relevant, and licensed.
- [ ] Text passes WCAG AA contrast.
- [ ] Touch targets are at least 44 × 44 px.
- [ ] Mobile and low-connectivity states are considered.
- [ ] Patient-facing language is direct and reassuring.
- [ ] The layout remains usable at narrow mobile widths.

---

## 15. Asset Summary

| Asset | Format | Purpose |
| --- | --- | --- |
| Kasigla logo | PNG, 2048 × 2048 | General digital use |
| Kasigla app mark | SVG | Browser favicon and scalable interfaces |
| Kasigla brand specifications | Markdown | Portable design-system reference |

---

**Kasigla**  
*Kalinga. Sigla. Care that reaches everywhere.*
