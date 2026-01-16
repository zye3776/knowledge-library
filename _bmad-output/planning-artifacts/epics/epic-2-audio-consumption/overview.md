# Epic 2: Audio Consumption

**Author:** Claude Opus 4.5
**Date:** 2026-01-16

---

## Overview

Users can convert extracted and refined content to audio (TTS) for listening on walks, commutes, or any time screen-free consumption is preferred. This epic delivers the audio generation capability using the existing tts-openai skill.

### Objectives

1. Enable users to convert text content to speech audio
2. Support voice preference configuration
3. Output standard MP3 format for universal playback

### Scope

<constraints>
**In Scope:**
- Text-to-speech conversion via OpenAI TTS API
- Voice selection and configuration
- MP3 audio file output
- Chunked processing for long content

**Out of Scope:**
- Local TTS engines (only OpenAI API)
- Real-time streaming playback
- Audio editing or post-processing
- Multiple simultaneous voice outputs
</constraints>

---

## Stories Summary

| Story | Title | Priority | Dependencies |
|-------|-------|----------|--------------|
| 2.1 | Convert Text to Audio | P0 | None |
| 2.2 | Configure Voice Preferences | P1 | 2.1 |
| 2.3 | Chunked Audio for Long Content | P1 | 2.1 |

---

## Non-Functional Requirements

<nfr>
### Reliability
- Clear error messages when TTS API fails
- Graceful handling of API rate limits
- Partial failures do not corrupt existing audio files

### Integration
- Uses OpenAI TTS API via existing tts-openai skill
- Requires OPENAI_API_KEY environment variable
- Integration failures reported with actionable guidance

### Simplicity
- Reuses existing tts-openai skill infrastructure
- No automatic retry logic - user initiates retries
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
- OpenAI TTS API
- tts-openai skill (existing)
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
