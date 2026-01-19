# Skill Specification: dev-party-mode-review

## Overview

| Attribute | Value |
|-----------|-------|
| **Skill Name** | `dev-party-mode-review` |
| **Purpose** | Run BMM Party Mode multi-agent review on implementation plan, produce final reviewed plan |
| **Context Mode** | `context: fork` (isolated execution) |
| **Invoked By** | `create-implementation-plan` workflow (Step 05) |
| **Portability** | Must work with both Claude Code and OpenCode |

## Problem Statement

After OpenCode review generates suggestions and issues, the plan needs final review and refinement through BMM Party Mode. This multi-agent discussion:
- Debates technical trade-offs
- Incorporates OpenCode feedback
- Reaches consensus on final plan
- Produces a polished, implementation-ready document

This skill wraps Party Mode in a forked context to:
1. Prevent lengthy multi-agent discussion from consuming main context
2. Return only the final reviewed plan (not the full discussion)
3. Standardize the output format

## Functional Requirements

### FR-1: Party Mode Orchestration
The skill MUST invoke BMM Party Mode with appropriate agents:
- **Architect** - Validates architectural decisions
- **Developer** - Assesses implementability
- **Tech Lead** - Reviews code structure and patterns
- **QA Engineer** - Checks test coverage and edge cases

### FR-2: OpenCode Feedback Integration
The skill MUST:
- Present OpenCode suggestions and issues to Party Mode agents
- Ensure each critical/major issue is explicitly addressed
- Track which suggestions were accepted/rejected

### FR-3: Plan Refinement
The skill MUST produce a final plan that:
- Addresses all critical and major issues from OpenCode
- Incorporates accepted suggestions
- Maintains all acceptance criteria coverage
- Is ready for immediate implementation

### FR-4: Change Documentation
The skill MUST document:
- What changes were made to the draft plan
- Why changes were made (linked to findings)
- What suggestions were rejected and why

### FR-5: Context Isolation
The skill MUST:
- Run in forked context (no main context pollution)
- Accept all needed context as input
- Return only the final plan + change summary (not full discussion)

---

## Input Specification

### Input Parameters

```yaml
draft_plan: string           # Required - The draft implementation plan markdown
opencode_review:             # Required - Results from dev-opencode-review
  suggestions: []            # OpenCode suggestions
    - id: string
      severity: string
      section: string
      title: string
      description: string
      recommendation: string
  issues: []                 # OpenCode issues
    - id: string
      severity: string
      section: string
      title: string
      description: string
      recommendation: string
      acceptance_criteria: string | null
  coverage_analysis:
    criteria_addressed: string[]
    criteria_gaps: string[]
    criteria_missing: string[]
story_context:               # Required - Story information
  id: string
  name: string
  description: string
  acceptance_criteria: string[]
project_context:             # Required - Project context summary
  architecture_highlights: string[]  # Key architecture points
  coding_standards_highlights: string[]  # Key standards
  epic_goal: string          # What the epic aims to achieve
options:
  discussion_depth: string   # Optional - "brief" | "standard" | "thorough" (default: "standard")
  required_consensus: boolean # Optional - All agents must agree (default: true)
  max_discussion_rounds: number # Optional - Limit discussion (default: 3)
```

### Input Example

```yaml
draft_plan: |
  ---
  story_id: "1-1"
  story_name: "extract-youtube-transcript"
  ...
  ---
  # Implementation Plan: Extract YouTube Transcript
  [full draft plan content]

opencode_review:
  suggestions:
    - id: "SUG-001"
      severity: "enhancement"
      section: "Implementation Steps"
      title: "Add specific function signatures"
      description: "Implementation steps don't specify exact function signatures"
      recommendation: "Add expected function signatures"
    - id: "SUG-002"
      severity: "minor"
      section: "Code Structure"
      title: "Consider adding types file"
      description: "No types.ts file mentioned"
      recommendation: "Add types.ts for Transcript interface"

  issues:
    - id: "ISS-001"
      severity: "major"
      section: "Dependencies"
      title: "Unpinned dependency version"
      description: "Using ^2.0.0 allows breaking changes"
      recommendation: "Pin to exact version"
    - id: "ISS-002"
      severity: "major"
      section: "Edge Cases & Error Handling"
      title: "Incomplete network failure handling"
      description: "Retry strategy not fully specified"
      recommendation: "Specify timeout, backoff, error detection"
    - id: "ISS-003"
      severity: "minor"
      section: "Acceptance Criteria Mapping"
      title: "Timestamp format not specified"
      description: "AC says timestamps preserved but format unclear"
      recommendation: "Specify timestamp format"

  coverage_analysis:
    criteria_addressed:
      - "Given a valid YouTube URL, transcript is extracted"
      - "Given an invalid URL, clear error message is shown"
    criteria_gaps:
      - "Transcript preserves timestamps"
    criteria_missing: []

story_context:
  id: "1-1"
  name: "extract-youtube-transcript"
  description: "As a user, I want to extract the transcript from a YouTube video"
  acceptance_criteria:
    - "Given a valid YouTube URL, transcript is extracted"
    - "Given an invalid URL, clear error message is shown"
    - "Transcript preserves timestamps"

project_context:
  architecture_highlights:
    - "Use Bun runtime for TypeScript skills"
    - "Store output as markdown"
  coding_standards_highlights:
    - "TDD approach"
    - "No any types"
  epic_goal: "Enable users to extract and process YouTube transcripts"

options:
  discussion_depth: "standard"
  required_consensus: true
  max_discussion_rounds: 3
```

