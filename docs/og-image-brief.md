# NeuroWiki OG Image — Creative Brief

> For generation with Nano Banana / Gemini Image / Midjourney / DALL·E /
> Figma AI / any image-generation tool of your choice. Use the existing
> brand assets, not from scratch.

## Goal

Replace `public/og-image.png` with a polished 1200×630 marketing card that
renders well as a link preview in iMessage, WhatsApp, Slack, Twitter,
LinkedIn, and Gmail.

## What's broken about the current image

- "Digital Neurology Companion" tagline appears nowhere on the actual site
- Cobalt brand color renders as muddy dark navy (#060E40-ish instead of
  the canonical #1746A2)
- Busy synaptic-network background art reads as generic-AI-stock cliché
- Symmetric centered layout doesn't match the asymmetric anatomy modern
  tech OGs use

## Brand assets to use (these already exist in `public/`)

| File | Size | What it is | Use as |
|---|---|---|---|
| `logo-lockup.png` | 1600×400 | The horizontal NeuroWiki wordmark with the cobalt N badge to the left of "NeuroWiki" text | **Primary hero** — scale to ~720px wide, position upper-left of the card |
| `icon-1024.png` | 1024×1024 | The square brand icon (cobalt N on white) | Optional — small badge in lower-right corner if the composition needs balance |

**Do not** generate new typography. The wordmark is in the logo-lockup
asset already; reuse it.

## Required layout

```
┌──────────────────────────────────────────────────────────────┐
│  [logo-lockup.png, ~720×180]                                 │  ← top-left
│                                                              │
│  CLINICAL REFERENCE  ← tiny eyebrow                          │
│                                                              │
│  Calculators, pathways, and trial reference                  │  ← tagline
│  for bedside neurology.                                      │     2 lines
│                                                              │
│                                              [optional       │
│                                               icon-1024 at   │
│                                               ~140px,        │
│                                               low-contrast]  │
│  neurowiki.ai                                                │  ← bottom-left
└──────────────────────────────────────────────────────────────┘
       1200 × 630
```

Asymmetric. Text-content left and bottom-left. Brand badge or visual
accent (subtle) bottom-right. Generous whitespace.

## Exact copy to render

- **Eyebrow** (small, all caps, tracking-widest, slate-500):
  `CLINICAL REFERENCE`
- **Tagline** (2 lines, regular weight, slate-600, ~32pt):
  `Calculators, pathways, and trial reference`
  `for bedside neurology.`
- **URL** (small, slate-500, ~22pt):
  `neurowiki.ai`

No other copy. Especially **do not** add "Digital Neurology Companion" or
any tagline that doesn't appear on the site.

## Brand specifications

| Token | Hex | Where it appears |
|---|---|---|
| `neuro-500` (cobalt) | `#1746A2` | Logo, top brand bar, eyebrow dot, URL accent |
| `neuro-50` (cobalt soft) | `#EEF2FF` | Subtle disc behind icon-1024 if used as accent |
| `slate-900` | `#0F172A` | "Wiki" lockup text (already baked into logo-lockup.png) |
| `slate-600` | `#475569` | Tagline body |
| `slate-500` | `#64748B` | Eyebrow + URL |
| `white` | `#FFFFFF` | Background |

**Background must be white** (or near-white with very subtle texture).
Modern tech OGs (Linear, Vercel, Notion, Stripe, Figma) are dominantly
white or near-white because (a) light-mode chat bubbles in iMessage /
WhatsApp need contrast, (b) cobalt brand pops against white more than
against dark, (c) clinical / medical context reads as "trustworthy
medical tool" on white, "consumer entertainment" on dark.

## Reference style — what we want it to look like

Search Dribbble / similar for:
- "SaaS OG image" — Linear, Vercel, Notion, Stripe
- "clinical software marketing card"
- "medical app social share card"

Specifically: clean type-forward layouts, one brand accent, generous
whitespace, no stock-art clutter.

## Reference style — what we DON'T want

- Synaptic-network graphics on the sides (the old image had this — reads
  as "generic neuro startup")
- Brain illustrations
- Stethoscope / pill / clinical-stock icons
- Multiple gradients
- Photo of a doctor

## Prompt template for Nano Banana / Gemini Image / DALL·E / Midjourney

Use this verbatim as a starting point:

```
A polished 1200x630 marketing card for a clinical-reference web app
called NeuroWiki. White background. The NeuroWiki horizontal wordmark
(provided as logo-lockup.png — a cobalt-blue "N" badge with "NeuroWiki"
text) sits in the upper-left, scaled to about 720px wide. Below the
wordmark, a small all-caps eyebrow in light gray reads "CLINICAL
REFERENCE" with letter-spacing. Beneath that, in medium-weight slate
gray, a two-line tagline reads "Calculators, pathways, and trial
reference / for bedside neurology." In the bottom-left, a small cobalt
dot followed by the URL "neurowiki.ai" in light gray. A thin 6-pixel
cobalt (#1746A2) bar runs along the top edge of the card. Layout is
asymmetric — text-content occupies the left two-thirds, the right third
is generous whitespace with perhaps a very subtle, low-contrast cobalt
geometric accent (a single curve or a soft disc). No synaptic-network
imagery, no brain illustration, no stock-clinical icons. Style reference:
Linear, Vercel, Stripe, Notion marketing cards — type-forward, brand-
color-restrained, generous whitespace, trustworthy and modern.
```

For tools that accept an uploaded reference image, upload
`public/logo-lockup.png` and tell the tool: "Place this logo in the
upper-left of a 1200×630 white card with the text and layout described
in the prompt above."

## After you have the PNG

1. Save the result as `public/og-image.png` (overwriting the current file).
2. Bump the og:image URL in two places to bust caches:
   - `index.html` lines 19 and 27 — change `og-image.png` to `og-image.png?v=3`
   - `src/components/Seo.tsx` line 15 — same change
3. Commit + push.
4. To force a re-scrape on platforms that pin OG images:
   - **Facebook / WhatsApp**: https://developers.facebook.com/tools/debug/ → enter neurowiki.ai → Scrape Again
   - **Twitter / X**: https://cards-dev.twitter.com/validator → enter URL
   - **LinkedIn**: https://www.linkedin.com/post-inspector/ → enter URL
   - **iMessage**: no manual re-scrape; the `?v=3` cache-buster is what
     forces a fresh fetch when the URL changes
   - **Slack**: paste the link in a channel; Slack re-fetches on each
     new paste if the URL is different

## If you want code to do the composition instead of AI generation

Tell me and I'll write a small Node script using `sharp` that composes
the existing `logo-lockup.png` + the text overlay + the brand bar into
a deterministic 1200×630 PNG at build time. Adds `sharp` as a dev
dependency (~30MB but only at build time) and a one-line `npm run`
script. The output is pixel-perfect identical on every build and uses
the actual logo asset, but it doesn't have the polish of an AI-
generated marketing card. Your call.
