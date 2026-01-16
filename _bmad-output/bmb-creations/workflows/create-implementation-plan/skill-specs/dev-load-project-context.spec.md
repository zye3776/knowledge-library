# Skill Specification: dev-load-project-context

## Overview

| Attribute | Value |
|-----------|-------|
| **Skill Name** | `dev-load-project-context` |
| **Purpose** | Load all required project context documents for implementation plan generation |
| **Context Mode** | Inline (no fork) |
| **Invoked By** | `create-implementation-plan` workflow (Step 05) |
| **Portability** | Must work with both Claude Code and OpenCode |

## Problem Statement

The `create-implementation-plan` workflow needs to load multiple context documents before generating implementation plans. These documents are spread across different locations:
- Planning artifacts (`_bmad-output/planning-artifacts/`)
- Coding standards (`.claude/rules/`)
- Epic-specific docs (`epics/[epic-name]/`)

This skill centralizes context loading, ensuring consistent document discovery and loading across workflow runs.

## Functional Requirements

### FR-1: Document Discovery
The skill MUST locate and validate the existence of:
1. `_bmad-output/planning-artifacts/architecture.md` (REQUIRED)
2. `_bmad-output/planning-artifacts/prd.md` (REQUIRED)
3. `.claude/rules/coding-standards/` or similar (REQUIRED - may be single file or folder)
4. `docs/guides-agents` (REQUIRED)
5. `_bmad-output/planning-artifacts/epics/[epic-name]/overview.md` (OPTIONAL)
6. `_bmad-output/planning-artifacts/epics/[epic-name]/stories/[story-id].md` (REQUIRED)
7. `_bmad-output/planning-artifacts/epics/[epic-name]/sprint-status.yaml` (OPTIONAL)

### FR-2: Context Extraction
The skill MUST extract and return:
- **Architecture decisions** - Key technical choices, patterns, constraints
- **PRD context** - Product requirements, user goals, success metrics
- **Coding standards** - Style rules, patterns to follow, anti-patterns to avoid
- **Epic context** - Epic goal, scope, related stories
- **Story details** - Full story content, acceptance criteria, dependencies
- **Development principles** - Development guidelines

