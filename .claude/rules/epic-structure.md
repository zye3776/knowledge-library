---
paths:
  - "_bmad-output/planning-artifacts/**"
  - "_bmad-output/planning-artifacts/epics/**"
---

# Epic Structure Standards

<critical_rules>
When creating or editing epics in `_bmad-output/planning-artifacts/epics/`, follow these standards:

## Self-Contained Epics
- All context required for epic development MUST be embedded within the epic folder
- Source documents may be removed after epic creation
- `overview.md` must contain complete architectural decisions, tech stack, and context
- Story files reference `../overview.md` for context, NOT external files

## Every AC Must Be Measurable
Every acceptance criterion MUST have a verifiable bash command in the "Measurable Outcomes" section.
</critical_rules>

## Directory Structure

```
_bmad-output/planning-artifacts/epics/epic-{N}-{slug}/
├── overview.md              # Epic-level technical specification
├── sprint-status.yaml       # Status tracking for dev workflow
└── stories/
    ├── index.md             # Stories overview + dependency graph
    ├── {N}-1-{slug}.md      # Story files
    ├── {N}-2-{slug}.md
    └── ...
```

**Naming Conventions:**
- Epic folder: `epic-{number}-{kebab-case-slug}` (e.g., `epic-17-backend-rebuild`)
- Story files: `{epic}-{story}-{kebab-case-slug}.md` (e.g., `17-1-delete-interface-dirs.md`)

## Status Progression

```
backlog -> draft -> ready-for-dev -> in-progress -> review -> done
```

## File Templates

For detailed templates, see [templates.md](epic-templates.md).

## Measurable Outcomes Patterns

**Command Exit Codes:**
```bash
{command}; echo "Exit code: $?"  # Expected: 0
```

**File/Directory Existence:**
```bash
test -f {path} && echo "PASS"  # Expected: PASS
test -d {path} && echo "PASS"  # Expected: PASS
test ! -f {path} && echo "PASS"  # File should NOT exist
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

**Count Verification:**
```bash
ls {path} | wc -l  # Expected: {count}
find {path} -type f -name "*.ts" | wc -l  # Expected: {count}
```

## Workflow Integration

### Dev Workflow Commands

```bash
# Check sprint status
/bmad:bmm:workflows:sprint-status

# Start implementing a story
/bmad:bmm:workflows:dev-story

# Run code review
/bmad:bmm:workflows:code-review
```

### Commit After Each Story

```bash
git add .
git commit -m "feat(epic-{N}): story {N}.{M} - {description}

Co-Authored-By: Claude {Model} <noreply@anthropic.com>"
```

## Quality Checklist

When creating epics, verify:
- [ ] Epic is SELF-CONTAINED (no external file references)
- [ ] overview.md has ALL architectural decisions embedded
- [ ] Story Context References point only to `../overview.md`
- [ ] Every AC has a measurable outcome
- [ ] Tasks reference which ACs they satisfy
- [ ] Dependencies listed in index.md
- [ ] Code patterns in Dev Notes
- [ ] Testing Strategy defined
- [ ] Files to Create/Modify table present
- [ ] sprint-status.yaml has all stories
- [ ] Stories are atomic

<constraints>
## Do NOT:
- Reference external files from stories (embed context in overview.md)
- Create ACs without measurable bash verification commands
- Skip the Dev Agent Record section in stories
- Forget to update sprint-status.yaml when story status changes
- Create stories that span multiple unrelated concerns
</constraints>
