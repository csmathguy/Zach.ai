# TS-001: [Test Suite Name]

**Feature**: [Work Item ID] - [Feature Name]  
**Suite**: [Suite Name]  
**Type**: [Unit | Integration | E2E]  
**Location**: `[path/to/test/file.test.ts]`

---

## Purpose

[One-sentence description of what this test suite validates]

---

## Test Checklist

- [ ] **[Test case name]**
  - Given [precondition/context]
  - When [action taken]
  - Then [expected outcome]

- [ ] **[Another test case]**
  - Given [precondition]
  - When [action]
  - Then [outcome]

[Add more test cases as needed]

---

## Gherkin Specifications

### Scenario: [Scenario name]

```gherkin
Given [precondition/context]
And [additional context if needed]
When [action taken]
Then [expected outcome]
And [additional verification]
```

### Scenario: [Another scenario]

```gherkin
Given [precondition]
When [action]
Then [expected result]
```

[Add more Gherkin scenarios as needed - one per test case in checklist]

---

## Test Data Setup

**Strategy**: [Describe test data fixtures, mocks, or database setup needed]

```typescript
// Example setup code
const TEST_FIXTURE = {
  // Test data
};

beforeEach(() => {
  // Setup logic
});

afterEach(() => {
  // Cleanup logic
});
```

---

## Dependencies

**Requires**:

- [List any other test suites that must pass first]
- [External dependencies or test utilities]

**Provides**:

- [What this suite validates for downstream tests]

---

## Notes

- [Any special considerations, known issues, or important context]
- [Performance expectations if applicable]
- [Edge cases or limitations]

---

**Status**: [Not Started | In Progress | Complete]
