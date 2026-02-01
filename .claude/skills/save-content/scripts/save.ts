import { join } from "node:path";

// Discriminated union Result type (KISS pattern, matching extract-youtube)
type Result<T, E = string> = { ok: true; data: T } | { ok: false; error: E };

interface SaveInput {
	transcript: string;
	url: string;
	title: string;
}

interface SaveResult {
	slug: string;
	transcriptPath: string;
	metadataPath: string;
}

/**
 * Generate a URL-safe slug from a video title.
 * Returns null if the title cannot produce a valid slug.
 */
function generateSlug(title: string): string | null {
	if (!title || !title.trim()) {
		return null;
	}

	let slug = title
		.toLowerCase()
		// Remove emojis and other non-ASCII characters (biome-ignore: legitimate control char range)
		// biome-ignore lint/suspicious/noControlCharactersInRegex: Intentionally matching non-ASCII range
		.replace(/[^\x00-\x7F]/g, "")
		// Replace special characters with space (except hyphens)
		.replace(/[^a-z0-9\s-]/g, "")
		// Replace whitespace with hyphens
		.replace(/\s+/g, "-")
		// Collapse multiple hyphens
		.replace(/-+/g, "-")
		// Trim leading/trailing hyphens
		.replace(/^-+|-+$/g, "");

	// Return null if slug is empty after processing
	if (!slug) {
		return null;
	}

	// Truncate to max 100 characters
	if (slug.length > 100) {
		slug = slug.slice(0, 100).replace(/-+$/, "");
	}

	return slug;
}

/**
 * Save transcript content and metadata to the library folder.
 */
async function saveContent(
	input: SaveInput,
	librariesPath: string,
): Promise<Result<SaveResult, string>> {
	// Validate inputs
	if (!input.transcript || !input.transcript.trim()) {
		return { ok: false, error: "transcript cannot be empty" };
	}
	if (!input.url || !input.url.trim()) {
		return { ok: false, error: "URL cannot be empty" };
	}
	if (!input.title || !input.title.trim()) {
		return { ok: false, error: "title cannot be empty" };
	}

	// Generate slug
	const slug = generateSlug(input.title);
	if (!slug) {
		return {
			ok: false,
			error:
				"Could not generate valid slug from title - title must contain alphanumeric characters",
		};
	}

	// Create folder structure
	const contentFolder = join(librariesPath, slug);
	try {
		await Bun.$`mkdir -p ${contentFolder}`.quiet();
	} catch {
		return { ok: false, error: `Failed to create folder: ${contentFolder}` };
	}

	// File paths
	const transcriptPath = join(contentFolder, "transcript.md");
	const metadataPath = join(contentFolder, "metadata.yaml");

	// Write transcript
	try {
		await Bun.write(transcriptPath, input.transcript);
	} catch {
		return {
			ok: false,
			error: `Failed to write transcript: ${transcriptPath}`,
		};
	}

	// Write metadata
	const timestamp = new Date().toISOString();
	const metadata = `source_url: "${input.url}"
title: "${input.title}"
extracted_at: "${timestamp}"
`;

	try {
		await Bun.write(metadataPath, metadata);
	} catch {
		return { ok: false, error: `Failed to write metadata: ${metadataPath}` };
	}

	return {
		ok: true,
		data: {
			slug,
			transcriptPath,
			metadataPath,
		},
	};
}

// CLI Exit codes
const EXIT_CODES = {
	success: 0,
	invalid_args: 1,
	save_failed: 2,
};

// CLI entry point
if (import.meta.main) {
	const args = Bun.argv.slice(2);

	// Parse arguments
	const parseArgs = (): {
		url?: string;
		title?: string;
		transcript?: string;
		help?: boolean;
	} => {
		const result: {
			url?: string;
			title?: string;
			transcript?: string;
			help?: boolean;
		} = {};
		let i = 0;
		while (i < args.length) {
			const arg = args[i];
			if (arg === "--help" || arg === "-h") {
				result.help = true;
				i++;
			} else if (arg === "--url" && args[i + 1]) {
				result.url = args[i + 1];
				i += 2;
			} else if (arg === "--title" && args[i + 1]) {
				result.title = args[i + 1];
				i += 2;
			} else if (arg === "--transcript" && args[i + 1]) {
				result.transcript = args[i + 1];
				i += 2;
			} else {
				i++;
			}
		}
		return result;
	};

	const parsed = parseArgs();

	if (parsed.help || args.length === 0) {
		console.log(`Usage: save --url <youtube-url> --title <video-title> --transcript <text>

Save extracted transcript with metadata to the knowledge library.

Options:
  --url <url>           YouTube video URL (required)
  --title <title>       Video title (required)
  --transcript <text>   Transcript content (required)
  --help, -h            Show this help message

Examples:
  save --url "https://youtube.com/watch?v=abc" --title "My Video" --transcript "Hello world..."

Output:
  Creates libraries/{slug}/transcript.md and libraries/{slug}/metadata.yaml

Exit codes:
  0 - Success
  1 - Invalid arguments
  2 - Save operation failed`);
		process.exit(EXIT_CODES.success);
	}

	// Validate required arguments
	if (!parsed.url) {
		console.error("Error: --url is required");
		process.exit(EXIT_CODES.invalid_args);
	}
	if (!parsed.title) {
		console.error("Error: --title is required");
		process.exit(EXIT_CODES.invalid_args);
	}
	if (!parsed.transcript) {
		console.error("Error: --transcript is required");
		process.exit(EXIT_CODES.invalid_args);
	}

	// Default libraries path is {cwd}/libraries
	const librariesPath = join(process.cwd(), "libraries");

	const result = await saveContent(
		{
			url: parsed.url,
			title: parsed.title,
			transcript: parsed.transcript,
		},
		librariesPath,
	);

	if (!result.ok) {
		console.error(`Error: ${result.error}`);
		process.exit(EXIT_CODES.save_failed);
	}

	console.log(`Saved to: ${result.data.slug}/`);
	console.log(`  - ${result.data.transcriptPath}`);
	console.log(`  - ${result.data.metadataPath}`);
}

export { generateSlug, saveContent };
export type { Result, SaveInput, SaveResult };
