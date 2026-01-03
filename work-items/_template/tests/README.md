# Test Suites Template

This directory contains test specifications organized as individual test suite files following the **TS-XXX** naming convention (similar to ADRs: `ADR-001-name.md`, `RI-001-name.md`).

---

## Test Suite File Structure

Each test suite is documented in a separate markdown file:

```
tests/
├── README.md                           # This file - overview and guidelines
├── TS-001-example-test-suite.md        # Template for test suite files
├── TS-001-input-validation.md          # Actual test suite 1
├── TS-002-domain-model.md              # Actual test suite 2
└── ...                                 # Additional test suites
```

---

## Creating New Test Suites

### Step 1: Copy the Template

```bash
cp TS-001-example-test-suite.md TS-XXX-your-suite-name.md
```

### Step 2: Fill in Metadata

Update the header section:

- **Feature**: Work item ID and feature name
- **Suite**: Descriptive test suite name
- **Type**: Unit | Integration | E2E
- **Location**: Path to actual test file (`.test.ts`)

**Note**: Coverage targets are tracked at the project level (70%+ overall). Individual test suite targets are not needed as developers aim for maximum coverage within each suite.

### Step 3: Document Test Cases

1. **Purpose**: Why this test suite exists
2. **Test Checklist**: List of test cases with Given/When/Then structure
3. **Gherkin Specifications**: Detailed scenarios with data tables
4. **Test Data Setup**: Fixtures, mocks, test data
5. **Dependencies**: What this suite depends on
6. **Notes**: Important considerations, constraints, patterns
7. **Status**: Tracking checklist

---

## Test Suite Naming Convention

Format: `TS-XXX-descriptive-name.md`

**Examples**:

- `TS-001-input-validation.md`
- `TS-002-domain-model.md`
- `TS-003-repository-layer.md`
- `TS-004-api-endpoint.md`

**Sequential Numbering**: Use next available number (TS-001, TS-002, TS-003...)

**Descriptive Names**: Use kebab-case, match test focus

---

## Gherkin Format Guidelines

All test specifications use **Gherkin syntax** (Given/When/Then):

### Basic Scenario

```gherkin
Scenario: Create user with valid data
  Given a user creation request with email and name
  When the repository creates the user
  Then the user is persisted to the database
  And the returned User has a generated UUID
```

### Scenario with Data Tables

```gherkin
Scenario: Validate thought input
  Given a thought creation request with:
    | field  | value                 |
    | text   | "Build local Alexa"   |
    | source | "text"                |
  When the schema validates the input
  Then the validation succeeds
  And the output contains:
    | field          | value           |
    | processedState | "UNPROCESSED"   |
```

### Scenario Outline (Multiple Cases)

```gherkin
Scenario Outline: Reject invalid source values
  Given a thought with source "<source>"
  When the schema validates
  Then validation fails with error "<error>"

  Examples:
    | source    | error                |
    | invalid   | Invalid enum value   |
    | unknown   | Invalid enum value   |
    | ""        | Invalid enum value   |
```

**Reference**: See [knowledge-base/jest/README.md](../../../knowledge-base/jest/README.md) for Gherkin best practices.

---

## Test Types

### Unit Tests (Pure Logic)

- **Examples**: Validators, domain models, error classes
- **No Dependencies**: No database, no HTTP, no file system
- **Fast**: < 1ms per test

### Integration Tests (With Dependencies)

- **Examples**: Repositories (with DB), API endpoints (with HTTP)
- **Real Dependencies**: In-memory database, Supertest HTTP
- **Moderate Speed**: < 100ms per test

### E2E Tests (Full Stack)

- **Examples**: User workflows, UI interactions
- **Real Application**: Full frontend + backend + database
- **Slow**: < 1s per test

**Note**: All tests aim for maximum coverage. Project-level coverage target is 70%+ overall (configured in jest.config.js).

---

## TDD Workflow (Developer Reference)

When implementing tests from specifications:

### 1. RED Phase (Failing Test)

```typescript
// Write test FIRST based on Gherkin spec
it('should create thought with valid data', () => {
  const result = thoughtSchema.parse(VALID_INPUT);
  expect(result.text).toBe('Build local Alexa');
});
// Run → ❌ FAIL: thoughtSchema is not defined
```

### 2. GREEN Phase (Make It Pass)

```typescript
// Implement minimum code to pass test
export const thoughtSchema = z.object({
  text: z.string().min(1),
  source: z.enum(['text', 'voice']).default('text'),
});
// Run → ✅ PASS
```

### 3. REFACTOR Phase (Improve)

```typescript
// Clean up, extract constants, improve code
export const thoughtSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty'),
  source: z.enum(['text', 'voice', 'web', 'email', 'import']).default('text'),
});
// Run → ✅ PASS (still green after refactor)
```

