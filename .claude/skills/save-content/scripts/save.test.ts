import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { generateSlug, saveContent } from "./save.ts";

describe("generateSlug", () => {
	describe("basic transformations", () => {
		test("converts to lowercase", () => {
			expect(generateSlug("Hello World")).toBe("hello-world");
		});

		test("replaces spaces with hyphens", () => {
			expect(generateSlug("hello world")).toBe("hello-world");
		});

		test("handles multiple spaces", () => {
			expect(generateSlug("hello   world")).toBe("hello-world");
		});
	});

	describe("special character handling", () => {
		test("removes special characters", () => {
			expect(generateSlug("What's Up? (2024)")).toBe("whats-up-2024");
		});

		test("removes apostrophes", () => {
			expect(generateSlug("It's a test")).toBe("its-a-test");
		});

		test("handles multiple hyphens", () => {
			expect(generateSlug("A  --  B")).toBe("a-b");
		});

		test("handles mixed punctuation", () => {
			expect(generateSlug("Hello! @World #2024")).toBe("hello-world-2024");
		});

		test("preserves numbers", () => {
			expect(generateSlug("Episode 123")).toBe("episode-123");
		});
	});

	describe("edge cases", () => {
		test("trims leading hyphens", () => {
			expect(generateSlug("--hello")).toBe("hello");
		});

		test("trims trailing hyphens", () => {
			expect(generateSlug("hello--")).toBe("hello");
		});

		test("trims both leading and trailing hyphens", () => {
			expect(generateSlug("--hello--")).toBe("hello");
		});

		test("returns error for empty string", () => {
			const result = generateSlug("");
			expect(result).toBeNull();
		});

		test("returns error for whitespace only", () => {
			const result = generateSlug("   ");
			expect(result).toBeNull();
		});

		test("returns error for special chars only", () => {
			const result = generateSlug("!@#$%^&*()");
			expect(result).toBeNull();
		});

		test("handles very long titles by truncating", () => {
			const longTitle = "a".repeat(200);
			const result = generateSlug(longTitle);
			expect(result).not.toBeNull();
			expect(result?.length).toBeLessThanOrEqual(100);
		});
	});

	describe("real-world examples", () => {
		test("typical YouTube title", () => {
			expect(
				generateSlug("How to Build an AI Agent in 2024 | Full Tutorial"),
			).toBe("how-to-build-an-ai-agent-in-2024-full-tutorial");
		});

		test("title with emojis", () => {
			expect(generateSlug("Amazing Video 🎉 Must Watch!")).toBe(
				"amazing-video-must-watch",
			);
		});

		test("title with quotes", () => {
			expect(generateSlug('"The Best" Video Ever')).toBe("the-best-video-ever");
		});
	});
});

