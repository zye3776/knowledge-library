#!/usr/bin/env node
import { OpenAI } from "openai";
// import * as dotenv from "dotenv";
import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { spawn } from "child_process";

// Load environment variables
// dotenv.config({ path: path.join(__dirname, "../.env") });


const VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
type Voice = (typeof VOICES)[number];
const DEFAULT_VOICE: Voice = "nova";
const DEFAULT_MODEL = "tts-1";

const program = new Command();

program
  .name("speak")
  .description("OpenAI TTS - Convert text to speech (say-command compatible)")
  .argument("[text]", "Text to speak")
  .option("-f, --file <file>", "Read text from file")
  .option("-v, --voice <voice>", `Voice to use (default: ${DEFAULT_VOICE})`, DEFAULT_VOICE)
  .option("-o, --output <file>", "Save audio to file instead of playing")
  .option("--model <model>", `Model to use (default: ${DEFAULT_MODEL})`, DEFAULT_MODEL)
  .option("--list-voices", "List available voices")
  .action(async (textArg, options) => {
    try {
      if (options.listVoices) {
        console.log("Available voices:");
        VOICES.forEach((v) => {
          const marker = v === DEFAULT_VOICE ? " (default)" : "";
          console.log(`  ${v}${marker}`);
        });
        process.exit(0);
      }

      let text = textArg;

      // Handle file input
      if (options.file) {
        if (options.file === "-") {
          text = fs.readFileSync(0, "utf-8"); // Read from stdin
        } else {
          try {
            text = fs.readFileSync(options.file, "utf-8");
          } catch (error) {
            console.error(`Error: File not found: ${options.file}`);
            process.exit(1);
          }
        }
      } else if (!text && !process.stdin.isTTY) {
        // Read from piped stdin if no text arg and not TTY
        try {
            text = fs.readFileSync(0, "utf-8");
        } catch (e) {
            // ignore
        }
      }

      if (!text || !text.trim()) {
        // If we still have no text, show help
        if (!options.file && !options.listVoices) {
            program.help();
        }
        console.error("Error: No text provided.");
        process.exit(1);
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error("Error: OPENAI_API_KEY environment variable not set.");
        process.exit(1);
      }

      if (!VOICES.includes(options.voice as Voice)) {
        console.error(`Error: Invalid voice '${options.voice}'. Choose from: ${VOICES.join(", ")}`);
        process.exit(1);
      }

      const client = new OpenAI({ apiKey });

      const response = await client.audio.speech.create({
        model: options.model,
        voice: options.voice as Voice,
        input: text,
      });

      const buffer = Buffer.from(await response.arrayBuffer());

      if (options.output) {
        fs.writeFileSync(options.output, buffer);
        console.log(`Audio saved to: ${options.output}`);
      } else {
        // Play directly using a temp file
        const tmpDir = os.tmpdir();
        const tmpPath = path.join(tmpDir, `speech-${Date.now()}.mp3`);
        fs.writeFileSync(tmpPath, buffer);

        try {
          // macOS: use afplay
          const child = spawn("afplay", [tmpPath]);
          
          await new Promise<void>((resolve, reject) => {
            child.on("close", (code) => {
              if (code === 0) resolve();
              else reject(new Error(`afplay exited with code ${code}`));
            });
            child.on("error", reject);
          });
        } catch (error) {
            console.error(`Error playing audio: ${error}`);
        } finally {
            try {
                fs.unlinkSync(tmpPath);
            } catch (e) {
                // ignore
            }
        }
      }
    } catch (error: any) {
      console.error(`Error: ${error.message || error}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
