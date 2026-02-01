import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
	checkDownstreamContent,
	countWords,
	findLibraryEntry,
	parseSrt,
	parseTranscriptFrontmatter,
	parseVtt,
	parseYtDlpError,
	validateYouTubeUrl,
} from "./extract.ts";

describe("validateYouTubeUrl", () => {
	describe("accepts valid YouTube URLs", () => {
		test("youtube.com/watch?v=ID format", () => {
			const result = validateYouTubeUrl(
				"https://www.youtube.com/watch?v=jNQXAC9IVRw",
			);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.data.videoId).toBe("jNQXAC9IVRw");
				expect(result.data.url).toBe(
					"https://www.youtube.com/watch?v=jNQXAC9IVRw",
				);
			}
		});

		test("youtube.com/watch?v=ID without www", () => {
			const result = validateYouTubeUrl(
				"https://youtube.com/watch?v=jNQXAC9IVRw",
			);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.data.videoId).toBe("jNQXAC9IVRw");
			}
		});

		test("youtu.be/ID format", () => {
			const result = validateYouTubeUrl("https://youtu.be/jNQXAC9IVRw");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.data.videoId).toBe("jNQXAC9IVRw");
			}
		});

		test("youtube.com/shorts/ID format", () => {
			const result = validateYouTubeUrl(
				"https://www.youtube.com/shorts/jNQXAC9IVRw",
			);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.data.videoId).toBe("jNQXAC9IVRw");
			}
		});

		test("http protocol (not just https)", () => {
			const result = validateYouTubeUrl(
				"http://www.youtube.com/watch?v=jNQXAC9IVRw",
			);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.data.videoId).toBe("jNQXAC9IVRw");
			}
		});

		test("URL with extra query params", () => {
			const result = validateYouTubeUrl(
				"https://www.youtube.com/watch?v=jNQXAC9IVRw&t=120",
			);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.data.videoId).toBe("jNQXAC9IVRw");
			}
		});

		test("URL with whitespace trimmed", () => {
			const result = validateYouTubeUrl(
				"  https://www.youtube.com/watch?v=jNQXAC9IVRw  ",
			);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.data.videoId).toBe("jNQXAC9IVRw");
			}
		});

		test("video ID with underscores and hyphens", () => {
			const result = validateYouTubeUrl(
				"https://www.youtube.com/watch?v=dQw4w9WgXcQ",
			);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.data.videoId).toBe("dQw4w9WgXcQ");
			}
		});
	});

	describe("rejects invalid URLs", () => {
		test("empty string", () => {
			const result = validateYouTubeUrl("");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("invalid_url");
			}
		});

		test("whitespace only", () => {
			const result = validateYouTubeUrl("   ");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("invalid_url");
			}
		});

		test("non-YouTube URL", () => {
			const result = validateYouTubeUrl("https://vimeo.com/12345");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("invalid_url");
			}
		});

		test("malformed URL", () => {
			const result = validateYouTubeUrl("not-a-url");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("invalid_url");
			}
		});

		test("YouTube URL without video ID", () => {
			const result = validateYouTubeUrl("https://www.youtube.com/watch");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("invalid_url");
			}
		});

		test("YouTube URL with invalid video ID length", () => {
			const result = validateYouTubeUrl(
				"https://www.youtube.com/watch?v=short",
			);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("invalid_url");
			}
		});

		test("YouTube channel URL (not video)", () => {
			const result = validateYouTubeUrl("https://www.youtube.com/@channelname");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("invalid_url");
			}
		});

		test("YouTube playlist URL (not video)", () => {
			const result = validateYouTubeUrl(
				"https://www.youtube.com/playlist?list=PLtest123",
			);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("invalid_url");
			}
		});
	});
});

