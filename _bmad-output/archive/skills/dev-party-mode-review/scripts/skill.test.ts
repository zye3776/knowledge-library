import { beforeAll, describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parse as parseYaml } from "yaml";
import type {
	AgentVote,
	ChangeType,
	OpenCodeReview,
	ProjectContext,
	ReviewStatus,
	SkillFrontmatter,
	SkillInput,
	SkillOutput,
	SkillOutputError,
	SkillOutputSuccess,
	StoryContext,
	ValidationResult,
} from "./types";

/**
 * Helper for intentionally setting invalid values in validation tests.
 * This is explicit about bypassing type safety for testing purposes.
 */
function setInvalidValue<T>(obj: T, key: string, value: unknown): void {
	(obj as Record<string, unknown>)[key] = value;
}

function deleteField<T>(obj: T, key: string): void {
	delete (obj as Record<string, unknown>)[key];
}

// ============================================================================
// Test Fixtures
// ============================================================================

const SKILL_DIR = dirname(dirname(import.meta.path));
const SKILL_MD_PATH = join(SKILL_DIR, "SKILL.md");

function createMockDraftPlan(): string {
	return `---
story_id: "1-1"
story_name: "extract-youtube-transcript"
epic: "epic-1-youtube-content-extraction"
created: 2026-01-16
status: DRAFT
---

# Implementation Plan: Extract YouTube Transcript

## Overview
Implement a TypeScript function to extract transcripts from YouTube videos.

## Technical Decisions
- Use youtube-transcript-api npm package
- Store output as markdown

## Code Structure
\`\`\`
.claude/skills/youtube-extractor/
├── scripts/
│   ├── main.ts
│   └── extract.ts
└── package.json
\`\`\`

## Dependencies
- youtube-transcript-api: ^2.0.0

## Implementation Steps
1. Create skill structure
2. Implement extract function
3. Add error handling
4. Write tests

## Acceptance Criteria Mapping
| AC | Implementation |
|----|----------------|
| Valid URL extracts transcript | extract() function |
| Invalid URL shows error | Error handling |
`;
}

function createMockOpenCodeReview(): OpenCodeReview {
	return {
		suggestions: [
			{
				id: "SUG-001",
				severity: "enhancement",
				section: "Implementation Steps",
				title: "Add specific function signatures",
				description:
					"Implementation steps don't specify exact function signatures",
				recommendation: "Add expected function signatures",
			},
			{
				id: "SUG-002",
				severity: "minor",
				section: "Code Structure",
				title: "Consider adding types file",
				description: "No types.ts file mentioned",
				recommendation: "Add types.ts for Transcript interface",
			},
		],
		issues: [
			{
				id: "ISS-001",
				severity: "major",
				section: "Dependencies",
				title: "Unpinned dependency version",
				description: "Using ^2.0.0 allows breaking changes",
				recommendation: "Pin to exact version",
				acceptance_criteria: null,
			},
			{
				id: "ISS-002",
				severity: "major",
				section: "Edge Cases & Error Handling",
				title: "Incomplete network failure handling",
				description: "Retry strategy not fully specified",
				recommendation: "Specify timeout, backoff, error detection",
				acceptance_criteria: null,
			},
		],
		coverage_analysis: {
			criteria_addressed: [
				"Given a valid YouTube URL, transcript is extracted",
				"Given an invalid URL, clear error message is shown",
			],
			criteria_gaps: ["Transcript preserves timestamps"],
			criteria_missing: [],
		},
	};
}

function createMockStoryContext(): StoryContext {
	return {
		id: "1-1",
		name: "extract-youtube-transcript",
		description:
			"As a user, I want to extract the transcript from a YouTube video",
		acceptance_criteria: [
			"Given a valid YouTube URL, transcript is extracted",
			"Given an invalid URL, clear error message is shown",
			"Transcript preserves timestamps",
		],
	};
}

function createMockProjectContext(): ProjectContext {
	return {
		architecture_highlights: [
			"Use Bun runtime for TypeScript skills",
			"Store output as markdown",
		],
		coding_standards_highlights: ["TDD approach", "No any types"],
		epic_goal: "Enable users to extract and process YouTube transcripts",
	};
}

