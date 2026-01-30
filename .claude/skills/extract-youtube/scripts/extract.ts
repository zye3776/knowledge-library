// Discriminated union Result type (KISS pattern)
type Result<T, E = string> = { ok: true; data: T } | { ok: false; error: E };

// Specific error types for better handling
type ExtractionError =
	| { type: "invalid_url"; message: string }
	| { type: "no_subtitles"; message: string }
	| { type: "network_error"; message: string }
	| { type: "video_unavailable"; message: string }
	| { type: "yt_dlp_not_found"; message: string }
	| { type: "yt_dlp_error"; message: string; details: string };

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
};

if (import.meta.main) {
	const url = Bun.argv[2];

	if (!url || url === "--help" || url === "-h") {
		console.log(`Usage: extract <youtube-url>

Extract transcript from a YouTube video.

Examples:
  extract "https://www.youtube.com/watch?v=jNQXAC9IVRw"
  extract "https://youtu.be/jNQXAC9IVRw"

Exit codes:
  0 - Success
  1 - Invalid URL
  2 - No subtitles available
  3 - Network error
  4 - Video unavailable
  5 - yt-dlp not found
  6 - Other yt-dlp error`);
		process.exit(0);
	}

	const result = await extractTranscript(url);

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
};
export type { Result, ExtractionError, ExtractionResult };
