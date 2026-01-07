
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { GUIDE_CONTENT } from '../data/guideContent';
import { ArrowLeft, BookOpen, Search } from 'lucide-react';

const Wiki: React.FC = () => {
  const { topic } = useParams<{ topic: string }>();
  const query = topic?.toLowerCase() || '';

  const results = Object.values(GUIDE_CONTENT).filter(item =>
    item.title.toLowerCase().includes(query) ||
    item.content.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query)
  );

  // Helper to generate a clean, text-only summary of the clinical content
  const getCleanSummary = (content: string) => {
    return content
      .replace(/##\s+/g, '') // Remove headers
      .replace(/\*/g, '')    // Remove bold/italics
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Clean links
      .replace(/\n+/g, ' ')  // Flatten to one line
      .trim()
      .substring(0, 160) + '...';
  };

  return (
    <div className="max-w-4xl mx-auto animate-crisp-in">
      <div className="mb-10">
        <Link to="/" className="inline-flex items-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-neuro-600 transition-all group mb-6">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter">
          Search Results for <span className="text-neuro-600">"{topic}"</span>
        </h1>
        <p className="text-slate-500 mt-3 font-medium">Found {results.length} matching articles in the catalogue.</p>
      </div>

      {results.length > 0 ? (
        <div className="grid gap-6">
          {results.map((result) => (
            <Link 
              key={result.id} 
              to={`/guide/${result.id}`} 
              className="block bg-white p-8 rounded-3xl border border-slate-100 shadow-apple apple-transition hover:shadow-apple-hover hover:-translate-y-1 active:scale-[0.99] group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-8">
                  <span className="text-[10px] font-black text-neuro-600 uppercase tracking-[0.2em] bg-neuro-50 px-3 py-1.5 rounded-xl border border-neuro-100/50">
                    {result.category}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-4 tracking-tight group-hover:text-neuro-700 transition-colors">
                    {result.title}
                  </h2>
                  <p className="text-slate-500 mt-3 text-base leading-relaxed font-medium line-clamp-2 italic">
                    {getCleanSummary(result.content)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:text-neuro-500 group-hover:bg-neuro-50 transition-all shadow-inner">
                  <BookOpen size={24} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-4xl border border-dashed border-slate-200 shadow-inner">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Search size={40} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">No articles found</h3>
          <p className="text-slate-500 mt-2 font-medium">Try adjusting your search terms or browse the Resident Guide.</p>
          <Link to="/guide" className="inline-block mt-8 px-8 py-3.5 bg-neuro-600 text-white rounded-2xl font-bold text-sm tracking-tight shadow-lg shadow-neuro-200 hover:bg-neuro-700 active:scale-95 transition-all">
            Browse Resident Guide
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wiki;