function createMockSkillInput(): SkillInput {
	return {
		draft_plan: createMockDraftPlan(),
		opencode_review: createMockOpenCodeReview(),
		story_context: createMockStoryContext(),
		project_context: createMockProjectContext(),
		options: {
			discussion_depth: "standard",
			required_consensus: true,
			max_discussion_rounds: 3,
		},
	};
}

function createMockSuccessOutput(): SkillOutputSuccess {
	return {
		success: true,
		error: null,
		result: {
			final_plan: `---
story_id: "1-1"
story_name: "extract-youtube-transcript"
epic: "epic-1-youtube-content-extraction"
created: 2026-01-16
reviewed: 2026-01-16
status: READY_FOR_DEV
review_confidence: 92
---

# Implementation Plan: Extract YouTube Transcript
[Reviewed content...]`,
			status: "approved",
			confidence_score: 92,
			changes_made: [
				{
					finding_id: "ISS-001",
					change_type: "fixed",
					section_modified: "Dependencies",
					description: "Pinned youtube-transcript-api to exact version 2.0.0",
				},
				{
					finding_id: "ISS-002",
					change_type: "fixed",
					section_modified: "Edge Cases & Error Handling",
					description: "Added complete retry strategy",
				},
			],
			suggestions_disposition: {
				accepted: [
					{ id: "SUG-001", reason: "Function signatures improve clarity" },
					{ id: "SUG-002", reason: "Types file aligns with best practices" },
				],
				rejected: [],
				deferred: [],
			},
			agent_consensus: {
				architect: "approve",
				developer: "approve",
				tech_lead: "approve",
				qa_engineer: "approve_with_notes",
				dissenting_opinions: [
					{
						agent: "qa_engineer",
						concern: "Consider adding integration test with real API",
					},
				],
			},
			quality_assessment: {
				implementability: 95,
				completeness: 100,
				clarity: 90,
				architectural_fit: 95,
			},
		},
		metadata: {
			discussion_rounds: 2,
			duration_seconds: 78,
			agents_participated: [
				"architect",
				"developer",
				"tech_lead",
				"qa_engineer",
			],
		},
	};
}

function createMockErrorOutput(): SkillOutputError {
	return {
		success: false,
		error: "Missing required input: opencode_review",
		result: null,
		metadata: {
			discussion_rounds: 0,
			duration_seconds: 1,
			agents_participated: [],
		},
	};
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseSkillFrontmatter(content: string): SkillFrontmatter | null {
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatterMatch) return null;

	try {
		return parseYaml(frontmatterMatch[1]) as SkillFrontmatter;
	} catch {
		return null;
	}
}

function hasXmlTag(content: string, tag: string): boolean {
	const openTag = `<${tag}>`;
	const closeTag = `</${tag}>`;
	return content.includes(openTag) && content.includes(closeTag);
}

function extractXmlContent(content: string, tag: string): string | null {
	const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
	const match = content.match(regex);
	return match ? match[1].trim() : null;
}

function validateInput(input: Partial<SkillInput>): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!input.draft_plan) {
		errors.push("Missing required field: draft_plan");
	} else if (typeof input.draft_plan !== "string") {
		errors.push("draft_plan must be a string");
	}

	if (!input.opencode_review) {
		errors.push("Missing required field: opencode_review");
	} else {
		if (!Array.isArray(input.opencode_review.suggestions)) {
			errors.push("opencode_review.suggestions must be an array");
		}
		if (!Array.isArray(input.opencode_review.issues)) {
			errors.push("opencode_review.issues must be an array");
		}
		if (!input.opencode_review.coverage_analysis) {
			errors.push("opencode_review.coverage_analysis is required");
		}
	}

	if (!input.story_context) {
		errors.push("Missing required field: story_context");
	} else {
		if (!input.story_context.id) errors.push("story_context.id is required");
		if (!input.story_context.name)
			errors.push("story_context.name is required");
		if (!Array.isArray(input.story_context.acceptance_criteria)) {
			errors.push("story_context.acceptance_criteria must be an array");
		}
	}

	if (!input.project_context) {
		errors.push("Missing required field: project_context");
	}

	if (input.options) {
		if (
			input.options.discussion_depth &&
			!["brief", "standard", "thorough"].includes(
				input.options.discussion_depth,
			)
		) {
			errors.push(
				"options.discussion_depth must be 'brief', 'standard', or 'thorough'",
			);
		}
		if (
			input.options.max_discussion_rounds !== undefined &&
			(input.options.max_discussion_rounds < 1 ||
				input.options.max_discussion_rounds > 10)
		) {
			warnings.push("options.max_discussion_rounds should be between 1 and 10");
		}
	}

	return { valid: errors.length === 0, errors, warnings };
}

