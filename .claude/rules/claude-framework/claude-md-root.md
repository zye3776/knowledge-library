---
paths:
  - "CLAUDE.md"
  - ".claude/CLAUDE.md"
---

# Root CLAUDE.md Structure

The root CLAUDE.md should include these sections:

| Section | Purpose |
|---------|---------|
| **Project Overview** | One-liner describing what the project is and its tech stack |
| **Architecture** | Directory structure and key module descriptions |
| **Code Style** | Specific, actionable patterns (not vague like "format properly") |
| **Commands** | Exact, copy-pasteable commands for test, build, lint, deploy |
| **Conventions** | Naming patterns, file structures, date formats |
| **Gotchas/Notes** | Project-specific warnings, API quirks, protected files |

<constraints>
## Root-Level Requirements

- Must open with a one-liner project description orienting Claude to the domain
- Architecture section should include directory structure table
- Commands must be exact and copy-pasteable
- Include `<critical_rules>` for non-negotiable behaviors
- Include `<constraints>` for "do nots"
- End with `<system_reminder>` reinforcing key points
</constraints>

<system_reminder>
Root CLAUDE.md is loaded at session start for every conversation.
Keep it under 300 lines - use @imports and subdirectory CLAUDE.md files for details.
</system_reminder>