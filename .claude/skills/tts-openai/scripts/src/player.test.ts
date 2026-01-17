import { describe, expect, test } from "bun:test";
import { AfplayPlayer, createPlayer, getPlayer } from "./player";
import { FALLBACK_DURATION_SECONDS } from "./constants";

describe("AfplayPlayer", () => {
  describe("isAvailable", () => {
    test("returns boolean", () => {
      const player = new AfplayPlayer();
      const result = player.isAvailable();
      expect(typeof result).toBe("boolean");
    });

    // On macOS this should return true
    test("returns true on macOS", () => {
      if (process.platform === "darwin") {
        const player = new AfplayPlayer();
        expect(player.isAvailable()).toBe(true);
      }
    });
  });

  describe("getDuration", () => {
    test("returns fallback for non-existent file", () => {
      const player = new AfplayPlayer();
      const duration = player.getDuration("/non/existent/file.mp3");
      expect(duration).toBe(FALLBACK_DURATION_SECONDS);
    });

    test("returns number", () => {
      const player = new AfplayPlayer();
      const duration = player.getDuration("/any/path.mp3");
      expect(typeof duration).toBe("number");
    });
  });

  describe("stop", () => {
    test("does not throw when no process running", () => {
      const player = new AfplayPlayer();
      expect(() => player.stop()).not.toThrow();
    });
  });

  describe("play", () => {
    test("rejects for non-existent file", async () => {
      const player = new AfplayPlayer();
      await expect(player.play("/non/existent/file.mp3")).rejects.toThrow();
    });

    test("accepts rate parameter", async () => {
      const player = new AfplayPlayer();
      // This will fail because file doesn't exist, but validates signature
      await expect(player.play("/non/existent/file.mp3", 1.5)).rejects.toThrow();
    });
  });
});

describe("createPlayer", () => {
  test("returns AudioPlayer instance", () => {
    const player = createPlayer();
    expect(player).toBeDefined();
    expect(typeof player.play).toBe("function");
    expect(typeof player.stop).toBe("function");
    expect(typeof player.getDuration).toBe("function");
    expect(typeof player.isAvailable).toBe("function");
  });

  test("returns AfplayPlayer on macOS", () => {
    if (process.platform === "darwin") {
      const player = createPlayer();
      expect(player).toBeInstanceOf(AfplayPlayer);
    }
  });
});

describe("getPlayer", () => {
  test("returns same instance on multiple calls", () => {
    const player1 = getPlayer();
    const player2 = getPlayer();
    expect(player1).toBe(player2);
  });

  test("returns AudioPlayer interface", () => {
    const player = getPlayer();
    expect(player).toBeDefined();
    expect(typeof player.play).toBe("function");
    expect(typeof player.stop).toBe("function");
  });
});
