---
name: doc-digest
description: Extract and read document content aloud via text-to-speech. Use when user provides a file path with an option number (1-5) to hear summaries, key points, action items, risks, or decisions from any document type (code, reports, essays, contracts, technical docs).
---

# Doc Digest

Extract content from documents and convert to speech-friendly text for audio playback.

## Input Format

```
<file_path> <option> [verbose]
```

Examples: `/docs/plan.md 1` or `/docs/contract.pdf 2 verbose`

## Options

| #   | Option           | Description                           |
| --- | ---------------- | ------------------------------------- |
| 1   | Summary          | High-level overview                   |
| 2   | Key Points       | Main takeaways                        |
| 3   | Action Items     | Tasks, deadlines, responsibilities    |
| 4   | Risks & Concerns | Issues, warnings, caveats             |
| 5   | Decisions        | Conclusions, choices, recommendations |

## Length Constraint

- Default: Under 2 minutes (~300 words)
- With `verbose`: Up to 5 minutes (~750 words)

## Voice-Friendly Conversion

Convert non-speech-friendly content:

| Source       | Conversion                                                              |
| ------------ | ----------------------------------------------------------------------- |
| Tables       | Describe as relationships: "John is project lead, starting March 1st"   |
| Code         | Plain language: "If status is error, the system stops and reports"      |
| Diagrams     | Describe flow: "Process begins, runs through validation, then branches" |
| Bullet lists | Natural sentences: "The main items are A, B, and C"                     |
| URLs/Paths   | Simplify or omit: "the authentication endpoint"                         |
| Numbers      | Round for speech: "about 95 percent"                                    |
| Acronyms     | Expand on first use if uncommon                                         |

## Workflow

1. Read document at given path
2. Extract content per selected option
3. Convert to voice-friendly format
4. Save to `/tmp/digest.txt`
5. Invoke the `tts` skill: `tts: { file: /tmp/digest.txt }`

## Output Example

For input `/docs/execution-plan.md 2`:

```
Here are the key points from the execution plan.

First, the project launches in three phases over six months. Phase one focuses on core infrastructure, completing by end of April.

Second, the team has four engineers and one designer. John leads backend, Sarah handles frontend.

Third, the main dependency is payment provider API integration, required before phase two.

Finally, the budget is fifty thousand dollars with a ten percent contingency.
```
