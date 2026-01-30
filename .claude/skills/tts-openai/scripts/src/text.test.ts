import { describe, expect, test } from "bun:test";
import { createProgressBar, formatTime, splitIntoParagraphs } from "./text";

describe("splitIntoParagraphs", () => {
	test("splits on double newlines", () => {
		const result = splitIntoParagraphs("First paragraph.\n\nSecond paragraph.");
		expect(result).toEqual(["First paragraph.", "Second paragraph."]);
	});

	test("handles multiple blank lines", () => {
		const result = splitIntoParagraphs("One.\n\n\n\nTwo.");
		expect(result).toEqual(["One.", "Two."]);
	});

	test("trims whitespace from paragraphs", () => {
		const result = splitIntoParagraphs("  First  \n\n  Second  ");
		expect(result).toEqual(["First", "Second"]);
	});

	test("filters empty paragraphs", () => {
		const result = splitIntoParagraphs("One.\n\n\n\n\n\nTwo.");
		expect(result).toEqual(["One.", "Two."]);
	});

	test("handles single paragraph", () => {
		const result = splitIntoParagraphs("Single paragraph.");
		expect(result).toEqual(["Single paragraph."]);
	});

	test("handles empty string", () => {
		const result = splitIntoParagraphs("");
		expect(result).toEqual([]);
	});

	test("handles whitespace-only string", () => {
		const result = splitIntoParagraphs("   \n\n   ");
		expect(result).toEqual([]);
	});

	test("preserves single newlines within paragraphs", () => {
		const result = splitIntoParagraphs(
			"Line one.\nLine two.\n\nNext paragraph.",
		);
		expect(result).toEqual(["Line one.\nLine two.", "Next paragraph."]);
	});
});

describe("formatTime", () => {
	test("formats seconds only", () => {
		expect(formatTime(45)).toBe("0:45");
	});

	test("formats minutes and seconds", () => {
		expect(formatTime(125)).toBe("2:05");
	});

	test("formats hours, minutes, seconds", () => {
		expect(formatTime(3661)).toBe("1:01:01");
	});

	test("pads seconds with zero", () => {
		expect(formatTime(62)).toBe("1:02");
	});

	test("pads minutes with zero in hour format", () => {
		expect(formatTime(3605)).toBe("1:00:05");
	});

	test("handles zero", () => {
		expect(formatTime(0)).toBe("0:00");
	});

	test("handles negative numbers", () => {
		expect(formatTime(-5)).toBe("0:00");
	});

	test("handles fractional seconds (floors)", () => {
		expect(formatTime(61.9)).toBe("1:01");
	});
});

describe("createProgressBar", () => {
	test("creates empty bar at 0%", () => {
		const bar = createProgressBar(0, 10, 10);
		expect(bar).toBe("░░░░░░░░░░");
	});

	test("creates full bar at 100%", () => {
		const bar = createProgressBar(10, 10, 10);
		expect(bar).toBe("██████████");
	});

	test("creates half-filled bar at 50%", () => {
		const bar = createProgressBar(5, 10, 10);
		expect(bar).toBe("█████░░░░░");
	});

	test("uses default width of 20", () => {
		const bar = createProgressBar(5, 10);
		expect(bar.length).toBe(20);
	});

	test("handles custom width", () => {
		const bar = createProgressBar(5, 10, 30);
		expect(bar.length).toBe(30);
	});

	test("rounds down for partial fills", () => {
		const bar = createProgressBar(1, 3, 9);
		// 1/3 * 9 = 3, so 3 filled
		expect(bar).toBe("███░░░░░░");
	});
});
