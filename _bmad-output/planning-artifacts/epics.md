---
stepsCompleted: [1]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
---

# knowledge-library - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for knowledge-library, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Content Extraction:**
- FR1: User can provide a YouTube video URL as input
- FR2: System can extract transcript/subtitles from YouTube videos via yt-dlp
- FR3: System can detect when a video has no available subtitles and notify user
- FR4: System can preserve video metadata (title, source URL) with extracted content

**Content Processing:**
- FR5: System can identify and remove sponsor segments from transcripts
- FR6: System can identify and remove unexplained visual references ("as you can see...")
- FR7: System can identify and remove ad content from transcripts
- FR8: System can preserve all technical terminology and jargon intact
- FR9: User can review processed content before consumption

**Content Consumption:**
- FR10: System can convert processed text to audio via TTS engine
- FR11: User can configure TTS voice preferences
- FR12: System can output audio in standard format (MP3 or similar)
- FR13: User can listen to generated audio on external devices/apps

**Knowledge Library Management:**
- FR14: System can save processed content as Markdown files
- FR15: System can organize content in a project folder structure
- FR16: User can access previously processed content for reference
- FR17: System can store content metadata for future retrieval

**Configuration & Preferences:**
- FR18: System can read configuration from a project folder config file
- FR19: User can configure output directories
- FR20: User can configure default processing rules
- FR21: System can initialize a new project with default configuration

**User Interaction:**
- FR22: User can initiate the tool with a simple command
- FR23: System can guide user through extraction workflow via interactive prompts
- FR24: System can display processing status and completion notifications

### NonFunctional Requirements

**Reliability:**
- NFR1: System provides clear error messages when extraction fails (network, no subtitles, invalid URL)
- NFR2: Error messages include suggested actions for resolution
- NFR3: Partial failures do not corrupt existing knowledge library content
- NFR4: System fails gracefully without requiring manual cleanup

**Integration:**
- NFR5: System integrates with yt-dlp for YouTube transcript extraction
- NFR6: System integrates with OpenAI TTS API for audio generation
- NFR7: Integration failures are reported clearly with actionable guidance
- NFR8: No version constraints on yt-dlp - use whatever is installed

**Simplicity:**
- NFR9: Implementation prioritizes simplicity over edge case handling
- NFR10: No automatic retry logic - user initiates retries manually
- NFR11: Minimal dependencies beyond core integrations (yt-dlp, OpenAI)

### Additional Requirements

**From Architecture - Technical Foundation:**
- Module Type: BMAD Module with step-file workflows (Option B selected)
- Architecture Pattern: Hybrid - BMAD workflows for processes + Claude Code skills for utilities
- This is a Claude Code plugin/extension, NOT a standalone CLI tool

**From Architecture - Storage & Structure:**
- Content storage: User-configurable via config.yaml, default `{project_root}/libraries/`
- Naming: Slug-based folders per source (e.g., `libraries/video-title/`)
- Output files per source: `transcript.md`, `refined.md`, `audio.mp3`, `metadata.yaml`
- All YAML keys use snake_case, all folder names use kebab-case

**From Architecture - Workflow Architecture:**
- 4 main workflows: extract, rephrase, consume, orchestrator
- Tri-modal support: Create/Edit/Validate modes for each workflow
- Orchestrator manages full Extract → Rephrase → Consume pipeline
- Step files follow naming: `step-{NN}-{action}.md`
- Tri-modal folders: `steps-c/`, `steps-e/`, `steps-v/`

**From Architecture - Skills Required:**
- `extract-youtube` skill: New skill using yt-dlp via direct CLI (Bash tool)
- `tts-openai` skill: Reuse existing skill for audio generation

**From Architecture - Error Handling:**
- Halt on error with clear message display
- Log errors to `metadata.yaml`
- Present retry/skip/exit options (no automatic retry)
- Inter-stage validation enabled by default with user skip option

**From Architecture - Integration Points:**
- YouTube extraction: yt-dlp via direct CLI in skill
- TTS generation: OpenAI API via existing tts-openai skill
- Authentication: OPENAI_API_KEY environment variable required

### FR Coverage Map

{{requirements_coverage_map}}

## Epic List

{{epics_list}}

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic {{N}}: {{epic_title_N}}

{{epic_goal_N}}

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story {{N}}.{{M}}: {{story_title_N_M}}

As a {{user_type}},
I want {{capability}},
So that {{value_benefit}}.

**Acceptance Criteria:**

<!-- for each AC on this story -->

**Given** {{precondition}}
**When** {{action}}
**Then** {{expected_outcome}}
**And** {{additional_criteria}}

<!-- End story repeat -->
