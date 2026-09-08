# Brand guide shorthand

Working notes for the Gateway Seminary 2026 rebrand, distilled from
`brand-assets/brandguide/BrandGuidelines_Gateway.pdf` plus what we learned
rolling it out across the portal. Source PDF and raw assets live outside
this repo, at `C:\Users\CadeMacritchie\Desktop\brand-assets\` (see "Asset
paths" below).

## Rollout status

| Page | Status |
|---|---|
| `analytics/index.html` (Portal Analytics) | New brand, permanent (no toggle) |
| `index.html` (homepage) — header, hero, tab bar | New brand, permanent |
| `index.html` — Reports tab cards | New brand, **except** BetterQuery and Record Lookup (left on the current brand deliberately) |
| `index.html` — Other tab, Training Materials tab content | Current brand, unchanged |
| Every other dashboard (`funnel-overview/`, `teaching-site-overview/`, etc.) | Current brand, unchanged |

Started as an analytics-only toggle test; both the toggle and the "test"
framing are gone now — these are live, one-way changes. When extending the
rollout to another page, follow the scoping pattern in "Rolling this out to
a shared page" below so pages/cards that should stay on the current brand
actually do.

## Current (production) brand — unchanged (where still in use)

Defined in `assets/dashboard.css`, shared by every dashboard page that
hasn't been moved to the new brand yet, plus the excluded elements on the
homepage (BetterQuery/Record Lookup cards, Other/Training tab content).

| Role | Hex |
|---|---|
| Navy | `#132a46` |
| Navy mid | `#244663` |
| Teal | `#087c78` |
| Gold | `#d2a53e` |
| Ink (body text) | `#1b2636` / `#203247` (varies by page) |
| Muted | `#5d6b7b` |
| Border | `#dce4e7` |
| Canvas | `#f2f5f6` |

Fonts: Georgia/Playfair Display (headings), Inter (everything else).

## New brand (2026 refresh) — 7 approved colors only

From the brand guide's color palette page. **Don't invent tints/shades —
these 7 are the entire approved palette.** A fabricated lighter teal is
what caused the "blue bars" bug on the analytics test page — always map
new-brand roles onto one of these exact hexes.