**Reference**: See [knowledge-base/tdd/README.md](../../../knowledge-base/tdd/README.md) for complete TDD guide.

---

## Critical Testing Notes

### SQLite Serialization

For features using SQLite database with Prisma:

```javascript
// jest.config.js
module.exports = {
  maxWorkers: 1, // Required for SQLite WAL mode
};
```

**Why**: SQLite in WAL mode cannot handle concurrent writers. Multiple Jest workers cause database lock errors.

See [knowledge-base/jest/README.md - SQLite section](../../../knowledge-base/jest/README.md) for details.

### Test Isolation

Each test should:

- ✅ Set up its own test data (beforeEach)
- ✅ Clean up after itself (afterEach)
- ✅ Be runnable independently
- ✅ Not depend on test execution order
- ✅ Use in-memory database (not dev.db)

---

## Status Tracking

Each test suite file has a status section:

```markdown
## Status

- [x] Specification completed
- [ ] Test implementation (developer)
- [ ] All tests passing
```

Update checkboxes as tests are implemented and pass.

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific suite (match file name)
npm test -- TS-001

# Watch mode (TDD)
npm test -- --watch

# With coverage
npm test -- --coverage

# Integration tests only
npm test -- --testPathPattern=infrastructure

# Unit tests only
npm test -- --testPathPattern="(validators|domain|errors)"
```

---

## Additional Resources

- **Jest**: [knowledge-base/jest/README.md](../../../knowledge-base/jest/README.md)
- **TDD**: [knowledge-base/tdd/README.md](../../../knowledge-base/tdd/README.md)
- **Supertest**: [knowledge-base/supertest/README.md](../../../knowledge-base/supertest/README.md)
- **Testing Library**: [knowledge-base/testing-library/README.md](../../../knowledge-base/testing-library/README.md)
- **Playwright**: [knowledge-base/playwright/README.md](../../../knowledge-base/playwright/README.md)

---

## Example: Complete Test Suite File Structure

See [TS-001-example-test-suite.md](TS-001-example-test-suite.md) for a complete example demonstrating all sections.
Scenario Outline: Validate different sources
Given text is "Valid text"
And source is "<source>"
When validation runs
Then result is <valid>

Examples:
| source | valid |
| text | true |
| voice | true |
| api | true |
| fake | false |

```

## Best Practices

### For Testers

1. **Reference Contracts** - Use `../architecture/contracts.md` as source of truth
2. **Be Specific** - Clear Given/When/Then, no ambiguity
3. **Cover Edge Cases** - Empty strings, null, max length, invalid enums
4. **Test Contracts** - Verify "returns null vs throws" guarantees
5. **Document Gaps** - Note anything that can't be tested and why

### For Developers

1. **One Scenario = One Test** - Each Gherkin scenario becomes one `it()` block
2. **Follow TDD** - Write test BEFORE implementation
3. **Use AAA Pattern** - Arrange, Act, Assert (matches Given/When/Then)
4. **Keep Tests Isolated** - Each test should be independent
5. **Clean Test Output** - Suppress expected error logs (see Jest best practices)

## Coverage Philosophy

**Quality over Quantity** - 70% coverage of critical paths is better than 100% coverage of trivial code.

Focus on:
- ✅ User-facing behavior
- ✅ Error handling paths
- ✅ Contract guarantees (null vs throw, idempotency)
- ✅ Edge cases (empty, max, invalid)

Skip:
- ❌ Trivial getters/setters
- ❌ Framework boilerplate
- ❌ Type-only files

## Integration with TDD Workflow

The test plan drives the TDD cycle:

```

1. Tester writes Gherkin scenario in test-plan.md
   ↓
2. Developer reads scenario
   ↓
3. Developer writes failing Jest test (RED)
   ↓
4. Developer implements feature (GREEN)
   ↓
5. Developer refactors (maintain GREEN)
   ↓
6. Developer checks off test in test-plan.md
   ↓
7. Repeat with next scenario

```

## References

- **TDD Guide**: [knowledge-base/tdd/README.md](../../../knowledge-base/tdd/README.md)
- **Jest Guide**: [knowledge-base/jest/README.md](../../../knowledge-base/jest/README.md)
- **Gherkin Syntax**: [cucumber.io/docs/gherkin/reference](https://cucumber.io/docs/gherkin/reference/)
- **Testing Library**: [knowledge-base/testing-library/README.md](../../../knowledge-base/testing-library/README.md)

---

**Need Help?**
- Unclear contracts? → Ask architect agent
- Can't test something? → Document in "Known Limitations" section
- Test failing? → Check contract guarantees match implementation
```
