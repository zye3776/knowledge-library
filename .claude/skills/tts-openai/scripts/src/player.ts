/**
 * Audio player abstraction layer
 *
 * Provides a unified interface for playing audio across different platforms.
 * Currently implements macOS (afplay). Structure supports adding:
 * - Linux: aplay, paplay, mpv
 * - Windows: powershell, wmplayer
 */

import { execSync, spawn } from "child_process";
import { FALLBACK_DURATION_SECONDS } from "./constants";
import type { AudioPlayer } from "./types";

/**
 * macOS audio player using afplay
 */
export class AfplayPlayer implements AudioPlayer {
	play(filePath: string, rate: number = 1.0): Promise<void> {
		return new Promise((resolve, reject) => {
			const child = spawn("afplay", ["-r", String(rate), filePath]);
			child.on("close", (code) => {
				if (code === 0) resolve();
				else reject(new Error(`afplay exited with code ${code}`));
			});
			child.on("error", reject);
		});
	}

	stop(): void {
		try {
			execSync("pkill -f afplay", { stdio: "ignore" });
		} catch {
			// No process to kill - ignore
		}
	}

	getDuration(filePath: string): number {
		try {
			const result = execSync(`afinfo "${filePath}"`, { encoding: "utf-8" });
			// Look for "estimated duration: X.XXX sec" pattern
			const match = result.match(/estimated duration:\s*([\d.]+)\s*sec/i);
			if (match) {
				return parseFloat(match[1]);
			}
			// Fallback: look for "X.XXX sec" pattern
			const secMatch = result.match(/([\d.]+)\s*sec/);
			if (secMatch) {
				return parseFloat(secMatch[1]);
			}
			return FALLBACK_DURATION_SECONDS;
		} catch {
			return FALLBACK_DURATION_SECONDS;
		}
	}

	isAvailable(): boolean {
		try {
			execSync("which afplay", { stdio: "ignore" });
			return true;
		} catch {
			return false;
		}
	}
}

// Future implementations can be added here:
// export class AplayPlayer implements AudioPlayer { ... }
// export class PaplayPlayer implements AudioPlayer { ... }
// export class MpvPlayer implements AudioPlayer { ... }
// export class WindowsPlayer implements AudioPlayer { ... }

/**
 * Detect platform and return appropriate player
 */
export function createPlayer(): AudioPlayer {
	const platform = process.platform;

	if (platform === "darwin") {
		return new AfplayPlayer();
	}

	// Future: Add Linux and Windows support
	// if (platform === 'linux') {
	//   return new AplayPlayer() or new PaplayPlayer();
	// }
	// if (platform === 'win32') {
	//   return new WindowsPlayer();
	// }

	// Default to afplay for now
	return new AfplayPlayer();
}

/**
 * Get the default player instance
 */
let defaultPlayer: AudioPlayer | null = null;

export function getPlayer(): AudioPlayer {
	if (!defaultPlayer) {
		defaultPlayer = createPlayer();
	}
	return defaultPlayer;
}
