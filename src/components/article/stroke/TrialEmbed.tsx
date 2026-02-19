import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import { GUIDE_CONTENT } from '../../../data/guideContent';
import ReactMarkdown from 'react-markdown';

interface TrialEmbedProps {
  trialSlug: string;
}

export const TrialEmbed: React.FC<TrialEmbedProps> = ({ trialSlug }) => {
  // Extract trial ID from slug (e.g., "/trials/ninds-trial" → "ninds-trial")
  const trialId = trialSlug.replace('/trials/', '');

  // Get trial content from GUIDE_CONTENT
  const trial = GUIDE_CONTENT[trialId];

  if (!trial) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
        <h4 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
          Trial Not Found
        </h4>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Could not find trial with ID: {trialId}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Link to Full Trial Page */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to={trialSlug}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 group relative overflow-hidden p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg transition-all"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold mb-1">View Full Trial Page</div>
              <div className="text-xs opacity-90">Complete protocol, detailed analysis & references</div>
            </div>
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </Link>
      </div>

      {/* Quick Preview Badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-blue-600 dark:text-blue-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300">
          <span className="font-semibold">Quick Preview:</span> Summary embedded below. For full details including study design, endpoints, and statistical analysis, view the complete trial page.
        </p>
      </div>

      {/* Trial Content Preview - Rendered from GUIDE_CONTENT */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4" {...props} />,
            h2: ({node, ...props}) => <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3" {...props} />,
            h3: ({node, ...props}) => <h4 className="text-lg font-semibold text-slate-900 dark:text-white mt-4 mb-2" {...props} />,
            p: ({node, ...props}) => <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-4 text-sm text-slate-700 dark:text-slate-300" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 mb-4 text-sm text-slate-700 dark:text-slate-300" {...props} />,
            strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
            em: ({node, ...props}) => <em className="italic" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-slate-600 dark:text-slate-400" {...props} />,
            code: ({node, inline, ...props}: any) =>
              inline ? (
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono" {...props} />
              ) : (
                <code className="block p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono overflow-x-auto" {...props} />
              ),
          }}
        >
          {trial.content}
        </ReactMarkdown>
      </div>

      {/* Footer CTA to Full Page */}
      <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800">
        <Link
          to={trialSlug}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 rounded-xl transition-all text-sm font-semibold text-slate-700 dark:text-slate-300"
        >
          <span>View Complete Trial Details</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
