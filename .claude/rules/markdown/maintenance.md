---
paths:
  - "**/*.md"
---

# Markdown File Maintenance

<critical_rules>
After creating or updating any markdown file, you MUST:

1. **Remove redundancy** - Eliminate duplicate content, repeated instructions, or overlapping sections
2. **Resolve conflicts** - Fix contradictory statements or inconsistent guidance
3. **Refactor for clarity** - Consolidate related content, improve structure, simplify language
4. **Trim bloat** - Remove unnecessary verbosity, outdated content, or filler text
</critical_rules>

## Within-File Redundancy Detection

Look for these patterns when reviewing a single file:

| Pattern | Example | Fix |
|---------|---------|-----|
| Repeated instructions | "Always use semantic tags" appearing in 3 sections | Consolidate into one authoritative location |
| Duplicate examples | Multiple code blocks showing the same concept | Keep the clearest example, remove others |
| Overlapping sections | "XML Guidelines" and "Tag Usage" covering same content | Merge into single cohesive section |
| Restated constraints | Same rule in `<critical_rules>` and `<constraints>` | Keep in most appropriate tag only |

## Cross-File Redundancy Detection

Before adding content, check if it belongs elsewhere or already exists:

| Topic | Primary Source | May Overlap With |
|-------|---------------|------------------|
| XML formatting | `xml.md` | dev-skills, dev-commands, dev-agents |
| @import syntax | `imports.md` | claude-md-best-practices |
| Frontmatter fields | dev-skills, dev-commands, dev-agents | (each defines type-specific fields) |
| Comparison tables | Respective domain files | Avoid duplicating across files |

### Reference Pattern

When content exists elsewhere, reference instead of duplicate:

```markdown
For XML formatting standards (semantic tags, indentation), see `.claude/rules/markdown/xml.md`.
```

Add brief context explaining WHEN to consult the reference:

```markdown
Skills use hybrid XML + Markdown formatting. For tag creation guidelines and anti-patterns,
see `.claude/rules/markdown/xml.md`.
```

## Related Rules Discovery Checklist

Before adding content to any rules file, check these locations:

- `xml.md` - Hybrid XML + Markdown formatting, semantic tag creation
- `imports.md` - @import syntax and patterns
- `claude-md-best-practices.md` - CLAUDE.md specific guidance
- `dev-skills.md` - Skills development standards
- `dev-commands.md` - Commands development standards
- `dev-agents.md` - Agents development standards

If the content fits better in an existing file, add it there instead.

<system_reminder>
Every markdown edit should leave the file cleaner than before. If a file grows significantly, review for consolidation opportunities. Before adding content, check if it already exists in another rules file - reference instead of duplicate.
</system_reminder>
