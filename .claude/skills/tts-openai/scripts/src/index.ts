/**
 * TTS Skill - Core functionality
 *
 * Framework-agnostic TTS capabilities for OpenAI's text-to-speech API.
 * Use this module to build TTS features into any application.
 */

// Types
export type {
  Voice,
  TextFilter,
  PlaybackState,
  ParagraphsMeta,
  AudioPlayer,
  TTSOptions,
  ChunkedPlaybackOptions,
} from "./types";
export { VOICES } from "./types";

// Constants
export {
  DEFAULT_VOICE,
  DEFAULT_MODEL,
  DEFAULT_SPEED,
  MIN_RATE,
  MAX_RATE,
  FALLBACK_DURATION_SECONDS,
} from "./constants";

// Text filters
export {
  TEXT_FILTERS,
  DEFAULT_FILTERS,
  applyFilters,
  getAvailableFilters,
  isValidFilter,
} from "./filters";

// Text utilities
export { splitIntoParagraphs, formatTime, createProgressBar } from "./text";

// State management
export {
  loadPlaybackState,
  savePlaybackState,
  loadParagraphsMeta,
  saveParagraphsMeta,
} from "./state";

// Audio player
export { AfplayPlayer, createPlayer, getPlayer } from "./player";

// TTS generation
export {
  createClient,
  generateSpeech,
  generateSpeechToFile,
  generateParagraphsAudio,
  getApiKey,
  requireApiKey,
} from "./tts";

// Playback orchestration
export {
  playParagraphs,
  chunkedSpeak,
  resumePlayback,
  stopPlayback,
  getPlaybackStatus,
} from "./playback";
export type { ChunkedSpeakOptions, StopCheck } from "./playback";