| Name | Hex | RGB | Used for |
|---|---|---|---|
| Black | `#0c0f14` | 12,15,20 | Primary dark surface (`--navy`) |
| White | `#ffffff` | 255,255,255 | — |
| Teal | `#234048` | 35,64,72 | Accent / secondary dark surface |
| Rust | `#c44329` | 196,67,41 | Error/warning color |
| Gold | `#d3a422` | 211,164,34 | Accent |
| Gray-blue | `#708aa2` | 112,138,162 | Accent (stat #3 marker) |
| Dark gray | `#2c343a` | 44,52,58 | Secondary dark surface / body ink |

Avoid multi-hue gradients between two of these swatches (e.g. teal →
gray-blue) — even though both are approved colors individually, blending
them reads as an off, muddy color rather than "the brand teal." Prefer flat
fills; the analytics chart bars are flat `var(--teal)` under the new brand
for this reason.

### Shape language — slight rounding, not pill-shaped

The live marketing site (gs.edu, e.g. `/academics/`) uses square-ish
buttons/cards with just a slight corner radius (see reference screenshot:
"Find Your Program" / "Request Info" buttons — a few px, not fully sharp
and nowhere near the current portal's pill-shaped controls). That's a
deliberate departure from the current portal, which leans on pill-shaped
controls and 13–16px rounded corners everywhere. The new brand should
carry that subtler, squarer language over — not zero radius, just small.

Implemented as a radius scale, uniformly reduced under the new brand:

| Var | Current brand | New brand | Used for |
|---|---|---|---|
| `--radius-sm` | `9px` | `4px` | Form controls (date-range select) |
| `--radius-stat` | `13px` | `4px` | Stat cards |
| `--radius-panel` | `14px` | `4px` | Panels, brand-toggle pill |
| `--radius-lg` | `16px` | `4px` | Hero/intro card |
| `--radius-bar` | `4px` | `4px` | Chart bar top corners |

Any new rounded element should route through one of these vars (or a new
one following the same pattern) rather than a hardcoded `border-radius`,
so it inherits the sharp-corner treatment automatically under the new
brand.

### Divider lines — short accent rules, not full-width borders

Reference screenshots: `C:\Users\CadeMacritchie\Desktop\brand-assets\gs.edu
example images\`. gs.edu repeatedly breaks up sections with a short (~40px),
thin (2–3px) horizontal rule in an accent color, instead of a full-width
border:

- An eyebrow label flanked by two short rules on either side — `— ACADEMICS —`.
- A short rule directly under a big serif headline, before the body copy.
- A short rule under a card's subheading (gold on dark cards, rust on white
  cards), replacing what would otherwise be a full-width `border-bottom`.

Implemented on the analytics page:

- `.intro::after` — already existed pre-rebrand; the hero card's short gold
  rule under the heading. Already brand-aware via `var(--gold)`, no change
  needed.
- `.page-title` (header eyebrow) — under the new brand, gains flanking
  `::before`/`::after` rules in `var(--gold)`, matching the "— ACADEMICS —"
  treatment.
- `.panel-head` — under the new brand, its full-width `border-bottom` is
  dropped in favor of a short `var(--red)` (rust) rule under the `h2`,
  matching the white-card examples.

When adding a new section header, prefer this short-rule pattern for the
new brand over a full-width border — pick gold on dark surfaces, rust on
white ones, matching what's above.

### Fonts (three-tier system)

1. **Heading** — Tiempos Fine VF (Klim Type Foundry). We only have the free
   **Test Fonts** build (`brand-assets/fonts_tiempo/Test*.otf`) — per Klim's
   standard Test Fonts EULA that's normally evaluation-only, not licensed for
   production/public use. Gateway's team confirmed these are the test files;
   if that changes, swap in the real purchased OTFs and reconvert (see
   "Self-hosting a new weight" below). Self-hosted now as WOFF2 in
   `assets/fonts/TiemposFine-{Regular,Semibold,Bold}.woff2`.
2. **Subheading** — Montserrat (Google Fonts, free). Section titles, panel
   headings, table headers, small-caps labels.
3. **Body** — Open Sans (Google Fonts, free). Paragraphs, table cells.

Don't let anything fall back to Inter/Playfair by omission — if an element's
`font-family` isn't explicitly set, it silently inherits `body`'s font
rather than picking the right tier. Check explicitly.

## Asset paths

- Brand guide PDF: `C:\Users\CadeMacritchie\Desktop\brand-assets\brandguide\BrandGuidelines_Gateway.pdf`
  (53MB, no embedded font-rendering tools on this machine — use
  `pdftotext -layout` from Git Bash's mingw64, not `pdftoppm`, to pull text)
- Logo PNGs: `C:\Users\CadeMacritchie\Desktop\brand-assets\pngs\` (horizontal,
  primary, secondary, and mark variants × black/white)
- Tiempos Fine test OTFs: `C:\Users\CadeMacritchie\Desktop\brand-assets\fonts_tiempo\`
- Reference screenshots of the live gs.edu site (corner radius, divider
  lines, button styling): `C:\Users\CadeMacritchie\Desktop\brand-assets\gs.edu
  example images\`
- In-repo copies actually served to the browser:
  - `assets/brand-new/gs-logo-horizontal-{white,black}.png`, `gs-logomark-white.png`
  - `assets/fonts/TiemposFine-{Regular,Semibold,Bold}.woff2`

## Implementation notes

### Standalone pages (analytics/index.html)

This page ships its own full inline `<style>` block — it doesn't load
`assets/dashboard.css` — so every color/font/radius is just a plain CSS
custom property at `:root`. No scoping tricks needed; it's the only brand
on the page.

- `[hidden]` needs an explicit `display:none !important` rule in this page's
  inline stylesheet. Any class that sets its own `display` (`.grid`,
  `.state`, etc.) beats the browser's default `[hidden]{display:none}` rule
  in the cascade, so `element.hidden = true/false` in JS silently does
  nothing without it. (Already present in `assets/dashboard.css:35` for
  every other dashboard — this page just didn't have its own copy.)
- Watch specificity when a `.utility-class` (e.g. `.number`) is applied to
  an element that also needs a tag-level default (e.g. `th`): the class
  wins over the type selector even if the type selector comes later, so
  `th.number` needed its own explicit override.

### Rolling this out to a shared page (index.html and beyond)

`index.html` (the homepage) loads the shared `assets/dashboard.css`, and
reuses its classes (`.gs-header`, `.page-intro`, `.tool-card`, `.report-item`,
...) — the same classes every other dashboard page, and the excluded
BetterQuery/Record Lookup cards on this very page, depend on for their
*current*-brand look. **Never redefine `assets/dashboard.css`'s shared
`--navy`/`--teal`/`--gold`/`--border`/`--radius`/etc.**, even by adding a
`:root` override further down a page's own stylesheet — those vars cascade
to every element using them on that page, including ones you didn't mean to
touch (this is exactly how BetterQuery/Record Lookup could accidentally end
up re-themed).

Instead:

1. Define a **namespaced** set of custom properties (prefixed `--nb-`, for
   "new brand") scoped to a container class that only exists on the elements
   you're actually changing — `.hub { --nb-black:#0c0f14; ... }` on
   `index.html`, since `<body class="hub">` is unique to that page.
2. Write override rules using `var(--nb-*)`, addressed with enough
   specificity to beat the shared rule (a `.hub .gs-header { background:
   linear-gradient(120deg, var(--nb-black), var(--nb-darkgray)); }` beats
   `assets/dashboard.css`'s bare `.gs-header` rule because two classes beat
   one, regardless of file order).
3. For an excluded element that shares a base class with elements you ARE
   changing (e.g. `.tool-card` used by both the 4 redone report cards and
   the 2 excluded ones), add a second, distinguishing class instead of
   touching the base class — `.tool-card--gs2026` — and put every new-brand
   rule behind that, never behind bare `.tool-card`. The excluded cards then
   render from the untouched base rules exactly as before, with zero risk of
   drift.

This is slower to write than a blanket `:root` override, but it's the only
way to guarantee an excluded page or card is actually unaffected — verify by
grepping the file for the shared var names (`--navy`, `--teal`, `--gold`,
`--border`, `--radius`) outside of comments after making changes; none of
your new rules should reference them.

## Self-hosting a new weight/format

```bash
python -m pip install fonttools brotli
python -m fontTools.ttLib.woff2 compress -o out.woff2 in.otf
```

Then add an `@font-face` block and reference the family in the relevant
`--font-*` var. Keep `font-display: swap`.
