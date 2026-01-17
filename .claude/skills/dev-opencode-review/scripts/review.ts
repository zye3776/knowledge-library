/**
 * Review logic for dev-opencode-review skill
 * Analyzes implementation plans and generates findings
 */

import type {
  ReviewInput,
  Review,
  Issue,
  Suggestion,
  CoverageAnalysis,
  ParsedPlan,
  PlanFrontmatter,
  OverallQuality,
} from "./types";

// ============================================================================
// Plan Parsing
// ============================================================================

/**
 * Parse YAML frontmatter from plan content
 */
export function parseFrontmatter(content: string): PlanFrontmatter {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return {};
  }

  const frontmatter: PlanFrontmatter = {};
  const lines = frontmatterMatch[1].split("\n");

  for (const line of lines) {
    const match = line.match(/^(\w+):\s*"?([^"]*)"?$/);
    if (match) {
      const [, key, value] = match;
      switch (key) {
        case "story_id":
          frontmatter.story_id = value;
          break;
        case "story_name":
          frontmatter.story_name = value;
          break;
        case "epic":
          frontmatter.epic = value;
          break;
        case "created":
          frontmatter.created = value;
          break;
        case "status":
          frontmatter.status = value;
          break;
      }
    }
  }

  return frontmatter;
}

/**
 * Extract sections from plan content
 */
export function extractSections(content: string): Map<string, string> {
  const sections = new Map<string, string>();
  const sectionRegex = /^##\s+(.+)$/gm;
  let match;
  const matches: { title: string; index: number }[] = [];

  while ((match = sectionRegex.exec(content)) !== null) {
    matches.push({ title: match[1], index: match.index });
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i < matches.length - 1 ? matches[i + 1].index : content.length;
    const sectionContent = content.slice(start, end).trim();
    sections.set(matches[i].title.toLowerCase(), sectionContent);
  }

  return sections;
}

/**
 * Parse implementation plan into structured format
 */
export function parsePlan(content: string): ParsedPlan {
  return {
    frontmatter: parseFrontmatter(content),
    sections: extractSections(content),
    raw_content: content,
  };
}

// ============================================================================
// Review Checks
// ============================================================================

let issueCounter = 0;
let suggestionCounter = 0;

function resetCounters(): void {
  issueCounter = 0;
  suggestionCounter = 0;
}

function nextIssueId(): string {
  issueCounter++;
  return `ISS-${String(issueCounter).padStart(3, "0")}`;
}

function nextSuggestionId(): string {
  suggestionCounter++;
  return `SUG-${String(suggestionCounter).padStart(3, "0")}`;
}

/**
 * Check if plan has required sections
 */
export function checkStructure(plan: ParsedPlan): Issue[] {
  const issues: Issue[] = [];
  const requiredSections = [
    "overview",
    "technical decisions",
    "code structure",
    "dependencies",
    "implementation steps",
    "acceptance criteria mapping",
    "edge cases",
  ];

  const foundSections = Array.from(plan.sections.keys());

  for (const required of requiredSections) {
    const found = foundSections.some(
      (s) => s.includes(required) || required.includes(s.split(" ")[0])
    );
    if (!found) {
      issues.push({
        id: nextIssueId(),
        severity: "major",
        section: "Document Structure",
        title: `Missing section: ${required}`,
        description: `The plan is missing a "${required}" section which is required for implementation clarity.`,
        recommendation: `Add a "## ${required.charAt(0).toUpperCase() + required.slice(1)}" section with appropriate content.`,
        acceptance_criteria: null,
      });
    }
  }

  return issues;
}

/**
 * Check plan against architecture constraints
 */
