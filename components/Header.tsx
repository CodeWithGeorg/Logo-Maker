
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            <i className="fas fa-shapes text-lg"></i>
          </div>
          <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">
            LogoModernizer<span className="text-indigo-600">AI</span>
          </span>
        </div>
        
        <nav className="hidden lg:flex gap-10 items-center">
          <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">The Process</a>
          <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Gallery</a>
          <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Support</a>
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 px-4 py-2 transition-colors">
            Sign In
          </button>
          <button className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
            Studio Pro
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
