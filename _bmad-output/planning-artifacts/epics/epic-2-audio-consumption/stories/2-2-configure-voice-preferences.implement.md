---
# Plan Status Tracking
story_id: "2-2"
story_name: "configure-voice-preferences"
epic: "epic-2-audio-consumption"
epic_path: "_bmad-output/planning-artifacts/epics/epic-2-audio-consumption"
story_path: "_bmad-output/planning-artifacts/epics/epic-2-audio-consumption/stories/2-2-configure-voice-preferences.md"
created: "2026-02-05"
last_modified: "2026-02-05"
status: draft
iteration: 2
reviews:
  user_approved: false
  self_check_passed: true
  kiss_review: true
---

# Implementation Plan: Configure Voice Preferences

## Overview

Add voice selection as a CLI argument to the consume skill. No config file needed.

**KISS Principle Applied:** Pass voice as argument. Default to `nova`. Validate inline. No config.yaml, no session state, no menu selection.

## Critical Technical Decisions

### Architecture Alignment
- **Pattern**: CLI argument, not config file
- **Default**: `nova` (friendly, natural)
- **Validation**: Inline check, clear error message

### Key Trade-offs
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Voice source | CLI argument | KISS - no config file to manage |
| Default | Hard-coded `nova` | Single source of truth |
| Validation | Inline check | 3 lines of code, not 8 tasks |

## High-Level Approach

Modify the consume skill to accept `-v {voice}` argument. Validate against 6 valid voices. Pass to tts-openai. Record in metadata.

### Files Affected
- **Modify:**
  - `.claude/skills/consume/SKILL.md` - Add voice argument handling

### Dependencies
| Type | Dependency | Notes |
|------|------------|-------|
| Story | 2-1 complete | Consume skill must exist |
| Internal | tts-openai `-v` flag | Already implemented |

## Implementation Phases

### Phase 1: Add Voice Argument
- **Goal:** Accept and validate voice argument
- **Output:** Updated consume skill

**Tasks:**
1. Parse `-v {voice}` argument from skill invocation
2. Default to `nova` if not provided
3. Validate against: `['alloy', 'echo', 'fable', 'nova', 'onyx', 'shimmer']`
4. On invalid, error: "Invalid voice '{voice}'. Valid: alloy, echo, fable, nova, onyx, shimmer"
5. Pass to tts-openai: `-v {voice}`
6. Record in metadata.yaml: `tts_voice: {voice}`

**Validation (inline):**
```typescript
const VALID = ['alloy', 'echo', 'fable', 'nova', 'onyx', 'shimmer'];
const voice = args.v || 'nova';
if (!VALID.includes(voice)) throw new Error(`Invalid voice '${voice}'. Valid: ${VALID.join(', ')}`);
```

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | Voice argument used | Phase 1, Task 5 |
| AC2 | Default to nova | Phase 1, Task 2 |
| AC3 | Clear error for invalid voice | Phase 1, Task 4 |

## Agent Instructions

### Agent Workflow
1. Modify consume skill to parse `-v` argument
2. Add validation
3. Pass to tts-openai
4. Test all 6 voices
5. Test invalid voice error

### Verification Commands
```bash
# AC1 - Voice used
# /consume test-slug -v echo
yq '.tts_voice' libraries/test-slug/metadata.yaml  # echo

# AC2 - Default
# /consume test-slug
yq '.tts_voice' libraries/test-slug/metadata.yaml  # nova

# AC3 - Invalid error
# /consume test-slug -v bad
# Expected: "Invalid voice 'bad'. Valid: alloy, echo, fable, nova, onyx, shimmer"
```

---

## Self-Check (Workflow Use Only)

```yaml
self_check:
  high_level: true
  no_coding_standards: true
  decisions_clear: true
  phases_defined: true
  ac_mapped: true
  agent_instructions: true
  kiss_compliant: true  # Removed config.yaml, session override, voice preview
```
