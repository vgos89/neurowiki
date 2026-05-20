# Compliance review — hipaa-saved-cases-2026-05-19

**Decision:** pass-with-conditions
**Reviewer:** compliance-legal
**Date:** 2026-05-19

---

## Scope reviewed

- `src/pages/PrivacyPage.tsx`
- `src/pages/TermsPage.tsx`
- `src/components/DisclaimerModal.tsx`
- `src/components/cases/SaveCaseModal.tsx`
- `src/lib/cases/types.ts`
- `src/lib/cases/transfer.ts`
- `src/lib/crypto/caseCipher.ts`

Data surfaces reviewed: Save Case input modal, IndexedDB schema, transfer relay encryption chain, Privacy Policy sections (Saved Cases + Cross-device transfer), Terms of Use, first-visit DisclaimerModal.

---

## Findings, by question

### Finding 1 — Is this data PHI under HIPAA?

**Regulation:** 45 CFR §160.103 (PHI definition); 45 CFR §164.514(b)(2) (Safe Harbor de-identification)

**Answer:** The combination NeuroWiki stores is not clearly de-identified under Safe Harbor. The current Privacy Policy framing — "It does not collect, store, or transmit protected health information" — is legally imprecise.

**Analysis:**

Safe Harbor de-identification under 45 CFR §164.514(b)(2) requires removal of all 18 enumerated identifiers, including: (2) geographic data smaller than state, (3) all elements of dates except year for persons >89, (5) contact numbers, and — critically — (17) "Any other unique identifying number, characteristic, or code." The standard is not a checklist; all 18 must be addressed.

Data stored per case includes:

- Initials (2–4 uppercase letters)
- Last Known Well timestamp (absolute date + time)
- Code Activation, Neurology Evaluation, CT Read Time, Neuro IR Contacted, NCC/ICU Sign-out — each an absolute date+time
- NIHSS score + per-item values
- Systolic BP, diastolic BP, glucose
- Anticoagulant class (DOAC / Warfarin / Antiplatelet)
- "Exam Performed" auto-captured date+time

Timestamps are the central problem. Safe Harbor item (3) requires removal of "all elements of dates (except year) directly related to an individual." Absolute timestamps (date + time-of-day) are exactly the element that must be stripped. A stroke code timestamp — Code Activation at 03:14 on a specific date, associated with initials and a precise NIHSS score — is potentially re-identifiable within a single hospital shift by anyone with access to the stroke code log or nursing schedule. **The initials are not the re-identification vector; the timestamp constellation is.**

HIPAA's PHI definition at 45 CFR §160.103 includes health information that "identifies the individual or there is a reasonable basis to believe the information can be used to identify the individual." A set of five precise timestamps + NIHSS score + BP + glucose + initials is not unreasonably identifiable in a hospital setting.

**Severity: blocking** for the "does not collect PHI" framing.

**Delegate:** content-writer to revise the "Who we are" section.

---

### Finding 2 — Does NeuroWiki fall under HIPAA's reach?

**Regulation:** 45 CFR §160.103 (CE definition); 45 CFR §164.502(e), §164.504(e) (BA definition)

**Answer:** Framing is substantively correct but the existing Privacy Policy overstates it.

**Analysis:**

NeuroWiki is **not a Covered Entity** (no billing, no insurance relationship, no claim submission). NeuroWiki is **not a Business Associate** (no BAA with any hospital). HIPAA does not directly regulate NeuroWiki.

However, the statement "NeuroWiki is not a covered entity under HIPAA. It does not collect, store, or transmit protected health information" conflates two separate claims: the first is a legal status (correct); the second is a factual claim about the data (contestable). These should not be joined as if equivalent.

**Severity: advisory** on the framing itself; **blocking** on the combined sentence as currently written.

**Delegate:** content-writer to separate the two claims.

---

### Finding 3 — What is NeuroWiki's obligation if the clinician is creating PHI?

**Regulation:** No direct HIPAA obligation. Obligation runs in tort and consumer protection.

**Answer:** Honest, prominent, clinician-actionable disclosure — not HIPAA compliance on the clinician's behalf.

Three non-HIPAA obligations apply:

1. **Disclosure duty** (consumer protection / reasonable reliance) — if a clinician relies on "does not collect PHI" and this becomes a compliance problem for their institution, NeuroWiki's representation is the source.
2. **Design duty** — currently met in the UI (amber "Initials only" callout, DisclaimerModal); gap is in the Privacy Policy.
3. **Clinician-actionable disclosure** — Privacy Policy should explicitly tell clinicians that entering clinical context alongside initials may constitute PHI under their hospital's policy.

**Severity: blocking.**

**Delegate:** content-writer.

---

### Finding 4 — Does Option Q change the HIPAA analysis?

