/**
 * OpenAI TTS API integration
 *
 * Handles audio generation via OpenAI's text-to-speech API.
 * Framework-agnostic - can be used with any CLI or application framework.
 */

import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import OpenAI from "openai";
import type { Voice } from "./types";

/**
 * Create an OpenAI client
 */
export function createClient(apiKey: string): OpenAI {
	return new OpenAI({ apiKey });
}

/**
 * Generate speech audio from text
 * Returns the audio as a Buffer
 */
export async function generateSpeech(
	client: OpenAI,
	text: string,
	voice: Voice,
	model: string,
): Promise<Buffer> {
	const response = await client.audio.speech.create({
		model,
		voice,
		input: text,
	});

	return Buffer.from(await response.arrayBuffer());
}

/**
 * Generate speech and save to file
 */
export async function generateSpeechToFile(
	client: OpenAI,
	text: string,
	voice: Voice,
	model: string,
	outputPath: string,
): Promise<void> {
	const buffer = await generateSpeech(client, text, voice, model);
	await Bun.write(outputPath, buffer);
}

/**
 * Progress callback for paragraph generation
 */
export type ProgressCallback = (current: number, total: number) => void;

/**
 * Stop callback - return true to stop generation
 */
export type StopCheck = () => boolean;

/**
 * Generate audio for multiple paragraphs
 *
 * @param client OpenAI client
 * @param paragraphs Array of text paragraphs
 * @param outputDir Directory to save audio files
 * @param voice Voice to use
 * @param model Model to use
 * @param startFrom Skip paragraphs before this index
 * @param onProgress Progress callback
 * @param shouldStop Function to check if generation should stop
 */
export async function generateParagraphsAudio(
	client: OpenAI,
	paragraphs: string[],
	outputDir: string,
	voice: Voice,
	model: string,
	startFrom: number = 0,
	onProgress?: ProgressCallback,
	shouldStop?: StopCheck,
): Promise<void> {
	const paragraphsDir = join(outputDir, "paragraphs");
	await mkdir(paragraphsDir, { recursive: true });

	const total = paragraphs.length;

	for (let i = 0; i < paragraphs.length; i++) {
		if (i < startFrom) continue;
		if (shouldStop?.()) break;

		const paraNum = i + 1;
		const audioFile = join(
			paragraphsDir,
			`${paraNum.toString().padStart(3, "0")}.mp3`,
		);

		// Skip if already generated
		if (await Bun.file(audioFile).exists()) continue;

		onProgress?.(paraNum, total);

		await generateSpeechToFile(client, paragraphs[i], voice, model, audioFile);
	}
}

/**
 * Check if API key is available
 */
export function getApiKey(): string | undefined {
	return process.env.OPENAI_API_KEY;
}

/**
 * Validate API key exists
 * @throws Error if API key is not set
 */
export function requireApiKey(): string {
	const apiKey = getApiKey();
	if (!apiKey) {
		throw new Error("OPENAI_API_KEY environment variable not set");
	}
	return apiKey;
}
