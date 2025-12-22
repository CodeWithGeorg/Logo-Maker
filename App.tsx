
import React, { useState } from 'react';
import Header from './components/Header';
import LogoUploader from './components/LogoUploader';
import { generateAiLogo } from './services/geminiService';
import { AppStatus, GenerationHistoryItem, AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('modernize');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);

  const handleGenerate = async () => {
    // In modernize mode, image is required. In create mode, prompt is required (or image as ref).
    if (mode === 'modernize' && !originalImage) {
      setError("Please upload an original logo to modernize.");
      return;
    }
    if (mode === 'create' && !prompt && !originalImage) {
      setError("Please provide a description or an image reference for your new logo.");
      return;
    }

    setStatus(AppStatus.LOADING);
    setError(null);

    try {
      const result = await generateAiLogo(mode, prompt, originalImage);
      setGeneratedImage(result);
      setStatus(AppStatus.SUCCESS);
      
      const newItem: GenerationHistoryItem = {
        id: Date.now().toString(),
        originalImage: originalImage || undefined,
        generatedImage: result,
        prompt: prompt || (mode === 'modernize' ? 'Modernized Logo' : 'AI Generated Logo'),
        mode: mode,
        timestamp: Date.now(),
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during generation.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleImageSelect = (base64: string) => {
    setOriginalImage(base64);
    setError(null);
  };

  const toggleMode = (newMode: AppMode) => {
    setMode(newMode);
    setError(null);
    setGeneratedImage(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Mode Switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 flex gap-1">
            <button
              onClick={() => toggleMode('modernize')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                mode === 'modernize' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <i className="fas fa-magic"></i>
              Modernize Existing
            </button>
            <button
              onClick={() => toggleMode('create')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                mode === 'create' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <i className="fas fa-plus"></i>
              Create New Logo
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {mode === 'modernize' ? (
              <>Restore Your <span className="text-indigo-600">Vintage Brand</span></>
            ) : (
              <>Design a <span className="text-indigo-600">Fresh Identity</span></>
            )}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {mode === 'modernize' 
              ? "Upload an old, low-res, or hand-drawn logo and let AI recreate it with professional, crisp precision."
              : "Describe your vision and watch our AI designer craft a unique, professional logo from thin air."}
          </p>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column: Inputs */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <div className="mb-8">
                <LogoUploader 
                  onImageSelect={handleImageSelect} 
                  selectedImage={originalImage} 
                />
                {mode === 'create' && (
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    <i className="fas fa-info-circle mr-1"></i> Uploading an image in "Create" mode uses it as a style reference.
                  </p>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <i className="fas fa-pen-nib text-indigo-500"></i>
                  {mode === 'modernize' ? "Style Adjustments" : "What kind of logo do you want?"}
                </h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode === 'modernize' 
                    ? "e.g., Use more vibrant blues, make the text bolder, add a metallic finish..." 
                    : "e.g., A minimalist geometric fox head for a tech startup called 'FireBolt'. Use orange and charcoal gray."}
                  className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none text-slate-700 bg-slate-50"
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGenerate}
                  disabled={status === AppStatus.LOADING}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
                    ${status === AppStatus.LOADING 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
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
                      {mode === 'modernize' ? "Regenerate Logo" : "Generate New Logo"}
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                  <i className="fas fa-circle-exclamation"></i>
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-eye text-indigo-500"></i>
              Preview Result
            </h3>

            <div className="flex-grow flex items-center justify-center bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden relative">
              {status === AppStatus.LOADING && (
                <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-800 font-bold text-xl mb-1">AI Designer at Work</p>
                  <p className="text-slate-500 text-sm">Crafting pixels, refining curves, picking colors...</p>
                </div>
              )}

              {generatedImage ? (
                <div className="w-full h-full p-6 flex flex-col items-center">
                  <div className="flex-grow flex items-center justify-center w-full">
                    <img 
                      src={generatedImage} 
                      alt="AI Generated Logo" 
                      className="max-w-full max-h-[350px] object-contain drop-shadow-2xl animate-in zoom-in duration-500"
                    />
                  </div>
                  <div className="mt-6 w-full flex gap-3">
                    <a 
                      href={generatedImage} 
                      download={`${mode}-logo-${Date.now()}.png`}
                      className="flex-grow bg-slate-900 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-black transition-all"
                    >
                      <i className="fas fa-download"></i> Download HQ
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center p-12 opacity-30">
                  <i className="fas fa-drafting-compass text-6xl mb-4 text-slate-300"></i>
                  <p className="text-slate-500 font-medium">Your creation will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <i className="fas fa-layer-group text-indigo-500"></i>
              Recent Creations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {history.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                  <div className="aspect-square bg-slate-50 flex items-center justify-center p-4 relative group">
                    <img src={item.generatedImage} alt="Logo" className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        item.mode === 'modernize' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.mode}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-white border-t border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 truncate mb-1">{item.prompt}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{new Date(item.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm mb-4">
            Powered by <span className="font-bold text-indigo-600">Gemini 2.5 Flash Image</span> &bull; Professional AI Branding
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
