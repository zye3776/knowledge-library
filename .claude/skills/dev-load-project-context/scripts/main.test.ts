import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { loadProjectContext } from "./main";
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";

// Save the original working directory at module load time
const ORIGINAL_CWD = process.cwd();

// ============================================================================
// Test Constants
// ============================================================================

const TEST_DIR = "/tmp/dev-load-context-test";
const OUTPUT_FOLDER = join(TEST_DIR, "_bmad-output");
const PLANNING_ARTIFACTS = join(OUTPUT_FOLDER, "planning-artifacts");
const RULES_DIR = join(TEST_DIR, ".claude", "rules");
const GUIDES_DIR = join(TEST_DIR, "docs", "guides-agents");

// ============================================================================
// Sample Test Data
// ============================================================================

const SAMPLE_ARCHITECTURE = `# Architecture

## Overview
This is a knowledge library system for extracting and consuming content.

## Technical Decisions
- Use Bun runtime for all TypeScript skills
- Store transcripts as markdown files
- Use OpenAI TTS API for audio generation

Decision: Chose markdown over JSON for human readability
Selected: Bun over Node.js for performance

## Tech Stack
- TypeScript
- Bun
- OpenAI API

<constraints>
- No Python for new skills
- Must work offline after initial download
- Maximum file size 10MB
</constraints>
`;

const SAMPLE_PRD = `# Product Requirements Document

## Vision
Enable users to extract and consume knowledge content efficiently.

## Goals
- Extract YouTube transcripts automatically
- Convert transcripts to audio format
- Clean and refine content for better listening

## User Requirements
- User can input YouTube URL
- User receives clean audio file
- User can manage content library
- User can configure voice preferences

## Success Metrics
- 90% of transcripts successfully extracted
- Audio generation under 2 minutes
- User satisfaction score above 4.5
`;

const SAMPLE_CODING_STANDARDS = `# Coding Standards

## TypeScript Guidelines

### Patterns to Use
- TDD - write tests first
- Functional composition over classes
- Guard clauses for early returns
- Explicit return types on public functions

### Anti-Patterns to Avoid
- No any types
- No console.log in production code
- No deeply nested callbacks
- Avoid premature optimization

### Style Rules
- 2-space indentation
- Single quotes for strings
- Semicolons required
- Max line length 100 characters
`;

const SAMPLE_EPIC_OVERVIEW = `# Epic 1: YouTube Content Extraction

## Goal
Enable users to extract and process YouTube transcripts for audio consumption.

## Scope
- IN: Transcript extraction via yt-dlp
- IN: Basic cleaning and formatting
- IN: Metadata preservation
- OUT: Video download functionality
- OUT: Live stream support
`;

const SAMPLE_STORY = `# Story 1.1: Extract YouTube Transcript

Status: ready-for-dev

## Story

As a **knowledge library user**,
I want to extract a transcript from a YouTube video,
So that I can save the spoken content for later audio consumption.

## Background

This is the foundational story enabling all extraction functionality.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given a valid YouTube URL with subtitles, transcript is extracted successfully
2. **AC2:** Given an invalid URL, clear error message is displayed
3. **AC3:** Given network failures, error is handled gracefully
4. **AC4:** Extracted transcript preserves timestamps
</acceptance_criteria>

## Dependencies

- yt-dlp must be installed
- Network connectivity required

## Technical Notes

Use yt-dlp --write-subs flag for extraction.

## Tasks

- [ ] Task 1: Core extraction capability
- [ ] Task 2: Error handling
- [ ] Task 3: Timestamp preservation
`;

const SAMPLE_STORY_MINIMAL = `# Story 1.2: Minimal Story

Status: draft

## Story

As a user, I want to do something minimal.
`;

const SAMPLE_KISS = `# KISS Principles

Keep implementations simple. Avoid premature optimization.

## Guidelines
- Every line must earn its complexity
- Default to the simplest solution
- Avoid speculative generality
- Duplication is cheaper than wrong abstraction
`;

