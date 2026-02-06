# Story 5.4: Simple Command Invocation

Status: ready

## Story

As a **knowledge library user**,
I want to start the tool with a simple command,
So that I can quickly access knowledge library features without remembering complex syntax.

## Background

The knowledge-library is a BMAD module accessed through Claude Code. This story establishes the primary entry point - a simple slash command that presents the main menu and guides users to available features.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given the module is installed, when user types /knowledge-library (or /kl), then the main menu is displayed
2. **AC2:** Given the main menu is displayed, when user selects an option, then the corresponding workflow is initiated
3. **AC3:** Given no config exists, when command is run, then user is prompted to run initialization first
4. **AC4:** Given the command is run, when dependencies are missing, then clear guidance is shown before menu
5. **AC5:** Given the main menu, when user types help, then available commands and options are explained
</acceptance_criteria>

## Tasks

- [ ] **Task 1: Command registration** (AC: 1)
  - [ ] 1.1 Create /knowledge-library skill entry point
  - [ ] 1.2 Create /kl alias for quick access
  - [ ] 1.3 Register in BMAD module manifest

- [ ] **Task 2: Main menu** (AC: 2, 5)
  - [ ] 2.1 Design main menu with core options
  - [ ] 2.2 Implement option selection handling
  - [ ] 2.3 Add help option with feature explanations

- [ ] **Task 3: Prerequisites check** (AC: 3, 4)
  - [ ] 3.1 Check for config.yaml existence
  - [ ] 3.2 Validate dependencies before showing menu
  - [ ] 3.3 Guide to initialization if needed

## Technical Notes

<technical_notes>
**Command Entry Point:**
```
/knowledge-library  - Full command
/kl                 - Short alias
```

**Main Menu Display:**
```
=== Knowledge Library ===

[N] New - Extract content from YouTube URL
[B] Browse - Access your content library
[P] Pipeline - Run full Extract → Refine → Consume
[S] Settings - View/edit configuration
[H] Help - Learn about features
[X] Exit

Select option:
```

**Prerequisites Check Flow:**
```
1. Check config.yaml exists
   → If missing: "Run /kl init to set up your project"

2. Check yt-dlp accessible
   → If missing: Show installation instructions

3. Check OPENAI_API_KEY
   → If missing: Show configuration instructions

4. All good → Show main menu
```

**Help Output:**
```
=== Knowledge Library Help ===

Features:
• Extract - Pull transcripts from YouTube videos
• Refine - Remove sponsors, ads, and visual references
• Consume - Convert to audio via TTS
• Library - Browse and manage processed content

Workflows:
• New: One-step extraction for quick saves
• Pipeline: Full extract → refine → consume flow
• Browse: Access existing library content

Configuration:
• config.yaml in project root
• Edit to customize output paths and processing rules
```

**Missing Config Prompt:**
```
⚠ Knowledge Library not initialized

Run /kl init to set up your project with:
• Configuration file (config.yaml)
• Content library directory
• Dependency checks

[I] Run init now | [X] Exit
```
</technical_notes>

## Verification

<verification>
```bash
# AC1 Verification - Command works
# Type /knowledge-library or /kl in Claude Code
# Expected: Main menu displayed

# AC2 Verification - Options work
# Select [N] from menu
# Expected: Extraction workflow starts

# AC3 Verification - Missing config detected
rm config.yaml
# Run /kl
# Expected: Prompt to run init

# AC4 Verification - Missing deps shown
unset OPENAI_API_KEY
# Run /kl
# Expected: Dependency warning before menu

# AC5 Verification - Help works
# Select [H] from menu
# Expected: Feature explanations displayed
```
</verification>

## Dependencies

- Requires Story 5.1 (initialization capability exists)

## References

- [Epic Overview](../overview.md)
- [PRD FR22](/_bmad-output/planning-artifacts/prd.md)
