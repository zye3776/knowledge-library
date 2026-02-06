# Story 4.2: Access Content Library

Status: done

## Story

As a **knowledge library user**,
I want to browse and access my previously processed content,
So that I can reference past extractions or re-listen to generated audio.

## Background

As users process more content, the knowledge library grows. This story enables users to navigate their library, view content details, and access outputs from previous pipeline runs. The library serves as both reference material and a queue of content ready for consumption.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given content exists in the library, when user browses, then they see a list of items sorted by date descending (newest first) with title and status
2. **AC2:** Given a library item, when user selects it, then they see full metadata (source URL, stage timestamps, processing status)
3. **AC3:** Given a library item with audio, when user requests playback info, then the audio file path is printed to the terminal
4. **AC4:** Given a library item, when user wants to view content, then the file path (transcript.md or refined.md) is printed to the terminal for the user to open with their preferred tool
5. **AC5:** Given an empty library, when user browses, then they see a friendly message with instructions to add content
6. **AC6:** Given a library item with missing files (e.g., refined.md doesn't exist), when displaying available outputs, then only existing files are listed
</acceptance_criteria>

## Tasks

- [x] **Task 1: Library listing** (AC: 1, 5)
  - [x] 1.1 Scan libraries/ directory for content folders
  - [x] 1.2 Read metadata.yaml from each folder
  - [x] 1.3 Sort by newest first (use most recent stage timestamp)
  - [x] 1.4 Display formatted list with title, status, and date
  - [x] 1.5 Handle empty library gracefully

- [x] **Task 2: Item details and content access** (AC: 2, 3, 4, 6)
  - [x] 2.1 Display full metadata for selected item
  - [x] 2.2 Show processing history (stage timestamps)
  - [x] 2.3 Check which files exist before listing outputs
  - [x] 2.4 Print file paths to terminal when user selects an output

## Technical Notes

<technical_notes>
**Library List Display:**
```
=== Knowledge Library ===
| # | Title                              | Status   | Date       |
|---|-----------------------------------|----------|------------|
| 1 | Understanding Async JavaScript     | refined  | 2026-01-15 |
| 2 | Redis Internals Deep Dive         | audio    | 2026-01-14 |
| 3 | TypeScript Best Practices         | extract  | 2026-01-16 |

[#] Select item | [N] New extraction | [X] Exit
```

**Item Details View:**
```
=== Understanding Async JavaScript ===
Source: https://youtube.com/watch?v=abc123
Extracted: 2026-01-15 10:30:00
Refined: 2026-01-15 10:32:00
Audio: 2026-01-15 10:45:00

Files:
- transcript.md (4,523 words)
- refined.md (3,891 words)
- audio.mp3 (18:23)

[T] View transcript | [R] View refined | [A] Audio path | [B] Back
```

**Library Location:**
```
libraries/
├── understanding-async-javascript/
│   ├── metadata.yaml
│   ├── transcript.md
│   ├── refined.md
│   └── audio.mp3
└── redis-internals-deep-dive/
    └── ...
```

**Status Values:**
- `extracted` - Transcript available
- `refined` - Cleaned content available
- `audio` - Full pipeline complete

**Sorting:**
Items sorted by date descending (newest first). Date is determined by the most recent stage timestamp.

**File Existence:**
Check for file existence before displaying options. A status of "refined" doesn't guarantee refined.md exists (could be corrupted/deleted).

**Pagination (Deferred):**
For MVP, display all items. If library grows beyond 20 items, pagination may be needed — tracked as future enhancement.
</technical_notes>

## Verification

<verification>
```bash
# AC1 Verification - Library listing works
# Manual: Run library browse command
# Expected: All items listed with status

# AC2 Verification - Details shown
# Manual: Select an item from library list
# Expected: Full metadata displayed

# AC3 Verification - Audio path shown
# Manual: Select item with audio, request audio info
# Expected: File path displayed

# AC4 Verification - Content accessible
# Manual: Select item, choose to view transcript or refined
# Expected: File path provided or content displayed

# AC5 Verification - Empty library handled
rm -rf libraries/* && # run browse command
# Expected: Friendly "No content yet" message
```
</verification>

## Dependencies

- Requires library folder structure from Epic 1
- Requires metadata.yaml format established

## Technical Implementation Notes

<technical_implementation_notes>
**Implemented:** 2026-02-06

**Architecture:** `.claude/skills/library/SKILL.md` - instruction skill for browsing and accessing library items.

**Key Decisions:**
- Scans libraries/ directory, reads metadata.yaml per item
- Status derived from file existence: audio > refined > extracted
- Sorted by most recent timestamp (newest first)
- Item details show available files with actions
- Empty library shows getting-started instructions
- File paths printed for user access (transcript, refined, audio)

**KISS Compliance:** Single skill file, table display, no pagination
**Files Created:** `.claude/skills/library/SKILL.md`
</technical_implementation_notes>

## References

- [Epic Overview](../overview.md)
- [PRD FR16](/_bmad-output/planning-artifacts/prd.md)
