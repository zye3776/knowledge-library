#!/usr/bin/env bun
import { Command } from "commander";
import OpenAI from "openai";
import { spawn, execSync } from "child_process";
import { tmpdir } from "os";
import { join } from "path";
import { mkdir, unlink, readdir } from "fs/promises";

const VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
type Voice = (typeof VOICES)[number];
const DEFAULT_VOICE: Voice = "nova";
const DEFAULT_MODEL = "tts-1";
const DEFAULT_SPEED = 1.0;

// Text filters for better audio experience
type TextFilter = (text: string) => string;

const TEXT_FILTERS: Record<string, TextFilter> = {
  // Remove markdown links but keep the link text: [text](url) -> text
  "markdown-links": (text) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),

  // Remove inline code backticks: `code` -> code
  "inline-code": (text) => text.replace(/`([^`]+)`/g, "$1"),

  // Remove bold/italic markers: **text** -> text, *text* -> text
  "emphasis": (text) => text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1"),

  // Remove markdown headers: ## Header -> Header
  "headers": (text) => text.replace(/^#{1,6}\s+/gm, ""),

  // Remove horizontal rules
  "hr": (text) => text.replace(/^[-*_]{3,}\s*$/gm, ""),

  // Remove image syntax: ![alt](url) -> (reads nothing or alt text)
  "images": (text) => text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1"),

  // Clean up multiple spaces/newlines
  "whitespace": (text) => text.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+/g, " "),
};

// Default filters for markdown content
const DEFAULT_FILTERS = ["markdown-links", "inline-code", "emphasis", "headers", "hr", "images", "whitespace"];

function applyFilters(text: string, filterNames: string[]): string {
  let result = text;
  for (const name of filterNames) {
    const filter = TEXT_FILTERS[name];
    if (filter) {
      result = filter(result);
    }
  }
  return result;
}

// Global flag for graceful shutdown
let stopRequested = false;

interface PlaybackState {
  current_paragraph: number;
  total_paragraphs: number;
  status: "generating" | "ready" | "playing" | "completed";
  last_updated?: string;
}

interface ParagraphsMeta {
  total: number;
  paragraphs: string[];
  voice: string;
  model: string;
  generated: string;
}

// Split text into paragraphs
function splitIntoParagraphs(text: string): string[] {
  const paragraphs = text.trim().split(/\n\s*\n/);
  return paragraphs.map((p) => p.trim()).filter((p) => p.length > 0);
}

// Load playback state from JSON
async function loadPlaybackState(outputDir: string): Promise<PlaybackState | null> {
  const playbackFile = join(outputDir, "playback.json");
  try {
    const file = Bun.file(playbackFile);
    if (await file.exists()) {
      return await file.json();
    }
  } catch {
    // File doesn't exist or invalid JSON
  }
  return null;
}

// Save playback state to JSON
async function savePlaybackState(outputDir: string, state: PlaybackState): Promise<void> {
  const playbackFile = join(outputDir, "playback.json");
  state.last_updated = new Date().toISOString();
  await Bun.write(playbackFile, JSON.stringify(state, null, 2));
}

// Get audio duration using afinfo (macOS)
function getAudioDuration(audioFile: string): number {
  try {
    const result = execSync(`afinfo "${audioFile}"`, { encoding: "utf-8" });
    // Look for "estimated duration: X.XXX sec" pattern
    const match = result.match(/estimated duration:\s*([\d.]+)\s*sec/i);
    if (match) {
      return parseFloat(match[1]);
    }
    // Fallback: look for "X.XXX sec" pattern
    const secMatch = result.match(/([\d.]+)\s*sec/);
    if (secMatch) {
      return parseFloat(secMatch[1]);
    }
    return 3.0; // Fallback estimate
  } catch {
    return 3.0; // Fallback estimate
  }
}

// Format seconds as MM:SS or HH:MM:SS
function formatTime(seconds: number): string {
  if (seconds < 0) return "0:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// Generate audio for paragraphs
async function generateParagraphAudio(
  client: OpenAI,
  paragraphs: string[],
  outputDir: string,
  voice: Voice,
  model: string,
  startFrom: number = 0
): Promise<void> {
  const paragraphsDir = join(outputDir, "paragraphs");
  await mkdir(paragraphsDir, { recursive: true });

  const total = paragraphs.length;

  for (let i = 0; i < paragraphs.length; i++) {
    if (i < startFrom) continue;
    if (stopRequested) break;

    const paraNum = i + 1;
    const audioFile = join(paragraphsDir, `${paraNum.toString().padStart(3, "0")}.mp3`);

    // Skip if already generated
    if (await Bun.file(audioFile).exists()) continue;

    process.stderr.write(`\r🎙️  Generating audio ${paraNum}/${total}...`);

    const response = await client.audio.speech.create({
      model,
      voice,
      input: paragraphs[i],
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    await Bun.write(audioFile, buffer);
  }
  process.stderr.write("\n");
}

// Play paragraphs sequentially with progress bar
async function playParagraphs(outputDir: string, startFrom: number = 0, rate: number = 1.0): Promise<number> {
  const paragraphsDir = join(outputDir, "paragraphs");

  try {
    const files = await readdir(paragraphsDir);
    const audioFiles = files.filter((f) => f.endsWith(".mp3")).sort();
    const total = audioFiles.length;

    if (total === 0) {
      console.error("Error: No audio files found.");
      return startFrom;
    }

    // Calculate durations (adjusted for playback rate)
    process.stderr.write("Calculating duration...\r");
    const durations = audioFiles.map((f) => getAudioDuration(join(paragraphsDir, f)) / rate);

    let current = startFrom;

    for (let i = 0; i < audioFiles.length; i++) {
      if (i < startFrom) continue;
      if (stopRequested) {
        process.stderr.write("\n");
        return current;
      }

      current = i;
      const paraNum = i + 1;
      const timeRemaining = durations.slice(i).reduce((a, b) => a + b, 0);

      // Progress bar
      const barWidth = 20;
      const filled = Math.floor((paraNum / total) * barWidth);
      const bar = "█".repeat(filled) + "░".repeat(barWidth - filled);
      const progress = `\r[${bar}] ${paraNum}/${total} | ${formatTime(timeRemaining)} remaining`;
      process.stderr.write(progress);

      // Save state BEFORE playing
      await savePlaybackState(outputDir, {
        current_paragraph: current,
        total_paragraphs: total,
        status: "playing",
      });

      const audioFile = join(paragraphsDir, audioFiles[i]);

      try {
        const child = spawn("afplay", ["-r", String(rate), audioFile]);
        await new Promise<void>((resolve, reject) => {
          child.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`afplay exited with code ${code}`));
          });
          child.on("error", reject);
        });

        // Paragraph completed - update state
        await savePlaybackState(outputDir, {
          current_paragraph: current + 1,
          total_paragraphs: total,
          status: current + 1 < total ? "playing" : "completed",
        });
      } catch {
        process.stderr.write("\n");
        return current;
      }
    }

    // Show completion
    const completedBar = "█".repeat(20);
    process.stderr.write(`\r[${completedBar}] ✅ Complete (${total} paragraphs)           \n`);

    await savePlaybackState(outputDir, {
      current_paragraph: total,
      total_paragraphs: total,
      status: "completed",
    });

    return total;
  } catch {
    console.error("Error: No paragraphs directory found.");
    return startFrom;
  }
}

// Chunked speak mode
async function chunkedSpeak(
  text: string,
  outputDir: string,
  voice: Voice,
  model: string,
  rate: number,
  generateOnly: boolean = false
): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Error: OPENAI_API_KEY environment variable not set.");
    process.exit(1);
  }

  await mkdir(outputDir, { recursive: true });

  const paragraphs = splitIntoParagraphs(text);
  if (paragraphs.length === 0) {
    console.error("Error: No paragraphs found in text.");
    process.exit(1);
  }

  console.error(`📄 Split into ${paragraphs.length} paragraphs.`);

  // Save paragraphs metadata
  const metaFile = join(outputDir, "paragraphs.json");
  const meta: ParagraphsMeta = {
    total: paragraphs.length,
    paragraphs,
    voice,
    model,
    generated: new Date().toISOString(),
  };
  await Bun.write(metaFile, JSON.stringify(meta, null, 2));

  // Initialize playback state
  await savePlaybackState(outputDir, {
    current_paragraph: 0,
    total_paragraphs: paragraphs.length,
    status: "generating",
  });

  // Generate audio
  const client = new OpenAI({ apiKey });
  await generateParagraphAudio(client, paragraphs, outputDir, voice, model);

  if (stopRequested) return;

  if (generateOnly) {
    await savePlaybackState(outputDir, {
      current_paragraph: 0,
      total_paragraphs: paragraphs.length,
      status: "ready",
    });
    console.error(`✅ Generated ${paragraphs.length} audio files.`);
    return;
  }

  // Play all paragraphs
  await playParagraphs(outputDir, 0, rate);
}

// Resume playback
async function resumePlayback(outputDir: string, rate: number = 1.0): Promise<void> {
  const state = await loadPlaybackState(outputDir);

  if (!state) {
    console.error("Error: No playback state found. Use --chunked to start.");
    process.exit(1);
  }

  if (state.status === "completed") {
    console.error("✅ Playback already completed. Starting from beginning.");
    await playParagraphs(outputDir, 0, rate);
  } else {
    console.error(`▶️  Resuming from paragraph ${state.current_paragraph + 1}/${state.total_paragraphs}...`);
    await playParagraphs(outputDir, state.current_paragraph, rate);
  }
}

// Stop playback
function stopPlayback(): void {
  try {
    execSync("pkill -f afplay", { stdio: "ignore" });
    console.error("⏹️  Playback stopped.");
  } catch {
    // No process to kill
    console.error("⏹️  No playback to stop.");
  }
}

// Show status
async function showStatus(outputDir: string): Promise<void> {
  const state = await loadPlaybackState(outputDir);

  if (state) {
    console.log(`Status: ${state.status}`);
    console.log(`Progress: ${state.current_paragraph}/${state.total_paragraphs}`);
    console.log(`Last updated: ${state.last_updated || "unknown"}`);
  } else {
    console.log("No playback state found.");
  }
}

// Simple TTS (single file mode)
async function speak(text: string, voice: Voice, model: string, rate: number, outputFile?: string): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Error: OPENAI_API_KEY environment variable not set.");
    process.exit(1);
  }

  const client = new OpenAI({ apiKey });

  const response = await client.audio.speech.create({
    model,
    voice,
    input: text,
  });

  const buffer = Buffer.from(await response.arrayBuffer());

  if (outputFile) {
    await Bun.write(outputFile, buffer);
    console.log(`Audio saved to: ${outputFile}`);
  } else {
    const tmpPath = join(tmpdir(), `speech-${Date.now()}.mp3`);
    await Bun.write(tmpPath, buffer);

    try {
      const child = spawn("afplay", ["-r", String(rate), tmpPath]);
      await new Promise<void>((resolve, reject) => {
        child.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`afplay exited with code ${code}`));
        });
        child.on("error", reject);
      });
    } finally {
      try {
        await unlink(tmpPath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

// Setup signal handlers
process.on("SIGINT", () => {
  stopRequested = true;
  console.error("\n⏸️  Playback paused. Use --resume to continue.");
});

process.on("SIGTERM", () => {
  stopRequested = true;
});

// CLI setup
const program = new Command();

program
  .name("speak")
  .description("OpenAI TTS - Convert text to speech (say-command compatible)")
  .argument("[text]", "Text to speak")
  .option("-f, --file <file>", "Read text from file")
  .option("-v, --voice <voice>", `Voice to use (default: ${DEFAULT_VOICE})`, DEFAULT_VOICE)
  .option("-o, --output <file>", "Save audio to file instead of playing")
  .option("--model <model>", `Model to use (default: ${DEFAULT_MODEL})`, DEFAULT_MODEL)
  .option("-r, --rate <rate>", `Playback rate 0.25-4.0 (default: ${DEFAULT_SPEED})`, String(DEFAULT_SPEED))
  .option("--filter <filters>", "Comma-separated list of filters to apply (default: all)")
  .option("--no-filter", "Disable all text filters")
  .option("--list-filters", "List available text filters")
  .option("--list-voices", "List available voices")
  .option("--chunked", "Enable paragraph-by-paragraph audio generation and playback")
  .option("-d, --dir <dir>", "Output directory for chunked audio files")
  .option("--generate-only", "Only generate audio files, don't play (use with --chunked)")
  .option("--resume", "Resume playback from last position")
  .option("--stop", "Stop currently playing audio")
  .option("--status", "Show playback status for a directory")
  .action(
    async (
      textArg: string | undefined,
      options: {
        file?: string;
        voice: string;
        output?: string;
        model: string;
        rate: string;
        filter?: string | boolean;
        listFilters?: boolean;
        listVoices?: boolean;
        chunked?: boolean;
        dir?: string;
        generateOnly?: boolean;
        resume?: boolean;
        stop?: boolean;
        status?: boolean;
      }
    ) => {
      try {
        // Handle special commands first
        if (options.listFilters) {
          console.log("Available text filters:");
          for (const [name, _] of Object.entries(TEXT_FILTERS)) {
            const isDefault = DEFAULT_FILTERS.includes(name);
            console.log(`  ${name}${isDefault ? " (default)" : ""}`);
          }
          console.log("\nUsage:");
          console.log("  --filter markdown-links,inline-code  Apply specific filters");
          console.log("  --no-filter                          Disable all filters");
          return;
        }

        if (options.listVoices) {
          console.log("Available voices:");
          VOICES.forEach((v) => {
            const marker = v === DEFAULT_VOICE ? " (default)" : "";
            console.log(`  ${v}${marker}`);
          });
          return;
        }

        if (options.stop) {
          stopPlayback();
          return;
        }

        if (options.status) {
          if (!options.dir) {
            console.error("Error: --status requires -d/--dir");
            process.exit(1);
          }
          await showStatus(options.dir);
          return;
        }

        if (options.resume) {
          if (!options.dir) {
            console.error("Error: --resume requires -d/--dir");
            process.exit(1);
          }
          const rate = parseFloat(options.rate);
          if (isNaN(rate) || rate < 0.25 || rate > 4.0) {
            console.error(`Error: Invalid rate '${options.rate}'. Must be between 0.25 and 4.0`);
            process.exit(1);
          }
          await resumePlayback(options.dir, rate);
          return;
        }

        // Get text from various sources
        let text = textArg;

        if (options.file) {
          if (options.file === "-") {
            text = await Bun.stdin.text();
          } else {
            const file = Bun.file(options.file);
            if (!(await file.exists())) {
              console.error(`Error: File not found: ${options.file}`);
              process.exit(1);
            }
            text = await file.text();
          }
        } else if (!text && !process.stdin.isTTY) {
          text = await Bun.stdin.text();
        }

        if (!text || !text.trim()) {
          program.help();
          return;
        }

        // Determine which filters to apply
        let filtersToApply: string[] = [];
        if (options.filter === false) {
          // --no-filter: disable all filters
          filtersToApply = [];
        } else if (typeof options.filter === "string") {
          // --filter list: use specified filters
          filtersToApply = options.filter.split(",").map((f) => f.trim());
        } else {
          // Default: apply all default filters
          filtersToApply = DEFAULT_FILTERS;
        }

        // Apply text filters
        if (filtersToApply.length > 0) {
          text = applyFilters(text, filtersToApply);
        }

        // Validate voice
        if (!VOICES.includes(options.voice as Voice)) {
          console.error(`Error: Invalid voice '${options.voice}'. Choose from: ${VOICES.join(", ")}`);
          process.exit(1);
        }

        // Validate and parse playback rate
        const rate = parseFloat(options.rate);
        if (isNaN(rate) || rate < 0.25 || rate > 4.0) {
          console.error(`Error: Invalid rate '${options.rate}'. Must be between 0.25 and 4.0`);
          process.exit(1);
        }

        // Chunked mode or simple mode
        if (options.chunked) {
          if (!options.dir) {
            console.error("Error: --chunked requires -d/--dir");
            process.exit(1);
          }
          await chunkedSpeak(text, options.dir, options.voice as Voice, options.model, rate, options.generateOnly);
        } else {
          await speak(text, options.voice as Voice, options.model, rate, options.output);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error: ${message}`);
        process.exit(1);
      }
    }
  );

program.parse();
