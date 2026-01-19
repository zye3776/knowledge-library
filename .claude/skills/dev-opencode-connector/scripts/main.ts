#!/usr/bin/env bun
/**
 * dev-opencode-connector
 * CLI entry point for OpenCode connector skill
 *
 * This skill bridges OpenCode development sessions with BMAD party mode.
 * It sends implementation plans to OpenCode and yields questions back
 * to the calling agent for multi-agent deliberation.
 */

import { parseArgs } from "util";
import { createConnector, DEFAULT_CONFIG, DEFAULT_TIMEOUT_MS } from "./connector";
import type { ConnectorInput, OpenCodeAnswer, ConnectorResult } from "./types";

// ============================================================================
// CLI Interface
// ============================================================================

function printHelp(): void {
  console.log(`
dev-opencode-connector - Bridge OpenCode sessions with BMAD party mode

Usage:
  opencode-connector --plan <path> [options]
  opencode-connector --check                    # Check if OpenCode is running

Options:
  -p, --plan <path>     Path to implementation plan markdown file
  -H, --host <host>     OpenCode server host (default: 127.0.0.1)
  -P, --port <port>     OpenCode server port (default: 4096)
  --check               Check if OpenCode server is reachable
  -h, --help            Show this help

Environment:
  OPENCODE_SERVER_PASSWORD    Password for OpenCode server (optional)

Examples:
  # Check connection
  opencode-connector --check

  # Run with plan
  opencode-connector --plan ./implementation-plan.md

  # Run with custom host/port
  opencode-connector --plan ./plan.md --host localhost --port 5000

Output Format (JSON):
  When a question is yielded:
  {
    "type": "question",
    "data": {
      "session_id": "...",
      "question_id": "q-1",
      "question": "Which database should we use?",
      "context": { ... }
    }
  }

  When completed:
  {
    "type": "result",
    "data": {
      "success": true,
      "session_id": "...",
      "summary": "...",
      "files_changed": [...]
    }
  }

Interactive Mode:
  The connector outputs JSON to stdout and reads answers from stdin.
  To answer a question, write JSON to stdin:
  {"question_id": "q-1", "answer": "Use PostgreSQL"}
`);
}

// ============================================================================
// JSON Communication Protocol
// ============================================================================

interface QuestionOutput {
  type: "question";
  data: {
    session_id: string;
    question_id: string;
    question: string;
    context: {
      current_task: string;
      files_involved: string[];
      code_snippet?: string;
    };
  };
}

interface ResultOutput {
  type: "result";
  data: ConnectorResult;
}

interface StatusOutput {
  type: "status";
  message: string;
}

interface ErrorOutput {
  type: "error";
  message: string;
}

type Output = QuestionOutput | ResultOutput | StatusOutput | ErrorOutput;

function output(data: Output): void {
  console.log(JSON.stringify(data));
}

// ============================================================================
// Input Reading (for interactive mode)
// ============================================================================

async function readAnswer(): Promise<OpenCodeAnswer | null> {
  const reader = Bun.stdin.stream().getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Look for complete JSON object
      const newlineIndex = buffer.indexOf("\n");
      if (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);

        if (line) {
          try {
            const parsed = JSON.parse(line) as OpenCodeAnswer;
            reader.releaseLock();
            return parsed;
          } catch {
            // Invalid JSON, continue reading
          }
        }
      }
    }
  } catch {
    // Stream closed
  }

  reader.releaseLock();
  return null;
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      plan: { type: "string", short: "p" },
      host: { type: "string", short: "H" },
      port: { type: "string", short: "P" },
      check: { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: true,
  });

  if (values.help) {
    printHelp();
    process.exit(0);
  }

  const host = values.host ?? DEFAULT_CONFIG.host;
  const port = values.port ? parseInt(values.port, 10) : DEFAULT_CONFIG.port;
  const password = process.env.OPENCODE_SERVER_PASSWORD;

  const connector = createConnector({ host, port, password });

  // Check mode
  if (values.check) {
    const connected = await connector.checkConnection();
    if (connected) {
      output({ type: "status", message: `Connected to OpenCode at ${host}:${port}` });
      process.exit(0);
    } else {
      output({
        type: "error",
        message: `Cannot connect to OpenCode at ${host}:${port}. Is 'opencode serve' running?`,
      });
      process.exit(1);
    }
  }

  // Require plan for run mode
  if (!values.plan) {
    output({ type: "error", message: "Missing required argument: --plan <path>" });
    process.exit(1);
  }

  const input: ConnectorInput = {
    plan_path: values.plan,
    opencode: { host, port, password },
  };

  // Run the connector
  const generator = connector.run(input);
  let lastAnswer: OpenCodeAnswer | undefined;

  try {
    while (true) {
      const { value, done } = await generator.next(lastAnswer);

      if (done) {
        // Final result
        output({ type: "result", data: value as ConnectorResult });
        const result = value as ConnectorResult;
        process.exit(result.success ? 0 : 1);
      }

      // Check if it's a question (has question_id) or result
      if ("question_id" in value) {
        // It's a question - output and wait for answer
        output({
          type: "question",
          data: value,
        });

        // Read answer from stdin
        const answer = await readAnswer();
        if (answer) {
          lastAnswer = answer;
        } else {
          // No answer received - abort
          output({ type: "error", message: "No answer received, aborting session" });
          await connector.abort();
          process.exit(1);
        }
      }
    }
  } catch (error) {
    output({
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    });
    await connector.abort();
    process.exit(1);
  }
}

// Run
main().catch((error) => {
  output({
    type: "error",
    message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
  });
  process.exit(1);
});
