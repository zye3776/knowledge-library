# Story 4.1: Run Full Pipeline

Status: ready

## Story

As a **knowledge library user**,
I want to run the complete Extract → Refine → Consume pipeline in one session,
So that I can go from a YouTube URL to listenable audio with minimal manual steps.

## Background

The three-phase pipeline (Extract, Refine, Consume) has been built as separate capabilities. This story orchestrates them into a seamless fire-and-forget workflow with a single review checkpoint at the end. Users can review the final result and optionally re-run stages via Story 4.3 if adjustments are needed.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given a YouTube URL, when full pipeline is initiated, then the system runs extract → refine → consume in sequence without intermediate prompts
2. **AC2:** Given pipeline completion, when audio is generated, then user sees a summary with word counts and audio duration
3. **AC3:** Given any stage fails, when the error occurs, then the pipeline halts with clear error message identifying the failed stage
4. **AC4:** Given a stage failure, when pipeline halts, then completed stage outputs are preserved (no data loss)
5. **AC5:** Given pipeline completion, when audio is generated, then metadata.yaml contains: source_url, title, status, and completed_at timestamp for each stage (extract, refine, consume)
</acceptance_criteria>

## Tasks

- [ ] **Task 1: Pipeline orchestration workflow** (AC: 1, 2)
  - [ ] 1.1 Create workflow entry point that accepts YouTube URL
  - [ ] 1.2 Invoke extract stage and wait for completion
  - [ ] 1.3 Invoke refine stage and wait for completion
  - [ ] 1.4 Invoke consume stage (TTS generation)
  - [ ] 1.5 Display completion summary (word counts, audio duration)

- [ ] **Task 2: Progress tracking** (AC: 5)
  - [ ] 2.1 Update status field after each stage completion
  - [ ] 2.2 Record completed_at timestamp for each stage

- [ ] **Task 3: Error handling** (AC: 3, 4)
  - [ ] 3.1 Catch stage failures gracefully
  - [ ] 3.2 Display clear error messages with stage context
  - [ ] 3.3 Preserve completed work from prior stages

## Technical Notes

<technical_notes>
**Pipeline Flow (Simplified):**
```
[Start] → Extract → Refine → Consume → [Summary] → [Done]
              ↓         ↓        ↓
           [Error: halt with progress saved]
```

**Completion Summary:**
```
=== Pipeline Complete ===
Title: Understanding Async JavaScript
Source: https://youtube.com/watch?v=abc123

Extracted: 4,523 words
Refined: 3,891 words (14% reduction)
Audio: 18:23 duration

Files saved to: libraries/understanding-async-javascript/
```

**Metadata Schema (Canonical):**
```yaml
# Required fields for Story 4.1
source_url: "https://youtube.com/watch?v=abc123"
title: "Understanding Async JavaScript"
status: "audio"  # Values: extracted | refined | audio
stages:
  extract:
    completed_at: "2026-01-16T09:01:00Z"
  refine:
    completed_at: "2026-01-16T09:02:00Z"
  consume:
    completed_at: "2026-01-16T09:05:00Z"
```

**Status Values:**
- `extracted` - Transcript available, pipeline stopped or failed after extract
- `refined` - Cleaned content available, pipeline stopped or failed after refine
- `audio` - Full pipeline complete

**Invocation:**
The pipeline will be initiated via a skill or command. No intermediate checkpoints — runs to completion or failure.
</technical_notes>

## Verification

<verification>
```bash
# AC1 Verification - Full pipeline runs
# Manual: Run full pipeline command with valid YouTube URL
# Expected: All three stages execute in sequence

# AC2, AC3 Verification - Checkpoints work
# Manual: Run pipeline, verify checkpoint menus appear after each stage
# Expected: User can choose Continue or Stop at each checkpoint

# AC4 Verification - Error handling
# Manual: Provide invalid URL or URL with no transcript
# Expected: Pipeline halts with clear error, no corruption

# AC5 Verification - Metadata complete
cat libraries/*/metadata.yaml | grep -A10 "pipeline:"
# Expected: All stage timestamps recorded
```
</verification>

## Dependencies

- Requires Epic 1 (Extract) completed
- Requires Epic 2 (Consume) completed
- Requires Epic 3 (Refine) completed

## References

- [Epic Overview](../overview.md)
- [PRD FR23, FR24](/_bmad-output/planning-artifacts/prd.md)
