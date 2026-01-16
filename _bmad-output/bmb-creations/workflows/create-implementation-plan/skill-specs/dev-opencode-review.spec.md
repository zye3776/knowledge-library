# Skill Specification: dev-opencode-review

## Overview

| Attribute | Value |
|-----------|-------|
| **Skill Name** | `dev-opencode-review` |
| **Purpose** | Review draft implementation plan using OpenCode AI and return structured feedback |
| **Context Mode** | `context: fork` (isolated execution) |
| **Invoked By** | `create-implementation-plan` workflow (Step 05) |
| **Portability** | Must work with both Claude Code and OpenCode |

## Problem Statement

After generating a draft implementation plan, it needs technical review before finalization. OpenCode provides a different AI perspective that can catch:
- Architectural inconsistencies
- Missing edge cases
- Over-engineering or under-engineering
- Security concerns
- Performance issues

This skill wraps OpenCode review in a forked context to:
1. Prevent large review discussions from polluting main workflow context
2. Return only actionable feedback (suggestions + issues)
3. Standardize the review output format

## Functional Requirements

### FR-1: Plan Review
The skill MUST review the draft implementation plan for:
1. **Architectural Alignment** - Does the plan match architecture.md decisions?
2. **Completeness** - Are all acceptance criteria addressed?
3. **Technical Feasibility** - Can this realistically be implemented?
4. **Code Structure** - Is the proposed structure appropriate?
5. **Dependencies** - Are all dependencies identified and reasonable?
6. **Error Handling** - Are edge cases and errors addressed?
7. **Security** - Are there security concerns?
8. **Simplicity** - Is the plan over-engineered?

### FR-2: Feedback Generation
The skill MUST produce:
- **Suggestions** - Improvements that would enhance the plan
- **Issues** - Problems that MUST be fixed before implementation
- **Severity ratings** - Critical, Major, Minor for each finding
- **Section references** - Which part of the plan each finding relates to

### FR-3: Context Isolation
The skill MUST:
- Run in forked context (no main context pollution)
- Accept all needed context as input (not rely on prior conversation)
- Return structured output only (no streaming discussion)

### FR-4: Actionable Output
Each finding MUST include:
- Clear description of the finding
- Specific location in the plan
- Concrete recommendation for resolution
- Severity classification

---

## Input Specification

### Input Parameters

```yaml
draft_plan: string           # Required - The draft implementation plan markdown content
story_context:               # Required - Story information
  id: string                 # Story ID
  name: string               # Story name
  description: string        # Story description
  acceptance_criteria: string[]  # List of acceptance criteria
architecture_summary:        # Required - Key architecture constraints
  tech_stack: string[]       # Technologies in use
  key_decisions: string[]    # Relevant architecture decisions
  constraints: string[]      # Technical constraints
coding_standards_summary:    # Optional - Coding standards highlights
  patterns_to_use: string[]
  anti_patterns: string[]
options:
  review_depth: string       # Optional - "quick" | "standard" | "thorough" (default: "standard")
  focus_areas: string[]      # Optional - Specific areas to focus on
  max_findings: number       # Optional - Maximum findings to return (default: 20)
```

### Input Example

```yaml
draft_plan: |
  ---
  story_id: "1-1"
  story_name: "extract-youtube-transcript"
  epic: "epic-1-youtube-content-extraction"
  created: 2026-01-16
  status: DRAFT
  ---

  # Implementation Plan: Extract YouTube Transcript

  ## Overview
  Implement a TypeScript function to extract transcripts from YouTube videos
  using the youtube-transcript-api library.

  ## Technical Decisions
  - Use youtube-transcript-api npm package
  - Store output as markdown with timestamps
  - Handle videos without transcripts gracefully

  ## Code Structure
  ```
  .claude/skills/youtube-extractor/
  ├── scripts/
  │   ├── extract.ts
  │   └── extract.test.ts
  └── package.json
  ```

  ## Dependencies
  - youtube-transcript-api: ^2.0.0
  - bun: runtime

  ## Implementation Steps
  1. Create skill folder structure
  2. Install dependencies
  3. Implement extract function
  4. Add error handling
  5. Write tests
  6. Build executable

  ## Acceptance Criteria Mapping
  | AC | Implementation |
  |----|----------------|
  | Valid URL extracts transcript | extract() function |
  | Invalid URL shows error | try/catch with custom error |
  | Timestamps preserved | Include in markdown output |

  ## Edge Cases & Error Handling
  - Invalid URL: Return error with message
  - No transcript available: Return error indicating no transcript
  - Network failure: Retry once, then fail

story_context:
  id: "1-1"
  name: "extract-youtube-transcript"
  description: "As a user, I want to extract the transcript from a YouTube video URL"
  acceptance_criteria:
    - "Given a valid YouTube URL, transcript is extracted"
    - "Given an invalid URL, clear error message is shown"
    - "Transcript preserves timestamps"

architecture_summary:
  tech_stack:
    - "TypeScript"
    - "Bun"
  key_decisions:
    - "Use Bun runtime for all TypeScript skills"
    - "Store transcripts as markdown files"
  constraints:
    - "No Python for new skills"
    - "Skills must have tests"

coding_standards_summary:
  patterns_to_use:
    - "TDD - write tests first"
    - "Functional composition"
  anti_patterns:
    - "No any types"
    - "No console.log in production"

options:
  review_depth: "standard"
  focus_areas: []
  max_findings: 20
```

