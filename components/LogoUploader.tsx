
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
        className={`relative w-full aspect-[16/9] rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden
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
              <span className="text-white font-bold flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-full text-sm">
                <i className="fas fa-camera"></i> Replace Image
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-300 border border-slate-100">
              <i className="fas fa-image text-2xl"></i>
            </div>
            <p className="text-slate-700 font-bold text-sm mb-1 tracking-tight">Image Reference</p>
            <p className="text-slate-400 text-xs">Drop image or click to browse</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoUploader;