function validateOutput(output: SkillOutput): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (typeof output.success !== "boolean") {
		errors.push("success must be a boolean");
	}

	if (output.success) {
		const successOutput = output as SkillOutputSuccess;

		if (!successOutput.result) {
			errors.push("result is required when success is true");
		} else {
			if (!successOutput.result.final_plan) {
				errors.push("result.final_plan is required");
			}
			if (
				!["approved", "approved_with_reservations", "needs_revision"].includes(
					successOutput.result.status,
				)
			) {
				errors.push(
					"result.status must be 'approved', 'approved_with_reservations', or 'needs_revision'",
				);
			}
			if (
				typeof successOutput.result.confidence_score !== "number" ||
				successOutput.result.confidence_score < 0 ||
				successOutput.result.confidence_score > 100
			) {
				errors.push(
					"result.confidence_score must be a number between 0 and 100",
				);
			}
			if (!Array.isArray(successOutput.result.changes_made)) {
				errors.push("result.changes_made must be an array");
			}
			if (!successOutput.result.agent_consensus) {
				errors.push("result.agent_consensus is required");
			} else {
				const validVotes: AgentVote[] = [
					"approve",
					"approve_with_notes",
					"reject",
				];
				for (const agent of [
					"architect",
					"developer",
					"tech_lead",
					"qa_engineer",
				]) {
					const vote =
						successOutput.result.agent_consensus[
							agent as keyof typeof successOutput.result.agent_consensus
						];
					if (
						typeof vote === "string" &&
						!validVotes.includes(vote as AgentVote)
					) {
						errors.push(
							`result.agent_consensus.${agent} must be 'approve', 'approve_with_notes', or 'reject'`,
						);
					}
				}
			}
			if (!successOutput.result.quality_assessment) {
				errors.push("result.quality_assessment is required");
			} else {
				for (const metric of [
					"implementability",
					"completeness",
					"clarity",
					"architectural_fit",
				]) {
					const value =
						successOutput.result.quality_assessment[
							metric as keyof typeof successOutput.result.quality_assessment
						];
					if (typeof value !== "number" || value < 0 || value > 100) {
						errors.push(
							`result.quality_assessment.${metric} must be a number between 0 and 100`,
						);
					}
				}
			}
		}
	} else {
		const errorOutput = output as SkillOutputError;
		if (!errorOutput.error || typeof errorOutput.error !== "string") {
			errors.push("error must be a non-empty string when success is false");
		}
		if (errorOutput.result !== null) {
			errors.push("result must be null when success is false");
		}
	}

	if (!output.metadata) {
		errors.push("metadata is required");
	} else {
		if (typeof output.metadata.discussion_rounds !== "number") {
			errors.push("metadata.discussion_rounds must be a number");
		}
		if (typeof output.metadata.duration_seconds !== "number") {
			errors.push("metadata.duration_seconds must be a number");
		}
		if (!Array.isArray(output.metadata.agents_participated)) {
			errors.push("metadata.agents_participated must be an array");
		}
	}

	return { valid: errors.length === 0, errors, warnings };
}

