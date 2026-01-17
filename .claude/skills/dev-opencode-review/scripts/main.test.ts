import { describe, test, expect } from "bun:test";
import { performReview } from "./main";
import {
  parseFrontmatter,
  extractSections,
  parsePlan,
  checkStructure,
  checkArchitectureAlignment,
  checkAcceptanceCriteria,
  checkErrorHandling,
  checkDependencies,
  checkSimplicity,
} from "./review";
import type { ReviewInput, StoryContext, ArchitectureSummary } from "./types";

// ============================================================================
// Test Data
// ============================================================================

const GOOD_PLAN = `---
story_id: "1-1"
story_name: "extract-youtube-transcript"
epic: "epic-1-youtube-content-extraction"
created: "2026-01-16"
status: "DRAFT"
---

# Implementation Plan: Extract YouTube Transcript

## Overview
Implement a TypeScript function to extract transcripts from YouTube videos
using the youtube-transcript-api library.

## Technical Decisions
- Use youtube-transcript-api npm package
- Use TypeScript with Bun runtime
- Store output as markdown with timestamps
- Handle videos without transcripts gracefully

## Code Structure
\`\`\`
.claude/skills/youtube-extractor/
├── scripts/
│   ├── main.ts
│   ├── extract.ts
│   ├── extract.test.ts
│   └── types.ts
└── package.json
\`\`\`

## Dependencies
- youtube-transcript-api: 2.0.0
- bun: 1.0.0

## Implementation Steps
1. Create skill folder structure
2. Write tests first (TDD)
3. Install dependencies
4. Implement extract function
   \`\`\`typescript
   export async function extract(url: string): Promise<ExtractResult>
   \`\`\`
5. Add error handling
6. Build executable

## Acceptance Criteria Mapping
| AC | Implementation |
|----|----------------|
| Valid URL extracts transcript | extract() function with success response |
| Invalid URL shows error | try/catch with custom error message |
| Timestamps preserved | Include in markdown output as [HH:MM:SS] |

## Edge Cases & Error Handling
- Invalid URL: Return error with message
- No transcript available: Return error indicating no transcript
- Network failure: Retry once with 2s timeout, then fail
- Missing resource: Return 404-style error
`;

const MINIMAL_PLAN = `# Implementation Plan

## Overview
A brief plan.

## Technical Decisions
- Use TypeScript

## Code Structure
Basic structure.

## Dependencies
None.

## Implementation Steps
1. Do the thing.

## Acceptance Criteria Mapping
| AC | Implementation |
|----|----------------|
| Works | Yes |

## Edge Cases
- Handle errors
`;

const BAD_STRUCTURE_PLAN = `# Implementation Plan

## Overview
This plan is missing several required sections.

## Some Random Section
Content here.

Just some text without proper structure.
`;

const PYTHON_PLAN = `---
story_id: "1-1"
---

# Implementation Plan

## Overview
Implement using Python scripts.

## Technical Decisions
- Use Python script for extraction
- Use pip install for dependencies
- Create .py files

## Code Structure
\`\`\`
scripts/
├── extract.py
└── requirements.txt
\`\`\`

## Dependencies
- requests: latest

## Implementation Steps
1. Create Python script
2. pip install requirements

## Acceptance Criteria Mapping
| AC | Implementation |
|----|----------------|
| Extract | Python script |

## Edge Cases
- Handle errors
`;

const OVER_ENGINEERED_PLAN = `---
story_id: "1-1"
---

# Implementation Plan

## Overview
Implement using factory pattern and dependency injection container.

## Technical Decisions
- Use factory pattern for object creation
- Implement dependency injection container for future extensibility
- Multiple layers of abstraction for flexibility
- Future proofing the architecture

## Code Structure
\`\`\`
src/
├── factories/
├── containers/
├── abstractions/
└── implementations/
\`\`\`

## Dependencies
- inversify: ^6.0.0

## Implementation Steps
1. Set up DI container
2. Create factories
3. Build abstractions
4. Implement concrete classes

## Acceptance Criteria Mapping
| AC | Implementation |
|----|----------------|
| Works | Factory creates it |

## Edge Cases
- Handle errors
`;