---

## Output Specification

### Output Structure

```yaml
success: boolean
error: string | null

result:
  final_plan: string           # Complete reviewed implementation plan (markdown)
  status: string               # "approved" | "approved_with_reservations" | "needs_revision"
  confidence_score: number     # 0-100, consensus confidence

  changes_made:                # What was changed from draft
    - finding_id: string       # Which OpenCode finding (e.g., "ISS-001")
      change_type: string      # "fixed" | "partially_addressed" | "deferred"
      section_modified: string # Which plan section
      description: string      # What was changed

  suggestions_disposition:     # How suggestions were handled
    accepted: []
      - id: string
        reason: string         # Why accepted
    rejected: []
      - id: string
        reason: string         # Why rejected
    deferred: []
      - id: string
        reason: string         # Why deferred

  agent_consensus:
    architect: string          # "approve" | "approve_with_notes" | "reject"
    developer: string
    tech_lead: string
    qa_engineer: string
    dissenting_opinions: []    # Any disagreements
      - agent: string
        concern: string

  quality_assessment:
    implementability: number   # 0-100, how ready for implementation
    completeness: number       # 0-100, coverage of requirements
    clarity: number            # 0-100, how clear the instructions are
    architectural_fit: number  # 0-100, alignment with architecture

metadata:
  discussion_rounds: number
  duration_seconds: number
  agents_participated: string[]
```

### Output Example (Success - Approved)

