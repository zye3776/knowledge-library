/**
 * Playback state management
 *
 * Persists playback progress to disk so playback can be resumed
 * after interruption.
 */

import { join } from "path";
import type { PlaybackState, ParagraphsMeta } from "./types";

const PLAYBACK_FILE = "playback.json";
const PARAGRAPHS_FILE = "paragraphs.json";

/**
 * Load playback state from disk
 */
export async function loadPlaybackState(
  outputDir: string
): Promise<PlaybackState | null> {
  const playbackFile = join(outputDir, PLAYBACK_FILE);
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

/**
 * Save playback state to disk
 */
export async function savePlaybackState(
  outputDir: string,
  state: PlaybackState
): Promise<void> {
  const playbackFile = join(outputDir, PLAYBACK_FILE);
  state.last_updated = new Date().toISOString();
  await Bun.write(playbackFile, JSON.stringify(state, null, 2));
}

/**
 * Load paragraphs metadata from disk
 */
export async function loadParagraphsMeta(
  outputDir: string
): Promise<ParagraphsMeta | null> {
  const metaFile = join(outputDir, PARAGRAPHS_FILE);
  try {
    const file = Bun.file(metaFile);
    if (await file.exists()) {
      return await file.json();
    }
  } catch {
    // File doesn't exist or invalid JSON
  }
  return null;
}

/**
 * Save paragraphs metadata to disk
 */
export async function saveParagraphsMeta(
  outputDir: string,
  paragraphs: string[],
  voice: string,
  model: string
): Promise<void> {
  const metaFile = join(outputDir, PARAGRAPHS_FILE);
  const meta: ParagraphsMeta = {
    total: paragraphs.length,
    paragraphs,
    voice,
    model,
    generated: new Date().toISOString(),
  };
  await Bun.write(metaFile, JSON.stringify(meta, null, 2));
}
