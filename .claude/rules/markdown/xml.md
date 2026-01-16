---
paths:
  - "**/*.md"
---

# Hybrid XML + Markdown Formatting Standards

<critical_rules>
When creating or editing Skills, Commands, or Agents, you MUST follow these hybrid formatting standards:

## XML Tags Are REQUIRED For:
- Critical rules: Wrap in `<critical_rules>` tags
- Behavioral constraints: Wrap in `<constraints>` tags
- User/variable data: Wrap in `<user_input>` tags
- Step-by-step instructions: Wrap in `<instructions>` tags
- Output format specifications: Wrap in `<output_format>` tags
- Workflow pause points: Wrap in `<checkpoint>` tags
- End-of-file reminders: Wrap in `<system_reminder>` tags

## Markdown Is REQUIRED For:
- Section headers (use `#`, `##`, `###`)
- Code examples (use fenced code blocks)
- Simple lists and options
- Human-readable documentation
- File structure diagrams

## NEVER Do These:
- Mix user data with instructions without XML boundaries
- Use XML for simple lists (use Markdown instead)
- Embed XML tags mid-sentence in prose
- Create deeply nested XML structures
- Wrap everything in XML (over-tagging)
</critical_rules>

## Required File Structure

### SKILL.md Files

```markdown
---
name: [skill-name]
description: [Clear description with trigger keywords - max 200 chars]
allowed-tools: [Tool1, Tool2]
---

# Skill Title

## Purpose
[Brief explanation]

<instructions>
1. Step one
2. Step two
</instructions>

<constraints>
- Constraint 1
- Constraint 2
</constraints>

## Examples

<examples>
<example name="good">
[Good example]
</example>
</examples>

<output_format>
[Expected output structure if parsing needed]
</output_format>

<system_reminder>
[Key points Claude must not forget]
</system_reminder>
```

### Command Files

```markdown
---
description: [What command does]
allowed-tools: [Tools]
---

# Command: $ARGUMENTS

<user_input>$ARGUMENTS</user_input>

<instructions>
## Phase 1: [Name]
- Steps here

<checkpoint>
Pause and confirm before proceeding.
</checkpoint>

## Phase 2: [Name]
- More steps
</instructions>

<constraints>
- What NOT to do
</constraints>
```

### Agent Files

```markdown
---
name: [agent-name]
description: [When to invoke]
allowed-tools: [Tools]
model: [model-id]
---

# Agent Role

<persona>
- Expertise area
- Communication style
</persona>

<constraints>
- Behavioral limits
</constraints>

<output_format>
<agent_result>
  <task>[What was requested]</task>
  <findings>[Results]</findings>
</agent_result>
</output_format>
```

## XML Tag Quick Reference

| Tag | Use When |
|-----|----------|
| `<critical_rules>` | Rules that MUST be followed |
| `<constraints>` | Behavioral limitations |
| `<instructions>` | Step-by-step procedures |
| `<user_input>` | Variable/user-provided content |
| `<context>` | Background information |
| `<examples>` | Container for example blocks |
| `<example>` | Single example with name attribute |
| `<output_format>` | Define expected response structure |
| `<checkpoint>` | Pause points in workflows |
| `<system_reminder>` | End-of-file memory reinforcement |
| `<persona>` | Agent character definition |

## Anti-Patterns to AVOID

<constraints>
### Over-Tagging (BAD)
```xml
<list><item>Thing 1</item></list>
```
Use Markdown instead:
```markdown
- Thing 1
```

### XML in Prose (BAD)
```
Please <action>do this</action> now.
```
Separate instead:
```markdown
Do this now.
<constraints>Only in src/ directory</constraints>
```

### Missing Boundaries (BAD)
```
Analyze: const x = 1 and improve it.
```
Add boundaries:
```markdown
Analyze and improve:
<code_context>const x = 1</code_context>
```
</constraints>

<system_reminder>
When creating Skills, Commands, or Agents:
1. Start with YAML frontmatter (name, description, allowed-tools)
2. Use Markdown headers for structure
3. Add XML tags for critical rules, constraints, and data boundaries
4. Include `<system_reminder>` at the end for important points
5. Test that critical rules are actually followed
</system_reminder>