export function checkArchitectureAlignment(
  plan: ParsedPlan,
  architecture: ReviewInput["architecture_summary"]
): Issue[] {
  const issues: Issue[] = [];
  const content = plan.raw_content.toLowerCase();

  // Check for constraint violations
  for (const constraint of architecture.constraints) {
    const constraintLower = constraint.toLowerCase();

    // Check for "No Python" constraint
    if (constraintLower.includes("no python") || constraintLower.includes("not python")) {
      if (content.includes("python") && !content.includes("no python")) {
        // Check if Python is being used, not just mentioned in a constraint
        const pythonUsagePatterns = [
          /python\s+script/i,
          /\.py\b/i,
          /pip\s+install/i,
          /import\s+\w+\s+#\s*python/i,
        ];
        for (const pattern of pythonUsagePatterns) {
          if (pattern.test(plan.raw_content)) {
            issues.push({
              id: nextIssueId(),
              severity: "critical",
              section: "Technical Decisions",
              title: "Architecture violation: Python usage",
              description: `Plan uses Python which violates architecture constraint: "${constraint}"`,
              recommendation: "Use TypeScript with Bun runtime instead of Python.",
              acceptance_criteria: null,
            });
            break;
          }
        }
      }
    }
  }

  // Check tech stack alignment
  const techDecisionsSection =
    plan.sections.get("technical decisions") ?? plan.raw_content;

  for (const tech of architecture.tech_stack) {
    if (!techDecisionsSection.toLowerCase().includes(tech.toLowerCase())) {
      // Only flag if it's a critical tech like runtime
      if (["bun", "typescript"].includes(tech.toLowerCase())) {
        issues.push({
          id: nextIssueId(),
          severity: "minor",
          section: "Technical Decisions",
          title: `Tech stack: ${tech} not mentioned`,
          description: `The architecture specifies "${tech}" but it's not explicitly mentioned in technical decisions.`,
          recommendation: `Explicitly mention "${tech}" in the Technical Decisions section.`,
          acceptance_criteria: null,
        });
      }
    }
  }

  return issues;
}

/**
 * Check acceptance criteria coverage
 */
export function checkAcceptanceCriteria(
  plan: ParsedPlan,
  storyContext: ReviewInput["story_context"]
): { issues: Issue[]; coverage: CoverageAnalysis } {
  const issues: Issue[] = [];
  const coverage: CoverageAnalysis = {
    criteria_addressed: [],
    criteria_gaps: [],
    criteria_missing: [],
  };

  const acSection =
    plan.sections.get("acceptance criteria mapping") ??
    plan.sections.get("acceptance criteria") ??
    "";
  const planContent = plan.raw_content.toLowerCase();

  for (const ac of storyContext.acceptance_criteria) {
    const acLower = ac.toLowerCase();
    // Extract key terms from AC for matching
    const keyTerms = acLower
      .split(/\s+/)
      .filter((t) => t.length > 4)
      .slice(0, 5);

    const matchCount = keyTerms.filter((term) =>
      planContent.includes(term)
    ).length;

    if (matchCount >= Math.ceil(keyTerms.length * 0.6)) {
      // Check if explicitly mapped
      if (acSection && acSection.toLowerCase().includes(keyTerms[0])) {
        coverage.criteria_addressed.push(ac);
      } else {
        coverage.criteria_gaps.push(ac);
        issues.push({
          id: nextIssueId(),
          severity: "minor",
          section: "Acceptance Criteria Mapping",
          title: "AC not explicitly mapped",
          description: `Acceptance criterion "${ac.slice(0, 50)}..." appears addressed but is not explicitly mapped in the AC Mapping section.`,
          recommendation: `Add explicit mapping for this AC in the Acceptance Criteria Mapping table.`,
          acceptance_criteria: ac,
        });
      }
    } else {
      coverage.criteria_missing.push(ac);
      issues.push({
        id: nextIssueId(),
        severity: "major",
        section: "Acceptance Criteria Mapping",
        title: "AC not addressed",
        description: `Acceptance criterion "${ac.slice(0, 50)}..." does not appear to be addressed in the plan.`,
        recommendation: `Add implementation details and mapping for this acceptance criterion.`,
        acceptance_criteria: ac,
      });
    }
  }

  return { issues, coverage };
}

/**
 * Check for error handling coverage
 */
export function checkErrorHandling(plan: ParsedPlan): Issue[] {
  const issues: Issue[] = [];

  const errorSection =
    plan.sections.get("edge cases") ??
    plan.sections.get("edge cases & error handling") ??
    plan.sections.get("error handling") ??
    "";

  if (!errorSection) {
    issues.push({
      id: nextIssueId(),
      severity: "major",
      section: "Edge Cases & Error Handling",
      title: "No error handling section",
      description: "Plan lacks a dedicated error handling section.",
      recommendation:
        "Add an 'Edge Cases & Error Handling' section covering common failure scenarios.",
      acceptance_criteria: null,
    });
    return issues;
  }

  // Check for common error scenarios
  const commonScenarios = [
    { pattern: /invalid|malformed|bad.*input/i, name: "invalid input" },
    { pattern: /network|timeout|connection/i, name: "network failures" },
    { pattern: /not found|missing|404/i, name: "missing resources" },
  ];

  const errorContentLower = errorSection.toLowerCase();
  for (const scenario of commonScenarios) {
    if (!scenario.pattern.test(errorContentLower)) {
      issues.push({
        id: nextIssueId(),
        severity: "minor",
        section: "Edge Cases & Error Handling",
        title: `Missing error scenario: ${scenario.name}`,
        description: `Error handling section doesn't address ${scenario.name}.`,
        recommendation: `Add handling for ${scenario.name} scenarios.`,
        acceptance_criteria: null,
      });
    }
  }

  return issues;
}

