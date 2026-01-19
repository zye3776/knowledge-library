# Implementation Plan: Add Greeting Utility

## Goal
Create a simple greeting utility function in the dev-opencode-connector skill.

## Tasks

### Task 1: Create greeting function
- Add a new file `scripts/greeting.ts`
- Export a function `greet(name: string): string` that returns a personalized greeting
- The greeting format should be decided based on project conventions

### Task 2: Add tests
- Create `scripts/greeting.test.ts`
- Test the greet function with various inputs
- Include edge cases (empty string, special characters)

## Questions to Consider
- What greeting style should we use? (formal vs casual)
- Should the greeting include a timestamp?
- What should happen if name is empty?

## Acceptance Criteria
- [ ] `greet("World")` returns a greeting string
- [ ] All tests pass
- [ ] No lint errors
