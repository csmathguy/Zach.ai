# Web App Design & Styling Guide

> Last Updated: 2026-01-06

This guide defines how we design and style web UIs in this repo: colors, typography, spacing, layout, light/dark modes, accessibility, and recommended CSS/React patterns. It is meant to be the single source of truth for “what good design looks like” for Zach.ai.

It synthesizes best practices from:

- WCAG 2.2 / W3C WAI (accessibility)
- MDN CSS documentation (fundamentals, layout)
- Established design systems (Material, Fluent, Tailwind, Refactoring UI guidance)

---

## 1. Design Principles

### 1.1 Core Goals

Our UI should be:

- **Legible**: Text is easy to read in all themes and on all devices.
- **Predictable**: Common patterns (buttons, links, inputs) behave consistently.
- **Focused**: Visual hierarchy guides the eye to the most important actions.
- **Accessible**: Meets WCAG 2.1/2.2 AA contrast and interaction requirements.
- **Calm**: Limited color palette, restrained animation, no visual noise.
- **Fast to scan**: Generous spacing, consistent typography, clear sectioning.

### 1.2 Design North Star

When in doubt, favor:

- **Clarity over cleverness**
- **Contrast over decoration**
- **Few components, well-polished** over many variants
- **Obvious click targets** over hidden affordances

If you’re deciding between two designs, pick the one that:

- Uses our tokens (colors, spacing, typography) instead of ad‑hoc values
- Reduces the number of distinct colors and font sizes on screen
- Makes the primary action more obvious than secondary actions

---

## 2. Color System & Contrast

### 2.1 Color Tokens (Conceptual)

We model color as **semantic tokens**, not raw hex values. At a minimum:

- `--color-bg` / `--color-bg-subtle`
- `--color-surface` / `--color-surface-muted`
- `--color-border-subtle` / `--color-border-strong`
- `--color-fg` (primary text)
- `--color-fg-muted` (secondary text)
- `--color-fg-inverted` (text on strong backgrounds)
- `--color-accent` / `--color-accent-soft`
- `--color-danger`, `--color-warning`, `--color-success`
- `--color-focus-ring`

Implementation pattern:

- Define tokens in `:root` for light mode
- Override inside `[data-theme="dark"]` for dark mode
- Components consume tokens exclusively (no inline hex values in components)

### 2.2 Light & Dark Modes

**Light theme**:

- Background: near‑white (e.g. `#f5f5f7`) instead of pure white to reduce glare
- Surface: white cards (`#ffffff`) with subtle shadow or border
- Text: near‑black (`#111827`) for body copy

**Dark theme**:

- Background: very dark gray (`#020617`–`#0b1120`), not pure black
- Surfaces: slightly lighter grays (`#020617`–`#1e293b`)
- Text: off‑white (`#e5e7eb`) for body copy, muted grays for secondary

Never invert colors naïvely (e.g., using `filter: invert(1)` on whole app). Always design dark tokens explicitly.

### 2.3 Contrast Requirements (WCAG)

For text and UI components, we follow **WCAG 2.2 AA**:

- Normal text (< 18pt / < 24px): **contrast ratio ≥ 4.5:1**
- Large text (≥ 18pt regular or ≥ 14pt bold): **contrast ratio ≥ 3:1**
- Non‑text UI components and icons: **contrast ratio ≥ 3:1** against adjacent colors

Practically:

- Never use light gray text on white (e.g. `#9ca3af` on `#ffffff`) for body text
- Never use pure white text on very light backgrounds
- For primary CTAs, ensure both **text vs button** and **button vs background** meet contrast

Always verify with a contrast checker (e.g., WebAIM Contrast Checker or VS Code/Browser devtools color contrast tools).

### 2.4 Avoiding Light-on-Light / Dark-on-Dark

To avoid unreadable combinations:

- For any solid background (button, chip, tag):
  - Pick **one of our surface tokens** and pair with `--color-fg-inverted` if background is strong
  - Or keep background subtle and use `--color-fg` text
- Never place white text directly on pastel or neon colors unless contrast is verified
- For gradients, ensure the **lowest contrast stop** still meets WCAG vs text color

Recommended rule of thumb:

- If you need to squint, the contrast is wrong.
- If you have to add text shadow to make it readable, background is likely too busy.

---

## 3. Typography

### 3.1 Type Scale

Use a **small, consistent type scale**. Example (adjust exact numbers to our existing CSS):

