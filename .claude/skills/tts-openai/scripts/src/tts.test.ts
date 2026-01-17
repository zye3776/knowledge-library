import { describe, expect, test, beforeEach, afterEach, mock } from "bun:test";
import { mkdir, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import {
  createClient,
  generateSpeech,
  generateSpeechToFile,
  generateParagraphsAudio,
  getApiKey,
  requireApiKey,
} from "./tts";

describe("createClient", () => {
  test("creates OpenAI client with API key", () => {
    const client = createClient("test-api-key");
    expect(client).toBeDefined();
    expect(client.audio).toBeDefined();
    expect(client.audio.speech).toBeDefined();
  });
});

describe("getApiKey", () => {
  const originalEnv = process.env.OPENAI_API_KEY;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.OPENAI_API_KEY = originalEnv;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  test("returns API key from environment", () => {
    process.env.OPENAI_API_KEY = "test-key-123";
    expect(getApiKey()).toBe("test-key-123");
  });

  test("returns undefined when not set", () => {
    delete process.env.OPENAI_API_KEY;
    expect(getApiKey()).toBeUndefined();
  });
});

describe("requireApiKey", () => {
  const originalEnv = process.env.OPENAI_API_KEY;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.OPENAI_API_KEY = originalEnv;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  test("returns API key when set", () => {
    process.env.OPENAI_API_KEY = "test-key-456";
    expect(requireApiKey()).toBe("test-key-456");
  });

  test("throws when API key not set", () => {
    delete process.env.OPENAI_API_KEY;
    expect(() => requireApiKey()).toThrow("OPENAI_API_KEY environment variable not set");
  });
});

describe("generateSpeech", () => {
  test("calls OpenAI API with correct parameters", async () => {
    const mockCreate = mock(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      })
    );

    const mockClient = {
      audio: {
        speech: {
          create: mockCreate,
        },
      },
    } as any;

    const buffer = await generateSpeech(mockClient, "Hello world", "nova", "tts-1");

    expect(mockCreate).toHaveBeenCalledWith({
      model: "tts-1",
      voice: "nova",
      input: "Hello world",
    });
    expect(buffer).toBeInstanceOf(Buffer);
  });

  test("returns Buffer from API response", async () => {
    const testData = new Uint8Array([1, 2, 3, 4]);
    const mockClient = {
      audio: {
        speech: {
          create: mock(() =>
            Promise.resolve({
              arrayBuffer: () => Promise.resolve(testData.buffer),
            })
          ),
        },
      },
    } as any;

    const buffer = await generateSpeech(mockClient, "Test", "echo", "tts-1");
    expect(buffer.length).toBe(4);
  });
});

describe("generateSpeechToFile", () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `tts-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  test("writes audio buffer to file", async () => {
    const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const mockClient = {
      audio: {
        speech: {
          create: mock(() =>
            Promise.resolve({
              arrayBuffer: () => Promise.resolve(testData.buffer),
            })
          ),
        },
      },
    } as any;

    const outputPath = join(testDir, "output.mp3");
    await generateSpeechToFile(mockClient, "Test", "nova", "tts-1", outputPath);

    const file = Bun.file(outputPath);
    expect(await file.exists()).toBe(true);
    const content = await file.arrayBuffer();
    expect(new Uint8Array(content)).toEqual(testData);
  });
});

describe("generateParagraphsAudio", () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `tts-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  test("creates paragraphs directory", async () => {
    const mockClient = {
      audio: {
        speech: {
          create: mock(() =>
            Promise.resolve({
              arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
            })
          ),
        },
      },
    } as any;

    await generateParagraphsAudio(
      mockClient,
      ["Paragraph one.", "Paragraph two."],
      testDir,
      "nova",
      "tts-1"
    );

    const paragraphsDir = join(testDir, "paragraphs");
    const file = Bun.file(paragraphsDir);
    // Check directory exists by trying to list it
    const { readdir } = await import("fs/promises");
    const files = await readdir(paragraphsDir);
    expect(files.length).toBe(2);
  });

  test("generates numbered audio files", async () => {
    const mockClient = {
      audio: {
        speech: {
          create: mock(() =>
            Promise.resolve({
              arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
            })
          ),
        },
      },
    } as any;

    await generateParagraphsAudio(
      mockClient,
      ["One.", "Two.", "Three."],
      testDir,
      "nova",
      "tts-1"
    );

    const paragraphsDir = join(testDir, "paragraphs");
    expect(await Bun.file(join(paragraphsDir, "001.mp3")).exists()).toBe(true);
    expect(await Bun.file(join(paragraphsDir, "002.mp3")).exists()).toBe(true);
    expect(await Bun.file(join(paragraphsDir, "003.mp3")).exists()).toBe(true);
  });

  test("skips already generated files", async () => {
    const mockCreate = mock(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      })
    );
    const mockClient = {
      audio: {
        speech: {
          create: mockCreate,
        },
      },
    } as any;

    // Pre-create first file
    const paragraphsDir = join(testDir, "paragraphs");
    await mkdir(paragraphsDir, { recursive: true });
    await Bun.write(join(paragraphsDir, "001.mp3"), "existing");

    await generateParagraphsAudio(
      mockClient,
      ["One.", "Two."],
      testDir,
      "nova",
      "tts-1"
    );

    // Should only call API once (for paragraph 2)
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  test("calls progress callback", async () => {
    const mockClient = {
      audio: {
        speech: {
          create: mock(() =>
            Promise.resolve({
              arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
            })
          ),
        },
      },
    } as any;

    const progressCalls: Array<[number, number]> = [];
    const onProgress = (current: number, total: number) => {
      progressCalls.push([current, total]);
    };

    await generateParagraphsAudio(
      mockClient,
      ["One.", "Two."],
      testDir,
      "nova",
      "tts-1",
      0,
      onProgress
    );

    expect(progressCalls).toEqual([
      [1, 2],
      [2, 2],
    ]);
  });

  test("respects shouldStop callback", async () => {
    const mockCreate = mock(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      })
    );
    const mockClient = {
      audio: {
        speech: {
          create: mockCreate,
        },
      },
    } as any;

    let stopAfter = 1;
    const shouldStop = () => {
      stopAfter--;
      return stopAfter < 0;
    };

    await generateParagraphsAudio(
      mockClient,
      ["One.", "Two.", "Three."],
      testDir,
      "nova",
      "tts-1",
      0,
      undefined,
      shouldStop
    );

    // Should only generate first paragraph before stop
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  test("respects startFrom parameter", async () => {
    const mockCreate = mock(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      })
    );
    const mockClient = {
      audio: {
        speech: {
          create: mockCreate,
        },
      },
    } as any;

    await generateParagraphsAudio(
      mockClient,
      ["One.", "Two.", "Three."],
      testDir,
      "nova",
      "tts-1",
      2 // Start from paragraph 3
    );

    // Should only generate third paragraph
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
});
