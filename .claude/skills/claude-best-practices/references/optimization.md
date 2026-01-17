# Optimization Tips

## Prompting

### Be Specific

| Poor | Good |
|------|------|
| add tests for foo.py | write a test case for foo.py covering logged-out edge case, avoid mocks |
| why is this API weird? | look through ExecutionFactory git history and summarize how its API evolved |
| add a calendar widget | look at HotDogWidget.php to understand patterns, then implement calendar widget with month selection and pagination, no external libraries |

### Provide Rich Context
- **Images**: Paste (`cmd+ctrl+shift+4` then `ctrl+v`), drag-drop, or file paths
- **Files**: Use tab-completion to reference files/folders
- **URLs**: Paste directly; add domains to `/permissions` allowlist

## Course Correction

1. **Plan first**: "Make a plan before coding, don't code until I confirm"
2. **Escape**: Interrupt any phase, preserving context
3. **Double-Escape**: Jump back in history, edit prompt, explore different direction
4. **Undo**: Ask Claude to undo changes and try different approach

## Context Management

- Use `/clear` frequently between tasks
- Long sessions accumulate irrelevant content
- Fresh context = better performance

## Complex Task Management

Use Markdown checklists as scratchpads:

1. Have Claude run command and write all errors to checklist
2. Address each issue one-by-one
3. Fix, verify, check off, move to next

**Example:** Fixing lint errors

> "Run lint, write all errors with filenames and line numbers to checklist, then fix each one, verifying and checking off before moving to next"

## Data Input Methods

1. Copy/paste into prompt (most common)
2. Pipe: `cat foo.txt | claude`
3. Pull via bash/MCP/slash commands
4. Read files or fetch URLs
5. Combine methods as needed

## Thinking Triggers

Increasing thinking budget:

| Trigger | Level |
|---------|-------|
| `think` | Base extended thinking |
| `think hard` | More computation |
| `think harder` | Even more |
| `ultrathink` | Maximum thinking budget |
