---
name: 'step-01-validate'
description: 'Validate extracted transcript quality before proceeding'
mode: validate
---

# Step 1: Validate Extracted Transcript

## STEP GOAL

Validate the quality of an extracted transcript by calculating metrics, detecting artifacts, and presenting results for user approval. This is a quality gate before refinement or TTS consumption.

## MANDATORY EXECUTION RULES

<critical_rules>
1. **READ COMPLETE STEP** - Process all sections before taking action
2. **NEVER AUTO-ADVANCE** - Always wait for user selection at A/R/X menu
3. **REPORT FACTS ONLY** - Display metrics and artifacts without judgment; user decides if acceptable
4. **HALT ON ERRORS** - Display clear error message with R/X options if transcript not found
</critical_rules>

## CONTEXT BOUNDARIES

<context>
- **Input:** Library item slug (from workflow context or user input)
- **Files accessed:** `libraries/{slug}/transcript.md`, `libraries/{slug}/metadata.yaml`
- **Output:** Validation metrics, artifact list, updated metadata (on approval)
</context>

## MANDATORY SEQUENCE

### 1. Resolve Library Item

<resolve_item>
Determine which library item to validate:

1. Check if `{library_slug}` is available from workflow context
2. If not, ask user: "Which library item would you like to validate? (Enter the slug)"
3. Store the slug for use in subsequent steps

Set `library_path` = `libraries/{slug}`
</resolve_item>

### 2. Load Transcript Content

<load_transcript>
Load the transcript file:

```
transcript_path = {library_path}/transcript.md
```

**IF transcript file does not exist:**
```
ERROR: No transcript found at {transcript_path}

The library item '{slug}' does not have an extracted transcript.

What would you like to do?
- [R] Retry - Specify a different library item
- [X] Exit - Cancel validation

Please select:
```
Wait for user input before proceeding.

**IF transcript exists:**
Read complete content into `transcript_content`
</load_transcript>

### 3. Calculate Validation Metrics

<calculate_metrics>
Calculate the following metrics from `transcript_content`:

**Word Count:**
```
words = transcript_content.split(/\s+/).filter(word => word.length > 0)
word_count = words.length
```

**Reading Time:**
```
// Average reading speed: 200 words per minute
reading_time_minutes = Math.ceil(word_count / 200)
```

Store results:
- `word_count` - Total number of words
- `reading_time` - Estimated reading time in minutes
</calculate_metrics>

### 4. Scan for Extraction Artifacts

<scan_artifacts>
Scan transcript content for common extraction artifacts using these patterns:

| Pattern | Description | Example Match |
|---------|-------------|---------------|
| `/\[\d{1,2}:\d{2}(:\d{2})?\]/g` | Bracketed timestamps | `[00:15]`, `[1:23:45]` |
| `/^SPEAKER\s*\d*:/gm` | Speaker labels | `SPEAKER 1:`, `SPEAKER:` |
| `/\[Music\]/gi` | Music marker | `[Music]` |
| `/\[Applause\]/gi` | Applause marker | `[Applause]` |
| `/\u{FFFD}/gu` | Encoding issues | Replacement character |

For each match found:
1. Record the line number
2. Record the matched text (with ~20 characters of surrounding context)
3. Record the artifact type

Store all findings in `artifacts_found` array.
</scan_artifacts>

### 5. Display Validation Results

<display_results>
Present the validation summary:

---

## Validation Results

**Library Item:** `{slug}`

### Content Metrics

| Metric | Value |
|--------|-------|
| Word Count | {word_count} |
| Reading Time | ~{reading_time} min |

### Artifacts Detected

{IF artifacts_found.length > 0}

Found {artifacts_found.length} potential extraction artifact(s):

| Line | Type | Context |
|------|------|---------|
{FOR each artifact in artifacts_found}
| {artifact.line} | {artifact.type} | `{artifact.context}` |
{END FOR}

{ELSE}

No extraction artifacts detected.

{END IF}

---
</display_results>

### 6. Present A/R/X Menu

<present_menu>
**CRITICAL: Wait for user response before proceeding**

Present the decision menu:

---

## What would you like to do?

- **[A]** Approve - Mark validated and proceed
- **[R]** Retry - Exit with message to run extraction again
- **[X]** Exit - Cancel without changes

Please select:

---

**Do not proceed until user makes a selection.**
</present_menu>

### 7. Handle User Selection

<handle_selection>
Based on user choice:

**[A] Approve selected:**
1. Load `{library_path}/metadata.yaml`
2. Add/update the following fields:
   ```yaml
   validation_passed: true
   validation_date: "{current_ISO_timestamp}"
   ```
3. Save metadata.yaml
4. Confirm: "Validation approved. Metadata updated."
5. Display:
   ```
   Validation Complete

   - validation_passed: true
   - validation_date: {timestamp}

   The transcript is ready for refinement or TTS processing.
   ```

**[R] Retry selected:**
1. Display:
   ```
   Validation Not Approved

   To re-extract the transcript, run:
   /extract --re-extract {slug}

   Then run validation again.
   ```
2. Exit workflow

**[X] Exit selected:**
1. Display: "Validation cancelled. No changes made."
2. Exit workflow without modifying any files
</handle_selection>

## SUCCESS METRICS

<success_metrics>
- Transcript content loaded successfully
- Word count and reading time calculated and displayed
- All artifact patterns scanned and matches listed
- A/R/X menu presented (NEVER auto-advance)
- On approval: metadata.yaml updated with validation_passed and validation_date
</success_metrics>

## FAILURE HANDLING

<failure_handling>
| Error | Action |
|-------|--------|
| Transcript not found | Display error, offer R/X menu |
| Metadata file missing | Create new metadata.yaml on approval |
| YAML parse error | Display error, offer R/X menu |
</failure_handling>
