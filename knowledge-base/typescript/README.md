# TypeScript

> Typed superset of JavaScript used across the Zach.ai frontend and backend for safer, more maintainable code.

**Current Version**: 5.6.0  
**Last Updated**: 2025-12-31  
**Status**: ✅ Stable (language choice) · 🚧 Documentation In Progress

## Quick Links

- [Official Documentation](https://www.typescriptlang.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Release Notes – 5.6](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-6.html)
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig)
- [GitHub Repository](https://github.com/microsoft/TypeScript)

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

### What is TypeScript?

TypeScript is a statically typed superset of JavaScript that compiles to plain JavaScript. It adds:

- A compile-time type system (interfaces, unions, generics, enums, etc.).
- Modern ECMAScript features even when targeting older runtimes.
- Tooling benefits such as IntelliSense, refactoring support, and safer API evolution.

In Zach.ai, TypeScript is used for:

- The backend Express API in [backend/src](../../backend/src).  
- The Vite-powered frontend in [frontend/src](../../frontend/src).

The compiler is configured to run in **strict mode** across both projects, enforcing a high level of type safety.

### Key Features We Rely On

- **Strict type checking**: `strict: true` in both backend and frontend `tsconfig.json`.
- **Modern ECMAScript targets**: `target: "ES2020"` to use async/await, optional chaining, etc.
- **Module systems** that match our runtimes:
	- Backend: CommonJS output (`module: "CommonJS"`) for Node-style `require`/`module.exports` under the hood.
	- Frontend: ES modules (`module: "ESNext"`, `moduleResolution: "Bundler"`) for Vite.
- **Type definitions for libraries** via `@types/*` packages.
- **Isolated modules** on the frontend to align with Vite's per-file compilation.

### When to Use TypeScript

Use TypeScript for all application code in this repo:

- Backend logic, HTTP handlers, and utilities.
- Frontend logic, utilities, and (future) React components.
- Shared types that may eventually move into a separate package.

Plain JavaScript should only appear in build tooling or minimal configuration files that are not part of runtime logic.

---

## Why We Use It

### Our Specific Needs

Zach.ai is intended to be a long-lived codebase maintained by multiple developers and AI assistants. TypeScript helps us:

- **Prevent common bugs** before runtime (null/undefined issues, wrong argument orders, mis-typed objects).
- **Enforce contracts** between layers (API handlers, utilities, and tests share clear types).
- **Improve refactoring safety** (rename fields, change function signatures, and let the compiler guide fixes).
- **Make intent explicit** (type names and shapes encode domain concepts).
- **Integrate with tooling** such as ESLint, Jest, Vite, and PM2 workflows.

### Alternatives Considered

- **Plain JavaScript**:
	- Pros: Less upfront syntax, no compilation step.
	- Cons: No static safety, weaker tooling, easier to introduce regressions.
	- Decision: Rejected in favor of stronger guarantees and clearer APIs.

- **Flow**:
	- Pros: Also provides static typing for JS.
	- Cons: Smaller ecosystem, less active community, weaker editor support compared to TypeScript.
	- Decision: Rejected; TypeScript has become the industry standard.

### Decision Factors

- **TypeScript ecosystem maturity** (tooling, documentation, community).
- **Direct integration** with our other core technologies (ESLint, Jest, Vite, Express, future React).
- **Enterprise patterns**: TypeScript supports the SOLID, DRY, KISS guidance in [development-guide.md](../codebase/development-guide.md).

---

## Official Resources

Use these as the canonical reference for language behavior and compiler options:

### Primary Documentation

- **Main Docs** – https://www.typescriptlang.org/docs/  
	High-level guides, reference docs, and deep dives into the type system.

- **TypeScript Handbook** – https://www.typescriptlang.org/docs/handbook/intro.html  
	Progressive introduction to core language features and patterns.

- **TSConfig Reference** – https://www.typescriptlang.org/tsconfig  
	Canonical reference for all compiler options, their defaults, and interactions.

- **Release Notes (5.6)** – https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-6.html  
	Details on new features, breaking changes, and deprecations in 5.6.

- **GitHub Repository** – https://github.com/microsoft/TypeScript  
	Source code, issue tracker, and discussions.

### Community & Support

- **Stack Overflow** – https://stackoverflow.com/questions/tagged/typescript  
	Search for specific error messages and common patterns.

- **TypeScript Discord** – Linked from the official community page.  
	Real-time chat and questions.

### When to Use What

- Start with the **Handbook** for conceptual understanding.
- Use **TSConfig Reference** when adjusting compiler options.
- Read **Release Notes** when upgrading major or minor versions.
- Search **Stack Overflow** for specific compiler error messages or tricky edge cases.

---

## Version History

### Current: 5.6.x

We standardize on TypeScript `^5.6.0` in both [backend/package.json](../../backend/package.json) and [frontend/package.json](../../frontend/package.json).

Key 5.6 changes relevant to Zach.ai:

- **Improved safety around logical expressions**: catches always-truthy or always-nullish checks that are likely bugs.
- **Iterator helper methods support**: prepares us for modern JavaScript iteration APIs if we use generator-heavy code.
- **`--noUncheckedSideEffectImports` and `--noCheck` options**: relevant when we fine-tune build pipelines for speed vs safety.

While we do not currently expose all of these options in our `tsconfig.json` files, our configuration is compatible with 5.6 and can be tightened over time.

### Previous Major Versions

The repository was created already on TypeScript 5.x, so we do not have legacy 3.x/4.x migration baggage. If we introduce external code or examples from older TypeScript versions, we should:

- Replace deprecated patterns with 5.x idioms (e.g., use `unknown` instead of `any` where appropriate).
- Rely on modern narrowing and discriminated unions instead of complex type assertions.

### Upgrade Path

When moving from 5.6 to a future 5.x or 6.x:

1. Read the official release notes and identify breaking changes.
2. Run `npm outdated` at the root to see the latest TypeScript version.
3. Update TypeScript in root, backend, and frontend package.json files.
4. Run `npm run typecheck` and fix new compiler errors.
5. Update this document with any newly relevant options or patterns.

See [Maintenance Notes](#maintenance-notes) for the review cadence.

---

## Installation & Setup

### Where TypeScript Is Installed

- Root: Development tooling (ESLint integration, shared scripts).  
- Backend: `typescript` in [backend/package.json](../../backend/package.json) with scripts:
	- `typecheck`: `tsc --noEmit`
	- `build`: `tsc -p tsconfig.json`
- Frontend: `typescript` in [frontend/package.json](../../frontend/package.json) with scripts:
	- `typecheck`: `tsc --noEmit`
	- `build`: `vite build` (Vite handles transpilation; TypeScript does type-checking only).

### Global Workflow

From the repository root, we run:

- `npm run typecheck` – Type checks backend and frontend using `tsc --noEmit`.
- `npm run validate` – Runs type checking, ESLint, and Prettier as described in [validation.md](../codebase/validation.md).

TypeScript is not used as a global dependency; we rely on per-project installations to keep versions consistent.

### Backend `tsconfig.json`

Located at [backend/tsconfig.json](../../backend/tsconfig.json):

```jsonc
{
	"compilerOptions": {
		"target": "ES2020",
		"module": "CommonJS",
		"outDir": "dist",
		"rootDir": "src",
		"strict": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"skipLibCheck": true
	},
	"include": ["src"]
}
```

### Frontend `tsconfig.json`

Located at [frontend/tsconfig.json](../../frontend/tsconfig.json):

```jsonc
{
	"compilerOptions": {
		"target": "ES2020",
		"useDefineForClassFields": true,
		"module": "ESNext",
		"lib": ["ES2020", "DOM"],
		"moduleResolution": "Bundler",
		"resolveJsonModule": true,
		"isolatedModules": true,
		"noEmit": true,
		"strict": true,
		"skipLibCheck": true
	},
	"include": ["src"]
}
```

These configurations are the canonical reference for new services or packages we add.

---

## Core Concepts

This section gives a brief overview of the TypeScript features we rely on heavily. See the official Handbook for a full tour.

### Types and Interfaces

- **Primitive types**: `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`.
- **Object shapes** are described using interfaces or type aliases:

```ts
interface Metrics {
	uptimeMs: number;
	averageResponseTimeMs: number;
}

type Nullable<T> = T | null;
```

Guidelines:

- Prefer **interfaces** for object shapes that may be extended.
- Use **type aliases** for unions, intersections, or utility types.

### Unions and Narrowing

Union types allow values to be one of several types. We use **narrowing** (via `typeof`, `in`, or custom predicates) to safely work with them.

```ts
type ResponseState =
	| { status: "loading" }
	| { status: "success"; data: string }
	| { status: "error"; message: string };

function getMessage(state: ResponseState): string {
	switch (state.status) {
		case "loading":
			return "Loading";
		case "success":
			return state.data;
		case "error":
			return state.message;
	}
}
```

### Generics

Generics allow us to write reusable, type-safe functions and data structures.

```ts
function identity<T>(value: T): T {
	return value;
}

const name = identity("Zach"); // T is string
const count = identity(42); // T is number
```

We follow the guidance in [development-guide.md](../codebase/development-guide.md) for keeping generic APIs simple and readable.

### Modules

We use **ES module syntax** (`import`/`export`) in both backend and frontend. TypeScript compiles this to CommonJS for the backend and preserves ES modules for the frontend/bundler.

```ts
// backend/src/utils/metrics.ts
export function calculateUptime(startTimeMs: number): number {
	return Date.now() - startTimeMs;
}
```

---

## Configuration

This section explains why our `tsconfig.json` files look the way they do.

### Shared Principles

- **Strict mode enabled** (`strict: true`) everywhere.
- **Modern target** (`"ES2020"`) to align with current Node and browser capabilities.
- **Skip library checking** (`skipLibCheck: true`) for faster builds; we assume DefinitelyTyped packages are correct.
- **Consistent casing** enforcement in backend (`forceConsistentCasingInFileNames`) to avoid cross-platform issues.

### Backend Configuration Choices

- `module: "CommonJS"` – Matches current Node.js configuration and our PM2 runtime.
- `outDir: "dist"` / `rootDir: "src"` – Clear separation between source and compiled output.
- `esModuleInterop: true` – Simplifies importing CommonJS modules with default import syntax.

Implications:

- All backend source files should live under `src/`.
- Imports from CommonJS libraries (like Express) use `import express from "express";` without additional ceremony.

### Frontend Configuration Choices

- `module: "ESNext"` / `moduleResolution: "Bundler"` – Delegates module resolution to Vite.
- `lib: ["ES2020", "DOM"]` – Ensures browser and DOM types are available.
- `isolatedModules: true` and `noEmit: true` – Each file is compiled in isolation (for Vite) and TypeScript performs only type checking; Vite handles emitting code.

Implications:

- Avoid constructs that rely on cross-file analysis for emit (like namespaces or certain const enums); use standard modules and inline enums instead.
- All TypeScript code in `frontend/src` is assumed to be browser code with DOM access.

---

## Best Practices

This section complements `.github/instructions/typescript.instructions.md` and focuses on how we apply TypeScript in Zach.ai.

### Strict Mode and Safety

- **Always keep `strict: true`** in all new projects or packages.
- Avoid disabling individual strict flags unless there is a documented, reviewed reason.

### Avoiding `any`

- Do **not** use `any` except as a temporary measure during migrations or prototyping.
- Prefer `unknown` when the type is truly unknown and must be narrowed.

```ts
function parseJson(value: string): unknown {
	return JSON.parse(value);
}

function useConfig(raw: unknown) {
	if (
		typeof raw === "object" &&
		raw !== null &&
		"baseUrl" in raw &&
		typeof (raw as { baseUrl: unknown }).baseUrl === "string"
	) {
		const baseUrl = (raw as { baseUrl: string }).baseUrl;
		// safe to use baseUrl here
	}
}
```

### Interfaces vs Types

- Use **interfaces** for public object contracts and domain models.
- Use **type aliases** for unions, intersections, utility types, and function types.

### Naming Conventions

- Types and interfaces: `PascalCase` (e.g., `Metrics`, `HealthResponse`).
- Generic parameters: short but meaningful (`T`, `TItem`, `TResult`).
- Enums and discriminant fields: clear and stable string literals.

### Error Handling

- Do not throw `string` values; always throw `Error` (or subclasses) with clear messages.
- When using `catch`, prefer `unknown` and narrow explicitly:

```ts
try {
	// ...
} catch (error: unknown) {
	if (error instanceof Error) {
		// handle
	}
}
```

---

## Common Patterns

Even though the current codebase is small, there are patterns we want to standardize on as it grows.

### Result-Like Types for Operations

Use discriminated unions to model operations that can succeed or fail:

```ts
type Result<T> =
	| { ok: true; value: T }
	| { ok: false; error: string };

function safeParseInt(value: string): Result<number> {
	const parsed = Number.parseInt(value, 10);
	if (Number.isNaN(parsed)) {
		return { ok: false, error: "Invalid integer" };
	}
	return { ok: true, value: parsed };
}
```

### Utility Types

Leverage built-in utility types like `Partial`, `Pick`, `Omit`, `Readonly`, and `Record` for clarity and reuse.

```ts
interface User {
	id: string;
	name: string;
	email: string;
}

type UserUpdate = Partial<Pick<User, "name" | "email">>;
```

### Domain Models

Keep domain types close to where they are used and avoid over-abstracting early. As the codebase grows, move stable types into shared modules.

---

## TypeScript Integration

TypeScript is a foundational dependency for several other tools in this repo.

### ESLint (typescript-eslint)

- ESLint is configured via [eslint.config.mjs](../../eslint.config.mjs).
- We use `typescript-eslint` to lint `.ts` files with TypeScript awareness.
- The combination of TypeScript + ESLint enforces both **type safety** and **style/bug-catching** rules.

### Jest and ts-jest

- Backend tests: Jest with `ts-jest` for TypeScript support, as configured in [backend/jest.config.js](../../backend/jest.config.js).
- Frontend tests: Jest runs against TypeScript using its own config in [frontend/jest.config.js](../../frontend/jest.config.js).
- TypeScript compiles test files as well, so tests benefit from the same strictness as application code.

### Vite

- Vite uses esbuild or esbuild+Rollup under the hood to transpile TypeScript.
- TypeScript is responsible only for **type checking** (`noEmit: true`, `tsc --noEmit`).
- This separation keeps dev builds fast while still enforcing type safety via scripts like `npm run typecheck`.

### Express

- Express types come from `@types/express`.
- Handlers should use the `Request`, `Response`, and `NextFunction` types for clarity:

```ts
import type { Request, Response } from "express";

export function healthHandler(req: Request, res: Response): void {
	res.json({ status: "ok", timestamp: Date.now() });
}
```

### Future React Integration

- When React is introduced, components will be written in `.tsx` with proper prop and state typing.
- See `.github/instructions/react.instructions.md` for React-specific guidance.

---

## Testing

TypeScript influences how we write and run tests, but the core patterns are Jest-based.

### Type-Checking Test Code

- Tests live under `__tests__/` and are written in TypeScript.
- They are type-checked alongside application code using `tsc --noEmit`.
- This ensures we don't accidentally call non-existent methods or rely on wrong types in tests.

### Jest Configuration

- Backend: uses `ts-jest` preset to compile TypeScript on the fly.
- Frontend: uses Jest with a transformer that understands TypeScript and JSX where needed.

### Documenting Examples

When you add examples to this document, consider adding a corresponding test in a future `docs-examples` test file to ensure the code continues to compile and behave as shown.

---

## Performance

TypeScript itself can affect build and type-check times.

### Current Settings

- `skipLibCheck: true` speeds up compilation by skipping `.d.ts` files.
- No project references yet; the codebase is small enough that a flat project is fine.

### Potential Future Optimizations

- Introduce **project references** if we split the repo into multiple TypeScript packages.
- Use `--incremental` builds for faster re-checking in large projects.
- Consider additional diagnostic flags (`--extendedDiagnostics`) if compilation becomes slow.

---

## Security

TypeScript is not a security feature by itself, but stronger typing helps prevent many classes of bugs that can become vulnerabilities.

Examples:

- Avoiding unchecked `any` reduces injection-prone string concatenation and unsafe object access.
- Accurate types for environment variables and configuration make it harder to misconfigure critical settings.

However, we still need runtime validation and security best practices at the Express and deployment layers (see [express/README.md](../express/README.md) and [pm2/README.md](../pm2/README.md)).

---

## Troubleshooting

### Common Errors and Fixes

The following are common TypeScript errors you may see in this repo and how to address them.

#### 1. `Object is possibly 'undefined'`

Cause: `strictNullChecks` is enabled and you're accessing a property without checking for `undefined`.

Fix:

- Use optional chaining (`obj?.prop`).
- Add explicit guards:

```ts
if (!config) {
	throw new Error("Config not loaded");
}
useConfig(config);
```

#### 2. `Type 'X' is not assignable to type 'Y'`

Cause: Mismatched function arguments or return types.

Fix:

- Check imports to ensure you're using the correct type.
- Adjust the function signature or call site so they agree.

#### 3. `Cannot find module './foo' or its corresponding type declarations.`

Cause: Wrong relative path, missing file, or misconfigured `include` paths.

Fix:

- Confirm the file exists under `src/` and path casing matches.
- Ensure `"include": ["src"]` covers the folder the file is in.

#### 4. `Parameter 'x' implicitly has an 'any' type.`

Cause: `noImplicitAny` (part of `strict`) is enabled.

Fix:

- Add an explicit parameter type:

```ts
function formatName(name: string): string {
	return name.trim();
}
```

#### 5. `Cannot use import statement outside a module`

Cause: Incorrect module configuration for the runtime environment.

Fix:

- Backend: ensure `module: "CommonJS"` and Node is not treating the file as ESM unexpectedly.
- Frontend: rely on Vite's default ESM behavior; avoid running `.ts` directly with `node`.

---

## Migration Guides

### Upgrading to a New TypeScript Minor/Major

1. **Review Release Notes** for the target version.
2. **Update Dependencies** in root, backend, and frontend `package.json`.
3. Run `npm install` and then `npm run typecheck`.
4. Fix new compiler errors and warnings.
5. Update this document with any new patterns or options we adopt.

### Adding a New TypeScript Project

If we add another package (e.g., shared library):

1. Copy and adapt the relevant `tsconfig.json` (backend or frontend) depending on environment.
2. Enable `strict: true` from the start.
3. Integrate with root scripts for `npm run typecheck`.

---

## Comparison with Alternatives

### TypeScript vs Plain JavaScript

- **Pros**: Compile-time safety, better tooling, easier refactoring.
- **Cons**: Compilation step, learning curve for advanced type features.

For Zach.ai, the benefits far outweigh the costs, especially as the codebase grows.

### TypeScript vs Flow

- TypeScript has broader ecosystem support, more active development, and better integration with our chosen tools (ESLint, Vite, Jest).

---

## Learning Resources

### For Beginners

- Official Handbook – introductory chapters.
- Basic tutorials from the TypeScript docs.

### For Intermediate Users

- Handbook sections on generics, advanced types, and declaration files.
- Articles on discriminated unions and exhaustive checking.

### For Advanced Users

- Deep dives into conditional types, mapped types, and type-level programming.
- Discussions and RFCs on the TypeScript GitHub repo.

As you learn, favor patterns that match the simplicity and clarity goals in [development-guide.md](../codebase/development-guide.md) over overly clever type tricks.

---

## Maintenance Notes

- **Next Review Due**: 2026-03-31
- **Known Gaps**:
	- This document should be updated once React components are added to show concrete `.tsx` examples.
	- More real-world examples from `backend/src` and `frontend/src` can be inlined as the codebase grows.
- **Enhancement Ideas**:
	- Add a `quick-reference.md` with command snippets and common patterns.
	- Add explicit links to example types and functions once more domain logic exists.

During each quarterly documentation review (see [creation-guide.md](../guidelines/creation-guide.md)), verify that:

- The recorded TypeScript version matches `package.json`.
- All example code still compiles under `npm run typecheck`.
- New patterns adopted in the codebase are reflected here.
