---
paths:
  - "**/*.md"
---

# Markdown @imports System

<critical_rules>
## When to Use @imports

Use `@path/to/file` syntax to reference other files instead of duplicating content:

1. **Detailed guidance** - Move topic-specific instructions to separate files
2. **Shared references** - Link to README, package.json, or API docs
3. **Keep main files lean** - CLAUDE.md should contain essentials only
4. **Reusable content** - Reference the same file from multiple locations
</critical_rules>

## Syntax

```markdown
See @README.md for project overview
See @docs/api-patterns.md for API conventions
See @package.json for available npm scripts
```

## Path Types

| Type | Example | Use Case |
|------|---------|----------|
| Relative | `@docs/style-guide.md` | Project-specific files |
| Absolute | `@/full/path/to/file.md` | Cross-project references |
| User-level | `@~/.claude/my-preferences.md` | Personal defaults |

## Best Practices

- Keep essentials inline, move details to imported files
- Use descriptive text before the @import explaining what it contains
- Prefer relative paths for project files
- Group related imports together

<constraints>
## Avoid These Patterns

- **Import maze** - Recursive imports referencing each other in circles
- **Over-fragmentation** - Too many tiny files that are hard to navigate
- **Orphaned imports** - References to files that don't exist
- **Import without context** - Bare `@file.md` without explaining why

### BAD
```markdown
@file1.md
@file2.md
@file3.md
```

### GOOD
```markdown
See @docs/authentication.md for auth flow details
See @docs/api-patterns.md for REST conventions
```
</constraints>

<system_reminder>
When creating or editing markdown files:
1. Consider if content should be extracted to a separate file and @imported
2. Always add context before @imports explaining what the referenced file contains
3. Use relative paths for project files
4. Avoid recursive import chains that create circular dependencies
</system_reminder>