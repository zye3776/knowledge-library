#!/usr/bin/env bun

/**
 * OpenAI TTS CLI - Command-line interface for text-to-speech
 *
 * This file handles CLI parsing only. All functionality is in src/
 */

import { unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Command } from "commander";

import {
	applyFilters,
	// Playback
	chunkedSpeak,
	// TTS
	createClient,
	DEFAULT_FILTERS,
	DEFAULT_MODEL,
	DEFAULT_SPEED,
	// Constants
	DEFAULT_VOICE,
	generateSpeech,
	getPlaybackStatus,
	// Player
	getPlayer,
	MAX_RATE,
	MIN_RATE,
	requireApiKey,
	resumePlayback,
	stopPlayback,
	// Filters
	TEXT_FILTERS,
	// Types
	VOICES,
	type Voice,
} from "./src";

// Global flag for graceful shutdown
let stopRequested = false;

const shouldStop = () => stopRequested;

// Setup signal handlers
process.on("SIGINT", () => {
	stopRequested = true;
	console.error("\n⏸️  Playback paused. Use --resume to continue.");
});

process.on("SIGTERM", () => {
	stopRequested = true;
});

// Simple TTS (single file mode)
async function speakSimple(
	text: string,
	voice: Voice,
	model: string,
	rate: number,
	outputFile?: string,
): Promise<void> {
	const apiKey = requireApiKey();
	const client = createClient(apiKey);
	const buffer = await generateSpeech(client, text, voice, model);

	if (outputFile) {
		await Bun.write(outputFile, buffer);
		console.log(`Audio saved to: ${outputFile}`);
	} else {
		const tmpPath = join(tmpdir(), `speech-${Date.now()}.mp3`);
		await Bun.write(tmpPath, buffer);

		try {
			const player = getPlayer();
			await player.play(tmpPath, rate);
		} finally {
			try {
				await unlink(tmpPath);
			} catch {
				// Ignore cleanup errors
			}
		}
	}
}

// CLI setup
const program = new Command();

program
	.name("speak")
	.description("OpenAI TTS - Convert text to speech (say-command compatible)")
	.argument("[text]", "Text to speak")
	.option("-f, --file <file>", "Read text from file")
	.option(
		"-v, --voice <voice>",
		`Voice to use (default: ${DEFAULT_VOICE})`,
		DEFAULT_VOICE,
	)
	.option("-o, --output <file>", "Save audio to file instead of playing")
	.option(
		"--model <model>",
		`Model to use (default: ${DEFAULT_MODEL})`,
		DEFAULT_MODEL,
	)
	.option(
		"-r, --rate <rate>",
		`Playback rate ${MIN_RATE}-${MAX_RATE} (default: ${DEFAULT_SPEED})`,
		String(DEFAULT_SPEED),
	)
	.option(
		"--filter <filters>",
		"Comma-separated list of filters to apply (default: all)",
	)
	.option("--no-filter", "Disable all text filters")
	.option("--list-filters", "List available text filters")
	.option("--list-voices", "List available voices")
	.option(
		"--chunked",
		"Enable paragraph-by-paragraph audio generation and playback",
	)
	.option("-d, --dir <dir>", "Output directory for chunked audio files")
	.option(
		"--generate-only",
		"Only generate audio files, don't play (use with --chunked)",
	)
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
			},
		) => {
			try {
				// Handle special commands first
				if (options.listFilters) {
					console.log("Available text filters:");
					for (const [name] of Object.entries(TEXT_FILTERS)) {
						const isDefault = DEFAULT_FILTERS.includes(name);
						console.log(`  ${name}${isDefault ? " (default)" : ""}`);
					}
					console.log("\nUsage:");
					console.log(
						"  --filter markdown-links,inline-code  Apply specific filters",
					);
					console.log(
						"  --no-filter                          Disable all filters",
					);
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
					console.error("⏹️  Playback stopped.");
					return;
				}

				if (options.status) {
					if (!options.dir) {
						console.error("Error: --status requires -d/--dir");
						process.exit(1);
					}
					const state = await getPlaybackStatus(options.dir);
					if (state) {
						console.log(`Status: ${state.status}`);
						console.log(
							`Progress: ${state.current_paragraph}/${state.total_paragraphs}`,
						);
						console.log(`Last updated: ${state.last_updated || "unknown"}`);
					} else {
						console.log("No playback state found.");
					}
					return;
				}

				if (options.resume) {
					if (!options.dir) {
						console.error("Error: --resume requires -d/--dir");
						process.exit(1);
					}
					const rate = parseFloat(options.rate);
					if (Number.isNaN(rate) || rate < MIN_RATE || rate > MAX_RATE) {
						console.error(
							`Error: Invalid rate '${options.rate}'. Must be between ${MIN_RATE} and ${MAX_RATE}`,
						);
						process.exit(1);
					}
					await resumePlayback(options.dir, rate, shouldStop);
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
					console.error(
						`Error: Invalid voice '${options.voice}'. Choose from: ${VOICES.join(", ")}`,
					);
					process.exit(1);
				}

				// Validate and parse playback rate
				const rate = parseFloat(options.rate);
				if (Number.isNaN(rate) || rate < MIN_RATE || rate > MAX_RATE) {
					console.error(
						`Error: Invalid rate '${options.rate}'. Must be between ${MIN_RATE} and ${MAX_RATE}`,
					);
					process.exit(1);
				}

				// Chunked mode or simple mode
				if (options.chunked) {
					if (!options.dir) {
						console.error("Error: --chunked requires -d/--dir");
						process.exit(1);
					}
					await chunkedSpeak({
						text,
						outputDir: options.dir,
						voice: options.voice as Voice,
						model: options.model,
						rate,
						generateOnly: options.generateOnly,
						shouldStop,
					});
				} else {
					await speakSimple(
						text,
						options.voice as Voice,
						options.model,
						rate,
						options.output,
					);
				}
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);
				console.error(`Error: ${message}`);
				process.exit(1);
			}
		},
	);

program.parse();
