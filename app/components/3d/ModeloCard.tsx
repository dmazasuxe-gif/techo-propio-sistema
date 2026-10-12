"use client";

import React from 'react';
import { Box, Maximize2, Layers, Play } from 'lucide-react';
import { ModeloVivienda } from '@/app/types';

interface ModeloCardProps {
  modelo: ModeloVivienda;
  onOpenVisor: (modelo: ModeloVivienda) => void;
}

export default function ModeloCard({ modelo, onOpenVisor }: ModeloCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Imagen de portada con soporte táctil directo para móviles */}
      <div 
        onClick={() => onOpenVisor(modelo)}
        className="aspect-[4/3] w-full bg-gray-100 relative overflow-hidden cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`Ver modelo 3D de ${modelo.nombre}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenVisor(modelo); } }}
      >
        {modelo.imagenUrl ? (
          <img 
            src={modelo.imagenUrl} 
            alt={modelo.nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <Box className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-sm">Sin imagen</span>
          </div>
        )}
        
        {/* Badge móvil 3D visible en la esquina para indicar interactividad */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#162839]/90 text-white backdrop-blur-md shadow-md border border-white/20">
            <Play className="w-3 h-3 fill-[#fc8f34] text-[#fc8f34]" />
            <span>3D Interactivo</span>
          </span>
        </div>

        {/* Overlay Hover en Desktop */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center">
          <button 
            onClick={(e) => { e.stopPropagation(); onOpenVisor(modelo); }}
            className="bg-white/95 backdrop-blur-sm text-[#162839] px-6 py-3 rounded-full font-bold flex items-center gap-2 transform translate-y-3 group-hover:translate-y-0 transition-all shadow-xl hover:bg-white active:scale-95"
          >
            <Play className="w-4 h-4 fill-[#fc8f34] text-[#fc8f34]" />
            Ver vivienda en 3D
          </button>
        </div>
      </div>

      {/* Info de la vivienda */}
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h4 className="text-lg sm:text-xl font-bold text-[#162839] mb-2 font-[family-name:var(--font-montserrat)]">{modelo.nombre}</h4>
        
        {modelo.descripcion && (
          <div className="mb-4">
            <p className={`text-slate-600 text-xs sm:text-sm leading-relaxed font-[family-name:var(--font-work-sans)] transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
              {modelo.descripcion}
            </p>
            {modelo.descripcion.length > 90 && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#e67e22] hover:text-[#fc8f34] text-xs font-bold mt-1 transition-colors"
              >
                {isExpanded ? 'Leer menos' : 'Leer más...'}
              </button>
            )}
          </div>
        )}
        
        <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
              <Maximize2 className="w-3 h-3 text-[#e67e22]" /> Dimensiones
            </span>
            <span className="text-slate-800 font-semibold">{modelo.dimensiones || "N/A"}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#e67e22]" /> Área / Techo
            </span>
            <span className="text-slate-800 font-semibold truncate">
              {modelo.areaM2 ? `${modelo.areaM2} m²` : "N/A"}
              {modelo.tipoTecho && <span className="block text-xs text-slate-500 font-normal truncate" title={modelo.tipoTecho}>{modelo.tipoTecho}</span>}
            </span>
          </div>
        </div>

        {/* Botón táctil móvil de alta fidelidad arquitectónica */}
        <button 
          onClick={() => onOpenVisor(modelo)}
          className="mt-5 w-full py-3.5 bg-[#162839] hover:bg-[#2c3e50] active:bg-[#e67e22] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 min-h-[48px]"
        >
          <Play className="w-4 h-4 fill-[#fc8f34] text-[#fc8f34]" />
          <span>Explorar en 3D</span>
        </button>
      </div>
    </div>
  );
}
