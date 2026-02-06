---
name: plan-party-epic-review
description: Load party mode and conduct batch review of epic stories with BMAD agents using KISS and other principles
user-invocable: true
args: "<epic-number> [review]"
example: "/plan-party-epic-review 3"
example-code-review: "/plan-party-epic-review 3 review"
---

# Plan: Party Epic Review

<instructions>
Dual-mode batch review of an epic using party mode agents.

**Mode detection:**
- **Plan Review** (default): Reviews stories and implementation plans before development
- **Code Review**: Reviews actual implemented code after development — triggered when `review` is passed as second argument OR when all stories in the epic have `status: DONE` / `status: done`

**Argument parsing:** `{{args}}` is a single string. Parse it as follows:
- First word = epic number (e.g. `3`)
- Second word (optional) = `review` flag

Use the epic number (NOT raw `{{args}}`) for all glob patterns and status references below.

**Auto-detection:** Read each individual story file (`*.md`, not `*.implement.md`) in the epic's `stories/` directory and check for `Status: done` (case-insensitive). If every story has done status, automatically switch to Code Review mode. If any story is not done, use Plan Review mode unless `review` was explicitly passed (in which case, only review done stories).

## Step 1: Load Context & Determine State

Read these files for evaluation context:

**Project Context:**
```
_bmad-output/planning-artifacts/product-brief-*.md
```

**Evaluation Principles:**
```
docs/guides-agents/KISS-principle-agent-guide.md
docs/guides-agents/*-principle-*.md  (load any other principle guides found)
```

**Epic Context:**
```
_bmad-output/planning-artifacts/epics/epic-[epic-number]-*/overview.md
_bmad-output/planning-artifacts/epics/epic-[epic-number]-*/stories/index.md
```

**Sprint State:**
```
_bmad-output/implementation-artifacts/sprint-status.yaml
```

Read sprint-status.yaml to understand current epic and story statuses. This is the source of truth for mode detection. State updates are managed by BMM workflows — this skill only reads state, never writes it.

## Step 2: Load Party Mode

Invoke party mode workflow:
```
/bmad:core:workflows:party-mode
```

Once party is active, announce the review (adapt to detected mode):

**Plan Review mode:**
> **EPIC [epic-number] PLAN REVIEW**
>
> Reviewing all stories and implementation plans against:
> - KISS principles
> - [Any other loaded principle guides]
>
> The party will review each story, then I'll compile all suggestions.

**Code Review mode:**
> **EPIC [epic-number] CODE REVIEW**
>
> Reviewing implemented code for all done stories against:
> - KISS principles
> - [Any other loaded principle guides]
>
> The party will review each story's source code, then I'll compile improvements.

---

# Plan Review Mode (Pre-Implementation)

## Step 3: Review Each Story (No User Interaction)

For each story in the epic:

1. Read the story file and implementation plan
2. Present to the party as discussion topic (see template below)
3. Let agents discuss (2-3 rounds of responses)
4. Record draft suggestions internally
5. Move to next story automatically (no user prompt)

**Story review template:**

> **Reviewing Story {{N}}: {{title}}**
>
> Evaluate against loaded principles:
>
> 1. **Simplicity Check**: Is this the simplest approach? Unnecessary abstractions? Over-engineering?
> 2. **Story Alignment**: Does the plan address all acceptance criteria? Gaps or scope creep?
> 3. **Practical Concerns**: Real-world issues not addressed? Dependencies? Edge cases?
>
> Key KISS criteria:
> - No interface with single implementation
> - No features for hypothetical future needs
> - Functions do one thing
> - Prefer composition over inheritance
> - Duplication is cheaper than wrong abstraction

## Step 4: Party Consensus Round

After all stories have been reviewed individually, present the **complete set of draft suggestions** back to the party for approval:

1. Compile all draft suggestions from Step 3 into the categorized format
2. Present the full compiled draft to the party:

---
**CONSENSUS CHECK: Approve, revise, or reject each proposed change**

All party members review the full suggestion list. For each suggestion:
- **Approve** — agree it should be presented to the user
- **Revise** — adjust the suggestion (explain the revision)
- **Reject** — drop it (explain why: noise, contradictory, violates principles, etc.)

Also check:
- Do suggestions across stories contradict each other?
- Are any suggestions themselves over-engineered or violating KISS?
- Would implementing all suggestions together create new issues?
---

3. Let agents debate (2-3 rounds) until positions stabilize
4. Determine final status for each suggestion:
   - **Approved**: Party consensus — include in final summary
   - **Revised**: Modified by consensus — include revised version
   - **Contested**: No consensus reached — include both the suggestion and the dissenting view so the user can decide
   - **Rejected**: Party agrees to drop — exclude from final summary

<critical_rules>
- Never present a suggestion to the user that the party has rejected
- Contested suggestions must show both sides so the user can decide
- Drop suggestions the party agrees are noise, nitpicks, or violations of the principles being evaluated
</critical_rules>

