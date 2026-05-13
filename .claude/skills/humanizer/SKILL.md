---
name: humanizer
description: Plain-language writing style guide and AI-fingerprint checklist for NeuroWiki content. Load on all content-writer tasks before sign-off. Removes AI-generated writing patterns and enforces clinical voice.
---

# Humanizer Skill

Every piece of content — calculator interpretations, blurbs, pearls, FAQ answers, UI labels — must pass this checklist before sign-off. AI-generated text leaves fingerprints. These are the fingerprints. Remove every one.

---

## Signal Phrases — Delete on Sight

These phrases appear at unusually high frequency in AI output. If any appear in a draft, rewrite the sentence from scratch. Do not just swap the phrase — the surrounding sentence is usually also broken.

```
it's worth noting          it is worth noting         it's important to note
it is important to note    it's crucial to             it is crucial to
it's essential to          importantly,               notably,
interestingly,             significantly,             in the realm of
in the world of            in today's [X] landscape   in conclusion,
to summarize,              in summary,                to put it simply,
as we can see,             this underscores           this highlights
this emphasizes            delve into                 deep dive
leverage (when not physical)   robust (when not a test)   utilize (→ use)
dive deep                  at the end of the day      it goes without saying
needless to say            in terms of                when it comes to
the fact that              due to the fact that       a number of
a variety of               moving forward             going forward
marks a pivotal moment     represents a significant shift   broader trends
we are committed to        every effort               it goes without saying
not an afterthought        more than just             we want to know
```

---

## AI Vocabulary Cluster — High-Frequency LLM Words

These words are statistically overrepresented in LLM output post-2022 (source: Wikipedia:Signs_of_AI_writing). A single instance may be coincidental. A cluster of three or more is diagnostic. Replace with plainer alternatives where possible.

```
additionally   align with    boasts        bolstered     crucial
delve          emphasizing   enduring      enhance       fostering
garner         highlight     interplay     intricate     key (as adjective)
landscape      meticulous    pivotal       robust        showcase
tapestry       testament     underscore    valuable      vibrant
groundbreaking diverse array nestled       rich (as adj) marks as
```

**Replacement principle:** use the plainest word that carries the meaning. "Crucial" → "required" or cut the hedge entirely. "Enhance" → say what it actually does. "Vibrant" → name the specific quality. "Highlight" → "show" or "the data show."

---

## Copulative Substitutions — "Is/Are" Avoidance

AI systems are trained to avoid repeating "is/are" and replace them with elaborate constructions. These substitutions are a reliable fingerprint:

```
serves as      stands as      marks          represents
boasts         features       maintains      offers
acts as        functions as   operates as    exists as
```

**Fix:** restore the plain verb. "NeuroWiki serves as a reference tool" → "NeuroWiki is a reference tool."

Exception: when the substitution carries genuine meaning distinct from "is." "This trial represents a departure from prior design" — if "represents" is doing real work (implying significance), keep it. If it is a synonym for "is," replace it.

---

## Elegant Variation — Synonym Overuse

AI systems use repetition penalties that cause them to use synonyms more than a human writer would. Signs:

- The same concept is named differently across paragraphs for no semantic reason ("clinicians," then "practitioners," then "healthcare professionals," then "physicians" — all in the same section)
- Pronoun or noun choices shift mid-paragraph in ways that create ambiguity

**Fix:** pick one name for each concept and use it consistently. Readers do not find consistent repetition jarring; they find shifting terminology confusing.

---

## Structural Patterns — Break These Up

**Em-dash overuse.** One em-dash per paragraph is the maximum. Two or more in the same block reads as AI. Replace with a period, comma, colon, or recast the sentence.

The term — definition list pattern (`**Term** — description`) is not exempt. Use a colon: `**Term:** description`.

**Before submitting any file, run a literal grep — do not rely on a mental count:**
```
grep -n " — " <file>
```
Every match that is not inside a code comment (`//`, `/* */`, `{/* */}`) requires a fix. Mental pass is insufficient — this check must be mechanical.