const UNPINNED_DEPS_PLAN = `---
story_id: "1-1"
---

# Implementation Plan

## Overview
Basic implementation.

## Technical Decisions
- Use TypeScript with Bun

## Code Structure
Basic structure.

## Dependencies
- axios: ^2.0.0
- lodash: ~4.17.0
- some-lib: >=1.0.0
- another-lib: latest

## Implementation Steps
1. Install deps
2. Implement

## Acceptance Criteria Mapping
| AC | Implementation |
|----|----------------|
| Works | Code |

## Edge Cases
- Handle errors
`;

const GOOD_STORY_CONTEXT: StoryContext = {
  id: "1-1",
  name: "extract-youtube-transcript",
  description: "Extract transcript from YouTube video",
  acceptance_criteria: [
    "Given a valid YouTube URL, transcript is extracted",
    "Given an invalid URL, clear error message is shown",
    "Transcript preserves timestamps",
  ],
};

const GOOD_ARCHITECTURE: ArchitectureSummary = {
  tech_stack: ["TypeScript", "Bun"],
  key_decisions: [
    "Use Bun runtime for all TypeScript skills",
    "Store transcripts as markdown files",
  ],
  constraints: ["No Python for new skills", "Skills must have tests"],
};

const createInput = (
  plan: string,
  story?: Partial<StoryContext>,
  arch?: Partial<ArchitectureSummary>,
  options?: ReviewInput["options"]
): ReviewInput => ({
  draft_plan: plan,
  story_context: { ...GOOD_STORY_CONTEXT, ...story },
  architecture_summary: { ...GOOD_ARCHITECTURE, ...arch },
  options,
});

// ============================================================================
// Unit Tests: Parsing
// ============================================================================

describe("Parsing Functions", () => {
  test("parseFrontmatter extracts YAML frontmatter", () => {
    const frontmatter = parseFrontmatter(GOOD_PLAN);
    expect(frontmatter.story_id).toBe("1-1");
    expect(frontmatter.story_name).toBe("extract-youtube-transcript");
    expect(frontmatter.status).toBe("DRAFT");
  });

  test("parseFrontmatter returns empty object for no frontmatter", () => {
    const frontmatter = parseFrontmatter("# No Frontmatter\nJust content.");
    expect(frontmatter).toEqual({});
  });

  test("extractSections finds all ## sections", () => {
    const sections = extractSections(GOOD_PLAN);
    expect(sections.has("overview")).toBe(true);
    expect(sections.has("technical decisions")).toBe(true);
    expect(sections.has("dependencies")).toBe(true);
  });

  test("parsePlan returns complete structure", () => {
    const plan = parsePlan(GOOD_PLAN);
    expect(plan.frontmatter.story_id).toBe("1-1");
    expect(plan.sections.size).toBeGreaterThan(0);
    expect(plan.raw_content).toBe(GOOD_PLAN);
  });
});

// ============================================================================
// Unit Tests: Individual Checks
// ============================================================================

describe("Structure Checks", () => {
  test("checkStructure passes for complete plan", () => {
    const plan = parsePlan(GOOD_PLAN);
    const issues = checkStructure(plan);
    expect(issues.length).toBe(0);
  });

  test("checkStructure finds missing sections", () => {
    const plan = parsePlan(BAD_STRUCTURE_PLAN);
    const issues = checkStructure(plan);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((i) => i.title.includes("Missing section"))).toBe(true);
  });
});

describe("Architecture Alignment", () => {
  test("checkArchitectureAlignment passes for aligned plan", () => {
    const plan = parsePlan(GOOD_PLAN);
    const issues = checkArchitectureAlignment(plan, GOOD_ARCHITECTURE);
    const critical = issues.filter((i) => i.severity === "critical");
    expect(critical.length).toBe(0);
  });

  test("checkArchitectureAlignment flags Python usage", () => {
    const plan = parsePlan(PYTHON_PLAN);
    const issues = checkArchitectureAlignment(plan, GOOD_ARCHITECTURE);
    const critical = issues.filter((i) => i.severity === "critical");
    expect(critical.length).toBeGreaterThan(0);
    expect(critical[0].title).toContain("Python");
  });
});

