
import React from 'react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode }) => {
  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStudioPro = () => {
    alert("Studio Pro is coming soon! ✨ Early access for premium branding tools.");
  };

  const handleSignIn = () => {
    alert("Sign-in feature is under construction. Please use guest mode for now.");
  };

  return (
    <header className={`backdrop-blur-md border-b sticky top-0 z-50 transition-all duration-300 ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 transform -rotate-3 group-hover:rotate-0 transition-transform">
            <i className="fas fa-shapes text-lg"></i>
          </div>
          <span className={`text-xl md:text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            LogoModernizer<span className="text-indigo-600">AI</span>
          </span>
        </div>
        
        <nav className="hidden lg:flex gap-10 items-center">
          <button 
            onClick={() => handleScroll('process')}
            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
          >
            The Process
          </button>
          <button 
            onClick={() => handleScroll('gallery')}
            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
          >
            Gallery
          </button>
          <button 
            onClick={() => handleScroll('support')}
            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
          >
            Support
          </button>
        </nav>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${darkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          <button 
            onClick={handleSignIn}
            className={`hidden sm:block text-xs font-black uppercase tracking-widest px-4 py-2 transition-colors ${darkMode ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            Sign In
          </button>
          <button 
            onClick={handleStudioPro}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${darkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-900 text-white hover:bg-black'}`}
          >
            Studio Pro
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
