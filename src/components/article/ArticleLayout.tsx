import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-1.5 -ml-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <Link to={categoryPath} className="text-sm text-slate-400 font-medium hover:text-slate-600">
                {category}
              </Link>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 text-sm">
              <button
                onClick={() => setViewMode('quick')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'quick'
                    ? 'text-slate-900 font-medium'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Quick
              </button>
              <span className="text-slate-200">|</span>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'detailed'
                    ? 'text-slate-900 font-medium'
                    : 'text-slate-400 hover:text-slate-600'
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
          <p className="text-sm text-blue-600 font-medium mb-2">{category}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
            {title}
          </h1>
          <p className="text-slate-500">{subtitle}</p>
        </header>

        {/* Lead Text */}
        {leadText && (
          <div className="text-lg text-slate-700 leading-relaxed mb-8 pb-8 border-b border-slate-100">
            {leadText}
          </div>
        )}

        {/* Content */}
        <div className="article-content">
          {children(viewMode)}
        </div>

        {/* Related Links */}
        {relatedLinks.length > 0 && (
          <footer className="mt-16 pt-8 border-t border-slate-100">
            <p className="text-sm text-slate-500 font-medium mb-4">Related</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {relatedLinks.map((link, idx) => (
                <Link 
                  key={idx} 
                  to={link.href} 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </footer>
        )}

        {/* Footer hint */}
        <p className="mt-12 text-xs text-slate-400 text-center">
          Tap <span className="border-b border-dotted border-slate-400">underlined terms</span> for details
          {viewMode === 'quick' && <> · Tap [+] to expand</>}
        </p>
      </article>

      {/* Mobile bottom spacing */}
      <div className="h-20 md:h-0" />
    </div>
  );
};
