import React, { useEffect } from 'react';
import { ArticleLayout, Term } from '../article';
import { useRecents } from '../../hooks/useRecents';
import { MEDICAL_GLOSSARY } from '../../data/medicalGlossary';
import type {
  ImagingModule,
  SearchStep,
  AnatomyTarget,
  ClinicalNote,
  WindowCard,
} from '../../data/imaging/types';
import { Figure } from './Figure';

/** Wrap a structure name in a glossary tooltip when a definition exists. */
function AnatomyItem({ a }: { a: AnatomyTarget }) {
  const def = a.glossaryRef ? MEDICAL_GLOSSARY[a.glossaryRef] : undefined;
  return (
    <li className="text-[15px] text-slate-700 leading-relaxed">
      <span className="font-medium text-slate-800">
        {def ? <Term detail={def}>{a.structure}</Term> : a.structure}
      </span>
      {a.note ? <span className="text-slate-500">: {a.note}</span> : null}
    </li>
  );
}

function LetterBadge({ letter }: { letter?: string }) {
  if (!letter) return null;
  // Decorative: the mnemonic letter is a visual reinforcement of the adjacent
  // heading/label text (and the full phrase is spelled out in the mnemonic
  // panel), so it is hidden from assistive tech to avoid a redundant
  // single-letter announcement.
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center w-7 h-7 shrink-0 rounded-lg bg-neuro-50 text-neuro-700 text-sm font-bold"
    >
      {letter}
    </span>
  );
}

/** Bedside (Quick) mode: the terse ordered checklist you hold next to the scan. */
function BedsideView({ module }: { module: ImagingModule }) {
  return (
    <div>
      {module.mnemonic && (
        <div
          className="mb-6 rounded-xl bg-neuro-50/60 border border-neuro-100 px-4 py-3"
          role="group"
          aria-labelledby="bedside-mnemonic-label"
        >
          <p
            id="bedside-mnemonic-label"
            className="text-[11px] font-bold uppercase tracking-widest text-neuro-700 mb-1"
          >
            Search pattern
          </p>
          <p className="text-slate-800 font-medium">{module.mnemonic.phrase}</p>
          <p className="text-sm text-slate-500 mt-0.5">
            {module.mnemonic.expansion.join(' · ')}
          </p>
        </div>
      )}

      <ol className="space-y-2.5">
        {module.steps.map((step) => (
          <li key={step.id} className="flex items-start gap-3">
            <LetterBadge letter={step.mnemonicLetter} />
            <div className="pt-0.5">
              <span className="font-semibold text-slate-900">{step.bedsideLabel}</span>
              {step.bedsidePrompt && (
                <span className="text-slate-600"> · {step.bedsidePrompt}</span>
              )}
            </div>
          </li>
        ))}
      </ol>

      {module.crossCutting.some((c) => c.kind === 'window') && (
        <div
          className="mt-6 rounded-xl border border-slate-200 px-4 py-3"
          role="group"
          aria-labelledby="bedside-windows-label"
        >
          <p
            id="bedside-windows-label"
            className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2"
          >
            Windows to check
          </p>
          <ul className="text-sm text-slate-700 space-y-1">
            {module.crossCutting
              .filter((c): c is WindowCard => c.kind === 'window')
              .map((w) => (
                <li key={w.id}>
                  <span className="font-medium text-slate-800">{w.name}</span>
                  {w.widthLevel && <span className="text-slate-500"> ({w.widthLevel})</span>}
                </li>
              ))}
          </ul>
        </div>
      )}

      <p className="mt-8 text-sm text-slate-500">
        Switch to <span className="font-medium text-slate-700">Detailed</span> for the full
        teaching read: anatomy, terminology, and what normal and abnormal look like.
      </p>
    </div>
  );
}

function NoteList({ notes, tone }: { notes: ClinicalNote[]; tone: 'abnormal' | 'pitfall' }) {
  const dot = tone === 'abnormal' ? 'bg-rose-400' : 'bg-amber-400';
  return (
    <ul className="space-y-1.5">
      {notes.map((n, i) => (
        <li key={i} className="flex items-start gap-2 text-[15px] text-slate-700 leading-relaxed">
          <span aria-hidden="true" className={`mt-2 w-1.5 h-1.5 shrink-0 rounded-full ${dot}`} />
          <span>{n.text}</span>
        </li>
      ))}
    </ul>
  );
}