### FR-3: Context Summarization
For large documents, the skill SHOULD:
- Extract key sections relevant to implementation planning
- Summarize lengthy prose into actionable points
- Preserve exact technical specifications (don't summarize code examples)

### FR-4: Error Handling
- FAIL FAST if REQUIRED documents are missing
- WARN but continue if OPTIONAL documents are missing
- Return clear error messages with file paths

---

## Input Specification

### Input Parameters

```yaml
epic_name: string          # Required - Epic folder name (e.g., "epic-1-youtube-content-extraction")
story_id: string           # Required - Story ID (e.g., "1-1" or "1-1-extract-youtube-transcript")
output_folder: string      # Required - Base output folder (e.g., "_bmad-output")
options:
  include_related_stories: boolean  # Optional - Load sibling stories for context (default: false)
  summarize_large_docs: boolean     # Optional - Summarize docs > 500 lines (default: true)
  max_context_tokens: number        # Optional - Limit total context size (default: 50000)
```

### Input Example

```yaml
epic_name: "epic-1-youtube-content-extraction"
story_id: "1-1-extract-youtube-transcript"
output_folder: "_bmad-output"
options:
  include_related_stories: false
  summarize_large_docs: true
```

---

## Output Specification

### Output Structure

```yaml
success: boolean
error: string | null           # Error message if success=false

context:
  architecture:
    full_content: string       # Complete architecture.md content
    key_decisions: string[]    # Extracted key decisions
    tech_stack: string[]       # Technologies mentioned
    constraints: string[]      # Technical constraints

  prd:
    full_content: string       # Complete prd.md content
    product_goals: string[]    # Main product goals
    user_requirements: string[] # User-facing requirements
    success_metrics: string[]  # How success is measured

  coding_standards:
    full_content: string       # Combined coding standards
    patterns_to_use: string[]  # Recommended patterns
    anti_patterns: string[]    # What to avoid
    style_rules: string[]      # Formatting/style requirements

  epic:
    name: string               # Epic name
    overview: string | null    # Overview content (if exists)
    goal: string               # Epic goal
    scope: string[]            # What's in/out of scope
    stories_count: number      # Total stories in epic

  story:
    id: string                 # Story ID
    name: string               # Story name
    full_content: string       # Complete story file content
    description: string        # Story description
    acceptance_criteria: string[] # List of AC
    dependencies: string[]     # Story dependencies
    technical_notes: string | null # Any existing tech notes

  related_stories: []          # Sibling stories (if include_related_stories=true)
    - id: string
      name: string
      summary: string          # Brief summary only

  kiss_principles: string | null  # KISS guidelines if found

metadata:
  loaded_at: string            # ISO timestamp
  documents_loaded: string[]   # List of files successfully loaded
  documents_missing: string[]  # List of optional files not found
  total_tokens_estimate: number # Approximate token count
```

### Output Example (Success)

```yaml
success: true
error: null

context:
  architecture:
    full_content: "# Architecture\n\n## Overview\nThis system..."
    key_decisions:
      - "Use Bun runtime for all TypeScript skills"
      - "Store transcripts as markdown files"
      - "Use OpenAI TTS API for audio generation"
    tech_stack:
      - "TypeScript"
      - "Bun"
      - "OpenAI API"
    constraints:
      - "No Python for new skills"
      - "Must work offline after initial download"

  prd:
    full_content: "# Product Requirements\n\n## Vision..."
    product_goals:
      - "Extract YouTube transcripts for audio conversion"
      - "Clean transcripts by removing ads/sponsors"
    user_requirements:
      - "User can input YouTube URL"
      - "User receives clean audio file"
    success_metrics:
      - "90% of transcripts successfully extracted"
      - "Audio generation under 2 minutes"

  coding_standards:
    full_content: "# Coding Standards\n\n## TypeScript..."
    patterns_to_use:
      - "TDD - write tests first"
      - "Functional composition over classes"
    anti_patterns:
      - "No any types"
      - "No console.log in production code"
    style_rules:
      - "2-space indentation"
      - "Single quotes for strings"

  epic:
    name: "epic-1-youtube-content-extraction"
    overview: "This epic covers extracting content from YouTube..."
    goal: "Enable users to extract and process YouTube transcripts"
    scope:
      - "IN: Transcript extraction"
      - "IN: Basic cleaning"
      - "OUT: Video download"
    stories_count: 5

  story:
    id: "1-1"
    name: "extract-youtube-transcript"
    full_content: "# Story 1-1: Extract YouTube Transcript\n\n## Description..."
    description: "As a user, I want to extract the transcript from a YouTube video URL"
    acceptance_criteria:
      - "Given a valid YouTube URL, transcript is extracted"
      - "Given an invalid URL, clear error message is shown"
      - "Transcript preserves timestamps"
    dependencies: []
    technical_notes: null

  related_stories: []

  kiss_principles: "Keep implementations simple. Avoid premature optimization..."

metadata:
  loaded_at: "2026-01-16T10:30:00Z"
  documents_loaded:
    - "_bmad-output/planning-artifacts/architecture.md"
    - "_bmad-output/planning-artifacts/prd.md"
    - ".claude/rules/coding-standards.md"
    - "_bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction/overview.md"
    - "_bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction/stories/1-1-extract-youtube-transcript.md"
  documents_missing:
    - "_bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction/sprint-status.yaml"
  total_tokens_estimate: 12500
```

### Output Example (Failure)

```yaml
success: false
error: "Required document not found: _bmad-output/planning-artifacts/architecture.md"

context: null
metadata:
  loaded_at: "2026-01-16T10:30:00Z"
  documents_loaded: []
  documents_missing:
    - "_bmad-output/planning-artifacts/architecture.md"
  total_tokens_estimate: 0
```

---

## Integration Points

### Workflow Integration

```
Step 05 (Process Stories)
    │
    ├── FOR EACH story:
    │   │
    │   ├── 1. INVOKE dev-load-project-context
    │   │       Input: epic_name, story_id, output_folder
    │   │       Output: context object
    │   │
    │   ├── 2. IF success=false: Log error, mark story failed, continue
    │   │
    │   ├── 3. Use context for plan generation
    │   │       - Pass context.architecture to template
    │   │       - Pass context.story to template
    │   │       - etc.
    │   │
    │   └── 4. Context available for OpenCode + Party Mode reviews
```

### Skill Invocation (Claude Code)

```markdown
/dev-load-project-context epic="epic-1-youtube-content-extraction" story="1-1"
```

### Skill Invocation (OpenCode)

```bash
# Via MCP or direct skill call
dev-load-project-context --epic "epic-1-youtube-content-extraction" --story "1-1"
```

---

## Implementation Notes

### Document Location Strategy

```
1. Architecture: {output_folder}/planning-artifacts/architecture.md
2. PRD: {output_folder}/planning-artifacts/prd.md
3. Coding Standards: Try in order:
   - .claude/rules/coding-standards.md
   - .claude/rules/coding-standards/index.md
   - .claude/rules/coding-standards/*.md (combine all)
4. Epic Overview: {output_folder}/planning-artifacts/epics/{epic_name}/overview.md
5. Story: {output_folder}/planning-artifacts/epics/{epic_name}/stories/{story_id}*.md
   - Match by ID prefix (e.g., "1-1" matches "1-1-extract-youtube-transcript.md")
6. Sprint Status: {output_folder}/planning-artifacts/epics/{epic_name}/sprint-status.yaml
7. KISS Principles: .claude/rules/kiss-development.md OR embedded in coding-standards
```

### Key Decision Extraction

For `architecture.key_decisions`, extract content from:
- Sections titled "Decisions", "Key Decisions", "Technical Decisions"
- Bullet points starting with "Decision:", "Chose:", "Selected:"
- ADR (Architecture Decision Record) sections

### Summarization Rules

When `summarize_large_docs=true` and document > 500 lines:
1. Keep all headers
2. Keep all code blocks
3. Keep all bullet points under "Requirements", "Constraints", "Decisions"
4. Summarize prose paragraphs to 2-3 sentences
5. Never summarize acceptance criteria

---

## Testing Requirements

### Test Cases

| ID | Test Case | Input | Expected Output |
|----|-----------|-------|-----------------|
| TC-01 | All docs present | Valid epic/story | success=true, all context populated |
| TC-02 | Missing architecture | Valid epic/story | success=false, error mentions architecture.md |
| TC-03 | Missing PRD | Valid epic/story | success=false, error mentions prd.md |
| TC-04 | Missing optional overview | Valid epic/story | success=true, epic.overview=null |
| TC-05 | Invalid epic name | Non-existent epic | success=false, error mentions epic folder |
| TC-06 | Invalid story ID | Non-existent story | success=false, error mentions story file |
| TC-07 | Large architecture file | 1000+ line arch.md | success=true, summarized content |
| TC-08 | Story ID prefix match | "1-1" for "1-1-extract-youtube-transcript.md" | success=true, story loaded |

### Test Data Location

```
_bmad-output/bmb-creations/workflows/create-implementation-plan/skill-specs/test-data/
├── valid-project/           # Complete project for happy path
├── missing-architecture/    # Project without architecture.md
├── missing-prd/             # Project without prd.md
├── large-docs/              # Project with very large files
└── minimal-project/         # Just required files, no optionals
```

---

## Constraints

<constraints>
- MUST NOT modify any source documents
- MUST NOT cache results between invocations (always fresh load)
- MUST return within 10 seconds for typical project size
- MUST handle UTF-8 encoded files
- MUST preserve markdown formatting in content fields
- MUST NOT include node_modules or other ignored paths in searches
- SHOULD NOT exceed max_context_tokens (truncate with warning if needed)
</constraints>

---

## Success Criteria

1. ✓ All required documents loaded or clear error returned
2. ✓ Context structure matches output specification exactly
3. ✓ Key decisions/patterns correctly extracted from architecture
4. ✓ Story acceptance criteria preserved verbatim
5. ✓ Works with both Claude Code and OpenCode
6. ✓ Handles missing optional files gracefully
7. ✓ Token estimate within 10% of actual count
