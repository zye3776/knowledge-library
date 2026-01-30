/**
 * TTS Skill - Core functionality
 *
 * Framework-agnostic TTS capabilities for OpenAI's text-to-speech API.
 * Use this module to build TTS features into any application.
 */

// Constants
export {
	DEFAULT_MODEL,
	DEFAULT_SPEED,
	DEFAULT_VOICE,
	FALLBACK_DURATION_SECONDS,
	MAX_RATE,
	MIN_RATE,
} from "./constants";
// Text filters
export {
	applyFilters,
	DEFAULT_FILTERS,
	getAvailableFilters,
	isValidFilter,
	TEXT_FILTERS,
} from "./filters";
export type { ChunkedSpeakOptions, StopCheck } from "./playback";
// Playback orchestration
export {
	chunkedSpeak,
	getPlaybackStatus,
	playParagraphs,
	resumePlayback,
	stopPlayback,
} from "./playback";
// Audio player
export { AfplayPlayer, createPlayer, getPlayer } from "./player";

// State management
export {
	loadParagraphsMeta,
	loadPlaybackState,
	saveParagraphsMeta,
	savePlaybackState,
} from "./state";
// Text utilities
export { createProgressBar, formatTime, splitIntoParagraphs } from "./text";

// TTS generation
export {
	createClient,
	generateParagraphsAudio,
	generateSpeech,
	generateSpeechToFile,
	getApiKey,
	requireApiKey,
} from "./tts";
// Types
export type {
	AudioPlayer,
	ChunkedPlaybackOptions,
	ParagraphsMeta,
	PlaybackState,
	TextFilter,
	TTSOptions,
	Voice,
} from "./types";
export { VOICES } from "./types";
