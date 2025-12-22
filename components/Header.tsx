
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 md:p-2 rounded-lg text-white">
            <i className="fas fa-wand-magic-sparkles text-sm md:text-xl"></i>
          </div>
          <span className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
            LogoModernizer<span className="text-indigo-600">AI</span>
          </span>
        </div>
        <nav className="hidden md:flex gap-6 items-center">
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Support</a>
        </nav>
        <div>
          <button className="bg-indigo-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm active:scale-95">
            Try Pro
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
