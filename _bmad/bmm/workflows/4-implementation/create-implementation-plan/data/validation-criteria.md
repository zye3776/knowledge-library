# Implementation Plan Validation Criteria

## Purpose

Criteria for validating implementation plans against quality standards. Used by the validate flow (steps-v/).

---

## Section Completeness Checks

### Required Sections

| Section | Required | Validation |
|---------|----------|------------|
| Overview | Yes | Non-empty, explains user value |
| Technical Decisions | Yes | Contains architecture alignment |
| Code Structure | Yes | Lists files to create/modify |
| Dependencies | Yes | Env vars and libraries listed |
| Implementation Steps | Yes | Minimum 3 specific steps |
| Acceptance Criteria Mapping | Yes | Maps all story criteria |
| Edge Cases & Error Handling | Yes | Non-empty error scenarios |

### Content Quality Checks

- [ ] No placeholder text (TBD, TODO, etc.)
- [ ] No ambiguous instructions ("decide later", "as needed")
- [ ] All file paths are specific, not generic
- [ ] All env vars have example values
- [ ] Implementation steps are actionable by AI

---

## Architecture Alignment

### Must Verify

- [ ] Technical decisions align with `architecture.md`
- [ ] Technology choices match project stack
- [ ] No contradictions with existing patterns
- [ ] Dependencies are compatible with project

### Warning Conditions

- New dependencies not in architecture.md
- Patterns that deviate from established conventions
- External services not previously documented

---

## Actionability Score

### AI-Ready Criteria

| Criteria | Weight | Description |
|----------|--------|-------------|
| Specific file paths | 20% | All files named explicitly |
| Clear step order | 20% | No ambiguous sequencing |
| Complete dependencies | 15% | All deps listed with versions |
| Error handling defined | 15% | Recovery paths clear |
| Acceptance mapping | 15% | All criteria covered |
| No human decisions | 15% | No "ask user" or "decide" |

**Pass threshold:** 80% or higher

---

## Validation Output Format

```yaml
validation_result:
  status: PASS | FAIL | WARNINGS
  score: [0-100]
  sections:
    overview: PASS | FAIL | WARNING
    technical_decisions: PASS | FAIL | WARNING
    code_structure: PASS | FAIL | WARNING
    dependencies: PASS | FAIL | WARNING
    implementation_steps: PASS | FAIL | WARNING
    acceptance_mapping: PASS | FAIL | WARNING
    edge_cases: PASS | FAIL | WARNING
  issues:
    - severity: ERROR | WARNING
      section: [section_name]
      message: [description]
  recommendations:
    - [improvement suggestion]
```

---

## Common Issues

### Frequent Failures

1. **Missing env vars** - Dependencies reference vars not listed
2. **Vague steps** - "Implement the feature" instead of specific actions
3. **Incomplete mapping** - Acceptance criteria not all covered
4. **Architecture drift** - Decisions contradict architecture.md

### Auto-Fixable Issues

- Missing section headers (can add empty sections)
- Formatting inconsistencies
- Missing frontmatter fields

### Manual Review Required

- Architecture contradictions
- Missing critical dependencies
- Incomplete error handling
