
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

  // Sidebar grouping logic based on mode
  const sidebarContent = useMemo(() => {
    const topics = Object.values(GUIDE_CONTENT).filter(t => 
      isTrialMode ? t.category === 'Neuro Trials' : t.category !== 'Neuro Trials'
    );
    
    const cats = Array.from(new Set(topics.map(t => t.category)));
    
    // Sort logic
    return cats.sort((a, b) => {
      if (a === 'Vascular Neurology') return -1;
      return a.localeCompare(b);
    }).map(cat => ({
      name: cat,
      items: topics.filter(t => t.category === cat)
    }));
  }, [isTrialMode]);

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
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const headings = useMemo(() => {
    return currentTopic
    ? currentTopic.content.match(/^##\s+(.+)$/gm)?.map((h) => {
        const text = h.replace(/^##\s+/, '');
        const cleanText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        return { text: cleanText, id: generateSlug(cleanText) };
      }) || []
    : [];
  }, [currentTopic]);

  const sections = useMemo(() => {
    if (!currentTopic) return [];
    const lines = currentTopic.content.split('\n');
    const result: { title: string; content: string; id: string }[] = [];
    let currentTitle = "Overview";
    let currentContent: string[] = [];

    const cleanTitle = (t: string) => t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[\*`]/g, '');

    lines.forEach((line, index) => {
      if (line.startsWith('## ')) {
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
    
    if (currentContent.length > 0 || currentTitle !== "Overview") {
        result.push({
            title: cleanTitle(currentTitle),
            content: currentContent.join('\n'),
            id: generateSlug(cleanTitle(currentTitle))
        });
    }
    return result.filter(s => s.title !== "Overview" || s.content.trim().length > 0);
  }, [currentTopic]);

  const themeClass = isTrialMode ? 'emerald' : 'neuro';
  const iconColor = isTrialMode ? 'text-emerald-600' : 'text-neuro-600';
  const activeBg = isTrialMode ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-neuro-50 text-neuro-700 ring-neuro-100';

  const markdownComponents = {
    h2: ({children}: any) => {
        const id = generateSlug(children?.toString() || '');
        return (
            <h2 id={id} className="group flex items-center text-xl font-bold text-slate-900 mt-12 mb-6 scroll-mt-24 pb-3 border-b border-gray-100">
                <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${isTrialMode ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 'bg-neuro-50 text-neuro-600 ring-neuro-100'} mr-3 group-hover:scale-110 transition-transform shadow-sm ring-1`}>
                    <ChevronRight size={18} strokeWidth={3} />
                </span>
                {children}
            </h2>
        );
    },
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
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex-shrink-0 md:sticky md:top-0 md:h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar self-start">
        <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-10 backdrop-blur-sm bg-white/95">
            <h2 className="font-bold text-slate-900 flex items-center text-lg">
              {isTrialMode ? <FlaskConical className={`mr-2 ${iconColor}`} size={24} /> : <Stethoscope className={`mr-2 ${iconColor}`} size={24} />}
              {isTrialMode ? 'Neuro Trials' : 'Resident Guide'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 ml-8">{isTrialMode ? 'Evidence pearls' : 'Clinical protocols'}</p>
        </div>
        <div className="p-4 space-y-8">
          {sidebarContent.map(cat => (
            <div key={cat.name}>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">{cat.name}</h3>
              <div className="space-y-1">
                {cat.items.map(topic => (
                  <Link
                    key={topic.id}
                    to={isTrialMode ? `/trials/${topic.id}` : `/guide/${topic.id}`}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      topicId === topic.id ? activeBg + ' font-semibold shadow-sm ring-1' : 'text-slate-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{topic.title}</span>
                    <ChevronRight size={14} className={topicId === topic.id ? (isTrialMode ? 'text-emerald-500' : 'text-neuro-500') : 'opacity-0 group-hover:opacity-100'} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {currentTopic ? (
          <div className="max-w-6xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Link to={isTrialMode ? "/trials" : "/guide"} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-neuro-600 mb-6 group">
                <div className="bg-white p-1.5 rounded-md border border-gray-200 mr-2 shadow-sm group-hover:shadow-md transition-all"><ArrowLeft size={16} /></div>
                Back to {isTrialMode ? 'Trials' : 'Guide'} Index
             </Link>

            <div className="hidden lg:grid grid-cols-12 gap-10 items-start">
                <div className="col-span-9">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 min-h-[500px]">
                      <div className="mb-10 border-b border-gray-100 pb-10">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border mb-4 inline-block ${isTrialMode ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-neuro-50 text-neuro-700 border-neuro-100'}`}>
                            {currentTopic.category}
                         </span>
                         <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">{currentTopic.title}</h1>
                      </div>
                      <ReactMarkdown components={markdownComponents as any}>{currentTopic.content}</ReactMarkdown>
                  </div>
                </div>

                <div className="col-span-3 sticky top-6 self-start">
                    {headings.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-50 bg-gray-50/80"><h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center"><List size={14} className={`mr-2 ${iconColor}`} />Contents</h3></div>
                            <nav className="max-h-[70vh] overflow-y-auto p-2 custom-scrollbar">
                                {headings.map((h, i) => (
                                    <button key={i} onClick={() => scrollToSection(h.id)} className="text-left w-full text-sm text-slate-600 hover:text-neuro-700 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all group flex items-start">
                                        <span className={`mt-1.5 mr-2 w-1.5 h-1.5 rounded-full ${isTrialMode ? 'bg-emerald-200 group-hover:bg-emerald-500' : 'bg-neuro-200 group-hover:bg-neuro-500'} flex-shrink-0`}></span>
                                        <span className="truncate leading-tight">{h.text}</span>
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
