// Discriminated union Result type (KISS pattern)
type Result<T, E = string> = { ok: true; data: T } | { ok: false; error: E };

// Specific error types for better handling
type ExtractionError =
	| { type: "invalid_url"; message: string }
	| { type: "no_subtitles"; message: string }
	| { type: "network_error"; message: string }
	| { type: "video_unavailable"; message: string }
	| { type: "yt_dlp_not_found"; message: string }
	| { type: "yt_dlp_error"; message: string; details: string }
	| { type: "re_extract_error"; message: string };

// Metadata from transcript.md frontmatter
interface TranscriptMetadata {
	source_url: string;
	source_type: string;
	slug: string;
	extracted_at: string;
	re_extracted_at?: string;
	stage: string;
}

interface ExtractionResult {
	transcript: string;
	videoId: string;
}

const YOUTUBE_PATTERNS = [
	/^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
	/^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
	/^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

function validateYouTubeUrl(
	url: string,
): Result<{ url: string; videoId: string }, ExtractionError> {
	const trimmed = url.trim();
	if (!trimmed) {
		return {
			ok: false,
			error: { type: "invalid_url", message: "URL cannot be empty" },
		};
	}

	for (const pattern of YOUTUBE_PATTERNS) {
		const match = trimmed.match(pattern);
		if (match) {
			return { ok: true, data: { url: trimmed, videoId: match[1] } };
		}
	}

	return {
		ok: false,
		error: {
			type: "invalid_url",
			message: `Invalid YouTube URL: "${trimmed}"

Expected formats:
  - https://www.youtube.com/watch?v=VIDEO_ID
  - https://youtu.be/VIDEO_ID
  - https://youtube.com/shorts/VIDEO_ID`,
		},
	};
}

function parseVtt(content: string): string {
	const lines = content.split("\n");
	const textLines: string[] = [];
	let lastLine = "";

	for (const line of lines) {
		if (
			line.startsWith("WEBVTT") ||
			line.startsWith("Kind:") ||
			line.startsWith("Language:") ||
			line.includes("-->") ||
			line.match(/^[\d:.]+$/) ||
			line.match(/^position:/) ||
			line.match(/^align:/) ||
			line.trim() === ""
		) {
			continue;
		}

		const cleaned = line.replace(/<[^>]+>/g, "").trim();

		if (cleaned && cleaned !== lastLine) {
			textLines.push(cleaned);
			lastLine = cleaned;
		}
	}

	return textLines.join("\n");
}

function parseSrt(content: string): string {
	const lines = content.split("\n");
	const textLines: string[] = [];
	let lastLine = "";

	for (const line of lines) {
		if (line.match(/^\d+$/) || line.includes("-->") || line.trim() === "") {
			continue;
		}

		const cleaned = line.replace(/<[^>]+>/g, "").trim();
		if (cleaned && cleaned !== lastLine) {
			textLines.push(cleaned);
			lastLine = cleaned;
		}
	}

	return textLines.join("\n");
}

function parseYtDlpError(stderr: string): Result<never, ExtractionError> {
	const err = stderr.toLowerCase();

	if (err.includes("no subtitles") || err.includes("no automatic captions")) {
		return {
			ok: false,
			error: {
				type: "no_subtitles",
				message: `No subtitles available for this video.

The video may not have captions enabled, or auto-generated captions are disabled.`,
			},
		};
	}

	if (
		err.includes("video unavailable") ||
		err.includes("private video") ||
		err.includes("this video is not available")
	) {
		return {
			ok: false,
			error: {
				type: "video_unavailable",
				message: `Video unavailable.

The video may be private, deleted, or region-restricted.`,
			},
		};
	}

	if (
		err.includes("unable to download") ||
		err.includes("network") ||
		err.includes("connection")
	) {
		return {
			ok: false,
			error: {
				type: "network_error",
				message: `Network error.

Could not connect to YouTube. Please check your internet connection.`,
			},
		};
	}

	if (
		err.includes("sign in") ||
		err.includes("bot") ||
		err.includes("cookies")
	) {
		return {
			ok: false,
			error: {
				type: "yt_dlp_error",
				message: `YouTube requires authentication.

YouTube is blocking requests. Try:
  1. Use --cookies-from-browser to authenticate
  2. Export cookies from your browser and use --cookies

See: https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp`,
				details: stderr,
			},
		};
	}

	return {
		ok: false,
		error: {
			type: "yt_dlp_error",
			message: "yt-dlp extraction failed.",
			details: stderr,
		},
	};
}

async function runYtDlp(url: string): Promise<Result<string, ExtractionError>> {
	const tmpDir = `/tmp/yt-extract-${Date.now()}`;

	try {
		const whichResult = await Bun.$`which yt-dlp`.quiet().nothrow();
		if (whichResult.exitCode !== 0) {
			return {
				ok: false,
				error: {
					type: "yt_dlp_not_found",
					message: `yt-dlp not found.

Install with: brew install yt-dlp`,
				},
			};
		}

		const result =
			await Bun.$`yt-dlp --write-auto-sub --sub-lang en --skip-download -o "${tmpDir}/%(id)s" ${url}`
				.quiet()
				.nothrow();

		if (result.exitCode !== 0) {
			return parseYtDlpError(result.stderr.toString());
		}

		const vttFiles = await Array.fromAsync(new Bun.Glob("*.vtt").scan(tmpDir));
		if (vttFiles.length > 0) {
			const content = await Bun.file(`${tmpDir}/${vttFiles[0]}`).text();
			return { ok: true, data: parseVtt(content) };
		}

		const srtFiles = await Array.fromAsync(new Bun.Glob("*.srt").scan(tmpDir));
		if (srtFiles.length > 0) {
			const content = await Bun.file(`${tmpDir}/${srtFiles[0]}`).text();
			return { ok: true, data: parseSrt(content) };
		}

		return {
			ok: false,
			error: {
				type: "no_subtitles",
				message: `No subtitles available for this video.

The video may not have captions enabled.`,
			},
		};
	} finally {
		await Bun.$`rm -rf ${tmpDir}`.quiet().nothrow();
	}
}

async function extractTranscript(
	url: string,
): Promise<Result<ExtractionResult, ExtractionError>> {
	const urlResult = validateYouTubeUrl(url);
	if (!urlResult.ok) return urlResult;

	const extractResult = await runYtDlp(urlResult.data.url);
	if (!extractResult.ok) return extractResult;

	return {
		ok: true,
		data: {
			transcript: extractResult.data,
			videoId: urlResult.data.videoId,
		},
	};
}

const EXIT_CODES: Record<ExtractionError["type"], number> = {
	invalid_url: 1,
	no_subtitles: 2,
	network_error: 3,
	video_unavailable: 4,
	yt_dlp_not_found: 5,
	yt_dlp_error: 6,
	re_extract_error: 7,
};

// Default content folder path (can be overridden)
const DEFAULT_CONTENT_FOLDER = "libraries";

/**
 * Find a library entry by slug and validate it exists
 */
function findLibraryEntry(
	slug: string,
	contentFolder: string,
): Result<string, ExtractionError> {
	const entryPath = `${contentFolder}/${slug}`;
	const transcriptPath = `${entryPath}/transcript.md`;

	// Use Node.js fs.existsSync for synchronous file existence check
	const fs = require("node:fs");
	if (!fs.existsSync(transcriptPath)) {
		return {
			ok: false,
			error: {
				type: "re_extract_error",
				message: `Library entry '${slug}' not found.

Use extract command to create it first:
  extract "<youtube-url>"

Expected location: ${transcriptPath}`,
			},
		};
	}

	return { ok: true, data: entryPath };
}

/**
 * Parse YAML frontmatter from transcript.md
 */
function parseTranscriptFrontmatter(
	content: string,
): Result<TranscriptMetadata, ExtractionError> {
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatterMatch) {
		return {
			ok: false,
			error: {
				type: "re_extract_error",
				message: "No frontmatter found in transcript.md",
			},
		};
	}

	const yaml = frontmatterMatch[1];
	const metadata: Partial<TranscriptMetadata> = {};

	// Simple YAML parsing for known fields
	for (const line of yaml.split("\n")) {
		const match = line.match(/^(\w+):\s*"?([^"]*)"?$/);
		if (match) {
			const key = match[1] as keyof TranscriptMetadata;
			metadata[key] = match[2];
		}
	}

	if (!metadata.source_url || !metadata.slug) {
		return {
			ok: false,
			error: {
				type: "re_extract_error",
				message: "Invalid frontmatter: missing source_url or slug",
			},
		};
	}

	return { ok: true, data: metadata as TranscriptMetadata };
}

