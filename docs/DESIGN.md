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

## 10. Accessibility

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

## 11. Implementation Checklist

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

## 12. Asset Summary

| Asset | Format | Purpose |
| --- | --- | --- |
| Kasigla logo | PNG, 2048 × 2048 | General digital use |
| Kasigla app mark | SVG | Browser favicon and scalable interfaces |
| Kasigla brand specifications | Markdown | Portable design-system reference |

---

**Kasigla**  
*Kalinga. Sigla. Care that reaches everywhere.*