---

## Output Specification

### Output Structure

```yaml
success: boolean
error: string | null

review:
  summary: string              # 2-3 sentence overall assessment
  overall_quality: string      # "excellent" | "good" | "needs_work" | "major_issues"
  confidence_score: number     # 0-100, how confident in the review

  suggestions: []              # Improvements (nice to have)
    - id: string               # Unique ID (e.g., "SUG-001")
      severity: string         # "minor" | "enhancement"
      section: string          # Plan section this relates to
      title: string            # Brief title
      description: string      # What was found
      recommendation: string   # How to improve

  issues: []                   # Problems (must fix)
    - id: string               # Unique ID (e.g., "ISS-001")
      severity: string         # "critical" | "major" | "minor"
      section: string          # Plan section this relates to
      title: string            # Brief title
      description: string      # What's wrong
      recommendation: string   # How to fix
      acceptance_criteria: string | null  # Which AC is affected (if any)

  coverage_analysis:
    criteria_addressed: string[]    # AC that are well-addressed
    criteria_gaps: string[]         # AC that need more detail
    criteria_missing: string[]      # AC not addressed at all

metadata:
  review_depth: string
  duration_seconds: number
  findings_count:
    suggestions: number
    issues_critical: number
    issues_major: number
    issues_minor: number
```

### Output Example (Success)

```yaml
success: true
error: null

review:
  summary: "The plan is well-structured and addresses core functionality. However, there are gaps in error handling for network failures and the dependency version should be pinned. The implementation steps could benefit from more specific detail."
  overall_quality: "good"
  confidence_score: 85

  suggestions:
    - id: "SUG-001"
      severity: "enhancement"
      section: "Implementation Steps"
      title: "Add specific function signatures"
      description: "Implementation steps are high-level and don't specify exact function signatures or return types."
      recommendation: "Add expected function signatures, e.g., `extract(url: string): Promise<Transcript>`"

    - id: "SUG-002"
      severity: "minor"
      section: "Code Structure"
      title: "Consider adding types file"
      description: "No types.ts file mentioned for shared interfaces."
      recommendation: "Add `types.ts` for Transcript interface definition."

  issues:
    - id: "ISS-001"
      severity: "major"
      section: "Dependencies"
      title: "Unpinned dependency version"
      description: "Using ^2.0.0 for youtube-transcript-api allows minor version updates that could introduce breaking changes."
      recommendation: "Pin to exact version: youtube-transcript-api: 2.0.0"
      acceptance_criteria: null

    - id: "ISS-002"
      severity: "major"
      section: "Edge Cases & Error Handling"
      title: "Incomplete network failure handling"
      description: "Plan mentions 'retry once' but doesn't specify timeout, backoff, or how to distinguish network failure from other errors."
      recommendation: "Specify: 1) Timeout duration (e.g., 10s), 2) Backoff strategy, 3) Error type detection"
      acceptance_criteria: null

    - id: "ISS-003"
      severity: "minor"
      section: "Acceptance Criteria Mapping"
      title: "Timestamp format not specified"
      description: "AC says 'timestamps preserved' but plan doesn't specify the format (SRT, VTT, plain text with times)."
      recommendation: "Specify timestamp format, e.g., '[00:01:23] Text here'"
      acceptance_criteria: "Transcript preserves timestamps"

  coverage_analysis:
    criteria_addressed:
      - "Given a valid YouTube URL, transcript is extracted"
      - "Given an invalid URL, clear error message is shown"
    criteria_gaps:
      - "Transcript preserves timestamps"  # Format not specified
    criteria_missing: []

metadata:
  review_depth: "standard"
  duration_seconds: 45
  findings_count:
    suggestions: 2
    issues_critical: 0
    issues_major: 2
    issues_minor: 1
```

### Output Example (Failure)

```yaml
success: false
error: "Invalid input: draft_plan is empty"

review: null
metadata:
  review_depth: "standard"
  duration_seconds: 1
  findings_count: null
```

---

## Integration Points

### Workflow Integration

