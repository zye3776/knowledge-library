---
name: dev-party-mode-review
description: Run BMM Party Mode multi-agent review on implementation plan, returns final reviewed plan
allowed-tools: [Read, Skill]
context: fork
---

# Dev Party Mode Review

Run multi-agent implementation plan review using BMM agents, producing a final reviewed plan with consensus and change documentation.

## Purpose

After OpenCode review generates suggestions and issues, this skill orchestrates a focused multi-agent discussion to:
- Debate technical trade-offs
- Incorporate OpenCode feedback
- Reach consensus on final plan
- Produce a polished, implementation-ready document

<critical_rules>
## Execution Requirements

- MUST run in forked context (no main context pollution)
- MUST complete within 120 seconds
- MUST NOT return full discussion transcript (only summary/result)
- MUST address all critical and major OpenCode issues
- MUST preserve all acceptance criteria coverage
- MUST document why any suggestion was rejected
</critical_rules>

## Input Parameters

<user_input>
The skill receives:
- `draft_plan` - The draft implementation plan markdown
- `opencode_review` - Results from dev-opencode-review (suggestions, issues, coverage_analysis)
- `story_context` - Story id, name, description, acceptance_criteria
- `project_context` - architecture_highlights, coding_standards_highlights, epic_goal
- `options` - discussion_depth, required_consensus, max_discussion_rounds
</user_input>

<instructions>
## Phase 1: Initialize Review Context

1. Parse all input parameters
2. Count OpenCode findings by severity:
   - Critical issues (blocking)
   - Major issues (must address)
   - Minor issues (should address)
   - Suggestions (evaluate for acceptance)
3. Build review briefing for agents

## Phase 2: Agent Briefing

Present context to all participating agents:

**Review Briefing:**
```
Story: {story_id} - {story_name}
Epic Goal: {epic_goal}

OpenCode Findings:
- {N} critical issues (MUST resolve)
- {M} major issues (MUST address)
- {P} minor issues (should address)
- {Q} suggestions (evaluate)

Coverage Gaps: {criteria_gaps}

Architecture Constraints:
{architecture_highlights}

Coding Standards:
{coding_standards_highlights}
```

## Phase 3: Agent Review Rounds

### Round 1: Initial Review

Each agent reviews the draft plan against their focus area:

**Architect** (Focus: Architectural alignment)
- Does the plan fit the system architecture?
- Are technical decisions consistent with architecture.md?
- Are there any architectural anti-patterns?

**Developer** (Focus: Implementability)
- Can I actually build this from these instructions?
- Are the steps clear and actionable?
- Are dependencies and tools correct?

**Tech Lead** (Focus: Code quality and patterns)
- Does the structure follow our patterns?
- Is the code organization appropriate?
- Are there code quality concerns?

**QA Engineer** (Focus: Testing and edge cases)
- Are all acceptance criteria testable?
- Are edge cases properly handled?
- Is error handling comprehensive?

Each agent reports:
- Their assessment of the draft plan
- Which OpenCode issues they see as valid
- Initial approval stance: approve / concerns / reject

### Round 2: Debate & Resolution

Agents discuss:
1. Critical and major issues - propose specific fixes
2. Suggestions - vote accept/reject with rationale
3. Any conflicting views between agents

For each OpenCode finding:
- Determine change_type: "fixed" | "partially_addressed" | "deferred"
- Document what section will be modified
- Describe the change to be made

### Round 3: Final Consensus (if needed)

If consensus not reached in Round 2:
1. Summarize remaining disagreements
2. Each agent provides final vote
3. Document dissenting opinions
4. Determine final status

## Phase 4: Generate Final Plan

Apply all agreed changes to the draft plan:

1. **Update frontmatter:**
   ```yaml
   reviewed: {date}
   status: READY_FOR_DEV
   review_confidence: {confidence_score}
   ```

2. **Incorporate fixes:**
   - Address each critical/major issue
   - Apply accepted suggestions
   - Maintain AC coverage

3. **Ensure completeness:**
   - All implementation steps clear
   - All edge cases documented
   - All tests specified

## Phase 5: Build Output

Construct the result object with:

