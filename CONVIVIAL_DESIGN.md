# Convivial Design System (v3)

The visual source of truth for cookconvivial.com. The approved reference proof is
`convivial-specimen-v3.html` (repo root). Open it in a browser and match it.
When this document and the reference disagree, the reference wins, with one
exception: the sage ground (`#E6E6D8`) shown in the reference has been removed.
Use blush wherever the reference shows a sage panel.

**Soul:** antique Americana (leading), Italian trattoria warmth, grandma's handwritten
cookbook. Warm, relaxed, lived-in. Not rustic-kitschy, not farmhouse-trendy.
Soft rounded edges and small dot details, never hard rules or harsh corners.

---

## 0. Ground rules for the restyle

- This is a **visual restyle only**. Do not change routes, data fetching, database
  queries, API routes, auth, the `/login` admin flow, or recipe/comment logic.
- Restyle the public pages first. Admin pages only get the tokens and fonts, not
  the decorative treatment.
- Work in phases (section 9). After each phase, run the dev server, check the page,
  and commit before moving on.
- No paper grain, noise textures, or edge staining anywhere.
- No new UI libraries. Tailwind plus plain CSS only.

---

## 1. Fonts

Load with `next/font/google` in the root layout and expose as CSS variables.

| Role | Font | Settings |
|---|---|---|
| Display (headlines, wordmark, drop caps) | **Fraunces** | variable, `axes: ['SOFT', 'WONK', 'opsz']`, roman and italic. Always `font-variation-settings: "SOFT" 60, "WONK" 0`. Weight 420 for roman, 380 for italic. |
| Body | **Libre Caslon Text** | 400, 700, and 400 italic |
| Handwriting (placeholder) | **Homemade Apple** | 400. Will later be replaced by a custom font or scans of real family recipe cards, so keep it behind one variable. |

```ts
// app/layout.tsx (sketch)
import { Fraunces, Libre_Caslon_Text, Homemade_Apple } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"], style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"], variable: "--font-display", display: "swap",
});
const caslon = Libre_Caslon_Text({
  subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"],
  variable: "--font-body", display: "swap",
});
const hand = Homemade_Apple({
  subsets: ["latin"], weight: "400", variable: "--font-hand", display: "swap",
});
// <html className={`${fraunces.variable} ${caslon.variable} ${hand.variable}`}>
```

### Type scale (perfect fourth, 18px body)

| Token | Size | Use |
|---|---|---|
| `--t-display` | `clamp(3.6rem, 12vw, 7.5rem)` | Wordmark on home/about |
| `--t-h1` | `clamp(2.6rem, 6vw, 3.55rem)` | Recipe titles, page titles |
| `--t-h2` | `2.666rem` | Section headings |
| `--t-h3` | `2rem` | Recipe parts ("For the cake") |
| `--t-h4` | `1.5rem` | Deks and subtitles, Fraunces italic |
| `--t-body` | `1.125rem` | Body, line-height 1.65 |
| `--t-small` | `0.833rem` | Captions, metadata |

- Body measure: max `34rem` (about 66 characters).
- Labels such as "Makes", "Hands on", nav items: Libre Caslon with
  `font-variant-caps: small-caps; letter-spacing: .05em;` in faded ink.
  **Never** tracked ALL CAPS.
- Recipe deks and subtitles: Fraunces italic, faded ink.
- Captions: Caslon italic, `--t-small`, faded ink.
- Handwriting font is used **only** for cook's notes and marginal asides,
  never headings, buttons, or nav.

---

## 2. Color tokens

```css
:root {
  /* grounds: one per kind of section */
  --ground: #F2F1ED;      /* page background (gray-white) */
  --stone:  #E9E6DF;      /* recipe cards */
  --blush:  #F0E4E0;      /* wine-tinted panel: About, Ingredient Index, Baking Tips, stories */

  /* photo mats */
  --mat-olive: #6F7046;   /* DEFAULT photo mount */
  --mat-wine:  #7A2C35;
  --mat-sage:  #CFCFB6;
  --mat: var(--mat-olive);
  --mat-text: #EDEBDD;    /* caption color on the mat */

  /* inks */
  --ink:          #2A221C;   /* body text */
  --ink-faded:    #6B6259;   /* captions, labels, meta */
  --wine:         #6A1E28;   /* wordmark, links, drop caps, ornaments, primary buttons */
  --wine-pressed: #4E141C;   /* hover/active */
  --olive:        #5F6136;   /* tags */
  --pen:          #33456A;   /* handwriting ink */
  --ochre:        #A9823A;   /* star ratings */
  --hairline: rgba(42, 34, 28, .22);  /* dotted rules */
}
```

Dark mode ("lamplight") tokens exist in the reference file but are **not** to be
enabled yet. Structure all colors through these variables so it can be added later.

Rules:
- Wine is reserved for things that matter: wordmark, links, drop caps, corner
  ornaments, primary buttons, ingredient quantities.
- Never use pure black or pure white.
- Wine hover fills on light grounds use `--blush`.

### Tailwind mapping

Check whether the project uses Tailwind v3 (`tailwind.config.*`) or v4 (`@theme` in CSS)
and map the variables accordingly, e.g. `bg-ground`, `bg-stone`, `bg-blush`,
`text-ink`, `text-ink-faded`, `text-wine`, `font-display`, `font-body`, `font-hand`,
`rounded-panel` (28px), `rounded-photo` (16px). Colors must reference the CSS
variables, not hard-coded hex, so themes can change in one place.

---

## 3. Shape and spacing

