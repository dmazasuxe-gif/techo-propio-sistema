import React, { useRef, useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

interface EditableImageProps {
  src: string;
  onUpload: (newUrl: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function EditableImage({ src, onUpload, className = "", children }: EditableImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subfolder', 'landing_images');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.ok && data.url) {
        onUpload(data.url);
      } else {
        alert("Error al subir imagen");
      }
    } catch (error) {
      console.error(error);
      alert("Error al procesar la subida");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`group relative inline-block ${className}`}>
      {children}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] rounded-inherit cursor-pointer z-50 rounded-xl"
           onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();
             if (!uploading) fileInputRef.current?.click();
           }}>
        
        {uploading ? (
          <div className="bg-slate-900/90 text-sky-400 p-3 rounded-full shadow-xl">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="bg-sky-600 hover:bg-sky-500 text-white p-3 rounded-full shadow-xl transition-transform transform group-hover:scale-110 flex items-center justify-center gap-2 font-semibold text-sm">
            <UploadCloud className="w-5 h-5" />
            <span className="hidden group-hover:inline">Cambiar Imagen</span>
          </div>
        )}

      </div>
      
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
    </div>
  );
}
