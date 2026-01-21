
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

// Category styling
const categoryStyles: Record<
  string,
  { dot: string; text: string; border: string; pillBg: string; pillText: string; pillActive: string }
> = {
  vascular: {
    dot: 'bg-blue-500',
    text: 'text-blue-700',
    border: 'border-l-blue-500',
    pillBg: 'bg-blue-50 border-blue-200',
    pillText: 'text-blue-700',
    pillActive: 'bg-blue-600 text-white border-blue-600',
  },
  epilepsy: {
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    border: 'border-l-amber-500',
    pillBg: 'bg-amber-50 border-amber-200',
    pillText: 'text-amber-700',
    pillActive: 'bg-amber-600 text-white border-amber-600',
  },
  headache: {
    dot: 'bg-violet-500',
    text: 'text-violet-700',
    border: 'border-l-violet-500',
    pillBg: 'bg-violet-50 border-violet-200',
    pillText: 'text-violet-700',
    pillActive: 'bg-violet-600 text-white border-violet-600',
  },
  neuromuscular: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    border: 'border-l-emerald-500',
    pillBg: 'bg-emerald-50 border-emerald-200',
    pillText: 'text-emerald-700',
    pillActive: 'bg-emerald-600 text-white border-emerald-600',
  },
  general: {
    dot: 'bg-slate-400',
    text: 'text-slate-600',
    border: 'border-l-slate-400',
    pillBg: 'bg-slate-100 border-slate-200',
    pillText: 'text-slate-600',
    pillActive: 'bg-slate-600 text-white border-slate-600',
  },
};

const categoryNames: Record<string, string> = {
  vascular: 'Vascular',
  epilepsy: 'Epilepsy',
  headache: 'Headache',
  neuromuscular: 'Neuromuscular',
  general: 'General',
};

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'calculator' | 'pathway';
  path: string;
}

const tools: Tool[] = [
  { id: 'nihss', name: 'NIHSS', description: 'NIH Stroke Scale assessment', category: 'vascular', type: 'calculator', path: '/calculators/nihss' },
  { id: 'evt-pathway', name: 'Thrombectomy Pathway', description: 'EVT eligibility for early and late windows', category: 'vascular', type: 'pathway', path: '/calculators/evt-pathway' },
  { id: 'elan-pathway', name: 'ELAN Protocol', description: 'DOAC timing after ischemic stroke with AF', category: 'vascular', type: 'pathway', path: '/calculators/elan-pathway' },
  { id: 'abcd2', name: 'ABCD² Score', description: 'TIA stroke risk within 2 days', category: 'vascular', type: 'calculator', path: '/calculators?id=abcd2' },
  { id: 'ich', name: 'ICH Score', description: 'Intracerebral hemorrhage prognosis', category: 'vascular', type: 'calculator', path: '/calculators?id=ich' },
  { id: 'has-bled', name: 'HAS-BLED', description: 'Major bleeding risk on anticoagulation', category: 'vascular', type: 'calculator', path: '/calculators?id=has-bled' },
  { id: 'rope', name: 'RoPE Score', description: 'PFO-attributable fraction in cryptogenic stroke', category: 'vascular', type: 'calculator', path: '/calculators?id=rope' },
  { id: 'se-pathway', name: 'Status Epilepticus', description: 'Stage 1–3 SE management pathway', category: 'epilepsy', type: 'pathway', path: '/calculators/se-pathway' },
  { id: 'migraine-pathway', name: 'Migraine & Headache', description: 'ED and inpatient management', category: 'headache', type: 'pathway', path: '/calculators/migraine-pathway' },
  { id: 'gca-pathway', name: 'GCA / PMR Pathway', description: 'Suspected giant cell arteritis workup', category: 'headache', type: 'pathway', path: '/calculators/gca-pathway' },
  { id: 'gcs', name: 'Glasgow Coma Scale', description: 'Consciousness level assessment', category: 'general', type: 'calculator', path: '/calculators?id=gcs' },
];

const groupByCategory = (toolsList: Tool[]) => {
  const groups: Record<string, Tool[]> = {};
  const order = ['vascular', 'epilepsy', 'headache', 'neuromuscular', 'general'];
  order.forEach((cat) => {
    groups[cat] = [];
  });
  toolsList.forEach((tool) => {
    if (groups[tool.category]) groups[tool.category].push(tool);
  });
  Object.keys(groups).forEach((key) => {
    if (groups[key].length === 0) delete groups[key];
  });
  return groups;
};

const CATEGORY_IDS = ['vascular', 'epilepsy', 'headache', 'neuromuscular', 'general'];

