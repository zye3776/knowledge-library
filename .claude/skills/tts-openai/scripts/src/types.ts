/**
 * Type definitions for TTS skill
 */

// Voice types supported by OpenAI TTS
export const VOICES = [
	"alloy",
	"echo",
	"fable",
	"onyx",
	"nova",
	"shimmer",
] as const;
export type Voice = (typeof VOICES)[number];

// Text filter function signature
export type TextFilter = (text: string) => string;

// Playback state persisted to disk
export interface PlaybackState {
	current_paragraph: number;
	total_paragraphs: number;
	status: "generating" | "ready" | "playing" | "completed";
	last_updated?: string;
}

// Metadata for chunked paragraphs
export interface ParagraphsMeta {
	total: number;
	paragraphs: string[];
	voice: string;
	model: string;
	generated: string;
}

// Audio player interface - implement this for different platforms
export interface AudioPlayer {
	/** Play an audio file with optional playback rate */
	play(filePath: string, rate?: number): Promise<void>;

	/** Stop all currently playing audio */
	stop(): void;

	/** Get duration of an audio file in seconds */
	getDuration(filePath: string): number;

	/** Check if this player is available on current platform */
	isAvailable(): boolean;
}

// TTS generation options
export interface TTSOptions {
	voice: Voice;
	model: string;
	apiKey: string;
}

// Chunked playback options
export interface ChunkedPlaybackOptions {
	outputDir: string;
	voice: Voice;
	model: string;
	rate: number;
	generateOnly?: boolean;
}