| Token | Value | Use |
|---|---|---|
| `--r-panel` | `28px` (`20px` under 760px) | Section panels, recipe card, photo mat |
| `--r-photo` | `16px` | The photo inside its mat, any image inside a panel |
| `--r-pill` | `999px` | Buttons, recipe timing chips, tags, toggles |

- Corners nest: big radius outside, smaller radius inside.
- No hard borders on cards. Separation comes from the change in ground color.
- No drop shadows.
- Panel padding: `clamp(2rem, 5vw, 3.5rem)` vertical,
  `clamp(1.25rem, 5vw, 3.5rem)` horizontal. Gap between panels: `1.5rem`.
- Page container: `max-width: 66rem`, side padding `clamp(1rem, 3vw, 2rem)`.

---

## 4. Ornaments (copy the SVG exactly from the reference file)

Build these as small reusable React components.

1. **`<CornerCurls />`**: the loose curl corner with three dots (`#curl` symbol).
   Placed at all four corners of the home title panel and the recipe card only.
   44px (30px on mobile), inset 14px, wine at 85% opacity, mirrored with
   `scaleX(-1)` / `scaleY(-1)` / `scale(-1,-1)`. `pointer-events: none`.
   Do **not** put curls on every panel; their rarity is the point.
2. **`<Sprig />`**: the wavy line with dots (`#sprig` symbol), 120×20, wine.
   Used under the wordmark, between major page sections, and in the footer.
3. **Dotted rule**: round dots instead of lines. Used between list rows
   (ingredients, index entries) and between stacked blocks:
   ```css
   background: radial-gradient(circle, var(--hairline) 1.2px, transparent 1.6px)
               bottom / 9px 4px repeat-x;
   ```
   Replace every `border-b`/hairline divider in the public site with this.

---

## 5. Section grounds (where each color goes)

| Page / area | Ground |
|---|---|
| Body / default page | `--ground` |
| Home title area | `--ground` panel with CornerCurls and Sprig |
| Recipe card (the structured recipe block) | `--stone` panel with CornerCurls |
| Recipe intro/story above the card | `--ground` |
| About page | `--blush` panel |
| Ingredient Index, Baking Tips | `--blush` panels |
| Photos page | `--ground`, each photo on its own `--mat` |
| Comments and ratings | `--stone` panel, no curls |
| Footer | `--ground`, Sprig at top, centered colophon in Caslon italic |

---

## 6. Components

**Nav.** Wordmark "Convivial" in Fraunces, wine, links to About (as now).
Nav links in Caslon small caps, faded ink, wine on hover with a soft underline.
Sticky, on `--ground`, no border; use a dotted rule underneath on scroll if needed.

**Recipe page.**
- Header centered: small-caps category line, Fraunces title (`--t-h1`),
  Fraunces italic dek.
- Timings and servings: centered row of **pills** on `--ground` inside the
  stone card: small-caps label then value, e.g. "Hands on  40 minutes".
- Hero photo: wrapped in a **photo mat** (`--mat` background, `--r-panel` radius,
  `clamp(.9rem, 2.5vw, 1.6rem)` padding), image at `--r-photo`, caption below
  in Caslon italic using `--mat-text`.
- Intro paragraph: first letter as a Fraunces **drop cap** in wine
  (~4.1em, float left).
- Ingredient list: two columns, quantity in wine, name in ink, dotted rules
  between rows. Keep the existing checklist behavior; restyle checkboxes as
  small rounded squares in wine.
- Instructions: numbered steps are a real sequence, so numbers are fine,
  set in Fraunces in wine.
- **Recipe notes** field renders as the **cook's note card**: `--ground`
  background, irregular radius `18px 22px 16px 24px`, rotated `-1.5deg`,
  handwriting font in `--pen`. On desktop it sits in a right margin column
  (12rem) and is sticky; on mobile it sits inline below the ingredients.
- Nutrition: small `--blush` pill chips.
- Star ratings: ochre.
- Sub-recipe variation links: wine links in Fraunces italic.

**Buttons.**
- Primary: `--wine` background, `--ground` text, pill radius, Caslon,
  hover `--wine-pressed`.
- Secondary: `--stone` background, ink text, pill radius, hover `--blush`.
- Focus: `2px solid var(--wine)`, offset 3px.

**Cards in lists (recipe index, related recipes).** `--stone` panel at
`--r-panel`, photo inside at `--r-photo`, Fraunces title, Caslon italic dek.
No borders, no shadows. Hover: ground shifts to `--blush`.

**Forms (comments, admin).** Inputs on `--ground` with `1px solid var(--hairline)`,
radius 12px, Caslon text; focus ring in wine.

---

## 7. Motion

Almost none. The only transitions: background color on hover (≈200ms) and the
photo mat color. Respect `prefers-reduced-motion`.

## 8. Accessibility floor

Body text contrast ≥ 4.5:1 on every ground. Visible keyboard focus everywhere.
Ornaments are `aria-hidden`. Responsive down to 360px wide.

## 9. Suggested phases

1. Fonts + tokens + Tailwind mapping + global base styles (body, links, focus).
2. Ornament components (CornerCurls, Sprig, dotted rule utility).
3. Nav and footer.
4. Recipe page (header, pills, photo mat, drop cap, ingredients, steps,
   cook's note card, nutrition, comments).
5. Home / recipe index cards.
6. About, Ingredient Index and Baking Tips (blush), Photos (mats).
7. Admin: tokens and fonts only.

## 10. Coming later (do not build yet)

- Logo / wordmark lockup (will replace the plain Fraunces wordmark).
- Handwriting: custom font or scans from real family recipe cards.
- Dark "lamplight" mode.