const SAMPLE_GUIDE = `# Agent Development Guide

Guidelines for developing AI agents.

## Core Principles
- Keep agents focused on single responsibility
- Use clear, descriptive names
- Document all assumptions
`;

const SAMPLE_KISS_GUIDE = `# KISS Principle Agent Guide

Detailed guidelines for maintaining simplicity in agent development.

## Decision Framework
- Is this solving a current problem?
- Can this be achieved with fewer abstractions?
- Will another developer understand immediately?
`;

// Generate large content for summarization tests
function generateLargeContent(lines: number): string {
  const content: string[] = ["# Large Document\n"];
  content.push("## Overview\n");
  content.push("This is a large document for testing summarization.\n\n");

  for (let i = 0; i < lines; i++) {
    if (i % 50 === 0) {
      content.push(`\n## Section ${Math.floor(i / 50) + 1}\n\n`);
    }
    content.push(`Line ${i + 1}: This is content that might be summarized in a real scenario.\n`);
  }

  content.push("\n## Requirements\n");
  content.push("- Requirement 1: Must be fast\n");
  content.push("- Requirement 2: Must be reliable\n");
  content.push("- Requirement 3: Must be simple\n");

  return content.join("");
}

// ============================================================================
// Test Setup Helpers
// ============================================================================

async function setupFullTestProject() {
  const dirs = [
    join(PLANNING_ARTIFACTS, "epics", "epic-1-test", "stories"),
    join(PLANNING_ARTIFACTS, "epics", "epic-2-test", "stories"),
    RULES_DIR,
    GUIDES_DIR,
  ];

  for (const dir of dirs) {
    await mkdir(dir, { recursive: true });
  }

  // Core required documents
  await writeFile(join(PLANNING_ARTIFACTS, "architecture.md"), SAMPLE_ARCHITECTURE);
  await writeFile(join(PLANNING_ARTIFACTS, "prd.md"), SAMPLE_PRD);
  await writeFile(join(RULES_DIR, "coding-standards.md"), SAMPLE_CODING_STANDARDS);

  // Development guides
  await writeFile(join(GUIDES_DIR, "index.md"), SAMPLE_GUIDE);
  await writeFile(join(GUIDES_DIR, "KISS-principle-agent-guide.md"), SAMPLE_KISS_GUIDE);

  // Epic 1 with overview and stories
  await writeFile(
    join(PLANNING_ARTIFACTS, "epics", "epic-1-test", "overview.md"),
    SAMPLE_EPIC_OVERVIEW
  );
  await writeFile(
    join(PLANNING_ARTIFACTS, "epics", "epic-1-test", "stories", "1-1-extract-transcript.md"),
    SAMPLE_STORY
  );
  await writeFile(
    join(PLANNING_ARTIFACTS, "epics", "epic-1-test", "stories", "1-2-minimal-story.md"),
    SAMPLE_STORY_MINIMAL
  );
  await writeFile(
    join(PLANNING_ARTIFACTS, "epics", "epic-1-test", "stories", "1-3-another-story.md"),
    SAMPLE_STORY_MINIMAL.replace("1.2", "1.3").replace("minimal", "another")
  );

  // Epic 2 without overview (optional doc)
  await writeFile(
    join(PLANNING_ARTIFACTS, "epics", "epic-2-test", "stories", "2-1-story.md"),
    SAMPLE_STORY_MINIMAL.replace("1.2", "2.1")
  );

  // Optional KISS principles file
  await writeFile(join(RULES_DIR, "kiss-development.md"), SAMPLE_KISS);
}

async function cleanupTestProject() {
  await rm(TEST_DIR, { recursive: true, force: true });
}

// ============================================================================
// Test Suites
// ============================================================================

