/**
 * Chunked playback orchestration
 *
 * Manages paragraph-by-paragraph audio playback with progress tracking,
 * state persistence, and resumability.
 */

import { mkdir, readdir } from "fs/promises";
import { join } from "path";
import { getPlayer } from "./player";
import {
	loadPlaybackState,
	saveParagraphsMeta,
	savePlaybackState,
} from "./state";
import { createProgressBar, formatTime, splitIntoParagraphs } from "./text";
import { createClient, generateParagraphsAudio, requireApiKey } from "./tts";
import type { PlaybackState, Voice } from "./types";

/**
 * Stop check callback - return true to stop playback
 */
export type StopCheck = () => boolean;

/**
 * Play audio files sequentially with progress display
 *
 * @returns The last paragraph index played
 */
export async function playParagraphs(
	outputDir: string,
	startFrom: number = 0,
	rate: number = 1.0,
	shouldStop?: StopCheck,
): Promise<number> {
	const paragraphsDir = join(outputDir, "paragraphs");
	const player = getPlayer();

	try {
		const files = await readdir(paragraphsDir);
		const audioFiles = files.filter((f) => f.endsWith(".mp3")).sort();
		const total = audioFiles.length;

		if (total === 0) {
			throw new Error("No audio files found");
		}

		// Calculate durations (adjusted for playback rate)
		process.stderr.write("Calculating duration...\r");
		const durations = audioFiles.map(
			(f) => player.getDuration(join(paragraphsDir, f)) / rate,
		);

		let current = startFrom;

		for (let i = 0; i < audioFiles.length; i++) {
			if (i < startFrom) continue;
			if (shouldStop?.()) {
				process.stderr.write("\n");
				return current;
			}

			current = i;
			const paraNum = i + 1;
			const timeRemaining = durations.slice(i).reduce((a, b) => a + b, 0);

			// Progress bar
			const bar = createProgressBar(paraNum, total);
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
				await player.play(audioFile, rate);

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
		process.stderr.write(
			`\r[${completedBar}] ✅ Complete (${total} paragraphs)           \n`,
		);

		await savePlaybackState(outputDir, {
			current_paragraph: total,
			total_paragraphs: total,
			status: "completed",
		});

		return total;
	} catch (error) {
		if (error instanceof Error && error.message === "No audio files found") {
			throw error;
		}
		throw new Error("No paragraphs directory found");
	}
}

/**
 * Options for chunked speech generation and playback
 */
export interface ChunkedSpeakOptions {
	text: string;
	outputDir: string;
	voice: Voice;
	model: string;
	rate: number;
	generateOnly?: boolean;
	shouldStop?: StopCheck;
}

/**
 * Generate and play audio in chunks (paragraph by paragraph)
 */
export async function chunkedSpeak(
	options: ChunkedSpeakOptions,
): Promise<void> {
	const { text, outputDir, voice, model, rate, generateOnly, shouldStop } =
		options;

	const apiKey = requireApiKey();
	await mkdir(outputDir, { recursive: true });

	const paragraphs = splitIntoParagraphs(text);
	if (paragraphs.length === 0) {
		throw new Error("No paragraphs found in text");
	}

	console.error(`📄 Split into ${paragraphs.length} paragraphs.`);

	// Save paragraphs metadata
	await saveParagraphsMeta(outputDir, paragraphs, voice, model);

	// Initialize playback state
	await savePlaybackState(outputDir, {
		current_paragraph: 0,
		total_paragraphs: paragraphs.length,
		status: "generating",
	});

	// Generate audio
	const client = createClient(apiKey);
	await generateParagraphsAudio(
		client,
		paragraphs,
		outputDir,
		voice,
		model,
		0,
		(current, total) => {
			process.stderr.write(`\r🎙️  Generating audio ${current}/${total}...`);
		},
		shouldStop,
	);
	process.stderr.write("\n");

	if (shouldStop?.()) return;

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
	await playParagraphs(outputDir, 0, rate, shouldStop);
}

/**
 * Resume playback from last saved position
 */
export async function resumePlayback(
	outputDir: string,
	rate: number = 1.0,
	shouldStop?: StopCheck,
): Promise<void> {
	const state = await loadPlaybackState(outputDir);

	if (!state) {
		throw new Error("No playback state found. Use --chunked to start.");
	}

	if (state.status === "completed") {
		console.error("✅ Playback already completed. Starting from beginning.");
		await playParagraphs(outputDir, 0, rate, shouldStop);
	} else {
		console.error(
			`▶️  Resuming from paragraph ${state.current_paragraph + 1}/${state.total_paragraphs}...`,
		);
		await playParagraphs(outputDir, state.current_paragraph, rate, shouldStop);
	}
}

/**
 * Stop any currently playing audio
 */
export function stopPlayback(): void {
	const player = getPlayer();
	player.stop();
}

/**
 * Get current playback status
 */
export async function getPlaybackStatus(
	outputDir: string,
): Promise<PlaybackState | null> {
	return loadPlaybackState(outputDir);
}
