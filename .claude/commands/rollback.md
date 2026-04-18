---
name: rollback
description: Revert a commit, disable feature flag if applicable,
  create post-mortem task. Requires clinical-reviewer + system-architect
  sign-off before re-enable per §14.
---

Skip this command for: undoing local-only changes (use git restore or git reset instead). /rollback is for reverting commits that have been pushed and may be in users' hands.

## Behavior

On invocation with `<commit-sha>`:

1. Validate the commit SHA via `git rev-parse <sha>`. If not found, report: "Commit `<sha>` not found in git history. Check SHA with `git log`." Stop.

2. Read the commit. Report:
   - Commit message
   - Files changed
   - Author + date
   - Class (if found in commit message or linked TASKS.md entry; ask V if absent)

3. Ask V to confirm rollback with required language:
   "Confirm rollback of `<sha>`: yes/no"
   Do not proceed without explicit confirmation.

4. On V confirmation, attempt revert locally per §14 step 1:
   - Run: `git revert <sha> --no-edit`
   - If clean: report the revert commit SHA. Proceed to step 5.
   - If not clean (merge conflict): **STOP immediately.** Report the conflicting files. Do NOT auto-resolve. Do NOT proceed to feature-flag action.
     State: "Revert produced merge conflicts in: [files]. Per §22, no further action (including feature-flag disable) will be taken without explicit V confirmation. Resolve conflicts manually or confirm an alternative approach."
     *(Note: §14 step 1 says "if not clean, proceed to step 2 (feature flag)." §22 says "stop, escalate to V, no feature-flag action without explicit confirmation." §22 is more specific to this command and governs here. This tension should be reconciled at the §14 protocol level in a future session.)*
     Await V guidance.

5. After clean revert commit: ask V to confirm push before executing.
   "Revert commit `<revert-sha>` is ready locally. Confirm push to origin: yes/no"
   On confirmation: run `git push`. Report push result.
   *(§14 step 1 says "revert and push." Push is separated here for safety — pushing to main is irreversible.)*

6. Check for feature flag per §14 step 2:
   Ask V: "Is this change behind a feature flag? yes/no"
   - If yes: ask for flag name and config file path. Disable the flag. Report disabled state.
   - If no: proceed.

7. Create post-mortem task per §14 step 3. Draft entry for `TASKS.md ## POST-MORTEMS`:

   ```
   - [<YYYY-MM-DD>] <reverted commit message> — reverted <sha> → <revert-sha>.
     Status: reverted. Post-mortem: docs/<YYYY_MM_DD>/post-mortem-<slug>.md (pending).
   ```

   Show draft to V. On one-word approval, append to `## POST-MORTEMS` section of `TASKS.md`.

8. Create post-mortem doc per §14 step 4:
   - Copy `docs/adrs/post-mortem-template.md` to `docs/<YYYY_MM_DD>/post-mortem-<slug>.md`
   - Pre-fill the following fields (ask V for Symptom and Suspected Cause):
     - **Title:** kebab-slug from commit message
     - **Date:** today YYYY-MM-DD
     - **Status:** `Draft`
     - **## Symptom:** *(ask V — one sentence: what users or developers observed)*
     - **## Suspected Cause:** *(ask V — one sentence; can be refined later)*
     - **## Timeline:** One row: `<HH:MM> | Reverted commit <sha> → <revert-sha>`
     - **## Mitigation:** `Reverted commit <sha> in <revert-sha>.`
     - **## Re-enable Plan:** `Requires clinical-reviewer + system-architect sign-off via §17 review artifacts before re-entry per CLAUDE.md §14 step 5.`
   - Report: "Post-mortem template created at `<path>`. Complete the Symptom and Suspected Cause sections, then close the doc when all fields are confirmed."

9. State the re-enable gate per §14 step 5:
   "Re-enable requires `clinical-reviewer` + `system-architect` sign-off via §17 review artifacts (`docs/reviews/arch-PR<#>-<slug>.md` and `docs/reviews/clinical-PR<#>-<slug>.md` if applicable). Do NOT merge a replacement PR without both."

10. Close with exactly:
    "Rollback complete. Commit `<sha>` reverted in `<revert-sha>`. Post-mortem: `<path>`. TASKS.md updated."

On invocation without `<commit-sha>`:

- Report: "Usage: /rollback `<commit-sha>`. Provide the SHA of the commit to revert."
- Do not write anything.

## Parsing rules

- **SHA validation:** Accept full (40-char) or short hash. Resolve via `git rev-parse --verify <sha>` before any revert attempt.
- **Class detection:** Scan commit message for `Class [A-E]` pattern. If absent, scan the linked TASKS.md CONFIRMED CLEAN or ACTIVE entry. If still absent, ask V — do not assume.
- **Post-mortem slug:** Kebab-case from first 3–5 significant words of the commit message. Strip conventional-commit prefix (`feat:`, `fix:`, `docs:`, etc.) before slugging.
- **Post-mortem doc path:** `docs/YYYY_MM_DD/post-mortem-<slug>.md` — date is today in local time, underscore-separated (e.g., `docs/2026_04_17/post-mortem-ich-score-rebuild.md`).
- **POST-MORTEMS append:** Append new entry at end of `## POST-MORTEMS` section, before the next `##` header. Section may be empty — header exists in TASKS.md by default.
- **Revert command:** Always `git revert <sha> --no-edit` to avoid dropping into an editor. Revert is local-only until V confirms push in step 5.

## Failure behavior

- **No `<commit-sha>` argument** — Usage message. No action.
- **Invalid or unknown SHA** — "Commit not found. Check `git log`." No action.
- **Merge conflict on revert** — STOP. Report conflicting files. No feature-flag action without explicit V confirmation (§22 governs over §14 step 1 here — see note in step 4).
- **V declines push confirmation (step 5)** — Revert commit exists locally. Report: "Revert is local only — not pushed. Push when ready with `git push`."
- **Feature flag config unspecified by V** — Document unflagged state in post-mortem Mitigation section. Do not guess at flag names or config paths.
- **`## POST-MORTEMS` section missing from `TASKS.md`** — Offer to create the section header. Require V approval before creating.
- **`docs/adrs/post-mortem-template.md` missing** — Report absence. Offer to create a minimal placeholder doc at the target path using the known template structure (Title, Date, Status, Symptom, Suspected Cause, Timeline, Mitigation, Re-enable Plan).
- **Git revert unavailable or repo corrupt** — Fail loudly with raw git error output. Escalate to V. Take no further action.

## Output format

- Plain text. No emoji.
- Step-by-step progress with status markers: `PROCEED`, `STOP`, `WAITING FOR V`.
- Post-mortem template path always repo-relative (e.g., `docs/2026_04_17/post-mortem-<slug>.md`).
- Under 20 lines typical for a clean rollback.
- Conflict reporting may extend output — list every conflicting file, no truncation.
