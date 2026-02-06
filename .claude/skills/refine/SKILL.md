---
name: refine
description: Remove sponsors, visual references, and ads from transcripts for audio consumption.
---

# Refine

Clean a library item's transcript by removing sponsors, visual references, and ad content using a single unified refinement pass.

**Usage:** `/refine {slug}`

## When to Use

- User wants to clean a transcript before converting to audio
- Preparing content for screen-free consumption
- Removing noise (sponsors, visual refs, ads) from YouTube transcripts

**Requires:** A library item with `transcript.md`.

## Instructions

<instructions>

### Step 1: Parse Arguments

1. The user provides `{slug}` as a positional argument
2. If no slug provided, list available library items from `libraries/` and report error:
   ```
   Error: No slug provided.
   Usage: /refine {slug}
   Available items: {list directory names in libraries/}
   ```

### Step 2: Locate Transcript

1. Check if `libraries/{slug}/` directory exists. If not, report error:
   ```
   Error: Library item not found: libraries/{slug}/
   ```
2. Check if `libraries/{slug}/transcript.md` exists. If not, report error:
   ```
   Error: No transcript.md found in libraries/{slug}/
   ```
3. If `libraries/{slug}/refined.md` already exists, log a warning:
   ```
   Warning: Overwriting existing refined.md
   ```

### Step 3: Read Transcript

1. Read the full contents of `libraries/{slug}/transcript.md`

### Step 4: Run Unified Refinement

Send the transcript to Claude with this unified refinement prompt. The prompt combines three rule sections (sponsors, visual references, ads) into a single pass.

Provide this system-level instruction to Claude:

```
You are a content refinement assistant. Your job is to clean a YouTube transcript for audio consumption by removing noise while preserving all educational content.

Apply ALL of the following rules in a single pass:

## Section A: Sponsor Removal Rules

### What to REMOVE
Sponsor segments are promotional content where the creator endorses a product/service for payment:
- "This video is sponsored by..."
- "Thanks to [Company] for sponsoring..."
- "Use code [X] for [N]% off..."
- "Check out [Company] at the link below..."
- "Before we continue, a word from our sponsor..."
- "Speaking of [topic], our sponsor [Company]..."
- Discount codes and affiliate mentions

Remove the ENTIRE sponsor segment, not just trigger phrases.

### What to PRESERVE
Technical product mentions are NOT sponsors:
- "We're using Redis for caching in this architecture"
- "Install the NordVPN CLI for this VPN example"
- "I recommend reading the Kubernetes docs"

PRESERVE these - they're educational, not promotional.

### Decision Logic
IF mention includes explicit sponsorship language OR discount codes OR affiliate CTAs:
  → REMOVE entire segment
IF mention is technical explanation or educational reference:
  → PRESERVE

## Section B: Visual Reference Rules

### What to REMOVE or TRANSFORM
Visual references are phrases that refer to on-screen elements a listener cannot see.

Common patterns:
- "As you can see here..."
- "Look at this..."
- "On the screen..."
- "In this diagram..."
- "If you look at the code..."
- "The highlighted section shows..."
- "Notice how this..."
- "Let me show you..."
- "Check out this code snippet..."
- "The blue box on the left..."
- "Scroll down to see..."
- "In the screenshot..."

### Transformation Rules
1. **Explained visual refs** — remove prefix, keep explanation:
   - Before: "As you can see, the function returns an array"
   - After: "The function returns an array"

2. **Unexplained visual refs** — remove entire sentence:
   - Before: "Look at this next diagram."
   - After: [removed]

3. **Mid-sentence refs** — restructure:
   - Before: "The function, as you can see, returns a promise."
   - After: "The function returns a promise."

4. **Grammar preservation** — ensure all remaining sentences are grammatically correct.

## Section C: Ad Content & Intro/Outro Rules

### Mid-Content Ads to REMOVE
- Subscribe requests: "Smash that like button", "Subscribe and hit the bell"
- Channel promos: "Check out my other videos", "Link in description"
- Merchandise: "Check out my merch store"
- Membership: "Join my Patreon", "Become a channel member"
- Engagement bait: "Leave a comment below", "Let me know what you think"

### Intro Cleanup
- Remove promotional greetings: "Hey guys, welcome back! Smash subscribe!"
- PRESERVE topic-setting content: "Today we're covering authentication patterns"
- For mixed intros, remove promo and keep the topic introduction

### Outro Cleanup
- Remove engagement CTAs: "Don't forget to like and subscribe!"
- PRESERVE educational summaries: "In summary, we covered three key patterns..."
- PRESERVE contextual references: "Next week, we'll dive into refresh tokens."

### Contextual References to PRESERVE
- "As I explained in my video on async/await..." (educational)
- "This builds on what we learned last week..." (series context)
- "Check out the official docs for more details..." (educational)

### Mixed Content
When promotional and educational content are in the same sentence, restructure to keep the educational part.

## Transition Quality
After ALL removals:
- No orphaned references to removed content
- No abrupt topic shifts
- No incomplete sentences
- Content starts with topic introduction
- Content ends with conclusion or last educational statement

## Output Format

You MUST output in this EXACT format:

---BEGIN REFINED CONTENT---
[The full refined transcript text here]
---END REFINED CONTENT---

---BEGIN STATS---
sponsors_removed: [number]
visual_refs_removed: [number]
ads_removed: [number]
intro_cleaned: [true/false]
outro_cleaned: [true/false]
original_words: [number]
refined_words: [number]
---END STATS---

---BEGIN EXAMPLES---
sponsor_example: "[example text removed]" (if any)
visual_ref_example: "[example text removed]" (if any)
ad_example: "[example text removed]" (if any)
---END EXAMPLES---
```