**Regulation:** 45 CFR §164.514(b); HHS encryption guidance

**Answer:** Encryption ≠ de-identification. Option Q improves security substantially but does not change whether the underlying data is PHI.

**Severity: advisory.** Privacy Policy description of relay encryption should be updated when Option Q ships.

---

### Finding 5 — Language framework for required additions

**Required addition A** — "Who we are" section: replace sentence 2 with language that:
- Correctly states NeuroWiki is not a CE or BA
- Acknowledges clinical context stored via Save Case may constitute PHI under the clinician's hospital's policy
- Tells the clinician they are responsible for determining whether using Save Case is consistent with their institution's policy
- Does not overstate or understate

**Required addition B** — Saved Cases section: new paragraph that:
- Names the specific data types stored (initials, scores, timestamps including LKW + stroke timestamps, vitals, anticoag class)
- States this combination may constitute PHI under hospital HIPAA obligations
- Directs clinician to institution's privacy officer if uncertain
- Notes NeuroWiki itself is not a HIPAA-covered entity

**Required addition C** — Note field removal acknowledgment: once the note input is removed, update Privacy Policy to remove reference to the optional note and note that existing pre-change cases may still display a note.

**Severity: blocking** on all three. **Delegate:** content-writer.

---

### Finding 6 — Residual identifiability of timestamps

**Answer:** Option (a) — honest disclosure + clinician decides — is the minimum required. Option (c) — relative-elapsed default with absolute opt-in — is the recommendation if product permits.

**Option (a):** disclose timestamps in Privacy Policy. Required regardless of which option ships.

**Option (b):** strip timestamps to relative-elapsed only. Cleanly de-identifies but **destroys quality-metric utility** (door-to-needle requires absolute timestamps).

**Option (c):** relative-elapsed by default; absolute opt-in with explicit disclosure at save time. **Best balance.** Class C-clinical task.

**Severity: blocking** on disclosure gap (Finding 5 addition B covers); **advisory** on product option (V's call).

---

### Finding 7 — Factual error: relay TTL

PrivacyPage.tsx says cleanup purges within "~24 hours"; source code sets `TRANSFER_TTL_MINUTES = 15`. The "15 minutes maximum" elsewhere in the same sentence is correct; the "~24 hours" is inconsistent. Should reference the cron backstop interval if documented, or be removed.

**Severity: advisory.** **Delegate:** content-writer.

---

### Finding 8 — "No patient data stored anywhere" contradicts the table

The bold declaration "No user accounts. No passwords. No patient data stored anywhere." sits immediately below a table that lists Saved Cases (with patient initials + scores + timestamps stored in IndexedDB). The two are inconsistent.

**Severity: blocking.** Must be removed or replaced with accurate summary.

**Delegate:** content-writer.

---

### Finding 9 — DisclaimerModal imprecision

DisclaimerModal.tsx line 205: "NeuroWiki does not collect identifiable patient data." Imprecise given the timestamp constellation analysis in Finding 1. Defensible if "identifiable" is read strictly (no name, MRN, DOB) but legally exposed.

**Severity: advisory.** Recommend revision to "NeuroWiki does not collect your name, MRN, or date of birth." V decides whether to bump DISCLAIMER_VERSION (forcing re-acceptance).

---

## Summary table

| # | Issue | Severity |
|---|---|---|
| 1 | "Does not collect PHI" legally imprecise given timestamp+vitals constellation | Blocking |
| 2 | CE/BA framing conflates two separate claims | Blocking |
| 3 | No clinician-actionable disclosure about hospital HIPAA obligations | Blocking |
| 4 | Option Q encryption — accurate as implemented; update description when Q ships | Pass |
| 5 | Language framework for required additions A, B, C | Blocking |
| 6 | Timestamp identifiability — disclosure blocking; product option for V | Blocking (disclosure) / Advisory (product) |
| 7 | "~24 hours" cron TTL figure is inconsistent | Advisory |
| 8 | "No patient data stored anywhere" contradicts the table | Blocking |
| 9 | DisclaimerModal "no identifiable patient data" imprecision | Advisory |

## Delegate to

- **content-writer** — Privacy Policy language for Findings 1, 2, 3, 5, 6 (disclosure portion), 7, 8, 9.
- **ui-architect** — only if V approves Option (c): implement opt-in timestamp toggle in Save Case modal.

## Required follow-ups

1. V must decide timestamp storage option (a/b/c) — disclosure language differs depending on choice.
2. V must decide whether to bump `DISCLAIMER_VERSION` (forces re-acceptance).
3. Once the note-field removal commit lands, Privacy Policy must remove the optional-note reference + note that legacy cases may still display a note.
4. Option Q description in Privacy Policy must update when that commit ships.
