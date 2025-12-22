
import React, { useRef } from 'react';

interface LogoUploaderProps {
  onImageSelect: (base64: string) => void;
  selectedImage: string | null;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ onImageSelect, selectedImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div 
        onClick={handleClick}
        className={`relative w-full aspect-square sm:aspect-[16/9] rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden active:scale-[0.98]
          ${selectedImage ? 'border-indigo-400 bg-indigo-50/10' : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-slate-100'}
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        {selectedImage ? (
          <div className="w-full h-full relative group p-4 flex items-center justify-center">
            <img 
              src={selectedImage} 
              alt="Uploaded reference" 
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <span className="text-white font-bold flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-full text-xs sm:text-sm shadow-xl">
                <i className="fas fa-camera"></i> Replace Image
              </span>
            </div>
            {/* Mobile Indicator */}
            <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur p-2 rounded-full md:hidden shadow-sm border border-slate-200">
               <i className="fas fa-sync text-indigo-600 text-xs"></i>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 md:p-8">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 text-slate-300 border border-slate-100">
              <i className="fas fa-image text-xl md:text-2xl"></i>
            </div>
            <p className="text-slate-700 font-bold text-xs sm:text-sm mb-1 tracking-tight">Upload Logo</p>
            <p className="text-slate-400 text-[10px] sm:text-xs">Tap to browse files</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoUploader;
