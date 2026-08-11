import React, { useState, useEffect, useRef } from 'react';
import { Edit2 } from 'lucide-react';

interface EditableTextProps {
  value: string;
  onChange: (newVal: string) => void;
  className?: string;
  multiline?: boolean;
  html?: boolean; // if true, renders HTML and edits as HTML string
}

export function EditableText({ value, onChange, className = "", multiline = false, html = false }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
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
          style={{ width: '100%', minHeight: '3em' }}
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
      />
    );
  }

  return (
    <div 
      className={`group relative cursor-pointer hover:outline-dashed hover:outline-2 hover:outline-sky-500/50 hover:bg-sky-500/5 transition-all rounded px-1 -mx-1 ${!value ? 'min-w-[40px] min-h-[1.5em] bg-white/5 border border-dashed border-white/20' : ''} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {html ? (
        <span dangerouslySetInnerHTML={{ __html: value || '&nbsp;' }} />
      ) : (
        <span>{value || '\u00A0'}</span>
      )}
      <div className="absolute -top-3 -right-3 p-1 bg-sky-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white shadow-lg z-50">
        <Edit2 className="w-3 h-3" />
      </div>
    </div>
  );
}
