# Refactor stage instructions (TDD Red Green Refactor)

## Purpose

You are in the Refactor stage. The goal is to improve design, readability, and maintainability while preserving observable behavior. No new features. No behavior changes.

## Non negotiables

1. Tests must be green before starting.
2. Keep tests green throughout refactor. Run targeted tests after each small change.
3. Refactor in small, reversible steps. Prefer a sequence of tiny refactorings over a rewrite.
4. Preserve public API and externally observable behavior unless the task explicitly calls for an API change and tests cover it.
5. If you discover missing test coverage that makes refactor unsafe, stop refactoring and add characterization tests first, then return to refactor.
6. At the end of the refactor stage, run `npm run validate` from the repo root.

## Refactor loop (repeat)

1. Confirm baseline
   1. Run the relevant unit test suite for the area you will touch.
   2. If any failures exist, fix them before refactor.
2. Identify the smallest improvement
   1. Pick one code smell or one design issue to address.
   2. Define a tiny objective you can complete in minutes.
3. Apply one refactoring move
   Use IDE safe refactors when possible. Examples
   1. Rename for clarity
   2. Extract function or method
   3. Inline variable or method
   4. Move function or method to a better home
   5. Introduce parameter object
   6. Split a large function into cohesive units
   7. Replace conditional with polymorphism only when it truly simplifies
4. Run tests immediately
   1. Run the smallest fast test set that gives confidence.
   2. If anything fails, revert or fix immediately. Do not continue piling changes.
5. Re assess
   1. Did coupling decrease
   2. Did readability improve
   3. Did duplication reduce
      If yes, continue. If no, undo and try a different small move.

## Design principles to apply during refactor

### SOLID as refactor heuristics

1. Single Responsibility
   If a unit has multiple reasons to change, split responsibilities.
2. Open Closed
   Prefer extension points over repeated edits to the same conditional logic.
3. Liskov Substitution
   Ensure subtypes can stand in for supertypes without surprises.
4. Interface Segregation
   Prefer small focused interfaces over fat ones.
5. Dependency Inversion
   Depend on abstractions at boundaries, keep details behind adapters.

### Clean architecture boundaries

1. Push IO, frameworks, and infrastructure to the edges.
2. Keep domain logic free of transport, persistence, and UI concerns.
3. Introduce adapters rather than leaking vendor types through core logic.

## Testing guidance during refactor

1. Do not change tests to match implementation details.
2. Only adjust tests when they assert incidental structure rather than behavior.
3. Preserve coverage that protects behavior
   1. Critical business rules
   2. Edge cases
   3. Error handling
4. Avoid over mocking. Prefer testing behavior through public surface.
5. If you must change the public API
   1. Add or update tests first to reflect desired behavior
   2. Make the change
   3. Refactor again to simplify

## What good looks like at the end

1. All tests green, ideally with the same or better coverage.
2. Reduced duplication, clearer naming, smaller functions, clearer boundaries.
3. Lower cognitive load
   1. Fewer concepts per file
   2. More cohesive units
   3. Clearer data flow
4. Minimal diff per commit sized chunk, easy to review.

## Guardrails against refactor thrash

1. Avoid speculative abstractions.
2. Avoid introducing patterns unless there is clear repeated pressure.
3. Prefer the smallest refactor that makes the next change easier.
4. Keep refactor changes separate from behavior changes. If you must do both, do behavior in a separate Red Green Refactor cycle.