describe("parseVtt", () => {
	test("strips WEBVTT header", () => {
		const vtt = `WEBVTT
Kind: captions
Language: en

00:00:00.000 --> 00:00:02.500
Hello world`;
		const result = parseVtt(vtt);
		expect(result).not.toContain("WEBVTT");
		expect(result).not.toContain("Kind:");
		expect(result).not.toContain("Language:");
	});

	test("removes timestamp lines", () => {
		const vtt = `WEBVTT

00:00:00.000 --> 00:00:02.500
Hello world
00:00:02.500 --> 00:00:05.000
Goodbye world`;
		const result = parseVtt(vtt);
		expect(result).not.toContain("-->");
		expect(result).not.toContain("00:00");
	});

	test("removes position markers", () => {
		const vtt = `WEBVTT

00:00:00.000 --> 00:00:02.500 position:50%
Hello world
00:00:02.500 --> 00:00:05.000 align:middle
Goodbye world`;
		const result = parseVtt(vtt);
		expect(result).not.toContain("position:");
		expect(result).not.toContain("align:");
	});

	test("deduplicates repeated lines (auto-subs quirk)", () => {
		const vtt = `WEBVTT

00:00:00.000 --> 00:00:02.500
Hello world

00:00:02.500 --> 00:00:05.000
Hello world
Goodbye world`;
		const result = parseVtt(vtt);
		const lines = result.split("\n").filter((l) => l.trim());
		// "Hello world" should appear only once
		expect(lines.filter((l) => l === "Hello world").length).toBe(1);
		expect(lines).toContain("Goodbye world");
	});

	test("preserves distinct lines", () => {
		const vtt = `WEBVTT

00:00:00.000 --> 00:00:02.500
First line

00:00:02.500 --> 00:00:05.000
Second line

00:00:05.000 --> 00:00:07.000
Third line`;
		const result = parseVtt(vtt);
		expect(result).toContain("First line");
		expect(result).toContain("Second line");
		expect(result).toContain("Third line");
	});

	test("strips HTML tags", () => {
		const vtt = `WEBVTT

00:00:00.000 --> 00:00:02.500
<c>Hello</c> <b>world</b>`;
		const result = parseVtt(vtt);
		expect(result).not.toContain("<c>");
		expect(result).not.toContain("</c>");
		expect(result).not.toContain("<b>");
		expect(result).not.toContain("</b>");
		expect(result).toContain("Hello");
		expect(result).toContain("world");
	});

	test("handles empty input", () => {
		const result = parseVtt("");
		expect(result).toBe("");
	});

	test("handles VTT with only header", () => {
		const vtt = `WEBVTT
Kind: captions
Language: en`;
		const result = parseVtt(vtt);
		expect(result).toBe("");
	});
});

describe("parseSrt", () => {
	test("removes sequence numbers", () => {
		const srt = `1
00:00:00,000 --> 00:00:02,500
Hello world

2
00:00:02,500 --> 00:00:05,000
Goodbye world`;
		const result = parseSrt(srt);
		expect(result).not.toMatch(/^1$/m);
		expect(result).not.toMatch(/^2$/m);
	});

	test("removes timestamp lines", () => {
		const srt = `1
00:00:00,000 --> 00:00:02,500
Hello world`;
		const result = parseSrt(srt);
		expect(result).not.toContain("-->");
		expect(result).not.toContain("00:00");
	});

	test("deduplicates repeated lines", () => {
		const srt = `1
00:00:00,000 --> 00:00:02,500
Hello world

2
00:00:02,500 --> 00:00:05,000
Hello world
Goodbye world`;
		const result = parseSrt(srt);
		const lines = result.split("\n").filter((l) => l.trim());
		expect(lines.filter((l) => l === "Hello world").length).toBe(1);
	});

	test("strips HTML tags", () => {
		const srt = `1
00:00:00,000 --> 00:00:02,500
<i>Hello</i> world`;
		const result = parseSrt(srt);
		expect(result).not.toContain("<i>");
		expect(result).not.toContain("</i>");
		expect(result).toContain("Hello");
	});

	test("handles empty input", () => {
		const result = parseSrt("");
		expect(result).toBe("");
	});
});

describe("parseYtDlpError", () => {
	test("identifies no subtitles error", () => {
		const stderr =
			"ERROR: [youtube] jNQXAC9IVRw: There are no subtitles for the requested languages";
		const result = parseYtDlpError(stderr);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("no_subtitles");
		}
	});

	test("identifies no automatic captions error", () => {
		const stderr =
			"ERROR: [youtube] jNQXAC9IVRw: No automatic captions for this video";
		const result = parseYtDlpError(stderr);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("no_subtitles");
		}
	});

	test("identifies video unavailable error", () => {
		const stderr =
			"ERROR: [youtube] jNQXAC9IVRw: Video unavailable. This video is no longer available";
		const result = parseYtDlpError(stderr);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("video_unavailable");
		}
	});

	test("identifies private video error", () => {
		const stderr =
			"ERROR: [youtube] jNQXAC9IVRw: Private video. Sign in if you've been granted access";
		const result = parseYtDlpError(stderr);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("video_unavailable");
		}
	});

	test("identifies network error", () => {
		const stderr =
			"ERROR: Unable to download webpage: <urlopen error [Errno 8] nodename nor servname provided>";
		const result = parseYtDlpError(stderr);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("network_error");
		}
	});

	test("identifies connection error", () => {
		const stderr = "ERROR: Connection reset by peer";
		const result = parseYtDlpError(stderr);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("network_error");
		}
	});

	test("identifies bot detection / sign in required", () => {
		const stderr =
			"ERROR: [youtube] jNQXAC9IVRw: Sign in to confirm you're not a bot. Use --cookies-from-browser";
		const result = parseYtDlpError(stderr);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("yt_dlp_error");
			if (result.error.type === "yt_dlp_error") {
				expect(result.error.message).toContain("authentication");
			}
		}
	});

	test("identifies cookies requirement", () => {
		const stderr = "ERROR: [youtube] Requires cookies for authentication";
		const result = parseYtDlpError(stderr);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("yt_dlp_error");
			if (result.error.type === "yt_dlp_error") {
				expect(result.error.message).toContain("authentication");
			}
		}
	});

	test("returns generic error for unknown errors", () => {
		const stderr = "ERROR: Some unknown error occurred";
		const result = parseYtDlpError(stderr);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("yt_dlp_error");
			if (result.error.type === "yt_dlp_error") {
				expect(result.error.details).toContain("unknown error");
			}
		}
	});
});

