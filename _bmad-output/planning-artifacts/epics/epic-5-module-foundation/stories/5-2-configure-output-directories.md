# Story 5.2: Configure Output Directories

Status: ready

## Story

As a **knowledge library user**,
I want to configure where my content is stored,
So that I can organize my knowledge library according to my preferences.

## Background

Users may want to store their knowledge library in different locations - perhaps on a specific drive, in a synced folder, or organized by topic. This story enables configuration of output directories while maintaining sensible defaults.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given config.yaml exists, when user edits output.libraries, then new content is stored in the specified directory
2. **AC2:** Given a relative path in config, when content is saved, then the path is resolved relative to project root
3. **AC3:** Given an absolute path in config, when content is saved, then the absolute path is used
4. **AC4:** Given an invalid path (no write permission), when pipeline runs, then clear error with resolution guidance
5. **AC5:** Given output directory doesn't exist, when pipeline runs, then directory is created automatically
</acceptance_criteria>

## Tasks

- [ ] **Task 1: Path resolution logic** (AC: 2, 3)
  - [ ] 1.1 Detect if path is relative or absolute
  - [ ] 1.2 Resolve relative paths from project root
  - [ ] 1.3 Normalize paths across platforms

- [ ] **Task 2: Directory validation** (AC: 4, 5)
  - [ ] 2.1 Check if directory exists
  - [ ] 2.2 Create directory if missing
  - [ ] 2.3 Verify write permissions
  - [ ] 2.4 Report clear errors if validation fails

- [ ] **Task 3: Config reading** (AC: 1)
  - [ ] 3.1 Read output.libraries from config.yaml
  - [ ] 3.2 Fall back to default if not specified
  - [ ] 3.3 Apply resolved path to all file operations

## Technical Notes

<technical_notes>
**Config Structure:**
```yaml
output:
  libraries: ./libraries           # Relative (default)
  # libraries: /Users/Z/Knowledge  # Absolute example
  # libraries: ~/Dropbox/Knowledge # Home-relative example
```

**Path Resolution:**
```
./libraries        → {project-root}/libraries
/absolute/path     → /absolute/path
~/relative/to/home → {home}/relative/to/home
```

**Validation Flow:**
1. Read path from config (or use default)
2. Resolve to absolute path
3. Check if directory exists
   - If not, attempt to create
4. Verify write permissions
   - If no permission, error with guidance
5. Use validated path for all operations

**Error Messages:**
```
Error: Cannot write to configured output directory
Path: /readonly/directory
Issue: Permission denied

Resolution options:
1. Change output.libraries in config.yaml
2. Grant write permissions: chmod u+w /readonly/directory
```

**Directory Creation Message:**
```
Note: Creating output directory: ~/Knowledge/library
```
</technical_notes>

## Verification

<verification>
```bash
# AC1 Verification - Custom directory used
# Edit config.yaml: output.libraries: ./custom-lib
# Run extraction, verify content in ./custom-lib/

# AC2 Verification - Relative path works
# Edit config.yaml: output.libraries: ./my-library
# Expected: Content saved to {project}/my-library/

# AC3 Verification - Absolute path works
# Edit config.yaml: output.libraries: /tmp/test-library
# Expected: Content saved to /tmp/test-library/

# AC4 Verification - Permission error handled
# Edit config.yaml: output.libraries: /readonly
# Expected: Clear error message with guidance

# AC5 Verification - Directory created
rm -rf ./new-library
# Edit config.yaml: output.libraries: ./new-library
# Run extraction
test -d ./new-library && echo "PASS: Directory created"
```
</verification>

## Dependencies

- Requires Story 5.1 (config.yaml exists)

## References

- [Epic Overview](../overview.md)
- [PRD FR19](/_bmad-output/planning-artifacts/prd.md)