```
Step 05 (Process Stories) - Sequential Mode
    │
    ├── 3a. Generate draft plan
    │
    ├── 3b. INVOKE dev-opencode-review (context: fork)
    │       Input: draft_plan, story_context, architecture_summary
    │       Output: review object with suggestions/issues
    │
    ├── 3c. Store review.suggestions and review.issues
    │       (Do NOT store full review discussion)
    │
    └── 3d. Pass to Party Mode review
            Input includes: OpenCode suggestions/issues
```

### Skill Definition (SKILL.md)

```yaml
---
name: dev-opencode-review
description: Review implementation plan via OpenCode AI, returns suggestions and issues
allowed-tools: [Read, WebFetch, mcp__deepwiki__ask_question]
context: fork
---
```

### Skill Invocation

```markdown
# Claude Code
/dev-opencode-review plan="[plan content]" story="[story context]" arch="[arch summary]"

# Programmatic
Skill.invoke("dev-opencode-review", {
  draft_plan: planContent,
  story_context: storyData,
  architecture_summary: archData
})
```

---

## Review Criteria Details

### Architectural Alignment Checks

| Check | Description |
|-------|-------------|
| Tech stack match | Does plan use approved technologies? |
| Pattern compliance | Does structure follow architectural patterns? |
| Constraint adherence | Are all constraints respected? |
| Decision consistency | Do technical decisions align with architecture.md? |

### Completeness Checks

| Check | Description |
|-------|-------------|
| AC coverage | Is every acceptance criterion addressed? |
| Section population | Are all template sections filled? |
| Dependency listing | Are all dependencies explicit? |
| Step specificity | Are implementation steps actionable? |

### Simplicity Checks (KISS)

| Check | Description |
|-------|-------------|
| Over-engineering | Are there unnecessary abstractions? |
| Premature optimization | Is the plan optimizing for unlikely scenarios? |
| Scope creep | Does the plan add features not in the story? |
| Complexity justification | Is added complexity justified by requirements? |

---

## Implementation Notes

### Forked Context Behavior

```
Main Context                    Forked Context (this skill)
     │                                │
     ├── Invoke skill ──────────────► │
     │                                ├── Receive inputs
     │                                ├── Perform full review
     │   (main context preserved)     ├── Generate findings
     │                                ├── Structure output
     │   ◄──────────────────────────── Return structured result
     │
     └── Continue with result only
         (review discussion NOT in main context)
```

### Review Prompting Strategy

The skill should internally prompt for:
1. **First pass**: Read plan, identify sections, note structure
2. **AC verification**: Check each acceptance criterion
3. **Architecture check**: Compare against constraints
4. **Edge case analysis**: Look for missing error handling
5. **Simplicity review**: Flag over-engineering
6. **Synthesis**: Consolidate into suggestions/issues

### Severity Classification

| Severity | Definition | Example |
|----------|------------|---------|
| **critical** | Blocks implementation, must fix | Missing required dependency |
| **major** | Significant problem, should fix | Incomplete error handling |
| **minor** | Small issue, nice to fix | Could improve naming |
| **enhancement** | Not a problem, just better | Add type file for clarity |

---

## Testing Requirements

### Test Cases

| ID | Test Case | Input | Expected Output |
|----|-----------|-------|-----------------|
| TC-01 | Good plan review | Complete, correct plan | success=true, few minor findings |
| TC-02 | Plan with missing AC | Plan missing 1 AC | success=true, AC in criteria_missing |
| TC-03 | Plan with bad structure | Disorganized plan | success=true, issues about structure |
| TC-04 | Plan violating architecture | Uses Python | success=true, critical issue flagged |
| TC-05 | Over-engineered plan | Plan with unnecessary abstractions | success=true, suggestions to simplify |
| TC-06 | Empty plan | Empty string | success=false, error message |
| TC-07 | Missing story context | No story_context | success=false, error message |
| TC-08 | Quick review depth | review_depth="quick" | success=true, fewer findings |
| TC-09 | Thorough review depth | review_depth="thorough" | success=true, comprehensive findings |

---

## Constraints

<constraints>
- MUST run in forked context (context: fork in SKILL.md)
- MUST NOT exceed 60 seconds execution time
- MUST NOT modify the draft plan (read-only review)
- MUST return structured output only (no conversational text)
- MUST include at least one finding (even if just "plan looks good" suggestion)
- MUST NOT hallucinate acceptance criteria not in input
- SHOULD limit findings to max_findings parameter
- SHOULD NOT repeat similar findings (consolidate related issues)
</constraints>

---

## Success Criteria

1. ✓ Reviews complete within 60 seconds
2. ✓ All acceptance criteria checked against plan
3. ✓ Architectural violations flagged as critical/major
4. ✓ Over-engineering detected and flagged
5. ✓ Output matches specification exactly
6. ✓ Findings are actionable (not vague)
7. ✓ Main workflow context not polluted
8. ✓ Works with both Claude Code and OpenCode
