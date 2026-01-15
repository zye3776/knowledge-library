---
stepsCompleted: [1, 2, 3, 4, 7, 8, 9, 10, 11]
inputDocuments:
  - '_bmad-output/analysis/brainstorming-session-2026-01-09.md'
workflowType: 'prd'
lastStep: 0
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 1
  projectDocs: 0
---

# Product Requirements Document - knowledge-library

**Author:** Z
**Date:** 2026-01-13

## Executive Summary

The Knowledge Library System is a modular architecture for collecting, transforming, and consuming content from multiple online sources - videos, blogs, research papers, and documentation. At its core is a central knowledge library served by a three-phase pipeline: **Extract → Rephrase → Consume**.

The system addresses a fundamental friction: reading is slow, listening is faster. Content scattered across platforms arrives in inconsistent formats riddled with noise - ads, sponsors, unexplained visual references. The Knowledge Library transforms this chaos into clean, consumable knowledge optimized for audio learning.

**MVP Focus:** YouTube extraction via yt-dlp, intelligent noise removal, and text-to-speech consumption - covering 90% of the primary use case.

### What Makes This Special

**Sensible Defaults, Endless Customization**
The system provides ready-to-use workflows for gathering knowledge from various sources, while allowing deep customization to fit individual needs. Default behaviors work out of the box; power users can override per source type.

**Flat Learning Curve, Infinite Ceiling**
Intuitive UX ensures immediate productivity with zero configuration. Yet the architecture supports endless expansion - new extraction sources, custom rephrase rules, additional consumption formats.

**A New Model for Knowledge Sharing**
If wildly successful, this changes how people share content on the web - moving beyond traditional blog posts and articles scattered across platforms toward structured, consumable knowledge flows.

## Project Classification

**Technical Type:** cli_tool
**Domain:** general
**Complexity:** low
**Project Context:** Greenfield - new project

This is a CLI-based skill system with isolated execution contexts. Skills run in forked processes to keep the main conversation clean. Local file storage handles user preferences and output. No regulated domain constraints apply - standard security and UX-focused development practices.

## Success Criteria

### User Success

- **Time Saved:** Consume content faster than the original format allows (e.g., 30-min video consumed in 10 minutes of focused listening)
- **Knowledge Accumulation:** Build personal knowledge libraries in areas of expertise over time
- **Future Reference:** Easily find and revisit previously processed content
- **Sharing:** Eventually share curated knowledge with others

### Business Success

This is a personal productivity tool first. Success is measured by personal utility, not metrics.

- **3 months:** Covers all personal usage needs
- **12 months:** Ready to share publicly

No vanity metrics. The question is simply: "Does it work for me?"

### Technical Success

- **Reliability:** Should work consistently without constant tinkering
- **Extensibility:** Adding new sources and skills should be straightforward
- **Simplicity:** Flat learning curve for personal use, depth available when needed

### Measurable Outcomes

- Personal content consumption workflow is faster than before
- Knowledge library grows organically with use
- System adapts to preferences over time (interactive → automated)

## Product Scope

### MVP - Minimum Viable Product

- YouTube video extraction (via yt-dlp)
- Noise removal (ads, sponsors, unexplained visual references)
- Text-to-speech consumption

**That's it.** YouTube in → TTS out.

### Growth Features (Post-MVP)

- Additional content sources (Medium blogs, API docs, research papers)
- Custom rephrase rules per source type
- Summarization options (raw verbatim vs condensed)
- Preference learning (system learns and automates over time)

### Vision (Future)

- Library of pre-built workflows for common sources and use cases
- Public release with easy installation
- Extensible architecture others can build on

## User Journeys

### Journey 1: Z - Night Discovery to Morning Learning

Z discovers an interesting YouTube video late at night - maybe a technical deep-dive, a conference talk, or an expert explaining a concept he wants to learn. It's 45 minutes long. No time to watch now, and honestly, watching would mean sitting at a screen. Not ideal.

He pastes the URL into knowledge-library. The system extracts the transcript via yt-dlp, strips out sponsor segments, removes references to visuals that aren't explained ("as you can see here..."), and produces clean, content-faithful text. He queues it for TTS.

The next morning, Z heads out for his walk. Earbuds in, he listens to the processed content - now condensed to the actual substance. The 45-minute video becomes 20 minutes of focused learning. No ads, no fluff, no unexplained visual references breaking the flow.

