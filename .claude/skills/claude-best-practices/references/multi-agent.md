# Multi-Claude Workflows

## Write + Review Pattern

Separate contexts often yield better results:

1. **Claude A**: Write code
2. `/clear` or new terminal
3. **Claude B**: Review Claude A's work
4. `/clear` or new terminal
5. **Claude C**: Read code + review, implement feedback

### Variation: Test-Driven
- Claude A: Write tests
- Claude B: Write code to pass tests

### Communication

Give Claudes separate scratchpads:
- "Write your output to scratchpad-a.md"
- "Read from scratchpad-a.md, write to scratchpad-b.md"

## Multiple Checkouts

For parallel independent tasks:

1. Create 3-4 git checkouts in separate folders
2. Open each in separate terminal tabs
3. Start Claude in each with different tasks
4. Cycle through checking progress

## Git Worktrees (Recommended)

Lighter-weight alternative to multiple checkouts:

```bash
# Create worktree
git worktree add ../project-feature-a feature-a

# Launch Claude
cd ../project-feature-a && claude

# Repeat for more worktrees

# Cleanup when done
git worktree remove ../project-feature-a
```

### Worktree Tips
- Use consistent naming conventions
- One terminal tab per worktree
- Set up notifications for Claude attention needed (iTerm2)
- Use separate IDE windows per worktree

## Headless Fan-Out

For massive parallelization:

```bash
# Generate task list
claude -p "Generate list of files needing migration" > tasks.txt

# Process in parallel
cat tasks.txt | parallel -j4 'claude -p "Migrate {} from A to B" --allowedTools Edit'
```

## When to Use Multi-Claude

| Scenario | Pattern |
|----------|---------|
| Code review | Write + Review |
| Large refactor | Multiple checkouts |
| Independent features | Git worktrees |
| Mass migration | Headless fan-out |
| Quality iteration | Write - Review - Revise |
