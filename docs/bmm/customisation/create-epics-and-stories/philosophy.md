# Story Writing Philosophy: WHAT not HOW

## Core Principle

Stories describe **WHAT** the user expects to experience, **NOT HOW** the system implements it.

## User-Focused Stories

Stories must be written from the user's perspective with observable outcomes only.

### Allowed Content

- User actions and observable outcomes
- Given/When/Then acceptance criteria
- Measurable verification from user perspective
- Business value and user benefits

### Forbidden Content

Stories must **NEVER** include:

- File paths or folder structures
- Code patterns or examples
- Architecture diagrams or decisions
- Technical implementation details
- Dev Notes or implementation guidance
- Testing strategy details (beyond verification commands)
- Database schemas or data models
- API endpoint specifications
- Framework-specific patterns

## Examples

### Wrong - Technical Focus

```markdown
### Story 1.1: Extract YouTube Transcript

**Tasks:**
- Create `libraries/{slug}/` folder structure
- Use `youtube-transcript-api` to fetch transcript
- Store in `transcript.md` with YAML frontmatter
- Implement error handling for rate limits

**Dev Notes:**
- Use `yt-dlp` as fallback if API fails
- Store metadata in `metadata.yaml`
```

### Correct - User Focus

```markdown
### Story 1.1: Extract YouTube Transcript

As a **content consumer**,
I want to extract the transcript from a YouTube video,
So that I can read the content offline.

**Acceptance Criteria:**

**Given** I have a valid YouTube URL
**When** I request transcript extraction
**Then** the transcript text is saved to my library
**And** video metadata (title, channel, duration) is preserved
```

## Rationale

### Why Separate WHAT from HOW

1. **Developer Autonomy**: Let dev agents choose the best implementation
2. **Flexibility**: Requirements don't lock in specific technologies
3. **Maintainability**: Stories remain valid even if implementation changes
4. **Focus**: Product team focuses on value, dev team focuses on delivery
5. **Testability**: Acceptance criteria are verifiable without knowing internals

### Story vs Tech Spec

| Aspect | Story (WHAT) | Tech Spec (HOW) |
|--------|--------------|-----------------|
| Audience | Product, stakeholders | Developers |
| Content | User outcomes | Implementation details |
| Longevity | Stable | May change with refactoring |
| Validation | User acceptance | Code review, tests |

## Verification Pattern

Acceptance criteria should have verification commands that check **observable outcomes**, not implementation details:

### Wrong

```bash
# Verify file structure
ls -la libraries/my-video/
# Expected: transcript.md, metadata.yaml, refined.md
```

### Correct

```bash
# Verify transcript was extracted
grep -c "." libraries/my-video/transcript.md
# Expected: > 0 (transcript has content)

# Verify metadata preserved
grep "title:" libraries/my-video/metadata.yaml
# Expected: Video title present
```

## Application to Workflow

This philosophy affects all step files:

- **Step 2 (Design Epics)**: Epic goals are user-value focused
- **Step 3 (Create Stories)**: Stories follow WHAT not HOW strictly
- **Step 4 (Validation)**: Validates no implementation details leaked in