export default function Calculators() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [typeFilter, setTypeFilter] = useState<'all' | 'calculator' | 'pathway'>('all');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('neurowiki-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Redirect legacy /calculators?id=nihss to /calculators/nihss
  useEffect(() => {
    if (searchParams.get('id') === 'nihss') {
      navigate('/calculators/nihss', { replace: true });
    }
  }, [searchParams, navigate]);

  // When returning with ?open=, set category filter so that section is focused
  useEffect(() => {
    const o = searchParams.get('open');
    if (o && CATEGORY_IDS.includes(o)) setActiveCategory(o);
  }, [searchParams]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      try {
        localStorage.setItem('neurowiki-favorites', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Filter tools
  let filteredTools = tools;
  if (typeFilter !== 'all') filteredTools = filteredTools.filter((t) => t.type === typeFilter);
  if (showFavoritesOnly) filteredTools = filteredTools.filter((t) => favorites.includes(t.id));
  if (activeCategory) filteredTools = filteredTools.filter((t) => t.category === activeCategory);

  const groupedTools = groupByCategory(filteredTools);

  const filterByCategory = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
    }
  };

  const calcCount = tools.filter((t) => t.type === 'calculator').length;
  const pathwayCount = tools.filter((t) => t.type === 'pathway').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Compact Header with Integrated Filters */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-5 md:px-8">
          {/* Title Row */}
          <div className="flex items-center justify-between py-3">
            <h1 className="text-lg font-bold text-slate-900">Clinical Tools</h1>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFavoritesOnly ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <svg className="w-4 h-4" fill={showFavoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="hidden sm:inline">Favorites</span>
            </button>
          </div>

          {/* Type Filter - Segmented Control */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-3">
            <button
              onClick={() => setTypeFilter('all')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${typeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({tools.length})
            </button>
            <button
              onClick={() => setTypeFilter('calculator')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${typeFilter === 'calculator' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Calculators ({calcCount})
            </button>
            <button
              onClick={() => setTypeFilter('pathway')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${typeFilter === 'pathway' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Pathways ({pathwayCount})
            </button>
          </div>

          {/* Category Pills - Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
            {CATEGORY_IDS.map((category) => {
              const count = tools.filter((t) => t.category === category && (typeFilter === 'all' || t.type === typeFilter)).length;
              if (count === 0) return null;
              return (
                <button
                  key={category}
                  onClick={() => filterByCategory(category)}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    activeCategory === category ? categoryStyles[category].pillActive : `${categoryStyles[category].pillBg} ${categoryStyles[category].pillText} hover:opacity-80`
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${activeCategory === category ? 'bg-white' : categoryStyles[category].dot}`} />
                  <span>{categoryNames[category]}</span>
                  <span className={`text-xs ${activeCategory === category ? 'text-white/70' : 'opacity-60'}`}>{count}</span>
                </button>
              );
            })}
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-5 md:px-8 py-6">
        {showFavoritesOnly && (
          <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-sm text-amber-800 font-medium">Showing favorites only</span>
            </div>
            <button onClick={() => setShowFavoritesOnly(false)} className="text-sm text-amber-600 hover:text-amber-800 font-medium">
              Show all
            </button>
          </div>
        )}

        {Object.entries(groupedTools).map(([category, categoryTools]) => (
          <div key={category} className="mb-8">
            {!activeCategory && (
              <div className="flex items-center gap-2 mb-3 pl-1">
                <span className={`w-2.5 h-2.5 rounded-full ${categoryStyles[category].dot}`} />
                <h2 className={`text-sm font-semibold tracking-wide ${categoryStyles[category].text}`}>{categoryNames[category]}</h2>
                <span className="text-xs text-slate-400">{categoryTools.length}</span>
              </div>
            )}
            <div className="space-y-2">
              {categoryTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={`${tool.path}${tool.path.includes('?') ? '&' : '?'}from=calculators&category=${encodeURIComponent(tool.category)}`}
                  className={`group flex items-center justify-between p-4 bg-white rounded-xl border-l-4 ${categoryStyles[category].border} border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{tool.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          tool.type === 'pathway' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {tool.type === 'pathway' ? 'Pathway' : 'Calc'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{tool.description}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <button
                      onClick={(e) => toggleFavorite(tool.id, e)}
                      className={`p-2 rounded-lg transition-colors ${favorites.includes(tool.id) ? 'text-amber-500' : 'text-slate-300 hover:text-slate-400'}`}
                      aria-label={favorites.includes(tool.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <svg className="w-5 h-5" fill={favorites.includes(tool.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedTools).length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium mb-1">No tools found</p>
            <p className="text-sm text-slate-400">{showFavoritesOnly ? 'No favorites match your filters' : 'Try a different filter'}</p>
            <button
              onClick={() => {
                setTypeFilter('all');
                setShowFavoritesOnly(false);
                setActiveCategory(null);
              }}
              className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      <div className="h-24 md:h-0" />
    </div>
  );
}
