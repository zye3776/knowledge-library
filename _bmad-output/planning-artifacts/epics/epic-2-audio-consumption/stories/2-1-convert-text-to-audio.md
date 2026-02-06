# Story 2.1: Convert Text to Audio

Status: done

## Story

As a **knowledge library user**,
I want to convert my extracted transcript to audio,
So that I can listen to the content on walks, commutes, or whenever screen-free consumption is preferred.

## Background

This is the core audio consumption story. The tts-openai skill already exists with full TTS capabilities. This story creates a thin wrapper skill that takes a library slug, invokes the TTS skill, and updates metadata.

**KISS Principle:** No step-file workflow architecture. One skill, one command.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given a library item slug, when consume skill is invoked with `consume {slug}`, then audio.mp3 is generated in `libraries/{slug}/`
2. **AC2:** Given OPENAI_API_KEY is not set, when consume is invoked, then a clear error message explains setup requirements
3. **AC3:** Given successful audio generation, when the process completes, then metadata.yaml is updated with `stage: consumed` and `audio_generated_at` timestamp
</acceptance_criteria>

## Tasks

- [x] **Task 1: Consume skill** (AC: 1, 3)
  - [x] 1.1 Create consume skill at `.claude/skills/consume/SKILL.md`
  - [x] 1.2 Accept slug as argument
  - [x] 1.3 Check for refined.md first, fall back to transcript.md
  - [x] 1.4 Invoke tts-openai: `.claude/skills/tts-openai/scripts/speak -v nova -f {content} -o libraries/{slug}/audio.mp3`
  - [x] 1.5 Update metadata.yaml with `stage: consumed`, `audio_generated_at`, `audio_file`

- [x] **Task 2: Error handling** (AC: 2)
  - [x] 2.1 Check OPENAI_API_KEY before starting generation
  - [x] 2.2 Display clear setup instructions if key missing
  - [x] 2.3 If audio.mp3 already exists, overwrite with warning message (no prompt)

## Technical Notes

<technical_notes>
**Skill Location:** `.claude/skills/consume/SKILL.md`

**Command Pattern:**
```bash
# Invoke consume skill
/consume my-video-slug

# Internally runs:
.claude/skills/tts-openai/scripts/speak -f libraries/{slug}/refined.md -o libraries/{slug}/audio.mp3
```

**Content Priority:**
1. Use `refined.md` if exists (noise removed)
2. Fall back to `transcript.md` if no refinement

**Metadata Update:**
```yaml
stage: consumed
audio_generated_at: "2026-01-16T10:30:00Z"
audio_file: audio.mp3
tts_voice: nova
```

**Overwrite Behavior:** If audio.mp3 exists, overwrite and log warning. No interactive prompt.
</technical_notes>

## Verification

<verification>
```bash
# AC1 Verification - Generate audio from transcript
echo "This is a test transcript." > libraries/test-slug/transcript.md
# Invoke /consume test-slug
test -f libraries/test-slug/audio.mp3 && echo "PASS: Audio generated"
file libraries/test-slug/audio.mp3 | grep -i "audio\|mp3\|mpeg"

# AC2 Verification - Missing API key
(unset OPENAI_API_KEY; .claude/skills/tts-openai/scripts/speak "test" 2>&1) | grep -i "key\|api\|auth"
# Expected: Error message about API key

# AC3 Verification - Metadata update
yq '.stage' libraries/test-slug/metadata.yaml  # Expected: consumed
yq '.audio_generated_at' libraries/test-slug/metadata.yaml  # Expected: ISO timestamp
```
</verification>

## Dependencies

- tts-openai skill must be built: `cd .claude/skills/tts-openai && bun install && bun run build`
- OPENAI_API_KEY environment variable must be set
- Library item must exist with transcript.md or refined.md

## Technical Implementation Notes

<technical_implementation_notes>
**Implemented:** 2026-02-06

**Architecture:** Pure instruction skill (SKILL.md only, no TypeScript code). Claude Code follows the instructions to orchestrate the tts-openai executable.

**Key Decisions:**
- Explicit `-v nova` flag passed to tts-openai for metadata accuracy (avoids implicit coupling with default)
- "When to Use" and "Setup" sections added for pattern consistency with peer skills
- Metadata.yaml is created if absent (defensive for manually-created library items)
- 7-step instruction flow: validate input → check API key → locate content → check existing audio → generate → update metadata → report

**KISS Compliance:**
- Single file: `.claude/skills/consume/SKILL.md`
- No workflow architecture, no step files, no config file
- No TypeScript code, no build step, no tests required
- Direct invocation: `/consume {slug}`

**Files Created:** `.claude/skills/consume/SKILL.md`
**Files Modified:** None (metadata.yaml updated at runtime only)
</technical_implementation_notes>

## References

- [Epic Overview](../overview.md)
- [tts-openai SKILL.md](/.claude/skills/tts-openai/SKILL.md)
