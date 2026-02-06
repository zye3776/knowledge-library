# Story 2.3: Chunked Audio for Long Content

Status: done

## Story

As a **knowledge library user**,
I want long transcripts to be processed in chunks,
So that I can successfully convert lengthy content without hitting API limits.

## Background

The tts-openai skill already has `--chunked` mode that splits content by paragraphs. This story adds automatic length detection to the consume skill.

**Threshold:** 4000 chars (OpenAI API limit is 4096, with safety buffer).

**KISS Principle:** Pick ONE output approach. Require ffmpeg for concatenation. If ffmpeg missing, fail with install instructions.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given content exceeds 4000 chars, when consume is invoked, then chunked mode is automatically used
2. **AC2:** Given chunked mode completes, when all chunks are generated, then they are concatenated to audio.mp3 via ffmpeg
3. **AC3:** Given short content (<4000 chars), when consume is invoked, then standard single-file mode is used
4. **AC4:** Given ffmpeg is not installed, when chunked mode is needed, then error with install instructions
</acceptance_criteria>

## Tasks

- [x] **Task 1: Length detection** (AC: 1, 3)
  - [x] 1.1 Count characters in content file before TTS
  - [x] 1.2 If > 4000, use `--chunked` flag
  - [x] 1.3 If <= 4000, use standard mode

- [x] **Task 2: Chunked mode integration** (AC: 2)
  - [x] 2.1 Invoke: `.claude/skills/tts-openai/scripts/speak --chunked -f {content} -d /tmp/tts-{slug}`
  - [x] 2.2 Concatenate with ffmpeg: `ffmpeg -f concat -safe 0 -i filelist.txt -c copy audio.mp3`
  - [x] 2.3 Update metadata with `tts_chunked: true` and `tts_chunk_count`

- [x] **Task 3: ffmpeg requirement** (AC: 4)
  - [x] 3.1 Check ffmpeg exists before chunked mode
  - [x] 3.2 If missing: "Error: ffmpeg required for long content. Install: brew install ffmpeg"

## Technical Notes

<technical_notes>
**Threshold:** 4000 characters (hard-coded, based on OpenAI 4096 limit)

**Flow:**
```
content.length > 4000?
  YES → check ffmpeg → chunked mode → concatenate → audio.mp3
  NO  → standard mode → audio.mp3
```

**Chunked Command:**
```bash
.claude/skills/tts-openai/scripts/speak --chunked -f {content} -d /tmp/tts-{slug}
```

**Concatenation:**
```bash
for f in /tmp/tts-{slug}/chunk-*.mp3; do echo "file '$f'"; done | sort -n > /tmp/filelist.txt
ffmpeg -f concat -safe 0 -i /tmp/filelist.txt -c copy libraries/{slug}/audio.mp3
```

**No fallback.** If ffmpeg missing, fail with clear install instructions. Don't build two code paths.

**Metadata:**
```yaml
stage: consumed
tts_chunked: true
tts_chunk_count: 12
content_chars: 48000
```
</technical_notes>

## Verification

<verification>
```bash
# AC1 - Long content triggers chunked
python3 -c "print('Test content. ' * 400)" > /tmp/long.md
wc -c /tmp/long.md  # > 4000
# /consume test-slug
# Expected: "Using chunked mode (48000 chars)"

# AC2 - Concatenated output
test -f libraries/test-slug/audio.mp3 && echo "PASS"
file libraries/test-slug/audio.mp3 | grep -i audio

# AC3 - Short content uses standard
echo "Short." > /tmp/short.md
# Standard mode used

# AC4 - ffmpeg missing error
# Simulate by renaming ffmpeg, run consume on long content
# Expected: "Error: ffmpeg required for long content. Install: brew install ffmpeg"
```
</verification>

## Dependencies

- Story 2.1 must be complete (consume skill exists)
- tts-openai skill `--chunked` mode implemented
- ffmpeg required for concatenation

## Technical Implementation Notes

<technical_implementation_notes>
**Implemented:** 2026-02-06

**Architecture:** Modified existing consume SKILL.md to add automatic length detection and chunked mode routing. No new files created.

**Key Decisions:**
- Hard-coded 4000 char threshold (OpenAI limit 4096 with safety buffer)
- ffmpeg required for concatenation, no fallback (KISS: one code path)
- Temp files in `/tmp/tts-{slug}/`, OS handles cleanup
- No resume support - re-run on failure
- Metadata extended with `tts_chunked`, `tts_chunk_count`, `content_chars`
- `-y` flag on ffmpeg to auto-overwrite without prompt

**KISS Compliance:**
- No config file for threshold
- No resume/fallback mechanisms
- Standard/chunked routing is a single branch in Step 5
- Single output file always: `libraries/{slug}/audio.mp3`

**Files Modified:** `.claude/skills/consume/SKILL.md`
</technical_implementation_notes>

## References

- [Epic Overview](../overview.md)
- [tts-openai SKILL.md](/.claude/skills/tts-openai/SKILL.md)
