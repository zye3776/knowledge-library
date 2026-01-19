---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: complete
completedAt: '2026-01-19'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/project-context.md'
date: 2026-01-19
author: Z
---

# Product Brief: knowledge-library

## Executive Summary

Knowledge Library is a personal knowledge accumulation system that transforms scattered online content into a unified, consumable expertise base. It extracts content from sources like YouTube, removes noise (sponsors, ads, unexplained visual references), and converts it to audio for consumption while walking, commuting, or away from screens.

The core insight: reading is slow, listening is faster — and knowledge should compound, not pass through.

**MVP Focus:** YouTube extraction via yt-dlp, intelligent noise removal, and text-to-speech output.

---

## Core Vision

### Problem Statement

Valuable knowledge is trapped in formats that demand screen time. A 45-minute conference talk, a technical deep-dive, an expert explaining a concept — all require sitting and watching. For someone who discovers content late at night or between commitments, "I'll watch it later" becomes "I'll never watch it."

### Problem Impact

Knowledge doesn't accumulate — it passes through. Watch history becomes a graveyard. Bookmarks collect dust. Insights from a systems thinking video stay isolated from lessons on audio engineering or business strategy. There's no unified base, no cross-pollination, no compounding expertise.

Current tools fail to bridge this gap:
- YouTube watch history: scattered, no substance retained
- Bookmarks: good intentions, zero follow-through
- Notes apps: fragmented, rarely revisited
- Memory alone: limited and lossy

### Why Existing Solutions Fall Short

Knowledge management tools like Readwise, Notion, or Obsidian optimize for *capture* and *organization* — but consumption still requires screen time. Podcast apps deliver audio but offer no control over source material. Speed-watching helps but still chains you to a screen.

None of these solve the fundamental friction: transforming visual/text content into audio you control, cleaned of noise, accumulated in one place.

### Proposed Solution

A three-phase pipeline: **Extract → Rephrase → Consume.**

1. **Extract:** Pull content from online sources (YouTube transcripts via yt-dlp)
2. **Rephrase:** Remove noise — sponsors, ads, unexplained visual references ("as you can see here...") — while preserving technical terminology
3. **Consume:** Convert to high-quality TTS audio for screen-free learning

All content flows into a personal knowledge library — organized, searchable, and growing over time.

### Key Differentiators

| Differentiator | Value |
|----------------|-------|
| **Audio-first consumption** | Learn while walking, commuting, exercising — no screen required |
| **Intelligent noise removal** | Pure signal, no sponsor breaks or broken visual references |
| **Source flexibility** | YouTube now, expandable to blogs, docs, papers |
| **Unified knowledge base** | Content compounds across fields instead of fragmenting across tools |
| **Personal control** | Your library, your rules, your pace |

---

## Target Users

### Primary User

**Z — The Cross-Domain Knowledge Collector**

A knowledge-hungry generalist who discovers valuable content faster than they can consume it. Finds conference talks, technical deep-dives, and expert explanations across multiple fields — systems thinking, audio engineering, business strategy, and beyond. The goal isn't passive entertainment; it's building lasting expertise that compounds.

**Context:**
- Discovers content late at night or between commitments
- Prefers learning while moving (walks, commutes) over screen time
- Values signal over noise — no patience for sponsors, ads, or "as you can see here"
- Wants knowledge to accumulate, not evaporate

**Pain Points:**
- "I'll watch it later" becomes "I'll never watch it"
- Bookmarks and watch history are graveyards
- Knowledge stays fragmented across tools and memory
- Screen time is limited; walking time is abundant

### Usage Modes

| Mode | Context | Goal |
|------|---------|------|
| **Discovery** | Late night, browsing | Find valuable content, queue for processing |
| **Consumption** | Morning walk, commute | Listen to cleaned audio, absorb knowledge |
| **Reference** | Anytime | Revisit past content, find specific insights |

### User Journey

**Discovery → Process → Consume → Accumulate**

1. **Discovery:** Z finds a 45-minute YouTube video on a topic of interest. No time to watch now.
2. **Extract:** Pastes URL into knowledge-library. System pulls transcript via yt-dlp.
3. **Rephrase:** System strips sponsors, ads, and broken visual references. Pure content remains.
4. **Consume:** Next morning, Z listens during a walk. 45 minutes becomes 20 minutes of focused learning.
5. **Accumulate:** Content saved to personal library. Another piece of cross-domain expertise captured.

**Success Moment:** Finishing a walk having absorbed an entire conference talk — without sitting at a screen.

---

## Success Metrics

### Philosophy

No vanity metrics. No dashboards. The only question: **Does it work for me?**

### Personal Utility Signals

| Signal | Indicator |
|--------|-----------|
| **It works** | URL in → audio out, reliably |
| **It's used** | Part of the routine, not collecting dust |
| **Knowledge compounds** | Library grows, past content is findable |
| **Time is saved** | Consuming content that would otherwise be skipped |

### Timeframe Milestones

| Milestone | Definition |
|-----------|------------|
| **3 months** | Covers all personal usage needs |
| **12 months** | Ready to share publicly (if desired) |

### Anti-Metrics

- No tracking user counts, engagement rates, or retention curves
- No A/B testing or conversion funnels
- No success defined by external validation

**Success is simple:** The tool fits into life and knowledge accumulates.

---

## MVP Scope

### Core Features

| Feature | Description |
|---------|-------------|
| **Extract** | Accept YouTube URL, pull transcript via yt-dlp |
| **Rephrase** | Remove noise — sponsors, ads, unexplained visual references |
| **Consume** | Convert cleaned text to TTS audio via OpenAI API |
| **Store** | Save to personal knowledge library (markdown + audio) |

**MVP Boundary:** YouTube in → TTS out. Nothing more.

### Out of Scope for MVP

| Feature | Rationale |
|---------|-----------|
| Additional sources (Medium, docs, papers) | YouTube covers 90% of use case |
| Custom rephrase rules per source | Default rules sufficient for personal use |
| Summarization options | Verbatim-first; condensation adds complexity |
| Preference learning | Manual workflow fine for MVP; automate later |
| Batch processing | One URL at a time is acceptable |
| Shell completion | Defer CLI polish to post-MVP |

### Future Vision

**Post-MVP Enhancements:**
- Source expansion: blogs, API docs, research papers
- Per-source rephrase customization
- Summarization modes (verbatim vs. condensed)
- Preference learning (system adapts over time)

**Long-term Vision:**
- Library of pre-built workflows for common sources
- Public release with easy installation
- Extensible architecture others can build on

**If wildly successful:** A new model for knowledge sharing — moving beyond scattered content toward structured, consumable knowledge flows.
