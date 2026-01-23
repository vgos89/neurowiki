
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Search, 
  Calculator, 
  FlaskConical,
  Stethoscope,
  ArrowLeft,
  Home,
  X,
  Trash2,
  Star
} from 'lucide-react';
import { FeedbackButton } from '../src/components/FeedbackButton';
import ToolManagerModal from './ToolManagerModal';

interface LayoutProps {
  children: React.ReactNode;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'calculator' | 'pathway';
  path: string;
}

// All available tools
const ALL_TOOLS: Tool[] = [
  { id: 'nihss', name: 'NIHSS', description: 'NIH Stroke Scale assessment', category: 'vascular', type: 'calculator', path: '/calculators/nihss' },
  { id: 'evt-pathway', name: 'Thrombectomy Pathway', description: 'EVT eligibility for early and late windows', category: 'vascular', type: 'pathway', path: '/calculators/evt-pathway' },
  { id: 'elan-pathway', name: 'ELAN Protocol', description: 'DOAC timing after ischemic stroke with AF', category: 'vascular', type: 'pathway', path: '/calculators/elan-pathway' },
  { id: 'se-pathway', name: 'Status Epilepticus', description: 'Stage 1–3 SE management pathway', category: 'epilepsy', type: 'pathway', path: '/calculators/se-pathway' },
  { id: 'migraine-pathway', name: 'Migraine & Headache', description: 'ED and inpatient management', category: 'headache', type: 'pathway', path: '/calculators/migraine-pathway' },
  { id: 'gca-pathway', name: 'GCA / PMR Pathway', description: 'Suspected giant cell arteritis workup', category: 'headache', type: 'pathway', path: '/calculators/gca-pathway' },
];