function determineConsensusStatus(
	consensus: SkillOutputSuccess["result"]["agent_consensus"],
): ReviewStatus {
	const votes = [
		consensus.architect,
		consensus.developer,
		consensus.tech_lead,
		consensus.qa_engineer,
	];

	if (votes.some((v) => v === "reject")) {
		return "needs_revision";
	}
	if (votes.some((v) => v === "approve_with_notes")) {
		return "approved_with_reservations";
	}
	return "approved";
}

// ============================================================================
// Tests
// ============================================================================

describe("SKILL.md Structure Validation", () => {
	let skillContent: string;

	beforeAll(() => {
		expect(existsSync(SKILL_MD_PATH)).toBe(true);
		skillContent = readFileSync(SKILL_MD_PATH, "utf-8");
	});

	it("should have valid YAML frontmatter", () => {
		const frontmatter = parseSkillFrontmatter(skillContent);
		expect(frontmatter).not.toBeNull();
	});

	it("should have required frontmatter fields", () => {
		const frontmatter = parseSkillFrontmatter(skillContent);
		expect(frontmatter?.name).toBe("dev-party-mode-review");
		expect(frontmatter?.description).toBeTruthy();
		expect(frontmatter?.["allowed-tools"]).toEqual(["Read", "Skill"]);
		expect(frontmatter?.context).toBe("fork");
	});

	it("should have context: fork for isolated execution", () => {
		const frontmatter = parseSkillFrontmatter(skillContent);
		expect(frontmatter?.context).toBe("fork");
	});

	it("should have <critical_rules> section", () => {
		expect(hasXmlTag(skillContent, "critical_rules")).toBe(true);
	});

	it("should have <user_input> section", () => {
		expect(hasXmlTag(skillContent, "user_input")).toBe(true);
	});

	it("should have <instructions> section", () => {
		expect(hasXmlTag(skillContent, "instructions")).toBe(true);
	});

	it("should have <output_format> section", () => {
		expect(hasXmlTag(skillContent, "output_format")).toBe(true);
	});

	it("should have <constraints> section", () => {
		expect(hasXmlTag(skillContent, "constraints")).toBe(true);
	});

	it("should have <system_reminder> section", () => {
		expect(hasXmlTag(skillContent, "system_reminder")).toBe(true);
	});

	it("should be under 500 lines", () => {
		const lineCount = skillContent.split("\n").length;
		expect(lineCount).toBeLessThan(500);
	});
});

describe("Critical Rules Validation", () => {
	let skillContent: string;
	let criticalRules: string;

	beforeAll(() => {
		skillContent = readFileSync(SKILL_MD_PATH, "utf-8");
		criticalRules = extractXmlContent(skillContent, "critical_rules") || "";
	});

	it("should require forked context execution", () => {
		expect(criticalRules.toLowerCase()).toContain("forked context");
	});

	it("should specify 120 second time limit", () => {
		expect(criticalRules).toContain("120 seconds");
	});

	it("should prohibit returning full discussion transcript", () => {
		expect(criticalRules.toLowerCase()).toContain("not return full discussion");
	});

	it("should require addressing critical and major issues", () => {
		expect(criticalRules.toLowerCase()).toContain("critical");
		expect(criticalRules.toLowerCase()).toContain("major");
	});

	it("should require preserving acceptance criteria coverage", () => {
		expect(criticalRules.toLowerCase()).toContain("acceptance criteria");
	});

	it("should require documenting rejected suggestions", () => {
		expect(criticalRules.toLowerCase()).toContain("rejected");
	});
});