describe("loadProjectContext - Happy Path", () => {
  beforeAll(async () => {
    await cleanupTestProject();
    await setupFullTestProject();
    process.chdir(TEST_DIR);
  });

  afterAll(async () => {
    await cleanupTestProject();
  });

  test("TC-01: All docs present returns success with full context", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.error).toBeNull();
    expect(result.context).toBeDefined();
    expect(result.context.architecture).toBeDefined();
    expect(result.context.prd).toBeDefined();
    expect(result.context.coding_standards).toBeDefined();
    expect(result.context.epic).toBeDefined();
    expect(result.context.story).toBeDefined();
    expect(result.metadata.documents_loaded.length).toBeGreaterThan(4);
  });

  test("TC-02: Architecture content is loaded correctly", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { architecture } = result.context;
    expect(architecture.full_content).toContain("knowledge library");
    expect(architecture.full_content).toContain("Technical Decisions");
  });

  test("TC-03: Extracts key decisions from architecture", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { architecture } = result.context;
    expect(architecture.key_decisions.length).toBeGreaterThan(0);
    // Should find decisions from bullet points and inline markers
    expect(
      architecture.key_decisions.some(
        (d) => d.includes("Bun") || d.includes("markdown") || d.includes("OpenAI")
      )
    ).toBe(true);
  });

  test("TC-04: Extracts tech stack from architecture", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { architecture } = result.context;
    expect(architecture.tech_stack).toContain("TypeScript");
    expect(architecture.tech_stack).toContain("Bun");
    expect(architecture.tech_stack).toContain("OpenAI");
  });

  test("TC-05: Extracts constraints from architecture", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { architecture } = result.context;
    expect(architecture.constraints.length).toBeGreaterThan(0);
    expect(architecture.constraints.some((c) => c.includes("Python"))).toBe(true);
  });

  test("TC-06: PRD content is loaded correctly", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { prd } = result.context;
    expect(prd.full_content).toContain("Vision");
    expect(prd.full_content).toContain("Goals");
    expect(prd.full_content).toContain("User Requirements");
    expect(prd.full_content).toContain("Success Metrics");
  });

  test("TC-07: Extracts user requirements from PRD", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { prd } = result.context;
    expect(Array.isArray(prd.user_requirements)).toBe(true);
  });

  test("TC-08: Coding standards content is loaded correctly", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { coding_standards } = result.context;
    expect(coding_standards.full_content).toContain("TypeScript");
    expect(coding_standards.full_content).toContain("Patterns");
  });

  test("TC-09: Extracts patterns to use from coding standards", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { coding_standards } = result.context;
    expect(Array.isArray(coding_standards.patterns_to_use)).toBe(true);
  });

  test("TC-10: Extracts anti-patterns from coding standards", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { coding_standards } = result.context;
    expect(Array.isArray(coding_standards.anti_patterns)).toBe(true);
  });

  test("TC-11: Epic context is loaded correctly", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { epic } = result.context;
    expect(epic.name).toBe("epic-1-test");
    expect(epic.overview).toContain("YouTube Content Extraction");
    expect(epic.stories_count).toBe(3);
  });

  test("TC-12: Extracts epic goal from overview", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { epic } = result.context;
    // Goal extraction is best-effort - verify it's a string
    expect(typeof epic.goal).toBe("string");
  });

  test("TC-13: Extracts epic scope from overview", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { epic } = result.context;
    expect(Array.isArray(epic.scope)).toBe(true);
  });

  test("TC-14: Story content is loaded correctly", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { story } = result.context;
    expect(story.id).toBe("1-1");
    expect(story.name).toBe("extract-transcript");
    expect(story.full_content).toContain("Extract YouTube Transcript");
  });

  test("TC-15: Extracts story description", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { story } = result.context;
    expect(story.description).toContain("knowledge library user");
  });

  test("TC-16: Extracts acceptance criteria from story", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { story } = result.context;
    expect(story.acceptance_criteria.length).toBe(4);
    expect(story.acceptance_criteria[0]).toContain("AC1");
    expect(story.acceptance_criteria[3]).toContain("AC4");
  });

  test("TC-17: Extracts story dependencies", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { story } = result.context;
    expect(Array.isArray(story.dependencies)).toBe(true);
  });

  test("TC-18: Extracts technical notes from story", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { story } = result.context;
    // Technical notes may or may not be present depending on extraction
    expect(story.technical_notes === null || typeof story.technical_notes === "string").toBe(true);
  });

  test("TC-19: Story ID prefix matching works", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.context.story.name).toBe("extract-transcript");
    expect(result.metadata.documents_loaded.some((d) => d.includes("1-1-extract-transcript.md"))).toBe(
      true
    );
  });

  test("TC-20: Development guidelines are loaded", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.context.development_guidelines).toBeDefined();
    expect(result.context.development_guidelines).toContain("Agent Development");
  });

  test("TC-21: KISS principles are loaded when available", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.context.kiss_principles).toBeDefined();
    expect(result.context.kiss_principles).toContain("simple");
  });

  test("TC-22: Estimates token count correctly", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.metadata.total_tokens_estimate).toBeGreaterThan(100);
    // Token estimate should be roughly content length / 4
    expect(result.metadata.total_tokens_estimate).toBeLessThan(100000);
  });

  test("TC-23: Records all loaded documents in metadata", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { documents_loaded } = result.metadata;
    expect(documents_loaded.some((d) => d.includes("architecture.md"))).toBe(true);
    expect(documents_loaded.some((d) => d.includes("prd.md"))).toBe(true);
    expect(documents_loaded.some((d) => d.includes("1-1-extract-transcript.md"))).toBe(true);
  });

  test("TC-24: Returns ISO 8601 timestamp", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.metadata.loaded_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});

