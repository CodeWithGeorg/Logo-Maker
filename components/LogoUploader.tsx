
import React, { useRef } from 'react';

interface LogoUploaderProps {
  onImagesChange: (images: string[]) => void;
  selectedImages: string[];
  darkMode?: boolean;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ onImagesChange, selectedImages, darkMode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 5 - selectedImages.length;
    const filesToProcess = files.slice(0, remainingSlots);

    const promises = filesToProcess.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(newBase64s => {
      onImagesChange([...selectedImages, ...newBase64s]);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    const updated = [...selectedImages];
    updated.splice(index, 1);
    onImagesChange(updated);
  };

  const triggerUpload = () => {
    if (selectedImages.length < 5) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Reference Board ({selectedImages.length}/5)</span>
        {selectedImages.length > 0 && (
          <button 
            onClick={() => onImagesChange([])}
            className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
          >
            Reset Board
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {selectedImages.map((img, idx) => (
          <div key={idx} className={`relative aspect-square rounded-2xl border p-1 group overflow-hidden shadow-sm hover:shadow-md transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <img src={img} alt={`Ref ${idx}`} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
               <button 
                onClick={() => removeImage(idx)}
                className="w-8 h-8 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xl hover:bg-red-500 hover:text-white transition-colors"
              >
                <i className="fas fa-trash-alt text-[10px]"></i>
              </button>
            </div>
          </div>
        ))}
        
        {selectedImages.length < 5 && (
          <button 
            onClick={triggerUpload}
            className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 group ${darkMode ? 'border-slate-700 bg-slate-800/30 hover:border-indigo-500 hover:bg-indigo-900/20' : 'border-slate-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/30'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center group-hover:shadow-sm transition-all mb-1 ${darkMode ? 'bg-slate-700 text-slate-500 group-hover:text-indigo-400' : 'bg-white text-slate-300 group-hover:text-indigo-600'}`}>
              <i className="fas fa-plus text-xs"></i>
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-indigo-600">Add</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              multiple
              className="hidden" 
            />
          </button>
        )}
      </div>

      {selectedImages.length === 0 && (
        <div 
          onClick={triggerUpload}
          className={`w-full py-12 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-500 group ${darkMode ? 'border-slate-800 bg-slate-800/20 hover:border-indigo-500 hover:bg-slate-800/40' : 'border-slate-200 bg-slate-50/30 hover:border-indigo-400 hover:bg-white'}`}
        >
          <div className={`w-16 h-16 rounded-3xl shadow-[0_4px_15px_rgb(0,0,0,0.03)] flex items-center justify-center mb-4 transition-all ${darkMode ? 'bg-slate-800 text-slate-700 group-hover:text-indigo-400 group-hover:shadow-indigo-900/20' : 'bg-white text-slate-200 group-hover:text-indigo-400 group-hover:shadow-indigo-100'}`}>
            <i className="fas fa-cloud-upload-alt text-2xl"></i>
          </div>
          <p className={`font-bold text-sm tracking-tight transition-colors ${darkMode ? 'text-slate-400 group-hover:text-indigo-400' : 'text-slate-800 group-hover:text-indigo-600'}`}>Import Vision References</p>
          <p className="text-slate-400 text-[10px] font-medium mt-1">Sketches, moodboards, or current marks (Max 5)</p>
        </div>
      )}
    </div>
  );
};

export default LogoUploader;
