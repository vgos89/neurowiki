
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useNavigationSource } from '../hooks/useNavigationSource';
import ReactMarkdown from 'react-markdown';
import { ChevronRight, ArrowLeft, ArrowUp, List, ChevronDown, ExternalLink, Stethoscope, FlaskConical, AlertCircle, Zap, Activity, Link as LinkIcon, Calculator, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { GUIDE_CONTENT } from '../data/guideContent';
import { processNodesForLinking } from '../internalLinks/autoLink';
import { getBacklinks } from '../internalLinks/backlinks';
import { getMainScrollElement, scrollMainToTop } from '../utils/mainScroll';

const generateSlug = (text: string) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};


interface ResidentGuideProps {
  context?: 'guide' | 'trials';
}

// Guide navigation structure (matching Layout.tsx)
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

const ResidentGuide: React.FC<ResidentGuideProps> = ({ context = 'guide' }) => {
  const { topicId } = useParams<{ topicId: string }>();
  const isTrialMode = context === 'trials';
  const location = useLocation();
  
  const currentTopic = topicId ? GUIDE_CONTENT[topicId] : null;
  
  // Expanded categories state for mobile legend
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Vascular Neurology']);
  
  // Search state for mobile legend
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Clear search when navigating
  useEffect(() => {
    setSidebarSearchQuery('');
  }, [location.pathname]);

  // --- Backlinks ---
  const backlinks = useMemo(() => {
      if (!currentTopic) return [];
      const links = getBacklinks(currentTopic.id);
      
      // Filter out tools that are manually rendered with custom styling to avoid duplicates
      if (currentTopic.id === 'status-epilepticus') {
          return links.filter(l => l.id !== 'se-pathway');
      }
      if (currentTopic.id === 'thrombectomy') {
          return links.filter(l => l.id !== 'evt-pathway');
      }
      
      return links;
  }, [currentTopic]);

  const { getBackPath, getBackLabel, source } = useNavigationSource();

  // Scroll to top when topic changes
  useEffect(() => {
    scrollMainToTop();
  }, [topicId]);

  // --- Article Content Parsing (Sections for Accordion) ---
  const sections = useMemo(() => {
    if (!currentTopic) return [];
    const lines = currentTopic.content.split('\n');
    const result: { title: string; content: string; id: string }[] = [];
    let currentTitle = "Overview";
    let currentContent: string[] = [];

    const cleanTitle = (t: string) => t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[\*`]/g, '');

    lines.forEach((line, index) => {
      if (line.startsWith('## ')) {
        // Push previous section if it has content
        if (currentContent.length > 0 || (currentTitle !== "Overview" && result.length === 0)) {
           result.push({
             title: cleanTitle(currentTitle),
             content: currentContent.join('\n'),
             id: generateSlug(cleanTitle(currentTitle))
           });
        }
        currentTitle = line.replace('## ', '').trim();
        currentContent = [];
      } else {
        if (index > 0 || !line.startsWith('## ')) currentContent.push(line);
      }
    });
    
    // Push the final section
    if (currentContent.length > 0 || currentTitle !== "Overview") {
        result.push({
            title: cleanTitle(currentTitle),
            content: currentContent.join('\n'),
            id: generateSlug(cleanTitle(currentTitle))
        });
    }
    return result.filter(s => s.title !== "Overview" || s.content.trim().length > 0);
  }, [currentTopic]);

  // --- Article Accordion State ---
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Initialize article sections expansion
  useEffect(() => {
    if (sections.length > 0) {
        setExpandedSections({});
    }
  }, [sections, topicId]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const isOpening = !prev[id];
      if (isOpening) {
          // On mobile, snap heading to top and auto-scroll
          if (window.innerWidth < 768) {
          setTimeout(() => {
              const element = document.getElementById(id);
              if (element) {
                      // Calculate scroll position accounting for fixed header
                      const headerOffset = 80; // Fixed header height
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                      
                      window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth'
                      });
              }
              }, 150); // Wait for accordion animation to start
          }
          return { [id]: true };
      }
      return {};
    });
  };

  // --- Scroll Logic ---
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const mainScroller = getMainScrollElement();
    const handleScroll = () => {
      if (mainScroller) {
        setShowScrollTop(mainScroller.scrollTop > 300);
      }
    };
    if (mainScroller) mainScroller.addEventListener('scroll', handleScroll);
    return () => mainScroller?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const mainScroller = getMainScrollElement();
    mainScroller?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    if (window.innerWidth < 768) {
        // Mobile: expand section and scroll to top
        setExpandedSections({ [id]: true });
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                // Calculate scroll position accounting for fixed header
                const headerOffset = 80; // Fixed header height
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 150); // Wait for accordion to expand
    } else {
        // Desktop: just scroll normally
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
  };

  const themeClass = isTrialMode ? 'emerald' : 'neuro';
  const iconColor = isTrialMode ? 'text-emerald-600' : 'text-neuro-500';
  const activeBg = isTrialMode ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-neuro-50 text-teal-500 ring-neuro-100';

  const markdownComponents = {
    h3: ({children}: any) => (
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4 flex items-center">
             <span className={`w-1.5 h-1.5 ${isTrialMode ? 'bg-emerald-300' : 'bg-neuro-200'} rounded-full mr-3`}></span>
             {children}
        </h3>
    ),
    // Apply Auto-Linking to Paragraphs and List Items
    p: ({children}: any) => <p className="text-slate-600 dark:text-slate-300 leading-8 mb-6 font-normal text-base">{processNodesForLinking(children)}</p>,
    ul: ({children}: any) => <ul className="space-y-4 mb-8">{children}</ul>,
    li: ({children}: any) => (
        <li className="flex items-start text-slate-600 dark:text-slate-300 leading-7">
             <div className="mt-2.5 mr-3 flex-shrink-0">
                  <div className={`w-1.5 h-1.5 rounded-full ${isTrialMode ? 'bg-emerald-400' : 'bg-neuro-300'}`}></div>
             </div>
             <div className="flex-1">{processNodesForLinking(children)}</div>
        </li>
    ),
    blockquote: ({children}: any) => (
        <blockquote className={`border-l-4 ${isTrialMode ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-neuro-500 bg-neuro-50 text-teal-500'} p-6 rounded-r-xl italic my-8 shadow-sm`}>
            {children}
        </blockquote>
    ),
    a: ({href, children}: any) => {
        const baseClass = `font-semibold underline decoration-2 underline-offset-4 transition-colors duration-150 ${isTrialMode ? 'text-emerald-600 hover:text-emerald-800 decoration-emerald-200' : 'text-neuro-500 hover:text-teal-500 decoration-neuro-200'}`;
        if (href?.startsWith('/')) return <Link to={href} className={baseClass}>{children}</Link>;
        return <a href={href} className={`inline-flex items-center ${baseClass}`}>{children} <ExternalLink size={12} className="ml-1 opacity-50" /></a>;
    }
  };

  return (
    <div className="flex flex-col relative items-start">
      {/* Back Button - Show when article is open */}
      {currentTopic && (
        <div className="w-full mb-4">
          <Link
            to={isTrialMode ? '/trials' : '/guide'}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to {isTrialMode ? 'Neuro Trials' : 'Resident Guide'}</span>
          </Link>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 min-w-0 w-full">
        {/* Mobile Sidebar Legend (matching desktop) - Only show on landing page, not when viewing article */}
        {!currentTopic && (
          <div className="lg:hidden">
            <div className="bg-white dark:bg-slate-800 overflow-hidden">
                {/* Panel Header */}
                <div className="px-4 pt-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Resident Guide
            </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Clinical Protocols
                  </p>
        </div>

                {/* Search */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search guidelines..."
                      value={sidebarSearchQuery}
                      onChange={(e) => setSidebarSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border-0 rounded-lg text-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neuro-500"
                    />
                  </div>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto px-3 py-3 max-h-[50vh]">
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
                          className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                          <span>{category.name}</span>
                   <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${
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
                                  className={`block px-3 py-2 ml-2 rounded-lg text-sm transition-colors border-l-2 ${
                                    itemActive
                                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium border-blue-500'
                                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border-transparent hover:border-slate-300'
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
      </div>
            </div>
        )}

        {currentTopic ? (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Back Button - Always visible */}
             <div className="w-full mb-6 px-4 pt-4 md:px-8 md:pt-8">
               <Link 
                 to={isTrialMode ? '/trials' : '/guide'} 
                 className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
               >
                  <ArrowLeft size={18} />
                  <span>Back to {isTrialMode ? 'Neuro Trials' : 'Resident Guide'}</span>
             </Link>
             </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start lg:max-w-6xl lg:mx-auto lg:px-8">
                <div className="col-span-1 lg:col-span-9">
                  <div className="bg-white dark:bg-slate-800 lg:rounded-2xl lg:shadow-sm dark:lg:shadow-slate-900/50 lg:border lg:border-slate-100 dark:lg:border-slate-700 px-4 py-6 md:px-6 md:py-8 lg:p-12 min-h-[500px]">
                      {/* Topic Header */}
                      <div className="mb-8 md:mb-10 border-b border-slate-100 dark:border-slate-700 pb-8 md:pb-10">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border mb-4 inline-block ${isTrialMode ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800' : 'bg-neuro-50 dark:bg-neuro-900/30 text-teal-500 dark:text-neuro-400 border-neuro-100 dark:border-neuro-800'}`}>
                            {currentTopic.category}
                         </span>
                         <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">{currentTopic.title}</h1>
                         
                         <div className="flex flex-wrap gap-3 mt-6">
                            {/* Hardcoded Primary Tools */}
                            {currentTopic.id === 'thrombectomy' && (
                                <Link to="/calculators/evt-pathway" className="inline-flex items-center px-6 py-3 bg-neuro-500 text-white font-bold rounded-xl shadow-lg shadow-neuro-200 hover:bg-teal-500 transition-colors duration-150 active:scale-95 transform-gpu group">
                                    <Zap size={18} className="mr-2 fill-white" />
                                    Launch Thrombectomy Pathway
                                    <ChevronRight size={16} className="ml-2 opacity-60 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}

                            {currentTopic.id === 'status-epilepticus' && (
                                <Link to="/calculators/se-pathway" className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-colors duration-150 active:scale-95 transform-gpu group">
                                    <Activity size={18} className="mr-2" />
                                    Launch Status Epilepticus Pathway
                                    <ChevronRight size={16} className="ml-2 opacity-60 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}

                            {/* Dynamic Referenced Tools */}
                            {backlinks.map(link => (
                                <Link 
                                    key={link.id} 
                                    to={link.url}
                                    className={`inline-flex items-center px-6 py-3 font-bold rounded-xl shadow-lg transition-colors duration-150 active:scale-95 transform-gpu group ${
                                        isTrialMode 
                                        ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700' 
                                        : 'bg-neuro-500 text-white shadow-neuro-200 hover:bg-teal-500'
                                    }`}
                                >
                                    <Calculator size={18} className="mr-2 opacity-90" />
                                    Launch {link.title}
                                    <ChevronRight size={16} className="ml-2 opacity-60 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ))}
                         </div>
                      </div>

                      {/* Content Sections (Accordion on Mobile, Full on Desktop) */}
                      <div className="space-y-2 md:space-y-0">
                          {sections.map((section) => {
                             const isOpen = expandedSections[section.id];
                             return (
                               <div key={section.id} id={section.id} className="scroll-mt-20 md:scroll-mt-24 border-b border-slate-100 dark:border-slate-700 md:border-0 last:border-0 pb-2 md:pb-0">
                                   
                                   {/* Mobile Toggle Header */}
                                   <button 
                                      onClick={() => toggleSection(section.id)}
                                      className="w-full flex items-center justify-between py-4 md:hidden group text-left"
                                   >
                                      <span className="text-lg font-bold text-slate-900 dark:text-white flex items-center pr-4">
                                          <span className={`w-1.5 h-1.5 rounded-full mr-3 flex-shrink-0 ${isTrialMode ? 'bg-emerald-400' : 'bg-neuro-400'}`}></span>
                                          {section.title}
                                      </span>
                                      <div className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${isOpen ? 'bg-slate-100 dark:bg-slate-700' : 'bg-transparent'}`}>
                                          <ChevronDown size={20} className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                      </div>
                                   </button>

                                   {/* Desktop Static Header */}
                                   <h2 className="hidden md:flex items-center text-xl font-bold text-slate-900 dark:text-white mt-12 mb-6 pb-3 border-b border-slate-100 dark:border-slate-700">
                                      <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${isTrialMode ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 'bg-neuro-50 text-neuro-500 ring-neuro-100'} mr-3 shadow-sm ring-1`}>
                                          <ChevronRight size={18} strokeWidth={3} />
                                      </span>
                                      {section.title}
                                   </h2>

                                   {/* Content Body (Hidden on Mobile unless Open, Always shown on Desktop) */}
                                   <div className={`${isOpen ? 'block' : 'hidden'} md:block animate-in slide-in-from-top-2 duration-300`}>
                                      <ReactMarkdown components={markdownComponents as any}>{section.content}</ReactMarkdown>
                                   </div>
                               </div>
                             );
                          })}
                      </div>

                      {/* Disclaimer Footer */}
                      <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700 text-center">
                        <div className="inline-flex items-center space-x-2 bg-slate-50 dark:bg-slate-700/50 px-4 py-2 rounded-full border border-slate-100/50 dark:border-slate-600/50">
                           <AlertCircle size={12} className="text-slate-400 dark:text-slate-500" />
                           <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Decision Support Only • Not Medical Advice</span>
                        </div>
                      </div>
                  </div>
                </div>

                {/* Table of Contents (Desktop Only) */}
                <div className="hidden lg:block col-span-3 sticky top-6 self-start">
                    {sections.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-4 border-b border-slate-50 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/80"><h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center"><List size={14} className={`mr-2 ${iconColor}`} />Contents</h3></div>
                            <nav className="max-h-[70vh] overflow-y-auto p-2 custom-scrollbar">
                                {sections.map((h, i) => (
                                    <button key={i} onClick={() => scrollToSection(h.id)} className="text-left w-full text-sm text-slate-600 dark:text-slate-300 hover:text-teal-500 dark:hover:text-neuro-400 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-2.5 rounded-lg transition-colors duration-150 group flex items-start">
                                        <span className={`mt-1.5 mr-2 w-1.5 h-1.5 rounded-full ${isTrialMode ? 'bg-emerald-200 dark:bg-emerald-500 group-hover:bg-emerald-500' : 'bg-neuro-200 dark:bg-neuro-500 group-hover:bg-neuro-500'} flex-shrink-0`}></span>
                                        <span className="truncate leading-tight">{h.title}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </div>
            
            <button onClick={scrollToTop} className={`fixed bottom-8 right-8 ${isTrialMode ? 'bg-emerald-600' : 'bg-neuro-500'} text-white p-3 rounded-full shadow-xl hover:scale-110 transition-colors duration-150 z-50 ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}><ArrowUp size={24} /></button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ResidentGuide;
