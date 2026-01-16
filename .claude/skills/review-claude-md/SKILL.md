---
name: review-claude-md
description: Review CLAUDE.md files for compliance with rules and freshness. Use after code changes, before commits, or during code reviews to ensure documentation stays current.
---

# Review CLAUDE.md

Review CLAUDE.md files at all levels to ensure they follow applicable rules and stay current with code changes.

<instructions>
## Step 1: Discover Applicable Rules

Use Glob to find all rules that apply to CLAUDE.md files:

```
Glob(pattern: ".claude/rules/markdown/*.md")
Glob(pattern: ".claude/rules/claude-framework/claude-md-*.md")
```

Read each discovered rule file to understand current requirements.

## Step 2: Find CLAUDE.md Files

```
Glob(pattern: "**/CLAUDE.md")
Glob(pattern: "**/CLAUDE.local.md")
```

Exclude any matches in `node_modules/`.

## Step 3: Classify Each File

- **Root level**: `./CLAUDE.md` or `./.claude/CLAUDE.md`
- **Subdirectory level**: Any other path

Root files have additional structure requirements.

## Step 4: Review Each File

For each CLAUDE.md file:

1. **Read the file** and count lines
2. **Apply rules** from Step 1 based on file level
3. **Check @imports** - verify referenced files exist
4. **Assess freshness** - compare documented patterns against codebase

## Step 5: Cross-Reference Recent Changes

```bash
git diff --name-only HEAD~5
```

Flag staleness risks when recent changes may affect documented patterns.

## Step 6: Generate Report

For each file report:
- File path and level
- Line count (flag if approaching 300)
- Issues found (with rule reference)
- Staleness risks
- Recommendations

End with summary: files reviewed, issues found, risks identified.

## Step 7: Apply Updates

If updates are needed, make the CLAUDE.md changes and include them in the same commit as the code changes that triggered the update. Documentation and code changes belong together.
</instructions>

<critical_rules>
CLAUDE.md updates MUST be committed together with the code changes that require them - never in a separate commit. This ensures documentation stays synchronized with code at every commit.
</critical_rules>

<constraints>
- Never auto-modify files - require user approval
- Never skip checking @import targets exist
- Never hardcode rule content - always read from rule files
</constraints>

<system_reminder>
Always discover rules dynamically using Glob. Rules may be added or removed - the skill must use current rule files, not cached content.
</system_reminder>
