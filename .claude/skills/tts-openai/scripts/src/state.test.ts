import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	loadParagraphsMeta,
	loadPlaybackState,
	saveParagraphsMeta,
	savePlaybackState,
} from "./state";
import type { PlaybackState } from "./types";

describe("state management", () => {
	let testDir: string;

	beforeEach(async () => {
		testDir = join(
			tmpdir(),
			`tts-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		);
		await mkdir(testDir, { recursive: true });
	});

	afterEach(async () => {
		try {
			await rm(testDir, { recursive: true, force: true });
		} catch {
			// Ignore cleanup errors
		}
	});

	describe("loadPlaybackState", () => {
		test("returns null for non-existent state", async () => {
			const state = await loadPlaybackState(testDir);
			expect(state).toBeNull();
		});

		test("loads existing state", async () => {
			const stateData: PlaybackState = {
				current_paragraph: 5,
				total_paragraphs: 10,
				status: "playing",
				last_updated: "2024-01-01T00:00:00.000Z",
			};
			await Bun.write(
				join(testDir, "playback.json"),
				JSON.stringify(stateData),
			);

			const state = await loadPlaybackState(testDir);
			expect(state).toEqual(stateData);
		});

		test("returns null for invalid JSON", async () => {
			await Bun.write(join(testDir, "playback.json"), "invalid json");
			const state = await loadPlaybackState(testDir);
			expect(state).toBeNull();
		});
	});

	describe("savePlaybackState", () => {
		test("saves state to disk", async () => {
			const state: PlaybackState = {
				current_paragraph: 3,
				total_paragraphs: 7,
				status: "generating",
			};

			await savePlaybackState(testDir, state);

			const file = Bun.file(join(testDir, "playback.json"));
			const saved = await file.json();
			expect(saved.current_paragraph).toBe(3);
			expect(saved.total_paragraphs).toBe(7);
			expect(saved.status).toBe("generating");
		});

		test("adds last_updated timestamp", async () => {
			const state: PlaybackState = {
				current_paragraph: 0,
				total_paragraphs: 5,
				status: "ready",
			};

			await savePlaybackState(testDir, state);

			const file = Bun.file(join(testDir, "playback.json"));
			const saved = await file.json();
			expect(saved.last_updated).toBeDefined();
			expect(new Date(saved.last_updated).getTime()).toBeGreaterThan(0);
		});

		test("overwrites existing state", async () => {
			const state1: PlaybackState = {
				current_paragraph: 1,
				total_paragraphs: 10,
				status: "playing",
			};
			const state2: PlaybackState = {
				current_paragraph: 5,
				total_paragraphs: 10,
				status: "playing",
			};

			await savePlaybackState(testDir, state1);
			await savePlaybackState(testDir, state2);

			const loaded = await loadPlaybackState(testDir);
			expect(loaded?.current_paragraph).toBe(5);
		});
	});

	describe("loadParagraphsMeta", () => {
		test("returns null for non-existent meta", async () => {
			const meta = await loadParagraphsMeta(testDir);
			expect(meta).toBeNull();
		});

		test("loads existing meta", async () => {
			const metaData = {
				total: 3,
				paragraphs: ["One", "Two", "Three"],
				voice: "nova",
				model: "tts-1",
				generated: "2024-01-01T00:00:00.000Z",
			};
			await Bun.write(
				join(testDir, "paragraphs.json"),
				JSON.stringify(metaData),
			);

			const meta = await loadParagraphsMeta(testDir);
			expect(meta).toEqual(metaData);
		});
	});

	describe("saveParagraphsMeta", () => {
		test("saves paragraphs metadata", async () => {
			const paragraphs = ["First.", "Second.", "Third."];

			await saveParagraphsMeta(testDir, paragraphs, "echo", "tts-1-hd");

			const file = Bun.file(join(testDir, "paragraphs.json"));
			const saved = await file.json();
			expect(saved.total).toBe(3);
			expect(saved.paragraphs).toEqual(paragraphs);
			expect(saved.voice).toBe("echo");
			expect(saved.model).toBe("tts-1-hd");
			expect(saved.generated).toBeDefined();
		});
	});
});
