# Live verification guide — 2026-05-14 overnight session

Quick checks to spot-confirm what shipped tonight. All checks run against the live site at https://neurowiki.ai.

---

## Phase A — chrome + legal (commit 16c0d07)

### 1. New logo (mobile + desktop)
- **Mobile (375px or your phone):** open https://neurowiki.ai on phone. Top-left, you should see the new brain/circuit icon (blue rounded square) next to the "NeuroWiki" wordmark — NOT a plain "N" badge anymore.
- **Desktop:** open https://neurowiki.ai in a desktop browser at ≥768px width. Left rail (224px), top of column, same icon + wordmark.
- **Tab title / favicon:** browser tab still shows the icon-favicon (unchanged this commit).

### 2. Feedback floating button restored
- Any page on the site. Look at bottom-right corner.
- You should see a pill-shaped white button with a chat-bubble icon + "Feedback" text (icon-only on mobile, with text on ≥sm).
- It floats above the mobile bottom nav and trial bottom-line drawers.
- Click it → modal opens. (Don't actually submit — it routes through Resend.)

### 3. Tidbit Health scrub
Visit these three pages and confirm zero mentions of "Tidbit Health", "info@tidbithealth.in", "based in India", or any `mailto:` links:
- https://neurowiki.ai/privacy
- https://neurowiki.ai/terms
- https://neurowiki.ai/accessibility

All contact paths should now say "Use the in-app feedback button (bottom-right of every page)".

Desktop rail footer (left side, bottom): should read "© 2026 NeuroWiki" — not "© 2026 Tidbit Health".

### 4. Hard refresh if needed
If you still see the old logo or "Tidbit Health" copy: hard refresh (Cmd+Shift+R on Mac, Ctrl+F5 on Windows). Vercel deploys in 60–180s; CDN cache can hold for an extra minute.

---

## W8.2 trial rebuilds (commits 77cb895 → 53af7dd)

Ten trial pages were updated tonight. Spot-check 3–4 of these to confirm the changes are live:

### Spot-check 1: ANGEL-ASPECT — p-value correction
- Visit https://neurowiki.ai/trials/angel-aspect-trial
- Find the stats card. The p-value should read **`0.004`** (was `<0.001` — order-of-magnitude wrong).
- Effect-size label should read `gOR 1.37` (primary statistic) instead of the prior `18.4%` (secondary ARI).

### Spot-check 2: BAOCHE — protocol amendment disclosure
- Visit https://neurowiki.ai/trials/baoche-trial
- Timeline should read "Enrolled Aug 2016 – Jun 2021 (stopped early Apr 2022 for efficacy)" — was "2020-2021".
- One of the population exclusions / pearls now discloses the mid-trial primary outcome change (mRS 0-4 → mRS 0-3) and that the original mRS 0-4 primary was negative.

### Spot-check 3: DEFUSE-3 + DAWN — DOI swap fix
- The DOIs were swapped in the repo. Click through to the DOI on each trial page:
  - https://neurowiki.ai/trials/defuse-3-trial → DOI should resolve to "Thrombectomy for Stroke at 6 to 16 Hours with Selection by Perfusion Imaging" (Albers, NEJM 2018;378(8):708-718). DOI: 10.1056/NEJMoa1713973
  - https://neurowiki.ai/trials/dawn-trial → DOI should resolve to "Thrombectomy 6 to 24 Hours after Stroke with a Mismatch between Deficit and Infarct" (Nogueira, NEJM 2018;378(1):11-21). DOI: 10.1056/NEJMoa1706442

### Spot-check 4: ENRICH — first author + Bayesian framing
- Visit https://neurowiki.ai/trials/enrich-trial
- Source line should read "Pradilla G, et al. (NEJM 2024)" — was "Hanley DF, et al." (Hanley led MISTIE III, not ENRICH).
- p-value field should read `P(sup)=0.981` with label "Bayesian posterior" — was a fabricated frequentist `p=0.04`.

### Spot-check 5: SAMMPRIS — pearl hedging
- Visit https://neurowiki.ai/trials/sammpris-trial
- First pearl should NOT say "Stenting is Dangerous" anymore. New wording hedges to: "Periprocedural harm signal: Stenting in this population (symptomatic ICAS 70-99% within 30 days of TIA/stroke, off-label Wingspan use as initial therapy) carries a high periprocedural stroke risk."

---

## Overnight session (in progress — see MORNING_REVIEW.md for status)

The overnight work runs from ~23:30 local time onward. Status, plans-needing-V-decision, and any blocking issues will land in `MORNING_REVIEW.md` at the repo root. Open that file first thing tomorrow.

Each overnight commit follows the format `<type>(<scope>): <summary>` and is tagged with the task slug — `feat(search): ...`, `clinical(pathway): ...`, etc. Run `git log --oneline 16c0d07..HEAD` in the morning to see everything that landed.

---

## If something looks broken

1. Hard refresh first (Cmd+Shift+R / Ctrl+F5).
2. If still broken: open the browser DevTools console (Cmd+Opt+I), reload, screenshot the console.
3. Post the screenshot + the URL + symptom in a new session — I'll triage via `/incident`.
4. Don't worry about rolling back yourself: `/rollback <commit-sha>` will handle it once you tell me which commit.

---

## Quick git commands (for reference, you don't need to run them)

```bash
# What landed tonight:
git log --oneline 0790a05..HEAD

# What changed on a specific commit:
git show --stat <sha>

# Live site is at HEAD of main; Vercel auto-deploys every push.
```