**Rule of three.** AI defaults to three-item lists. "Fast, accurate, and evidence-based." If a list has exactly three items, ask whether it actually has two — or four.

**Negative parallelism.** "Not X, not Y, but Z." This pattern is an AI signature. Use it once per file at most; prefer a direct positive statement.

**Inflated symbolism.** "NeuroWiki is more than a tool — it's a lifeline." Medical software copy does not need metaphors. State what the feature does.

**Promotional language.** "Powerful," "seamless," "cutting-edge," "world-class," "game-changing." These are marketing words. NeuroWiki copy is clinical and matter-of-fact.

**Vague attributions.** "Studies show," "research suggests," "evidence indicates." Name the trial, name the year. If you cannot name it, do not cite it.

**Overqualification.** "May potentially," "could possibly," "might consider." Pick one hedge or none. "May consider" is enough. "Might potentially want to consider" is AI.

---

## Clinical Writing Rules

- **Active voice.** "Give labetalol 20 mg IV." Not "Labetalol 20 mg IV may be administered."
- **Cite by name and year.** "WAKE-UP 2018" not "a large RCT." "INTERACT-2 2013" not "recent evidence."
- **State thresholds as numbers.** "SBP >185 mmHg" not "significantly elevated blood pressure."
- **No first-person plural.** "Residents can use this to..." not "We recommend..." or "Our tool helps you..."
- **No exclamation marks.** Not in UI copy, not in blurbs, not in pearls. Ever.
- **No emojis in clinical content.** Banned in all text that appears in the app or in clinical reference documents.
- **One idea per sentence.** If a sentence has two independent clauses joined by "and," split it.

---

## Pre-Sign-Off Procedure

Before marking any content task complete, run this 9-step mental pass:

1. **Signal phrase scan** — flag any phrase from the signal-phrase list above. Zero tolerance.
2. **AI vocabulary scan** — count AI vocabulary cluster words. Three or more in one section → rewrite.
3. **Copulative check** — every "serves as / stands as / marks / represents" gets reviewed. If it means "is," make it "is."
4. **Em-dash count** — more than one per paragraph → rewrite.
5. **List audit** — every list of exactly three items gets checked. Does it need to be two? Four? Or is three genuinely right?
6. **Elegant variation check** — is the same concept named consistently throughout? Pick one term per concept.
7. **Attribution check** — every medical claim has a named trial or named guideline with year. No unnamed "studies."
8. **Voice check** — read aloud. If it sounds like a press release or a journal abstract, simplify.
9. **Number check** — every threshold, dose, and time window is stated as a number, not as a descriptor.

**Tone target:** a senior resident explaining something to an intern. Clear, direct, no hedging, no inflation.

If the draft fails any step, fix it before handoff. The humanizer checklist is a pre-condition of sign-off, not a post-condition.

---

## Reference

Pattern taxonomy sourced from: Wikipedia:Signs_of_AI_writing (https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing). The clusters, copulative substitutions, and vocabulary list in this skill are derived from that reference. Update when new model-era patterns emerge.

---

## Example Rewrites

**Before (signal phrase + promotional):**
> It's worth noting that NeuroWiki's robust calculator suite leverages the latest evidence to deliver seamless clinical decision support in the realm of neurology.

**After:**
> Each calculator cites the trial or guideline it implements. ICH Score uses Hemphill et al. (Stroke 2001). ABCD2 uses Johnston et al. (Lancet 2007).

---

**Before (vague attribution + overqualification):**
> Studies suggest that early blood pressure control may potentially reduce hematoma expansion in patients with ICH.

**After:**
> INTERACT-2 (2013) showed intensive SBP lowering to <140 mmHg reduced hematoma expansion without increasing ischemic complications.

---

**Before (rule of three + em-dash overuse + negative parallelism):**
> This is not a reference tool, not a study app, not a wiki — it's a decision support system that's fast, accurate, and evidence-based.

**After:**
> NeuroWiki surfaces the right clinical decision at the bedside, fast. It does not replace judgment — it reduces lookup time.
