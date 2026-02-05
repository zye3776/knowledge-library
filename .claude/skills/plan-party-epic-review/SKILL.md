---
name: plan-party-epic-review
description: Load party mode and conduct batch review of epic stories with BMAD agents using KISS and other principles
user-invocable: true
args: "<epic-number>"
example: "/plan-party-epic-review 3"
---

# Plan: Party Epic Review

<instructions>
Conduct a batch multi-agent review of an epic's stories and implementation plans. Party mode agents review ALL stories sequentially, then present a consolidated summary.

## Step 1: Load Context Files

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
_bmad-output/planning-artifacts/epics/epic-{{args}}-*/overview.md
_bmad-output/planning-artifacts/epics/epic-{{args}}-*/stories/index.md
```

## Step 2: Load Party Mode

Invoke party mode workflow:
```
/bmad:core:workflows:party-mode
```

Once party is active, announce the review:

> 🎯 **EPIC {{args}} BATCH REVIEW**
>
> Reviewing all stories and implementation plans against:
> - KISS principles
> - [Any other loaded principle guides]
>
> The party will review each story, then I'll compile all suggestions.

## Step 3: Review Each Story (No User Interaction)

For each story in the epic:

1. Read the story file and implementation plan
2. Present to the party as discussion topic:

---
**Reviewing Story {{N}}: {{title}}**

Evaluate against loaded principles:

1. **Simplicity Check**: Is this the simplest approach? Unnecessary abstractions? Over-engineering?
2. **Story Alignment**: Does the plan address all acceptance criteria? Gaps or scope creep?
3. **Practical Concerns**: Real-world issues not addressed? Dependencies? Edge cases?

Key KISS criteria:
- No interface with single implementation
- No features for hypothetical future needs
- Functions do one thing
- Prefer composition over inheritance
- Duplication is cheaper than wrong abstraction
---

3. Let agents discuss (2-3 rounds of responses)
4. Record suggestions internally
5. Move to next story automatically (no user prompt)

## Step 4: Compile Suggestions

After ALL stories reviewed, compile suggestions by category:

```markdown
# Epic {{args}} Review Summary

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

## Step 5: Present Summary

Present the compiled summary to user:

> 📋 **REVIEW COMPLETE**
>
> [Full compiled summary]
>
> **Options:**
> - Review specific story suggestions in detail
> - Fix all issues (I'll update the files)
> - Export suggestions to a file

## Suggestion Categories

| Category | When to Use |
|----------|-------------|
| **Simplify** | Over-engineered, too abstract, can be simpler |
| **Remove** | Unnecessary features, speculative code, dead paths |
| **Clarify** | Ambiguous ACs, unclear tasks, missing examples |
| **Add** | Missing edge cases, gaps in coverage, needed context |
| **Reorder** | Wrong sequence, dependency issues, better flow |
| **Merge** | Duplicate work, can be combined, overlapping concerns |

## Principles Loading

The skill automatically loads all principle guides from `docs/guides-agents/`:
- `KISS-principle-agent-guide.md` (required)
- Any other `*-principle-*.md` files found (optional, extensible)

This allows adding new evaluation principles without modifying the skill.
</instructions>

<constraints>
- No user interaction between stories - batch process all
- All suggestions must be categorized (Simplify, Remove, Clarify, Add, Reorder, Merge)
- Agents handle the details - user only sees summary
- Epic-wide patterns must be identified after all stories reviewed
- Offer to fix at the end, don't just suggest
</constraints>

<user_input>
Epic number provided as argument: {{args}}

If no argument: "Which epic would you like to review? (1, 2, 3, ...)"
</user_input>