describe("saveContent", () => {
	const testLibrariesPath = join(import.meta.dir, "..", ".test-libraries");

	beforeEach(async () => {
		await rm(testLibrariesPath, { recursive: true, force: true });
	});

	afterEach(async () => {
		await rm(testLibrariesPath, { recursive: true, force: true });
	});

	describe("folder creation (AC4)", () => {
		test("creates libraries folder if not exists", async () => {
			const result = await saveContent(
				{
					transcript: "Test transcript",
					url: "https://youtube.com/watch?v=test123",
					title: "Test Video",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(true);
			// Check directory exists by trying to read it
			const dirCheck =
				await Bun.$`test -d ${testLibrariesPath} && echo "exists"`.text();
			expect(dirCheck.trim()).toBe("exists");
		});

		test("creates slug subfolder", async () => {
			const result = await saveContent(
				{
					transcript: "Test transcript",
					url: "https://youtube.com/watch?v=test123",
					title: "Test Video",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const folderPath = join(testLibrariesPath, result.data.slug);
				const dirCheck =
					await Bun.$`test -d ${folderPath} && echo "exists"`.text();
				expect(dirCheck.trim()).toBe("exists");
			}
		});
	});

	describe("transcript saving (AC1)", () => {
		test("writes transcript.md file", async () => {
			const result = await saveContent(
				{
					transcript: "This is the transcript content.",
					url: "https://youtube.com/watch?v=abc123",
					title: "My Video",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const transcriptPath = join(
					testLibrariesPath,
					result.data.slug,
					"transcript.md",
				);
				const content = await Bun.file(transcriptPath).text();
				expect(content).toBe("This is the transcript content.");
			}
		});

		test("transcript path is correct in result", async () => {
			const result = await saveContent(
				{
					transcript: "Test",
					url: "https://youtube.com/watch?v=test",
					title: "Test",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.data.transcriptPath).toContain("transcript.md");
				expect(result.data.transcriptPath).toContain(result.data.slug);
			}
		});
	});

	describe("metadata saving (AC2)", () => {
		test("writes metadata.yaml file", async () => {
			const result = await saveContent(
				{
					transcript: "Test",
					url: "https://youtube.com/watch?v=xyz789",
					title: "Metadata Test Video",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const metadataPath = join(
					testLibrariesPath,
					result.data.slug,
					"metadata.yaml",
				);
				const content = await Bun.file(metadataPath).text();
				expect(content).toContain("source_url:");
				expect(content).toContain("https://youtube.com/watch?v=xyz789");
			}
		});

		test("metadata contains source_url", async () => {
			const result = await saveContent(
				{
					transcript: "Test",
					url: "https://youtube.com/watch?v=urltest",
					title: "URL Test",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const metadataPath = join(
					testLibrariesPath,
					result.data.slug,
					"metadata.yaml",
				);
				const content = await Bun.file(metadataPath).text();
				expect(content).toContain(
					'source_url: "https://youtube.com/watch?v=urltest"',
				);
			}
		});

		test("metadata contains title", async () => {
			const result = await saveContent(
				{
					transcript: "Test",
					url: "https://youtube.com/watch?v=test",
					title: "My Amazing Title",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const metadataPath = join(
					testLibrariesPath,
					result.data.slug,
					"metadata.yaml",
				);
				const content = await Bun.file(metadataPath).text();
				expect(content).toContain('title: "My Amazing Title"');
			}
		});

		test("metadata contains extracted_at timestamp", async () => {
			const beforeTime = new Date().toISOString().slice(0, 10);
			const result = await saveContent(
				{
					transcript: "Test",
					url: "https://youtube.com/watch?v=test",
					title: "Timestamp Test",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const metadataPath = join(
					testLibrariesPath,
					result.data.slug,
					"metadata.yaml",
				);
				const content = await Bun.file(metadataPath).text();
				expect(content).toContain("extracted_at:");
				// Check that timestamp contains today's date
				expect(content).toContain(beforeTime);
			}
		});

		test("metadata path is correct in result", async () => {
			const result = await saveContent(
				{
					transcript: "Test",
					url: "https://youtube.com/watch?v=test",
					title: "Path Test",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.data.metadataPath).toContain("metadata.yaml");
				expect(result.data.metadataPath).toContain(result.data.slug);
			}
		});
	});

	describe("slug generation (AC3)", () => {
		test("slug is URL-safe (lowercase, hyphens, numbers only)", async () => {
			const result = await saveContent(
				{
					transcript: "Test",
					url: "https://youtube.com/watch?v=test",
					title: "What's Up? (2024) - Full Episode!",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.data.slug).toMatch(/^[a-z0-9-]+$/);
				expect(result.data.slug).toBe("whats-up-2024-full-episode");
			}
		});
	});

	describe("overwrite behavior (AC5)", () => {
		test("overwrites existing transcript file", async () => {
			// First save
			await saveContent(
				{
					transcript: "Original content",
					url: "https://youtube.com/watch?v=overwrite",
					title: "Overwrite Test",
				},
				testLibrariesPath,
			);

			// Second save with same title (same slug)
			const result = await saveContent(
				{
					transcript: "New content",
					url: "https://youtube.com/watch?v=overwrite",
					title: "Overwrite Test",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const transcriptPath = join(
					testLibrariesPath,
					result.data.slug,
					"transcript.md",
				);
				const content = await Bun.file(transcriptPath).text();
				expect(content).toBe("New content");
				expect(content).not.toContain("Original");
			}
		});

		test("overwrites existing metadata file", async () => {
			// First save
			await saveContent(
				{
					transcript: "Test",
					url: "https://youtube.com/watch?v=old",
					title: "Overwrite Meta",
				},
				testLibrariesPath,
			);

			// Second save with new URL
			const result = await saveContent(
				{
					transcript: "Test",
					url: "https://youtube.com/watch?v=new",
					title: "Overwrite Meta",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const metadataPath = join(
					testLibrariesPath,
					result.data.slug,
					"metadata.yaml",
				);
				const content = await Bun.file(metadataPath).text();
				expect(content).toContain("new");
				expect(content).not.toContain("old");
			}
		});
	});

	describe("error handling", () => {
		test("returns error for empty transcript", async () => {
			const result = await saveContent(
				{
					transcript: "",
					url: "https://youtube.com/watch?v=test",
					title: "Empty Test",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("transcript");
			}
		});

		test("returns error for empty URL", async () => {
			const result = await saveContent(
				{
					transcript: "Test content",
					url: "",
					title: "Empty URL Test",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("URL");
			}
		});

		test("returns error for empty title", async () => {
			const result = await saveContent(
				{
					transcript: "Test content",
					url: "https://youtube.com/watch?v=test",
					title: "",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("title");
			}
		});

		test("returns error for title that produces empty slug", async () => {
			const result = await saveContent(
				{
					transcript: "Test content",
					url: "https://youtube.com/watch?v=test",
					title: "!@#$%",
				},
				testLibrariesPath,
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("slug");
			}
		});
	});
});