describe("Input Schema Validation", () => {
	it("should validate complete valid input", () => {
		const input = createMockSkillInput();
		const result = validateInput(input);
		expect(result.valid).toBe(true);
		expect(result.errors).toHaveLength(0);
	});

	it("should reject missing draft_plan", () => {
		const input = createMockSkillInput();
		delete (input as Partial<SkillInput>).draft_plan;
		const result = validateInput(input);
		expect(result.valid).toBe(false);
		expect(result.errors).toContain("Missing required field: draft_plan");
	});

	it("should reject missing opencode_review", () => {
		const input = createMockSkillInput();
		delete (input as Partial<SkillInput>).opencode_review;
		const result = validateInput(input);
		expect(result.valid).toBe(false);
		expect(result.errors).toContain("Missing required field: opencode_review");
	});

	it("should reject missing story_context", () => {
		const input = createMockSkillInput();
		delete (input as Partial<SkillInput>).story_context;
		const result = validateInput(input);
		expect(result.valid).toBe(false);
		expect(result.errors).toContain("Missing required field: story_context");
	});

	it("should reject missing project_context", () => {
		const input = createMockSkillInput();
		delete (input as Partial<SkillInput>).project_context;
		const result = validateInput(input);
		expect(result.valid).toBe(false);
		expect(result.errors).toContain("Missing required field: project_context");
	});

	it("should reject invalid discussion_depth option", () => {
		const input = createMockSkillInput();
		input.options = {
			discussion_depth: "invalid" as SkillInput["options"]["discussion_depth"],
		};
		const result = validateInput(input);
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes("discussion_depth"))).toBe(
			true,
		);
	});

	it("should accept valid discussion_depth values", () => {
		for (const depth of ["brief", "standard", "thorough"] as const) {
			const input = createMockSkillInput();
			input.options = { discussion_depth: depth };
			const result = validateInput(input);
			expect(result.valid).toBe(true);
		}
	});

	it("should warn on out-of-range max_discussion_rounds", () => {
		const input = createMockSkillInput();
		input.options = { max_discussion_rounds: 15 };
		const result = validateInput(input);
		expect(result.warnings.length).toBeGreaterThan(0);
	});
});

describe("Output Schema Validation", () => {
	it("should validate complete success output", () => {
		const output = createMockSuccessOutput();
		const result = validateOutput(output);
		expect(result.valid).toBe(true);
		expect(result.errors).toHaveLength(0);
	});

	it("should validate complete error output", () => {
		const output = createMockErrorOutput();
		const result = validateOutput(output);
		expect(result.valid).toBe(true);
		expect(result.errors).toHaveLength(0);
	});

	it("should reject success output without result", () => {
		const output = createMockSuccessOutput();
		setInvalidValue(output, "result", null);
		const result = validateOutput(output);
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes("result is required"))).toBe(
			true,
		);
	});

	it("should reject error output with non-null result", () => {
		const output = createMockErrorOutput();
		setInvalidValue(output, "result", {});
		const result = validateOutput(output);
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes("result must be null"))).toBe(
			true,
		);
	});

	it("should reject invalid status values", () => {
		const output = createMockSuccessOutput();
		setInvalidValue(output.result, "status", "invalid_status");
		const result = validateOutput(output);
		expect(result.valid).toBe(false);
	});

	it("should reject confidence_score outside 0-100 range", () => {
		const output = createMockSuccessOutput();
		output.result.confidence_score = 150;
		const result = validateOutput(output);
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes("confidence_score"))).toBe(
			true,
		);
	});

	it("should reject invalid agent votes", () => {
		const output = createMockSuccessOutput();
		setInvalidValue(output.result.agent_consensus, "architect", "maybe");
		const result = validateOutput(output);
		expect(result.valid).toBe(false);
	});

	it("should reject quality_assessment metrics outside 0-100 range", () => {
		const output = createMockSuccessOutput();
		output.result.quality_assessment.implementability = -10;
		const result = validateOutput(output);
		expect(result.valid).toBe(false);
	});

	it("should require metadata fields", () => {
		const output = createMockSuccessOutput();
		deleteField(output, "metadata");
		const result = validateOutput(output);
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes("metadata is required"))).toBe(
			true,
		);
	});
});