```yaml
success: true
error: null

result:
  final_plan: |
    ---
    story_id: "1-1"
    story_name: "extract-youtube-transcript"
    epic: "epic-1-youtube-content-extraction"
    created: 2026-01-16
    reviewed: 2026-01-16
    status: READY_FOR_DEV
    review_confidence: 92
    ---

    # Implementation Plan: Extract YouTube Transcript

    ## Overview
    Implement a TypeScript function to extract transcripts from YouTube videos
    using the youtube-transcript-api library. Output formatted markdown with
    timestamps in `[HH:MM:SS]` format.

    ## Technical Decisions
    - Use youtube-transcript-api npm package (pinned version 2.0.0)
    - Store output as markdown with `[HH:MM:SS]` timestamps
    - Handle videos without transcripts with clear error message
    - Network failures: 10s timeout, single retry with 2s backoff

    ## Code Structure
    ```
    .claude/skills/youtube-extractor/
    ├── scripts/
    │   ├── main.ts           # Entry point
    │   ├── extract.ts        # Core extraction logic
    │   ├── extract.test.ts   # Tests
    │   └── types.ts          # Transcript interface
    └── package.json
    ```

    ## Dependencies
    - youtube-transcript-api: 2.0.0  # Pinned version
    - bun: ^1.0.0                    # Runtime

    ## Implementation Steps

    ### Step 1: Create skill structure
    ```bash
    mkdir -p .claude/skills/youtube-extractor/scripts
    cd .claude/skills/youtube-extractor
    bun init
    ```

    ### Step 2: Define types (types.ts)
    ```typescript
    export interface TranscriptSegment {
      text: string;
      start: number;  // seconds
      duration: number;
    }

    export interface Transcript {
      videoId: string;
      segments: TranscriptSegment[];
    }

    export interface ExtractResult {
      success: boolean;
      transcript?: string;  // Formatted markdown
      error?: string;
    }
    ```

    ### Step 3: Implement extract function (extract.ts)
    ```typescript
    export async function extract(url: string): Promise<ExtractResult>
    ```
    - Parse video ID from URL
    - Call youtube-transcript-api
    - Format with timestamps: `[HH:MM:SS] text`
    - Return formatted markdown

    ### Step 4: Add error handling
    - Invalid URL: Return `{ success: false, error: "Invalid YouTube URL" }`
    - No transcript: Return `{ success: false, error: "No transcript available" }`
    - Network error: Retry once after 2s, then fail with error

    ### Step 5: Write tests (extract.test.ts)
    - Test valid URL extraction (mock API)
    - Test invalid URL handling
    - Test network retry logic
    - Test timestamp formatting

    ### Step 6: Build and verify
    ```bash
    bun test
    bun run build
    ```

    ## Acceptance Criteria Mapping

    | AC | Implementation | Verified By |
    |----|----------------|-------------|
    | Valid URL extracts transcript | extract() returns success=true with formatted markdown | TC-01: valid URL test |
    | Invalid URL shows error | extract() returns success=false with error message | TC-02: invalid URL test |
    | Timestamps preserved | Format: `[HH:MM:SS] text` from segment.start | TC-04: timestamp format test |

    ## Edge Cases & Error Handling

    | Scenario | Detection | Response |
    |----------|-----------|----------|
    | Invalid URL | URL parsing fails | `{ success: false, error: "Invalid YouTube URL: [url]" }` |
    | No transcript | API returns empty | `{ success: false, error: "No transcript available for this video" }` |
    | Network timeout | Request exceeds 10s | Retry once after 2s backoff |
    | Network failure after retry | Second request fails | `{ success: false, error: "Network error: [message]" }` |
    | Private video | API returns 403 | `{ success: false, error: "Video is private or unavailable" }` |

  status: "approved"
  confidence_score: 92

  changes_made:
    - finding_id: "ISS-001"
      change_type: "fixed"
      section_modified: "Dependencies"
      description: "Pinned youtube-transcript-api to exact version 2.0.0"
    - finding_id: "ISS-002"
      change_type: "fixed"
      section_modified: "Edge Cases & Error Handling"
      description: "Added complete retry strategy: 10s timeout, 2s backoff, single retry"
    - finding_id: "ISS-003"
      change_type: "fixed"
      section_modified: "Overview, Implementation Steps, AC Mapping"
      description: "Specified timestamp format as [HH:MM:SS]"
    - finding_id: "SUG-001"
      change_type: "fixed"
      section_modified: "Implementation Steps"
      description: "Added function signatures and code examples"
    - finding_id: "SUG-002"
      change_type: "fixed"
      section_modified: "Code Structure"
      description: "Added types.ts file with interface definitions"

  suggestions_disposition:
    accepted:
      - id: "SUG-001"
        reason: "Function signatures improve clarity for AI implementation"
      - id: "SUG-002"
        reason: "Types file aligns with TypeScript best practices"
    rejected: []
    deferred: []

  agent_consensus:
    architect: "approve"
    developer: "approve"
    tech_lead: "approve"
    qa_engineer: "approve_with_notes"
    dissenting_opinions:
      - agent: "qa_engineer"
        concern: "Consider adding integration test with real YouTube API in CI (low priority)"

  quality_assessment:
    implementability: 95
    completeness: 100
    clarity: 90
    architectural_fit: 95

metadata:
  discussion_rounds: 2
  duration_seconds: 78
  agents_participated:
    - "architect"
    - "developer"
    - "tech_lead"
    - "qa_engineer"
```

### Output Example (Needs Revision)

```yaml
success: true
error: null

result:
  final_plan: "[partial plan with remaining issues marked]"
  status: "needs_revision"
  confidence_score: 45

  changes_made:
    - finding_id: "ISS-001"
      change_type: "fixed"
      section_modified: "Dependencies"
      description: "Pinned version"

  suggestions_disposition:
    accepted: []
    rejected: []
    deferred:
      - id: "SUG-001"
        reason: "Cannot proceed until ISS-003 is resolved"

  agent_consensus:
    architect: "reject"
    developer: "approve_with_notes"
    tech_lead: "reject"
    qa_engineer: "reject"
    dissenting_opinions:
      - agent: "architect"
        concern: "Plan proposes using Python script which violates architecture constraints"
      - agent: "tech_lead"
        concern: "Critical issue ISS-003 not addressable without clarification from user"

  quality_assessment:
    implementability: 40
    completeness: 60
    clarity: 70
    architectural_fit: 30

metadata:
  discussion_rounds: 3
  duration_seconds: 95
  agents_participated: [...]
```

---

## Integration Points

### Workflow Integration

```
Step 05 (Process Stories) - Sequential Mode
    │
    ├── 3b. OpenCode review complete
    │       Have: opencode_review with suggestions/issues
    │
    ├── 3c. INVOKE dev-party-mode-review (context: fork)
    │       Input: draft_plan, opencode_review, story_context, project_context
    │       Output: result with final_plan
    │
    ├── 3d. IF status="approved" or "approved_with_reservations":
    │       Use result.final_plan for saving
    │
    ├── 3e. IF status="needs_revision":
    │       Log issues, mark story as needs_attention
    │       Continue to next story
    │
    └── 3f. Save final_plan to {story}.implement.md
```

