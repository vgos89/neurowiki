import { Link } from 'react-router-dom';
import { useNavigationSource } from '../../hooks/useNavigationSource';

interface ModalityCard {
  title: string;
  summary: string;
  href?: string;
  status: 'live' | 'soon';
}

const MODALITIES: ModalityCard[] = [
  {
    title: 'CT head (non-contrast)',
    summary: 'The "Blood Can Be Very Bad" search pattern: blood, cisterns, brain, ventricles, bone, plus windows.',
    href: '/guide/read-the-scan/ct-head',
    status: 'live',
  },
  {
    title: 'CT angiogram (head and neck)',
    summary: 'Vessels from the arch to the vertex: circle of Willis, occlusion, stenosis, aneurysm, dissection.',
    status: 'soon',
  },
  {
    title: 'MRI brain',
    summary: 'A sequence-first read: DWI and ADC, FLAIR, T1 with and without contrast, T2, GRE and SWI.',
    status: 'soon',
  },
  {
    title: 'MRI spine',
    summary: 'Alignment, cord signal, discs, canal and foramina, and marrow, on sagittal then axial.',
    status: 'soon',
  },
];

export default function ReadTheScanHub() {
  const { handleBack, getBackLabel, source } = useNavigationSource();

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-5 md:px-8">
          <div className="flex items-center h-14">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 p-1.5 -ml-1.5 min-h-[44px] text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer bg-transparent border-0 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">{source.category || getBackLabel()}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 md:px-8 py-8 md:py-12">
        <header className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Guide</p>
          <h1 className="text-[22px] md:text-[28px] font-medium text-slate-900 tracking-[-0.01em] mb-3">
            Read the Scan
          </h1>
          <p className="text-slate-500">
            A repeatable way to read neuro imaging. Each modality uses one fixed search pattern you
            run every time, with a bedside checklist and a learn-as-you-go teaching layer.
          </p>
        </header>

        <div className="space-y-3">
          {MODALITIES.map((m) =>
            m.status === 'live' && m.href ? (
              <Link
                key={m.title}
                to={m.href}
                className="block rounded-xl border border-slate-200 hover:border-neuro-300 hover:bg-neuro-50/40 transition-colors px-5 py-4 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-slate-900">{m.title}</h2>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-neuro-700 bg-neuro-50 rounded px-1.5 py-0.5">
                    Available
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{m.summary}</p>
              </Link>
            ) : (
              <div
                key={m.title}
                className="block rounded-xl border border-slate-100 bg-slate-50/60 px-5 py-4 opacity-80"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-slate-500">{m.title}</h2>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400 bg-white rounded px-1.5 py-0.5 border border-slate-200">
                    Coming soon
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{m.summary}</p>
              </div>
            )
          )}
        </div>
      </main>
      <div className="h-20 md:h-0" />
    </div>
  );
}
