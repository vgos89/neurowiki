/**
 * Imaging "Read the Scan" — shared cross-modality data model.
 *
 * v1 instance: src/data/imaging/ctHead.ts (non-contrast CT head).
 * CTA head/neck, MRI brain, and MRI spine reuse this exact skeleton.
 *
 * Design decisions and rationale: docs/adrs/2026-07-09-imaging-read-the-scan.md
 * Structural review (C1-C4 applied here): docs/reviews/arch-imaging-read-ct-head.md
 *
 * Governance:
 *  - Clinical statements are leaf ClinicalNote objects carrying a claimId.
 *    scripts/check-claims.ts (Phase-1 `data` surface) matches the claimId
 *    field and cross-checks it against CLAIM_REGISTRY. Do NOT write a quoted
 *    claimId literal inside a comment in an imaging data file: the claim
 *    scanner does not strip comments and would treat it as an unregistered tag.
 *  - Image caption and attribution strings are humanizer-scanned. Keep them
 *    free of the em-dash character (normalize punctuation on third-party
 *    bylines) per CLAUDE.md §10.3.
 */

/** Where a teaching figure comes from. `original` = authored by NeuroWiki. */
export type ImageSource = 'original' | 'wikimedia' | 'nih' | 'other';

/** License a teaching figure ships under. `original` = NeuroWiki line-art. */
export type ImageLicenseType =
  | 'original'
  | 'CC0'
  | 'public-domain'
  | 'CC-BY-4.0'
  | 'CC-BY-SA-4.0'
  | 'CC-BY-SA-3.0';

/** License + attribution metadata rendered as a per-image credit line. */
export interface ImageLicense {
  source: ImageSource;
  license: ImageLicenseType;
  /** Creator name. Required for third-party images; omit for `original`. */
  author?: string;
  /** Link to the source file page (Wikimedia Commons / NIH). */
  sourceUrl?: string;
  /** Rendered credit line. Punctuation-normalized, no em-dash character. */
  attribution: string;
  /** Note if the image was cropped or annotated (share-alike bookkeeping). */
  modifications?: string;
}

/** schematic = NeuroWiki line-art; photo = a real CT example. */
export type FigureKind = 'schematic' | 'photo';

/** `pending` figures render as a labelled placeholder until the asset lands. */
export type FigureStatus = 'ready' | 'pending';

export interface TeachingImage {
  id: string;
  kind: FigureKind;
  /** Served asset path, e.g. /imaging/schematics/hematoma-shapes.svg */
  src: string;
  alt: string;
  caption: string;
  license: ImageLicense;
  status?: FigureStatus;
}

/** One anatomical structure to inspect at a step (first-class teaching layer). */
export interface AnatomyTarget {
  structure: string;
  /** Key into MEDICAL_GLOSSARY for a hover/tap definition. */
  glossaryRef?: string;
  /** Short teaching note specific to inspecting this structure. */
  note?: string;
}

/**
 * A clinical statement bound to its registry claim.
 * `claimId` is required for any statement a clinician could act on; it may be
 * omitted only for a non-clinical framing aside.
 */
export interface ClinicalNote {
  text: string;
  claimId?: string;
}

/** A term defined inline at a step. If shared site-wide, reference the glossary. */
export interface TermDef {
  term: string;
  def: string;
  /** If the term also lives in MEDICAL_GLOSSARY, reference it rather than copy. */
  glossaryRef?: string;
}

export interface StepLearn {
  terminology: TermDef[];
  normal: ClinicalNote;
  abnormal: ClinicalNote[];
  pitfalls: ClinicalNote[];
}

/** One step of the search choreography. */
export interface SearchStep {
  id: string;
  order: number;
  /** Optional: not every modality has a per-step letter mnemonic. */
  mnemonicLetter?: string;
  /** Terse line shown in Bedside mode. */
  bedsideLabel: string;
  /** Optional one-liner: what to actually check at this step. */
  bedsidePrompt?: string;
  anatomy: AnatomyTarget[];
  learn: StepLearn;
  images: TeachingImage[];
  /** Ids into module.crossCutting (windows for CT, sequences for MRI, ...). */
  crossCuttingRefs?: string[];
}

/**
 * Cross-cutting teaching cards. Discriminated union keyed by `kind` so the
 * module stays closed for modification as modalities are added (C1).
 */
export interface WindowCard {
  kind: 'window';
  id: string;
  /** e.g. "Stroke window". */
  name: string;
  /** e.g. "WW 40 / WL 40". */
  widthLevel?: string;
  purpose: ClinicalNote;
  images?: TeachingImage[];
}

export interface SequenceCard {
  kind: 'sequence';
  id: string;
  /** e.g. "DWI". */
  name: string;
  purpose: ClinicalNote;
  images?: TeachingImage[];
}

export type CrossCuttingCard = WindowCard | SequenceCard;

export type ModalityId = 'ct-head' | 'cta-head-neck' | 'mri-brain' | 'mri-spine';

export interface ImagingMnemonic {
  /** e.g. "Blood Can Be Very Bad". */
  phrase: string;
  /** e.g. ["Blood", "Cisterns", "Brain", "Ventricles", "Bone"]. */
  expansion: string[];
}

/** A complete imaging-read module for one modality. */
export interface ImagingModule {
  id: ModalityId;
  /** Display name, e.g. "Non-contrast CT head". */
  modality: string;
  /** URL slug under /guide/read-the-scan/, e.g. "ct-head". */
  routeSlug: string;
  /** One-line intro for the hub card and page header. */
  summary: string;
  mnemonic?: ImagingMnemonic;
  steps: SearchStep[];
  crossCutting: CrossCuttingCard[];
  /** ISO date of last clinical review (clinical-reviewer gate). */
  reviewedOn?: string;
}
