# Workflows & Patterns

## 1. Explore - Plan - Code - Commit

**Best for:** Complex problems requiring upfront thinking

1. **Explore**: Ask Claude to read files/images/URLs WITHOUT coding
   - Use subagents for complex problems
   - "Read the logging module but don't write code yet"

2. **Plan**: Request a plan using thinking triggers
   - `think` < `think hard` < `think harder` < `ultrathink`
   - Have Claude create a document/issue with the plan

3. **Code**: Implement with verification
   - Ask Claude to verify reasonableness as it implements

4. **Commit**: Create PR and update docs
   - Update READMEs/changelogs as needed

## 2. Test-Driven Development (TDD)

**Best for:** Changes verifiable with tests

1. Ask Claude to write tests (no mocks, no implementation)
2. Confirm tests fail
3. Commit tests
4. Ask Claude to write code to pass tests (don't modify tests)
5. Have subagents verify implementation isn't overfitting
6. Commit code

## 3. Visual Iteration

**Best for:** UI/frontend development

1. Give Claude screenshot capability (Puppeteer MCP, simulator, or manual)
2. Provide visual mock (paste, drag-drop, or file path)
3. Ask Claude to implement, screenshot, and iterate until matching
4. Commit when satisfied

## 4. Safe YOLO Mode

**Best for:** Lint fixes, boilerplate generation

```bash
claude --dangerously-skip-permissions
```

**Safety:** Run in container without internet access. See Docker Dev Containers reference.

## 5. Codebase Q&A

**Best for:** Onboarding, exploration

Ask questions like:
- "How does logging work?"
- "How do I create a new API endpoint?"
- "What does `async move { ... }` do on line 134 of foo.rs?"
- "Why are we calling `foo()` instead of `bar()`?"

## 6. Git Operations

Claude handles 90%+ of git interactions:
- Search history: "What changed in v1.2.3?"
- Write commit messages (auto-generates from diff + context)
- Handle rebases, reverts, conflict resolution
- Compare and graft patches

## 7. GitHub Operations

- Create PRs (understands "pr" shorthand)
- Fix code review comments
- Fix failing CI/linter warnings
- Triage open issues

## 8. Jupyter Notebooks

- Read/write `.ipynb` files
- Interpret outputs including images
- Ask for "aesthetically pleasing" visualizations
- Clean up before sharing with colleagues
