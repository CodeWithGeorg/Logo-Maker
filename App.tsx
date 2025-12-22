
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
  "Analyzing visual weight...",
  "Refining geometric symmetry...",
  "Balancing color harmony...",
  "Polishing vector paths...",
  "Optimizing for scalability...",
  "Synthesizing brand essence..."
];

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('modernize');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [loadingMessage, setLoadingMessage] = useState(DESIGN_MESSAGES[0]);

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

  // Cycle through humanized loading messages
  useEffect(() => {
    let interval: any;
    if (status === AppStatus.LOADING) {
      let idx = 0;
      interval = setInterval(() => {
        idx = (idx + 1) % DESIGN_MESSAGES.length;
        setLoadingMessage(DESIGN_MESSAGES[idx]);
      }, 2500);
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
      updateActiveState({ error: "Tell us about your vision so we can begin the creative process." });
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
      let displayError = err.message || 'Our creative engines hit an unexpected snag.';
      if (displayError.includes('429') || displayError.toLowerCase().includes('quota')) {
        displayError = "Our studio is currently at peak capacity. Let's take a 60-second break before our next session. We appreciate your patience.";
      }
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
    <div className="min-h-screen flex flex-col bg-[#FDFDFE]">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 w-full">
        {/* Creative Intent Switcher */}
        <div className="flex justify-center mb-10 md:mb-16">
          <div className="bg-slate-100 p-1.5 rounded-3xl shadow-inner flex w-full max-w-sm border border-slate-200/50 backdrop-blur-sm">
            <button
              onClick={() => toggleMode('modernize')}
              className={`flex-1 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                mode === 'modernize' 
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <i className="fas fa-leaf text-[10px]"></i>
              Brand Revival
            </button>
            <button
              onClick={() => toggleMode('create')}
              className={`flex-1 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                mode === 'create' 
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <i className="fas fa-compass text-[10px]"></i>
              Forge Identity
            </button>
          </div>
        </div>

        {/* Dynamic Hero Section */}
        <div className="text-center mb-12 md:mb-20 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-[1.1] animate-in fade-in slide-in-from-top-4 duration-1000">
            {mode === 'modernize' ? (
              <>Evolve Your <span className="text-indigo-600 bg-clip-text">Visual Legacy</span></>
            ) : (
              <>Design Your <span className="text-indigo-600">Future Brand</span></>
            )}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-500 font-medium leading-relaxed px-4">
            {mode === 'modernize' 
              ? "Professional restoration for heritage brands. We transform outdated marks into high-fidelity symbols while preserving your story."
              : "Bridging the gap between imagination and identity. Synthesis your sketches and ideas into professional-grade branding."}
          </p>
        </div>

        {/* Creative Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-14 mb-16">
          {/* Left: Strategic Inputs */}
          <div className="space-y-8">
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <i className="fas fa-pencil-ruler text-8xl -rotate-12"></i>
              </div>
              
              <div className="mb-8 relative z-10">
                <LogoUploader 
                  onImagesChange={handleImagesChange} 
                  selectedImages={activeState.images} 
                />
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs">
                      <i className="fas fa-comment-alt"></i>
                    </span>
                    {mode === 'modernize' ? "Style Guidance" : "Creative Brief"}
                  </h3>
                  {mode === 'create' && (
                    <div className="flex gap-2">
                      <button onClick={() => handlePromptChange(activeState.prompt + " Minimalist")} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded hover:bg-indigo-50 hover:text-indigo-600 transition-colors">#Minimalist</button>
                      <button onClick={() => handlePromptChange(activeState.prompt + " Modern")} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded hover:bg-indigo-50 hover:text-indigo-600 transition-colors">#Modern</button>
                    </div>
                  )}
                </div>
                <textarea
                  value={activeState.prompt}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  placeholder={mode === 'modernize' 
                    ? "Guide the revival: 'Keep the icon but modernize the typeface', 'Use a more professional palette'..." 
                    : "Articulate your vision: 'A geometric lion representing strength and digital security for a fintech firm'..."}
                  className="w-full h-32 md:h-40 p-5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none text-sm md:text-base text-slate-700 bg-slate-50/30 font-medium placeholder:text-slate-400"
                />
              </div>

              <div className="mt-8">
                <button
                  onClick={handleGenerate}
                  disabled={status === AppStatus.LOADING}
                  className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg active:scale-95
                    ${status === AppStatus.LOADING 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-slate-900 text-white hover:bg-black hover:shadow-indigo-500/20'
                    }
                  `}
                >
                  {status === AppStatus.LOADING ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                      Creative Thinking...
                    </>
                  ) : (
                    <>
                      <i className={mode === 'modernize' ? "fas fa-magic" : "fas fa-sparkles text-indigo-400"}></i>
                      {mode === 'modernize' ? "Revive Identity" : "Generate Concept"}
                    </>
                  )}
                </button>
              </div>

              {activeState.error && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <i className="fas fa-info-circle mt-1"></i>
                  <span className="font-medium">{activeState.error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: The Reveal */}
          <div id="result-preview">
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-full min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs">
                    <i className="fas fa-eye"></i>
                  </span>
                  Visual Preview
                </h3>
                {activeState.result && (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-tighter">Rendered 4K</span>
                )}
              </div>

              <div className="flex-grow flex items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200/60 overflow-hidden relative group">
                {status === AppStatus.LOADING && (
                  <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fas fa-brain text-indigo-600/30 text-xl animate-pulse"></i>
                      </div>
                    </div>
                    <p className="text-slate-900 font-bold text-xl mb-2 tracking-tight">{loadingMessage}</p>
                    <p className="text-slate-400 text-sm font-medium">Please stand by while we craft your unique symbol.</p>
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
                    <div className="mt-10 w-full animate-in slide-in-from-bottom-4 duration-700">
                      <a 
                        href={activeState.result} 
                        download={`${mode}-brand-${Date.now()}.png`}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95"
                      >
                        <i className="fas fa-cloud-download-alt text-lg"></i>
                        Export Branding Package
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-12 opacity-40">
                    <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300 transform rotate-12">
                      <i className="fas fa-bezier-curve text-4xl"></i>
                    </div>
                    <p className="text-slate-500 font-bold text-lg mb-2">Awaiting Strategy</p>
                    <p className="text-slate-400 text-sm max-w-[200px] mx-auto">Upload your references and brief to ignite the creative process.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Studio History */}
        {history.length > 0 && (
          <div className="mt-20 md:mt-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
                <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-sm shadow-lg shadow-indigo-200">
                  <i className="fas fa-history"></i>
                </span>
                Studio Archives
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
              {history.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="aspect-square bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-500 flex items-center justify-center p-6 relative">
                    <img src={item.generatedImage} alt="Archive" className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4">
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-sm ${
                        item.mode === 'modernize' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {item.mode === 'modernize' ? 'Revival' : 'Forge'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 px-2">
                    <p className="text-xs font-bold text-slate-800 truncate leading-tight">{item.prompt}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="text-center md:text-left">
              <p className="text-slate-900 font-black text-xl mb-2 tracking-tighter">LogoModernizer<span className="text-indigo-600">AI</span></p>
              <p className="text-slate-400 text-sm font-medium max-w-sm">Built for visionary entrepreneurs and heritage brands seeking digital excellence.</p>
            </div>
            <div className="flex justify-center md:justify-end gap-6 text-slate-400">
              <a href="#" className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"><i className="fab fa-twitter text-sm"></i></a>
              <a href="#" className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"><i className="fab fa-dribbble text-sm"></i></a>
              <a href="#" className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"><i className="fab fa-linkedin-in text-sm"></i></a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-50 text-center">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Designed by Gemini 2.5 Creative Engine &bull; All Rights Reserved 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
