/**
 * OpenCode Connector
 * Bridges OpenCode development sessions with BMAD party mode
 */

import { createOpencodeClient, type OpencodeClient } from "@opencode-ai/sdk";
import { readFile } from "fs/promises";
import type {
  ConnectorInput,
  OpenCodeConfig,
  OpenCodeQuestion,
  OpenCodeAnswer,
  ConnectorResult,
  SessionState,
} from "./types";

// Re-export defaults
export { DEFAULT_CONFIG, DEFAULT_TIMEOUT_MS } from "./types";

// ============================================================================
// Event Types (from OpenCode SSE stream)
// ============================================================================

interface OpenCodeEvent {
  type?: string;
  event?: string;
  data?: {
    type?: string;
    sessionID?: string;
    messageID?: string;
    part?: {
      type?: string;
      text?: string;
      state?: string;
      name?: string;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ============================================================================
// Question Detection
// ============================================================================

const QUESTION_INDICATORS = [
  "?",
  "should I",
  "would you like",
  "do you want",
  "which",
  "what",
  "where",
  "how should",
  "can you clarify",
  "please confirm",
  "is this correct",
  "let me know",
];

function isQuestion(text: string): boolean {
  const lowerText = text.toLowerCase();
  return QUESTION_INDICATORS.some((indicator) =>
    lowerText.includes(indicator.toLowerCase())
  );
}

function extractQuestionFromText(text: string): string | null {
  // Look for question patterns
  const sentences = text.split(/[.!]\s+/);
  for (const sentence of sentences) {
    if (isQuestion(sentence)) {
      return sentence.trim();
    }
  }
  // If ends with question mark, return last sentence
  if (text.trim().endsWith("?")) {
    const lastSentence = sentences[sentences.length - 1];
    return lastSentence?.trim() || null;
  }
  return null;
}

// ============================================================================
// Connector Class
// ============================================================================

export class OpenCodeConnector {
  private client: OpencodeClient;
  private config: OpenCodeConfig;
  private state: SessionState | null = null;
  private eventAbortController: AbortController | null = null;
  private questionIdCounter = 0;

  constructor(config: Partial<OpenCodeConfig> = {}) {
    this.config = {
      host: config.host ?? "127.0.0.1",
      port: config.port ?? 4096,
      password: config.password,
    };

    const baseUrl = `http://${this.config.host}:${this.config.port}`;
    this.client = createOpencodeClient({
      baseUrl,
    });
  }

  /**
   * Check if OpenCode server is reachable
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.client.config.get();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a new session and send the implementation plan
   * Returns an async generator that yields questions and expects answers
   */
  async *run(
    input: ConnectorInput
  ): AsyncGenerator<OpenCodeQuestion, ConnectorResult, OpenCodeAnswer | undefined> {
    // Check connection first
    const connected = await this.checkConnection();
    if (!connected) {
      return {
        success: false,
        session_id: "",
        summary: `Failed to connect to OpenCode at ${this.config.host}:${this.config.port}`,
        files_changed: [],
        errors: ["Connection failed - is opencode serve running?"],
      };
    }

    // Read the implementation plan
    let planContent: string;
    try {
      planContent = await readFile(input.plan_path, "utf-8");
    } catch (error) {
      return {
        success: false,
        session_id: "",
        summary: `Failed to read plan file: ${input.plan_path}`,
        files_changed: [],
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }

    // Create session
    let session;
    try {
      const response = await this.client.session.create();
      session = response.data;
    } catch (error) {
      return {
        success: false,
        session_id: "",
        summary: "Failed to create OpenCode session",
        files_changed: [],
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }

    if (!session?.id) {
      return {
        success: false,
        session_id: "",
        summary: "Failed to create OpenCode session - no session ID returned",
        files_changed: [],
        errors: ["No session ID in response"],
      };
    }

    const sessionId = session.id;
    this.state = {
      session_id: sessionId,
      status: "active",
      files_changed: [],
      errors: [],
    };

    // Send the implementation plan using promptAsync (non-blocking)
    try {
      await this.client.session.promptAsync({
        path: { id: sessionId },
        body: {
          parts: [
            {
              type: "text",
              text: `Please implement the following plan:\n\n${planContent}`,
            },
          ],
        },
      });
    } catch (error) {
      return {
        success: false,
        session_id: sessionId,
        summary: "Failed to send plan to OpenCode",
        files_changed: [],
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }

    // Subscribe to events and process
    this.eventAbortController = new AbortController();

    try {
      const eventStream = await this.client.global.event();

      let accumulatedText = "";
      let lastMessageId = "";

      for await (const event of eventStream) {
        const typedEvent = event as OpenCodeEvent;
        const eventType = typedEvent.type ?? typedEvent.event ?? typedEvent.data?.type;
        const eventData = typedEvent.data ?? typedEvent;

        // Check for session completion (idle state)
        if (eventType === "session.updated" || eventType === "session.idle") {
          const evtSessionId = eventData.sessionID ?? (eventData as Record<string, unknown>).id;
          if (evtSessionId === sessionId) {
            // Check if session is idle/completed
            const status = (eventData as Record<string, unknown>).status;
            if (status === "idle" || eventType === "session.idle") {
              this.state.status = "completed";
              break;
            }
          }
        }

        // Check for message parts
        if (eventType === "message.part.updated" || eventType === "message.updated") {
          const evtSessionId = eventData.sessionID;
          if (evtSessionId !== sessionId) continue;

          const part = eventData.part;
          if (part?.type === "text" && part.text) {
            // Track message accumulation
            const currentMessageId = eventData.messageID ?? "";
            if (currentMessageId !== lastMessageId) {
              // New message - check previous accumulated text for questions
              if (accumulatedText && isQuestion(accumulatedText)) {
                const question = extractQuestionFromText(accumulatedText);
                if (question) {
                  this.questionIdCounter++;
                  const questionObj: OpenCodeQuestion = {
                    session_id: sessionId,
                    question_id: `q-${this.questionIdCounter}`,
                    question,
                    context: {
                      current_task: "Implementation in progress",
                      files_involved: this.state.files_changed,
                    },
                  };

                  this.state.status = "waiting";
                  this.state.current_question = questionObj;

                  // Yield question and wait for answer
                  const answer = yield questionObj;

                  if (answer) {
                    // Send answer back to OpenCode
                    await this.client.session.promptAsync({
                      path: { id: sessionId },
                      body: {
                        parts: [
                          {
                            type: "text",
                            text: answer.answer,
                          },
                        ],
                      },
                    });
                  }

                  this.state.status = "active";
                  this.state.current_question = undefined;
                }
              }

              accumulatedText = "";
              lastMessageId = currentMessageId;
            }

            accumulatedText += part.text;
          }

          // Track file changes from tool usage
          if (part?.type === "tool" && part.name) {
            const toolName = part.name.toLowerCase();
            if (
              toolName.includes("write") ||
              toolName.includes("edit") ||
              toolName.includes("create")
            ) {
              // File modification detected
            }
          }
        }

        // Check for errors
        if (eventType === "message.error" || eventType === "error") {
          const errorMsg = String((eventData as Record<string, unknown>).error ?? "Unknown error");
          this.state.errors.push(errorMsg);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Graceful abort
      } else {
        this.state.errors.push(
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Get final session info for summary
    let summary = "Development session completed";
    try {
      const messagesResponse = await this.client.session.messages({ path: { id: sessionId } });
      const messages = messagesResponse.data;
      const messageCount = Array.isArray(messages) ? messages.length : 0;
      summary = `Completed with ${messageCount} messages exchanged`;
    } catch {
      // Ignore - use default summary
    }

    return {
      success: this.state.errors.length === 0,
      session_id: sessionId,
      summary,
      files_changed: this.state.files_changed,
      errors: this.state.errors.length > 0 ? this.state.errors : undefined,
    };
  }

  /**
   * Abort the current session
   */
  async abort(): Promise<void> {
    this.eventAbortController?.abort();
    if (this.state?.session_id) {
      try {
        await this.client.session.abort({ path: { id: this.state.session_id } });
      } catch {
        // Ignore abort errors
      }
    }
  }

  /**
   * Get current session state
   */
  getState(): SessionState | null {
    return this.state;
  }
}

// ============================================================================
// Convenience Function
// ============================================================================

export function createConnector(
  config?: Partial<OpenCodeConfig>
): OpenCodeConnector {
  return new OpenCodeConnector(config);
}