/**
 * Read metadata from an existing library entry
 */
async function readEntryMetadata(
	entryPath: string,
): Promise<Result<TranscriptMetadata, ExtractionError>> {
	try {
		const content = await Bun.file(`${entryPath}/transcript.md`).text();
		return parseTranscriptFrontmatter(content);
	} catch {
		return {
			ok: false,
			error: {
				type: "re_extract_error",
				message: `Failed to read transcript at ${entryPath}/transcript.md`,
			},
		};
	}
}

/**
 * Backup the current transcript before re-extraction
 */
async function backupTranscript(
	entryPath: string,
): Promise<Result<string, ExtractionError>> {
	const transcriptPath = `${entryPath}/transcript.md`;
	const backupPath = `${entryPath}/transcript.md.backup`;

	try {
		const content = await Bun.file(transcriptPath).text();
		await Bun.write(backupPath, content);
		return { ok: true, data: backupPath };
	} catch {
		return {
			ok: false,
			error: {
				type: "re_extract_error",
				message: `Failed to backup transcript at ${transcriptPath}`,
			},
		};
	}
}

/**
 * Restore transcript from backup
 */
async function restoreTranscript(
	backupPath: string,
): Promise<Result<void, ExtractionError>> {
	const transcriptPath = backupPath.replace(".backup", "");

	try {
		const content = await Bun.file(backupPath).text();
		await Bun.write(transcriptPath, content);
		// Delete backup after successful restore
		await Bun.$`rm ${backupPath}`.quiet().nothrow();
		return { ok: true, data: undefined };
	} catch {
		return {
			ok: false,
			error: {
				type: "re_extract_error",
				message: `Failed to restore transcript from ${backupPath}`,
			},
		};
	}
}

