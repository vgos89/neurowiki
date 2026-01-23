
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useNavigationSource } from '../src/hooks/useNavigationSource';
import ReactMarkdown from 'react-markdown';
import { ChevronRight, ArrowLeft, ArrowUp, List, ChevronDown, ExternalLink, Stethoscope, FlaskConical, AlertCircle, Zap, Activity, Link as LinkIcon, Calculator } from 'lucide-react';
import { GUIDE_CONTENT } from '../data/guideContent';
import { processNodesForLinking } from '../internalLinks/autoLink';
import { getBacklinks } from '../internalLinks/backlinks';

const generateSlug = (text: string) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

// Define structure for Trials Sidebar
const TRIAL_STRUCTURE = [
  {
    title: "Vascular Neurology",
    subcategories: [
      {
        title: "Thrombolysis",
        description: "IV Alteplase & Tenecteplase Evidence",
        ids: ['ninds-trial', 'ecass3-trial', 'extend-trial', 'eagle-trial']
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

interface ResidentGuideProps {
  context?: 'guide' | 'trials';
}

const ResidentGuide: React.FC<ResidentGuideProps> = ({ context = 'guide' }) => {
  const { topicId } = useParams<{ topicId: string }>();
  const isTrialMode = context === 'trials';
  
  const currentTopic = topicId ? GUIDE_CONTENT[topicId] : null;

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

  // --- Sidebar Logic (Guide) ---
  const sidebarContent = useMemo(() => {
    // Only used for Resident Guide mode
    if (isTrialMode) return [];
    
    const topics = Object.values(GUIDE_CONTENT).filter(t => t.category !== 'Neuro Trials');
    const cats = Array.from(new Set(topics.map(t => t.category)));
    
    const CATEGORY_ORDER = [
      'Vascular Neurology',
      'Epilepsy',
      'Neurocritical Care',
      'General Neurology',
      'Neuromuscular',
      'Movement Disorders',
      'Neuroimmunology',
      'Cognitive Neurology',
      'Infectious Disease'
    ];
    
    return cats.sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a);
      const indexB = CATEGORY_ORDER.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    }).map(cat => ({
      name: cat,
      items: topics.filter(t => t.category === cat)
    }));
  }, [isTrialMode]);

  // --- Sidebar Logic (Trials Orphans) ---
  const trialOrphans = useMemo(() => {
    if (!isTrialMode) return [];
    const structuredIds = new Set(TRIAL_STRUCTURE.flatMap(c => c.subcategories.flatMap(s => s.ids)));
    return Object.values(GUIDE_CONTENT)
      .filter(t => t.category === 'Neuro Trials' && !structuredIds.has(t.id));
  }, [isTrialMode]);

  // Unified State for open section (Category Name for Guide; Subcategory Name for Trials)
  const [searchParams] = useSearchParams();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const { getBackPath, getBackLabel, source } = useNavigationSource();

  // When returning with ?open=, expand that accordion (no topic selected)
  useEffect(() => {
    const o = searchParams.get('open');
    if (!topicId && o) setOpenCategory(o);
  }, [topicId, searchParams]);

  // Initialize sidebar expansion based on current topic
  useEffect(() => {
    if (topicId) {
      if (isTrialMode) {
        // For Trials: Find the subcategory that contains this trial ID
        for (const cat of TRIAL_STRUCTURE) {
          for (const sub of cat.subcategories) {
            if (sub.ids.includes(topicId)) {
              setOpenCategory(sub.title);
              return;
            }
          }
        }
        // If not found in structure (orphan), we might leave it null or handle differently
      } else {
        // For Guide: Find the category
        if (sidebarContent.length > 0) {
            const activeCat = sidebarContent.find(c => c.items.some(i => i.id === topicId));
            if (activeCat) {
              setOpenCategory(activeCat.name);
            }
        }
      }
    } 
  }, [topicId, sidebarContent, isTrialMode]);

  // Scroll to top when topic changes
  useEffect(() => {
    const mainScroller = document.querySelector('main');
    if (mainScroller) {
        mainScroller.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [topicId]);

  const toggleCategory = (categoryName: string) => {
    setOpenCategory(prev => (prev === categoryName ? null : categoryName));
  };

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
    const mainScroller = document.querySelector('main');
    const handleScroll = () => {
      if (mainScroller) {
        setShowScrollTop(mainScroller.scrollTop > 300);
      }
    };
    if (mainScroller) mainScroller.addEventListener('scroll', handleScroll);
    return () => mainScroller?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const mainScroller = document.querySelector('main');
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
        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4 flex items-center">
             <span className={`w-1.5 h-1.5 ${isTrialMode ? 'bg-emerald-300' : 'bg-neuro-200'} rounded-full mr-3`}></span>
             {children}
        </h3>
    ),
    // Apply Auto-Linking to Paragraphs and List Items
    p: ({children}: any) => <p className="text-slate-600 leading-8 mb-6 font-normal text-base">{processNodesForLinking(children)}</p>,
    ul: ({children}: any) => <ul className="space-y-4 mb-8">{children}</ul>,
    li: ({children}: any) => (
        <li className="flex items-start text-slate-600 leading-7">
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
    <div className="flex flex-col md:flex-row relative items-start">
      {/* Sidebar */}
      <div className={`w-full md:w-64 bg-white flex-shrink-0 md:sticky md:top-0 md:h-screen overflow-y-auto self-start ${topicId ? 'hidden md:block' : ''}`}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {isTrialMode ? (
              <FlaskConical className="text-neuro-500" size={20} />
            ) : (
              <Stethoscope className="text-neuro-500" size={20} />
            )}
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {isTrialMode ? 'Neuro Trials' : 'Resident Guide'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTrialMode ? 'Evidence pearls' : 'Clinical protocols'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {/* RENDER LOGIC FOR TRIALS (Structured) */}
          {isTrialMode ? (
             <>
               {TRIAL_STRUCTURE.map(cat => (
                 <div key={cat.title} className="mt-4 first:mt-0">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">{cat.title}</h3>
                    <div className="space-y-0.5">
                      {cat.subcategories.map(sub => {
                         const isOpen = openCategory === sub.title;
                         return (
                           <div key={sub.title}>
                              <button
                                 onClick={() => toggleCategory(sub.title)}
                                 className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 group min-h-[40px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${
                                   isOpen ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700 hover:bg-slate-50 font-normal'
                                 }`}
                              >
                                 <span className="text-left">{sub.title}</span>
                                 <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                              </button>
                              {isOpen && (
                                 <div className="mt-0.5 space-y-0.5 pl-3 animate-in slide-in-from-top-1 fade-in duration-200">
                                    {sub.ids.map(id => {
                                        const trial = GUIDE_CONTENT[id];
                                        if (!trial) return null;
                                        const isActive = topicId === id;
                                        return (
                                            <Link 
                                              key={id} 
                                              to={`/trials/${id}?from=trials&category=${encodeURIComponent(sub.title)}`} 
                                              className={`block px-3 py-2 text-sm rounded-lg transition-colors duration-150 truncate ${
                                                isActive 
                                                  ? 'bg-slate-100 text-slate-900 font-medium' 
                                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                              }`}
                                            >
                                                {trial.title.replace(/Trial:|Study:/gi, '').trim()}
                                            </Link>
                                        )
                                    })}
                                 </div>
                              )}
                           </div>
                         )
                      })}
                    </div>
                 </div>
               ))}
               {trialOrphans.length > 0 && (
                  <div className="mt-4">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Other Trials</h3>
                      <div className="space-y-0.5">
                       {trialOrphans.map(t => {
                         const isActive = topicId === t.id;
                         return (
                          <Link 
                            key={t.id} 
                            to={`/trials/${t.id}?from=trials`} 
                            className={`block px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 truncate ${
                              isActive 
                                ? 'bg-slate-100 text-slate-900 font-medium' 
                                : 'text-slate-700 hover:bg-slate-50 font-normal'
                            }`}
                          >
                            {t.title}
                          </Link>
                         );
                       })}
                      </div>
                  </div>
               )}
             </>
          ) : (
            // RENDER LOGIC FOR GUIDE (Standard)
            sidebarContent.map(cat => {
              const isOpen = openCategory === cat.name;
              return (
              <div key={cat.name}>
                <button
                  onClick={() => toggleCategory(cat.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 group min-h-[40px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${
                    isOpen ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700 hover:bg-slate-50 font-normal'
                  }`}
                >
                   <span className="text-left uppercase tracking-wide">{cat.name}</span>
                   <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                   />
                </button>
                
                {isOpen && (
                    <div className="mt-0.5 space-y-0.5 pl-3 animate-in slide-in-from-top-1 fade-in duration-200">
                      {cat.items.map(topic => {
                        const isActive = topicId === topic.id;
                        return (
                        <Link
                          key={topic.id}
                          to={`/guide/${topic.id}?from=guide&category=${encodeURIComponent(cat.name)}`}
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors duration-150 truncate ${
                            isActive 
                              ? 'bg-slate-100 text-slate-900 font-medium' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {topic.title}
                        </Link>
                        );
                      })}
                    </div>
                )}
              </div>
            )})
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 min-w-0 ${!topicId ? 'hidden md:block' : ''}`}>
        {currentTopic ? (
          <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Link to={getBackPath()} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-neuro-500 mb-6 group">
                <div className="bg-white p-1.5 rounded-md border border-slate-200 mr-2 shadow-sm group-hover:shadow-md transition-colors duration-150"><ArrowLeft size={16} /></div>
                {source.category || getBackLabel()}
             </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="col-span-1 lg:col-span-9">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-12 min-h-[500px]">
                      {/* Topic Header */}
                      <div className="mb-8 md:mb-10 border-b border-slate-100 pb-8 md:pb-10">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border mb-4 inline-block ${isTrialMode ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-neuro-50 text-teal-500 border-neuro-100'}`}>
                            {currentTopic.category}
                         </span>
                         <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">{currentTopic.title}</h1>
                         
                         <div className="flex flex-wrap gap-3 mt-6">
                            {/* Hardcoded Primary Tools */}
                            {currentTopic.id === 'thrombectomy' && (
                                <Link to={`/calculators/evt-pathway?from=guide&category=${encodeURIComponent(currentTopic.category)}`} className="inline-flex items-center px-6 py-3 bg-neuro-500 text-white font-bold rounded-xl shadow-lg shadow-neuro-200 hover:bg-teal-500 transition-colors duration-150 active:scale-95 transform-gpu group">
                                    <Zap size={18} className="mr-2 fill-white" />
                                    Launch Thrombectomy Pathway
                                    <ChevronRight size={16} className="ml-2 opacity-60 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}

                            {currentTopic.id === 'status-epilepticus' && (
                                <Link to={`/calculators/se-pathway?from=guide&category=${encodeURIComponent(currentTopic.category)}`} className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-colors duration-150 active:scale-95 transform-gpu group">
                                    <Activity size={18} className="mr-2" />
                                    Launch Status Epilepticus Pathway
                                    <ChevronRight size={16} className="ml-2 opacity-60 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}

                            {/* Dynamic Referenced Tools */}
                            {backlinks.map(link => (
                                <Link 
                                    key={link.id} 
                                    to={`${link.url}${link.url.includes('?') ? '&' : '?'}from=guide&category=${encodeURIComponent(currentTopic.category)}`}
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
                               <div key={section.id} id={section.id} className="scroll-mt-20 md:scroll-mt-24 border-b border-slate-100 md:border-0 last:border-0 pb-2 md:pb-0">
                                   
                                   {/* Mobile Toggle Header */}
                                   <button 
                                      onClick={() => toggleSection(section.id)}
                                      className="w-full flex items-center justify-between py-4 md:hidden group text-left"
                                   >
                                      <span className="text-lg font-bold text-slate-900 flex items-center pr-4">
                                          <span className={`w-1.5 h-1.5 rounded-full mr-3 flex-shrink-0 ${isTrialMode ? 'bg-emerald-400' : 'bg-neuro-400'}`}></span>
                                          {section.title}
                                      </span>
                                      <div className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${isOpen ? 'bg-slate-100' : 'bg-transparent'}`}>
                                          <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                      </div>
                                   </button>

                                   {/* Desktop Static Header */}
                                   <h2 className="hidden md:flex items-center text-xl font-bold text-slate-900 mt-12 mb-6 pb-3 border-b border-slate-100">
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
                      <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                        <div className="inline-flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100/50">
                           <AlertCircle size={12} className="text-slate-400" />
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Decision Support Only • Not Medical Advice</span>
                        </div>
                      </div>
                  </div>
                </div>

                {/* Table of Contents (Desktop Only) */}
                <div className="hidden lg:block col-span-3 sticky top-6 self-start">
                    {sections.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                            <div className="p-4 border-b border-slate-50 bg-slate-50/80"><h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center"><List size={14} className={`mr-2 ${iconColor}`} />Contents</h3></div>
                            <nav className="max-h-[70vh] overflow-y-auto p-2 custom-scrollbar">
                                {sections.map((h, i) => (
                                    <button key={i} onClick={() => scrollToSection(h.id)} className="text-left w-full text-sm text-slate-600 hover:text-teal-500 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors duration-150 group flex items-start">
                                        <span className={`mt-1.5 mr-2 w-1.5 h-1.5 rounded-full ${isTrialMode ? 'bg-emerald-200 group-hover:bg-emerald-500' : 'bg-neuro-200 group-hover:bg-neuro-500'} flex-shrink-0`}></span>
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
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 min-h-[600px]">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 mb-8 max-w-md group overflow-hidden relative">
                <div className={`absolute inset-0 opacity-20 bg-gradient-to-tr ${isTrialMode ? 'from-emerald-100' : 'from-neuro-100'}`}></div>
                <div className="relative z-10">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border ${isTrialMode ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-neuro-50 text-neuro-500 border-neuro-100'}`}>
                        {isTrialMode ? <FlaskConical size={48} /> : <Stethoscope size={48} />}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">{isTrialMode ? 'Landmark Trials' : 'Resident Guide'}</h1>
                    <p className="text-slate-500 leading-relaxed">Select a topic from the sidebar to view detailed clinical protocols and evidence summaries.</p>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentGuide;
