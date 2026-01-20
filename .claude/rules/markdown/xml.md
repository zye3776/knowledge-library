---
paths:
  - ".claude/**/*.md"
---

# Hybrid XML + Markdown Formatting Standards

<critical_rules>
When creating or editing Skills, Commands, or Agents, follow these hybrid formatting standards:

## XML Tag Philosophy
- **Invent semantic tags** that describe your content's purpose
- Tags should be self-documenting: `<documents>`, `<task>`, `<phase>` are clearer than generic containers
- Use attributes for metadata: `<doc name="Architecture" path="...">`
- The tag vocabulary is UNLIMITED - create tags that make sense for your content

## Indentation for Nested XML
Always indent nested XML with 2 spaces per level for readability:
```xml
<documents>
  <section name="planning">
    <doc name="Architecture" path="_bmad-output/planning-artifacts/architecture/index.md">
      Technical decisions and system design
    </doc>
  </section>
</documents>
```

## Markdown Is REQUIRED For:
- Section headers (use `#`, `##`, `###`)
- Code examples (use fenced code blocks)
- Simple flat lists
- Human-readable documentation

## NEVER Do These:
- Mix user data with instructions without XML boundaries
- Use XML for simple flat lists (use Markdown instead)
- Embed XML tags mid-sentence in prose
- Skip indentation on nested structures
</critical_rules>

## File Structure Templates

For complete templates with examples, see:
- Skills: `.claude/rules/claude-framework/dev-skills.md`
- Commands: `.claude/rules/claude-framework/dev-commands.md`
- Agents: `.claude/rules/claude-framework/dev-agents.md`

## Creating Semantic Tags

<instructions>
  <principle name="self-documenting">
    Tag names should describe their content's purpose, not generic structure.
    BAD: `<data>`, `<info>`, `<content>`
    GOOD: `<documents>`, `<workflow>`, `<validation_rules>`
  </principle>

  <principle name="attributes-vs-content">
    Use attributes for identifiers and metadata:
    ```xml
    <doc name="Architecture" path="_bmad-output/planning-artifacts/architecture/index.md">
    <task type="story-implementation">
    <phase name="validation" order="3">
    ```
    Use content for descriptions and instructions:
    ```xml
    <doc name="Architecture" path="...">
      Technical decisions, tech stack, system design
    </doc>
    ```
  </principle>

  <principle name="hierarchical-grouping">
    Group related items under semantic containers:
    ```xml
    <documents>
      <section name="planning">
        <doc>...</doc>
        <doc>...</doc>
      </section>
    </documents>
    ```
  </principle>
</instructions>

## Common Tags (Extend as Needed)

| Tag | Use When |
|-----|----------|
| `<critical_rules>` | Rules that MUST be followed |
| `<constraints>` | Behavioral limitations |
| `<instructions>` | Step-by-step procedures |
| `<system_reminder>` | End-of-file memory reinforcement |
| `<documents>` | Document index or file references |
| `<section>` | Grouping within a container |
| `<doc>` | Single document reference with path |
| `<task>` | Task-specific instructions |
| `<phase>` | Workflow phase definition |
| `<workflow>` | Multi-step process container |
| `<examples>` | Container for example blocks |
| `<output_format>` | Define expected response structure |
| `<persona>` | Agent character definition |

**Create new tags freely** - the above are suggestions, not limits.

## Anti-Patterns to AVOID

<constraints>
  <anti_pattern name="over-tagging">
    BAD - Using XML for simple lists:
    ```xml
    <list><item>Thing 1</item></list>
    ```
    GOOD - Use Markdown for flat lists:
    ```markdown
    - Thing 1
    ```
  </anti_pattern>

  <anti_pattern name="xml-in-prose">
    BAD - Embedding tags mid-sentence:
    ```
    Please <action>do this</action> now.
    ```
    GOOD - Separate structure from prose:
    ```markdown
    Do this now.
    <constraints>Only in src/ directory</constraints>
    ```
  </anti_pattern>

  <anti_pattern name="missing-indentation">
    BAD - Flat nested XML:
    ```xml
    <documents><section><doc>...</doc></section></documents>
    ```
    GOOD - Indent nested structures:
    ```xml
    <documents>
      <section>
        <doc>...</doc>
      </section>
    </documents>
    ```
  </anti_pattern>

  <anti_pattern name="generic-tags">
    BAD - Non-descriptive tag names:
    ```xml
    <data><item>Architecture doc</item></data>
    ```
    GOOD - Semantic tag names:
    ```xml
    <documents>
      <doc name="Architecture" path="...">Technical decisions</doc>
    </documents>
    ```
  </anti_pattern>
</constraints>

<system_reminder>
When creating Skills, Commands, or Agents:
1. Start with YAML frontmatter (name, description, allowed-tools)
2. Use Markdown headers for document structure
3. **Invent semantic XML tags** that describe your content (`<documents>`, `<workflow>`, `<phase>`)
4. **Always indent nested XML** with 2 spaces per level
5. Use attributes for metadata: `<doc name="..." path="...">`
6. Include `<system_reminder>` at the end for key points
7. Reserve Markdown for headers, code blocks, and simple flat lists
</system_reminder>