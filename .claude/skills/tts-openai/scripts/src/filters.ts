/**
 * Text filters for preprocessing content before TTS conversion
 *
 * Filters clean markdown and other formatting that doesn't translate
 * well to audio. Each filter is a pure function: string -> string
 */

import type { TextFilter } from "./types";

// Registry of available text filters
export const TEXT_FILTERS: Record<string, TextFilter> = {
  // Remove markdown links but keep the link text: [text](url) -> text
  "markdown-links": (text) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),

  // Remove inline code backticks: `code` -> code
  "inline-code": (text) => text.replace(/`([^`]+)`/g, "$1"),

  // Remove bold/italic markers: **text** -> text, *text* -> text
  emphasis: (text) =>
    text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1"),

  // Remove markdown headers: ## Header -> Header
  headers: (text) => text.replace(/^#{1,6}\s+/gm, ""),

  // Remove horizontal rules
  hr: (text) => text.replace(/^[-*_]{3,}\s*$/gm, ""),

  // Remove image syntax: ![alt](url) -> alt text or nothing
  images: (text) => text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1"),

  // Clean up multiple spaces/newlines
  whitespace: (text) =>
    text.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+/g, " "),
};

// Default filters applied to markdown content
export const DEFAULT_FILTERS = [
  "markdown-links",
  "inline-code",
  "emphasis",
  "headers",
  "hr",
  "images",
  "whitespace",
];

/**
 * Apply a list of filters to text in sequence
 */
export function applyFilters(text: string, filterNames: string[]): string {
  let result = text;
  for (const name of filterNames) {
    const filter = TEXT_FILTERS[name];
    if (filter) {
      result = filter(result);
    }
  }
  return result;
}

/**
 * Get list of all available filter names
 */
export function getAvailableFilters(): string[] {
  return Object.keys(TEXT_FILTERS);
}

/**
 * Check if a filter name is valid
 */
export function isValidFilter(name: string): boolean {
  return name in TEXT_FILTERS;
}
