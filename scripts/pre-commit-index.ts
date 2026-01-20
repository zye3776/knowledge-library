#!/usr/bin/env bun

/**
 * Pre-commit Index Generator
 *
 * Orchestrates the generation of CLAUDE.md index files during pre-commit.
 * Receives staged markdown files as input and generates indexes
 * only for affected directories.
 *
 * Usage:
 *   bun scripts/pre-commit-index.ts <file1.md> <file2.md> ...
 *
 * Environment:
 *   ANTHROPIC_API_KEY - Required for generating summaries (via generate-index.ts)
 */

import { execSync, spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// =============================================================================
// Configuration
// =============================================================================

const CONFIG = {
  watchedFolders: ["docs", ".claude/rules", "_bmad-output"],
  excludePatterns: ["CLAUDE.md"],
  indexScript: "scripts/generate-index.ts",
} as const;

// =============================================================================
// Types
// =============================================================================

interface IndexPlan {
  triggerFiles: string[];
  dirsToIndex: string[];
  filesToSummarize: string[];
}

// =============================================================================
// Git Helpers
// =============================================================================

function stageFile(filePath: string): void {
  try {
    execSync(`git add "${filePath}"`, { encoding: "utf-8" });
  } catch (error) {
    console.error(`   ⚠️  Failed to stage: ${filePath}`);
  }
}

// =============================================================================
// File System Helpers
// =============================================================================

function getMarkdownFilesInDir(dir: string): string[] {
  try {
    if (!fs.existsSync(dir)) return [];

    return fs
      .readdirSync(dir)
      .filter((file: string) => file.endsWith(".md"))
      .filter((file: string) => !CONFIG.excludePatterns.includes(file))
      .map((file: string) => path.join(dir, file));
  } catch {
    return [];
  }
}

function dirExists(dir: string): boolean {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

// =============================================================================
// Planning
// =============================================================================

function createIndexPlan(stagedFiles: string[]): IndexPlan | null {
  const triggerFiles: string[] = [];
  const foldersWithChanges = new Set<string>();
  const dirsToIndex = new Set<string>();

  // Find files in watched folders
  for (const file of stagedFiles) {
    for (const folder of CONFIG.watchedFolders) {
      if (file.startsWith(`${folder}/`)) {
        triggerFiles.push(file);
        foldersWithChanges.add(folder);
        dirsToIndex.add(path.dirname(file));
        break;
      }
    }
  }

  if (triggerFiles.length === 0) {
    return null;
  }

  // Add parent watched folders for subfolder hint updates
  for (const folder of foldersWithChanges) {
    dirsToIndex.add(folder);
  }

  // Collect files that will be summarized
  const filesToSummarize: string[] = [];
  for (const dir of dirsToIndex) {
    const mdFiles = getMarkdownFilesInDir(dir);
    filesToSummarize.push(...mdFiles);
  }

  return {
    triggerFiles,
    dirsToIndex: Array.from(dirsToIndex),
    filesToSummarize,
  };
}

// =============================================================================
// Logging
// =============================================================================

function printHeader(): void {
  console.log("");
  console.log("📚 Markdown Index Generator");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

function printPlan(plan: IndexPlan): void {
  console.log("");
  console.log("📝 Staged files triggering reindex:");
  for (const file of plan.triggerFiles) {
    console.log(`   • ${file}`);
  }

  console.log("");
  console.log("📁 Directories to index:");
  for (const dir of plan.dirsToIndex) {
    console.log(`   • ${dir}/`);
  }

  console.log("");
  console.log("📄 Files that will be summarized:");
  for (const file of plan.filesToSummarize) {
    console.log(`   • ${file}`);
  }

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

function printGenerating(): void {
  console.log("🔄 Generating indexes...");
  console.log("");
}

function printSuccess(): void {
  console.log("");
  console.log("✅ Index generation complete.");
}

function printSkipped(): void {
  // Silent skip - no output when nothing to do
}

// =============================================================================
// Index Generation
// =============================================================================

function generateIndex(dir: string): boolean {
  console.log(`   Indexing: ${dir}`);

  const result = spawnSync("bun", [CONFIG.indexScript, dir], {
    encoding: "utf-8",
    stdio: ["inherit", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    console.error(`   ❌ Failed to index: ${dir}`);
    if (result.stderr) {
      console.error(result.stderr);
    }
    return false;
  }

  // Stage the generated CLAUDE.md
  const claudePath = path.join(dir, "CLAUDE.md");
  if (dirExists(dir)) {
    stageFile(claudePath);
  }

  return true;
}

// =============================================================================
// Main
// =============================================================================

function main(): void {
  // Get staged files from command line arguments
  const stagedFiles = process.argv.slice(2);

  if (stagedFiles.length === 0) {
    printSkipped();
    process.exit(0);
  }

  // Create index plan
  const plan = createIndexPlan(stagedFiles);

  if (!plan) {
    printSkipped();
    process.exit(0);
  }

  // Print plan
  printHeader();
  printPlan(plan);
  printGenerating();

  // Generate indexes
  let hasErrors = false;
  for (const dir of plan.dirsToIndex) {
    if (dirExists(dir)) {
      const success = generateIndex(dir);
      if (!success) {
        hasErrors = true;
      }
    }
  }

  printSuccess();

  if (hasErrors) {
    process.exit(1);
  }
}

main();
