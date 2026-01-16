---
paths:
  - "**/CLAUDE.md"
  - "**/CLAUDE.local.md"
---

# CLAUDE.md Best Practices

<critical_rules>
## Continuous Improvement

CLAUDE.md is a living document. You MUST proactively suggest updates when:

1. **After modifying code patterns** - When you change conventions, add new patterns, or deprecate old approaches
2. **After correcting assumptions** - When a user corrects your behavior, offer to persist the correction
3. **After discovering gotchas** - When you encounter project-specific quirks, API limitations, or workarounds
4. **After adding new commands** - When new scripts, build commands, or workflows are created
5. **After refactoring or deleting code** - When patterns documented in CLAUDE.md are removed or changed
6. **During PR reviews** - When conventions surface that weren't documented

Ask: "Should I add this to CLAUDE.md so it persists across sessions?"
</critical_rules>

## Subdirectory CLAUDE.md Files

Subdirectory CLAUDE.md files reduce duplication and keep context focused.

**How it works:**
- Claude automatically picks up CLAUDE.md files in subdirectories
- NOT loaded at launch - only when actively working in that subtree
- Each level inherits from parent but can override or extend

**File hierarchy:**

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project root, version controlled (case-sensitive name) |
| `.claude/CLAUDE.md` | Alternative root location in config subdirectory |
| `CLAUDE.local.md` | Personal preferences, gitignored |
| `~/.claude/CLAUDE.md` | User-level defaults across all projects |
| `subdir/CLAUDE.md` | Module-specific context, loaded when working in that subtree |

**Structure principle:** Global patterns in root CLAUDE.md, module-specific patterns in subdirectory CLAUDE.md files.

## Periodic Review

Review CLAUDE.md periodically to maintain quality:

- Remove outdated rules that no longer apply
- Consolidate redundant instructions
- Resolve conflicting guidance
- Verify commands still work
- Check that referenced files (`@imports`) still exist

Trigger a review after major refactors or when instructions seem stale.

<constraints>
## Content Anti-Patterns

**Vague instructions:**
- "Format code properly" → "Use Prettier with project config"
- "Follow best practices" → "Use named exports, not default exports"
- "Keep it clean" → "Max 200 lines per file"

**Over-emphasis:**
- Marking everything as IMPORTANT/MUST/NEVER
- If everything is critical, nothing is critical
- Reserve emphasis for truly non-negotiable rules
</constraints>

<system_reminder>
After ANY code change that establishes or modifies a pattern:
1. Consider if CLAUDE.md needs updating (add, modify, or remove)
2. Proactively ask the user if they want to persist the change
3. Keep instructions specific and actionable
4. Trigger periodic review after major refactors
</system_reminder>
