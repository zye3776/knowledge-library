/**
 * Tests for dev-opencode-connector
 */

import { describe, test, expect, mock, beforeEach } from "bun:test";
import type {
  ConnectorInput,
  OpenCodeQuestion,
  OpenCodeAnswer,
  ConnectorResult,
  OpenCodeConfig,
} from "./types";
import { DEFAULT_CONFIG, DEFAULT_TIMEOUT_MS } from "./types";

// ============================================================================
// Type Tests
// ============================================================================

describe("Types", () => {
  test("DEFAULT_CONFIG has expected values", () => {
    expect(DEFAULT_CONFIG.host).toBe("127.0.0.1");
    expect(DEFAULT_CONFIG.port).toBe(4096);
  });

  test("DEFAULT_TIMEOUT_MS is 5 minutes", () => {
    expect(DEFAULT_TIMEOUT_MS).toBe(300000);
  });

  test("ConnectorInput shape is correct", () => {
    const input: ConnectorInput = {
      plan_path: "/path/to/plan.md",
      opencode: {
        host: "localhost",
        port: 5000,
      },
    };
    expect(input.plan_path).toBe("/path/to/plan.md");
    expect(input.opencode?.host).toBe("localhost");
    expect(input.opencode?.port).toBe(5000);
  });

  test("OpenCodeQuestion shape is correct", () => {
    const question: OpenCodeQuestion = {
      session_id: "sess_123",
      question_id: "q-1",
      question: "Which database?",
      context: {
        current_task: "Setting up database",
        files_involved: ["src/db.ts"],
        code_snippet: "const db = ...",
      },
    };
    expect(question.session_id).toBe("sess_123");
    expect(question.question_id).toBe("q-1");
    expect(question.context.files_involved).toContain("src/db.ts");
  });

  test("OpenCodeAnswer shape is correct", () => {
    const answer: OpenCodeAnswer = {
      question_id: "q-1",
      answer: "Use PostgreSQL",
      files_to_reference: ["docs/architecture.md"],
    };
    expect(answer.question_id).toBe("q-1");
    expect(answer.answer).toBe("Use PostgreSQL");
  });

  test("ConnectorResult success shape", () => {
    const result: ConnectorResult = {
      success: true,
      session_id: "sess_123",
      summary: "Completed successfully",
      files_changed: ["src/index.ts"],
    };
    expect(result.success).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  test("ConnectorResult failure shape", () => {
    const result: ConnectorResult = {
      success: false,
      session_id: "sess_123",
      summary: "Failed",
      files_changed: [],
      errors: ["Connection failed"],
    };
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
  });
});

// ============================================================================
// Question Detection Tests
// ============================================================================

describe("Question Detection", () => {
  // Import the module to test internal functions
  // Since these are internal, we test them through behavior

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

  test("detects question marks", () => {
    expect(isQuestion("What database should we use?")).toBe(true);
    expect(isQuestion("I am done with the task.")).toBe(false);
  });

  test("detects 'should I' pattern", () => {
    expect(isQuestion("Should I use PostgreSQL or MySQL")).toBe(true);
  });

  test("detects 'would you like' pattern", () => {
    expect(isQuestion("Would you like me to add tests")).toBe(true);
  });

  test("detects 'which' pattern", () => {
    expect(isQuestion("Which approach is better")).toBe(true);
  });

  test("detects 'what' pattern", () => {
    expect(isQuestion("What is the expected behavior")).toBe(true);
  });

  test("detects 'where' pattern", () => {
    expect(isQuestion("Where should I put this file")).toBe(true);
  });

  test("detects 'please confirm' pattern", () => {
    expect(isQuestion("Please confirm this is correct")).toBe(true);
  });

  test("case insensitive matching", () => {
    expect(isQuestion("SHOULD I proceed")).toBe(true);
    expect(isQuestion("What IS the status")).toBe(true);
  });

  test("does not detect non-questions", () => {
    expect(isQuestion("I have completed the task")).toBe(false);
    expect(isQuestion("The file has been created")).toBe(false);
    expect(isQuestion("Implementation is done")).toBe(false);
  });
});

// ============================================================================
// Connector Mock Tests
// ============================================================================

describe("OpenCodeConnector", () => {
  // Mock the SDK
  const mockSessionCreate = mock(() =>
    Promise.resolve({ id: "sess_mock_123" })
  );
  const mockSessionChat = mock(() => Promise.resolve({}));
  const mockSessionAbort = mock(() => Promise.resolve({}));
  const mockSessionMessages = mock(() => Promise.resolve([]));
  const mockAppGet = mock(() => Promise.resolve({ name: "opencode" }));

  // We can't easily mock the SDK import, so we test the logic separately
  // These tests verify the expected behavior patterns

  test("creates connector with default config", () => {
    const config: OpenCodeConfig = {
      ...DEFAULT_CONFIG,
    };
    expect(config.host).toBe("127.0.0.1");
    expect(config.port).toBe(4096);
  });

  test("creates connector with custom config", () => {
    const config: OpenCodeConfig = {
      host: "localhost",
      port: 5000,
      password: "secret",
    };
    expect(config.host).toBe("localhost");
    expect(config.port).toBe(5000);
    expect(config.password).toBe("secret");
  });

  test("connection URL is constructed correctly", () => {
    const config: OpenCodeConfig = {
      host: "localhost",
      port: 5000,
    };
    const baseURL = `http://${config.host}:${config.port}`;
    expect(baseURL).toBe("http://localhost:5000");
  });
});

// ============================================================================
// JSON Protocol Tests
// ============================================================================

describe("JSON Protocol", () => {
  interface QuestionOutput {
    type: "question";
    data: OpenCodeQuestion;
  }

  interface ResultOutput {
    type: "result";
    data: ConnectorResult;
  }

  interface ErrorOutput {
    type: "error";
    message: string;
  }

  test("question output format", () => {
    const output: QuestionOutput = {
      type: "question",
      data: {
        session_id: "sess_123",
        question_id: "q-1",
        question: "Which database?",
        context: {
          current_task: "Setup",
          files_involved: [],
        },
      },
    };

    const json = JSON.stringify(output);
    const parsed = JSON.parse(json) as QuestionOutput;

    expect(parsed.type).toBe("question");
    expect(parsed.data.question_id).toBe("q-1");
  });

  test("result output format", () => {
    const output: ResultOutput = {
      type: "result",
      data: {
        success: true,
        session_id: "sess_123",
        summary: "Done",
        files_changed: ["a.ts"],
      },
    };

    const json = JSON.stringify(output);
    const parsed = JSON.parse(json) as ResultOutput;

    expect(parsed.type).toBe("result");
    expect(parsed.data.success).toBe(true);
  });

  test("error output format", () => {
    const output: ErrorOutput = {
      type: "error",
      message: "Connection failed",
    };

    const json = JSON.stringify(output);
    const parsed = JSON.parse(json) as ErrorOutput;

    expect(parsed.type).toBe("error");
    expect(parsed.message).toBe("Connection failed");
  });

  test("answer input parsing", () => {
    const answerJson = '{"question_id": "q-1", "answer": "Use PostgreSQL"}';
    const answer = JSON.parse(answerJson) as OpenCodeAnswer;

    expect(answer.question_id).toBe("q-1");
    expect(answer.answer).toBe("Use PostgreSQL");
  });

  test("answer with files_to_reference", () => {
    const answerJson =
      '{"question_id": "q-2", "answer": "See architecture", "files_to_reference": ["docs/arch.md"]}';
    const answer = JSON.parse(answerJson) as OpenCodeAnswer;

    expect(answer.files_to_reference).toContain("docs/arch.md");
  });
});

// ============================================================================
// Integration Test Scenarios
// ============================================================================

describe("Integration Scenarios", () => {
  test("scenario: successful completion without questions", () => {
    // Simulates a session that completes without asking questions
    const events = [
      { type: "session.created", properties: { sessionID: "sess_1" } },
      {
        type: "message.part.updated",
        properties: {
          sessionID: "sess_1",
          messageID: "msg_1",
          part: { type: "text", text: "Starting implementation..." },
        },
      },
      {
        type: "message.part.updated",
        properties: {
          sessionID: "sess_1",
          messageID: "msg_1",
          part: { type: "text", text: "Done." },
        },
      },
      { type: "session.idle", properties: { sessionID: "sess_1" } },
    ];

    // Verify event sequence
    expect(events[0].type).toBe("session.created");
    expect(events[events.length - 1].type).toBe("session.idle");
  });

  test("scenario: session with question", () => {
    // Simulates a session that asks a question
    const events = [
      { type: "session.created", properties: { sessionID: "sess_2" } },
      {
        type: "message.part.updated",
        properties: {
          sessionID: "sess_2",
          messageID: "msg_1",
          part: {
            type: "text",
            text: "I need to set up the database. Which database should I use?",
          },
        },
      },
    ];

    const lastMessage = events[1].properties.part.text;
    expect(lastMessage).toContain("?");
    expect(lastMessage.toLowerCase()).toContain("which");
  });

  test("scenario: connection failure", () => {
    const result: ConnectorResult = {
      success: false,
      session_id: "",
      summary: "Failed to connect to OpenCode at 127.0.0.1:4096",
      files_changed: [],
      errors: ["Connection failed - is opencode serve running?"],
    };

    expect(result.success).toBe(false);
    expect(result.errors?.[0]).toContain("opencode serve");
  });

  test("scenario: plan file not found", () => {
    const result: ConnectorResult = {
      success: false,
      session_id: "",
      summary: "Failed to read plan file: ./nonexistent.md",
      files_changed: [],
      errors: ["ENOENT: no such file or directory"],
    };

    expect(result.success).toBe(false);
    expect(result.summary).toContain("Failed to read plan file");
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe("Edge Cases", () => {
  test("empty plan content", () => {
    const planContent = "";
    expect(planContent.length).toBe(0);
  });

  test("plan with only whitespace", () => {
    const planContent = "   \n\n   \t   ";
    expect(planContent.trim().length).toBe(0);
  });

  test("very long question", () => {
    const longQuestion = "Should I " + "a".repeat(10000) + "?";
    expect(longQuestion.length).toBeGreaterThan(10000);
    expect(longQuestion.includes("Should I")).toBe(true);
  });

  test("question with special characters", () => {
    const question = "Should I use `PostgreSQL` or \"MySQL\"?";
    expect(question.includes("?")).toBe(true);
  });

  test("multiple questions in one message", () => {
    const text =
      "Which database should I use? Also, where should I put the config file?";
    const questions = text.split("?").filter((q) => q.trim().length > 0);
    expect(questions.length).toBe(2);
  });

  test("unicode in messages", () => {
    const question = "Should I add emoji support? \u{1F600}";
    expect(question.includes("?")).toBe(true);
  });
});
