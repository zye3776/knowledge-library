import { describe, expect, test } from "bun:test";
import {
	applyFilters,
	DEFAULT_FILTERS,
	getAvailableFilters,
	isValidFilter,
	TEXT_FILTERS,
} from "./filters";

describe("TEXT_FILTERS", () => {
	describe("markdown-links", () => {
		const filter = TEXT_FILTERS["markdown-links"];

		test("removes markdown links keeping text", () => {
			expect(filter("[click here](https://example.com)")).toBe("click here");
		});

		test("handles multiple links", () => {
			expect(filter("[one](url1) and [two](url2)")).toBe("one and two");
		});

		test("handles links with special characters in URL", () => {
			expect(filter("[text](https://example.com/path?q=1&b=2)")).toBe("text");
		});

		test("preserves text without links", () => {
			expect(filter("plain text")).toBe("plain text");
		});
	});

	describe("inline-code", () => {
		const filter = TEXT_FILTERS["inline-code"];

		test("removes backticks from inline code", () => {
			expect(filter("use `console.log`")).toBe("use console.log");
		});

		test("handles multiple inline code blocks", () => {
			expect(filter("`foo` and `bar`")).toBe("foo and bar");
		});

		test("preserves text without code", () => {
			expect(filter("plain text")).toBe("plain text");
		});
	});

	describe("emphasis", () => {
		const filter = TEXT_FILTERS["emphasis"];

		test("removes bold markers", () => {
			expect(filter("this is **bold** text")).toBe("this is bold text");
		});

		test("removes italic markers", () => {
			expect(filter("this is *italic* text")).toBe("this is italic text");
		});

		test("handles mixed emphasis", () => {
			expect(filter("**bold** and *italic*")).toBe("bold and italic");
		});

		test("preserves plain text", () => {
			expect(filter("plain text")).toBe("plain text");
		});
	});

	describe("headers", () => {
		const filter = TEXT_FILTERS["headers"];

		test("removes h1 markers", () => {
			expect(filter("# Heading")).toBe("Heading");
		});

		test("removes h2 markers", () => {
			expect(filter("## Heading")).toBe("Heading");
		});

		test("removes h6 markers", () => {
			expect(filter("###### Heading")).toBe("Heading");
		});

		test("handles multiple headers", () => {
			expect(filter("# One\n## Two")).toBe("One\nTwo");
		});

		test("preserves non-header text", () => {
			expect(filter("plain text")).toBe("plain text");
		});
	});

	describe("hr", () => {
		const filter = TEXT_FILTERS["hr"];

		test("removes dash horizontal rules", () => {
			expect(filter("above\n---\nbelow")).toBe("above\n\nbelow");
		});

		test("removes asterisk horizontal rules", () => {
			expect(filter("above\n***\nbelow")).toBe("above\n\nbelow");
		});

		test("removes underscore horizontal rules", () => {
			expect(filter("above\n___\nbelow")).toBe("above\n\nbelow");
		});

		test("preserves non-hr text", () => {
			expect(filter("plain text")).toBe("plain text");
		});
	});

	describe("images", () => {
		const filter = TEXT_FILTERS["images"];

		test("removes image syntax keeping alt text", () => {
			expect(filter("![alt text](image.png)")).toBe("alt text");
		});

		test("removes image with empty alt", () => {
			expect(filter("![](image.png)")).toBe("");
		});

		test("handles multiple images", () => {
			expect(filter("![one](1.png) ![two](2.png)")).toBe("one two");
		});
	});

	describe("whitespace", () => {
		const filter = TEXT_FILTERS["whitespace"];

		test("collapses multiple newlines", () => {
			expect(filter("a\n\n\n\nb")).toBe("a\n\nb");
		});

		test("collapses multiple spaces", () => {
			expect(filter("a    b")).toBe("a b");
		});

		test("collapses tabs", () => {
			expect(filter("a\t\tb")).toBe("a b");
		});
	});
});

describe("applyFilters", () => {
	test("applies single filter", () => {
		const result = applyFilters("[link](url)", ["markdown-links"]);
		expect(result).toBe("link");
	});

	test("applies multiple filters in sequence", () => {
		const result = applyFilters("# [Title](url)", [
			"headers",
			"markdown-links",
		]);
		expect(result).toBe("Title");
	});

	test("skips unknown filters", () => {
		const result = applyFilters("text", ["unknown-filter"]);
		expect(result).toBe("text");
	});

	test("returns original text with empty filter list", () => {
		const result = applyFilters("[link](url)", []);
		expect(result).toBe("[link](url)");
	});

	test("applies all default filters", () => {
		const input = "# **[Title](url)**\n\n\n`code`";
		const result = applyFilters(input, DEFAULT_FILTERS);
		expect(result).toBe("Title\n\ncode");
	});
});

describe("getAvailableFilters", () => {
	test("returns all filter names", () => {
		const filters = getAvailableFilters();
		expect(filters).toContain("markdown-links");
		expect(filters).toContain("inline-code");
		expect(filters).toContain("emphasis");
		expect(filters).toContain("headers");
		expect(filters).toContain("hr");
		expect(filters).toContain("images");
		expect(filters).toContain("whitespace");
	});

	test("returns array of strings", () => {
		const filters = getAvailableFilters();
		expect(Array.isArray(filters)).toBe(true);
		filters.forEach((f) => expect(typeof f).toBe("string"));
	});
});

describe("isValidFilter", () => {
	test("returns true for valid filters", () => {
		expect(isValidFilter("markdown-links")).toBe(true);
		expect(isValidFilter("inline-code")).toBe(true);
	});

	test("returns false for invalid filters", () => {
		expect(isValidFilter("unknown")).toBe(false);
		expect(isValidFilter("")).toBe(false);
	});
});

describe("DEFAULT_FILTERS", () => {
	test("contains expected filters", () => {
		expect(DEFAULT_FILTERS).toContain("markdown-links");
		expect(DEFAULT_FILTERS).toContain("whitespace");
	});

	test("all default filters are valid", () => {
		DEFAULT_FILTERS.forEach((f) => {
			expect(isValidFilter(f)).toBe(true);
		});
	});
});
