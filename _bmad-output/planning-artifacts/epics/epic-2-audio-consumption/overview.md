# Epic 2: Audio Consumption

**Author:** Claude Opus 4.5
**Date:** 2026-01-16
**Last Updated:** 2026-02-05

---

## Overview

Users can convert extracted and refined content to audio (TTS) for listening on walks, commutes, or any time screen-free consumption is preferred. This epic delivers the audio generation capability using the existing tts-openai skill.

### KISS Architecture

<critical_rules>
**Single Skill Pattern:**

All stories modify ONE skill: `.claude/skills/consume/SKILL.md`

No step-file workflow architecture. No config.yaml. CLI arguments only.

**Command Interface:**
```bash
/consume {slug}           # Basic usage (default voice: nova)
/consume {slug} -v echo   # With voice selection
```
</critical_rules>

### Objectives

1. Enable users to convert text content to speech audio
2. Support voice selection via CLI argument
3. Output standard MP3 format for universal playback

### Scope

<constraints>
**In Scope:**
- Text-to-speech conversion via OpenAI TTS API
- Voice selection via `-v` argument
- MP3 audio file output
- Automatic chunked processing for long content (> 4000 chars)

**Out of Scope:**
- Local TTS engines (only OpenAI API)
- Config file for voice preferences (CLI argument instead)
- Resume capability for interrupted processing (re-run on failure)
- Fallback for missing ffmpeg (require it)
</constraints>

---

## Stories Summary

| Story | Title | Priority | Adds to Skill |
|-------|-------|----------|---------------|
| 2.1 | Convert Text to Audio | P0 | Creates consume skill with basic TTS |
| 2.2 | Configure Voice Preferences | P1 | Adds `-v {voice}` argument |
| 2.3 | Chunked Audio for Long Content | P1 | Adds auto length detection + chunking |

---

## Non-Functional Requirements

<nfr>
### Reliability
- Clear error messages when TTS API fails
- Clear error when OPENAI_API_KEY missing
- Clear error when ffmpeg missing (for long content)

### Integration
- Uses OpenAI TTS API via existing tts-openai skill
- Requires OPENAI_API_KEY environment variable
- Requires ffmpeg for content > 4000 chars

### Simplicity (KISS)
- Single skill, not workflow architecture
- CLI arguments, not config file
- Overwrite existing audio with warning (no interactive prompt)
- Re-run on failure (no resume logic)
</nfr>

---

## Risks and Mitigations

<risks>
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| OPENAI_API_KEY not set | H | M | Clear error message with setup instructions |
| API rate limits exceeded | M | L | Clear message, user retries manually |
| Very long content exceeds limits | M | M | Chunked processing splits content |
| Network failures during TTS | M | M | Actionable error with retry guidance |
</risks>

---

## Dependencies

<dependencies>
### Epic Dependencies
- **Epic 1**: Requires extracted transcript content to convert

### External Dependencies
- OpenAI TTS API (via OPENAI_API_KEY)
- tts-openai skill (existing, at `.claude/skills/tts-openai/`)
- ffmpeg (required for content > 4000 chars)
</dependencies>

---

## Requirements Traceability

| FR | Description |
|----|-------------|
| FR10 | System can convert processed text to audio via TTS engine |
| FR11 | User can configure TTS voice preferences |
| FR12 | System can output audio in standard format (MP3) |
| FR13 | User can listen to generated audio on external devices/apps |

---

## References

- [Epics Index](../index.md)
