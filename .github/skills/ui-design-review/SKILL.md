---
name: ui-design-review
description: Frontend UI/UX design review and specification. Use when creating or assessing UI design artifacts, usability, accessibility, mobile readiness, interaction details, or visual polish for web app features.
---

# UI Design Review Skill

## Purpose

Provide a repeatable workflow for frontend design work that balances usability, accessibility, and visual quality. Good design documentation is a shared source of truth that reduces ambiguity for implementation.

## Inputs

- `work-items/<branch>/plan/apr.md`
- `work-items/<branch>/architecture/*`
- `knowledge-base/design/README.md`
- Any research, analytics, or usability evidence

## Outputs

Produce or update design artifacts under `work-items/<branch>/design/`:

- `README.md` - Design summary and goals
- `ui-spec.md` - Flows, screens, states, interactions, responsive rules
- `interaction-matrix.md` - Screen x state x interaction (keyboard and AT notes)
- `rationale-log.md` - Decisions with date, options, and tradeoffs
- `design-system-delta.md` - New components or tokens, with documentation needs

## Review Checklist

- Usability heuristics: status visibility, consistency, error prevention, recognition over recall
- Accessibility: WCAG 2.2 baseline, focus order, target size, non-drag alternatives
- Motion: purposeful, explains state changes, respects reduced motion
- Content: copy rules, error text, formatting, localization notes

## References

- Design guide: `knowledge-base/design/README.md`
- Design instructions: `.github/instructions/design.instructions.md`
