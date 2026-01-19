#!/usr/bin/env bun

/**
 * Markdown Index Generator
 *
 * Generates hierarchical index sections for CLAUDE.md files in documentation folders.
 * Uses Claude API to create intelligent summaries for each file and folder.
 *
 * Features:
 *   - Only updates content within <docs_index> tags (preserves other content)
 *   - AI-generated summaries for files and folders
 *   - Hierarchical structure with subfolder hints
 *
 * Usage:
 *   bun scripts/generate-index.ts <folder-path>
 *
 * Environment:
 *   ANTHROPIC_API_KEY - Required for generating summaries
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

// =============================================================================
// Configuration
// =============================================================================

const CONFIG = {
  model: "claude-sonnet-4-20250514",
  managedTag: "docs_index",
  outputFile: "CLAUDE.md",
  maxContentLength: 3000,
  tokens: {
    fileSummary: 150,
    folderDescription: 100,
    subfolderHint: 50,
  },
} as const;

// =============================================================================
// Types
// =============================================================================

interface DocEntry {
  path: string;
  description: string;
}

interface SubfolderEntry {
  path: string;
  hint: string;
}

interface FolderContents {
  markdownFiles: string[];
  subfolders: string[];
}

// =============================================================================
// Claude API
// =============================================================================

const claude = new Anthropic();

async function askClaude(prompt: string, maxTokens: number): Promise<string> {
  const response = await claude.messages.create({
    model: CONFIG.model,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text.trim() ?? "";
}

async function summarizeFile(filename: string, content: string): Promise<string> {
  const prompt = `Summarize this markdown documentation in ONE brief sentence (max 20 words). Focus on what it covers and when an agent should read it.

Filename: ${filename}

Content:
${content.slice(0, CONFIG.maxContentLength)}`;

  const summary = await askClaude(prompt, CONFIG.tokens.fileSummary);
  return summary || "Documentation file.";
}

async function describeFolderContents(
  folderName: string,
  files: string[],
  subfolders: string[]
): Promise<string> {
  const prompt = `Write a ONE sentence description (max 15 words) of what this documentation folder contains.

Folder: ${folderName}
Markdown files: ${files.join(", ") || "none"}
Subfolders: ${subfolders.join(", ") || "none"}`;

  const description = await askClaude(prompt, CONFIG.tokens.folderDescription);
  return description || `Documentation for ${folderName}.`;
}

async function generateSubfolderHint(subfolderName: string): Promise<string> {
  const prompt = `Write a brief hint (max 10 words) about what documentation might be in a folder named "${subfolderName}".`;

  const hint = await askClaude(prompt, CONFIG.tokens.subfolderHint);
  return hint || `${subfolderName} documentation.`;
}

// =============================================================================
// File System Helpers
// =============================================================================

function readFolderContents(folderPath: string): FolderContents {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });

  const markdownFiles = entries
    .filter((e) => e.isFile())
    .filter((e) => e.name.endsWith(".md"))
    .filter((e) => e.name.toUpperCase() !== CONFIG.outputFile.toUpperCase())
    .map((e) => e.name);

  const subfolders = entries
    .filter((e) => e.isDirectory())
    .filter((e) => !e.name.startsWith("."))
    .map((e) => e.name);

  return { markdownFiles, subfolders };
}

function readFileContent(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

function extractExistingFolderDescription(claudeFilePath: string): string | null {
  if (!fs.existsSync(claudeFilePath)) return null;

  const content = readFileContent(claudeFilePath);
  const match = content.match(/<folder_description>([\s\S]*?)<\/folder_description>/);

  return match?.[1].trim() ?? null;
}

// =============================================================================
// Index Generation
// =============================================================================

function escapeXmlAttribute(text: string): string {
  return text.replace(/"/g, "&quot;");
}

function formatDocsSection(docs: DocEntry[]): string {
  const entries = docs
    .map((doc) => `<doc path="${doc.path}" description="${doc.description}" />`)
    .join("\n");

  return `### Files

<docs>
${entries}
</docs>`;
}

function formatSubfoldersSection(subfolders: SubfolderEntry[]): string {
  if (subfolders.length === 0) return "";

  const entries = subfolders
    .map((sf) => `<subfolder path="${sf.path}" hint="${sf.hint}" />`)
    .join("\n");

  return `
### Subfolders

For detailed documentation in subfolders, read the CLAUDE.md file in each subfolder.

<subfolders>
${entries}
</subfolders>`;
}

function formatManagedSection(
  relativePath: string,
  folderDescription: string,
  docs: DocEntry[],
  subfolders: SubfolderEntry[]
): string {
  const openTag = `<${CONFIG.managedTag}>`;
  const closeTag = `</${CONFIG.managedTag}>`;

  return `${openTag}
<!-- AUTO-GENERATED by generate-index.ts. Do not edit this section manually. -->

## Documentation Index: ${relativePath}

<folder_description>${folderDescription}</folder_description>

${formatDocsSection(docs)}
${formatSubfoldersSection(subfolders)}
${closeTag}`;
}

// =============================================================================
// File Writing
// =============================================================================

function updateClaudeFile(filePath: string, managedContent: string): void {
  const openTag = `<${CONFIG.managedTag}>`;
  const closeTag = `</${CONFIG.managedTag}>`;
  const tagPattern = new RegExp(`${openTag}[\\s\\S]*?${closeTag}`, "g");

  if (fs.existsSync(filePath)) {
    let content = readFileContent(filePath);

    // Reset regex state for test then replace
    tagPattern.lastIndex = 0;

    if (tagPattern.test(content)) {
      tagPattern.lastIndex = 0;
      content = content.replace(tagPattern, managedContent);
    } else {
      content = `${content.trimEnd()}\n\n${managedContent}\n`;
    }

    fs.writeFileSync(filePath, content);
  } else {
    const newContent = `# CLAUDE.md\n\n${managedContent}\n`;
    fs.writeFileSync(filePath, newContent);
  }
}

// =============================================================================
// Logging
// =============================================================================

const log = {
  folder: (path: string) => console.log(`📁 Processing: ${path}`),
  stats: (files: number, folders: number) => {
    console.log(`   Found ${files} markdown files`);
    console.log(`   Found ${folders} subfolders`);
  },
  action: (message: string) => console.log(`   ${message}`),
  success: (path: string) => console.log(`✅ Updated: ${path}`),
  error: (message: string) => console.error(`❌ ${message}`),
};

// =============================================================================
// Main
// =============================================================================

async function generateIndex(folderPath: string): Promise<void> {
  const absolutePath = path.resolve(folderPath);

  if (!fs.existsSync(absolutePath)) {
    log.error(`Folder not found: ${absolutePath}`);
    process.exit(1);
  }

  const relativePath = path.relative(process.cwd(), absolutePath) || absolutePath;
  const folderName = path.basename(absolutePath) || absolutePath;

  log.folder(relativePath);

  // Read folder contents
  const { markdownFiles, subfolders } = readFolderContents(absolutePath);
  log.stats(markdownFiles.length, subfolders.length);

  // Generate folder description
  log.action("Generating folder description...");
  const folderDescription = await describeFolderContents(folderName, markdownFiles, subfolders);

  // Process markdown files
  const docs: DocEntry[] = [];

  for (const filename of markdownFiles) {
    log.action(`Summarizing: ${filename}`);

    const filePath = path.join(absolutePath, filename);
    const content = readFileContent(filePath);
    const summary = await summarizeFile(filename, content);

    docs.push({
      path: filename,
      description: escapeXmlAttribute(summary),
    });
  }

  // Process subfolders
  const subfolderEntries: SubfolderEntry[] = [];

  for (const subfolderName of subfolders) {
    log.action(`Getting hint for: ${subfolderName}/`);

    const subfolderPath = path.join(absolutePath, subfolderName);
    const subClaudePath = path.join(subfolderPath, CONFIG.outputFile);

    // Try to extract existing description, otherwise generate new hint
    const existingDescription = extractExistingFolderDescription(subClaudePath);
    const hint = existingDescription ?? (await generateSubfolderHint(subfolderName));

    subfolderEntries.push({
      path: `${subfolderName}/`,
      hint: escapeXmlAttribute(hint),
    });
  }

  // Generate and write index
  const managedContent = formatManagedSection(
    relativePath,
    folderDescription,
    docs,
    subfolderEntries
  );

  const claudePath = path.join(absolutePath, CONFIG.outputFile);
  updateClaudeFile(claudePath, managedContent);

  log.success(claudePath);
}

// =============================================================================
// CLI Entry Point
// =============================================================================

function main() {
  const targetFolder = process.argv[2];

  if (!targetFolder) {
    console.log("Usage: bun scripts/generate-index.ts <folder-path>");
    console.log("Example: bun scripts/generate-index.ts docs/");
    process.exit(1);
  }

  generateIndex(targetFolder).catch((err) => {
    log.error(err.message || err);
    process.exit(1);
  });
}

main();
