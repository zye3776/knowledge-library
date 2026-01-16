---
paths:
  - "_bmad/_config/agents/*.customize.yaml"
  - "_bmad/_config/agents/**/*.customize.yaml"
---

# BMAD Agent Customisation Standards

<critical_rules>
When editing `.customize.yaml` files, follow these BMAD standards:

## Valid Top-Level Keys Only
- `agent.metadata.name` - Override agent name
- `persona` - Replace entire persona (role, identity, communication_style, principles)
- `memories` - List of persistent context strings
- `menu` - Custom menu items (trigger, workflow/action, description)
- `critical_actions` - List of pre-start instructions
- `prompts` - Custom prompts for `action="#id"` handlers

## Key Rules
- All sections are optional
- Empty values (`""`, `[]`) are ignored
- Persona replaces entirely (not merged)
- Other sections append to base agent

## Menu Items
```yaml
menu:
  - trigger: my-workflow
    workflow: '{project-root}/path/to/workflow.yaml'
    description: What it does
```
Do NOT include `*` prefix or `help`/`exit` items.
</critical_rules>

## Merge Behavior

| Section | Behavior |
|---------|----------|
| `agent.metadata.name` | Overrides if non-empty |
| `persona` | Non-empty fields override base |
| `memories` | Appended to base |
| `menu` | Appended to base |
| `critical_actions` | Appended to base |
| `prompts` | Appended to base |

<constraints>
## Do NOT:
- Add unknown top-level keys
- Include `*` prefix in menu triggers
- Add `help` or `exit` menu items
</constraints>

<system_reminder>
After editing, remind user to rebuild:
```bash
npx bmad-method@alpha build <agent-name>
```
For full guide, see `/customising-bmad` skill.
</system_reminder>
