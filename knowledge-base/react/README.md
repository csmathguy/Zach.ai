# React

> Planned UI library for building Zach.ai’s interactive frontend with components and hooks.

**Current Version**: React 18.x (see frontend/package.json)  
**Last Updated**: 2025-12-31  
**Status**: 🚧 In Progress (React wired into frontend; CSS Modules for layout)

## Quick Links

- [Official Documentation](https://react.dev/)
- [GitHub Repository](https://github.com/facebook/react)
- [API Reference](https://react.dev/reference)

---

## Table of Contents

1. [Overview](#overview)
2. [Why We Use It](#why-we-use-it)
3. [Official Resources](#official-resources)
4. [Version History](#version-history)
5. [Installation & Setup](#installation--setup)
6. [Core Concepts](#core-concepts)
7. [Configuration](#configuration)
8. [Best Practices](#best-practices)
9. [Common Patterns](#common-patterns)
10. [TypeScript Integration](#typescript-integration)
11. [Testing](#testing)
12. [Performance](#performance)
13. [Security](#security)
14. [Troubleshooting](#troubleshooting)
15. [Migration Guides](#migration-guides)
16. [Comparison with Alternatives](#comparison-with-alternatives)
17. [Learning Resources](#learning-resources)
18. [Maintenance Notes](#maintenance-notes)

---

## Overview

React is a component-based UI library for building interactive interfaces. Zach.ai now uses React in the frontend:

- `App` is a React component rendered by Vite in [frontend/src/main.tsx](../../frontend/src/main.tsx).
- The application shell lives in [frontend/src/app/App.tsx](../../frontend/src/app/App.tsx) and composes feature slices.
- The monitoring dashboard UI lives in [frontend/src/features/dashboard/Dashboard.tsx](../../frontend/src/features/dashboard/Dashboard.tsx).
- Styling uses a mix of global CSS ([frontend/src/styles.css](../../frontend/src/styles.css)) and feature-level CSS Modules.

This document describes how we are starting to use React and how we plan to evolve that usage, aligned with our [react instructions](../../.github/instructions/react.instructions.md) and the official docs.

---

## Why We Use It

Planned rationale for choosing React:

- **Ecosystem & Adoption** – React has a large ecosystem, strong community, and long-term support.
- **Component Model** – Encourages reusable, composable UI pieces that map well to Zach.ai’s features.
- **TypeScript Support** – First-class TypeScript support and patterns for strongly typed UIs.
- **Tooling Integration** – Works well with Vite, Jest, and Testing Library, all of which we already use.

Alternatives like Vue or Svelte were considered conceptually, but React aligns best with our existing tooling and documentation investments.

---

## Official Resources

When building React UIs, prioritize these sections of react.dev:

- **Quick Start** – High-level introduction to components and JSX.
- **Describing the UI** – Components, props, lists, and conditional rendering.
- **Adding Interactivity** – State, events, and derived state.
- **Managing State** – useState, useReducer, lifting state up.
- **Escape Hatches** – Refs, imperative APIs, and controlled escape routes.
- **Reference** – Detailed API docs for hooks, components, and utilities.

Use the official docs as the source of truth; this KB defines how we apply those concepts in Zach.ai.

---

## Version History

React has been added as a dependency of the frontend:

- Target React 18.x (current stable) with function components and hooks only.
- Keep this section updated with exact versions of `react` and `react-dom` from [frontend/package.json](../../frontend/package.json).
- Record any major upgrades and breaking changes as we evolve.

---

## Installation & Setup

React is now wired into the frontend:

1. Dependencies in [frontend/package.json](../../frontend/package.json):
   - `react`, `react-dom`
   - `@types/react`, `@types/react-dom`
   - `@vitejs/plugin-react`
2. [frontend/vite.config.ts](../../frontend/vite.config.ts) enables the React plugin.
3. [frontend/src/main.tsx](../../frontend/src/main.tsx) renders the `App` component into a `root` div and imports global styles.
4. [frontend/src/app/App.tsx](../../frontend/src/app/App.tsx) defines the initial UI shell using CSS Modules.
5. [frontend/src/features/dashboard/](../../frontend/src/features/dashboard) contains the dashboard feature (React component + DOM-integrated data fetching).

Future setup work (routing, richer state management) will extend this foundation.

---

## Core Concepts

Key React concepts we rely on:

- **Components** – Small, reusable UI units (function components only).
- **Props** – Data passed into components from parents.
- **State** – Local component state managed via hooks.
- **Hooks** – `useState`, `useEffect`, `useMemo`, `useCallback`, `useReducer`, and custom hooks.
- **Composition** – Building complex UIs from simple, focused components.

Our components should stay small and focused, aligning with the Single Responsibility Principle from the development guide.

---

## Configuration

React-specific configuration will primarily live in:

- **Vite config** – Enabling the React plugin, JSX handling, and HMR.
- **TypeScript config** – Ensuring JSX is enabled and correctly typed for React.

Concrete settings live in:

- [frontend/tsconfig.json](../../frontend/tsconfig.json) – `jsx` is set to `react-jsx` for the frontend build and type-checking.
- [frontend/vite.config.ts](../../frontend/vite.config.ts) – React plugin enabled for dev/build.

### Styling with CSS Modules

The frontend uses a hybrid styling approach:

- **Global base styles** in [frontend/src/styles.css](../../frontend/src/styles.css)
  - Resets (`*`), `body` background, fonts, layout centering.
  - Utility classes used by DOM-inserted HTML (`.status-badge`, `.info-grid`, `.metric-*`, `.loading`, `.error`).
- **CSS Modules for layout and structure**
  - [frontend/src/app/App.module.css](../../frontend/src/app/App.module.css) – container, header, title, tagline, footer.
  - [frontend/src/features/dashboard/Dashboard.module.css](../../frontend/src/features/dashboard/Dashboard.module.css) – cards grid and card styling for the three dashboard sections.
  - Components import these modules and use `className={styles.foo}` to apply styles.

Guidelines:

- Use **global CSS** only for cross-cutting primitives (body, typography, tokens, and classes referenced from raw HTML strings).
- Use **CSS Modules** for feature- and component-specific layout and presentation.
- Keep CSS Modules co-located with their components (`App.module.css`, `Dashboard.module.css`).

---

## Best Practices

Planned React guidelines, based on our instructions and official recommendations:

- Prefer small, focused function components.
- Use hooks instead of class components.
- Follow the Rules of Hooks strictly.
- Lift state up only as far as necessary.
- Use composition over inheritance for reuse.
- Keep side effects inside `useEffect` and related hooks.

These will be refined with concrete examples once the first components are implemented.

---

## Common Patterns

Patterns we already began using and plan to extend:

- **Layout Components** – Top-level layout wrappers for shared chrome (header, footer, navigation).
- **Presentational vs Container Components** – Presentational components focus on rendering; containers handle data and side effects.
- **Custom Hooks** – Encapsulate reusable logic for data fetching, form handling, or domain-specific behaviors.

We will add real examples and code references in this section once React is in the codebase.

---

## TypeScript Integration

React is used with TypeScript from day one:

- Strongly typed props and component signatures.
- Typed hooks, context values, and reducer actions.

For general TypeScript patterns and utilities, see [knowledge-base/typescript/README.md](../typescript/README.md). This section will be expanded with React-specific typing examples once components exist.

---

## Testing

We use Jest and Testing Library in the frontend. With React in place:

- **React Testing Library** is used to test components via the DOM (see [frontend/src/**tests**/App.test.tsx](../../frontend/src/__tests__/App.test.tsx)).
- **jest-dom** provides additional DOM assertions via [frontend/jest.setup.ts](../../frontend/jest.setup.ts).

---

## Performance

React performance considerations we plan to follow:

- Use `React.memo`, `useMemo`, and `useCallback` where profiling shows real benefit.
- Lazy-load heavy routes or components when appropriate.

Specific performance patterns and case studies will be captured here once we have real UIs and measurements.

---

## Security

React helps prevent many XSS issues by escaping content by default, but we will:

- Avoid `dangerouslySetInnerHTML` except in carefully-audited cases.
- Validate and sanitize any HTML that must be rendered from external sources.

More detailed guidance will be added once React is in use and specific security considerations arise.

---

## Troubleshooting

Once React is in the codebase, this section will capture:

- Common warnings (missing keys, stale closures) and how to fix them.
- Typical TypeScript + JSX errors and their resolutions.

For now, treat this as a placeholder to be filled after initial adoption.

---

## Migration Guides

When we adopt React and later upgrade versions:

- Follow the official React upgrade guides.
- Record any deprecations or breaking changes that affect our code.

This section will be expanded once we have a baseline React version and real upgrade history.

---

## Comparison with Alternatives

React was chosen conceptually over alternatives (Vue, Svelte, etc.) because:

- It fits our existing TypeScript, Vite, and Jest tooling.
- It has strong long-term support and ecosystem depth.

We’ll add more concrete comparison details if we evaluate other options in the future.

---

## Learning Resources

Recommended starting points once we begin using React:

- React Docs – https://react.dev/
- React Tutorials – Official interactive tutorials and examples.

We will curate additional resources that match our patterns and stack as the React codebase grows.

---

## Maintenance Notes

- **Next Review Due**: 2026-03-31
- **Known Gaps**:
  - React is not yet present in the codebase; all content is forward-looking.
- **Enhancement Ideas**:
  - Add concrete examples and code references as soon as the first React components, hooks, and tests are implemented.