Pass the transcript content as the user message.

### Step 5: Parse Output

1. Split the response on the delimiters:
   - Extract text between `---BEGIN REFINED CONTENT---` and `---END REFINED CONTENT---`
   - Extract stats between `---BEGIN STATS---` and `---END STATS---`
   - Extract examples between `---BEGIN EXAMPLES---` and `---END EXAMPLES---`
2. If parsing fails, report error and show the raw output for debugging

### Step 6: Save Refined Content

1. Write the refined content to `libraries/{slug}/refined.md`
2. Read existing `libraries/{slug}/metadata.yaml` (create if it does not exist)
3. Update metadata with:
   - `stage: refined_pending_review`
   - `refined_at: "{ISO 8601 timestamp}"`
   - `refinement_stats:` (all stats from parsed output)
   - Calculate and add `reduction_percent` from word counts
4. Write back the updated metadata.yaml, preserving existing fields

### Step 7: Present Review Summary

Display the refinement summary:
```
REFINEMENT COMPLETE

Summary:
  Sponsors removed: {N}
    > "{sponsor_example}"
  Visual refs removed: {N}
    > "{visual_ref_example}"
  Ads removed: {N}
    > "{ad_example}"
  Intro cleaned: {Yes/No}
  Outro cleaned: {Yes/No}

  Original: {N} words -> Refined: {N} words ({N}% reduction)

[A] Approve - Use refined.md for audio
[R] Reject  - Use original transcript.md
[V] View    - See full refined content
[E] Edit    - Manually edit refined.md
```

### Step 8: Handle Review Decision

Wait for the user's choice:

1. **[A] Approve:**
   - Update metadata: `stage: refined`, `refinement_approved_at: "{timestamp}"`, `refinement_decision: approved`
   - Report: "Refinement approved. Use `/consume {slug}` to generate audio."

2. **[R] Reject:**
   - Update metadata: `stage: refinement_skipped`, `refinement_rejected_at: "{timestamp}"`, `refinement_decision: rejected`, `use_original: true`
   - Report: "Refinement rejected. Original transcript.md will be used for audio."

3. **[V] View:**
   - Display the full contents of `libraries/{slug}/refined.md`
   - Return to the review menu (Step 7)

4. **[E] Edit:**
   - Tell the user: "Edit `libraries/{slug}/refined.md` in your editor, then return here."
   - Wait for the user to confirm edits are done
   - Return to the review menu (Step 7)

</instructions>

## Error Handling

| Condition | Action |
|-----------|--------|
| No slug argument | List available items, report error |
| Library item not found | Report missing directory |
| No transcript.md | Report missing file |
| Refinement output unparseable | Show raw output for debugging |
| refined.md exists | Warn and overwrite |

## Examples

```bash
# Refine a library item
/refine best-to-do-list-apps-for-2026

# Output:
# REFINEMENT COMPLETE
#
# Summary:
#   Sponsors removed: 2
#     > "This video is sponsored by NordVPN..."
#   Visual refs removed: 8
#     > "As you can see here..."
#   Ads removed: 3
#     > "Smash that like button..."
#   Intro cleaned: Yes
#   Outro cleaned: Yes
#
#   Original: 4,523 words -> Refined: 3,891 words (14% reduction)
#
# [A] Approve  [R] Reject  [V] View  [E] Edit
```
