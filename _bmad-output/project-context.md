---
project_name: 'knowledge-library'
user_name: 'Z'
date: '2026-01-15'
sections_completed:
  - technology_stack
  - language_rules
  - framework_rules
  - testing_rules
  - quality_rules
  - workflow_rules
  - anti_patterns
status: 'complete'
rule_count: 42
optimized_for_llm: true
---

# Project Context for AI Agents

_Critical rules and patterns for implementing code in knowledge-library. Focus on unobvious details that agents might otherwise miss._

## Technology Stack & Versions

| Technology | Version | Notes |
|------------|---------|-------|
| BMAD Framework | 6.0.0-alpha.23 | Workflow orchestration |
| Bun | Latest stable | TypeScript runtime for skills |
| TypeScript | Strict mode | All skills must use TypeScript |
| yt-dlp | External CLI | User must have installed |
| OpenAI TTS API | v1 | Requires OPENAI_API_KEY |

**Runtime Context:**
- Skills run via Claude Code Bash tool
- Workflows are BMAD step-file architecture
- Config files use YAML format

## Language-Specific Rules

### TypeScript + Bun

**Configuration:**
- Use `strict: true` in tsconfig
- Target ES2022+ for modern syntax
- Use Bun's native APIs where available

**Import/Export:**
- Use ES modules (`import`/`export`), never CommonJS
- Prefer named exports over default exports
- Use `.ts` extension in imports when running with Bun

**Error Handling:**
- Use typed errors with explicit error types
- Throw errors, don't return error codes
- Log errors before re-throwing in skills

**Async Patterns:**
- Use `async/await`, avoid raw Promises
- Handle errors with try/catch, not `.catch()`
- Use `Bun.spawn()` for subprocess execution (yt-dlp)

## Framework-Specific Rules

### BMAD Workflow Patterns

**Workflow Structure:**
- Entry point is always `workflow.md`
- Steps in `steps/` or `steps-c/`, `steps-e/`, `steps-v/` for tri-modal
- Step files named `step-{NN}-{action}.md` (e.g., `step-01-init.md`)

**Step File Requirements:**
- Include MANDATORY EXECUTION RULES section
- Present A/P/C menus after content generation
- Never proceed to next step without user approval
- Update frontmatter `stepsCompleted` array on progression

**State Management:**
- Pipeline state stored in `metadata.yaml` per content item
- Use `stage` field: `extracted` | `refined` | `consumed`
- Use `pipeline_status`: `in_progress` | `completed` | `error`

**Menu Presentation:**
- Use bracketed letters: `[C]` Continue, `[R]` Retry, `[X]` Exit
- Always provide escape option (Exit/Cancel)
- Show suggested actions after errors

## Testing Rules

### Validation Approach

**No Automated Test Framework:**
- Project prioritizes simplicity (NFR9)
- Use workflow Validate modes (`steps-v/`) for quality checks
- Manual testing via workflow execution

**Validation Modes:**
- Each workflow has `steps-v/` folder for validation steps
- Validation checks content quality, not code correctness
- User approves/rejects validation results

**Skill Testing:**
- Test skills manually via direct Bash execution
- Verify output format matches expected structure
- Check error handling with invalid inputs

**What to Validate:**
- Post-Extract: Transcript not empty, minimum length, language detected
- Post-Rephrase: Noise removed, structure intact
- Pre-Consume: No code blocks, reasonable TTS length

## Code Quality & Style Rules

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Workflow folders | kebab-case | `extract-youtube` |
| Step files | `step-{NN}-{action}.md` | `step-01-init.md` |
| Skill folders | kebab-case | `extract-youtube` |
| Output files | Fixed names | `transcript.md`, `refined.md`, `audio.mp3` |
| YAML keys | snake_case | `source_url`, `created_at` |
| Dates | ISO 8601 | `2026-01-15T10:30:00Z` |

### File Organization

**Content Library:**
```
libraries/{slug}/
├── transcript.md
├── refined.md
├── audio.mp3
└── metadata.yaml
```

**Skill Structure:**
```
skill-name/
├── SKILL.md          # Required entry point
└── scripts/          # TypeScript/Bun scripts
    └── main.ts
```

### Documentation

- Workflow steps must have MANDATORY EXECUTION RULES section
- Skills must have Usage and Examples sections in SKILL.md
- No excessive comments in code - keep it self-documenting

## Development Workflow Rules

### Workflow Invocation

**Claude Code Commands:**
```bash
/knowledge-library:orchestrator    # Full E→R→C pipeline
/knowledge-library:extract         # Extract only
/knowledge-library:rephrase        # Rephrase only
/knowledge-library:consume         # Consume/TTS only
```

### Error Handling Flow

**On Service Failure:**
1. Halt workflow immediately
2. Log error to `metadata.yaml`
3. Display clear error message
4. Present options: `[R]` Retry, `[S]` Skip, `[X]` Exit
5. No automatic retries (NFR10)

**Error Report Format:**
```yaml
errors:
  - timestamp: "2026-01-15T10:30:00Z"
    stage: "extract"
    error_type: "yt-dlp_failure"
    message: "Video unavailable"
    user_action: "retry"
    resolved: true
```

### Configuration

- All config in `config.yaml` at module root
- Read config at workflow init, not per-step
- User can override `content_folder` path

## Critical Don't-Miss Rules

### Anti-Patterns to AVOID

**Workflow Anti-Patterns:**
- Never auto-advance steps without user approval
- Never skip A/P/C menu presentation
- Never generate content without user input first
- Never proceed on error - always halt and present options

**Skill Anti-Patterns:**
- Never hardcode paths - use config values
- Never swallow errors silently - always log then throw
- Never use Python for new skills - use TypeScript + Bun

**Content Anti-Patterns:**
- Never overwrite existing content without confirmation
- Never delete user data on error
- Never leave partial state (write metadata.yaml atomically)

### Edge Cases to Handle

**yt-dlp Failures:**
- Video private/deleted → Clear error, suggest different URL
- No subtitles available → Warn user, offer to continue without transcript
- Network timeout → Log error, offer retry

**TTS Failures:**
- API key missing → Halt with setup instructions
- Content too long → Chunk automatically, warn user
- Rate limit → Log error, suggest wait and retry

### Security Rules

- Never log or display API keys
- Store `OPENAI_API_KEY` in environment only, never in config files
- Validate YouTube URLs before passing to yt-dlp

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Report if new patterns emerge that should be documented

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review periodically for outdated rules
- Remove rules that become obvious over time

---

_Last Updated: 2026-01-15_
