# Story 4.3: Re-run Pipeline Stage

Status: done

## Story

As a **knowledge library user**,
I want to re-run a specific pipeline stage on existing content,
So that I can regenerate refinement with different settings or create new audio after updates.

## Background

Users may want to re-run individual stages: perhaps refinement removed too much content, or TTS settings were wrong, or the source video was updated. This story enables selective re-execution of any pipeline stage on content that has already been processed.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given a library item, when user selects re-run and confirms the overwrite warning, then they can choose which stage to re-run (extract, refine, consume)
2. **AC2:** Given re-run of extract stage, when source_url exists in metadata, then transcript.md is replaced with new extraction
3. **AC3:** Given re-run of refine stage, when transcript.md exists, then refined.md is regenerated from current transcript
4. **AC4:** Given re-run of consume stage, when transcript.md or refined.md exists, then audio is regenerated from the best available source (refined.md preferred)
5. **AC5:** Given re-run of any stage, when completed, then metadata.yaml completed_at timestamp for that stage is updated
6. **AC6:** Given re-run of extract without source_url, or refine without transcript.md, then the operation fails with clear prerequisite error
</acceptance_criteria>

## Tasks

- [x] **Task 1: Re-run menu with confirmation** (AC: 1, 6)
  - [x] 1.1 Add re-run option to library item detail view (modifies Story 4.2 output)
  - [x] 1.2 Present stage selection menu (Extract/Refine/Consume)
  - [x] 1.3 Check prerequisites before allowing stage selection
  - [x] 1.4 Display overwrite warning and require confirmation

- [x] **Task 2: Extract re-run** (AC: 2, 5, 6)
  - [x] 2.1 Validate source_url exists in metadata
  - [x] 2.2 Re-invoke extraction from stored source URL
  - [x] 2.3 Replace transcript.md with new content
  - [x] 2.4 Update extract.completed_at timestamp

- [x] **Task 3: Refine re-run** (AC: 3, 5, 6)
  - [x] 3.1 Validate transcript.md exists
  - [x] 3.2 Re-invoke refinement on current transcript.md
  - [x] 3.3 Replace refined.md with new content
  - [x] 3.4 Update refine.completed_at timestamp

- [x] **Task 4: Consume re-run** (AC: 4, 5, 6)
  - [x] 4.1 Validate transcript.md or refined.md exists
  - [x] 4.2 Determine best source (prefer refined.md if exists)
  - [x] 4.3 Re-invoke TTS generation
  - [x] 4.4 Replace audio file
  - [x] 4.5 Update consume.completed_at timestamp

## Technical Notes

<technical_notes>
**Re-run Menu:**
```
=== Re-run Stage: Understanding Async JavaScript ===

Current status: audio (fully processed)

Which stage would you like to re-run?
[E] Extract - Re-fetch transcript from YouTube
[R] Refine - Re-process with current refinement rules
[C] Consume - Regenerate audio from current content
[X] Cancel

Note: Re-running a stage will overwrite existing output for that stage.
```

**Metadata Update on Re-run:**
```yaml
# Before re-run
refine:
  completed_at: "2026-01-15T10:32:00Z"

# After re-run (simple overwrite, git tracks history)
refine:
  completed_at: "2026-01-16T14:20:00Z"
```

**Prerequisite Checks (Hard Requirements):**
- Extract: Requires source_url in metadata
- Refine: Requires transcript.md exists
- Consume: Requires transcript.md or refined.md exists

**Cross-Story Coupling:**
Task 1.1 modifies the library item detail view from Story 4.2. This is intentional — re-run is accessed from within the library browser.

**No Cascade:**
Each re-run is single-stage only. If user wants to re-run multiple stages, they invoke re-run multiple times. Keeps the interaction simple and predictable.
</technical_notes>

## Verification

<verification>
```bash
# AC1 Verification - Re-run menu accessible
# Manual: Select library item, choose re-run option
# Expected: Stage selection menu displayed

# AC2 Verification - Extract re-run works
# Manual: Re-run extract on existing item
# Expected: transcript.md updated, timestamp changed

# AC3 Verification - Refine re-run works
# Manual: Re-run refine on existing item
# Expected: refined.md regenerated, timestamp updated

# AC4 Verification - Consume re-run works
# Manual: Re-run consume on existing item
# Expected: audio.mp3 regenerated, timestamp updated

# AC5 Verification - Metadata updated
cat libraries/*/metadata.yaml | grep -A5 "completed_at"
# Expected: New timestamps reflect re-run
```
</verification>

## Dependencies

- Requires Story 4.1 (pipeline orchestration exists)
- Requires Story 4.2 (library access enables item selection)

## Technical Implementation Notes

<technical_implementation_notes>
**Implemented:** 2026-02-06

**Architecture:** Integrated into `.claude/skills/library/SKILL.md` Step 5 (Re-run menu) rather than a separate skill.

**Key Decisions:**
- Re-run menu accessible from library item detail view
- Prerequisite checks before each stage (source_url, transcript.md, content files)
- Overwrite confirmation before replacing files
- Invokes existing skills: extract-youtube, refine, consume
- Single-stage only (no cascade re-run)
- Metadata timestamps updated by underlying skills

**KISS Compliance:** Integrated into library skill, no separate re-run skill
**Files Modified:** `.claude/skills/library/SKILL.md` (Step 5 added)
</technical_implementation_notes>

## References

- [Epic Overview](../overview.md)
- [PRD FR16](/_bmad-output/planning-artifacts/prd.md)
