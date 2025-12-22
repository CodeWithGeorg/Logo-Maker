
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LogoUploader from './components/LogoUploader';
import { generateAiLogo } from './services/geminiService';
import { AppStatus, GenerationHistoryItem, AppMode } from './types';

interface ModeState {
  images: string[];
  prompt: string;
  result: string | null;
  error: string | null;
}

const DESIGN_MESSAGES = [
  "Auditing visual weight...",
  "Applying geometric constraints...",
  "Balancing kerning & spacing...",
  "Synthesizing negative space...",
  "Checking brand scalability...",
  "Enforcing golden ratio principles...",
  "Polishing final render..."
];

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('modernize');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [loadingMessage, setLoadingMessage] = useState(DESIGN_MESSAGES[0]);
  const [darkMode, setDarkMode] = useState(false);

  // Independent state for Modernize (Brand Revival)
  const [modernizeState, setModernizeState] = useState<ModeState>({
    images: [],
    prompt: '',
    result: null,
    error: null
  });

  // Independent state for Create (Forge Identity)
  const [createState, setCreateState] = useState<ModeState>({
    images: [],
    prompt: '',
    result: null,
    error: null
  });

  const activeState = mode === 'modernize' ? modernizeState : createState;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    let interval: any;
    if (status === AppStatus.LOADING) {
      let idx = 0;
      interval = setInterval(() => {
        idx = (idx + 1) % DESIGN_MESSAGES.length;
        setLoadingMessage(DESIGN_MESSAGES[idx]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const updateActiveState = (updates: Partial<ModeState>) => {
    if (mode === 'modernize') {
      setModernizeState(prev => ({ ...prev, ...updates }));
    } else {
      setCreateState(prev => ({ ...prev, ...updates }));
    }
  };

  const handleGenerate = async () => {
    const currentImages = activeState.images;
    const currentPrompt = activeState.prompt;

    if (mode === 'modernize' && currentImages.length === 0) {
      updateActiveState({ error: "To revive your brand, please share your existing logo or sketch." });
      return;
    }
    if (mode === 'create' && !currentPrompt && currentImages.length === 0) {
      updateActiveState({ error: "Tell us about your vision so we can begin the design process." });
      return;
    }

    setStatus(AppStatus.LOADING);
    updateActiveState({ error: null });

    try {
      const result = await generateAiLogo(mode, currentPrompt, currentImages);
      updateActiveState({ result, error: null });
      setStatus(AppStatus.SUCCESS);
      
      const newItem: GenerationHistoryItem = {
        id: Date.now().toString(),
        originalImages: [...currentImages],
        generatedImage: result,
        prompt: currentPrompt || (mode === 'modernize' ? 'Brand Revival' : 'Forge Identity'),
        mode: mode,
        timestamp: Date.now(),
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10));
      
      if (window.innerWidth < 1024) {
        document.getElementById('result-preview')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error(err);
      let displayError = err.message || 'The creative engine hit an unexpected obstacle.';
      updateActiveState({ error: displayError });
      setStatus(AppStatus.ERROR);
    }
  };

  const handleImagesChange = (images: string[]) => {
    updateActiveState({ images, error: null });
  };

  const handlePromptChange = (prompt: string) => {
    updateActiveState({ prompt, error: null });
  };

  const toggleMode = (newMode: AppMode) => {
    setMode(newMode);
    setStatus(AppStatus.IDLE);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-[#FDFDFE]'}`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 w-full">
        {/* Mode Switcher */}
        <div className="flex justify-center mb-10 md:mb-16">
          <div className={`p-1.5 rounded-3xl shadow-inner flex w-full max-w-sm border backdrop-blur-sm transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200/50'}`}>
            <button
              onClick={() => toggleMode('modernize')}
              className={`flex-1 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                mode === 'modernize' 
                  ? (darkMode ? 'bg-slate-800 text-indigo-400 shadow-sm ring-1 ring-slate-700' : 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200') 
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <i className="fas fa-magic text-[10px]"></i>
              Brand Revival
            </button>
            <button
              onClick={() => toggleMode('create')}
              className={`flex-1 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                mode === 'create' 
                  ? (darkMode ? 'bg-slate-800 text-indigo-400 shadow-sm ring-1 ring-slate-700' : 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200')
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <i className="fas fa-compass text-[10px]"></i>
              Forge Identity
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-20 max-w-4xl mx-auto">
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tighter leading-[1.1] animate-in fade-in slide-in-from-top-4 duration-1000 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {mode === 'modernize' ? (
              <>Evolve Your <span className="text-indigo-600 bg-clip-text">Visual Legacy</span></>
            ) : (
              <>Design Your <span className="text-indigo-600">Future Brand</span></>
            )}
          </h1>
          <p className={`text-base sm:text-lg md:text-xl font-medium leading-relaxed px-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {mode === 'modernize' 
              ? "Professional restoration for heritage brands. We transform outdated marks into high-fidelity symbols with perfect geometric precision."
              : "Bridging the gap between imagination and identity. Synthesis your sketches and ideas into world-class professional branding."}
          </p>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-14 mb-16">
          <div className="space-y-8">
            <div className={`p-6 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border relative overflow-hidden transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <i className={`fas fa-pencil-ruler text-8xl -rotate-12 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}></i>
              </div>
              
              <div className="mb-8 relative z-10">
                <LogoUploader 
                  onImagesChange={handleImagesChange} 
                  selectedImages={activeState.images} 
                  darkMode={darkMode}
                />
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${darkMode ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                      <i className="fas fa-comment-alt"></i>
                    </span>
                    {mode === 'modernize' ? "Style Guidance" : "Creative Brief"}
                  </h3>
                </div>
                <textarea
                  value={activeState.prompt}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  placeholder={mode === 'modernize' 
                    ? "Guide the revival: 'Keep the icon but modernize the typeface', 'Enhance the geometric symmetry'..." 
                    : "Articulate your vision: 'A minimalist falcon representing speed and precision in cloud computing'..."}
                  className={`w-full h-32 md:h-40 p-5 rounded-2xl border focus:ring-2 outline-none resize-none text-sm md:text-base font-medium transition-all ${darkMode ? 'bg-slate-800/50 border-slate-700 text-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-600' : 'bg-slate-50/30 border-slate-200 text-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400'}`}
                />
              </div>

              <div className="mt-8">
                <button
                  onClick={handleGenerate}
                  disabled={status === AppStatus.LOADING}
                  className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg active:scale-95
                    ${status === AppStatus.LOADING 
                      ? (darkMode ? 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none') 
                      : (darkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/40' : 'bg-slate-900 text-white hover:bg-black hover:shadow-indigo-500/20')
                    }
                  `}
                >
                  {status === AppStatus.LOADING ? (
                    <>
                      <div className={`w-5 h-5 border-2 rounded-full animate-spin ${darkMode ? 'border-slate-600 border-t-indigo-400' : 'border-slate-300 border-t-slate-500'}`}></div>
                      Perfecting Design...
                    </>
                  ) : (
                    <>
                      <i className={mode === 'modernize' ? "fas fa-magic" : "fas fa-sparkles text-indigo-400"}></i>
                      {mode === 'modernize' ? "Revive Identity" : "Generate Brand"}
                    </>
                  )}
                </button>
              </div>

              {activeState.error && (
                <div className={`mt-6 p-4 text-sm rounded-2xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${darkMode ? 'bg-red-900/20 text-red-400 border-red-900/30' : 'bg-red-50 text-red-700 border-red-100'}`}>
                  <i className="fas fa-exclamation-triangle mt-1"></i>
                  <span className="font-medium">{activeState.error}</span>
                </div>
              )}
            </div>
          </div>

          <div id="result-preview">
            <div className={`p-6 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col h-full min-h-[500px] transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${darkMode ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    <i className="fas fa-eye"></i>
                  </span>
                  Visual Preview
                </h3>
                {activeState.result && (
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${darkMode ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-500'}`}>4K Architectural Render</span>
                )}
              </div>

              <div className={`flex-grow flex items-center justify-center rounded-3xl border-2 border-dashed overflow-hidden relative group transition-all ${darkMode ? 'bg-slate-800/20 border-slate-700' : 'bg-slate-50/50 border-slate-200/60'}`}>
                {status === AppStatus.LOADING && (
                  <div className={`absolute inset-0 z-10 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 ${darkMode ? 'bg-slate-900/95' : 'bg-white/95'}`}>
                    <div className="relative mb-6">
                      <div className={`w-16 h-16 border-[3px] rounded-full animate-spin ${darkMode ? 'border-slate-800 border-t-indigo-500' : 'border-indigo-100 border-t-indigo-600'}`}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className={`fas fa-bezier-curve text-xl animate-pulse ${darkMode ? 'text-indigo-400/30' : 'text-indigo-600/30'}`}></i>
                      </div>
                    </div>
                    <p className={`font-bold text-xl mb-2 tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{loadingMessage}</p>
                    <p className="text-slate-400 text-sm font-medium">Refining visual nodes for maximum clarity.</p>
                  </div>
                )}

                {activeState.result ? (
                  <div className="w-full h-full p-6 md:p-10 flex flex-col items-center">
                    <div className="flex-grow flex items-center justify-center w-full group/image relative">
                      <img 
                        src={activeState.result} 
                        alt="Brand Output" 
                        className="max-w-full max-h-[350px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in zoom-in-95 fade-in duration-1000"
                      />
                      <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover/image:opacity-100 transition-opacity pointer-events-none rounded-2xl"></div>
                    </div>
                    
                    <div className="mt-8 w-full animate-in slide-in-from-bottom-4 duration-700">
                      <a 
                        href={activeState.result} 
                        download={`${mode}-brand-${Date.now()}.png`}
                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${darkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20' : 'bg-slate-900 text-white hover:bg-black'}`}
                      >
                        <i className="fas fa-cloud-download-alt text-lg"></i>
                        Export Master File
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-12 opacity-40">
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-12 transition-all ${darkMode ? 'bg-slate-800 text-slate-700' : 'bg-slate-100 text-slate-300'}`}>
                      <i className="fas fa-bezier-curve text-4xl"></i>
                    </div>
                    <p className={`font-bold text-lg mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Awaiting Brief</p>
                    <p className="text-slate-400 text-sm max-w-[200px] mx-auto">Upload your references to begin the master studio process.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Process Section */}
        <section id="process" className="py-20 md:py-32 scroll-mt-20">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-black mb-4 tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>Architectural Quality Process</h2>
            <p className="text-slate-400 font-medium max-w-xl mx-auto">Eliminating AI artifacts through strict geometric constraints.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "fa-fingerprint", title: "DNA Reconstruction", desc: "Identifying essential brand marks to preserve legacy while removing technical debt." },
              { icon: "fa-draw-polygon", title: "Geometric Synthesis", desc: "Strict adherence to mathematical symmetry and golden ratio principles." },
              { icon: "fa-crown", title: "Premium Refinement", desc: "4K rendering with high-contrast isolation for immediate professional use." }
            ].map((step, i) => (
              <div key={i} className={`p-8 rounded-[2rem] border transition-all hover:-translate-y-2 ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-100 hover:border-indigo-500/20'}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl mb-6 shadow-lg ${darkMode ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-600 text-white'}`}>
                  <i className={`fas ${step.icon}`}></i>
                </div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{step.title}</h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Gallery Section */}
        {history.length > 0 && (
          <div id="gallery" className="mt-20 md:mt-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 scroll-mt-24">
            <h2 className={`text-2xl md:text-3xl font-black flex items-center gap-3 tracking-tighter mb-10 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm shadow-lg ${darkMode ? 'bg-indigo-600 text-white shadow-indigo-900/40' : 'bg-indigo-600 text-white shadow-indigo-200'}`}>
                <i className="fas fa-history"></i>
              </span>
              Studio Archives
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
              {history.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className={`aspect-square rounded-[2rem] overflow-hidden border flex items-center justify-center p-6 relative transition-all duration-500 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/30' : 'bg-white border-slate-100'}`}>
                    <img src={item.generatedImage} alt="Archive" className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="mt-4 px-2">
                    <p className={`text-xs font-bold truncate leading-tight ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.prompt}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer id="support" className={`border-t py-12 md:py-20 transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="text-center md:text-left">
              <p className={`font-black text-xl mb-2 tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>LogoModernizer<span className="text-indigo-600">AI</span></p>
              <p className="text-slate-400 text-sm font-medium max-w-sm">Engineered for heritage brands seeking perfect architectural visual presence.</p>
            </div>
            <div className="flex justify-center md:justify-end gap-6 text-slate-400">
              <a href="#" className={`w-10 h-10 rounded-full border flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}><i className="fab fa-twitter text-sm"></i></a>
              <a href="#" className={`w-10 h-10 rounded-full border flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}><i className="fab fa-dribbble text-sm"></i></a>
              <a href="#" className={`w-10 h-10 rounded-full border flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}><i className="fab fa-linkedin-in text-sm"></i></a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 text-center">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Crafted by Gemini 2.5 Creative Engine &bull; Est. 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
