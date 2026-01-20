
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
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

  // Desktop Navigation
  const desktopNavItems = [
    { label: 'Home', icon: <Home size={20} />, path: '/' },
    { label: 'Resident Guide', icon: <Stethoscope size={20} />, path: '/guide' },
    { label: 'Neuro Trials', icon: <FlaskConical size={20} />, path: '/trials' },
    { label: 'Calculators', icon: <Calculator size={20} />, path: '/calculators' },
  ];

  // Mobile Bottom Navigation
  const mobileNavItems = [
    { label: 'Home', icon: <Home size={24} />, path: '/' },
    { label: 'Guide', icon: <Stethoscope size={24} />, path: '/guide' },
    { label: 'Trials', icon: <FlaskConical size={24} />, path: '/trials' },
    { label: 'Calcs', icon: <Calculator size={24} />, path: '/calculators' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800 transition-all duration-300">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="bg-neuro-500 p-2 rounded-lg shadow-lg shadow-neuro-500/20">
            <Brain className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">NeuroWiki</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {desktopNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-neuro-600 text-white shadow-lg shadow-neuro-900/20 translate-x-1'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
              }`}
            >
              <span className={isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-neuro-400'}>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          
          <div className="mt-8 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            Quick Tools
          </div>
          <Link to="/calculators/evt-pathway" className="flex items-center px-4 py-2 mt-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-neuro-500 mr-2"></span>
            Thrombectomy
          </Link>
          <Link to="/calculators/migraine-pathway" className="flex items-center px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>
            Migraine Pathway
          </Link>
          <Link to="/calculators?id=nihss" className="flex items-center px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
            NIH Stroke Scale
          </Link>
          <Link to="/calculators/elan-pathway" className="flex items-center px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></span>
            ELAN Protocol
          </Link>
        </nav>

        <div className="p-6 border-t border-slate-800 text-slate-500 text-xs font-medium">
          <p>© 2026 NeuroWiki AI</p>
          <p className="mt-1 opacity-60">Reference and Decision Support</p>
          <p className="opacity-60">Not Medical Advice</p>
          <p className="mt-1 opacity-40 text-[10px]">Build: V1.1</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 md:px-8 z-20 shadow-sm relative">
          
          {/* Mobile Search Overlay */}
          {isMobileSearchOpen && (
            <div className="absolute inset-0 bg-white z-50 flex items-center px-4 animate-in fade-in slide-in-from-top-2 duration-200">
               <button 
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-3 text-slate-400 hover:text-slate-600 mr-2 rounded-full hover:bg-slate-100 touch-manipulation"
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
              <div className="bg-neuro-500 p-1.5 rounded-lg">
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-neuro-500/20 focus:border-neuro-500 sm:text-sm transition-all shadow-sm"
                  placeholder="Search clinical guidelines, trials, calculators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </form>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden p-3 text-slate-500 hover:bg-slate-100 rounded-full transition-colors active:scale-95 touch-manipulation"
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
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 scroll-smooth pb-32 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar - Height increased for ergonomics */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 h-[4.5rem] pb-safe flex justify-around items-center z-40 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
            {mobileNavItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-200 active:scale-95 touch-manipulation ${active ? 'text-neuro-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     <div className={`p-1 mb-0.5 rounded-xl transition-all duration-300 relative ${active ? 'bg-neuro-50 -translate-y-1' : ''}`}>
                        {item.icon}
                        {active && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-neuro-600 rounded-full"></span>}
                     </div>
                     <span className={`text-[10px] font-bold tracking-wide transition-colors ${active ? 'text-neuro-700' : 'text-slate-400'}`}>
                        {item.label}
                     </span>
                  </Link>
                )
            })}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
