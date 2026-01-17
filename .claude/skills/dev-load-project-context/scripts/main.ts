#!/usr/bin/env bun
/**
 * dev-load-project-context
 * Loads all required project context documents for implementation plan generation
 */

import { parseArgs } from "util";
import { readdir, readFile, stat } from "fs/promises";
import { join, resolve } from "path";

// ============================================================================
// Types
// ============================================================================

interface InputOptions {
  include_related_stories?: boolean;
  summarize_large_docs?: boolean;
  max_context_tokens?: number;
}

interface Input {
  epic_name: string;
  story_id: string;
  output_folder: string;
  options?: InputOptions;
}

interface ArchitectureContext {
  full_content: string;
  key_decisions: string[];
  tech_stack: string[];
  constraints: string[];
}

interface PrdContext {
  full_content: string;
  product_goals: string[];
  user_requirements: string[];
  success_metrics: string[];
}

interface CodingStandardsContext {
  full_content: string;
  patterns_to_use: string[];
  anti_patterns: string[];
  style_rules: string[];
}

interface EpicContext {
  name: string;
  overview: string | null;
  goal: string;
  scope: string[];
  stories_count: number;
}

interface StoryContext {
  id: string;
  name: string;
  full_content: string;
  description: string;
  acceptance_criteria: string[];
  dependencies: string[];
  technical_notes: string | null;
}

interface RelatedStory {
  id: string;
  name: string;
  summary: string;
}

interface Context {
  architecture: ArchitectureContext;
  prd: PrdContext;
  coding_standards: CodingStandardsContext;
  epic: EpicContext;
  story: StoryContext;
  related_stories: RelatedStory[];
  kiss_principles: string | null;
  development_guidelines: string | null;
}

interface Metadata {
  loaded_at: string;
  documents_loaded: string[];
  documents_missing: string[];
  total_tokens_estimate: number;
}

interface SuccessResult {
  success: true;
  error: null;
  context: Context;
  metadata: Metadata;
}

interface FailureResult {
  success: false;
  error: string;
  context: null;
  metadata: Metadata;
}

type Result = SuccessResult | FailureResult;

// ============================================================================
// Constants
// ============================================================================

const MAX_LINES_BEFORE_SUMMARIZE = 500;
const APPROX_CHARS_PER_TOKEN = 4;

// ============================================================================
// File System Helpers
// ============================================================================

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readFileContent(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf-8");
  } catch {
    return null;
  }
}

async function findFileByPrefix(
  dir: string,
  prefix: string
): Promise<string | null> {
  try {
    const files = await readdir(dir);
    const match = files.find(
      (f) => f.startsWith(prefix) && f.endsWith(".md")
    );
    return match ? join(dir, match) : null;
  } catch {
    return null;
  }
}

async function readAllMdFiles(dir: string, recursive = false): Promise<string> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const contents: string[] = [];

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory() && recursive) {
        const subContent = await readAllMdFiles(fullPath, true);
        if (subContent) {
          contents.push(subContent);
        }
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const content = await readFileContent(fullPath);
        if (content) {
          contents.push(`# ${entry.name}\n\n${content}`);
        }
      }
    }
    return contents.join("\n\n---\n\n");
  } catch {
    return "";
  }
}

async function countStoriesInDir(dir: string): Promise<number> {
  try {
    const files = await readdir(dir);
    return files.filter(
      (f) => f.endsWith(".md") && !f.startsWith("index")
    ).length;
  } catch {
    return 0;
  }
}

// ============================================================================
// Extraction Helpers
// ============================================================================

