/**
 * Default values and constants
 */

import type { Voice } from "./types";

export const DEFAULT_VOICE: Voice = "nova";
export const DEFAULT_MODEL = "tts-1";
export const DEFAULT_SPEED = 1.0;

// Rate limits for playback speed
export const MIN_RATE = 0.25;
export const MAX_RATE = 4.0;

// Fallback audio duration estimate when unable to determine
export const FALLBACK_DURATION_SECONDS = 3.0;
