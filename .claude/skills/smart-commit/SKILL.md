---
name: smart-commit
description: Split local git changes into multiple logical commits grouped by functionality. Use when committing multiple unrelated changes, organizing messy working directories, or creating clean commit history. Analyzes files and prompts user before each commit group.
---

# Smart Commit

Split local changes (including new files) into multiple commits grouped by **functionality**. Each group may contain code, config, and docs that belong to the same logical change. Each commit group requires user approval before committing.

## Workflow

### Step 1: Gather All Changes

```bash
git status --porcelain
```

### Step 2: Group by Functionality

Group files by **what they accomplish together**, not by file type. A single functional change may include:
- Source code changes
- Related test files
- Configuration updates
- Documentation updates

**Grouping Strategy:**

1. **Feature/Module Analysis** - Files in same module/feature directory
2. **Naming Correlation** - Files sharing base names (e.g., `users.ts`, `users.test.ts`, `users.md`)
3. **Cross-cutting Changes** - Config or doc files that clearly support specific code changes
4. **Standalone Changes** - Independent fixes, refactors, or updates

**Example:** Adding user authentication might include:
- `src/auth/login.ts` (code)
- `src/auth/login.test.ts` (test)
- `config/auth.yaml` (config)
- `docs/authentication.md` (docs)

All grouped as ONE commit: `Add user authentication`

### Step 3: Detect Work-in-Progress

Identify potential WIP changes:
- Files with `TODO`, `FIXME`, `WIP` comments
- Incomplete implementations (empty functions, placeholder code)
- Failing or skipped tests
- Partial changes (half-finished features)

**If WIP detected:** Ask user if they want to:
1. Commit as WIP (prefix with "WIP: ")
2. Skip and leave uncommitted
3. Include in regular commit anyway

### Step 4: Present Each Group to User

For each group, use **AskUserQuestion** tool:

**Show:**
- Functional description of the group
- List of files (with modified/new status)
- Proposed commit message

**Options:**
1. Commit this group
2. Skip (leave uncommitted)
3. Mark as WIP commit

### Step 5: Create Commits

For each approved group:

```bash
git add <files...>
git commit -m "<message>

Co-Authored-By: Claude <noreply@anthropic.com>"
```

For WIP commits, prefix the message:
```bash
git commit -m "WIP: <message>

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Commit Message Format

Write clear, reasonable commit messages:

```
<Short description of what changed>

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Good messages:**
- `Add user authentication with JWT tokens`
- `Fix memory leak in WebSocket handler`
- `Update database schema for multi-tenancy`
- `Refactor payment processing module`

**WIP messages:**
- `WIP: Add email notification system`
- `WIP: Migrate to new API structure`

## Example Session

**Working directory:**
```
M  src/api/users.ts
M  src/api/users.test.ts
M  docs/api.md
A  src/api/roles.ts
A  src/api/roles.test.ts
M  package.json
M  tsconfig.json
M  README.md
A  src/utils/helpers.ts   (contains TODO comments)
```

**Grouped as:**

1. **User API updates** (3 files)
   - `src/api/users.ts`
   - `src/api/users.test.ts`
   - `docs/api.md`
   - Message: `Update user API with validation`

2. **Add roles feature** (2 files)
   - `src/api/roles.ts`
   - `src/api/roles.test.ts`
   - Message: `Add role-based access control`

3. **Build configuration** (2 files)
   - `package.json`
   - `tsconfig.json`
   - Message: `Update build configuration`

4. **Documentation** (1 file)
   - `README.md`
   - Message: `Update project README`

5. **WIP: Helper utilities** (1 file) - *detected incomplete*
   - `src/utils/helpers.ts`
   - Message: `WIP: Add helper utilities`
   - *Prompt user to confirm WIP commit*

## User Prompts

### Standard Group Prompt

```
Commit Group: <functional description>

Files:
- src/feature/code.ts (modified)
- src/feature/code.test.ts (modified)
- docs/feature.md (new)

Proposed message: <commit message>
```

Options: Commit / Skip / Edit message

### WIP Detection Prompt

```
Potential work-in-progress detected in:
- src/utils/helpers.ts (contains TODO comments)

This appears incomplete. How would you like to handle it?
```

Options:
1. Commit as WIP (prefix "WIP: ")
2. Skip (leave uncommitted)
3. Commit normally anyway

## Post-Commit Summary

```
Commits created:
1. abc1234 - Update user API with validation (3 files)
2. def5678 - Add role-based access control (2 files)
3. ghi9012 - WIP: Add helper utilities (1 file)

Skipped: 2 files remain uncommitted
```

## Important Rules

1. **Always prompt before each commit** - Never auto-commit
2. **Group by function, not file type** - Code + config + docs together if related
3. **Detect and flag WIP** - Let user decide how to handle incomplete work
4. **Handle partial approval** - User can commit some, skip others
5. **Warn about secrets** - Alert if `.env`, credentials, or keys detected