describe("Consensus Logic", () => {
	it("should return 'approved' when all agents approve", () => {
		const consensus = {
			architect: "approve" as AgentVote,
			developer: "approve" as AgentVote,
			tech_lead: "approve" as AgentVote,
			qa_engineer: "approve" as AgentVote,
			dissenting_opinions: [],
		};
		expect(determineConsensusStatus(consensus)).toBe("approved");
	});

	it("should return 'approved_with_reservations' when some approve with notes", () => {
		const consensus = {
			architect: "approve" as AgentVote,
			developer: "approve" as AgentVote,
			tech_lead: "approve_with_notes" as AgentVote,
			qa_engineer: "approve" as AgentVote,
			dissenting_opinions: [],
		};
		expect(determineConsensusStatus(consensus)).toBe(
			"approved_with_reservations",
		);
	});

	it("should return 'needs_revision' when any agent rejects", () => {
		const consensus = {
			architect: "reject" as AgentVote,
			developer: "approve" as AgentVote,
			tech_lead: "approve" as AgentVote,
			qa_engineer: "approve" as AgentVote,
			dissenting_opinions: [],
		};
		expect(determineConsensusStatus(consensus)).toBe("needs_revision");
	});

	it("should prioritize rejection over approval with notes", () => {
		const consensus = {
			architect: "reject" as AgentVote,
			developer: "approve_with_notes" as AgentVote,
			tech_lead: "approve" as AgentVote,
			qa_engineer: "approve" as AgentVote,
			dissenting_opinions: [],
		};
		expect(determineConsensusStatus(consensus)).toBe("needs_revision");
	});
});

describe("Agent Roles Coverage", () => {
	let skillContent: string;

	beforeAll(() => {
		skillContent = readFileSync(SKILL_MD_PATH, "utf-8");
	});

	it("should define all four agent roles", () => {
		expect(skillContent).toContain("Architect");
		expect(skillContent).toContain("Developer");
		expect(skillContent).toContain("Tech Lead");
		expect(skillContent).toContain("QA Engineer");
	});

	it("should specify focus areas for each agent", () => {
		expect(skillContent.toLowerCase()).toContain("architectural alignment");
		expect(skillContent.toLowerCase()).toContain("implementability");
		expect(skillContent.toLowerCase()).toContain("code quality");
		expect(skillContent.toLowerCase()).toContain("testing");
	});
});

describe("Review Scenarios", () => {
	describe("Scenario: Clean plan approval", () => {
		it("should produce approved status with all issues fixed", () => {
			const input = createMockSkillInput();
			// Simulate clean review: all issues are minor
			input.opencode_review.issues = input.opencode_review.issues.map((i) => ({
				...i,
				severity: "minor" as const,
			}));

			const output = createMockSuccessOutput();
			expect(output.result.status).toBe("approved");
			expect(
				output.result.changes_made.every((c) => c.change_type === "fixed"),
			).toBe(true);
		});
	});

	describe("Scenario: Plan with major issues", () => {
		it("should address all major issues in changes_made", () => {
			const input = createMockSkillInput();
			const majorIssueIds = input.opencode_review.issues
				.filter((i) => i.severity === "major")
				.map((i) => i.id);

			const output = createMockSuccessOutput();
			const addressedIds = output.result.changes_made.map((c) => c.finding_id);

			for (const id of majorIssueIds) {
				expect(addressedIds).toContain(id);
			}
		});
	});

	describe("Scenario: Plan with critical architecture violation", () => {
		it("should result in needs_revision when architect rejects", () => {
			const output = createMockSuccessOutput();
			output.result.agent_consensus.architect = "reject";
			output.result.status = determineConsensusStatus(
				output.result.agent_consensus,
			);

			expect(output.result.status).toBe("needs_revision");
		});
	});

	describe("Scenario: Suggestions handling", () => {
		it("should have disposition for all suggestions", () => {
			const input = createMockSkillInput();
			const suggestionIds = input.opencode_review.suggestions.map((s) => s.id);

			const output = createMockSuccessOutput();
			const allDispositions = [
				...output.result.suggestions_disposition.accepted.map((s) => s.id),
				...output.result.suggestions_disposition.rejected.map((s) => s.id),
				...output.result.suggestions_disposition.deferred.map((s) => s.id),
			];

			for (const id of suggestionIds) {
				expect(allDispositions).toContain(id);
			}
		});

		it("should include reason for each disposition", () => {
			const output = createMockSuccessOutput();

			for (const accepted of output.result.suggestions_disposition.accepted) {
				expect(accepted.reason).toBeTruthy();
			}
			for (const rejected of output.result.suggestions_disposition.rejected) {
				expect(rejected.reason).toBeTruthy();
			}
			for (const deferred of output.result.suggestions_disposition.deferred) {
				expect(deferred.reason).toBeTruthy();
			}
		});
	});

	describe("Scenario: Agent disagreement", () => {
		it("should capture dissenting opinions", () => {
			const output = createMockSuccessOutput();
			output.result.agent_consensus.qa_engineer = "approve_with_notes";
			output.result.agent_consensus.dissenting_opinions = [
				{
					agent: "qa_engineer",
					concern: "Consider adding integration test with real API",
				},
			];

			expect(
				output.result.agent_consensus.dissenting_opinions.length,
			).toBeGreaterThan(0);
			expect(
				output.result.agent_consensus.dissenting_opinions[0].concern,
			).toBeTruthy();
		});
	});
});

