# Automation & Headless Mode

## Headless Mode Basics

```bash
claude -p "<prompt>"                              # Basic headless
claude -p "<prompt>" --output-format stream-json  # Streaming JSON
claude -p "<prompt>" --json                       # JSON output
claude -p "<prompt>" --verbose                    # Debug mode
```

Note: Headless mode does not persist between sessions.

## Use Cases

### Issue Triage

Trigger on GitHub events (new issues):

```bash
claude -p "Analyze this issue and assign appropriate labels: $ISSUE_BODY"
```

### Subjective Linting

Beyond traditional linters - catch:
- Typos
- Stale comments
- Misleading names
- Code smells

### Pipeline Integration

```bash
claude -p "<prompt>" --json | next_pipeline_step
```

## Fan-Out Pattern

For large migrations/analyses:

1. Have Claude generate task list (e.g., 2000 files to migrate)
2. Loop through tasks:
   ```bash
   claude -p "migrate $FILE from React to Vue. Return OK or FAIL." \
     --allowedTools Edit "Bash(git commit:*)"
   ```
3. Iterate on prompt until desired outcome

## Pipeline Pattern

Integrate into data processing:

```bash
claude -p "<prompt>" --json | your_command
```

## Tips

- Use `--verbose` for debugging, disable in production
- Use `--allowedTools` to restrict available tools
- Return structured responses (OK/FAIL) for automation logic