### Skill Definition (SKILL.md)

```yaml
---
name: dev-party-mode-review
description: Run BMM Party Mode multi-agent review on implementation plan, returns final reviewed plan
allowed-tools: [Read, Skill]
context: fork
---
```

### Party Mode Invocation (Internal)

The skill internally invokes Party Mode:
```markdown
/bmad:core:workflows:party-mode

Participants: architect, developer, tech_lead, qa_engineer

Topic: Review implementation plan for story {story_id}

Context:
- Draft plan attached
- OpenCode found {N} issues and {M} suggestions
- Must address all critical/major issues

Goal: Produce approved implementation plan or identify blockers
```

---

## Agent Roles in Review

### Architect
**Focus:** Architectural alignment
- Does the plan fit the system architecture?
- Are technical decisions consistent with architecture.md?
- Are there any architectural anti-patterns?

### Developer
**Focus:** Implementability
- Can I actually build this from these instructions?
- Are the steps clear and actionable?
- Are dependencies and tools correct?

### Tech Lead
**Focus:** Code quality and patterns
- Does the structure follow our patterns?
- Is the code organization appropriate?
- Are there code quality concerns?

### QA Engineer
**Focus:** Testing and edge cases
- Are all acceptance criteria testable?
- Are edge cases properly handled?
- Is error handling comprehensive?

---

## Implementation Notes

### Forked Context Behavior

```
Main Context                    Forked Context (this skill)
     │                                │
     ├── Invoke skill ──────────────► │
     │                                ├── Receive inputs
     │                                ├── Initialize Party Mode
     │   (main context preserved)     ├── Agent discussions (multi-round)
     │                                ├── Reach consensus
     │                                ├── Generate final plan
     │   ◄──────────────────────────── Return result only
     │                                  (discussion NOT returned)
     └── Continue with final_plan
```

### Discussion Flow

```
Round 1: Initial Review
  ├── Each agent reviews draft plan
  ├── Each agent reviews OpenCode findings
  └── Each agent shares initial concerns

Round 2: Debate & Resolution
  ├── Agents discuss critical issues
  ├── Propose changes to address issues
  └── Debate suggestions (accept/reject)

Round 3: Final Consensus (if needed)
  ├── Vote on final plan
  ├── Document dissenting opinions
  └── Determine status (approved/needs_revision)
```

### Consensus Rules

| Scenario | Status |
|----------|--------|
| All agents approve | `approved` |
| All approve, some with notes | `approved_with_reservations` |
| Any agent rejects (critical issue unresolved) | `needs_revision` |
| No consensus after max rounds | `needs_revision` |

---

## Testing Requirements

### Test Cases

| ID | Test Case | Input | Expected Output |
|----|-----------|-------|-----------------|
| TC-01 | Clean plan approval | Good plan, minor issues only | status="approved", all issues fixed |
| TC-02 | Plan with major issues | Plan with 2 major issues | status="approved", issues addressed in final_plan |
| TC-03 | Plan with critical issue | Plan violating architecture | status="needs_revision", architect rejects |
| TC-04 | Suggestions handling | Plan with 3 suggestions | accepted/rejected with reasons |
| TC-05 | Agent disagreement | Borderline plan | dissenting_opinions populated |
| TC-06 | Missing OpenCode review | No opencode_review | success=false, error message |
| TC-07 | Brief discussion depth | discussion_depth="brief" | Fewer rounds, faster completion |
| TC-08 | Thorough discussion depth | discussion_depth="thorough" | More detailed analysis |

---

## Constraints

<constraints>
- MUST run in forked context (context: fork in SKILL.md)
- MUST NOT exceed 120 seconds execution time
- MUST NOT return full discussion transcript (only summary/result)
- MUST address all critical and major OpenCode issues
- MUST preserve all acceptance criteria coverage
- MUST document why any suggestion was rejected
- SHOULD reach consensus within max_discussion_rounds
- SHOULD NOT add new requirements not in original story
- SHOULD NOT significantly change scope of implementation
</constraints>

---

## Success Criteria

1. ✓ Party Mode successfully invoked with correct agents
2. ✓ All critical/major OpenCode issues addressed or documented as blockers
3. ✓ Final plan is more complete than draft plan
4. ✓ Changes are documented with finding references
5. ✓ Agent consensus is captured
6. ✓ Main workflow context not polluted
7. ✓ Execution completes within 120 seconds
8. ✓ Works with both Claude Code and OpenCode
