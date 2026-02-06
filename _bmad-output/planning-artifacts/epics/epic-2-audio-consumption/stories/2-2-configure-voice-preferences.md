# Story 2.2: Configure Voice Preferences

Status: backlog

## Story

As a **knowledge library user**,
I want to specify a TTS voice when converting content,
So that I can listen in a voice that suits my preference.

## Background

The tts-openai skill supports 6 voices (alloy, echo, fable, nova, onyx, shimmer). This story adds voice selection as a CLI argument to the consume skill.

**KISS Principle:** No config file. Pass voice as argument. Default to `nova`.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given a voice argument (`/consume slug -v echo`), when audio is generated, then the specified voice is used
2. **AC2:** Given no voice argument, when audio is generated, then the default voice (nova) is used
3. **AC3:** Given an invalid voice name, when consume starts, then a clear error lists the 6 valid options
</acceptance_criteria>

## Tasks

- [ ] **Task 1: Add voice argument to consume skill** (AC: 1, 2)
  - [ ] 1.1 Accept optional `-v {voice}` argument in consume skill
  - [ ] 1.2 Default to `nova` if not specified
  - [ ] 1.3 Pass voice to tts-openai: `.claude/skills/tts-openai/scripts/speak -v {voice} -f ...`
  - [ ] 1.4 Record voice used in metadata.yaml

- [ ] **Task 2: Voice validation** (AC: 3)
  - [ ] 2.1 Validate voice against: alloy, echo, fable, nova, onyx, shimmer
  - [ ] 2.2 On invalid voice, error with: "Invalid voice '{voice}'. Valid options: alloy, echo, fable, nova, onyx, shimmer"

## Technical Notes

<technical_notes>
**Command Pattern:**
```bash
# With voice
/consume my-video-slug -v echo

# Default (nova)
/consume my-video-slug

# Internally runs:
.claude/skills/tts-openai/scripts/speak -v {voice} -f libraries/{slug}/refined.md -o libraries/{slug}/audio.mp3
```

**Valid Voices:**
- alloy (neutral)
- echo (warm)
- fable (British)
- nova (default, friendly)
- onyx (deep)
- shimmer (soft)

**Validation:**
```typescript
const VALID_VOICES = ['alloy', 'echo', 'fable', 'nova', 'onyx', 'shimmer'];
if (voice && !VALID_VOICES.includes(voice)) {
  throw new Error(`Invalid voice '${voice}'. Valid: ${VALID_VOICES.join(', ')}`);
}
```

**Metadata:**
```yaml
tts_voice: echo  # Records what was actually used
```
</technical_notes>

## Verification

<verification>
```bash
# AC1 - Voice argument used
# /consume test-slug -v echo
yq '.tts_voice' libraries/test-slug/metadata.yaml  # echo

# AC2 - Default voice
# /consume test-slug
yq '.tts_voice' libraries/test-slug/metadata.yaml  # nova

# AC3 - Invalid voice error
# /consume test-slug -v bad_voice
# Expected: "Invalid voice 'bad_voice'. Valid: alloy, echo, fable, nova, onyx, shimmer"

# Direct skill test
.claude/skills/tts-openai/scripts/speak -v echo "Test" -o /tmp/test.mp3
test -f /tmp/test.mp3 && echo "PASS"
```
</verification>

## Dependencies

- Story 2.1 must be complete (consume skill exists)
- tts-openai skill supports `-v` flag

## References

- [Epic Overview](../overview.md)
- [tts-openai SKILL.md](/.claude/skills/tts-openai/SKILL.md)
