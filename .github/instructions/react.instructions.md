---
name: React guidelines
applyTo: '**/*.tsx'
---

## Core Principles

- **Functional Components Only** - No class components, use FC with TypeScript
- **TypeScript First** - All props interfaces, typed hooks
- **Composition Over Props Drilling** - Use small, focused components

## State Management

- **Simple state** → `useState<T>(initialValue)`
- **Complex state** → `useReducer` with typed actions (see KB for patterns)

## Performance

- **Expensive computations** → `useMemo(() => ..., [deps])`
- **Event handlers to children** → `useCallback((args) => ..., [deps])`
- See KB for full patterns

## Effects

- **Always cleanup** with return function
- **Use AbortController** for fetch requests (see KB for full example)
- Include all dependencies in dependency array

## Component Composition

- Build small, focused components that do one thing
- Compose larger features from smaller pieces (see KB for Card/CardHeader/CardBody pattern)

## Custom Hooks

- **Extract reusable logic** into custom hooks (must start with `use`)
- See KB for full `useFetch` pattern with loading/error states

## Best Practices

- **One component per file** (exception: small related components)
- **Props interface above component** for clarity
- **Destructure props** in function signature
- **Default values** for optional props
- **Memoize expensive operations** with useMemo
- **Memoize callbacks** passed to child components with useCallback
- **Clean up effects** with return function
- **Handle loading and error states** in data fetching
- **Avoid prop drilling** - use composition or context
- **Keep components pure** - same props = same output

## Common Anti-Patterns to Avoid

- ❌ Class components (use functional)
- ❌ `any` types (use proper types)
- ❌ Mutating state directly (use setState)
- ❌ Missing dependency arrays in hooks
- ❌ Creating functions inside JSX (`onClick={() => handle()}`)
- ❌ Prop drilling deeply nested components

## Naming Conventions

- `PascalCase` - Components, interfaces, types
- `camelCase` - Hooks (must start with `use`), functions, variables
- `handleEventName` - Event handlers (e.g., `handleClick`)
- Files named after main export: `Button.tsx` exports `Button`

## Pre-Commit

- Component renders without errors
- Props properly typed with interfaces
- No unused props or variables
- Hooks have correct dependencies
- Loading and error states handled
- Tests written for component behavior

---

**Deep Dive**: See [knowledge-base/react/README.md](../../knowledge-base/react/README.md) for comprehensive patterns including:

- ✅ Full component examples (Button with TypeScript, 20+ line examples)
- ✅ State management (useState, useReducer with typed actions)
- ✅ Performance optimization (useMemo, useCallback patterns)
- ✅ Effects with cleanup (AbortController pattern)
- ✅ Component composition (Card/CardHeader/CardBody)
- ✅ Custom hooks (useFetch with loading/error states)
- ✅ Testing strategies
- ✅ All anti-patterns with explanations

**For design patterns**: See [knowledge-base/codebase/development-guide.md](../../knowledge-base/codebase/development-guide.md) for SOLID principles
