# Implementation Plan Validation Criteria

## Purpose

Criteria for validating implementation plans for **auto-agent driven development**. Plans are high-level technical decision documents for senior review, NOT detailed implementation instructions.

---

## Core Philosophy

<critical_rules>
### Plans Are For Human Review, Not Agent Instructions

Implementation plans serve ONE purpose: **Get senior technical sign-off on critical decisions BEFORE autonomous agent development begins.**

Plans should answer: "Is this the right approach?" NOT "How do I write the code?"

### Coding Standards Stay OUT of Plans

**NEVER include in implementation plans:**
- Coding standards
- Test standards
- Linting rules
- Style guidelines
- Any content from `/Users/Z/projects/zees-plugins/plugins/coding-standards/rules`

**WHY:** These pollute context windows during planning. Implementation agents load them JIT (just-in-time) when writing code.

### Reference, Don't Embed

Plans should REFERENCE the coding standards path:
```
~/.claude/plugins/marketplaces/zees-plugins/plugins/coding-standards/rules
```

Agents load relevant standards from this path ONLY when about to write code.
</critical_rules>

---

## Validation Rules

### 1. High-Level Abstraction Check

| Check | Pass Criteria | Fail Criteria |
|-------|---------------|---------------|
| Overview | 2-3 sentences max | Paragraph-length explanation |
| Technical Decisions | Trade-off tables, not implementation details | Code examples, file contents |
| Approach | Strategy description | Step-by-step instructions |
| Phases | 2-4 high-level phases | 10+ detailed steps |

**Rule:** If the plan reads like a tutorial, it's too detailed.

### 2. No Embedded Standards Check

**FAIL if plan contains ANY of:**
- [ ] Code style examples
- [ ] Testing patterns or frameworks
- [ ] ESLint/Prettier configurations
- [ ] TypeScript conventions
- [ ] File naming conventions (beyond listing files)
- [ ] Comment standards
- [ ] Error handling patterns (detailed)
- [ ] Import/export conventions

**PASS if plan:**
- [ ] References coding standards path ONLY
- [ ] Contains Agent Instructions section with standards path
- [ ] Instructs agents to load standards before writing code

### 3. Decision Clarity Check

| Required | Description |
|----------|-------------|
| Architecture alignment | Reference to architecture.md, not repetition |
| Key trade-offs | Table format: Decision / Choice / Rationale |
| Risk areas | Where agents need extra caution |
| Dependencies | External, internal, env vars - table format |

### 4. Reviewability Check

A senior tech expert should be able to review the plan in **under 5 minutes** and answer:
- Is the approach sound?
- Are the trade-offs reasonable?
- Are there risks I should flag?

**FAIL if:** Review would require reading detailed implementation steps.

### 5. Agent Workflow Check

Plan MUST include Agent Instructions section with:
- [ ] Path to coding standards
- [ ] Explicit instruction to load standards BEFORE writing code
- [ ] Phase-based workflow (not step-by-step)

---

## Self-Check Requirements

### Before Completing Plan Generation

The workflow MUST perform a self-check against ALL rules above:

```yaml
self_check:
  high_level: [true/false]      # Plan is abstract, not detailed
  no_coding_standards: [true/false]  # No standards embedded
  decisions_clear: [true/false] # Technical decisions reviewable
  phases_defined: [true/false]  # 2-4 implementation phases
  ac_mapped: [true/false]       # All acceptance criteria covered
  agent_instructions: [true/false]  # Standards path + workflow present
```

**ALL must be `true` before presenting to user.**

### User Review Loop

After self-check passes:
1. Present plan to user for review
2. Wait for explicit approval
3. User may request changes (multiple iterations allowed)
4. Update plan and re-run self-check after each change
5. Only mark status as `approved` when user confirms

---

## Status Tracking

### Plan YAML Frontmatter

```yaml
status: draft | pending_review | approved | in_progress | completed
iteration: [number]  # Increments with each user change request
reviews:
  user_approved: [true/false]
  self_check_passed: [true/false]
```

### Status Transitions

```
draft → pending_review (after self-check passes)
pending_review → draft (user requests changes)
pending_review → approved (user approves)
approved → in_progress (agent begins implementation)
in_progress → completed (all ACs verified)
```

---

## Validation Output Format

```yaml
validation_result:
  status: PASS | FAIL | NEEDS_REVIEW
  checks:
    high_level_abstraction: PASS | FAIL
    no_embedded_standards: PASS | FAIL
    decision_clarity: PASS | FAIL
    reviewability: PASS | FAIL
    agent_workflow: PASS | FAIL
  issues:
    - rule: [rule_name]
      severity: BLOCKER | WARNING
      message: [description]
      location: [section]
  ready_for_user_review: [true/false]
```

---

## Common Failures

### Blocker Issues (Must Fix)

1. **Embedded coding standards** - Remove and reference path only
2. **Too detailed** - Abstract to phases, remove step-by-step
3. **Missing agent instructions** - Add section with standards path
4. **No self-check** - Run validation before user review

### Warning Issues (Should Fix)

1. **Long overview** - Trim to 2-3 sentences
2. **Missing trade-offs table** - Add decision rationale
3. **Vague phases** - Each phase needs clear goal + output
4. **Iteration not tracked** - Update YAML frontmatter

---

## Quick Reference

**Plan should be:**
- ✅ Reviewable in 5 minutes
- ✅ Decision-focused, not instruction-focused
- ✅ High-level phases (2-4)
- ✅ Standards referenced, not embedded
- ✅ Self-checked before user review

**Plan should NOT be:**
- ❌ A tutorial or how-to guide
- ❌ Step-by-step implementation instructions
- ❌ A coding standards document
- ❌ Longer than 2 pages when rendered
