# Epic 2: Audio Consumption - Stories

## KISS Architecture Note

<critical_rules>
**Simplified from workflow to single skill.**

All stories modify ONE skill: `.claude/skills/consume/SKILL.md`

No step-file workflow architecture. No config.yaml. CLI arguments only.
</critical_rules>

## Stories

| # | Story | Priority | Status | Dependencies |
|---|-------|----------|--------|--------------|
| 2.1 | [Convert Text to Audio](./2-1-convert-text-to-audio.md) | P0 | backlog | None |
| 2.2 | [Configure Voice Preferences](./2-2-configure-voice-preferences.md) | P1 | backlog | 2.1 |
| 2.3 | [Chunked Audio for Long Content](./2-3-chunked-audio-long-content.md) | P1 | backlog | 2.1 |

## Dependency Graph

```
2.1 (Consume Skill) ──┬──> 2.2 (Add -v flag)
                      │
                      └──> 2.3 (Add chunked detection)
```

## Implementation Order

### Phase 1: Core TTS
1. **2.1** - Convert Text to Audio (P0)
   - Creates consume skill (single file)
   - Takes slug argument: `/consume {slug}`
   - Invokes tts-openai, updates metadata

### Phase 2: Voice & Chunking
2. **2.2** - Configure Voice Preferences (P1)
   - Adds `-v {voice}` argument to consume skill
   - Defaults to nova

3. **2.3** - Chunked Audio for Long Content (P1)
   - Adds length detection (> 4000 chars)
   - Requires ffmpeg for concatenation

## Final Command Interface

```bash
# Basic usage
/consume my-video-slug

# With voice
/consume my-video-slug -v echo

# Long content (> 4000 chars) auto-uses chunked mode
```

## Technical Notes

All stories modify the consume skill which wraps `tts-openai`:
- Voice selection: `-v` flag passed through
- Chunked mode: `--chunked` flag for long content
- ffmpeg: Required for chunk concatenation

## References

- [Epic Overview](../overview.md)
- [tts-openai SKILL.md](/.claude/skills/tts-openai/SKILL.md)
