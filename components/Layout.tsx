
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Search, 
  Calculator, 
  Menu, 
  X, 
  BookOpen, 
  Activity,
  Github,
  Library,
  FlaskConical,
  Stethoscope
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/wiki/${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'Encyclopedia', icon: <BookOpen size={20} />, path: '/' },
    { label: 'Resident Guide', icon: <Stethoscope size={20} />, path: '/guide' },
    { label: 'Neuro Trials', icon: <FlaskConical size={20} />, path: '/trials' },
    { label: 'Calculators', icon: <Calculator size={20} />, path: '/calculators' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="bg-neuro-500 p-2 rounded-lg">
            <Brain className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">NeuroWiki</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-neuro-600 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          
          <div className="mt-8 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Popular Tools
          </div>
          <Link to="/calculators?id=gcs" className="block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md">
            Glasgow Coma Scale
          </Link>
          <Link to="/calculators?id=nihss" className="block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md">
            NIH Stroke Scale (Sim)
          </Link>
          <Link to="/calculators?id=abcd2" className="block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md">
            ABCD² Score
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800 text-slate-500 text-xs">
          <p>© 2024 NeuroWiki AI</p>
          <p className="mt-1">For educational use only.</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 z-10 shadow-sm">
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="ml-2 text-lg font-bold text-slate-900">NeuroWiki</span>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl ml-4">
             <form onSubmit={handleSearch} className="w-full relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-neuro-500" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-neuro-500 focus:border-transparent sm:text-sm transition-all shadow-sm"
                  placeholder="Search neurological conditions, drugs, or anatomy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </form>
          </div>

          <div className="flex items-center space-x-4">
          </div>
        </header>
        
        {/* Mobile Search Bar (visible only on mobile) */}
        <div className="md:hidden p-4 bg-white border-b border-gray-200">
          <form onSubmit={handleSearch} className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-neuro-500 focus:border-transparent text-sm"
               placeholder="Search..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-50">
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
