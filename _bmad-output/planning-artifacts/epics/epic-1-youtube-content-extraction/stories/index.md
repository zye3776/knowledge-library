# Epic 1: YouTube Content Extraction - Stories

## Stories

| # | Story | Priority | Status | Dependencies |
|---|-------|----------|--------|--------------|
| 1.1 | [Extract YouTube Transcript](./1-1-extract-youtube-transcript.md) | P0 | done | None |
| 1.2 | [Save with Metadata](./1-2-save-with-metadata.md) | P0 | ready-for-dev | 1.1 |
| 1.3 | [Interactive Extraction Workflow](./1-3-interactive-extraction-workflow.md) | P0 | ready-for-dev | 1.1, 1.2 |
| 1.4 | [Re-extract Existing Content](./1-4-re-extract-existing-content.md) | P1 | ready-for-dev | 1.3 |
| 1.5 | [Validate Extracted Transcript](./1-5-validate-extracted-transcript.md) | P1 | ready-for-dev | 1.3 |

## Dependency Graph

```
1.1 (Extract) ──┬──> 1.2 (Save) ──> 1.3 (Workflow) ──┬──> 1.4 (Re-extract)
                │                                     │
                └─────────────────────────────────────┴──> 1.5 (Validate)
```

## Implementation Order

### Phase 1: Core Extraction
1. **1.1** - Extract YouTube Transcript (P0)
2. **1.2** - Save with Metadata (P0)

### Phase 2: Workflow Integration
3. **1.3** - Interactive Extraction Workflow (P0)

### Phase 3: Tri-modal Support
4. **1.4** - Re-extract Existing Content (P1)
5. **1.5** - Validate Extracted Transcript (P1)

## References

- [Epic Overview](../overview.md)
