
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Search, 
  Calculator, 
  FlaskConical,
  Stethoscope,
  ArrowLeft,
  Home
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);

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
    { label: 'Home', icon: <Home size={20} />, path: '/' },
    { label: 'Resident Guide', icon: <Stethoscope size={20} />, path: '/guide' },
    { label: 'Neuro Trials', icon: <FlaskConical size={20} />, path: '/trials' },
    { label: 'Calculators', icon: <Calculator size={20} />, path: '/calculators' },
  ];

  // Mobile Bottom Navigation
  const mobileNavItems = [
    { label: 'Home', icon: <Home size={20} />, path: '/' },
    { label: 'Guide', icon: <Stethoscope size={20} />, path: '/guide' },
    { label: 'Trials', icon: <FlaskConical size={20} />, path: '/trials' },
    { label: 'Calcs', icon: <Calculator size={20} />, path: '/calculators' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {/* Sidebar for Desktop - Clinical Premium */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-100">
          <div className="bg-neuro-600 p-2.5 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center">
            <Brain className="text-white" size={20} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">NeuroWiki</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {desktopNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 group min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${
                isActive(item.path)
                  ? 'bg-neuro-50 text-neuro-700 font-semibold border border-neuro-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <span className={isActive(item.path) ? 'text-neuro-600' : 'text-slate-500 group-hover:text-slate-700'}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Quick Tools
            </div>
            <Link to="/calculators/evt-pathway" className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-neuro-600 hover:bg-slate-50 rounded-md transition-colors duration-150 min-h-[36px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Thrombectomy</span>
            </Link>
            <Link to="/calculators/migraine-pathway" className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-neuro-600 hover:bg-slate-50 rounded-md transition-colors duration-150 min-h-[36px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Migraine Pathway</span>
            </Link>
            <Link to="/calculators?id=nihss" className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-neuro-600 hover:bg-slate-50 rounded-md transition-colors duration-150 min-h-[36px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>NIH Stroke Scale</span>
            </Link>
            <Link to="/calculators/elan-pathway" className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-neuro-600 hover:bg-slate-50 rounded-md transition-colors duration-150 min-h-[36px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>ELAN Protocol</span>
            </Link>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-100 text-slate-500 text-xs font-medium">
          <p>© 2026 NeuroWiki AI</p>
          <p className="mt-1 opacity-60">Reference and Decision Support</p>
          <p className="opacity-60">Not Medical Advice</p>
          <p className="mt-1 opacity-40 text-xs">Build: V1.1</p>
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
               <Link to="/calculators" className="text-xs font-bold text-slate-400 hover:text-neuro-600 transition-colors uppercase tracking-wider flex items-center">
                  Quick Calc <Calculator size={14} className="ml-1.5" />
               </Link>
            </div>
          </div>
        </header>

        {/* Main Content with extra padding for mobile bottom nav + sticky actions */}
        <main ref={mainRef} className="flex-1 overflow-y-auto bg-surface-50 p-4 md:p-8 scroll-smooth pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar - Clinical Premium */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-2 pb-safe z-50">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {mobileNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[64px] transition-colors duration-150 touch-manipulation ${active ? 'text-neuro-600' : 'text-slate-400 hover:text-slate-600'}`}
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
