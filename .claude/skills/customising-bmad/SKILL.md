---
name: customising-bmad
description: Guide for customizing BMAD agents. Use when users want to modify agent personas, add custom menus, memories, or critical actions via customize.yaml files.
---

# BMAD Agent Customization Guide

Customize BMAD agents by modifying `.customize.yaml` files. Changes persist through BMAD updates.

## Customization File Location

After BMAD installation, customization files are in:

```
_bmad/_config/agents/
├── core-bmad-master.customize.yaml
├── bmm-dev.customize.yaml
├── bmm-pm.customize.yaml
└── ... (one file per installed agent)
```

## Complete YAML Template

All sections are optional - customize only what you need:

```yaml
# Override agent name
agent:
  metadata:
    name: ""

# Replace entire persona (not merged)
persona:
  role: ""
  identity: ""
  communication_style: ""
  principles: []

# Add custom critical actions (appended after standard config loading)
critical_actions: []

# Add persistent memories for the agent
memories: []

# Add custom menu items (appended to base menu)
# Don't include * prefix or help/exit - auto-injected
menu: []

# Add custom prompts (for action="#id" handlers)
prompts: []
```

## Customization Sections

### Agent Name

Change how the agent introduces itself:

```yaml
agent:
  metadata:
    name: 'Spongebob'
```

### Persona

Replace the agent's personality, role, and communication style:

```yaml
persona:
  role: 'Senior Full-Stack Engineer'
  identity: 'Lives in a pineapple (under the sea)'
  communication_style: 'Spongebob'
  principles:
    - 'Never Nester, Spongebob Devs hate nesting more than 2 levels deep'
    - 'Favor composition over inheritance'
```

**Note:** The persona section **replaces** the entire default persona (not merged).

### Memories

Add persistent context the agent will always remember:

```yaml
memories:
  - 'Works at Krusty Krab'
  - 'Favorite Celebrity: David Hasslehoff'
  - 'Learned in Epic 1 that its not cool to just pretend that tests have passed'
```

### Custom Menu Items

Add your own workflows to the agent's menu:

```yaml
menu:
  - trigger: my-workflow
    workflow: '{project-root}/my-custom/workflows/my-workflow.yaml'
    description: My custom workflow
  - trigger: deploy
    action: '#deploy-prompt'
    description: Deploy to production
```

**Don't include:** `*` prefix or `help`/`exit` items - these are auto-injected.

### Critical Actions

Add instructions that execute before the agent starts:

```yaml
critical_actions:
  - 'Always check git status before making changes'
  - 'Use conventional commit messages'
```

### Custom Prompts

Define reusable prompts for `action="#id"` menu handlers:

```yaml
prompts:
  - id: deploy-prompt
    content: |
      Deploy the current branch to production:
      1. Run all tests
      2. Build the project
      3. Execute deployment script
```

## Applying Customizations

After editing a `.customize.yaml` file, **rebuild the agent**:

```bash
npx bmad-method@alpha install  # Select option to compile all agents
# OR
npx bmad-method@alpha build <agent-name>

# Examples:
npx bmad-method@alpha build bmm-dev
npx bmad-method@alpha build core-bmad-master
npx bmad-method@alpha build bmm-pm
```

## How Customizations Are Merged

**Merge Behaviors:**
- **Persona**: Non-empty values from customize.yaml override base persona fields
- **Menu items**: Appended to base menu
- **Critical actions**: Appended to base critical actions
- **Prompts**: Appended to base prompts
- **Memories**: Appended to base memories
- **Name**: Overrides the agent name if non-empty

## Real-World Examples

### Example 1: TDD Developer Customization

```yaml
agent:
  metadata:
    name: 'TDD Developer'

memories:
  - 'Always write tests before implementation'
  - 'Project uses Jest and React Testing Library'

critical_actions:
  - 'Review test coverage before committing'
```

### Example 2: Add Custom Deployment Workflow

```yaml
menu:
  - trigger: deploy-staging
    workflow: '{project-root}/_bmad/deploy-staging.yaml'
    description: Deploy to staging environment
  - trigger: deploy-prod
    workflow: '{project-root}/_bmad/deploy-prod.yaml'
    description: Deploy to production (with approval)
```

### Example 3: Multilingual Product Manager

```yaml
persona:
  role: 'Bilingual Product Manager'
  identity: 'Expert in US and LATAM markets'
  communication_style: 'Clear, strategic, with cultural awareness'
  principles:
    - 'Consider localization from day one'
    - 'Balance business goals with user needs'

memories:
  - 'User speaks English and Spanish'
  - 'Target markets: US and Latin America'
```

## Important Notes

- **All sections are optional** - customize only what you need
- **Update-safe** - Customizations in `_config/` survive all BMAD updates
- **Per-project** - Customization files are per-project, not global
- **YAML syntax matters** - Indentation must be correct
- **Rebuild required** - Always run `npx bmad-method build <agent-name>` after editing
- **Version control** - Consider committing `_config/` to share customizations with your team
