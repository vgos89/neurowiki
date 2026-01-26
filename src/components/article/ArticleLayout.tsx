import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigationSource } from '../../hooks/useNavigationSource';

interface ArticleLayoutProps {
  category: string;
  categoryPath: string;
  title: string;
  subtitle: string;
  leadText?: React.ReactNode;
  children: (viewMode: 'quick' | 'detailed') => React.ReactNode;
  relatedLinks?: Array<{ title: string; href: string }>;
}

export const ArticleLayout: React.FC<ArticleLayoutProps> = ({
  category,
  categoryPath,
  title,
  subtitle,
  leadText,
  children,
  relatedLinks = [],
}) => {
  const [viewMode, setViewMode] = useState<'quick' | 'detailed'>('quick');
  const { getBackPath, getBackLabel, source } = useNavigationSource();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link
                to={getBackPath()}
                className="flex items-center gap-2 p-1.5 -ml-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">
                  {source.category || getBackLabel()}
                </span>
              </Link>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 text-sm">
              <button
                onClick={() => setViewMode('quick')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'quick'
                    ? 'text-slate-900 dark:text-white font-medium'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Quick
              </button>
              <span className="text-slate-200 dark:text-slate-700">|</span>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'detailed'
                    ? 'text-slate-900 dark:text-white font-medium'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Detailed
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-2xl mx-auto px-5 md:px-8 py-8 md:py-12">
        {/* Title */}
        <header className="mb-8">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">{category}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
            {title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">{subtitle}</p>
        </header>

        {/* Lead Text */}
        {leadText && (
          <div className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-8 pb-8 border-b border-slate-100 dark:border-slate-700">
            {leadText}
          </div>
        )}

        {/* Content */}
        <div className="article-content">
          {children(viewMode)}
        </div>

        {/* Related Links */}
        {relatedLinks.length > 0 && (
          <footer className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">Related</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {relatedLinks.map((link, idx) => (
                <Link 
                  key={idx} 
                  to={link.href} 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </footer>
        )}

        {/* Footer hint */}
        <p className="mt-12 text-xs text-slate-400 dark:text-slate-500 text-center">
          Tap <span className="border-b border-dotted border-slate-400 dark:border-slate-600">underlined terms</span> for details
          {viewMode === 'quick' && <> · Tap [+] to expand</>}
        </p>
      </article>

      {/* Mobile bottom spacing */}
      <div className="h-20 md:h-0" />
    </div>
  );
};