- `--font-size-xs`: 12px – sublabel, badges
- `--font-size-sm`: 14px – secondary text, metadata
- `--font-size-md`: 16px – body text (default)
- `--font-size-lg`: 18px – section titles / emphasis
- `--font-size-xl`: 20–22px – page titles inside content
- `--font-size-2xl`: 24–28px – app/page hero titles

Rules:

- **Body text** defaults to 16px, line-height around 1.5–1.6
- Avoid going below 14px for interactive elements unless absolutely necessary
- Keep the number of distinct font sizes per page to **4 or fewer**

### 3.2 Font Weights & Usage

- `400` (normal) for most body text
- `500` for emphasized labels, card titles
- `600–700` for page titles and key headings

Avoid using **bold + color + uppercase** together everywhere; pick maximum two of these for emphasis.

### 3.3 Readability

- Line length: aim for **45–80 characters** per line on desktop for body text
- Line height: 1.5–1.7 for body, 1.2–1.3 for headings
- Avoid center-aligning long paragraphs; use left alignment for main text

### 3.4 Retro Aesthetic (Optional)

If we choose a subtle retro flavor:

- Use a **single accent font** (e.g., for headings) and keep body in a modern sans-serif
- Use retro colors sparingly (muted teal, warm beige, soft orange) while still meeting contrast
- Use **rounded corners and subtle shadows** reminiscent of older UIs, but keep spacing and layout modern

Retro is an accent, not a full theme. Never sacrifice readability or contrast for style.

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

Define a spacing scale and stick to it (similar to Tailwind’s approach):

- `--space-0`: 0
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-5`: 20px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-10`: 40px
- `--space-12`: 48px

Usage:

- **Vertical rhythm**: 16–24px between stacked elements
- **Section padding**: 24–40px top/bottom
- **Card padding**: 16–24px

Never invent new spacing like `13px` or `37px` unless there is a compelling reason.

### 4.2 Layout Grids

For primary layout:

- Use a **max-width container** (e.g., 960–1280px) centered with horizontal padding
- Use CSS Grid or Flexbox for content sections, avoid deeply nested flexes
- Keep consistent margins between columns (e.g., 24px)

For responsive behavior:

- Single-column on mobile
- Two or three columns on desktop, depending on content density
- Avoid horizontal scrolling for primary content

### 4.3 Card & Panel Design

Common pattern for dashboard sections:

- Card surface using `--color-surface`
- Border using `--color-border-subtle` OR a very soft shadow
- Padding using `--space-4`–`--space-6`
- Title row, body, and footer separated by vertical spacing (not extra borders unless necessary)

Buttons and key actions should usually be in the card header or footer, not floating in the middle of content.

---

## 5. Components & States

### 5.1 Buttons

Button variants we support conceptually:

- **Primary**: one per container/context. High emphasis color (e.g., `--color-accent`).
- **Secondary**: outlined or subtle background, for alternative actions.
- **Tertiary / Text**: minimal styling, for low-emphasis actions.

States to handle:

- Default
- Hover
- Active / pressed
- Focus-visible (keyboard)
- Disabled

Rules:

- Minimum tap target: **44×44px** (WCAG touch target guidance)
- Always show focus outline for keyboard users (use `:focus-visible` with `--color-focus-ring`)
- Disabled buttons must **not rely solely on color**; also reduce opacity and remove pointer events

### 5.2 Text Links

- Should look like links (underline or distinct color) and remain recognizable without color
- Do **not** reuse primary button colors for inline links
- Hover states can add underline if not always underlined

### 5.3 Inputs & Forms

- Use a consistent input style (border radius, border color, focus ring)
- Error state: border and/or helper text in `--color-danger`, with clear message
- Label every input, never rely solely on placeholders as labels
- Group related fields visually and with headings

### 5.4 Feedback (Errors, Warnings, Success)

Use semantic colors:

- Error: `--color-danger`
- Warning: `--color-warning`
- Success: `--color-success`

Messages:

- Short, human-readable, and placed near the relevant control
- Use icons to reinforce meaning if desired, but not required for comprehension

---

## 6. Accessibility & Interaction

### 6.1 Keyboard Navigation

- All interactive elements must be reachable by **Tab** and activatable via **Enter/Space**
- Use logical focus order that matches visual order
- Do not disable default focus outlines; instead, customize them using `:focus-visible`

### 6.2 ARIA & Semantics

- Use semantic HTML (`<button>`, `<a>`, `<label>`, `<nav>`, `<main>`, `<header>`, `<footer>`, etc.)
- Only add ARIA roles when necessary and correct
- For icon-only buttons, include `aria-label` or visible text

### 6.3 Motion & Animation