function StepBlock({ step }: { step: SearchStep }) {
  const headingId = `${step.id}-heading`;
  return (
    <section className="py-7 border-b border-slate-100 last:border-0" aria-labelledby={headingId}>
      <div className="flex items-center gap-3 mb-3">
        <LetterBadge letter={step.mnemonicLetter} />
        <h2 id={headingId} className="text-lg font-semibold text-slate-900">
          {step.bedsideLabel}
        </h2>
      </div>
      {step.bedsidePrompt && (
        <p className="text-slate-500 mb-4">{step.bedsidePrompt}</p>
      )}

      {step.anatomy.length > 0 && (
        <div className="mb-4" role="group" aria-labelledby={`${step.id}-anatomy-label`}>
          <p
            id={`${step.id}-anatomy-label`}
            className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2"
          >
            Look at
          </p>
          <ul className="space-y-1.5">
            {step.anatomy.map((a, i) => (
              <AnatomyItem key={i} a={a} />
            ))}
          </ul>
        </div>
      )}

      {step.learn.terminology.length > 0 && (
        <div className="mb-4" role="group" aria-labelledby={`${step.id}-terms-label`}>
          <p
            id={`${step.id}-terms-label`}
            className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2"
          >
            Terms
          </p>
          <dl className="space-y-1.5">
            {step.learn.terminology.map((t, i) => (
              <div key={i} className="text-[15px] leading-relaxed">
                <dt className="inline font-medium text-slate-800">{t.term}: </dt>
                <dd className="inline text-slate-600">{t.def}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div
        className="rounded-lg bg-emerald-50/70 border border-emerald-100 px-3.5 py-2.5 mb-4"
        role="group"
        aria-labelledby={`${step.id}-normal-label`}
      >
        <p
          id={`${step.id}-normal-label`}
          className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-1"
        >
          Normal
        </p>
        <p className="text-[15px] text-slate-700 leading-relaxed">{step.learn.normal.text}</p>
      </div>

      {step.learn.abnormal.length > 0 && (
        <div className="mb-4" role="group" aria-labelledby={`${step.id}-abnormal-label`}>
          <p
            id={`${step.id}-abnormal-label`}
            className="text-[11px] font-bold uppercase tracking-widest text-rose-600 mb-2"
          >
            Abnormal
          </p>
          <NoteList notes={step.learn.abnormal} tone="abnormal" />
        </div>
      )}

      {step.learn.pitfalls.length > 0 && (
        <div className="mb-4" role="group" aria-labelledby={`${step.id}-pitfalls-label`}>
          <p
            id={`${step.id}-pitfalls-label`}
            className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-2"
          >
            Pitfalls
          </p>
          <NoteList notes={step.learn.pitfalls} tone="pitfall" />
        </div>
      )}

      {step.images.map((img) => (
        <Figure key={img.id} image={img} />
      ))}
    </section>
  );
}

function WindowCardBlock({ card }: { card: WindowCard }) {
  const headingId = `${card.id}-heading`;
  return (
    <section className="py-5 border-b border-slate-100 last:border-0" aria-labelledby={headingId}>
      <div className="flex items-baseline gap-2 mb-1.5">
        <h3 id={headingId} className="text-base font-semibold text-slate-900">
          {card.name}
        </h3>
        {card.widthLevel && (
          <span className="text-sm text-slate-500 font-mono">{card.widthLevel}</span>
        )}
      </div>
      <p className="text-[15px] text-slate-700 leading-relaxed">{card.purpose.text}</p>
      {card.images?.map((img) => (
        <Figure key={img.id} image={img} />
      ))}
    </section>
  );
}

/** Detailed (Learn) mode: the full teaching read. */
function LearnView({ module }: { module: ImagingModule }) {
  const windows = module.crossCutting.filter((c): c is WindowCard => c.kind === 'window');
  return (
    <div>
      {module.steps.map((step) => (
        <StepBlock key={step.id} step={step} />
      ))}

      {windows.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Windows</h2>
          <p className="text-slate-500 mb-3">
            The same scan read at different window settings. Each setting makes a different
            tissue easier to see.
          </p>
          <div className="rounded-xl border border-slate-200 px-4">
            {windows.map((w) => (
              <WindowCardBlock key={w.id} card={w} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Reusable renderer for an imaging-read module. CT head is the first consumer;
 * CTA/MRI/spine pass their own ImagingModule to the same component.
 * Bedside/Learn map onto ArticleLayout's quick/detailed toggle.
 */
export function ImagingReadPage({ module }: { module: ImagingModule }) {
  const { recordView } = useRecents();
  useEffect(() => {
    recordView({
      id: `imaging-${module.id}`,
      type: 'guide',
      title: module.modality,
      subtitle: 'Read the Scan',
      category: 'imaging',
      trail: 'Imaging',
    });
  }, [recordView, module.id, module.modality]);

  return (
    <ArticleLayout
      category="Read the Scan"
      categoryPath="/guide/read-the-scan"
      title={module.modality}
      subtitle={module.summary}
      leadText={
        module.mnemonic ? (
          <>
            Run the same search pattern every time: <strong>{module.mnemonic.phrase}</strong>.
            Use <strong>Quick</strong> as a bedside checklist; switch to{' '}
            <strong>Detailed</strong> to learn each step.
          </>
        ) : undefined
      }
      relatedLinks={[
        { title: 'Read the Scan', href: '/guide/read-the-scan' },
        { title: 'ASPECTS Score', href: '/calculators/aspects-score' },
      ]}
    >
      {(viewMode) => (
        <>
          {/* Screen-reader-only announcement: ArticleLayout's Quick/Detailed
              toggle swaps this content without its own accessible-state
              feedback, so announce the switch here. */}
          <p className="sr-only" role="status" aria-live="polite">
            {viewMode === 'quick'
              ? 'Showing the quick bedside checklist.'
              : 'Showing the detailed teaching view.'}
          </p>
          {viewMode === 'quick' ? <BedsideView module={module} /> : <LearnView module={module} />}
        </>
      )}
    </ArticleLayout>
  );
}