// Category color mapping
const categoryColors: Record<string, string> = {
  vascular: 'bg-red-500',
  epilepsy: 'bg-amber-500',
  headache: 'bg-blue-500',
  neuromuscular: 'bg-emerald-500',
  general: 'bg-slate-400',
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  
  // Load selected tools from localStorage
  const [selectedTools, setSelectedTools] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('neurowiki-sidebar-tools');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate that all saved tools still exist
        return parsed.filter((id: string) => ALL_TOOLS.some(tool => tool.id === id));
      }
      // Default tools if nothing saved
      return ['evt-pathway', 'elan-pathway', 'nihss', 'migraine-pathway'];
    } catch {
      return ['evt-pathway', 'elan-pathway', 'nihss', 'migraine-pathway'];
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Track search in Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'search', {
          event_category: 'engagement',
          search_term: searchQuery.trim(),
        });
      }
      
      navigate(`/wiki/${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileSearchOpen(false);
    }
  };

  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // Scroll main content to top on route change (e.g. Related links, nav)
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [location.pathname, location.search]);

  // Desktop Navigation
  const desktopNavItems = [
    { label: 'Home', icon: <Home size={18} />, path: '/' },
    { label: 'Resident Guide', icon: <Stethoscope size={18} />, path: '/guide' },
    { label: 'Neuro Trials', icon: <FlaskConical size={18} />, path: '/trials' },
    { label: 'Calculators', icon: <Calculator size={18} />, path: '/calculators' },
  ];

  // Get selected tools data
  const selectedToolsData = ALL_TOOLS.filter(tool => selectedTools.includes(tool.id));

  // Save selected tools to localStorage
  const handleToolsChange = (toolIds: string[]) => {
    setSelectedTools(toolIds);
    try {
      localStorage.setItem('neurowiki-sidebar-tools', JSON.stringify(toolIds));
    } catch (error) {
      console.error('Failed to save tools to localStorage:', error);
    }
  };

  // Delete a tool from sidebar
  const handleDeleteTool = (toolId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = selectedTools.filter(id => id !== toolId);
    handleToolsChange(updated);
  };

  // Mobile Bottom Navigation
  const mobileNavItems = [
    { label: 'Home', icon: <Home size={20} />, path: '/' },
    { label: 'Guide', icon: <Stethoscope size={20} />, path: '/guide' },
    { label: 'Trials', icon: <FlaskConical size={20} />, path: '/trials' },
    { label: 'Calcs', icon: <Calculator size={20} />, path: '/calculators' },
    { label: 'Favourites', icon: <Star size={20} />, path: '/calculators?favorites=true' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    // Handle favorites query param
    if (path.includes('?favorites=true')) {
      return location.pathname === '/calculators' && location.search.includes('favorites=true');
    }
    if (path !== '/' && location.pathname.startsWith(path.split('?')[0])) {
      // If the path has query params, check them too
      if (path.includes('?')) {
        const queryParams = new URLSearchParams(path.split('?')[1]);
        const currentParams = new URLSearchParams(location.search);
        return Array.from(queryParams.entries()).every(([key, value]) => 
          currentParams.get(key) === value
        );
      }
      return true;
    }
    return false;
  };


  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {/* Sidebar for Desktop - Inspired Design */}
      <aside className="hidden md:flex flex-col w-64 bg-white">
        {/* Header with close button */}
        <div className="px-4 py-4 flex items-center justify-between border-b border-slate-100">
          <span className="text-base font-semibold text-slate-900">NeuroWiki</span>
          <button
            onClick={() => {/* Optional: Add sidebar collapse functionality */}}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {desktopNavItems.map((item) => {
            const active = isActive(item.path);
            const baseClassName = `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 group min-h-[40px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${
              active
                ? 'bg-slate-100 text-slate-900 font-medium'
                : 'text-slate-700 hover:bg-slate-50 font-normal'
            }`;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={baseClassName}
              >
                <span className={`${active ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>
                <span className="text-left">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Tools Section */}
          {selectedToolsData.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="space-y-0.5">
                {selectedToolsData.map((tool) => (
                  <Link
                    key={tool.id}
                    to={`${tool.path}?from=calculators&category=${encodeURIComponent(tool.category)}`}
                    className="group flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors duration-150 min-h-[36px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-2 h-2 ${categoryColors[tool.category] || 'bg-slate-400'} rounded-sm flex-shrink-0`}></div>
                      <span className="truncate">{tool.name}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteTool(tool.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-150 flex-shrink-0 ml-2"
                      aria-label={`Remove ${tool.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Add Tool Button */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsToolModalOpen(true)}
              className="w-full flex items-center justify-center px-3 py-2 text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors duration-150 min-h-[36px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            >
              <span>Add Tool</span>
            </button>
          </div>
        </nav>

        {/* Footer - Simplified */}
        <div className="px-4 py-4 border-t border-slate-100 text-slate-500 text-xs">
          <p className="opacity-60">© 2026 NeuroWiki AI</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-20 shadow-sm relative">
          
          {/* Mobile Search Overlay */}
          {isMobileSearchOpen && (
            <div className="absolute inset-0 bg-white z-50 flex items-center px-4 animate-in fade-in slide-in-from-top-2 duration-200">
               <button 
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-3 text-slate-400 hover:text-slate-600 mr-2 rounded-full hover:bg-slate-100 touch-manipulation active:scale-95 transform-gpu transition-colors duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
                aria-label="Close Search"
               >
                 <ArrowLeft size={24} />
               </button>
               <form onSubmit={handleSearch} className="flex-1 relative">
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    className="w-full py-3 pl-11 pr-4 bg-slate-50 border-none ring-1 ring-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-neuro-500 text-base font-medium text-slate-800 placeholder:text-slate-400"
                    placeholder="Search protocols..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
               </form>
            </div>
          )}

          <div className="flex items-center">
            {/* Logo Mobile */}
            <div className="md:hidden flex items-center space-x-2">
              <div className="bg-neuro-500 p-3 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                 <Brain className="text-white" size={24} />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">NeuroWiki</span>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
             <form onSubmit={handleSearch} className="w-full relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-neuro-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-neuro-500/20 focus:border-neuro-500 sm:text-sm transition-colors duration-150 shadow-sm"
                  placeholder="Search clinical guidelines, trials, calculators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </form>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden p-3 text-slate-500 hover:bg-slate-100 rounded-full transition-colors duration-150 active:scale-95 transform-gpu touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
              aria-label="Open Search"
            >
              <Search size={24} />
            </button>
            <div className="hidden md:flex items-center space-x-4">
               <Link to="/calculators" className="text-xs font-bold text-slate-400 hover:text-neuro-500 transition-colors uppercase tracking-wider flex items-center">
                  Quick Calc <Calculator size={14} className="ml-1.5" />
               </Link>
            </div>
          </div>
        </header>

        {/* Main Content with extra padding for mobile bottom nav + sticky actions */}
        <main ref={mainRef} className="flex-1 overflow-y-auto bg-jet-500 p-4 md:p-8 scroll-smooth pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <FeedbackButton />

        {/* Tool Manager Modal */}
        <ToolManagerModal
          isOpen={isToolModalOpen}
          onClose={() => setIsToolModalOpen(false)}
          selectedTools={selectedTools}
          onToolsChange={handleToolsChange}
        />

        {/* Mobile Bottom Navigation Bar - Clinical Premium */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-2 pb-safe z-50">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {mobileNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[64px] transition-colors duration-150 touch-manipulation ${active ? 'text-neuro-500' : 'text-slate-400 hover:text-neuro-500'}`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
