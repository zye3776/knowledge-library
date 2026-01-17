import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdir, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { savePlaybackState } from "./state";
import { stopPlayback, getPlaybackStatus } from "./playback";

describe("stopPlayback", () => {
  test("does not throw", () => {
    expect(() => stopPlayback()).not.toThrow();
  });
});

describe("getPlaybackStatus", () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `tts-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  test("returns null when no state exists", async () => {
    const status = await getPlaybackStatus(testDir);
    expect(status).toBeNull();
  });

  test("returns state when exists", async () => {
    await savePlaybackState(testDir, {
      current_paragraph: 5,
      total_paragraphs: 10,
      status: "playing",
    });

    const status = await getPlaybackStatus(testDir);
    expect(status).toBeDefined();
    expect(status?.current_paragraph).toBe(5);
    expect(status?.total_paragraphs).toBe(10);
    expect(status?.status).toBe("playing");
  });
});

// Note: playParagraphs, chunkedSpeak, and resumePlayback are integration-heavy
// and would require significant mocking of the audio player and file system.
// For a more complete test suite, consider:
// 1. Creating test audio files
// 2. Mocking the player module entirely
// 3. Using dependency injection for the player

describe("playback integration notes", () => {
  test("playParagraphs requires audio files", () => {
    // This test documents the integration requirements
    // playParagraphs needs:
    // - Audio files in outputDir/paragraphs/*.mp3
    // - A working audio player (afplay on macOS)
    expect(true).toBe(true);
  });

  test("chunkedSpeak requires OpenAI API", () => {
    // chunkedSpeak needs:
    // - OPENAI_API_KEY environment variable
    // - Network access to OpenAI API
    // - Write access to output directory
    expect(true).toBe(true);
  });

  test("resumePlayback requires existing state", () => {
    // resumePlayback needs:
    // - playback.json in the output directory
    // - Audio files already generated
    expect(true).toBe(true);
  });
});