/**
 * Check for dependency issues
 */
export function checkDependencies(plan: ParsedPlan): Issue[] {
  const issues: Issue[] = [];

  const depsSection = plan.sections.get("dependencies") ?? "";

  if (!depsSection) {
    issues.push({
      id: nextIssueId(),
      severity: "major",
      section: "Dependencies",
      title: "No dependencies section",
      description: "Plan lacks a dependencies section.",
      recommendation: "Add a 'Dependencies' section listing all required packages.",
      acceptance_criteria: null,
    });
    return issues;
  }

  // Check for unpinned versions
  const versionPatterns = [
    /:\s*\^[\d.]+/g, // ^1.0.0
    /:\s*~[\d.]+/g, // ~1.0.0
    /:\s*>=[\d.]+/g, // >=1.0.0
    /:\s*\*$/gm, // *
    /:\s*latest/gi, // latest
  ];

  for (const pattern of versionPatterns) {
    const matches = depsSection.match(pattern);
    if (matches) {
      issues.push({
        id: nextIssueId(),
        severity: "major",
        section: "Dependencies",
        title: "Unpinned dependency version",
        description: `Found unpinned version specifier: ${matches[0]}. This can lead to unexpected breaking changes.`,
        recommendation: "Pin dependencies to exact versions (e.g., '2.0.0' instead of '^2.0.0').",
        acceptance_criteria: null,
      });
      break; // Only report once
    }
  }

  return issues;
}

/**
 * Check for over-engineering (KISS violations)
 */
export function checkSimplicity(plan: ParsedPlan): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const content = plan.raw_content.toLowerCase();

  // Check for signs of over-engineering
  const overEngineeringPatterns = [
    {
      pattern: /factory\s+pattern|abstract\s+factory/i,
      name: "Factory pattern",
      reason: "Consider if a simple function would suffice",
    },
    {
      pattern: /dependency\s+injection\s+container/i,
      name: "DI container",
      reason: "Manual dependency passing may be simpler",
    },
    {
      pattern: /multiple\s+layers\s+of\s+abstraction/i,
      name: "Multiple abstraction layers",
      reason: "Consider reducing abstraction depth",
    },
    {
      pattern: /future\s+proofing|extensib/i,
      name: "Future-proofing",
      reason: "Focus on current requirements first",
    },
  ];

  for (const { pattern, name, reason } of overEngineeringPatterns) {
    if (pattern.test(content)) {
      suggestions.push({
        id: nextSuggestionId(),
        severity: "enhancement",
        section: "Technical Decisions",
        title: `Potential over-engineering: ${name}`,
        description: `Plan mentions "${name}" which may add unnecessary complexity.`,
        recommendation: reason,
      });
    }
  }

  // Check for scope creep indicators
  const scopeCreepPatterns = [
    /nice\s+to\s+have/i,
    /future\s+enhancement/i,
    /phase\s+2/i,
    /out\s+of\s+scope.*but/i,
  ];

  for (const pattern of scopeCreepPatterns) {
    if (pattern.test(content)) {
      suggestions.push({
        id: nextSuggestionId(),
        severity: "minor",
        section: "Overview",
        title: "Potential scope creep",
        description:
          "Plan mentions items that may be out of scope for this story.",
        recommendation:
          "Ensure all implementation details are within story scope. Move extras to backlog.",
      });
      break;
    }
  }

  return suggestions;
}

/**
 * Generate suggestions for improvements
 */
export function generateSuggestions(
  plan: ParsedPlan,
  codingStandards?: ReviewInput["coding_standards_summary"]
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Check for function signatures in implementation steps
  const stepsSection = plan.sections.get("implementation steps") ?? "";
  if (stepsSection && !stepsSection.includes("function") && !stepsSection.includes("async")) {
    suggestions.push({
      id: nextSuggestionId(),
      severity: "enhancement",
      section: "Implementation Steps",
      title: "Add function signatures",
      description:
        "Implementation steps don't include specific function signatures or return types.",
      recommendation:
        "Add expected function signatures (e.g., `async function extract(url: string): Promise<Result>`).",
    });
  }

  // Check for types file
  const structureSection = plan.sections.get("code structure") ?? "";
  if (structureSection && !structureSection.includes("types.ts") && !structureSection.includes("types/")) {
    suggestions.push({
      id: nextSuggestionId(),
      severity: "minor",
      section: "Code Structure",
      title: "Consider adding types file",
      description: "No types.ts file mentioned for shared interfaces.",
      recommendation: "Add `types.ts` for interface definitions.",
    });
  }

  // Check coding standards alignment if provided
  if (codingStandards?.patterns_to_use) {
    const contentLower = plan.raw_content.toLowerCase();
    for (const pattern of codingStandards.patterns_to_use) {
      if (pattern.toLowerCase().includes("tdd") && !contentLower.includes("test")) {
        suggestions.push({
          id: nextSuggestionId(),
          severity: "enhancement",
          section: "Implementation Steps",
          title: "TDD approach not evident",
          description:
            "Coding standards specify TDD but tests are not mentioned early in implementation steps.",
          recommendation: "Move test writing to an earlier step to follow TDD practices.",
        });
        break;
      }
    }
  }

  return suggestions;
}