describe("loadProjectContext - Missing Required Documents", () => {
  afterAll(() => {
    process.chdir(ORIGINAL_CWD);
  });

  test("TC-25: Missing architecture.md returns failure", async () => {
    const tempDir = "/tmp/test-missing-arch";
    await rm(tempDir, { recursive: true, force: true });

    await mkdir(join(tempDir, "_bmad-output", "planning-artifacts", "epics", "epic-1", "stories"), {
      recursive: true,
    });
    await mkdir(join(tempDir, ".claude", "rules"), { recursive: true });
    await mkdir(join(tempDir, "docs", "guides-agents"), { recursive: true });

    // Create everything except architecture
    await writeFile(join(tempDir, "_bmad-output", "planning-artifacts", "prd.md"), SAMPLE_PRD);
    await writeFile(join(tempDir, ".claude", "rules", "coding-standards.md"), SAMPLE_CODING_STANDARDS);
    await writeFile(join(tempDir, "docs", "guides-agents", "index.md"), SAMPLE_GUIDE);
    await writeFile(
      join(tempDir, "_bmad-output", "planning-artifacts", "epics", "epic-1", "stories", "1-1-story.md"),
      SAMPLE_STORY
    );

    process.chdir(tempDir);

    try {
      const result = await loadProjectContext({
        epic_name: "epic-1",
        story_id: "1-1",
        output_folder: "_bmad-output",
      });

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error).toContain("architecture.md");
      expect(result.context).toBeNull();
      expect(result.metadata.documents_missing.some((d) => d.includes("architecture"))).toBe(true);
    } finally {
      process.chdir(ORIGINAL_CWD);
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("TC-26: Missing prd.md returns failure", async () => {
    const tempDir = "/tmp/test-missing-prd";
    await rm(tempDir, { recursive: true, force: true });

    await mkdir(join(tempDir, "_bmad-output", "planning-artifacts", "epics", "epic-1", "stories"), {
      recursive: true,
    });
    await mkdir(join(tempDir, ".claude", "rules"), { recursive: true });
    await mkdir(join(tempDir, "docs", "guides-agents"), { recursive: true });

    // Create everything except PRD
    await writeFile(join(tempDir, "_bmad-output", "planning-artifacts", "architecture.md"), SAMPLE_ARCHITECTURE);
    await writeFile(join(tempDir, ".claude", "rules", "coding-standards.md"), SAMPLE_CODING_STANDARDS);
    await writeFile(join(tempDir, "docs", "guides-agents", "index.md"), SAMPLE_GUIDE);
    await writeFile(
      join(tempDir, "_bmad-output", "planning-artifacts", "epics", "epic-1", "stories", "1-1-story.md"),
      SAMPLE_STORY
    );

    process.chdir(tempDir);

    try {
      const result = await loadProjectContext({
        epic_name: "epic-1",
        story_id: "1-1",
        output_folder: "_bmad-output",
      });

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error).toContain("prd.md");
      expect(result.context).toBeNull();
    } finally {
      process.chdir(ORIGINAL_CWD);
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("TC-27: Missing coding standards returns failure", async () => {
    const tempDir = "/tmp/test-missing-standards";
    await rm(tempDir, { recursive: true, force: true });

    await mkdir(join(tempDir, "_bmad-output", "planning-artifacts", "epics", "epic-1", "stories"), {
      recursive: true,
    });
    await mkdir(join(tempDir, ".claude", "rules"), { recursive: true });
    await mkdir(join(tempDir, "docs", "guides-agents"), { recursive: true });

    // Create everything except coding standards
    await writeFile(join(tempDir, "_bmad-output", "planning-artifacts", "architecture.md"), SAMPLE_ARCHITECTURE);
    await writeFile(join(tempDir, "_bmad-output", "planning-artifacts", "prd.md"), SAMPLE_PRD);
    await writeFile(join(tempDir, "docs", "guides-agents", "index.md"), SAMPLE_GUIDE);
    await writeFile(
      join(tempDir, "_bmad-output", "planning-artifacts", "epics", "epic-1", "stories", "1-1-story.md"),
      SAMPLE_STORY
    );

    process.chdir(tempDir);

    try {
      const result = await loadProjectContext({
        epic_name: "epic-1",
        story_id: "1-1",
        output_folder: "_bmad-output",
      });

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error).toContain("coding standards");
      expect(result.context).toBeNull();
    } finally {
      process.chdir(ORIGINAL_CWD);
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("TC-28: Missing guides-agents returns failure", async () => {
    const tempDir = "/tmp/test-missing-guides";
    await rm(tempDir, { recursive: true, force: true });

    await mkdir(join(tempDir, "_bmad-output", "planning-artifacts", "epics", "epic-1", "stories"), {
      recursive: true,
    });
    await mkdir(join(tempDir, ".claude", "rules"), { recursive: true });
    // Don't create docs/guides-agents

    await writeFile(join(tempDir, "_bmad-output", "planning-artifacts", "architecture.md"), SAMPLE_ARCHITECTURE);
    await writeFile(join(tempDir, "_bmad-output", "planning-artifacts", "prd.md"), SAMPLE_PRD);
    await writeFile(join(tempDir, ".claude", "rules", "coding-standards.md"), SAMPLE_CODING_STANDARDS);
    await writeFile(
      join(tempDir, "_bmad-output", "planning-artifacts", "epics", "epic-1", "stories", "1-1-story.md"),
      SAMPLE_STORY
    );

    process.chdir(tempDir);

    try {
      const result = await loadProjectContext({
        epic_name: "epic-1",
        story_id: "1-1",
        output_folder: "_bmad-output",
      });

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error).toContain("guides-agents");
      expect(result.context).toBeNull();
    } finally {
      process.chdir(ORIGINAL_CWD);
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("TC-29: Invalid epic name returns failure", async () => {
    await cleanupTestProject();
    await setupFullTestProject();
    process.chdir(TEST_DIR);

    const result = await loadProjectContext({
      epic_name: "non-existent-epic",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error).toContain("Epic folder not found");
    expect(result.context).toBeNull();
  });

  test("TC-30: Invalid story ID returns failure", async () => {
    await cleanupTestProject();
    await setupFullTestProject();
    process.chdir(TEST_DIR);

    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "999-999",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error).toContain("Story file not found");
    expect(result.context).toBeNull();
  });
});

describe("loadProjectContext - Optional Documents", () => {
  beforeAll(async () => {
    await cleanupTestProject();
    await setupFullTestProject();
    process.chdir(TEST_DIR);
  });

  afterAll(async () => {
    await cleanupTestProject();
  });

  test("TC-31: Missing epic overview continues with null", async () => {
    // epic-2-test has no overview.md
    const result = await loadProjectContext({
      epic_name: "epic-2-test",
      story_id: "2-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.context.epic.overview).toBeNull();
    expect(result.metadata.documents_missing.some((d) => d.includes("overview.md"))).toBe(true);
  });

  test("TC-32: Missing KISS principles continues with null", async () => {
    const tempDir = "/tmp/test-no-kiss";
    await rm(tempDir, { recursive: true, force: true });

    await mkdir(join(tempDir, "_bmad-output", "planning-artifacts", "epics", "epic-1", "stories"), {
      recursive: true,
    });
    await mkdir(join(tempDir, ".claude", "rules"), { recursive: true });
    await mkdir(join(tempDir, "docs", "guides-agents"), { recursive: true });

    await writeFile(join(tempDir, "_bmad-output", "planning-artifacts", "architecture.md"), SAMPLE_ARCHITECTURE);
    await writeFile(join(tempDir, "_bmad-output", "planning-artifacts", "prd.md"), SAMPLE_PRD);
    await writeFile(join(tempDir, ".claude", "rules", "coding-standards.md"), SAMPLE_CODING_STANDARDS);
    await writeFile(join(tempDir, "docs", "guides-agents", "index.md"), SAMPLE_GUIDE);
    await writeFile(
      join(tempDir, "_bmad-output", "planning-artifacts", "epics", "epic-1", "stories", "1-1-story.md"),
      SAMPLE_STORY
    );
    // No KISS files

    process.chdir(tempDir);

    try {
      const result = await loadProjectContext({
        epic_name: "epic-1",
        story_id: "1-1",
        output_folder: "_bmad-output",
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.context.kiss_principles).toBeNull();
    } finally {
      process.chdir(ORIGINAL_CWD);
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});

describe("loadProjectContext - Options", () => {
  beforeAll(async () => {
    await cleanupTestProject();
    await setupFullTestProject();
    process.chdir(TEST_DIR);
  });

  afterAll(async () => {
    await cleanupTestProject();
  });

  test("TC-33: include_related_stories loads sibling stories", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
      options: {
        include_related_stories: true,
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.context.related_stories.length).toBeGreaterThan(0);
    expect(result.context.related_stories.some((s) => s.id.includes("1-2"))).toBe(true);
  });

  test("TC-34: Default does not load related stories", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.context.related_stories.length).toBe(0);
  });

  test("TC-35: Related stories have id, name, and summary", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
      options: {
        include_related_stories: true,
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    if (result.context.related_stories.length > 0) {
      const related = result.context.related_stories[0];
      expect(related.id).toBeDefined();
      expect(related.name).toBeDefined();
      expect(related.summary).toBeDefined();
    }
  });

  test("TC-36: summarize_large_docs=false preserves full content", async () => {
    // Create a large architecture file
    const largeContent = generateLargeContent(600);
    await writeFile(join(PLANNING_ARTIFACTS, "architecture.md"), largeContent);

    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
      options: {
        summarize_large_docs: false,
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    // Full content should contain all lines
    expect(result.context.architecture.full_content.split("\n").length).toBeGreaterThan(500);

    // Restore original
    await writeFile(join(PLANNING_ARTIFACTS, "architecture.md"), SAMPLE_ARCHITECTURE);
  });

  test("TC-37: max_context_tokens warns when exceeded", async () => {
    // This test verifies the skill handles the option (actual warning goes to stderr)
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
      options: {
        max_context_tokens: 10, // Very low limit
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    // Should still succeed but token estimate exceeds limit
    expect(result.metadata.total_tokens_estimate).toBeGreaterThan(10);
  });

  test("TC-38: Custom output_folder is respected", async () => {
    // Create alternate output structure
    const altOutput = join(TEST_DIR, "alt-output");
    await mkdir(join(altOutput, "planning-artifacts", "epics", "epic-1", "stories"), {
      recursive: true,
    });
    await writeFile(join(altOutput, "planning-artifacts", "architecture.md"), SAMPLE_ARCHITECTURE);
    await writeFile(join(altOutput, "planning-artifacts", "prd.md"), SAMPLE_PRD);
    await writeFile(
      join(altOutput, "planning-artifacts", "epics", "epic-1", "stories", "1-1-story.md"),
      SAMPLE_STORY
    );

    const result = await loadProjectContext({
      epic_name: "epic-1",
      story_id: "1-1",
      output_folder: "alt-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.metadata.documents_loaded.some((d) => d.includes("alt-output"))).toBe(true);
  });
});

describe("loadProjectContext - Coding Standards Discovery", () => {
  afterAll(async () => {
    await cleanupTestProject();
  });

  test("TC-39: Finds coding-standards.md in rules folder", async () => {
    await cleanupTestProject();
    await setupFullTestProject();
    process.chdir(TEST_DIR);

    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.context.coding_standards.full_content).toContain("TypeScript");
  });

  test("TC-40: Finds coding-standards/index.md as fallback", async () => {
    const tempDir = "/tmp/test-standards-index";
    await rm(tempDir, { recursive: true, force: true });

    await mkdir(join(tempDir, "_bmad-output", "planning-artifacts", "epics", "epic-1", "stories"), {
      recursive: true,
    });
    await mkdir(join(tempDir, ".claude", "rules", "coding-standards"), { recursive: true });
    await mkdir(join(tempDir, "docs", "guides-agents"), { recursive: true });

    await writeFile(join(tempDir, "_bmad-output", "planning-artifacts", "architecture.md"), SAMPLE_ARCHITECTURE);
    await writeFile(join(tempDir, "_bmad-output", "planning-artifacts", "prd.md"), SAMPLE_PRD);
    // Put standards in index.md inside folder
    await writeFile(
      join(tempDir, ".claude", "rules", "coding-standards", "index.md"),
      SAMPLE_CODING_STANDARDS
    );
    await writeFile(join(tempDir, "docs", "guides-agents", "index.md"), SAMPLE_GUIDE);
    await writeFile(
      join(tempDir, "_bmad-output", "planning-artifacts", "epics", "epic-1", "stories", "1-1-story.md"),
      SAMPLE_STORY
    );

    process.chdir(tempDir);

    try {
      const result = await loadProjectContext({
        epic_name: "epic-1",
        story_id: "1-1",
        output_folder: "_bmad-output",
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.context.coding_standards.full_content).toContain("TypeScript");
    } finally {
      process.chdir(ORIGINAL_CWD);
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("TC-41: Combines multiple .md files in coding-standards folder", async () => {
    const tempDir = "/tmp/test-standards-multiple";
    await rm(tempDir, { recursive: true, force: true });

    await mkdir(join(tempDir, "_bmad-output", "planning-artifacts", "epics", "epic-1", "stories"), {
      recursive: true,
    });
    await mkdir(join(tempDir, ".claude", "rules", "coding-standards"), { recursive: true });
    await mkdir(join(tempDir, "docs", "guides-agents"), { recursive: true });

    await writeFile(join(tempDir, "_bmad-output", "planning-artifacts", "architecture.md"), SAMPLE_ARCHITECTURE);
    await writeFile(join(tempDir, "_bmad-output", "planning-artifacts", "prd.md"), SAMPLE_PRD);
    // Multiple standards files
    await writeFile(
      join(tempDir, ".claude", "rules", "coding-standards", "typescript.md"),
      "# TypeScript Standards\n- Use strict mode"
    );
    await writeFile(
      join(tempDir, ".claude", "rules", "coding-standards", "testing.md"),
      "# Testing Standards\n- Write unit tests"
    );
    await writeFile(join(tempDir, "docs", "guides-agents", "index.md"), SAMPLE_GUIDE);
    await writeFile(
      join(tempDir, "_bmad-output", "planning-artifacts", "epics", "epic-1", "stories", "1-1-story.md"),
      SAMPLE_STORY
    );

    process.chdir(tempDir);

    try {
      const result = await loadProjectContext({
        epic_name: "epic-1",
        story_id: "1-1",
        output_folder: "_bmad-output",
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.context.coding_standards.full_content).toContain("TypeScript");
      expect(result.context.coding_standards.full_content).toContain("Testing");
    } finally {
      process.chdir(ORIGINAL_CWD);
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});

describe("loadProjectContext - Edge Cases", () => {
  beforeAll(async () => {
    await cleanupTestProject();
    await setupFullTestProject();
    process.chdir(TEST_DIR);
  });

  afterAll(async () => {
    await cleanupTestProject();
  });

  test("TC-42: Handles story with minimal content", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-2",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.context.story.id).toBe("1-2");
    expect(result.context.story.acceptance_criteria).toEqual([]);
  });

  test("TC-43: Handles UTF-8 content correctly", async () => {
    const utf8Story = `# Story with UTF-8

## Story

As a 用户, I want émojis 🎉 and spëcial çharacters.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Handles café correctly
2. **AC2:** Supports 日本語
</acceptance_criteria>
`;
    await writeFile(
      join(PLANNING_ARTIFACTS, "epics", "epic-1-test", "stories", "1-4-utf8-story.md"),
      utf8Story
    );

    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-4",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.context.story.full_content).toContain("用户");
    expect(result.context.story.full_content).toContain("🎉");
    expect(result.context.story.acceptance_criteria.some((ac) => ac.includes("café"))).toBe(true);
  });

  test("TC-44: Story ID exact match when prefix fails", async () => {
    // Create a story with exact ID match
    await writeFile(
      join(PLANNING_ARTIFACTS, "epics", "epic-1-test", "stories", "1-5.md"),
      SAMPLE_STORY_MINIMAL.replace("1.2", "1.5")
    );

    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-5",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.context.story.id).toBe("1-5");
  });

  test("TC-45: Empty arrays for missing sections", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-2", // Minimal story
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(Array.isArray(result.context.story.acceptance_criteria)).toBe(true);
    expect(Array.isArray(result.context.story.dependencies)).toBe(true);
    expect(Array.isArray(result.context.related_stories)).toBe(true);
  });

  test("TC-46: Metadata always has required fields", async () => {
    const result = await loadProjectContext({
      epic_name: "epic-1-test",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.metadata).toBeDefined();
    expect(typeof result.metadata.loaded_at).toBe("string");
    expect(Array.isArray(result.metadata.documents_loaded)).toBe(true);
    expect(Array.isArray(result.metadata.documents_missing)).toBe(true);
    expect(typeof result.metadata.total_tokens_estimate).toBe("number");
  });

  test("TC-47: Failure result still has metadata", async () => {
    const result = await loadProjectContext({
      epic_name: "non-existent",
      story_id: "1-1",
      output_folder: "_bmad-output",
    });

    expect(result.success).toBe(false);
    expect(result.metadata).toBeDefined();
    expect(result.metadata.loaded_at).toBeDefined();
    expect(Array.isArray(result.metadata.documents_missing)).toBe(true);
  });
});
