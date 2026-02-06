# Story 2.1: Convert Text to Audio

Status: backlog

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

- [ ] **Task 1: Consume skill** (AC: 1, 3)
  - [ ] 1.1 Create consume skill at `.claude/skills/consume/SKILL.md`
  - [ ] 1.2 Accept slug as argument
  - [ ] 1.3 Check for refined.md first, fall back to transcript.md
  - [ ] 1.4 Invoke tts-openai: `.claude/skills/tts-openai/scripts/speak -f {content} -o libraries/{slug}/audio.mp3`
  - [ ] 1.5 Update metadata.yaml with `stage: consumed`, `audio_generated_at`, `audio_file`

- [ ] **Task 2: Error handling** (AC: 2)
  - [ ] 2.1 Check OPENAI_API_KEY before starting generation
  - [ ] 2.2 Display clear setup instructions if key missing
  - [ ] 2.3 If audio.mp3 already exists, overwrite with warning message (no prompt)

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

## References

- [Epic Overview](../overview.md)
- [tts-openai SKILL.md](/.claude/skills/tts-openai/SKILL.md)
