# Retrospective

Use these prompts throughout the feature development lifecycle. Each agent adds their findings after completing their phase, creating a continuous improvement loop.

## 1. Quick Summary

- Outcome:
- Date range:
- Participants:

---

## 2. Phase-Specific Retrospectives

Each agent documents their findings after completing their phase. This creates a timeline of decisions, learnings, and improvements throughout the feature development.

### Planning Phase (Planner Agent)

**Date Completed**: YYYY-MM-DD

**What Went Well:**

- Requirements gathering wins
- APR structure clarity
- Stakeholder collaboration

**What Was Challenging:**

- Missing or unclear requirements
- Scope creep or ambiguity
- Difficulty estimating complexity

**Learnings:**

- What did we learn about the feature domain?
- Were there unexpected requirements?
- How accurate were initial assumptions?

**Handoff Quality:**

- Was the APR clear enough for architecture design?
- Did it include all necessary accessibility/performance requirements?
- What could make the next planning phase better?

**Actions for Improvement:**

- [ ] Update APR template
- [ ] Add new prompt/skill
- [ ] Update knowledge base section

---

### Architecture Phase (Architect Agent)

**Date Completed**: YYYY-MM-DD

**What Went Well:**

- Architecture decisions that proved correct
- Design patterns that fit well
- ADR quality and clarity

**What Was Challenging:**

- Missing information from APR
- Difficult trade-off decisions
- Integration complexity with existing code

**Learnings:**

- Did the chosen patterns/technologies work as expected?
- Were there better alternatives we didn't consider?
- How well did contracts serve testers and developers?

**Handoff Quality:**

- Were contracts clear and complete for testers?
- Were ADRs detailed enough for developers?
- Did diagrams effectively communicate design?

**Actions for Improvement:**

- [ ] Update architecture templates/ADRs
- [ ] Enhance contract documentation
- [ ] Add new design patterns to knowledge base

---

### Testing Phase (Tester Agent)

**Date Completed**: YYYY-MM-DD

**What Went Well:**

- Test strategy effectiveness
- Coverage achieved
- Tools and frameworks used

**What Was Challenging:**

- Missing or unclear contracts from architect
- Difficult-to-test scenarios
- Tooling limitations or setup issues

**Learnings:**

- Were contracts sufficient for writing tests?
- Did we discover untestable code patterns?
- Were coverage targets realistic?

**Handoff Quality:**

- Were test specifications clear for developers?
- Did Gherkin scenarios match implementation needs?
- Were edge cases well-documented?

**Actions for Improvement:**

- [ ] Update test templates/strategies
- [ ] Improve testing documentation
- [ ] Add new testing patterns to knowledge base

---

### Development Phase (Developer Agent)

**Date Completed**: YYYY-MM-DD

**What Went Well:**

- Implementation wins (clean code, SOLID compliance)
- TDD/testing approach effectiveness
- Tools and patterns used successfully

**What Was Challenging:**

- Architecture misalignments or gaps
- Unexpected complexity or technical debt
- TypeScript/testing issues (act() warnings, type errors)

**Learnings:**

- Did ADRs guide implementation effectively?
- Were tests helpful or did they need major rewrites?
- What patterns/practices should we adopt/avoid?

**Code Quality:**

- SOLID compliance score (1-10):
- Dead code removed: Yes/No
- TypeScript errors: Zero throughout? Yes/No
- Test coverage achieved: \_\_%

**Actions for Improvement:**

- [ ] Update development guide
- [ ] Add new code patterns/examples
- [ ] Enhance validation scripts

---

## 3. Overall Feature Retrospective

Complete this section after all phases are done (or when stopping work).

**What Went Well Overall:**

- Celebrate wins across all phases

**What Was Painful or Missing:**

- Cross-phase information gaps
- Workflow inefficiencies
- Tooling or process issues

**Key Learnings:**

- What did we learn that applies to future features?
- Which experiments should we try next time?

**Improvements & Actions:**

| Category       | Action                        | Owner | Target Date |
| -------------- | ----------------------------- | ----- | ----------- |
| Knowledge base | Update doc/guide              |       |             |
| Agents/Skills  | Adjust instructions/tool sets |       |             |
| Tooling        | Script or automation idea     |       |             |
| Templates      | Update feature workflow       |       |             |

**Follow-ups:**

- List tasks that must roll into the backlog/issue tracker

---

> **Agent Instructions**: After completing your phase, add your retrospective findings to your section above BEFORE handing off to the next agent. This creates a continuous improvement feedback loop and helps future phases learn from earlier work.
