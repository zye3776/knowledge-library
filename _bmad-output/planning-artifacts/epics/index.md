---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture/index.md'
generated: 2026-01-16
project: knowledge-library
---

# knowledge-library - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for knowledge-library, decomposing the requirements from the PRD and Architecture into implementable stories.

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

### Non-Functional Requirements

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
- Orchestrator manages full Extract -> Rephrase -> Consume pipeline
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

---

## Epic List

### Epic 1: YouTube Content Extraction
Users can extract transcripts from YouTube videos and save them to their knowledge library.
**FRs covered:** FR1, FR2, FR3, FR4, FR14, FR15, FR17, FR23, FR24

### Epic 2: Audio Consumption
Users can convert extracted content to audio (TTS) for listening on walks, commutes, etc.
**FRs covered:** FR10, FR11, FR12, FR13

### Epic 3: Content Refinement
Users can clean transcripts by removing sponsors, ads, and unexplained visual references while preserving technical content.
**FRs covered:** FR5, FR6, FR7, FR8, FR9

### Epic 4: Pipeline Orchestration
Users can run the complete Extract -> Rephrase -> Consume pipeline in a single session with validation checkpoints.
**FRs covered:** FR16

### Epic 5: Module Foundation & Configuration
Users can install the knowledge-library as a distributable BMAD module with full configuration options.
**FRs covered:** FR18, FR19, FR20, FR21, FR22

---

## FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | YouTube URL input |
| FR2 | Epic 1 | yt-dlp extraction |
| FR3 | Epic 1 | Subtitle detection |
| FR4 | Epic 1 | Metadata preservation |
| FR5 | Epic 3 | Sponsor removal |
| FR6 | Epic 3 | Visual reference removal |
| FR7 | Epic 3 | Ad removal |
| FR8 | Epic 3 | Terminology preservation |
| FR9 | Epic 3 | Review capability |
| FR10 | Epic 2 | TTS conversion |
| FR11 | Epic 2 | Voice preferences |
| FR12 | Epic 2 | MP3 output |
| FR13 | Epic 2 | External playback |
| FR14 | Epic 1 | Markdown storage |
| FR15 | Epic 1 | Folder organization |
| FR16 | Epic 4 | Content retrieval |
| FR17 | Epic 1 | Metadata storage |
| FR18 | Epic 5 | Config file reading |
| FR19 | Epic 5 | Output directories |
| FR20 | Epic 5 | Processing rules config |
| FR21 | Epic 5 | Project initialization |
| FR22 | Epic 5 | Simple command initiation |
| FR23 | Epic 1 | Interactive prompts |
| FR24 | Epic 1 | Status notifications |

---

## Epic Folders

| Epic | Folder | Status |
|------|--------|--------|
| Epic 1 | [epic-1-youtube-content-extraction](./epic-1-youtube-content-extraction/) | backlog |
| Epic 2 | [epic-2-audio-consumption](./epic-2-audio-consumption/) | backlog |
| Epic 3 | [epic-3-content-refinement](./epic-3-content-refinement/) | backlog |
| Epic 4 | [epic-4-pipeline-orchestration](./epic-4-pipeline-orchestration/) | backlog |
| Epic 5 | [epic-5-module-foundation](./epic-5-module-foundation/) | backlog |
