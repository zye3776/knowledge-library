---
name: 'step-03-review'
description: 'Display transcript preview and present A/C approval menu'
---

# Step 3: Review Transcript

## STEP GOAL

Display a preview of the extracted transcript and present an A/C menu for user approval.

## MANDATORY SEQUENCE

### 1. Display Transcript Preview

<preview>
Show the extracted transcript with formatting:

---
## Transcript Preview

**Source:** {youtube_url}
**Length:** {character_count} characters | {line_count} lines

---

{Display transcript content - show reasonable preview}

---
</preview>

### 2. Present A/C Menu

<menu>
**CRITICAL: Wait for user response before proceeding**

Present the approval menu:

---
## Review Complete

What would you like to do?

- **[A]pprove** - Save this transcript to the knowledge library
- **[C]ancel** - Exit without saving

---

**Do not proceed until user makes a selection.**
</menu>

### 3. Handle User Selection

<selection>
Based on user choice:

**[A]pprove selected:**
- Confirm: "Approved. Saving to knowledge library..."
- Proceed to: `step-04-save.md`

**[C]ancel selected:**
- Confirm: "Cancelled. Exiting without saving."
- Exit workflow cleanly
- Do NOT create any files or folders
- Display: "Workflow cancelled. No content was saved."
</selection>

## Menu Behavior Notes

<notes>
- This is a BLOCKING step - workflow pauses here until user decides
- User can type "A", "a", "Approve", "approve" for approval
- User can type "C", "c", "Cancel", "cancel" for cancellation
- If input is unclear, ask for clarification: "Please choose [A]pprove or [C]ancel"
- Never auto-approve - this violates MANDATORY EXECUTION RULES
</notes>