By the time he's home, he's absorbed the content. It's saved to his knowledge library for future reference. Another piece of expertise accumulated without sacrificing time at a screen.

### Journey Requirements Summary

**Capabilities revealed by this journey:**

| Capability | Description |
|------------|-------------|
| URL Input | Accept YouTube video URL as input |
| Extraction | Pull transcript/subtitles via yt-dlp |
| Noise Removal | Strip sponsors, ads, unexplained visual references |
| TTS Generation | Convert cleaned text to audio |
| Async Processing | Extract now, consume later workflow |
| Storage | Save processed content to knowledge library for future reference |

## CLI Tool Specific Requirements

### Project-Type Overview

Knowledge-library is an interactive CLI tool for extracting, processing, and consuming content from online sources. It prioritizes guided user experience over scriptable automation for MVP.

### Command Structure

**Interactive Mode:**
- User initiates with a simple command (e.g., `knowledge-library` or `kl`)
- Guided prompts walk through: URL input → extraction → processing options → output
- No complex flags or arguments required for basic use
- Future: scriptable mode for automation and piping

**Core Commands (MVP):**
- Extract: Accept YouTube URL, pull transcript via yt-dlp
- Process: Clean noise (sponsors, unexplained visuals)
- Consume: Generate TTS audio output

### Output Formats

| Format | Purpose | Location |
|--------|---------|----------|
| Audio (MP3/etc.) | TTS consumption | Project folder / output directory |
| Markdown | Knowledge library storage & future reference | Project folder / library directory |

### Configuration Schema

**Config File Location:** Project folder (self-contained)

**Config Format:** YAML or similar human-readable format

**Configurable Options (MVP):**
- TTS engine/voice preferences
- Output directories
- Default processing rules (what to strip)

**Future Config Options:**
- Source-specific workflow overrides
- Preference learning persistence
- Custom rephrase rules

### Implementation Considerations

- **No shell completion for MVP** - defer to post-MVP
- **Interactive-first** - optimize for guided experience
- **Self-contained** - all config and output in project folder
- **Extensible structure** - design for future scriptable mode without rewrite

## Functional Requirements

### Content Extraction

- FR1: User can provide a YouTube video URL as input
- FR2: System can extract transcript/subtitles from YouTube videos via yt-dlp
- FR3: System can detect when a video has no available subtitles and notify user
- FR4: System can preserve video metadata (title, source URL) with extracted content

### Content Processing

- FR5: System can identify and remove sponsor segments from transcripts
- FR6: System can identify and remove unexplained visual references ("as you can see...")
- FR7: System can identify and remove ad content from transcripts
- FR8: System can preserve all technical terminology and jargon intact
- FR9: User can review processed content before consumption

### Content Consumption

- FR10: System can convert processed text to audio via TTS engine
- FR11: User can configure TTS voice preferences
- FR12: System can output audio in standard format (MP3 or similar)
- FR13: User can listen to generated audio on external devices/apps

### Knowledge Library Management

- FR14: System can save processed content as Markdown files
- FR15: System can organize content in a project folder structure
- FR16: User can access previously processed content for reference
- FR17: System can store content metadata for future retrieval

### Configuration & Preferences

- FR18: System can read configuration from a project folder config file
- FR19: User can configure output directories
- FR20: User can configure default processing rules
- FR21: System can initialize a new project with default configuration

### User Interaction

- FR22: User can initiate the tool with a simple command
- FR23: System can guide user through extraction workflow via interactive prompts
- FR24: System can display processing status and completion notifications

## Non-Functional Requirements

### Reliability

- NFR1: System provides clear error messages when extraction fails (network, no subtitles, invalid URL)
- NFR2: Error messages include suggested actions for resolution
- NFR3: Partial failures do not corrupt existing knowledge library content
- NFR4: System fails gracefully without requiring manual cleanup

### Integration

- NFR5: System integrates with yt-dlp for YouTube transcript extraction
- NFR6: System integrates with OpenAI TTS API for audio generation
- NFR7: Integration failures are reported clearly with actionable guidance
- NFR8: No version constraints on yt-dlp - use whatever is installed

### Simplicity

- NFR9: Implementation prioritizes simplicity over edge case handling
- NFR10: No automatic retry logic - user initiates retries manually
- NFR11: Minimal dependencies beyond core integrations (yt-dlp, OpenAI)

