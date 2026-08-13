import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Type } from 'lucide-react';

interface EditableTextProps {
  value: string;
  onChange: (newVal: string) => void;
  className?: string;
  multiline?: boolean;
  html?: boolean; // if true, renders HTML and edits as HTML string
  fontFamily?: string;
  onFontChange?: (newFont: string) => void;
  color?: string;
  onColorChange?: (newColor: string) => void;
}


const COLORS = [
  { label: 'Predeterminado', value: '' },
  { label: 'Negro', value: '#000000' },
  { label: 'Blanco', value: '#ffffff' },
  { label: 'Gris Oscuro', value: '#1e293b' },
  { label: 'Gris Medio', value: '#64748b' },
  { label: 'Gris Claro', value: '#94a3b8' },
  { label: 'Azul', value: '#3b82f6' },
  { label: 'Azul Marino', value: '#1e3a8a' },
  { label: 'Rojo', value: '#ef4444' },
  { label: 'Verde', value: '#22c55e' },
  { label: 'Naranja', value: '#f97316' },
  { label: 'Amarillo', value: '#eab308' },
  { label: 'Púrpura', value: '#a855f7' },
  { label: 'Rosa', value: '#ec4899' },
];
const FONTS = [
  { label: 'Predeterminado', value: '' },
  { label: 'Montserrat', value: 'var(--font-montserrat)' },
  { label: 'Work Sans', value: 'var(--font-work-sans)' },
  { label: 'Outfit', value: 'var(--font-outfit)' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Sans-Serif', value: 'sans-serif' },
  { label: 'Serif', value: 'serif' }
];

export function EditableText({ value, onChange, className = "", multiline = false, html = false, fontFamily, onFontChange, color, onColorChange }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // Sync value if changed from outside
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setTempValue(value); // revert
      setIsEditing(false);
    }
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`${className} bg-slate-800/80 text-white outline-none ring-2 ring-sky-500 rounded p-1 resize-none overflow-hidden`}
          style={{ width: '100%', minHeight: '3em', fontFamily: fontFamily || 'inherit' }}
          rows={tempValue.split('\n').length}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`${className} bg-slate-800/80 text-white outline-none ring-2 ring-sky-500 rounded p-1 w-full`}
        style={{ fontFamily: fontFamily || 'inherit' }}
      />
    );
  }

  return (
    <div 
      className={`group relative cursor-pointer hover:outline-dashed hover:outline-2 hover:outline-sky-500/50 hover:bg-sky-500/5 transition-all rounded px-1 -mx-1 ${!value ? 'min-w-[40px] min-h-[1.5em] bg-white/5 border border-dashed border-white/20' : ''} ${className}`}
      onMouseLeave={() => { setIsFontPickerOpen(false); setIsColorPickerOpen(false); }}
    >
      <div 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsEditing(true);
        }}
        style={{ fontFamily: fontFamily || 'inherit', color: color || 'inherit' }}
      >
        {html ? (
          <span dangerouslySetInnerHTML={{ __html: value || '&nbsp;' }} />
        ) : (
          <span>{value || '\u00A0'}</span>
        )}
      </div>
      
      <div className="absolute -top-4 -right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-[60]">
        {onFontChange && (
          <div className="relative">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFontPickerOpen(!isFontPickerOpen); }}
              className="p-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-full text-white shadow-lg flex items-center justify-center transition-colors"
              title="Cambiar Tipografía"
            >
              <Type className="w-3 h-3" />
            </button>
            {isFontPickerOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-[70] min-w-[150px]" onClick={e => e.stopPropagation()}>
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Tipografía
                </div>
                {FONTS.map(f => (
                  <button 
                    key={f.label} 
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 transition-colors ${fontFamily === f.value ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'}`}
                    style={{ fontFamily: f.value || 'inherit' }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onFontChange(f.value);
                      setIsFontPickerOpen(false);
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {onColorChange && (
          <div className="relative">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsColorPickerOpen(!isColorPickerOpen); setIsFontPickerOpen(false); }}
              className="p-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-full text-white shadow-lg flex items-center justify-center transition-colors"
              title="Cambiar Color"
            >
              <div className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: color || 'transparent' }}></div>
            </button>
            {isColorPickerOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 py-2 px-2 z-[70] w-[180px]" onClick={e => e.stopPropagation()}>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  Color del Texto
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {COLORS.map(c => (
                    <button 
                      key={c.label} 
                      title={c.label}
                      className={`w-6 h-6 rounded-full border ${color === c.value ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-200'} hover:scale-110 transition-transform`}
                      style={{ backgroundColor: c.value || '#e2e8f0', backgroundImage: !c.value ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : 'none', backgroundSize: !c.value ? '6px 6px' : 'auto', backgroundPosition: !c.value ? '0 0, 3px 3px' : 'auto' }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onColorChange(c.value);
                        setIsColorPickerOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="p-1.5 bg-sky-500 hover:bg-sky-600 rounded-full text-white shadow-lg flex items-center justify-center transition-colors"
          title="Editar Texto"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
