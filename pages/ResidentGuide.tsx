
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChevronRight, ArrowLeft, ArrowUp, List, ChevronDown, ExternalLink, Stethoscope, FlaskConical } from 'lucide-react';
import { GUIDE_CONTENT } from '../data/guideContent';

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

const ResidentGuide: React.FC<ResidentGuideProps> = ({ context = 'guide' }) => {
  const { topicId } = useParams<{ topicId: string }>();
  const isTrialMode = context === 'trials';
  
  const currentTopic = topicId ? GUIDE_CONTENT[topicId] : null;

  // --- Sidebar Logic ---
  const sidebarContent = useMemo(() => {
    const topics = Object.values(GUIDE_CONTENT).filter(t => 
      isTrialMode ? t.category === 'Neuro Trials' : t.category !== 'Neuro Trials'
    );
    
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
    
    // Sort logic
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

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // Initialize sidebar expansion
  useEffect(() => {
    if (sidebarContent.length === 0) return;
    if (topicId) {
      const activeCat = sidebarContent.find(c => c.items.some(i => i.id === topicId));
      if (activeCat) {
        setOpenCategories(prev => ({ ...prev, [activeCat.name]: true }));
      }
    } else {
      setOpenCategories(prev => {
           if (Object.keys(prev).length === 0) {
               return { [sidebarContent[0].name]: true };
           }
           return prev;
       });
    }
  }, [topicId, sidebarContent]);

  // Scroll to top when topic changes
  useEffect(() => {
    const mainScroller = document.querySelector('main');
    if (mainScroller) {
        mainScroller.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [topicId]);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
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
        // Default: Open the first section on load for better mobile UX
        const initialState: Record<string, boolean> = {};
        sections.forEach((s, idx) => {
             // Open first section by default
             initialState[s.id] = idx === 0;
        });
        setExpandedSections(initialState);
    }
  }, [sections, topicId]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      // If clicking the one that is already open, close it (return empty).
      if (prev[id]) {
        return {};
      }
      // Otherwise, open this one and implicitely close all others by returning a new object with only this key.
      return { [id]: true };
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
    // If on mobile (accordion), ensure it's expanded
    if (window.innerWidth < 768) {
        // Force open this section and close others
        setExpandedSections({ [id]: true });
        
        // Small timeout to allow expansion animation before scroll
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } else {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const themeClass = isTrialMode ? 'emerald' : 'neuro';
  const iconColor = isTrialMode ? 'text-emerald-600' : 'text-neuro-600';
  const activeBg = isTrialMode ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-neuro-50 text-neuro-700 ring-neuro-100';

  const markdownComponents = {
    // H2 is handled by the section rendering logic now
    h3: ({children}: any) => (
        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4 flex items-center">
             <span className={`w-1.5 h-1.5 ${isTrialMode ? 'bg-emerald-300' : 'bg-neuro-300'} rounded-full mr-3`}></span>
             {children}
        </h3>
    ),
    p: ({children}: any) => <p className="text-slate-600 leading-8 mb-6 font-normal text-base">{children}</p>,
    ul: ({children}: any) => <ul className="space-y-4 mb-8">{children}</ul>,
    li: ({children}: any) => (
        <li className="flex items-start text-slate-600 leading-7">
             <div className="mt-2.5 mr-3 flex-shrink-0">
                  <div className={`w-1.5 h-1.5 rounded-full ${isTrialMode ? 'bg-emerald-400' : 'bg-neuro-400'}`}></div>
             </div>
             <div className="flex-1">{children}</div>
        </li>
    ),
    blockquote: ({children}: any) => (
        <blockquote className={`border-l-4 ${isTrialMode ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-neuro-500 bg-neuro-50 text-neuro-900'} p-6 rounded-r-xl italic my-8 shadow-sm`}>
            {children}
        </blockquote>
    ),
    a: ({href, children}: any) => {
        const baseClass = `font-semibold underline decoration-2 underline-offset-4 transition-all ${isTrialMode ? 'text-emerald-600 hover:text-emerald-800 decoration-emerald-200' : 'text-neuro-600 hover:text-neuro-800 decoration-neuro-200'}`;
        if (href?.startsWith('/')) return <Link to={href} className={baseClass}>{children}</Link>;
        return <a href={href} className={`inline-flex items-center ${baseClass}`}>{children} <ExternalLink size={12} className="ml-1 opacity-50" /></a>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row relative items-start">
      {/* Sidebar */}
      <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex-shrink-0 md:sticky md:top-0 md:h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar self-start ${topicId ? 'hidden md:block' : ''}`}>
        <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-10 backdrop-blur-sm bg-white/95">
            <h2 className="font-bold text-slate-900 flex items-center text-lg">
              {isTrialMode ? <FlaskConical className={`mr-2 ${iconColor}`} size={24} /> : <Stethoscope className={`mr-2 ${iconColor}`} size={24} />}
              {isTrialMode ? 'Neuro Trials' : 'Resident Guide'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 ml-8">{isTrialMode ? 'Evidence pearls' : 'Clinical protocols'}</p>
        </div>
        <div className="p-4 space-y-1">
          {sidebarContent.map(cat => {
            const isOpen = openCategories[cat.name];
            return (
            <div key={cat.name} className="border-b border-gray-50 last:border-0 pb-2 mb-2">
              <button
                onClick={() => toggleCategory(cat.name)}
                className="w-full flex items-center justify-between px-3 py-3 text-left group hover:bg-slate-50 rounded-lg transition-colors"
              >
                 <span className="text-sm font-bold text-slate-800 uppercase tracking-wide group-hover:text-neuro-600 transition-colors">
                    {cat.name}
                 </span>
                 <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                 />
              </button>
              
              {isOpen && (
                  <div className="space-y-1 mt-1 pl-2 animate-in slide-in-from-top-1 fade-in duration-200">
                    {cat.items.map(topic => (
                      <Link
                        key={topic.id}
                        to={isTrialMode ? `/trials/${topic.id}` : `/guide/${topic.id}`}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                          topicId === topic.id ? activeBg + ' font-semibold shadow-sm ring-1' : 'text-slate-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="truncate">{topic.title}</span>
                        {topicId === topic.id && <ChevronRight size={14} className={isTrialMode ? 'text-emerald-500' : 'text-neuro-500'} />}
                      </Link>
                    ))}
                  </div>
              )}
            </div>
          )})}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 min-w-0 ${!topicId ? 'hidden md:block' : ''}`}>
        {currentTopic ? (
          <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Link to={isTrialMode ? "/trials" : "/guide"} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-neuro-600 mb-6 group">
                <div className="bg-white p-1.5 rounded-md border border-gray-200 mr-2 shadow-sm group-hover:shadow-md transition-all"><ArrowLeft size={16} /></div>
                Back to {isTrialMode ? 'Trials' : 'Guide'} Index
             </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="col-span-1 lg:col-span-9">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-12 min-h-[500px]">
                      {/* Topic Header */}
                      <div className="mb-8 md:mb-10 border-b border-gray-100 pb-8 md:pb-10">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border mb-4 inline-block ${isTrialMode ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-neuro-50 text-neuro-700 border-neuro-100'}`}>
                            {currentTopic.category}
                         </span>
                         <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">{currentTopic.title}</h1>
                      </div>

                      {/* Content Sections (Accordion on Mobile, Full on Desktop) */}
                      <div className="space-y-2 md:space-y-0">
                          {sections.map((section) => {
                             const isOpen = expandedSections[section.id];
                             return (
                               <div key={section.id} id={section.id} className="scroll-mt-24 border-b border-gray-100 md:border-0 last:border-0 pb-2 md:pb-0">
                                   
                                   {/* Mobile Toggle Header */}
                                   <button 
                                      onClick={() => toggleSection(section.id)}
                                      className="w-full flex items-center justify-between py-4 md:hidden group text-left"
                                   >
                                      <span className="text-lg font-bold text-slate-900 flex items-center pr-4">
                                          <span className={`w-1.5 h-1.5 rounded-full mr-3 flex-shrink-0 ${isTrialMode ? 'bg-emerald-400' : 'bg-neuro-400'}`}></span>
                                          {section.title}
                                      </span>
                                      <div className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${isOpen ? 'bg-gray-100' : 'bg-transparent'}`}>
                                          <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                      </div>
                                   </button>

                                   {/* Desktop Static Header */}
                                   <h2 className="hidden md:flex items-center text-xl font-bold text-slate-900 mt-12 mb-6 pb-3 border-b border-gray-100">
                                      <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${isTrialMode ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 'bg-neuro-50 text-neuro-600 ring-neuro-100'} mr-3 shadow-sm ring-1`}>
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
                  </div>
                </div>

                {/* Table of Contents (Desktop Only) */}
                <div className="hidden lg:block col-span-3 sticky top-6 self-start">
                    {sections.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-50 bg-gray-50/80"><h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center"><List size={14} className={`mr-2 ${iconColor}`} />Contents</h3></div>
                            <nav className="max-h-[70vh] overflow-y-auto p-2 custom-scrollbar">
                                {sections.map((h, i) => (
                                    <button key={i} onClick={() => scrollToSection(h.id)} className="text-left w-full text-sm text-slate-600 hover:text-neuro-700 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all group flex items-start">
                                        <span className={`mt-1.5 mr-2 w-1.5 h-1.5 rounded-full ${isTrialMode ? 'bg-emerald-200 group-hover:bg-emerald-500' : 'bg-neuro-200 group-hover:bg-neuro-500'} flex-shrink-0`}></span>
                                        <span className="truncate leading-tight">{h.title}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </div>
            
            <button onClick={scrollToTop} className={`fixed bottom-8 right-8 ${isTrialMode ? 'bg-emerald-600' : 'bg-neuro-600'} text-white p-3 rounded-full shadow-xl hover:scale-110 transition-all z-50 ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}><ArrowUp size={24} /></button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 min-h-[600px]">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 mb-8 max-w-md group overflow-hidden relative">
                <div className={`absolute inset-0 opacity-20 bg-gradient-to-tr ${isTrialMode ? 'from-emerald-100' : 'from-neuro-100'}`}></div>
                <div className="relative z-10">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border ${isTrialMode ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-neuro-50 text-neuro-600 border-neuro-100'}`}>
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
