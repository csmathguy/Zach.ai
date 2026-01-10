---
name: Frontend design guidelines
applyTo: 'frontend/src/**/*.{ts,tsx,css,scss}'
---

## Purpose

Use these rules when designing or modifying frontend UI/UX so the product is usable, delightful, and consistent. Good design documentation explains what the UI does, how it behaves, what it looks like, and why it is that way.

**Design KB**: [Web App Design & Styling Guide](../../knowledge-base/design/README.md)

---

## Design Priorities

1. **Usability first**: Clear hierarchy, readable text, obvious actions
2. **Accessibility**: WCAG 2.2 baseline, focus states, keyboard support
3. **Mobile-ready**: Small screens must remain usable and legible
4. **Intentional aesthetics**: Avoid bland defaults; use purposeful typography and layout
5. **Consistency**: Follow existing tokens, spacing, and component patterns
6. **Clarity**: Reduce ambiguity to near zero

---

## Required Checks

- Use existing CSS variables for color, spacing, and typography
- Provide visible focus states for interactive elements
- Validate contrast for text and controls
- Ensure touch targets are usable on mobile (minimum 44px)
- Document any new design tokens or component variants
- Document copy rules and error messages

---

## Interaction and Motion

- Use motion to clarify state changes (loading, success, transitions)
- Avoid excessive micro-animations
- Respect prefers-reduced-motion when adding animations
- If adding drag interactions, provide a non-drag alternative

---

## Outputs for Design Phase

When acting as the design agent, produce artifacts under:

- `work-items/<branch>/design/README.md`
- `work-items/<branch>/design/ui-spec.md`
- `work-items/<branch>/design/interaction-matrix.md`
- `work-items/<branch>/design/rationale-log.md`
- `work-items/<branch>/design/design-system-delta.md`
