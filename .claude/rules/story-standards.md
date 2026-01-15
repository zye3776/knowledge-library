---
paths:
  - "_bmad-output/planning-artifacts/epics.md"
  - "_bmad-output/planning-artifacts/epics/**/stories/**"
  - "_bmad-output/planning-artifacts/epics/**/*-*.md"
---

# Story Standards

<critical_rules>
## Stories Define WHAT, Not HOW

Stories describe requirements and acceptance criteria only. Technical implementation details (code patterns, file structures, architecture) are created separately in implementation plans.
</critical_rules>

This document defines standards for two distinct story contexts:
1. **Epic Planning Stories** - Stories in epics.md during planning phase
2. **Story Files** - Individual story files for implementation

---

## Epic Planning Stories (in epics.md)

<critical_rules>
### User Perspective ONLY
Stories describe WHAT users can do, NEVER HOW it's implemented.

### No Implementation Details
- NO file paths or folder structures
- NO technical implementation notes
- NO code examples or patterns
- NO architecture decisions
</critical_rules>

### Format

```markdown
### Story {N}.{M}: {Title}

As a **{user_type}**,
I want {capability},
So that {value_benefit}.

**Acceptance Criteria:**

**Given** {user context or precondition}
**When** {user action}
**Then** {observable outcome from user perspective}
**And** {additional observable outcome}
```

### What Belongs in Epic Planning Stories

| Include | Exclude |
|---------|---------|
| User actions | File paths |
| Observable outcomes | Code examples |
| Error messages users see | Internal function names |
| User-facing features | Database schemas |
| Given/When/Then scenarios | Architecture decisions |

---

## Story Files (for Implementation)

<critical_rules>
### Every AC Must Be Measurable
Each acceptance criterion MUST have a verifiable bash command in Verification section.

### Self-Contained Context
Stories reference `../overview.md` for context, NOT external files outside the epic folder.

### Tasks Link to ACs
Every task must reference which AC(s) it satisfies.

### No Implementation Details
Technical implementation (code patterns, file structures) goes in implementation plans, NOT in story files.
</critical_rules>

### Story File Structure

```
# Story {N}.{M}: {Title}
Status: {status}

## Story (user story format)
## Background (optional context)
## Acceptance Criteria (numbered, measurable)
## Tasks (linked to ACs)
## Verification (bash commands)
## References
```

### Status Values

| Status | Meaning |
|--------|---------|
| `backlog` | Story only exists in epic file |
| `draft` | Story file created, not yet started |
| `ready-for-dev` | Story ready for implementation |
| `in-progress` | Developer actively working |
| `review` | Ready for code review |
| `done` | Story completed |

### Verification Patterns

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

### Quality Checklist

- [ ] User story follows "As a... I want... so that..." format
- [ ] Every AC has measurable bash verification
- [ ] Tasks reference which ACs they satisfy
- [ ] Context references only `../overview.md`
- [ ] Status field is set

<constraints>
## Do NOT Include in Story Files:
- Code patterns or examples
- File structures or paths to create
- Architecture diagrams
- Dev Notes / Implementation guidance
- Testing strategy details
- Dev Agent Record sections

These belong in implementation plans, created separately.
</constraints>

<system_reminder>
Stories define WHAT needs to be done, not HOW. Technical implementation plans are created separately based on epic and story files.
</system_reminder>