1. `final_plan` - Complete reviewed implementation plan markdown
2. `status` - "approved" | "approved_with_reservations" | "needs_revision"
3. `confidence_score` - 0-100 consensus confidence
4. `changes_made` - Array of changes with finding_id references
5. `suggestions_disposition` - accepted/rejected/deferred with reasons
6. `agent_consensus` - Each agent's vote and dissenting opinions
7. `quality_assessment` - implementability, completeness, clarity, architectural_fit scores

</instructions>

## Agent Roles

| Agent | Focus Area | Key Questions |
|-------|------------|---------------|
| Architect | Architectural alignment | Fits architecture? Consistent decisions? Anti-patterns? |
| Developer | Implementability | Clear instructions? Correct deps? Buildable? |
| Tech Lead | Code quality | Follows patterns? Good structure? Quality concerns? |
| QA Engineer | Testing & edge cases | Testable ACs? Edge cases handled? Error handling? |

## Consensus Rules

| Scenario | Status |
|----------|--------|
| All agents approve | `approved` |
| All approve, some with notes | `approved_with_reservations` |
| Any agent rejects (critical issue unresolved) | `needs_revision` |
| No consensus after max rounds | `needs_revision` |

## Discussion Depth Options

| Depth | Rounds | Agent Analysis |
|-------|--------|----------------|
| brief | 1-2 | Quick assessment, minimal debate |
| standard | 2-3 | Full review with debate |
| thorough | 3+ | Deep analysis, extensive discussion |

<output_format>
## Result Structure

```yaml
success: true
error: null

result:
  final_plan: |
    ---
    story_id: "{story_id}"
    story_name: "{story_name}"
    epic: "{epic}"
    created: {created_date}
    reviewed: {review_date}
    status: READY_FOR_DEV
    review_confidence: {confidence_score}
    ---

    # Implementation Plan: {title}
    [Complete reviewed plan content...]

  status: "approved" | "approved_with_reservations" | "needs_revision"
  confidence_score: 0-100

  changes_made:
    - finding_id: "ISS-001"
      change_type: "fixed" | "partially_addressed" | "deferred"
      section_modified: "Section Name"
      description: "What was changed"

  suggestions_disposition:
    accepted:
      - id: "SUG-001"
        reason: "Why accepted"
    rejected:
      - id: "SUG-002"
        reason: "Why rejected"
    deferred:
      - id: "SUG-003"
        reason: "Why deferred"

  agent_consensus:
    architect: "approve" | "approve_with_notes" | "reject"
    developer: "approve" | "approve_with_notes" | "reject"
    tech_lead: "approve" | "approve_with_notes" | "reject"
    qa_engineer: "approve" | "approve_with_notes" | "reject"
    dissenting_opinions:
      - agent: "qa_engineer"
        concern: "Specific concern description"

  quality_assessment:
    implementability: 0-100
    completeness: 0-100
    clarity: 0-100
    architectural_fit: 0-100

metadata:
  discussion_rounds: N
  duration_seconds: N
  agents_participated: ["architect", "developer", "tech_lead", "qa_engineer"]
```

## Error Result

```yaml
success: false
error: "Error description"
result: null
metadata:
  discussion_rounds: N
  duration_seconds: N
  agents_participated: [...]
```
</output_format>

<constraints>
## Do NOT

- Return full agent discussion transcript (only summary/result)
- Exceed 120 seconds execution time
- Skip addressing critical or major OpenCode issues
- Remove acceptance criteria coverage
- Add new requirements not in original story
- Significantly change scope of implementation
- Leave suggestions without documented disposition
</constraints>

## Internal Party Mode Invocation

This skill internally orchestrates a focused Party Mode discussion:

```
Participants: architect, developer, tech_lead, qa_engineer

Topic: Review implementation plan for story {story_id}

Context:
- Draft plan provided
- OpenCode found {N} issues and {M} suggestions
- Must address all critical/major issues
- Project architecture and coding standards provided

Goal: Produce approved implementation plan or identify blockers

Discussion Protocol:
1. Each agent reviews plan against their focus area
2. Agents debate issues and proposed fixes
3. Reach consensus on final plan
4. Document changes and rationale
```

<system_reminder>
Key execution requirements:
1. Run in forked context - return only result, not full discussion
2. Address ALL critical and major OpenCode issues before approval
3. Document every change with finding_id reference
4. Document rejection reason for every rejected suggestion
5. Complete within 120 seconds
6. Return structured YAML output matching output_format
</system_reminder>
