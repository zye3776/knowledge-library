# Story 3.3: Remove Ad Content

Status: ready

## Story

As a **knowledge library user**,
I want advertisement content removed from my transcript,
So that I can focus on the educational material without promotional interruptions.

## Background

Beyond formal sponsor reads, YouTube content often includes other promotional content: calls to subscribe, like the video, check out merchandise, or join membership programs. Additionally, intros and outros often contain promotional framing that adds no value for audio consumption.

This story defines the **ad content and intro/outro cleanup rules** for the unified refinement prompt. See [Epic Overview](../overview.md) for the single-pass architecture decision.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given a transcript with subscribe/like requests, when refinement is applied, then these calls-to-action are removed
2. **AC2:** Given a transcript with merchandise or membership promotions, when refinement is applied, then these promotional segments are removed
3. **AC3:** Given a transcript with content-relevant channel mentions ("I covered this in my previous video on X"), when refinement is applied, then these contextual references are preserved
4. **AC4:** Given a transcript with promotional intro ("Hey guys, smash subscribe!"), when refinement is applied, then promotional content is removed but topic-setting content ("Today we'll cover authentication") is preserved
5. **AC5:** Given a transcript with promotional outro, when refinement is applied, then the content ends cleanly without engagement requests
6. **AC6:** Given mixed promotional and contextual content in the same sentence, when refinement is applied, then the sentence is restructured to preserve contextual value
7. **AC7:** Given refinement completion, when metadata is updated, then `refinement_stats.ads_removed`, `refinement_stats.intro_cleaned`, and `refinement_stats.outro_cleaned` are recorded
</acceptance_criteria>

## Tasks

- [ ] **Task 1: Write Section C of unified prompt** (AC: 1-7)
  - [ ] 1.1 Write "Section C: Ad Content Rules" markdown
  - [ ] 1.2 Include mid-content ad detection (subscribe, merch, engagement)
  - [ ] 1.3 Include intro cleanup (remove promo greeting, keep topic-setting)
  - [ ] 1.4 Include outro cleanup (remove CTA, keep conclusion)
  - [ ] 1.5 Include contextual reference preservation
  - [ ] 1.6 Specify output: `ads_removed` count, `intro_cleaned`, `outro_cleaned` booleans, one example

**KISS Note:** One deliverable (prompt section). All rules in one markdown block. No separate test fixtures.

## Technical Notes

<technical_notes>
**Ad Content Patterns to REMOVE:**

Mid-Content Promotions:
- Subscribe requests: "Smash that like button", "Subscribe and hit the bell"
- Channel promos: "Check out my other videos", "Link in description"
- Merchandise: "Check out my merch store", "T-shirts available at..."
- Membership: "Join my Patreon", "Become a channel member"
- Engagement: "Leave a comment below", "Let me know what you think"

**Intro Patterns:**

| Type | Example | Action |
|------|---------|--------|
| Pure Promotional | "Hey guys, welcome back! Smash subscribe!" | Remove entirely |
| Mixed | "Hey guys! Today we're covering auth patterns." | Remove "Hey guys!", keep topic |
| Topic-Setting | "In this tutorial, we'll build a REST API." | PRESERVE |
| Expectation-Setting | "By the end, you'll understand OAuth 2.0." | PRESERVE |

**Outro Patterns:**

| Type | Example | Action |
|------|---------|--------|
| Pure Promotional | "Don't forget to like and subscribe!" | Remove entirely |
| Mixed | "That's all for today! Subscribe for more!" | Remove subscribe CTA |
| Educational Summary | "In summary, we covered three key patterns..." | PRESERVE |
| Contextual Reference | "Next week, we'll dive into refresh tokens." | PRESERVE (educational) |

**Contextual References to PRESERVE:**
- "As I explained in my video on async/await..." (educational continuity)
- "This builds on what we learned last week..." (series context)
- "Check out the official docs for more details..." (educational recommendation)
- "I covered this in depth in my TypeScript series..." (related content)

**Mixed Content Transformation:**

Before:
```
"That's all for today! If you want to learn more about OAuth,
I covered it in my previous video. Don't forget to subscribe!"
```

After:
```
"If you want to learn more about OAuth, I covered it in my
previous video."
```

- Removed: "That's all for today!" (outro filler)
- Preserved: contextual reference to previous video
- Removed: "Don't forget to subscribe!" (promotional CTA)

**Intro Transformation:**

Before:
```
"Hey everyone, welcome back to the channel! Before we dive in,
make sure you're subscribed! Now, today we're exploring
authentication patterns in Node.js."
```

After:
```
"Today we're exploring authentication patterns in Node.js."
```

**Clean Start Requirements:**
- First sentence should introduce the topic
- No "so anyway" or "let's get into it" transitions from removed content
- If entire intro is promotional, start with first educational sentence

**Clean End Requirements:**
- Last sentence should be content-related or a summary
- No dangling "and that's it" without context
- If conclusion is pure promotional, end with last educational statement
</technical_notes>

## Verification

<verification>
### Automated Verification
```bash
# AC7 Verification - Metadata updated
yq '.refinement_stats.ads_removed' libraries/*/metadata.yaml
yq '.refinement_stats.intro_cleaned' libraries/*/metadata.yaml
yq '.refinement_stats.outro_cleaned' libraries/*/metadata.yaml

# Check start and end of content
head -3 libraries/*/refined.md
tail -3 libraries/*/refined.md
# Expected: Educational content, not promotional
```

### LLM-Assisted Verification (Recommended)
```
Prompt: "Review this transcript for audio consumption:
1. Are there any remaining subscribe/like/engagement requests?
2. Does the content start with topic introduction (not 'hey guys')?
3. Does the content end with conclusion (not 'don't forget to')?
4. Are educational channel references preserved?
List any issues found."

Input: refined.md content
Expected: No issues found
```

### Test Fixture Verification
```bash
diff refined-output.md fixtures/expected/ad-content.expected.md
```

### Manual Verification
- [ ] AC1: No subscribe/like CTAs in refined.md
- [ ] AC2: No merch/Patreon mentions
- [ ] AC3: Educational references preserved (spot check)
- [ ] AC4: Intro starts with topic, not greeting
- [ ] AC5: Outro ends with content, not CTA
- [ ] AC6: Mixed sentences restructured correctly
</verification>

## Dependencies

- Part of unified refinement skill (see [Epic Overview](../overview.md))
- Requires transcript.md to exist in library item folder
- Uses Claude's built-in capabilities (no external dependencies)

## References

- [Epic Overview](../overview.md)
- [PRD FR7, FR8](/_bmad-output/planning-artifacts/prd.md)