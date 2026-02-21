
import React, { useState, useRef, useEffect, useMemo, lazy, Suspense } from 'react';
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
  Star,
  ChevronDown,
  ChevronRight,
  Menu,
  PanelLeftClose
} from 'lucide-react';
import { FeedbackButton } from './FeedbackButton';
import type { GuideTopic } from '../data/guideContent';

const ToolManagerModal = lazy(() => import('./ToolManagerModal'));

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
  { id: 'elan-pathway', name: 'Post-Stroke Anticoagulation Timing', description: 'Anticoagulation timing after ischemic stroke with AF', category: 'vascular', type: 'pathway', path: '/calculators/elan-pathway' },
  { id: 'se-pathway', name: 'Status Epilepticus', description: 'Stage 1–3 SE management pathway', category: 'epilepsy', type: 'pathway', path: '/calculators/se-pathway' },
  { id: 'migraine-pathway', name: 'Migraine & Headache', description: 'ED and inpatient management', category: 'headache', type: 'pathway', path: '/calculators/migraine-pathway' },
  { id: 'gca-pathway', name: 'GCA / PMR Pathway', description: 'Suspected giant cell arteritis workup', category: 'headache', type: 'pathway', path: '/calculators/gca-pathway' },
  { id: 'ich', name: 'ICH Score', description: '30-day mortality for ICH', category: 'vascular', type: 'calculator', path: '/calculators/ich-score' },
  { id: 'em-billing', name: 'E/M Billing Calculator', description: 'CPT code selection via MDM and time-based billing (2021 AMA)', category: 'general', type: 'calculator', path: '/calculators/em-billing' },
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
  const [guideContent, setGuideContent] = useState<Record<string, GuideTopic> | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Lazy load guide/trials data only when user visits guide or trials section (reduces initial bundle)
  useEffect(() => {
    if (location.pathname.startsWith('/guide') || location.pathname.startsWith('/trials')) {
      import('../data/guideContent').then((m) => setGuideContent(m.GUIDE_CONTENT));
    }
  }, [location.pathname]);

  // Search state for sidebar filtering (separate from main search)
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  
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

  // Check current section
  const isOnGuidePage = location.pathname.startsWith('/guide');
  const isOnTrialsPage = location.pathname.startsWith('/trials');
  const isOnCalculatorsPage = location.pathname.startsWith('/calculators');

  // Check if we're viewing a specific article/trial
  // Exclude: /guide (landing), /trials (landing)
  // Include: ALL article routes including /guide/stroke-basics, /guide/iv-tpa, /guide/thrombectomy, /guide/:topicId, /trials/:topicId, etc.
  const isViewingArticle = (
    (isOnGuidePage && location.pathname !== '/guide') ||
    (isOnTrialsPage && location.pathname !== '/trials')
  );
  
  // Content panel (sidebar) only for Resident Guide landing. Neuro Trials uses in-page filters — no sidebar.
  const showContentPanel = isOnGuidePage && !isViewingArticle;

  // Navigation expanded state - defaults to true (open) on first load
  const [isNavExpanded, setIsNavExpanded] = useState(true);

  // Expanded guide categories
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Vascular Neurology']);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  // Expanded trials subcategories
  const [expandedTrialsSubcategories, setExpandedTrialsSubcategories] = useState<string[]>(['Thrombectomy']);

  const toggleTrialsSubcategory = (subcategory: string) => {
    setExpandedTrialsSubcategories(prev =>
      prev.includes(subcategory) ? prev.filter(c => c !== subcategory) : [...prev, subcategory]
    );
  };

  // Trials navigation structure
  const TRIAL_STRUCTURE = [
    {
      title: "Vascular Neurology",
      subcategories: [
        {
          title: "Thrombolysis",
          description: "IV Alteplase & Tenecteplase Evidence",
          ids: ['ninds-trial', 'original-trial', 'ecass3-trial', 'extend-trial', 'wake-up-trial', 'eagle-trial']
        },
        {
          title: "Thrombectomy",
          description: "Large & Medium Vessel Occlusion evidence",
          ids: ['distal-trial', 'escape-mevo-trial', 'defuse-3-trial', 'dawn-trial', 'select2-trial', 'angel-aspect-trial', 'attention-trial', 'baoche-trial']
        },
        {
          title: "Antiplatelets & Prevention",
          description: "DAPT, Anticoagulation, Lipids",
          ids: ['chance-trial', 'point-trial', 'sps3-trial', 'socrates-trial', 'elan-study', 'sparcl-trial']
        },
        {
          title: "Carotid & Intracranial Disease",
          description: "Stenting vs Endarterectomy vs Medical",
          ids: ['nascet-trial', 'crest-trial', 'sammpris-trial', 'weave-trial']
        },
        {
          title: "Acute Management",
          description: "Glycemic control & Systemic care",
          ids: ['shine-trial']
        }
      ]
    }
  ];

  const guideContentMap = guideContent ?? {};

  // Get orphan trials (not in structure)
  const trialOrphans = useMemo(() => {
    if (!isOnTrialsPage) return [];
    const structuredIds = new Set(TRIAL_STRUCTURE.flatMap(c => c.subcategories.flatMap(s => s.ids)));
    return Object.values(guideContentMap)
      .filter(t => t.category === 'Neuro Trials' && !structuredIds.has(t.id));
  }, [isOnTrialsPage, guideContent]);

  // Guide navigation structure - UPDATE PATHS TO MATCH YOUR ACTUAL ROUTES
  const GUIDE_NAVIGATION = [
    {
      name: 'Vascular Neurology',
      items: [
        { name: 'Stroke Code Basics', path: '/guide/stroke-basics' },
        { name: 'IV Thrombolytic Protocol', path: '/guide/iv-tpa' },
        { name: 'Mechanical Thrombectomy', path: '/guide/thrombectomy' },
        { name: 'ICH Management', path: '/guide/ich-management' },
      ],
    },
    {
      name: 'Epilepsy',
      items: [
        { name: 'Status Epilepticus', path: '/guide/status-epilepticus' },
        { name: 'Seizure Workup', path: '/guide/seizure-workup' },
      ],
    },
    {
      name: 'Neurocritical Care',
      items: [
        { name: 'Altered Mental Status', path: '/guide/altered-mental-status' },
        { name: 'Meningitis', path: '/guide/meningitis' },
      ],
    },
    {
      name: 'General Neurology',
      items: [
        { name: 'Headache Workup', path: '/guide/headache-workup' },
        { name: 'Vertigo', path: '/guide/vertigo' },
        { name: 'Weakness Workup', path: '/guide/weakness-workup' },
        { name: 'GBS', path: '/guide/gbs' },
        { name: 'Myasthenia Gravis', path: '/guide/myasthenia-gravis' },
        { name: 'Multiple Sclerosis', path: '/guide/multiple-sclerosis' },
      ],
    },
  ];

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
    // Clear sidebar search when navigating
    setSidebarSearchQuery('');
  }, [location.pathname, location.search]);

  // Auto-collapse navigation when content panel opens (Guide/Trials pages)
  useEffect(() => {
    if (showContentPanel) {
      setIsNavExpanded(false);
    }
  }, [showContentPanel]);

  // Auto-expand category when navigating to a guide page
  useEffect(() => {
    if (isOnGuidePage) {
      // Find which category contains the current path
      const currentCategory = GUIDE_NAVIGATION.find(cat =>
        cat.items.some(item => location.pathname === item.path)
      );
      if (currentCategory && !expandedCategories.includes(currentCategory.name)) {
        setExpandedCategories(prev => [...prev, currentCategory.name]);
      }
    }
  }, [location.pathname, isOnGuidePage, expandedCategories]);

  // Auto-expand trials subcategory when navigating to a trial page
  useEffect(() => {
    if (isOnTrialsPage && location.pathname.includes('/trials/')) {
      const trialId = location.pathname.split('/trials/')[1]?.split('?')[0];
      if (trialId) {
        // Find which subcategory contains this trial
        for (const cat of TRIAL_STRUCTURE) {
          for (const sub of cat.subcategories) {
            if (sub.ids.includes(trialId) && !expandedTrialsSubcategories.includes(sub.title)) {
              setExpandedTrialsSubcategories(prev => [...prev, sub.title]);
              return;
            }
          }
        }
      }
    }
  }, [location.pathname, isOnTrialsPage, expandedTrialsSubcategories]);

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
      if (import.meta.env.DEV) console.error('Failed to save tools to localStorage:', error);
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
    <div className="flex h-screen bg-surface-50 dark:bg-slate-900 overflow-hidden transition-colors">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex h-screen">
        {/* ============================================ */}
        {/* Universal Collapsible Navigation Strip      */}
        {/* ============================================ */}
        <div className={`${isNavExpanded ? 'w-48' : 'w-16'} bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col transition-all duration-200 ${isNavExpanded ? 'items-stretch' : 'items-center'} py-4`}>
              {/* Logo */}
              <div className={`${isNavExpanded ? 'px-2 mb-4' : 'mb-4'} flex items-center ${isNavExpanded ? 'gap-2' : 'justify-center'}`}>
                <div className="bg-neuro-500 p-2 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="text-white" size={isNavExpanded ? 20 : 24} />
                </div>
                {isNavExpanded && (
                  <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">NeuroWiki</span>
                )}
              </div>

              {/* Nav Icons */}
              <nav className={`flex-1 flex flex-col gap-2 ${isNavExpanded ? 'px-2' : ''}`}>
                <Link
                  to="/"
                  className={`${isNavExpanded ? 'flex items-center gap-3 px-3 py-2.5' : 'p-3 flex items-center justify-center'} rounded-xl transition-colors ${
                    location.pathname === '/'
                      ? 'bg-slate-100 dark:bg-slate-700 text-neuro-500'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  title="Home"
                >
                  <Home size={20} className="flex-shrink-0" />
                  {isNavExpanded && (
                    <span className={`text-sm font-medium whitespace-nowrap ${
                      location.pathname === '/'
                        ? 'text-neuro-500'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>Home</span>
                  )}
                </Link>
                <Link
                  to="/guide"
                  className={`${isNavExpanded ? 'flex items-center gap-3 px-3 py-2.5' : 'p-3 flex items-center justify-center'} rounded-xl transition-colors ${
                    isOnGuidePage
                      ? 'bg-slate-100 dark:bg-slate-700 text-neuro-500'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  title="Resident Guide"
                >
                  <Stethoscope size={20} className="flex-shrink-0" />
                  {isNavExpanded && (
                    <span className={`text-sm font-medium whitespace-nowrap ${
                      isOnGuidePage
                        ? 'text-neuro-500'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>Resident Guide</span>
                  )}
                </Link>
                <Link
                  to="/trials"
                  className={`${isNavExpanded ? 'flex items-center gap-3 px-3 py-2.5' : 'p-3 flex items-center justify-center'} rounded-xl transition-colors ${
                    isOnTrialsPage
                      ? 'bg-slate-100 dark:bg-slate-700 text-neuro-500'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  title="Neuro Trials"
                >
                  <FlaskConical size={20} className="flex-shrink-0" />
                  {isNavExpanded && (
                    <span className={`text-sm font-medium whitespace-nowrap ${
                      isOnTrialsPage
                        ? 'text-neuro-500'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>Neuro Trials</span>
                  )}
                </Link>
                {/* Calculators with Tools submenu */}
                <div className="flex flex-col">
                  <Link
                    to="/calculators"
                    className={`${isNavExpanded ? 'flex items-center gap-3 px-3 py-2.5' : 'p-3 flex items-center justify-center'} rounded-xl transition-colors ${
                      isOnCalculatorsPage
                        ? 'bg-slate-100 dark:bg-slate-700 text-neuro-500'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                    title="Calculators"
                  >
                    <Calculator size={20} className="flex-shrink-0" />
                    {isNavExpanded && (
                      <span className={`text-sm font-medium whitespace-nowrap ${
                        isOnCalculatorsPage
                          ? 'text-neuro-500'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>Calculators</span>
                    )}
                  </Link>
                  
                  {/* Tools under Calculators (shown when expanded) */}
                  {isNavExpanded && selectedToolsData.length > 0 && (
                    <div className="mt-1 ml-8 space-y-0.5">
                      {selectedToolsData.map((tool) => (
                        <Link
                          key={tool.id}
                          to={tool.path}
                          className="group flex items-center justify-between px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-150 min-h-[32px]"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`w-1.5 h-1.5 ${categoryColors[tool.category] || 'bg-slate-400'} rounded-sm flex-shrink-0`}></div>
                            <span className="truncate">{tool.name}</span>
                          </div>
                          <button
                            onClick={(e) => handleDeleteTool(tool.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all duration-150 flex-shrink-0 ml-2"
                            aria-label={`Remove ${tool.name}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Tool button under Calculators */}
                  {isNavExpanded && (
                    <button
                      onClick={() => setIsToolModalOpen(true)}
                      className="mt-1 ml-8 flex items-center justify-start gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
                    >
                      <span>+ Add Tool</span>
                    </button>
                  )}
                </div>
              </nav>

              {/* Footer (shown when expanded) */}
              {isNavExpanded && (
                <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs mx-2">
                  <p className="opacity-60">© 2026 NeuroWiki AI</p>
                </div>
              )}

              {/* Collapse Button at Bottom */}
              <button
                onClick={() => setIsNavExpanded(!isNavExpanded)}
                className={`p-3 mt-auto rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${isNavExpanded ? 'mx-2' : ''}`}
                title={isNavExpanded ? 'Collapse navigation' : 'Expand navigation'}
              >
                {isNavExpanded ? <PanelLeftClose size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Content Panel (Guide or Trials only) */}
            {showContentPanel && (
              <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
              {/* Panel Header */}
              <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  {isOnGuidePage ? 'Resident Guide' : 'Neuro Trials'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isOnGuidePage ? 'Clinical Protocols' : 'Clinical Evidence'}
                </p>
              </div>

              {/* Search */}
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={isOnGuidePage ? 'Search guidelines...' : 'Search trials...'}
                    value={sidebarSearchQuery}
                    onChange={(e) => setSidebarSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border-0 rounded-lg text-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
          </div>
        </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto px-3 py-3">
                {/* Guide Categories */}
                {isOnGuidePage && !isOnTrialsPage && (
                  <div>
                    {GUIDE_NAVIGATION.map((category) => {
                      // Filter items based on search query
                      const filteredItems = sidebarSearchQuery.trim()
                        ? category.items.filter(item =>
                            item.name.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
                          )
                        : category.items;
                      
                      // Only show category if it has matching items or search is empty
                      if (sidebarSearchQuery.trim() && filteredItems.length === 0) {
                        return null;
                      }
                      
                      // Auto-expand category if search query matches
                      const shouldShowExpanded = sidebarSearchQuery.trim()
                        ? filteredItems.length > 0
                        : expandedCategories.includes(category.name);
                      
                      return (
                        <div key={category.name} className="mb-1">
                          <button
                            onClick={() => toggleCategory(category.name)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-[15px] font-semibold rounded-md transition-all duration-200 ${
                              shouldShowExpanded
                                ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-500'
                            }`}
                          >
                            <span>{category.name}</span>
                            <ChevronDown
                              size={20}
                              className={`transition-transform duration-200 text-slate-400 dark:text-slate-500 ${
                                shouldShowExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {shouldShowExpanded && (
                            <div className="mt-1 space-y-0.5">
                              {filteredItems.map((item) => {
                                const itemActive = location.pathname === item.path;
                                return (
            <Link
              key={item.path}
              to={item.path}
                                    className={`block px-4 py-2.5 pl-8 rounded-md text-[14px] transition-all duration-200 ${
                                      itemActive
                                        ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 font-medium'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                                  >
                                    {item.name}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Trials Navigation */}
                {isOnTrialsPage && (
                  <div>
                    {TRIAL_STRUCTURE.map((cat) => (
                      <div key={cat.title} className="mb-1">
                        <h3 className="px-4 pt-6 pb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">
                          {cat.title.toUpperCase()}
                        </h3>
                        <div className="space-y-0.5">
                          {cat.subcategories.map(sub => {
                            // Filter trials based on search query
                            const filteredTrialIds = sidebarSearchQuery.trim()
                              ? sub.ids.filter(id => {
                                  const trial = guideContentMap[id];
                                  if (!trial) return false;
                                  const trialTitle = trial.title.replace(/Trial:|Study:/gi, '').trim();
                                  return trialTitle.toLowerCase().includes(sidebarSearchQuery.toLowerCase());
                                })
                              : sub.ids;
                            
                            // Only show subcategory if it has matching trials or search is empty
                            if (sidebarSearchQuery.trim() && filteredTrialIds.length === 0) {
                              return null;
                            }
                            
                            // Auto-expand subcategory if search query matches
                            const isOpen = sidebarSearchQuery.trim()
                              ? filteredTrialIds.length > 0
                              : expandedTrialsSubcategories.includes(sub.title);
                            
                            return (
                              <div key={sub.title} className="mb-1">
                                <button
                                  onClick={() => toggleTrialsSubcategory(sub.title)}
                                  className={`w-full flex items-center justify-between px-4 py-3 text-[15px] font-semibold rounded-md transition-all duration-200 text-left ${
                                    isOpen
                                      ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-500'
                                  }`}
                                >
                                  <span className="text-left">{sub.title}</span>
                                  <ChevronDown
                                    size={20}
                                    className={`transition-transform duration-200 flex-shrink-0 text-slate-400 dark:text-slate-500 ${
                                      isOpen ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>

                                {isOpen && (
                                  <div className="mt-1 space-y-0.5">
                                    {filteredTrialIds.map(id => {
                                      const trial = guideContentMap[id];
                                      if (!trial) return null;
                                      const itemActive = location.pathname === `/trials/${id}`;
                                      return (
                                        <Link
                                          key={id}
                                          to={`/trials/${id}`}
                                          className={`block px-4 py-2.5 pl-8 rounded-md text-[14px] transition-all duration-200 ${
                                            itemActive
                                              ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 font-medium'
                                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                                          }`}
                                        >
                                          {trial.title.replace(/Trial:|Study:/gi, '').trim()}
            </Link>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Orphan Trials */}
                    {trialOrphans.length > 0 && (() => {
                      // Filter orphan trials based on search query
                      const filteredOrphans = sidebarSearchQuery.trim()
                        ? trialOrphans.filter(trial =>
                            trial.title.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
                          )
                        : trialOrphans;
                      
                      if (sidebarSearchQuery.trim() && filteredOrphans.length === 0) {
                        return null;
                      }
                      
                      return (
                        <div className="mt-6">
                          <h3 className="px-4 pt-6 pb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">
                            OTHER TRIALS
                          </h3>
                          <div className="space-y-0.5">
                            {filteredOrphans.map(trial => {
                              const itemActive = location.pathname === `/trials/${trial.id}`;
                              return (
                                <Link
                                  key={trial.id}
                                  to={`/trials/${trial.id}`}
                                  className={`block px-4 py-2.5 pl-8 rounded-md text-[14px] transition-all duration-200 ${
                                    itemActive
                                      ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 font-medium'
                                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                                  }`}
                                >
                                  {trial.title}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
            </div>
                )}
          </div>

        </div>
            )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 z-50 shadow-sm">
          
          {/* Mobile Search Overlay */}
          {isMobileSearchOpen && (
            <div className="absolute inset-0 bg-white dark:bg-slate-800 z-50 flex items-center px-4 animate-in fade-in slide-in-from-top-2 duration-200">
               <button 
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 touch-manipulation active:scale-95 transform-gpu transition-colors duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
                aria-label="Close Search"
               >
                 <ArrowLeft size={24} />
               </button>
               <form onSubmit={handleSearch} className="flex-1 relative">
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    className="w-full py-3 pl-11 pr-4 bg-slate-50 dark:bg-slate-700 border-none ring-1 ring-slate-200 dark:ring-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-neuro-500 text-base font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="Search protocols..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
               </form>
            </div>
          )}

          <div className="flex items-center">
            {/* Logo Mobile */}
            <div className="md:hidden flex items-center space-x-2">
              <div className="bg-neuro-500 p-3 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                 <Brain className="text-white" size={24} />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">NeuroWiki</span>
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
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl leading-5 bg-slate-50/50 dark:bg-slate-700/50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-neuro-500/20 focus:border-neuro-500 sm:text-sm transition-colors duration-150 shadow-sm text-slate-900 dark:text-white"
                  placeholder="Search clinical guidelines, trials, calculators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </form>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mobile Search and Dark Mode Toggle */}
            <div className="md:hidden flex items-center space-x-1">
            <button
              onClick={() => setIsMobileSearchOpen(true)}
                className="p-3 text-slate-500 hover:bg-slate-100 rounded-full transition-colors duration-150 active:scale-95 transform-gpu touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
              aria-label="Open Search"
            >
              <Search size={24} />
            </button>
            </div>
            <div className="hidden md:flex items-center space-x-4">
               <Link to="/calculators" className="text-xs font-bold text-slate-400 hover:text-neuro-500 transition-colors uppercase tracking-wider flex items-center">
                  Quick Calc <Calculator size={14} className="ml-1.5" />
               </Link>
            </div>
          </div>
        </header>

        {/* Main Content with extra padding for mobile bottom nav + sticky actions */}
        <main ref={mainRef} className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 px-4 pb-24 pt-16 md:px-8 md:pb-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <FeedbackButton />

        {/* Tool Manager Modal - lazy loaded when opened */}
        {isToolModalOpen && (
          <Suspense fallback={null}>
            <ToolManagerModal
              isOpen={isToolModalOpen}
              onClose={() => setIsToolModalOpen(false)}
              selectedTools={selectedTools}
              onToolsChange={handleToolsChange}
            />
          </Suspense>
        )}

        {/* Mobile Bottom Navigation Bar - Clinical Premium */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-700/80 px-2 pt-2 z-50" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <div className="flex items-center justify-around max-w-md mx-auto">
            {mobileNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[64px] transition-colors duration-150 touch-manipulation ${active ? 'text-neuro-500 dark:text-neuro-400' : 'text-slate-400 dark:text-slate-500 hover:text-neuro-500 dark:hover:text-neuro-400'}`}
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
