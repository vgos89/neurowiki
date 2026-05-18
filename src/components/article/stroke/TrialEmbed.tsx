import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Info } from 'lucide-react';
import { GUIDE_CONTENT } from '../../../data/guideContent';
import ReactMarkdown from 'react-markdown';

interface TrialEmbedProps {
  trialSlug: string;
}

export const TrialEmbed: React.FC<TrialEmbedProps> = ({ trialSlug }) => {
  // Extract trial ID from slug (e.g., "/trials/ninds-trial" → "ninds-trial")
  const trialId = trialSlug.replace('/trials/', '');
  const trial = GUIDE_CONTENT[trialId];

  if (!trial) {
    return (
      <div className="p-6 bg-rose-50 rounded-lg border border-rose-200">
        <h4 className="text-base font-semibold text-rose-900 mb-2">
          Trial not found
        </h4>
        <p className="text-sm text-slate-700">
          Could not find trial with ID: {trialId}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Link to Full Trial Page — canonical neuro-500 CTA, no gradient, no shine */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to={trialSlug}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 group p-4 bg-neuro-500 hover:bg-neuro-600 text-white rounded-xl transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold mb-1">View full trial page</div>
              <div className="text-xs text-white/85">Complete protocol, detailed analysis, and references</div>
            </div>
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden />
          </div>
        </Link>
      </div>

      {/* Quick Preview info banner — canonical neuro-50 + Lucide Info icon */}
      <div className="flex items-start gap-2 px-4 py-2 bg-neuro-50 rounded-lg border border-neuro-100">
        <Info className="w-4 h-4 text-neuro-600 flex-shrink-0 mt-0.5" aria-hidden />
        <p className="text-xs text-slate-700">
          <span className="font-semibold text-slate-900">Quick preview:</span> summary embedded below. For full details including study design, endpoints, and statistical analysis, view the complete trial page.
        </p>
      </div>

      {/* Trial Content Preview - Rendered from GUIDE_CONTENT */}
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h2 className="text-[22px] md:text-[28px] font-medium tracking-[-0.01em] text-slate-900 mb-4" {...props} />,
            h2: ({node, ...props}) => <h3 className="text-base font-semibold text-slate-900 mt-6 mb-3" {...props} />,
            h3: ({node, ...props}) => <h4 className="text-sm font-semibold text-slate-900 mt-4 mb-2" {...props} />,
            p: ({node, ...props}) => <p className="text-sm text-slate-600 leading-[1.55] mb-4" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-4 text-sm text-slate-600" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 mb-4 text-sm text-slate-600" {...props} />,
            strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
            em: ({node, ...props}) => <em className="italic" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-neuro-300 pl-4 italic my-4 text-slate-600" {...props} />,
            code: ({node, inline, ...props}: any) =>
              inline ? (
                <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono" {...props} />
              ) : (
                <code className="block p-3 bg-slate-100 rounded text-xs font-mono overflow-x-auto" {...props} />
              ),
          }}
        >
          {trial.content}
        </ReactMarkdown>
      </div>

      {/* Footer CTA — canonical hairline divider */}
      <div className="pt-4 border-t border-slate-100">
        <Link
          to={trialSlug}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full min-h-[44px] px-4 py-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors text-sm font-semibold text-slate-700"
        >
          <span>View complete trial details</span>
          <ArrowUpRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
};
