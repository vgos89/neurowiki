# Morning Briefing — 2026-05-20

> Autonomous audit produced while V was asleep. Read-only summary; no code shipped here. Action items are at the end.

---

## 1. Yesterday's work — what shipped (this session)

**~25 commits across one extended work day.** Major themes:

**Trial catalog expansion (V's PDFs):**
12 new trial entries + cleanup commits — RESCUE-Japan LIMIT, EXTEND-IA TNK, ANNEXA-I, CREST-2, CLOSE, RESPECT, REDUCE, IST, CAST, THEIA, plus BEST-MSU metadata fill and DECIMAL+DESTINY primary-frame resolution, plus 2015 EVT cluster NNT-from-secondary disclosure tightening.

**iOS / UX hardening (V's iPhone testing):**
- Full-site `vh → dvh` sweep (44 files, "aspect ratio is weird" fix)
- PWA install overlay re-trigger + scale-in animation + replay link
- LKW picker iOS digit-visibility fix + manual entry + AM/PM toggle + blank-on-mount + auto-snap regression fix + Sleep Onset AI-template cleanup
- TimestampBubble auto-stamp Neurology Eval on first interaction + pencil-edit on every row + iOS-reliable focus
- FAB attention loop + Save Case label
- First-time onboarding tour
- EMR placeholder em-dash cleanup
- iOS P1 hardening (`type="number"` → `type="text" inputMode`) + P2 utilities (overscroll-contain, text-size-adjust, scroll-anchor)

**Governance:**
- Editorial-context hard requirement (§8a–§8d) added to evidence-verifier brief and clinical-reviewer gate

---

## 2. Codebase health snapshot

| Metric | Value | Notes |
|---|---|---|
| Total trial entries | **101** | up from ~89 yesterday |
| primaryDesign tagged | 86 / 101 (85%) | 15 untagged (audit list below) |
| primaryResult tagged | 85 / 101 (84%) | matches above |
| chainMembership tagged | 8 / 101 (8%) | Phase 1: hemicraniectomy + basilar-evt clusters |
| claimId on trial entry | 12 / 101 (12%) | New entries this session (PRoFESS onward) |
| Citation registry | 31 entries | All `last_reviewed: 2026-05-19` or `2026-05-20` ✓ |
| Claim registry | 29 entries | All on DATA_SURFACE |
| Stale citations (>6mo) | **0** | clean |
| Bundle total | 6.5 MB | acceptable |
| Largest chunks | `trialData-*.js` (802 KB), `TrialPageNew-*.js` (460 KB), `TrialVisualizations-*.js` (390 KB), `MyCases-*.js` (360 KB) | TrialPageNew split is a known P1 in TASKS.md |
| `tsc --noEmit` | PASS | as of last commit |
| `npm run build` | PASS | |
| `npm run check:claims` | PASS | |
| `npm run check:chains` | PASS | |
| `npm run check:routes` | PASS (43 routes) | |

---

## 3. Catalog coverage gaps

### 3a. Trials without `primaryDesign` / `primaryResult` (15 trials)

These are mostly historic predecessors / minor trials. Worth filling in a future Tier 3 sweep:

- `elan-study`
- `mr-asap-trial`
- `racecat-trial`
- `right-2-trial`
- `triage-stroke-trial`
- `ims-iii-trial`
- `synthesis-expansion-trial`
- `mr-rescue-trial`
- `best-trial` (basilar — has primaryDesign on the data; the audit grep may be a false positive — verify)
- `basics-trial` (same; verify)
- `match-trial`
- `charisma-trial`
- `stich-i-trial`
- `stich-ii-trial`
- `mistie-iii-trial`

**Effort estimate:** 1 hour for an audit-driven bulk fill (audit knowledge exists; no PDFs needed for most of these landmark trials).

### 3b. Trials orphaned from any clinical question (21 trials)

Trials in catalog but not referenced by any `trial-questions.ts` entry:

**Intentional / known-parking-lot** (today's new entries that need a custom question):
- `annexa-i-trial` → needs "How do I reverse anticoagulation in ICH?" question
- `crest-2-trial` + `crest-trial` → needs "Asymptomatic carotid stenosis: revascularize or medical?" question
- `close-trial` + `respect-trial` + `reduce-trial` → needs "PFO closure for cryptogenic stroke?" question
- `ist-trial` + `cast-trial` → needs "Aspirin in the ED for acute ischemic stroke?" question (and these belong contextually on `dapt` too)
- `theia-trial` + `eagle-trial` → needs "CRAO: IV alteplase or supportive care?" question
- `profess-trial` → belongs on `dapt` contextual

**Genuine orphans worth assigning:**
- `prost-trial` + `prost-2-trial` → reteplase / rhPro-UK trials, could anchor a "Reteplase or alteplase?" question or land on `tnk-vs-alteplase` as contextual
- `ims-iii-trial`, `synthesis-expansion-trial`, `mr-rescue-trial` → 2013 negative EVT predecessors of the 2015 cluster; belong on `lvo-evt` as historical context
- `match-trial`, `charisma-trial` → DAPT-harm predecessors of CHANCE/POINT, belong on `dapt` contextual
- `sparcl-trial` → statin-after-stroke, currently orphan — could anchor a "Statin intensity after stroke?" question
- `racecat-trial`, `triage-stroke-trial` → prehospital routing trials, could anchor "Where should the stroke ambulance go?"

### 3c. Chain coverage (Phase 2 timeline work)

Only `hemicraniectomy` + `basilar-evt` chains shipped (Phase 1, 8 trials). Phase 2 chains queued per architect's plan:
- **antiplatelet-acute** (now unlocked — IST + CAST + PRoFESS shipped today as foundational predecessors): CAPRIE → ESPS-2 → PRoFESS → IST/CAST → CHANCE → POINT → THALES → CHANCE-2 → INSPIRES
- **evt-anterior**: IMS-III/SYNTHESIS/MR-RESCUE → 2015 cluster → DAWN/DEFUSE-3 → RESCUE-Japan LIMIT/SELECT2/ANGEL-ASPECT/LASTE/TENSION
- **evt-mevo**: ESCAPE-MeVO + DISTAL
- **evt-bridging**: DIRECT-MT → DEVT/SKIP/MR CLEAN-NO IV/SWIFT-DIRECT/DIRECT-SAFE
- **carotid** (now unlocked — CREST + CREST-2 shipped): SAPPHIRE → EVA-3S → SPACE → ICSS → CREST → ACT-1 → CREST-2
- **pfo-closure** (NEW — unlocked by today's PFO cluster): CLOSURE-I → original RESPECT → CLOSE + RESPECT long-term + REDUCE
- **ivt-tenecteplase**: NOR-TEST → EXTEND-IA TNK → AcT/TASTE/ATTEST-2/TRACE-2/ORIGINAL + NOR-TEST 2 Part A (harm) + TWIST + TIMELESS/TRACE-III (late-window)
- **doac-after-af**: TIMING → ELAN → OPTIMAS

**Recommendation:** wire the easiest 2-3 chains (pfo-closure, carotid, evt-mevo) in a single Phase 2 commit since the trials are now all in catalog. The bigger antiplatelet and evt-anterior chains need predecessor-stub work (some IDs in TASKS.md W7.0) before they can ship clean.

---

## 4. Open decisions queued for V

1. **Plugins to enable** (from your screenshot)
   - **Bio research** — recommend enable, investigate first. May supplement evidence-verifier / medical-scientist with maintained methodology skills.
   - **Legal** — selectively useful, would supplement `compliance-legal` agent. Check for namespace conflicts before enabling.
   - **Data** — marginal; our custom `data-architect` is more tailored.
   - **Productivity** — optional, mostly V-side workflow.
   - **Don't enable:** Marketing, Sales, Finance, Brand voice (NeuroWiki is a clinical tool, not a marketed product).

2. **Pending PDFs** (still blocking 2 trials)
   - **ESCAPE-NEXT** (Hill, Lancet 2025) — closes ESCAPE-NA1 / nerinetide story
   - **CSPS.com** (Toyoda, Lancet Neurology 2019) — antiplatelet timeline foundational predecessor

3. **New clinical questions to author** (parking-lot accumulating)
   - PFO closure for cryptogenic stroke (groups CLOSE + RESPECT + REDUCE)
   - Asymptomatic carotid stenosis (groups CREST 2010 + CREST-2)
   - Anticoagulation reversal in ICH (groups ANNEXA-I, plus future PROTECT-U / 4F-PCC entries)
   - Aspirin in the ED for acute ischemic stroke (groups IST + CAST + contextual CHANCE/POINT)
   - CRAO management (groups THEIA + EAGLE)
   - Reteplase or alteplase? (groups PROST + PROST-2 + RAISE)

   **Effort:** ~30 min per question (audit-derived, no new clinical authoring needed — just data file edits).

4. **Timeline Phase 2 chain wiring**
   - pfo-closure (3 trials), carotid (CREST + CREST-2, 2 trials), evt-mevo (2 trials) are unlock-ready now. Phase 2 first wave could ship as one architect-approved commit.

5. **TrialPageNew bundle split** (P1 from TASKS.md)
   - 460 KB chunk — lazy-load trial-data subset by ID. Already in your TASKS.md PENDING list.

---

## 5. Plugin recommendations (decision framework)

When you enable a plugin, you get:
- New skills available as `namespace:skill-name` (auto-updated by Anthropic)
- New agents available
- New slash commands (watch for conflicts with `/build`, `/focus`, `/status`)
- Possibly new MCP servers

**Pros of plugins over our custom skills:**
- Anthropic auto-updates as Claude Code product evolves
- Free maintenance — we don't carry the burden
- Cross-project portability — V uses the same plugin in NeuroWiki + other projects

**Cons:**
- Less tailored than our `.claude/skills/` (which encode NeuroWiki-specific rules)
- Namespace collisions possible with our existing roster
- We can't pin a version — if Anthropic ships a breaking change, our workflows might shift

**Right strategy:**
- **Keep our custom skills** for NeuroWiki-specific rules (Option Y NNT rule, our exact design enums, citation registry conventions, PBKDF2 floors)
- **Use plugin skills** for general domain knowledge that's broadly applicable (e.g., already using `engineering:code-review`, `design:design-system`)
- **Bio research is the most-promising new addition** — enable + audit what it provides before relying on it

---

## 6. Recommended priorities for next session

In order of impact:

1. **Ship Timeline Phase 2 first wave** (pfo-closure + carotid + evt-mevo chains). Architect's path is approved; just needs to be executed. ~30-45 min.

2. **Author 1-2 of the queued clinical questions** (PFO closure question is highest-impact since it groups 3 today-shipped trials). ~30 min each.

3. **ESCAPE-NEXT + CSPS.com authoring** once PDFs arrive.

4. **Bulk-fill primaryDesign on the 15 remaining trials** from audit knowledge (no PDFs needed for landmark trials).

5. **TrialPageNew bundle split** (perf P1).

Skipping for now: external editorial pulls flagged TODO-VERIFY across yesterday's commits (NEJM accompanying editorials for CREST-2 / THEIA / ANNEXA-I — paywalled, recheck at next freshness review per §13.7).

---

## 7. Files referenced

- This briefing: `docs/morning-briefing-2026-05-20.md`
- Yesterday's commits: `git log --oneline --since=yesterday`
- Architect plan for timeline: `docs/reviews/arch-trial-chain-timeline-2026-05-20.md`
- Editorial-context governance rule: `.claude/agents/evidence-verifier.md` §8 (commit 479f100)
- Pending PDF queue: `docs/research/2026-05-19-trial-audit/04-paywall-status.md`
- All clinical-review artifacts from yesterday: `docs/reviews/clinical-PR-*-2026-05-20.md`

---

*Briefing produced 2026-05-20 overnight. No code changes shipped.*