describe("Acceptance Criteria", () => {
  test("checkAcceptanceCriteria finds addressed criteria", () => {
    const plan = parsePlan(GOOD_PLAN);
    const { coverage } = checkAcceptanceCriteria(plan, GOOD_STORY_CONTEXT);
    expect(coverage.criteria_addressed.length).toBeGreaterThan(0);
  });

  test("checkAcceptanceCriteria finds missing criteria", () => {
    const plan = parsePlan(MINIMAL_PLAN);
    const storyWithManyAC: StoryContext = {
      ...GOOD_STORY_CONTEXT,
      acceptance_criteria: [
        "Given specific condition A, result X happens",
        "Given specific condition B, result Y happens",
        "Given specific condition C, result Z happens",
      ],
    };
    const { coverage, issues } = checkAcceptanceCriteria(plan, storyWithManyAC);
    expect(coverage.criteria_missing.length).toBeGreaterThan(0);
    expect(issues.some((i) => i.severity === "major")).toBe(true);
  });
});

describe("Error Handling", () => {
  test("checkErrorHandling passes for comprehensive error section", () => {
    const plan = parsePlan(GOOD_PLAN);
    const issues = checkErrorHandling(plan);
    // Good plan has error handling, may have minor suggestions
    const major = issues.filter((i) => i.severity === "major");
    expect(major.length).toBe(0);
  });

  test("checkErrorHandling flags missing error section", () => {
    const planWithoutErrors = `# Plan\n\n## Overview\nNo error handling section.`;
    const plan = parsePlan(planWithoutErrors);
    const issues = checkErrorHandling(plan);
    expect(issues.some((i) => i.title.includes("No error handling"))).toBe(true);
  });
});

describe("Dependencies", () => {
  test("checkDependencies flags unpinned versions", () => {
    const plan = parsePlan(UNPINNED_DEPS_PLAN);
    const issues = checkDependencies(plan);
    expect(issues.some((i) => i.title.includes("Unpinned"))).toBe(true);
  });

  test("checkDependencies passes for pinned versions", () => {
    const plan = parsePlan(GOOD_PLAN);
    const issues = checkDependencies(plan);
    const unpinnedIssues = issues.filter((i) => i.title.includes("Unpinned"));
    expect(unpinnedIssues.length).toBe(0);
  });
});

describe("Simplicity (KISS)", () => {
  test("checkSimplicity flags over-engineering", () => {
    const plan = parsePlan(OVER_ENGINEERED_PLAN);
    const suggestions = checkSimplicity(plan);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(
      suggestions.some((s) => s.title.includes("over-engineering"))
    ).toBe(true);
  });

  test("checkSimplicity passes for simple plan", () => {
    const plan = parsePlan(GOOD_PLAN);
    const suggestions = checkSimplicity(plan);
    const overEngineering = suggestions.filter((s) =>
      s.title.includes("over-engineering")
    );
    expect(overEngineering.length).toBe(0);
  });
});

// ============================================================================
// Integration Tests: Full Review (TC-01 through TC-09 from spec)
// ============================================================================

describe("TC-01: Good plan review", () => {
  test("returns success with few findings for complete plan", async () => {
    const input = createInput(GOOD_PLAN);
    const result = await performReview(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.error).toBeNull();
    expect(result.review.overall_quality).toMatch(/excellent|good/);
    // Should have few or no major issues
    const majorIssues = result.review.issues.filter(
      (i) => i.severity === "major" || i.severity === "critical"
    );
    expect(majorIssues.length).toBeLessThanOrEqual(2);
  });
});

describe("TC-02: Plan with missing AC", () => {
  test("returns criteria_missing for unaddressed AC", async () => {
    const input = createInput(MINIMAL_PLAN, {
      acceptance_criteria: [
        "Given a completely unique requirement, special outcome occurs",
        "Another specific requirement not in plan",
      ],
    });
    const result = await performReview(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.review.coverage_analysis.criteria_missing.length).toBeGreaterThan(0);
  });
});

