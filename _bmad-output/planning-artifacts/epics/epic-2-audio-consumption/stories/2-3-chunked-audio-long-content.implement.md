---
# Plan Status Tracking
story_id: "2-3"
story_name: "chunked-audio-long-content"
epic: "epic-2-audio-consumption"
epic_path: "_bmad-output/planning-artifacts/epics/epic-2-audio-consumption"
story_path: "_bmad-output/planning-artifacts/epics/epic-2-audio-consumption/stories/2-3-chunked-audio-long-content.md"
created: "2026-02-05"
last_modified: "2026-02-05"
status: draft
iteration: 2
reviews:
  user_approved: false
  self_check_passed: true
  kiss_review: true
---

# Implementation Plan: Chunked Audio for Long Content

## Overview

Add automatic length detection to consume skill. Use chunked mode for content > 4000 chars, concatenate with ffmpeg.

**KISS Principle Applied:** Hard-coded 4000 char threshold. Require ffmpeg (no fallback). No resume support (re-run on failure). No config file.

## Critical Technical Decisions

### Architecture Alignment
- **Threshold**: 4000 chars (hard-coded, based on OpenAI 4096 limit)
- **Concatenation**: Require ffmpeg, fail if missing
- **Resume**: Not implemented - if TTS fails, re-run command

### Key Trade-offs
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Threshold | Hard-coded 4000 | KISS - no config file |
| ffmpeg | Required | KISS - one code path, not two |
| Resume | Not implemented | Verify tts-openai is idempotent; re-run on failure |
| Force flag | Removed | No use case provided |

## High-Level Approach

Modify consume skill to:
1. Count content characters
2. If > 4000, check ffmpeg exists, use chunked mode, concatenate
3. If <= 4000, use standard mode

### Files Affected
- **Modify:**
  - `.claude/skills/consume/SKILL.md` - Add length detection and chunked handling

### Dependencies
| Type | Dependency | Notes |
|------|------------|-------|
| Story | 2-1 complete | Consume skill must exist |
| Internal | tts-openai `--chunked` flag | Already implemented |
| External | ffmpeg | Required for concatenation |

## Implementation Phases

### Phase 1: Length Detection & Chunked Mode
- **Goal:** Auto-detect long content and route appropriately
- **Output:** Updated consume skill

**Tasks:**
1. Count characters: `wc -c {content_file}`
2. If <= 4000, use standard mode (existing behavior)
3. If > 4000:
   - Check ffmpeg: `which ffmpeg`
   - If missing: error "ffmpeg required for long content. Install: brew install ffmpeg"
   - Create temp dir: `/tmp/tts-{slug}`
   - Invoke chunked: `.claude/skills/tts-openai/scripts/speak --chunked -v {voice} -f {content} -d /tmp/tts-{slug}`
   - Create file list: `for f in /tmp/tts-{slug}/chunk-*.mp3; do echo "file '$f'"; done | sort -n > /tmp/filelist.txt`
   - Concatenate: `ffmpeg -f concat -safe 0 -i /tmp/filelist.txt -c copy libraries/{slug}/audio.mp3`
   - Update metadata: `tts_chunked: true`, `tts_chunk_count: N`, `content_chars: N`
4. Let OS handle `/tmp/` cleanup (no explicit cleanup code)

**Skill Flow:**
```
content_chars = count_chars(content_file)
if content_chars <= 4000:
  # Standard mode
  speak -v {voice} -f {content} -o {output}
else:
  # Chunked mode
  if not which ffmpeg:
    error "ffmpeg required. Install: brew install ffmpeg"
  speak --chunked -v {voice} -f {content} -d /tmp/tts-{slug}
  # Create filelist.txt
  ffmpeg -f concat -safe 0 -i filelist.txt -c copy {output}
```

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | Long content triggers chunked | Phase 1, Task 3 |
| AC2 | Concatenated to audio.mp3 | Phase 1, Task 3 |
| AC3 | Short content uses standard | Phase 1, Task 2 |
| AC4 | ffmpeg error if missing | Phase 1, Task 3 |

## Agent Instructions

### Agent Workflow
1. Modify consume skill with length detection
2. Test with short content (< 4000 chars)
3. Test with long content (> 4000 chars)
4. Test ffmpeg missing error
5. Verify concatenated output plays correctly

### Verification Commands
```bash
# AC1 - Long content chunked
python3 -c "print('Test. ' * 800)" > /tmp/long.md
wc -c /tmp/long.md  # > 4000
# /consume test-slug

# AC2 - Concatenated output
file libraries/test-slug/audio.mp3 | grep audio

# AC3 - Short content standard
echo "Short." > /tmp/short.md
# Standard mode

# AC4 - ffmpeg missing
# Rename ffmpeg, run on long content
# Expected: "ffmpeg required. Install: brew install ffmpeg"
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
  kiss_compliant: true  # Removed resume, fallback, force-chunked, config threshold
```