## Step 5: Compile & Present

**If zero suggestions survived consensus:** Skip the summary template and present:

> **PLAN REVIEW COMPLETE — NO CHANGES NEEDED**
>
> The party reviewed all stories and implementation plans. No issues found — the epic is ready for development.

**If suggestions survived consensus:** Compile **only approved, revised, and contested suggestions** by category:

```markdown
# Epic [epic-number] Plan Review Summary

## Story {{N}}: {{title}}

### Simplify
- [Specific actionable suggestion]

### Remove
- [What to remove and why]

### Clarify
- [What needs clarification]

### Add
- [What's missing]

### Reorder
- [Sequence changes]

### Merge
- [What can be combined]

---
[Repeat for each story]
---

## Epic-Wide Observations

### Architectural Patterns
- [Cross-story patterns or gaps]

### Consistency Issues
- [Inconsistencies across stories]

### Missing Definitions
- [Schemas, state machines, etc. that need defining]
```

Present the compiled summary to user:

> **REVIEW COMPLETE** (all suggestions approved by party consensus)
>
> [Full compiled summary]
>
> For any **Contested** items, both viewpoints are shown — your call.
>
> **Options:**
> - Review specific story suggestions in detail
> - Fix all issues (I'll update the files)
> - Export suggestions to a file

## Step 6: Apply Plan Fixes

When the user chooses "Fix all issues":

1. Provide the KISS principle guide and other loaded principle guides as context
2. For each approved suggestion, apply changes to the appropriate file:
   - **Simplify/Remove/Clarify/Add** on story content → update the story `.md` file
   - **Simplify/Remove/Clarify/Add** on implementation approach → update the `.implement.md` file
   - **Reorder** → update the `stories/index.md` dependency graph and implementation order
   - **Merge** → combine story files and update `stories/index.md`

---

# Code Review Mode (Post-Implementation)

When Code Review mode is active (all stories done or `review` arg passed), replace Steps 3-6 above with the following:

## Code Step 3: Run Tests & Gather Implemented Code

**3a. Run existing tests first:**

For each done story, identify its test files from the implementation plan and run them:
```bash
cd .claude/skills/[skill-name] && bun test
```

Record test results per story: **passing**, **failing** (with failure details), or **no tests found**.

Present test baseline to the party before review begins so they have context on current state.

**3b. Gather source files:**

For each done story in the epic:

1. Read the story file (`*.md`) and implementation plan (`*.implement.md`)
2. From the implementation plan, identify the **Files to Create** section and any file paths mentioned
3. Read each implemented source file (skip `node_modules/`, build artifacts, and binary files)
4. Also check git log for commits related to this story (search for story ID in commit messages, e.g. `Story 1.1`, `1-1`, story name)

Build an internal map: **Story -> Implementation Plan -> Actual Source Files -> Git Commits -> Test Results**

## Code Step 4: Party Reviews Actual Code (No User Interaction)

For each done story, present the **actual source code** and test results to the party:

---
**CODE REVIEW: Story {{N}}: {{title}}**

**Test status:** [passing/failing/no tests]
[If failing, show failure details]

**Implementation plan said to build:**
[Summary of what the implement.md specified]

**Actual files:**
[List of source files with their content]

Evaluate the code against loaded principles:

1. **KISS Compliance**: Does the code follow KISS? Check against the full checklist:
   - Each function does one thing
   - No function exceeds cyclomatic complexity of 10
   - No nesting deeper than 3 levels
   - No more than 3 parameters per function
   - No interface with single implementation
   - No abstract class without multiple subclasses
   - No generic types used with only one concrete type
   - No features built for hypothetical future needs
   - No `any` types (use `unknown` and narrow)
   - No enums (use `as const` objects)
   - No static-only classes (use module exports)
   - Inheritance depth <=2 levels

2. **Plan vs Reality**: Does the code match what the implementation plan specified? Any drift?

3. **Code Quality**: Dead code, duplication, unclear naming, missing error handling at boundaries?

4. **Test Coverage**: Are tests present? Do they cover the acceptance criteria? Are any tests failing?
---

Let agents discuss (2-3 rounds), then record draft improvement suggestions. Move to next story automatically.

## Code Step 5: Party Consensus on Code Improvements

Same consensus process — present all draft code improvement suggestions to the party:

---
**CONSENSUS CHECK: Approve, revise, or reject each code improvement**

For each suggestion:
- **Approve** — agree the code change should be made
- **Revise** — adjust the suggestion
- **Reject** — drop it (noise, would break things, not worth the churn, etc.)

Additional checks for code changes:
- Will this improvement break existing tests?
- Is the improvement itself KISS-compliant? (don't suggest over-engineering to fix over-engineering)
- Is the change worth the churn, or is the current code "good enough"?
---

Let agents debate (2-3 rounds). Apply same status rules: Approved, Revised, Contested, Rejected.

<critical_rules>
- Never suggest code changes the party has rejected
- Contested code changes must show both sides for the user to decide
- Code improvements must themselves follow KISS — no replacing simple code with complex "better" code
- Prefer minimal, targeted changes over large rewrites
</critical_rules>

## Code Step 6: Compile & Present

**If zero suggestions survived consensus:** Skip the summary template and present:

> **CODE REVIEW COMPLETE — NO CHANGES NEEDED**
>
> The party reviewed all implemented code. No issues found — the epic passes quality review.

**If suggestions survived consensus:** Compile **only approved/revised/contested improvements**:

```markdown
# Epic [epic-number] Code Review Summary

## Test Baseline
| Story | Tests | Status |
|-------|-------|--------|
| {{N}} | {{count}} | passing/failing |

## Story {{N}}: {{title}}

### Files Reviewed
- `path/to/file.ts` ({{lines}} lines)

### Improvements

#### Simplify
- **File:** `path/to/file.ts:{{line}}`
  **Current:** [code snippet]
  **Suggested:** [improved code snippet]
  **Why:** [KISS principle violated]

#### Remove
- **File:** `path/to/file.ts:{{line}}`
  **What:** [dead code / unused export / speculative feature]

#### Fix
- **File:** `path/to/file.ts:{{line}}`
  **Issue:** [bug or quality issue]
  **Fix:** [code change]

---
[Repeat for each story]
---

## Epic-Wide Code Observations

### Cross-Story Patterns
- [Duplicated utilities that should be shared]
- [Inconsistent patterns across stories]

### Test Gaps
- [Missing test coverage]

### KISS Violations
- [Systematic violations found across multiple stories]
```

Present the compiled code review to user:

> **CODE REVIEW COMPLETE** (all improvements approved by party consensus)
>
> [Full compiled summary]
>
> For any **Contested** items, both viewpoints are shown — your call.
>
> **Options:**
> - Review specific improvements in detail
> - Apply all improvements (I'll update the source files)
> - Apply improvements for a specific story only
> - Export review to a file

## Code Step 7: Apply Improvements

When the user chooses to apply improvements:

1. Provide the KISS principle guide and other loaded principle guides as context to the dev agent
2. Apply each approved code change per story
3. Run existing tests after each story's changes to verify nothing breaks
4. If tests fail, revert the change and flag it as needing manual review
5. Present a final summary:

```markdown
## Applied Changes Summary

### Successfully Applied
- Story {{N}}: {{count}} changes applied, tests passing

### Skipped (tests failed)
- Story {{N}}: {{change description}} — reverted, needs manual review
```

</instructions>

## Suggestion Categories

**Plan Review categories:**

| Category | When to Use |
|----------|-------------|
| **Simplify** | Over-engineered, too abstract, can be simpler |
| **Remove** | Unnecessary features, speculative code, dead paths |
| **Clarify** | Ambiguous ACs, unclear tasks, missing examples |
| **Add** | Missing edge cases, gaps in coverage, needed context |
| **Reorder** | Wrong sequence, dependency issues, better flow |
| **Merge** | Duplicate work, can be combined, overlapping concerns |

**Code Review categories:**

| Category | When to Use |
|----------|-------------|
| **Simplify** | KISS violation, over-abstracted, unnecessary complexity in actual code |
| **Remove** | Dead code, unused exports, speculative features, unnecessary dependencies |
| **Fix** | Bugs, missing boundary validation, incorrect error handling, test gaps |

## Principles Loading

The skill automatically loads all principle guides from `docs/guides-agents/`:
- `KISS-principle-agent-guide.md` (required)
- Any other `*-principle-*.md` files found (optional, extensible)

This allows adding new evaluation principles without modifying the skill.

<constraints>
- No user interaction between stories - batch process all
- All suggestions must be categorized (Simplify, Remove, Clarify, Add, Reorder, Merge for plans; Simplify, Remove, Fix for code)
- Agents handle the details - user only sees party-approved summary
- All suggestions must pass party consensus before being presented to user
- Rejected suggestions are excluded from the final summary
- If zero suggestions survive consensus, declare clean review — do not present empty summary
- Epic-wide patterns must be identified after all stories reviewed
- Offer to fix/apply at the end, don't just suggest
- When fixing or applying, provide the KISS principle guide and any other loaded principle guides to the dev agent
- Plan review: specify which file each fix targets (story .md, .implement.md, or index.md)
- Code review: run tests before reviewing to establish baseline; run tests after applying to verify
- Code review: revert and flag changes that break tests
- Read sprint-status.yaml for mode detection but never write to it — state updates are managed by BMM workflows
- Never search or read from `node_modules/` directories
- Auto-detect mode based on story status; explicit `review` arg overrides to code review
</constraints>

<user_input>
Epic number provided as argument: {{args}}

If no argument: "Which epic would you like to review? (1, 2, 3, ...)"
</user_input>
