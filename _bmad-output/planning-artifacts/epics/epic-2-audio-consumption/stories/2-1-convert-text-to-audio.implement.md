---
# Plan Status Tracking
story_id: "2-1"
story_name: "convert-text-to-audio"
epic: "epic-2-audio-consumption"
epic_path: "_bmad-output/planning-artifacts/epics/epic-2-audio-consumption"
story_path: "_bmad-output/planning-artifacts/epics/epic-2-audio-consumption/stories/2-1-convert-text-to-audio.md"
created: "2026-02-05"
last_modified: "2026-02-05"
status: draft
iteration: 2
reviews:
  user_approved: false
  self_check_passed: true
  kiss_review: true
---

# Implementation Plan: Convert Text to Audio

## Overview

This story delivers the core audio consumption capability. Create a simple consume skill that takes a library slug, calls the existing tts-openai skill, and updates metadata.

**KISS Principle Applied:** No step-file workflow. No interactive selection. One skill, one command, one output.

## Critical Technical Decisions

### Architecture Alignment
- **Pattern**: Single skill file, not workflow architecture
- **File output**: Audio saved to `libraries/{slug}/audio.mp3`
- **Skill reuse**: Thin wrapper around existing `tts-openai` skill

### Key Trade-offs
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Single skill file | KISS - one command does one thing |
| Item selection | Slug as argument | No interactive menu - user knows what they want |
| Overwrite handling | Overwrite with warning | No prompt - prevents interruption, user can re-run |
| Content priority | refined.md > transcript.md | Use cleaned content when available |

## High-Level Approach

Create `.claude/skills/consume/SKILL.md` that:
1. Accepts slug argument
2. Validates OPENAI_API_KEY
3. Finds content file (refined.md or transcript.md)
4. Calls tts-openai skill
5. Updates metadata.yaml

### Files Affected
- **Create:**
  - `.claude/skills/consume/SKILL.md`

- **Modify:**
  - `libraries/{slug}/metadata.yaml` (runtime)

### Dependencies
| Type | Dependency | Notes |
|------|------------|-------|
| Internal | `.claude/skills/tts-openai/scripts/speak` | Must be built |
| Env Var | `OPENAI_API_KEY` | Required for TTS API |
| Internal | `libraries/{slug}/` | Must have content file |

## Implementation Phases

### Phase 1: Consume Skill
- **Goal:** Create consume skill that wraps tts-openai
- **Output:** `.claude/skills/consume/SKILL.md`

**Tasks:**
1. Create skill file with:
   - Skill frontmatter (name, description)
   - Accept `{slug}` as argument
   - Validate OPENAI_API_KEY exists
   - Check for `libraries/{slug}/refined.md`, fall back to `transcript.md`
   - Invoke: `.claude/skills/tts-openai/scripts/speak -f {content} -o libraries/{slug}/audio.mp3`
   - If audio.mp3 exists, log warning and overwrite
   - Update metadata.yaml with stage, timestamp, audio_file

**Skill Template:**
```markdown
---
name: consume
description: Convert library content to audio via TTS
---

# Consume Skill

**Usage:** `/consume {slug}`

## Instructions

1. Validate OPENAI_API_KEY is set
2. Find content: `libraries/{slug}/refined.md` or `libraries/{slug}/transcript.md`
3. If audio.mp3 exists, warn: "Overwriting existing audio.mp3"
4. Run: `.claude/skills/tts-openai/scripts/speak -f {content} -o libraries/{slug}/audio.mp3`
5. Update metadata.yaml:
   - stage: consumed
   - audio_generated_at: {ISO timestamp}
   - audio_file: audio.mp3
   - tts_voice: nova
6. Report success with file path
```

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | Generate audio.mp3 from slug | Phase 1, Tasks 3-4 |
| AC2 | Clear error when API key missing | Phase 1, Task 2 |
| AC3 | Update metadata.yaml on success | Phase 1, Task 5 |

## Agent Instructions

<critical_rules>
### Coding Standards Reference

Load coding standards from `.claude/rules/` when writing code.
</critical_rules>

### Agent Workflow
1. Create skill file
2. Test with real library item
3. Verify metadata update
4. Run verification commands

### Verification Commands
```bash
# AC1 - Generate audio
# /consume test-slug
test -f libraries/test-slug/audio.mp3 && echo "PASS"

# AC2 - API key error
(unset OPENAI_API_KEY; .claude/skills/tts-openai/scripts/speak "test" 2>&1)

# AC3 - Metadata
yq '.stage' libraries/test-slug/metadata.yaml  # consumed
yq '.audio_generated_at' libraries/test-slug/metadata.yaml  # timestamp
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
  kiss_compliant: true  # Simplified from 3 phases to 1
```