// Re-extraction functionality tests
describe("findLibraryEntry", () => {
	const testDir = `/tmp/test-library-${Date.now()}`;

	beforeEach(async () => {
		await Bun.$`mkdir -p ${testDir}/test-video`.quiet();
		await Bun.write(
			`${testDir}/test-video/transcript.md`,
			`---
source_url: "https://www.youtube.com/watch?v=test123456"
source_type: youtube
slug: "test-video"
extracted_at: "2026-01-15T10:00:00Z"
stage: extracted
---

# Transcript

This is a test transcript.
`,
		);
	});

	afterEach(async () => {
		await Bun.$`rm -rf ${testDir}`.quiet().nothrow();
	});

	test("finds existing library entry", () => {
		const result = findLibraryEntry("test-video", testDir);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data).toBe(`${testDir}/test-video`);
		}
	});

	test("returns error for non-existent entry", () => {
		const result = findLibraryEntry("non-existent-slug", testDir);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("re_extract_error");
			expect(result.error.message).toContain("not found");
			expect(result.error.message).toContain("Use extract command");
		}
	});
});

describe("parseTranscriptFrontmatter", () => {
	test("parses valid frontmatter", () => {
		const content = `---
source_url: "https://www.youtube.com/watch?v=test123456"
source_type: youtube
slug: "test-video"
extracted_at: "2026-01-15T10:00:00Z"
stage: extracted
---

# Transcript

Content here.
`;
		const result = parseTranscriptFrontmatter(content);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.source_url).toBe(
				"https://www.youtube.com/watch?v=test123456",
			);
			expect(result.data.slug).toBe("test-video");
			expect(result.data.extracted_at).toBe("2026-01-15T10:00:00Z");
		}
	});

	test("parses frontmatter with re_extracted_at", () => {
		const content = `---
source_url: "https://www.youtube.com/watch?v=test123456"
source_type: youtube
slug: "test-video"
extracted_at: "2026-01-15T10:00:00Z"
re_extracted_at: "2026-01-20T14:30:00Z"
stage: extracted
---

# Transcript
`;
		const result = parseTranscriptFrontmatter(content);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.re_extracted_at).toBe("2026-01-20T14:30:00Z");
		}
	});

	test("returns error for content without frontmatter", () => {
		const content = "# Just a header\n\nNo frontmatter here.";
		const result = parseTranscriptFrontmatter(content);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("re_extract_error");
			expect(result.error.message).toContain("No frontmatter");
		}
	});

	test("returns error for missing required fields", () => {
		const content = `---
source_type: youtube
stage: extracted
---

# Transcript
`;
		const result = parseTranscriptFrontmatter(content);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("re_extract_error");
			expect(result.error.message).toContain("missing source_url or slug");
		}
	});
});

describe("checkDownstreamContent", () => {
	const testDir = `/tmp/test-downstream-${Date.now()}`;

	beforeEach(async () => {
		await Bun.$`mkdir -p ${testDir}`.quiet();
	});

	afterEach(async () => {
		await Bun.$`rm -rf ${testDir}`.quiet().nothrow();
	});

	test("returns empty array when no downstream content exists", async () => {
		const result = await checkDownstreamContent(testDir);
		expect(result).toEqual([]);
	});

	test("detects refined.md", async () => {
		await Bun.write(`${testDir}/refined.md`, "Refined content");
		const result = await checkDownstreamContent(testDir);
		expect(result).toContain("refined.md");
	});

	test("detects audio.mp3", async () => {
		await Bun.write(`${testDir}/audio.mp3`, "fake audio data");
		const result = await checkDownstreamContent(testDir);
		expect(result).toContain("audio.mp3");
	});

	test("detects both refined.md and audio.mp3", async () => {
		await Bun.write(`${testDir}/refined.md`, "Refined content");
		await Bun.write(`${testDir}/audio.mp3`, "fake audio data");
		const result = await checkDownstreamContent(testDir);
		expect(result).toContain("refined.md");
		expect(result).toContain("audio.mp3");
		expect(result.length).toBe(2);
	});
});

describe("countWords", () => {
	test("counts words in plain content", () => {
		const content = "This is a simple test with eight words here.";
		const count = countWords(content);
		expect(count).toBe(9);
	});

	test("counts words excluding frontmatter", () => {
		const content = `---
source_url: "https://example.com"
slug: "test"
---

# Transcript

This has five words here.
`;
		const count = countWords(content);
		// Words: "#", "Transcript", "This", "has", "five", "words", "here."
		expect(count).toBe(7);
	});

	test("handles empty content", () => {
		const count = countWords("");
		expect(count).toBe(0);
	});

	test("handles whitespace-only content", () => {
		const count = countWords("   \n\n   \t   ");
		expect(count).toBe(0);
	});
});