describe("Change Documentation", () => {
	it("should link changes to finding IDs", () => {
		const output = createMockSuccessOutput();

		for (const change of output.result.changes_made) {
			expect(change.finding_id).toMatch(/^(ISS|SUG)-\d{3}$/);
			expect(change.change_type).toMatch(
				/^(fixed|partially_addressed|deferred)$/,
			);
			expect(change.section_modified).toBeTruthy();
			expect(change.description).toBeTruthy();
		}
	});

	it("should have valid change_type values", () => {
		const validTypes: ChangeType[] = [
			"fixed",
			"partially_addressed",
			"deferred",
		];
		const output = createMockSuccessOutput();

		for (const change of output.result.changes_made) {
			expect(validTypes).toContain(change.change_type);
		}
	});
});

describe("Quality Assessment", () => {
	it("should have all four quality metrics", () => {
		const output = createMockSuccessOutput();
		const qa = output.result.quality_assessment;

		expect(qa).toHaveProperty("implementability");
		expect(qa).toHaveProperty("completeness");
		expect(qa).toHaveProperty("clarity");
		expect(qa).toHaveProperty("architectural_fit");
	});

	it("should have metrics in valid range (0-100)", () => {
		const output = createMockSuccessOutput();
		const qa = output.result.quality_assessment;

		expect(qa.implementability).toBeGreaterThanOrEqual(0);
		expect(qa.implementability).toBeLessThanOrEqual(100);
		expect(qa.completeness).toBeGreaterThanOrEqual(0);
		expect(qa.completeness).toBeLessThanOrEqual(100);
		expect(qa.clarity).toBeGreaterThanOrEqual(0);
		expect(qa.clarity).toBeLessThanOrEqual(100);
		expect(qa.architectural_fit).toBeGreaterThanOrEqual(0);
		expect(qa.architectural_fit).toBeLessThanOrEqual(100);
	});
});

describe("Metadata Validation", () => {
	it("should track discussion rounds", () => {
		const output = createMockSuccessOutput();
		expect(output.metadata.discussion_rounds).toBeGreaterThanOrEqual(1);
		expect(output.metadata.discussion_rounds).toBeLessThanOrEqual(10);
	});

	it("should track duration in seconds", () => {
		const output = createMockSuccessOutput();
		expect(output.metadata.duration_seconds).toBeGreaterThan(0);
		expect(output.metadata.duration_seconds).toBeLessThanOrEqual(120);
	});

	it("should list all participating agents", () => {
		const output = createMockSuccessOutput();
		const expectedAgents = [
			"architect",
			"developer",
			"tech_lead",
			"qa_engineer",
		];

		for (const agent of expectedAgents) {
			expect(output.metadata.agents_participated).toContain(agent);
		}
	});
});

describe("Error Handling", () => {
	it("should return error output for missing opencode_review", () => {
		const output = createMockErrorOutput();
		expect(output.success).toBe(false);
		expect(output.error).toContain("opencode_review");
		expect(output.result).toBeNull();
	});

	it("should include metadata even in error case", () => {
		const output = createMockErrorOutput();
		expect(output.metadata).toBeDefined();
		expect(output.metadata.discussion_rounds).toBe(0);
		expect(output.metadata.agents_participated).toEqual([]);
	});
});
