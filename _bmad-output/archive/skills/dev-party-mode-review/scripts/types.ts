/**
 * Types for dev-party-mode-review skill
 * Based on skill specification
 */

// ============================================================================
// Input Types
// ============================================================================

export interface OpenCodeSuggestion {
	id: string;
	severity: "enhancement" | "minor" | "major";
	section: string;
	title: string;
	description: string;
	recommendation: string;
}

export interface OpenCodeIssue {
	id: string;
	severity: "critical" | "major" | "minor";
	section: string;
	title: string;
	description: string;
	recommendation: string;
	acceptance_criteria: string | null;
}

export interface CoverageAnalysis {
	criteria_addressed: string[];
	criteria_gaps: string[];
	criteria_missing: string[];
}

export interface OpenCodeReview {
	suggestions: OpenCodeSuggestion[];
	issues: OpenCodeIssue[];
	coverage_analysis: CoverageAnalysis;
}

export interface StoryContext {
	id: string;
	name: string;
	description: string;
	acceptance_criteria: string[];
}

export interface ProjectContext {
	architecture_highlights: string[];
	coding_standards_highlights: string[];
	epic_goal: string;
}

export interface SkillOptions {
	discussion_depth?: "brief" | "standard" | "thorough";
	required_consensus?: boolean;
	max_discussion_rounds?: number;
}

export interface SkillInput {
	draft_plan: string;
	opencode_review: OpenCodeReview;
	story_context: StoryContext;
	project_context: ProjectContext;
	options?: SkillOptions;
}

// ============================================================================
// Output Types
// ============================================================================

export type ChangeType = "fixed" | "partially_addressed" | "deferred";
export type AgentVote = "approve" | "approve_with_notes" | "reject";
export type ReviewStatus =
	| "approved"
	| "approved_with_reservations"
	| "needs_revision";

export interface ChangeMade {
	finding_id: string;
	change_type: ChangeType;
	section_modified: string;
	description: string;
}

export interface SuggestionDisposition {
	id: string;
	reason: string;
}

export interface SuggestionsDisposition {
	accepted: SuggestionDisposition[];
	rejected: SuggestionDisposition[];
	deferred: SuggestionDisposition[];
}

export interface DissentingOpinion {
	agent: string;
	concern: string;
}

export interface AgentConsensus {
	architect: AgentVote;
	developer: AgentVote;
	tech_lead: AgentVote;
	qa_engineer: AgentVote;
	dissenting_opinions: DissentingOpinion[];
}

export interface QualityAssessment {
	implementability: number;
	completeness: number;
	clarity: number;
	architectural_fit: number;
}

export interface SkillResult {
	final_plan: string;
	status: ReviewStatus;
	confidence_score: number;
	changes_made: ChangeMade[];
	suggestions_disposition: SuggestionsDisposition;
	agent_consensus: AgentConsensus;
	quality_assessment: QualityAssessment;
}

export interface SkillMetadata {
	discussion_rounds: number;
	duration_seconds: number;
	agents_participated: string[];
}

export interface SkillOutputSuccess {
	success: true;
	error: null;
	result: SkillResult;
	metadata: SkillMetadata;
}

export interface SkillOutputError {
	success: false;
	error: string;
	result: null;
	metadata: SkillMetadata;
}

export type SkillOutput = SkillOutputSuccess | SkillOutputError;

// ============================================================================
// SKILL.md Structure Types
// ============================================================================

export interface SkillFrontmatter {
	name: string;
	description: string;
	"allowed-tools": string[];
	context: "fork" | "inherit";
}

export interface SkillStructure {
	frontmatter: SkillFrontmatter;
	hasCriticalRules: boolean;
	hasUserInput: boolean;
	hasInstructions: boolean;
	hasOutputFormat: boolean;
	hasConstraints: boolean;
	hasSystemReminder: boolean;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}

// ============================================================================
// Agent Role Types
// ============================================================================

export type AgentRole = "architect" | "developer" | "tech_lead" | "qa_engineer";

export interface AgentFocus {
	role: AgentRole;
	focusArea: string;
	keyQuestions: string[];
}

export const AGENT_FOCUSES: AgentFocus[] = [
	{
		role: "architect",
		focusArea: "Architectural alignment",
		keyQuestions: [
			"Does the plan fit the system architecture?",
			"Are technical decisions consistent with architecture.md?",
			"Are there any architectural anti-patterns?",
		],
	},
	{
		role: "developer",
		focusArea: "Implementability",
		keyQuestions: [
			"Can I actually build this from these instructions?",
			"Are the steps clear and actionable?",
			"Are dependencies and tools correct?",
		],
	},
	{
		role: "tech_lead",
		focusArea: "Code quality and patterns",
		keyQuestions: [
			"Does the structure follow our patterns?",
			"Is the code organization appropriate?",
			"Are there code quality concerns?",
		],
	},
	{
		role: "qa_engineer",
		focusArea: "Testing and edge cases",
		keyQuestions: [
			"Are all acceptance criteria testable?",
			"Are edge cases properly handled?",
			"Is error handling comprehensive?",
		],
	},
];