/**
 * Delete backup file after successful re-extraction
 */
async function deleteBackup(backupPath: string): Promise<void> {
	await Bun.$`rm ${backupPath}`.quiet().nothrow();
}

/**
 * Check for downstream content that may become stale
 */
async function checkDownstreamContent(entryPath: string): Promise<string[]> {
	const downstream: string[] = [];

	const refinedFile = Bun.file(`${entryPath}/refined.md`);
	const audioFile = Bun.file(`${entryPath}/audio.mp3`);

	try {
		if ((await refinedFile.exists()) === true) {
			downstream.push("refined.md");
		}
	} catch {
		// File doesn't exist
	}

	try {
		if ((await audioFile.exists()) === true) {
			downstream.push("audio.mp3");
		}
	} catch {
		// File doesn't exist
	}

	return downstream;
}

/**
 * Count words in transcript content
 */
function countWords(content: string): number {
	// Remove frontmatter
	const bodyMatch = content.match(/^---[\s\S]*?---\n\n([\s\S]*)$/);
	const body = bodyMatch ? bodyMatch[1] : content;
	return body.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Prompt user for Y/N confirmation
 */
async function promptConfirmation(message: string): Promise<boolean> {
	console.log(message);
	process.stdout.write("[Y]es / [N]o: ");

	const reader = Bun.stdin.stream().getReader();
	const decoder = new TextDecoder();

	try {
		const { value } = await reader.read();
		if (value) {
			const input = decoder.decode(value).trim().toLowerCase();
			return input === "y" || input === "yes";
		}
		return false;
	} finally {
		reader.releaseLock();
	}
}

/**
 * Execute re-extraction for an existing library entry
 */
async function reExtract(
	slug: string,
	contentFolder: string = DEFAULT_CONTENT_FOLDER,
): Promise<Result<{ message: string }, ExtractionError>> {
	// Step 1: Validate library entry exists
	const entryResult = findLibraryEntry(slug, contentFolder);
	if (!entryResult.ok) return entryResult;
	const entryPath = entryResult.data;

	// Step 2: Read existing metadata
	const metadataResult = await readEntryMetadata(entryPath);
	if (!metadataResult.ok) return metadataResult;
	const metadata = metadataResult.data;

	// Step 3: Display current transcript info and prompt for confirmation
	const transcriptContent = await Bun.file(`${entryPath}/transcript.md`).text();
	const wordCount = countWords(transcriptContent);

	console.log(`
Re-extract transcript for "${slug}"?

Current transcript:
  - Extracted: ${metadata.extracted_at}${metadata.re_extracted_at ? `\n  - Last re-extracted: ${metadata.re_extracted_at}` : ""}
  - Word count: ${wordCount}

This will replace the existing transcript.md
`);

	const confirmed = await promptConfirmation("");
	if (!confirmed) {
		return {
			ok: false,
			error: {
				type: "re_extract_error",
				message: "Re-extraction cancelled by user.",
			},
		};
	}

	// Step 4: Backup original transcript
	const backupResult = await backupTranscript(entryPath);
	if (!backupResult.ok) return backupResult;
	const backupPath = backupResult.data;

	// Step 5: Perform extraction using stored URL
	const extractResult = await extractTranscript(metadata.source_url);
	if (!extractResult.ok) {
		// Restore backup on failure
		console.error("\nExtraction failed. Restoring original transcript...");
		const restoreResult = await restoreTranscript(backupPath);
		if (!restoreResult.ok) {
			console.error("Warning: Failed to restore backup.");
		} else {
			console.log("Original transcript restored.");
		}
		return extractResult;
	}

	// Step 6: Write new transcript with updated metadata
	const now = new Date().toISOString();
	const newTranscript = `---
source_url: "${metadata.source_url}"
source_type: ${metadata.source_type || "youtube"}
slug: "${metadata.slug}"
extracted_at: "${metadata.extracted_at}"
re_extracted_at: "${now}"
stage: extracted
---

# Transcript

${extractResult.data.transcript}
`;

	await Bun.write(`${entryPath}/transcript.md`, newTranscript);

	// Step 7: Delete backup
	await deleteBackup(backupPath);

	// Step 8: Check for downstream content and warn
	const downstream = await checkDownstreamContent(entryPath);
	let warningMessage = "";
	if (downstream.length > 0) {
		warningMessage = `

Warning: The following files may now be stale:
${downstream.map((f) => `  - ${f}`).join("\n")}

Consider re-processing these files with the updated transcript.`;
		console.warn(warningMessage);
	}

	return {
		ok: true,
		data: {
			message: `Transcript re-extracted successfully.

Updated: ${entryPath}/transcript.md
Re-extracted at: ${now}${warningMessage}`,
		},
	};
}

if (import.meta.main) {
	const arg1 = Bun.argv[2];
	const arg2 = Bun.argv[3];

	if (!arg1 || arg1 === "--help" || arg1 === "-h") {
		console.log(`Usage: extract <youtube-url>
       extract --re-extract <slug>

Extract transcript from a YouTube video.

Examples:
  extract "https://www.youtube.com/watch?v=jNQXAC9IVRw"
  extract "https://youtu.be/jNQXAC9IVRw"

Re-extract existing content:
  extract --re-extract VIDEO_ID

Exit codes:
  0 - Success
  1 - Invalid URL
  2 - No subtitles available
  3 - Network error
  4 - Video unavailable
  5 - yt-dlp not found
  6 - Other yt-dlp error
  7 - Re-extract error`);
		process.exit(0);
	}

	// Handle --re-extract flag
	if (arg1 === "--re-extract") {
		if (!arg2) {
			console.error("Error: --re-extract requires a library slug.\n");
			console.error("Usage: extract --re-extract <slug>");
			process.exit(EXIT_CODES.re_extract_error);
		}

		const result = await reExtract(arg2);

		if (!result.ok) {
			console.error(result.error.message);
			process.exit(EXIT_CODES[result.error.type]);
		}

		console.log(result.data.message);
		process.exit(0);
	}

	// Normal extraction mode
	const result = await extractTranscript(arg1);

	if (!result.ok) {
		console.error(result.error.message);
		if ("details" in result.error && result.error.details) {
			console.error("\nDetails:", result.error.details);
		}
		process.exit(EXIT_CODES[result.error.type]);
	}

	console.log(result.data.transcript);
}

export {
	extractTranscript,
	validateYouTubeUrl,
	parseVtt,
	parseSrt,
	parseYtDlpError,
	findLibraryEntry,
	parseTranscriptFrontmatter,
	readEntryMetadata,
	backupTranscript,
	restoreTranscript,
	checkDownstreamContent,
	countWords,
	reExtract,
};
export type { Result, ExtractionError, ExtractionResult, TranscriptMetadata };
