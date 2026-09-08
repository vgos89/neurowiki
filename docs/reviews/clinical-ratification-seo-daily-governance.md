# Clinical ratification — seo-daily-governance §3 (SEO-DAILY-PORT)

**Decision:** ratify-with-conditions (6 conditions, all blocking; ALL APPLIED verbatim to `.claude/rules/seo-daily-governance.md` §3/§10 and `.claude/commands/seo-daily.md` Step 4 on 2026-09-07, same session, before the port shipped)
**Reviewer:** clinical-reviewer (fresh-context subagent per CLAUDE.md §18)
**Date:** 2026-09-07
**Scope:** one question only, per architect condition 14 of `docs/reviews/arch-PR-seo-daily-port.md`: is the clinical-escalation boundary for the unattended SEO job's snippet proposals correct and sufficient? This is not a §17.2 PR review; no claims or citations were touched by the port itself.

---

## Verdict as returned by the reviewer

The boundary is *correct* — nothing in it is wrong — but it is **not sufficient**. Two facts verified in the repo drive that:

1. **The four-item enumeration (dose / threshold / time window / recommendation) under-catches on this site specifically.** The snippet surfaces are saturated with clinical categories the list did not name. From `src/seo/schema.ts` (`QUESTION_META`), live description/answer text includes: "The 2026 AHA/ASA guidelines rate large-core EVT COR 1", "BEST and BASICS neutral, ATTENTION and BAOCHE positive", "ESCAPE-MeVO and DISTAL both failed their primary endpoints", "ARAMIS confirmed DAPT was noninferior to alteplase", "may improve excellent outcomes", "in patients ≤60 years". None states a dose, threshold, window, or recommendation. Every one is a never-drift category (strength, certainty, population, trial-result characterization).

2. **The Class E label is the *only* clinical gate on these surfaces, not a redundant one.** `scripts/check-claims.ts` validates only claims that already carry a tag; `src/config/routeManifest.ts`, `src/seo/routeMeta.ts`, and `src/seo/schema.ts` carry none and none is listed in `.claude/rules/clinical-surfaces.md`. When V applies a snippet rewrite, the claims hook goes green and nothing forces a `-clinical` classification. Only the humanizer em-dash scanner fires.

## Conditions (summary; the applied text is authoritative in the governance file)

- **C1** Flag-by-default with a named safe list (navigation/utility/index pages only; calculator, pathway, guide, trial and question pages never safe) and a ten-category clinical list: dose/route/frequency; numeric threshold or score cutoff; time window or temporal qualifier; recommendation or its strength; guideline class / level of evidence; trial-result characterization and any named trial cited as evidence; certainty marker; population or eligibility qualifier; drug/device/procedure beside a condition implying an indication; any statistic, rate, or effect size.
- **C2** No new clinical assertion: proposals may only re-arrange clinical content already published on the target page; never answer a clinical question from a search query. Added to both the governance file and procedure Step 4.
- **C3** The character budget never buys itself with a qualifier: if the length limits cannot be met without dropping a population, hedge, window, grade, trial-result word or eligibility qualifier, no proposal is made.
- **C4** Every copy, or none: snippet wording is duplicated across `routeManifest.ts`, `routeMeta.ts`, and `schema.ts` (`QUESTION_META`); each proposal lists every file/field holding the current string; a clinical proposal is applied to all copies in one supervised change or to none. Structured-data `answer` fields and FAQ answers are out of the job's scope.
- **C5** Stated plainly in the governance file: clinical checking never becomes hook tier on these surfaces; the label and the human reading it are the entire clinical gate.
- **C6** Standing header on every proposals file: "These are drafts written without supervision. An unlabeled proposal has not been clinically reviewed, it has only not been flagged. Anything touching clinical wording needs medical review before it goes on the site."
- Plus: governance §10 extended so removing or narrowing any §3 category itself requires clinical-reviewer sign-off.

## Reviewer's rationale (verbatim)

The three questions asked resolve as: the enumeration misses at least five live categories (guideline class/LOE, trial-result characterization, certainty markers, non-numeric population and eligibility gates, drug-beside-condition implied indication) — all of them present in shipped NeuroWiki descriptions today, and all of them never-drift categories under the review rubric; "unsure means flagged" is the right instinct but the wrong default for an unattended writer whose optimization target (click-through) is *systematically* served by deleting hedges and qualifiers, so it must flip to flag-by-default against a named safe list; and the hook-free draft directory is acceptable in itself, because a draft is inert text and a human stands between it and the site — but the human is non-technical and the surface they paste into is clinically unhooked, so the label cannot be treated as belt-and-braces over a mechanical check that does not exist. The conditions do not restrict what the job may propose; they make the labeling default safe, forbid invention, stop the character budget from being paid for with a qualifier, name the real apply targets so a half-applied edit cannot ship divergent clinical text, and state plainly in the file that this label is the whole gate — which is the sentence most likely to stop a future session from trimming the list to reduce noise.

## Follow-up noted for a future task (not blocking this port)

The reviewer's finding that `routeManifest.ts` / `routeMeta.ts` / `schema.ts` are clinically load-bearing but absent from `.claude/rules/clinical-surfaces.md` and untagged in the claims registry is a pre-existing coverage gap, independent of this port. Logged in TASKS.md parking lot for a data-architect scanner-extension pass.