function extractBulletPoints(
  content: string,
  sectionPatterns: RegExp[]
): string[] {
  const results: string[] = [];
  for (const pattern of sectionPatterns) {
    const match = content.match(pattern);
    if (match) {
      const sectionStart = (match.index ?? 0) + match[0].length;
      const nextSection = content
        .slice(sectionStart)
        .search(/^#+ /m);
      const sectionEnd =
        nextSection === -1
          ? content.length
          : sectionStart + nextSection;
      const section = content.slice(sectionStart, sectionEnd);
      const bullets = section.match(/^[-*]\s+.+$/gm) ?? [];
      results.push(...bullets.map((b) => b.replace(/^[-*]\s+/, "").trim()));
    }
  }
  return results;
}

function extractKeyDecisions(content: string): string[] {
  const patterns = [
    /^##+ .*(?:decision|technical decision|key decision|architecture decision)/im,
    /^##+ .*ADR/im,
  ];
  const decisions = extractBulletPoints(content, patterns);

  // Also look for inline decision markers
  const inlineDecisions = content.match(
    /(?:Decision|Chose|Selected):\s*(.+?)(?:\n|$)/gi
  );
  if (inlineDecisions) {
    decisions.push(
      ...inlineDecisions.map((d) =>
        d.replace(/^(?:Decision|Chose|Selected):\s*/i, "").trim()
      )
    );
  }
  return [...new Set(decisions)];
}

function extractTechStack(content: string): string[] {
  const patterns = [
    /^##+ .*(?:tech stack|technology|stack)/im,
    /^##+ .*(?:tools|frameworks)/im,
  ];
  const stack = extractBulletPoints(content, patterns);

  // Also extract from code blocks mentioning common tools
  const techKeywords = [
    "TypeScript", "Bun", "Node.js", "React", "OpenAI", "yt-dlp",
    "PostgreSQL", "SQLite", "Redis", "Docker", "Python", "JavaScript"
  ];
  for (const tech of techKeywords) {
    if (content.includes(tech) && !stack.includes(tech)) {
      stack.push(tech);
    }
  }
  return [...new Set(stack)];
}

function extractConstraints(content: string): string[] {
  const patterns = [
    /^##+ .*(?:constraint|limitation|restriction)/im,
    /<constraints>/i,
  ];
  const constraints = extractBulletPoints(content, patterns);

  // Extract from <constraints> tags
  const constraintTags = content.match(
    /<constraints>([\s\S]*?)<\/constraints>/gi
  );
  if (constraintTags) {
    for (const tag of constraintTags) {
      const tagContent = tag.replace(/<\/?constraints>/gi, "");
      const bullets = tagContent.match(/^[-*]\s+.+$/gm) ?? [];
      constraints.push(...bullets.map((b) => b.replace(/^[-*]\s+/, "").trim()));
    }
  }
  return [...new Set(constraints)];
}

function extractProductGoals(content: string): string[] {
  const patterns = [
    /^##+ .*(?:goals?|objectives?|vision)/im,
    /^##+ .*(?:purpose)/im,
  ];
  return extractBulletPoints(content, patterns);
}

function extractUserRequirements(content: string): string[] {
  const patterns = [
    /^##+ .*(?:requirement|user stor|feature)/im,
    /^##+ .*(?:functional requirement)/im,
  ];
  return extractBulletPoints(content, patterns);
}

function extractSuccessMetrics(content: string): string[] {
  const patterns = [
    /^##+ .*(?:metric|success|kpi|measure)/im,
  ];
  return extractBulletPoints(content, patterns);
}

function extractPatternsToUse(content: string): string[] {
  const patterns = [
    /^##+ .*(?:pattern|best practice|do\b|prefer)/im,
  ];
  return extractBulletPoints(content, patterns);
}

function extractAntiPatterns(content: string): string[] {
  const patterns = [
    /^##+ .*(?:anti.?pattern|avoid|don't|do not)/im,
  ];
  return extractBulletPoints(content, patterns);
}

function extractStyleRules(content: string): string[] {
  const patterns = [
    /^##+ .*(?:style|format|convention)/im,
  ];
  return extractBulletPoints(content, patterns);
}

function extractAcceptanceCriteria(content: string): string[] {
  // Look for <acceptance_criteria> tags or ## Acceptance Criteria section
  const acTags = content.match(
    /<acceptance_criteria>([\s\S]*?)<\/acceptance_criteria>/i
  );
  if (acTags) {
    const tagContent = acTags[1];
    const numbered = tagContent.match(/^\d+\.\s+\*\*.*?\*\*:?\s*.+$/gm) ?? [];
    if (numbered.length) {
      return numbered.map((n) => n.replace(/^\d+\.\s+/, "").trim());
    }
    const bullets = tagContent.match(/^[-*]\s+.+$/gm) ?? [];
    return bullets.map((b) => b.replace(/^[-*]\s+/, "").trim());
  }

  const patterns = [/^##+ .*acceptance criteria/im];
  return extractBulletPoints(content, patterns);
}

function extractDependencies(content: string): string[] {
  const patterns = [/^##+ .*(?:dependenc|prerequisite|blocker)/im];
  return extractBulletPoints(content, patterns);
}

function extractEpicGoal(content: string): string {
  const goalMatch = content.match(/^##+ .*goal[\s\S]*?(?=^#|$)/im);
  if (goalMatch) {
    const section = goalMatch[0];
    const firstParagraph = section.split(/\n\n/)[1];
    return firstParagraph?.trim() ?? "";
  }
  // Fallback to first paragraph after title
  const lines = content.split("\n");
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith("#")) {
      return line;
    }
  }
  return "";
}

function extractEpicScope(content: string): string[] {
  const patterns = [/^##+ .*scope/im];
  return extractBulletPoints(content, patterns);
}

function extractStoryDescription(content: string): string {
  // Look for the story statement (As a...)
  const storyMatch = content.match(
    /As a[n]?\s+\*\*[^*]+\*\*[\s\S]*?(?=\n\n|$)/i
  );
  if (storyMatch) {
    return storyMatch[0].replace(/\*\*/g, "");
  }

  // Fallback: first non-header paragraph
  const lines = content.split("\n");
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith("#") && !line.startsWith("Status:")) {
      return line;
    }
  }
  return "";
}

function extractTechnicalNotes(content: string): string | null {
  const patterns = [/^##+ .*(?:technical note|implementation note|tech note)/im];
  const notes = extractBulletPoints(content, patterns);
  return notes.length ? notes.join("\n") : null;
}

function summarizeContent(content: string): string {
  const lines = content.split("\n");
  if (lines.length <= MAX_LINES_BEFORE_SUMMARIZE) {
    return content;
  }

  const result: string[] = [];
  let inCodeBlock = false;
  let inBulletSection = false;

  for (const line of lines) {
    // Keep all headers
    if (line.startsWith("#")) {
      result.push(line);
      inBulletSection = false;
      continue;
    }

    // Keep code blocks intact
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }
    if (inCodeBlock) {
      result.push(line);
      continue;
    }

    // Keep bullets under important sections
    const importantSections = [
      "requirement", "constraint", "decision", "criteria", "task"
    ];
    if (line.match(/^[-*]\s+/)) {
      const lastHeader = result.findLast((l) => l.startsWith("#")) ?? "";
      const isImportant = importantSections.some((s) =>
        lastHeader.toLowerCase().includes(s)
      );
      if (isImportant) {
        result.push(line);
        inBulletSection = true;
        continue;
      }
    }

    // Keep first 2-3 sentences of prose paragraphs
    if (line.trim() && !line.startsWith("-") && !line.startsWith("*")) {
      if (!inBulletSection) {
        const sentences = line.split(/(?<=[.!?])\s+/);
        result.push(sentences.slice(0, 3).join(" "));
      }
      continue;
    }

    // Keep empty lines for formatting
    if (!line.trim()) {
      result.push(line);
      inBulletSection = false;
    }
  }

  return result.join("\n");
}

function estimateTokens(content: string): number {
  return Math.ceil(content.length / APPROX_CHARS_PER_TOKEN);
}

// ============================================================================
// Main Context Loading
// ============================================================================

export async function loadProjectContext(input: Input): Promise<Result> {
  const {
    epic_name,
    story_id,
    output_folder,
    options = {},
  } = input;

  const {
    include_related_stories = false,
    summarize_large_docs = true,
    max_context_tokens = 50000,
  } = options;

  const metadata: Metadata = {
    loaded_at: new Date().toISOString(),
    documents_loaded: [],
    documents_missing: [],
    total_tokens_estimate: 0,
  };

  const cwd = process.cwd();
  const outputBase = resolve(cwd, output_folder);
  const planningArtifacts = join(outputBase, "planning-artifacts");

  // -------------------------------------------------------------------------
  // Load Architecture (REQUIRED)
  // -------------------------------------------------------------------------
  const architecturePath = join(planningArtifacts, "architecture.md");
  const architectureContent = await readFileContent(architecturePath);

  if (!architectureContent) {
    metadata.documents_missing.push(architecturePath);
    return {
      success: false,
      error: `Required document not found: ${architecturePath}`,
      context: null,
      metadata,
    };
  }
  metadata.documents_loaded.push(architecturePath);

  const architecture: ArchitectureContext = {
    full_content: summarize_large_docs
      ? summarizeContent(architectureContent)
      : architectureContent,
    key_decisions: extractKeyDecisions(architectureContent),
    tech_stack: extractTechStack(architectureContent),
    constraints: extractConstraints(architectureContent),
  };

  // -------------------------------------------------------------------------
  // Load PRD (REQUIRED)
  // -------------------------------------------------------------------------
  const prdPath = join(planningArtifacts, "prd.md");
  const prdContent = await readFileContent(prdPath);

  if (!prdContent) {
    metadata.documents_missing.push(prdPath);
    return {
      success: false,
      error: `Required document not found: ${prdPath}`,
      context: null,
      metadata,
    };
  }
  metadata.documents_loaded.push(prdPath);

  const prd: PrdContext = {
    full_content: summarize_large_docs
      ? summarizeContent(prdContent)
      : prdContent,
    product_goals: extractProductGoals(prdContent),
    user_requirements: extractUserRequirements(prdContent),
    success_metrics: extractSuccessMetrics(prdContent),
  };

  // -------------------------------------------------------------------------
  // Load Coding Standards (REQUIRED)
  // -------------------------------------------------------------------------
  const rulesDir = join(cwd, ".claude", "rules");
  let codingStandardsContent = "";
  let codingStandardsPath = "";

  // Try single file first
  const singleFile = join(rulesDir, "coding-standards.md");
  if (await fileExists(singleFile)) {
    codingStandardsContent = (await readFileContent(singleFile)) ?? "";
    codingStandardsPath = singleFile;
  } else {
    // Try folder with index.md
    const folderIndex = join(rulesDir, "coding-standards", "index.md");
    if (await fileExists(folderIndex)) {
      codingStandardsContent = (await readFileContent(folderIndex)) ?? "";
      codingStandardsPath = folderIndex;
    } else {
      // Try all .md files in coding-standards folder
      const folder = join(rulesDir, "coding-standards");
      if (await fileExists(folder)) {
        codingStandardsContent = await readAllMdFiles(folder);
        codingStandardsPath = folder;
      }
    }
  }

  // If still empty, try gathering from all rules recursively
  if (!codingStandardsContent) {
    codingStandardsContent = await readAllMdFiles(rulesDir, true);
    codingStandardsPath = rulesDir;
  }

  if (!codingStandardsContent) {
    metadata.documents_missing.push(join(rulesDir, "coding-standards"));
    return {
      success: false,
      error: `Required document not found: coding standards in ${rulesDir}`,
      context: null,
      metadata,
    };
  }
  metadata.documents_loaded.push(codingStandardsPath);

  const coding_standards: CodingStandardsContext = {
    full_content: summarize_large_docs
      ? summarizeContent(codingStandardsContent)
      : codingStandardsContent,
    patterns_to_use: extractPatternsToUse(codingStandardsContent),
    anti_patterns: extractAntiPatterns(codingStandardsContent),
    style_rules: extractStyleRules(codingStandardsContent),
  };

  // -------------------------------------------------------------------------
  // Load Development Guidelines (REQUIRED)
  // -------------------------------------------------------------------------
  const guidesDir = join(cwd, "docs", "guides-agents");
  let developmentGuidelines: string | null = null;

  if (await fileExists(guidesDir)) {
    const guideContent = await readAllMdFiles(guidesDir);
    if (guideContent) {
      developmentGuidelines = summarize_large_docs
        ? summarizeContent(guideContent)
        : guideContent;
      metadata.documents_loaded.push(guidesDir);
    }
  }

  if (!developmentGuidelines) {
    metadata.documents_missing.push(guidesDir);
    return {
      success: false,
      error: `Required document not found: ${guidesDir}`,
      context: null,
      metadata,
    };
  }

  // -------------------------------------------------------------------------
  // Load Epic (OPTIONAL overview, REQUIRED folder)
  // -------------------------------------------------------------------------
  const epicDir = join(planningArtifacts, "epics", epic_name);
  if (!(await fileExists(epicDir))) {
    metadata.documents_missing.push(epicDir);
    return {
      success: false,
      error: `Epic folder not found: ${epicDir}`,
      context: null,
      metadata,
    };
  }

  const overviewPath = join(epicDir, "overview.md");
  const overviewContent = await readFileContent(overviewPath);
  if (overviewContent) {
    metadata.documents_loaded.push(overviewPath);
  } else {
    metadata.documents_missing.push(overviewPath);
  }

  const storiesDir = join(epicDir, "stories");
  const storiesCount = await countStoriesInDir(storiesDir);

  const epic: EpicContext = {
    name: epic_name,
    overview: overviewContent
      ? summarize_large_docs
        ? summarizeContent(overviewContent)
        : overviewContent
      : null,
    goal: overviewContent ? extractEpicGoal(overviewContent) : "",
    scope: overviewContent ? extractEpicScope(overviewContent) : [],
    stories_count: storiesCount,
  };

  // -------------------------------------------------------------------------
  // Load Story (REQUIRED)
  // -------------------------------------------------------------------------
  let storyPath = await findFileByPrefix(storiesDir, story_id);

  // Also try exact match
  if (!storyPath) {
    const exactPath = join(storiesDir, `${story_id}.md`);
    if (await fileExists(exactPath)) {
      storyPath = exactPath;
    }
  }

  if (!storyPath) {
    metadata.documents_missing.push(join(storiesDir, `${story_id}*.md`));
    return {
      success: false,
      error: `Story file not found: ${story_id} in ${storiesDir}`,
      context: null,
      metadata,
    };
  }

  const storyContent = await readFileContent(storyPath);
  if (!storyContent) {
    return {
      success: false,
      error: `Failed to read story file: ${storyPath}`,
      context: null,
      metadata,
    };
  }
  metadata.documents_loaded.push(storyPath);

  // Extract story name from filename
  const storyFilename = storyPath.split("/").pop() ?? "";
  const storyName = storyFilename.replace(/\.md$/, "").replace(/^\d+-\d+-/, "");

  const story: StoryContext = {
    id: story_id,
    name: storyName,
    full_content: storyContent,
    description: extractStoryDescription(storyContent),
    acceptance_criteria: extractAcceptanceCriteria(storyContent),
    dependencies: extractDependencies(storyContent),
    technical_notes: extractTechnicalNotes(storyContent),
  };

  // -------------------------------------------------------------------------
  // Load Related Stories (OPTIONAL)
  // -------------------------------------------------------------------------
  const related_stories: RelatedStory[] = [];

  if (include_related_stories) {
    try {
      const files = await readdir(storiesDir);
      const siblingFiles = files.filter(
        (f) =>
          f.endsWith(".md") &&
          !f.startsWith("index") &&
          !f.startsWith(story_id)
      );

      for (const file of siblingFiles.slice(0, 5)) {
        const content = await readFileContent(join(storiesDir, file));
        if (content) {
          const id = file.match(/^(\d+-\d+)/)?.[1] ?? file;
          const name = file.replace(/\.md$/, "").replace(/^\d+-\d+-/, "");
          const summary = extractStoryDescription(content);
          related_stories.push({ id, name, summary });
        }
      }
    } catch {
      // Ignore errors loading related stories
    }
  }

  // -------------------------------------------------------------------------
  // Load KISS Principles (OPTIONAL)
  // -------------------------------------------------------------------------
  let kiss_principles: string | null = null;

  const kissPath = join(rulesDir, "kiss-development.md");
  if (await fileExists(kissPath)) {
    kiss_principles = await readFileContent(kissPath);
    if (kiss_principles) {
      metadata.documents_loaded.push(kissPath);
    }
  }

  // Also check in guides-agents
  if (!kiss_principles) {
    const kissGuidePath = join(guidesDir, "KISS-principle-agent-guide.md");
    if (await fileExists(kissGuidePath)) {
      kiss_principles = await readFileContent(kissGuidePath);
      if (kiss_principles && !metadata.documents_loaded.includes(kissGuidePath)) {
        metadata.documents_loaded.push(kissGuidePath);
      }
    }
  }

  if (kiss_principles && summarize_large_docs) {
    kiss_principles = summarizeContent(kiss_principles);
  }

  // -------------------------------------------------------------------------
  // Build Context and Calculate Token Estimate
  // -------------------------------------------------------------------------
  const context: Context = {
    architecture,
    prd,
    coding_standards,
    epic,
    story,
    related_stories,
    kiss_principles,
    development_guidelines: developmentGuidelines,
  };

  // Calculate total token estimate
  let totalContent = "";
  totalContent += architecture.full_content;
  totalContent += prd.full_content;
  totalContent += coding_standards.full_content;
  totalContent += epic.overview ?? "";
  totalContent += story.full_content;
  totalContent += kiss_principles ?? "";
  totalContent += developmentGuidelines ?? "";
  for (const rs of related_stories) {
    totalContent += rs.summary;
  }

  metadata.total_tokens_estimate = estimateTokens(totalContent);

  // Warn if over max tokens
  if (metadata.total_tokens_estimate > max_context_tokens) {
    console.error(
      `Warning: Context size (${metadata.total_tokens_estimate} tokens) exceeds max (${max_context_tokens})`
    );
  }

  return {
    success: true,
    error: null,
    context,
    metadata,
  };
}

// ============================================================================
// CLI Interface
// ============================================================================

async function main() {
  const { values, positionals: _positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      epic: { type: "string", short: "e" },
      story: { type: "string", short: "s" },
      output: { type: "string", short: "o", default: "_bmad-output" },
      "include-related": { type: "boolean", default: false },
      "no-summarize": { type: "boolean", default: false },
      "max-tokens": { type: "string", default: "50000" },
      help: { type: "boolean", short: "h" },
      json: { type: "boolean", short: "j" },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
dev-load-project-context - Load project context for implementation planning

Usage:
  load-context --epic <name> --story <id> [options]

Options:
  -e, --epic <name>       Epic folder name (required)
  -s, --story <id>        Story ID or prefix (required)
  -o, --output <folder>   Output folder base (default: _bmad-output)
  --include-related       Load sibling stories for context
  --no-summarize          Don't summarize large documents
  --max-tokens <num>      Maximum context tokens (default: 50000)
  -j, --json              Output as JSON
  -h, --help              Show this help

Examples:
  load-context --epic epic-1-youtube-content-extraction --story 1-1
  load-context -e epic-1-youtube-content-extraction -s 1-1 --json
`);
    process.exit(0);
  }

  const epic_name = values.epic;
  const story_id = values.story;

  if (!epic_name || !story_id) {
    console.error("Error: --epic and --story are required");
    process.exit(1);
  }

  const input: Input = {
    epic_name,
    story_id,
    output_folder: values.output ?? "_bmad-output",
    options: {
      include_related_stories: values["include-related"],
      summarize_large_docs: !values["no-summarize"],
      max_context_tokens: parseInt(values["max-tokens"] ?? "50000", 10),
    },
  };

  const result = await loadProjectContext(input);

  if (values.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (result.success) {
      console.log("Context loaded successfully!\n");
      console.log("Documents loaded:");
      for (const doc of result.metadata.documents_loaded) {
        console.log(`  ✓ ${doc}`);
      }
      if (result.metadata.documents_missing.length) {
        console.log("\nMissing optional documents:");
        for (const doc of result.metadata.documents_missing) {
          console.log(`  - ${doc}`);
        }
      }
      console.log(`\nTotal tokens estimate: ${result.metadata.total_tokens_estimate}`);
      console.log("\nStory Details:");
      console.log(`  ID: ${result.context.story.id}`);
      console.log(`  Name: ${result.context.story.name}`);
      console.log(`  Acceptance Criteria: ${result.context.story.acceptance_criteria.length}`);
      console.log("\nArchitecture:");
      console.log(`  Key Decisions: ${result.context.architecture.key_decisions.length}`);
      console.log(`  Tech Stack: ${result.context.architecture.tech_stack.join(", ")}`);
    } else {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
  }
}

// Only run CLI if this is the main module
const isMain = import.meta.main ?? (typeof require !== 'undefined' && require.main === module);
if (isMain) {
  main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
  });
}