describe("TC-03: Plan with bad structure", () => {
  test("returns issues about missing structure", async () => {
    const input = createInput(BAD_STRUCTURE_PLAN);
    const result = await performReview(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const structureIssues = result.review.issues.filter(
      (i) => i.section === "Document Structure"
    );
    expect(structureIssues.length).toBeGreaterThan(0);
  });
});

describe("TC-04: Plan violating architecture", () => {
  test("flags critical issue for Python usage", async () => {
    const input = createInput(PYTHON_PLAN);
    const result = await performReview(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const criticalIssues = result.review.issues.filter(
      (i) => i.severity === "critical"
    );
    expect(criticalIssues.length).toBeGreaterThan(0);
    expect(criticalIssues.some((i) => i.title.includes("Python"))).toBe(true);
    expect(result.review.overall_quality).toBe("major_issues");
  });
});

describe("TC-05: Over-engineered plan", () => {
  test("returns suggestions to simplify", async () => {
    const input = createInput(OVER_ENGINEERED_PLAN);
    const result = await performReview(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const simplicitySuggestions = result.review.suggestions.filter(
      (s) =>
        s.title.includes("over-engineering") ||
        s.description.includes("complexity")
    );
    expect(simplicitySuggestions.length).toBeGreaterThan(0);
  });
});

describe("TC-06: Empty plan", () => {
  test("returns error for empty string", async () => {
    const input = createInput("");
    const result = await performReview(input);

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error).toContain("empty");
  });

  test("returns error for whitespace-only plan", async () => {
    const input = createInput("   \n\t\n   ");
    const result = await performReview(input);

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error).toContain("empty");
  });
});

describe("TC-07: Missing story context", () => {
  test("returns error when story_context is missing", async () => {
    const result = await performReview({
      draft_plan: GOOD_PLAN,
      story_context: undefined as unknown as StoryContext,
      architecture_summary: GOOD_ARCHITECTURE,
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error).toContain("story_context");
  });

  test("returns error when acceptance_criteria is not array", async () => {
    const result = await performReview({
      draft_plan: GOOD_PLAN,
      story_context: {
        id: "1-1",
        name: "test",
        description: "test",
        acceptance_criteria: "not an array" as unknown as string[],
      },
      architecture_summary: GOOD_ARCHITECTURE,
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error).toContain("acceptance_criteria");
  });
});

describe("TC-08: Quick review depth", () => {
  test("returns fewer findings with quick depth", async () => {
    const inputQuick = createInput(UNPINNED_DEPS_PLAN, {}, {}, {
      review_depth: "quick",
      max_findings: 20,
    });
    const inputStandard = createInput(UNPINNED_DEPS_PLAN, {}, {}, {
      review_depth: "standard",
      max_findings: 20,
    });

    const quickResult = await performReview(inputQuick);
    const standardResult = await performReview(inputStandard);

    expect(quickResult.success).toBe(true);
    expect(standardResult.success).toBe(true);

    if (!quickResult.success || !standardResult.success) return;

    // Quick should filter out minor issues
    const quickMinor = quickResult.review.issues.filter(
      (i) => i.severity === "minor"
    );
    expect(quickMinor.length).toBe(0);

    // Quick should have fewer suggestions
    expect(quickResult.review.suggestions.length).toBeLessThanOrEqual(
      standardResult.review.suggestions.length
    );
  });
});

describe("TC-09: Thorough review depth", () => {
  test("returns comprehensive findings with thorough depth", async () => {
    const input = createInput(MINIMAL_PLAN, {}, {}, {
      review_depth: "thorough",
      max_findings: 20,
    });

    const result = await performReview(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    // Thorough review should have more findings
    const totalFindings =
      result.review.issues.length + result.review.suggestions.length;
    expect(totalFindings).toBeGreaterThan(0);

    // Should include suggestion about brief plan
    const briefSuggestion = result.review.suggestions.find(
      (s) => s.title.includes("brief")
    );
    expect(briefSuggestion).toBeDefined();
  });
});

// ============================================================================
// Additional Tests: Output Format Validation
// ============================================================================

describe("Output Format", () => {
  test("includes all required fields in success response", async () => {
    const input = createInput(GOOD_PLAN);
    const result = await performReview(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    // Check review structure
    expect(result.review.summary).toBeDefined();
    expect(typeof result.review.summary).toBe("string");
    expect(result.review.overall_quality).toMatch(
      /excellent|good|needs_work|major_issues/
    );
    expect(result.review.confidence_score).toBeGreaterThanOrEqual(0);
    expect(result.review.confidence_score).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.review.suggestions)).toBe(true);
    expect(Array.isArray(result.review.issues)).toBe(true);

    // Check coverage analysis
    expect(result.review.coverage_analysis).toBeDefined();
    expect(Array.isArray(result.review.coverage_analysis.criteria_addressed)).toBe(true);
    expect(Array.isArray(result.review.coverage_analysis.criteria_gaps)).toBe(true);
    expect(Array.isArray(result.review.coverage_analysis.criteria_missing)).toBe(true);

    // Check metadata
    expect(result.metadata.review_depth).toBeDefined();
    expect(typeof result.metadata.duration_seconds).toBe("number");
    expect(result.metadata.findings_count).toBeDefined();
  });

  test("includes all required fields in failure response", async () => {
    const result = await performReview({
      draft_plan: "",
      story_context: GOOD_STORY_CONTEXT,
      architecture_summary: GOOD_ARCHITECTURE,
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe("string");
    expect(result.review).toBeNull();
    expect(result.metadata.findings_count).toBeNull();
  });

  test("issue format includes all required fields", async () => {
    const input = createInput(PYTHON_PLAN);
    const result = await performReview(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    for (const issue of result.review.issues) {
      expect(issue.id).toMatch(/^ISS-\d{3}$/);
      expect(["critical", "major", "minor"]).toContain(issue.severity);
      expect(typeof issue.section).toBe("string");
      expect(typeof issue.title).toBe("string");
      expect(typeof issue.description).toBe("string");
      expect(typeof issue.recommendation).toBe("string");
      expect(
        issue.acceptance_criteria === null ||
          typeof issue.acceptance_criteria === "string"
      ).toBe(true);
    }
  });

  test("suggestion format includes all required fields", async () => {
    const input = createInput(OVER_ENGINEERED_PLAN);
    const result = await performReview(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    for (const suggestion of result.review.suggestions) {
      expect(suggestion.id).toMatch(/^SUG-\d{3}$/);
      expect(["minor", "enhancement"]).toContain(suggestion.severity);
      expect(typeof suggestion.section).toBe("string");
      expect(typeof suggestion.title).toBe("string");
      expect(typeof suggestion.description).toBe("string");
      expect(typeof suggestion.recommendation).toBe("string");
    }
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe("Edge Cases", () => {
  test("handles plan with no frontmatter", async () => {
    const planNoFrontmatter = `# Implementation Plan

## Overview
No frontmatter here.

## Technical Decisions
- Use TypeScript

## Code Structure
Basic.

## Dependencies
None.

## Implementation Steps
1. Do it.

## Acceptance Criteria Mapping
| AC | Impl |
|----|------|
| Yes | Yes |

## Edge Cases
- Errors
`;
    const input = createInput(planNoFrontmatter);
    const result = await performReview(input);

    expect(result.success).toBe(true);
  });

  test("ensures at least one finding", async () => {
    const input = createInput(GOOD_PLAN);
    const result = await performReview(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const totalFindings =
      result.review.issues.length + result.review.suggestions.length;
    expect(totalFindings).toBeGreaterThanOrEqual(1);
  });

  test("respects max_findings limit", async () => {
    const input = createInput(BAD_STRUCTURE_PLAN, {}, {}, {
      max_findings: 3,
    });
    const result = await performReview(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.review.issues.length).toBeLessThanOrEqual(3);
  });

  test("handles missing architecture_summary", async () => {
    const result = await performReview({
      draft_plan: GOOD_PLAN,
      story_context: GOOD_STORY_CONTEXT,
      architecture_summary: undefined as unknown as ArchitectureSummary,
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error).toContain("architecture_summary");
  });
});

// ============================================================================
// Metadata Tests
// ============================================================================

describe("Metadata", () => {
  test("records review depth in metadata", async () => {
    const input = createInput(GOOD_PLAN, {}, {}, { review_depth: "thorough" });
    const result = await performReview(input);

    expect(result.success).toBe(true);
    expect(result.metadata.review_depth).toBe("thorough");
  });

  test("records findings count correctly", async () => {
    const input = createInput(PYTHON_PLAN);
    const result = await performReview(input);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const counts = result.metadata.findings_count!;
    const actualCritical = result.review.issues.filter(
      (i) => i.severity === "critical"
    ).length;
    const actualMajor = result.review.issues.filter(
      (i) => i.severity === "major"
    ).length;
    const actualMinor = result.review.issues.filter(
      (i) => i.severity === "minor"
    ).length;

    expect(counts.issues_critical).toBe(actualCritical);
    expect(counts.issues_major).toBe(actualMajor);
    expect(counts.issues_minor).toBe(actualMinor);
    expect(counts.suggestions).toBe(result.review.suggestions.length);
  });

  test("duration_seconds is a non-negative number", async () => {
    const input = createInput(GOOD_PLAN);
    const result = await performReview(input);

    expect(result.metadata.duration_seconds).toBeGreaterThanOrEqual(0);
  });
});
