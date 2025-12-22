
import React, { useRef } from 'react';

interface LogoUploaderProps {
  onImagesChange: (images: string[]) => void;
  selectedImages: string[];
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ onImagesChange, selectedImages }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 total images
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

    // Reset input so the same file can be picked again if removed
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
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-700">Reference Images ({selectedImages.length}/5)</span>
        {selectedImages.length > 0 && (
          <button 
            onClick={() => onImagesChange([])}
            className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {selectedImages.map((img, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl border border-slate-200 bg-white p-1 overflow-hidden group shadow-sm">
            <img src={img} alt={`Ref ${idx}`} className="w-full h-full object-contain" />
            <button 
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <i className="fas fa-times text-[10px]"></i>
            </button>
          </div>
        ))}
        
        {selectedImages.length < 5 && (
          <button 
            onClick={triggerUpload}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all active:scale-[0.97]"
          >
            <i className="fas fa-plus text-slate-400 mb-1"></i>
            <span className="text-[10px] font-bold text-slate-500">Add Ref</span>
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
          className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-slate-100 transition-all"
        >
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 text-slate-300 border border-slate-100">
            <i className="fas fa-cloud-upload-alt text-xl"></i>
          </div>
          <p className="text-slate-700 font-bold text-xs">Upload references</p>
          <p className="text-slate-400 text-[10px]">Up to 5 images (styles, sketches, tags)</p>
        </div>
      )}
    </div>
  );
};

export default LogoUploader;
