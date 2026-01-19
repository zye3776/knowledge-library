/**
 * Types for dev-opencode-connector skill
 * Bridges OpenCode development sessions with BMAD party mode
 */

// ============================================================================
// Input Types
// ============================================================================

export interface OpenCodeConfig {
  host: string;
  port: number;
  password?: string;
}

export interface ConnectorInput {
  plan_path: string;
  opencode?: Partial<OpenCodeConfig>;
}

// ============================================================================
// Question/Answer Types (for yield/resume pattern)
// ============================================================================

export interface QuestionContext {
  current_task: string;
  files_involved: string[];
  code_snippet?: string;
}

export interface OpenCodeQuestion {
  session_id: string;
  question_id: string;
  question: string;
  context: QuestionContext;
}

export interface OpenCodeAnswer {
  question_id: string;
  answer: string;
  files_to_reference?: string[];
}

// ============================================================================
// Result Types
// ============================================================================

export interface ConnectorResult {
  success: boolean;
  session_id: string;
  summary: string;
  files_changed: string[];
  errors?: string[];
}

// ============================================================================
// Internal Types
// ============================================================================

export interface SessionState {
  session_id: string;
  status: "active" | "waiting" | "completed" | "error";
  current_question?: OpenCodeQuestion;
  files_changed: string[];
  errors: string[];
}

export type ConnectorEventType =
  | "connected"
  | "session_created"
  | "plan_sent"
  | "question_received"
  | "answer_sent"
  | "completed"
  | "error";

export interface ConnectorEvent {
  type: ConnectorEventType;
  timestamp: number;
  data?: unknown;
}

// ============================================================================
// Generator Types (for async iteration pattern)
// ============================================================================

export type YieldValue = OpenCodeQuestion | ConnectorResult;

export interface ConnectorGenerator {
  next(answer?: OpenCodeAnswer): Promise<IteratorResult<YieldValue, ConnectorResult>>;
  return(value?: ConnectorResult): Promise<IteratorResult<YieldValue, ConnectorResult>>;
  throw(error: Error): Promise<IteratorResult<YieldValue, ConnectorResult>>;
  [Symbol.asyncIterator](): ConnectorGenerator;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_CONFIG: OpenCodeConfig = {
  host: "127.0.0.1",
  port: 4096,
};

export const DEFAULT_TIMEOUT_MS = 300000; // 5 minutes per question
