/**
 * Text processing utilities
 */

/**
 * Split text into paragraphs (separated by blank lines)
 */
export function splitIntoParagraphs(text: string): string[] {
  const paragraphs = text.trim().split(/\n\s*\n/);
  return paragraphs.map((p) => p.trim()).filter((p) => p.length > 0);
}

/**
 * Format seconds as MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) return "0:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Create a progress bar string
 */
export function createProgressBar(
  current: number,
  total: number,
  width: number = 20
): string {
  const filled = Math.floor((current / total) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}
