# Epic 2: Audio Consumption - Stories

## Stories

| # | Story | Priority | Status | Dependencies |
|---|-------|----------|--------|--------------|
| 2.1 | [Convert Text to Audio](./2-1-convert-text-to-audio.md) | P0 | backlog | None |
| 2.2 | [Configure Voice Preferences](./2-2-configure-voice-preferences.md) | P1 | backlog | 2.1 |
| 2.3 | [Chunked Audio for Long Content](./2-3-chunked-audio-long-content.md) | P1 | backlog | 2.1 |

## Dependency Graph

```
2.1 (Convert) ──┬──> 2.2 (Voice Config)
                │
                └──> 2.3 (Chunked)
```

## Implementation Order

### Phase 1: Core TTS
1. **2.1** - Convert Text to Audio (P0)

### Phase 2: Configuration & Long Content
2. **2.2** - Configure Voice Preferences (P1)
3. **2.3** - Chunked Audio for Long Content (P1)

## References

- [Epic Overview](../overview.md)
