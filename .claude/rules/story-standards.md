---
paths:
  - "_bmad-output/planning-artifacts/epics/**/stories/**"
  - "_bmad-output/planning-artifacts/epics/**/*-*.md"
---

# Story File Standards

<critical_rules>
When creating or editing story files:

## Every AC Must Be Measurable
Each acceptance criterion MUST have a verifiable bash command in "Measurable Outcomes" section.

## Self-Contained Context
Stories reference `../overview.md` for context, NOT external files outside the epic folder.

## Tasks Link to ACs
Every task must reference which AC(s) it satisfies.
</critical_rules>

## Story File Structure

```
# Story {N}.{M}: {Title}
Status: {status}

## Story (user story format)
## Background (optional context)
## Acceptance Criteria (numbered, measurable)
## Technical Decisions (architecture choices)
## Tasks / Subtasks (linked to ACs)
## Dev Notes (implementation guidance)
## Dev Agent Record (completion tracking)
```

## Status Values

| Status | Meaning |
|--------|---------|
| `backlog` | Story only exists in epic file |
| `draft` | Story file created, not yet started |
| `ready-for-dev` | Story ready for implementation |
| `in-progress` | Developer actively working |
| `review` | Ready for code review |
| `done` | Story completed |

## Measurable Outcomes Patterns

**Command Exit Codes:**
```bash
{command}; echo "Exit code: $?"  # Expected: 0
```

**File/Directory Existence:**
```bash
test -f {path} && echo "PASS"  # Expected: PASS
test -d {path} && echo "PASS"  # Expected: PASS
```

**Content Verification:**
```bash
grep -c "{pattern}" {file}  # Expected: {count}
jq -e '{expression}' {file}  # Exit 0 = PASS
```

**Test Results:**
```bash
bun test {path}  # Expected: all tests pass
bun run build; echo "Exit code: $?"  # Expected: 0
```

## Quality Checklist

- [ ] User story follows "As a... I want... so that..." format
- [ ] Every AC has measurable bash verification
- [ ] Tasks reference which ACs they satisfy
- [ ] Files to Create/Modify table present
- [ ] Testing strategy defined
- [ ] Context references only `../overview.md`
- [ ] Dev Agent Record template included

<constraints>
## Do NOT:
- Write ACs without measurable bash verification commands
- Reference files outside the epic folder
- Create tasks without AC references
- Skip the Dev Agent Record section
- Leave status field empty
</constraints>
