
import React, { useState } from 'react';
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

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('modernize');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);

  // Independent state for Modernize
  const [modernizeState, setModernizeState] = useState<ModeState>({
    images: [],
    prompt: '',
    result: null,
    error: null
  });

  // Independent state for Create
  const [createState, setCreateState] = useState<ModeState>({
    images: [],
    prompt: '',
    result: null,
    error: null
  });

  const activeState = mode === 'modernize' ? modernizeState : createState;

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
      updateActiveState({ error: "Please upload at least one original logo to modernize." });
      return;
    }
    if (mode === 'create' && !currentPrompt && currentImages.length === 0) {
      updateActiveState({ error: "Please provide a description or image references for your new logo." });
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
        prompt: currentPrompt || (mode === 'modernize' ? 'Modernized Logo' : 'AI Generated Logo'),
        mode: mode,
        timestamp: Date.now(),
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10));
      
      if (window.innerWidth < 1024) {
        document.getElementById('result-preview')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error(err);
      
      let displayError = err.message || 'An unexpected error occurred during generation.';
      if (displayError.includes('429') || displayError.toLowerCase().includes('quota')) {
        displayError = "Our AI designer needs a quick breather. 🧘 We're experiencing high demand right now—please wait about a minute and try again. Thanks for your patience!";
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 w-full">
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 flex w-full max-w-sm">
            <button
              onClick={() => toggleMode('modernize')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                mode === 'modernize' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <i className="fas fa-magic"></i>
              Modernize
            </button>
            <button
              onClick={() => toggleMode('create')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                mode === 'create' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <i className="fas fa-plus"></i>
              Create New
            </button>
          </div>
        </div>

        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 md:mb-4 tracking-tight leading-tight">
            {mode === 'modernize' ? (
              <>Restore Your <span className="text-indigo-600">Vintage Brand</span></>
            ) : (
              <>Design a <span className="text-indigo-600">Fresh Identity</span></>
            )}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-4">
            {mode === 'modernize' 
              ? "Recreate old or blurry logos with professional, crisp precision using advanced AI."
              : "Combine up to 5 reference images and sketches to craft a unique, professional identity."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 mb-12">
          <div className="space-y-6 order-1">
            <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <div className="mb-6 md:mb-8">
                <LogoUploader 
                  onImagesChange={handleImagesChange} 
                  selectedImages={activeState.images} 
                />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                  <i className="fas fa-pen-nib text-indigo-500"></i>
                  {mode === 'modernize' ? "Style Adjustments" : "Prompt & Tags"}
                </h3>
                <textarea
                  value={activeState.prompt}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  placeholder={mode === 'modernize' 
                    ? "e.g., Use more vibrant blues, make the text bolder..." 
                    : "e.g., A minimalist geometric fox. Style: Flat design. Tags: #Tech #Agile #Orange"}
                  className="w-full h-28 md:h-32 p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none text-sm md:text-base text-slate-700 bg-slate-50/50"
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGenerate}
                  disabled={status === AppStatus.LOADING}
                  className={`w-full py-4 rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95
                    ${status === AppStatus.LOADING 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }
                  `}
                >
                  {status === AppStatus.LOADING ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className={mode === 'modernize' ? "fas fa-sync" : "fas fa-sparkles"}></i>
                      {mode === 'modernize' ? "Regenerate Logo" : "Generate Logo"}
                    </>
                  )}
                </button>
              </div>

              {activeState.error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 text-xs sm:text-sm rounded-xl border border-red-100 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                  <i className="fas fa-circle-exclamation mt-0.5"></i>
                  <span>{activeState.error}</span>
                </div>
              )}
            </div>
          </div>

          <div id="result-preview" className="order-2 lg:order-2">
            <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col h-full min-h-[400px] md:min-h-[500px]">
              <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fas fa-eye text-indigo-500"></i>
                Preview Result
              </h3>

              <div className="flex-grow flex items-center justify-center bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden relative">
                {status === AppStatus.LOADING && (
                  <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-800 font-bold text-lg mb-1">AI Designer at Work</p>
                    <p className="text-slate-500 text-xs md:text-sm">Processing current request...</p>
                  </div>
                )}

                {activeState.result ? (
                  <div className="w-full h-full p-4 md:p-6 flex flex-col items-center">
                    <div className="flex-grow flex items-center justify-center w-full">
                      <img 
                        src={activeState.result} 
                        alt="AI Generated Logo" 
                        className="max-w-full max-h-[300px] md:max-h-[350px] object-contain drop-shadow-2xl animate-in zoom-in duration-500"
                      />
                    </div>
                    <div className="mt-6 w-full">
                      <a 
                        href={activeState.result} 
                        download={`${mode}-logo-${Date.now()}.png`}
                        className="w-full bg-slate-900 text-white py-3.5 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95"
                      >
                        <i className="fas fa-download"></i> Download HQ
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-12 opacity-30">
                    <i className="fas fa-drafting-compass text-5xl md:text-6xl mb-4 text-slate-300"></i>
                    <p className="text-slate-500 font-medium text-sm md:text-base">
                      {mode === 'modernize' ? 'Upload your logo to begin' : 'Describe your vision to begin'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-12 md:mt-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <i className="fas fa-layer-group text-indigo-500"></i>
                Recent Creations
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {history.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="aspect-square bg-slate-50 flex items-center justify-center p-3 relative">
                    <img src={item.generatedImage} alt="Logo" className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
                    <div className="absolute top-1.5 left-1.5 flex gap-1">
                      <span className={`text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        item.mode === 'modernize' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.mode}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 md:p-4 bg-white border-t border-slate-100">
                    <p className="text-xs md:text-sm font-semibold text-slate-800 truncate mb-1">{item.prompt}</p>
                    <p className="text-[8px] md:text-[10px] text-slate-400 font-medium">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 md:py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-xs md:text-sm mb-4">
            Powered by <span className="font-bold text-indigo-600">Gemini 2.5 Flash Image</span> &bull; Professional AI Branding
          </p>
          <div className="flex justify-center gap-4 text-slate-400">
            <a href="#" className="hover:text-indigo-600 transition-colors"><i className="fab fa-twitter"></i></a>
            <a href="#" className="hover:text-indigo-600 transition-colors"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