// ============================================================================
// Main Review Function
// ============================================================================

/**
 * Perform complete review of implementation plan
 */
export function reviewPlan(input: ReviewInput): Review {
  resetCounters();

  const plan = parsePlan(input.draft_plan);
  const allIssues: Issue[] = [];
  const allSuggestions: Suggestion[] = [];

  const options = input.options ?? {};
  const reviewDepth = options.review_depth ?? "standard";
  const maxFindings = options.max_findings ?? 20;

  // Run all checks
  allIssues.push(...checkStructure(plan));
  allIssues.push(...checkArchitectureAlignment(plan, input.architecture_summary));

  const { issues: acIssues, coverage } = checkAcceptanceCriteria(
    plan,
    input.story_context
  );
  allIssues.push(...acIssues);

  allIssues.push(...checkErrorHandling(plan));
  allIssues.push(...checkDependencies(plan));

  // Suggestions
  allSuggestions.push(...checkSimplicity(plan));
  allSuggestions.push(
    ...generateSuggestions(plan, input.coding_standards_summary)
  );

  // Adjust based on review depth
  let issues = allIssues;
  let suggestions = allSuggestions;

  if (reviewDepth === "quick") {
    // Only critical and major issues
    issues = allIssues.filter((i) => i.severity !== "minor");
    suggestions = allSuggestions.slice(0, 2);
  } else if (reviewDepth === "thorough") {
    // Add additional detailed suggestions
    if (plan.raw_content.length < 500) {
      suggestions.push({
        id: nextSuggestionId(),
        severity: "enhancement",
        section: "Overview",
        title: "Plan may be too brief",
        description: "The plan is relatively short and may lack detail.",
        recommendation: "Consider adding more implementation specifics.",
      });
    }
  }

  // Limit findings
  issues = issues.slice(0, maxFindings);
  suggestions = suggestions.slice(0, Math.max(2, maxFindings - issues.length));

  // Ensure at least one finding
  if (issues.length === 0 && suggestions.length === 0) {
    suggestions.push({
      id: nextSuggestionId(),
      severity: "enhancement",
      section: "Overall",
      title: "Plan looks good",
      description: "No significant issues found in the implementation plan.",
      recommendation: "Proceed with implementation.",
    });
  }

  // Calculate overall quality
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const majorCount = issues.filter((i) => i.severity === "major").length;

  let overall_quality: OverallQuality;
  if (criticalCount > 0) {
    overall_quality = "major_issues";
  } else if (majorCount >= 3) {
    overall_quality = "needs_work";
  } else if (majorCount >= 1) {
    overall_quality = "good";
  } else {
    overall_quality = "excellent";
  }

  // Calculate confidence score
  const _totalFindings = issues.length + suggestions.length;
  const confidence_score = Math.max(
    50,
    Math.min(95, 90 - criticalCount * 15 - majorCount * 5)
  );

  // Generate summary
  const summaryParts: string[] = [];
  if (overall_quality === "excellent") {
    summaryParts.push("The plan is well-structured and comprehensive.");
  } else if (overall_quality === "good") {
    summaryParts.push("The plan is solid with minor improvements needed.");
  } else if (overall_quality === "needs_work") {
    summaryParts.push("The plan has several issues that should be addressed.");
  } else {
    summaryParts.push("The plan has critical issues that must be fixed.");
  }

  if (coverage.criteria_missing.length > 0) {
    summaryParts.push(
      `${coverage.criteria_missing.length} acceptance criteria not addressed.`
    );
  }
  if (criticalCount > 0) {
    summaryParts.push(`Found ${criticalCount} critical issue(s).`);
  }

  return {
    summary: summaryParts.join(" "),
    overall_quality,
    confidence_score,
    suggestions,
    issues,
    coverage_analysis: coverage,
  };
}
