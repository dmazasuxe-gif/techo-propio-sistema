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
      {/* Imagen de portada */}
      <div className="aspect-[4/3] w-full bg-gray-100 relative overflow-hidden">
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
        
        {/* Overlay Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={() => onOpenVisor(modelo)}
            className="bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-3 rounded-full font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-lg hover:bg-white"
          >
            <Play className="w-4 h-4 fill-current" />
            Ver vivienda en 3D
          </button>
        </div>
      </div>

      {/* Info de la vivienda */}
      <div className="p-6 flex flex-col flex-1">
        <h4 className="text-xl font-bold text-gray-900 mb-2">{modelo.nombre}</h4>
        
        {modelo.descripcion && (
          <div className="mb-4">
            <p className={`text-gray-500 text-sm transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
              {modelo.descripcion}
            </p>
            {modelo.descripcion.length > 90 && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-700 text-xs font-semibold mt-1 transition-colors"
              >
                {isExpanded ? 'Leer menos' : 'Leer más...'}
              </button>
            )}
          </div>
        )}
        
        <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 flex items-center gap-1">
              <Maximize2 className="w-3 h-3" /> Dimensiones
            </span>
            <span className="text-gray-700 font-medium">{modelo.dimensiones || "N/A"}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Área / Techo
            </span>
            <span className="text-gray-700 font-medium">
              {modelo.areaM2 ? `${modelo.areaM2} m²` : "N/A"}
              {modelo.tipoTecho && <span className="block text-sm text-gray-500 truncate" title={modelo.tipoTecho}>{modelo.tipoTecho}</span>}
            </span>
          </div>
        </div>

        {/* Botón móvil (visible solo en pantallas táctiles/pequeñas como refuerzo) */}
        <button 
          onClick={() => onOpenVisor(modelo)}
          className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 lg:hidden active:bg-blue-700"
        >
          <Play className="w-4 h-4 fill-current" />
          Ver en 3D
        </button>
      </div>
    </div>
  );
}