- Keep animations subtle and purposeful (e.g., button hover, small transitions)
- Avoid large parallax or fast flashing elements
- Respect `prefers-reduced-motion` where appropriate

---

## 7. Theming Implementation (React + CSS)

### 7.1 CSS Strategy in This Repo

We primarily use:

- **Global CSS** for base resets, typography, and tokens
- **CSS Modules** (or feature-scoped CSS) for components and features

Guidelines:

- Use **CSS custom properties** (`var(--color-...)`, `var(--space-...)`) rather than hard-coded values in components
- Keep component styles in their own module files (e.g., `Component.module.css`)
- Avoid inline styles except for dynamic, non-thematic values (e.g., calculated widths)

### 7.2 Light/Dark Toggle Pattern

Recommended pattern:

- At the app root (`<html>` or `<body>`), set `data-theme="light"` or `data-theme="dark"`
- In CSS:
  - Define base tokens in `:root`
  - Override token values in `[data-theme="dark"]`
- React only toggles the `data-theme` attribute and, optionally, persists preference in localStorage

No component should directly decide its colors; it should rely on tokens, which change with theme.

---

## 8. Retro Feel (Optional Layer)

If we intentionally add retro flavor to the app:

### 8.1 Color

- Use a **limited palette** inspired by vintage UIs: muted teal, warm amber, desaturated purple
- Ensure all retro colors still pass contrast requirements
- Use retro colors mostly for accents (buttons, highlights), not for large text backgrounds

### 8.2 Shapes & Details

- Slightly larger border radii (6–10px)
- Thicker borders on selected panels or buttons (1.5–2px)
- Subtle inner shadows or bevels can be acceptable sparingly, if they don’t reduce clarity

### 8.3 Typography

- Optionally use a display font for headings that evokes retro styling
- Body text remains modern and highly legible

Retro styling must never:

- Break responsiveness
- Reduce contrast
- Introduce visual noise that distracts from primary tasks

---

## 9. Recommended Libraries (Optional)

We prefer to stay close to **plain CSS + React**, but the following are acceptable when justified in an ADR:

### 9.1 Icon Libraries

- **Material Icons / MUI Icons**: large, familiar icon set
- **Heroicons**: clean, outline/solid icons, pairs well with Tailwind‑style designs

Use icons to reinforce meaning, not as decoration for every element.

### 9.2 Component & Styling Libraries

Use only with a clear rationale and ADR:

- **MUI (Material UI)**: full component library + theming; good when we need many standard components quickly
- **Headless UI / Radix UI**: accessible primitives we can style with our own CSS
- **Tailwind CSS (utility-first)**: only if we consciously move to utility-based styling and document patterns

When adopting any library:

- Align its theme with our color tokens and typography
- Avoid mixing multiple UI libraries in the same view
- Wrap third-party components in our own components if we need to standardize usage

---

## 10. Practical Do/Don’t Checklist

### 10.1 Colors & Contrast

- ✅ Do use semantic tokens and check contrast for all text
- ✅ Do ensure primary actions are visually distinct
- ❌ Don’t put white text on light backgrounds or dark text on dark backgrounds
- ❌ Don’t use random hex values in components

### 10.2 Typography

- ✅ Do use a small, consistent type scale
- ✅ Do keep body text at least 16px with good line-height
- ❌ Don’t mix more than ~4 font sizes on one page
- ❌ Don’t center-align long paragraphs

### 10.3 Layout & Spacing

- ✅ Do use the spacing scale for gaps, margin, and padding
- ✅ Do align content to a max-width container and grid
- ❌ Don’t cram elements together; avoid zero spacing between sections

### 10.4 Interaction & Accessibility

- ✅ Do support keyboard navigation and visible focus
- ✅ Do label inputs and icon-only buttons properly
- ❌ Don’t remove outlines without replacing them
- ❌ Don’t use color as the only way to convey state

---

## 11. How Agents Should Use This Guide

When generating or modifying UI code:

- **Colors**: Use tokens or existing CSS classes rather than raw hex values.
- **Spacing**: Keep to the spacing scale; avoid arbitrary pixel values.
- **Typography**: Use existing heading/body classes and sizes; don’t invent new ones casually.
- **Accessibility**: Always consider contrast and focus states when introducing new colors or components.
- **Retro styling**: Treat as an optional layer; never compromise usability for aesthetics.

If you’re unsure whether a design choice is acceptable, favor:

- Higher contrast
- Fewer colors
- Simpler components

…and leave a short note in the relevant work-item implementation notes so the team can review the decision.
