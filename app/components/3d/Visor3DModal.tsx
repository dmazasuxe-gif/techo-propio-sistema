"use client";

import React, { useEffect, useState } from 'react';
import { X, Maximize, RotateCcw, Box } from 'lucide-react';
import dynamic from 'next/dynamic';

const ModelViewer = dynamic(() => import('./ModelViewerWrapper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
});

interface Visor3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  modeloUrl: string;
  nombre: string;
  imagenUrl?: string;
}

export default function Visor3DModal({ isOpen, onClose, modeloUrl, nombre, imagenUrl }: Visor3DModalProps) {
  const [showRoof, setShowRoof] = useState(true);
  const viewerRef = React.useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setShowRoof(true); // reset on open
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Effect to toggle the roof scale when showRoof changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (viewer) {
      const toggleRoof = () => {
        try {
          // Buscamos el símbolo secreto de Three.js Scene dentro del web component
          const symbols = Object.getOwnPropertySymbols(viewer);
          const sceneSymbol = symbols.find(s => s.description === 'scene');
          
          if (sceneSymbol && viewer[sceneSymbol]) {
            const scene = viewer[sceneSymbol];
            let found = false;
            
            // Recorremos todo el modelo 3D recursivamente
            scene.traverse((child: any) => {
              if (child.name && child.name.toLowerCase().includes('techo_interactivo')) {
                child.visible = showRoof;
                found = true;
              }
            });
            
            if (!found) {
              console.warn("No se encontró ninguna pieza que contenga 'Techo_Interactivo' en su nombre.");
            }
          }
        } catch (error) {
          console.error("Error al manipular el modelo 3D:", error);
        }
      };
      
      toggleRoof();
      
      // Also attach to 'load' event in case the model is still loading
      viewer.addEventListener('load', toggleRoof);
      return () => viewer.removeEventListener('load', toggleRoof);
    }
  }, [showRoof, isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    const viewer = viewerRef.current;
    if (viewer) {
      viewer.cameraOrbit = "auto auto auto";
      viewer.cameraTarget = "auto auto auto";
      viewer.fieldOfView = "auto";
    }
  };

  const handleFullscreen = () => {
    const viewer = viewerRef.current;
    if (viewer) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        viewer.requestFullscreen();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 transition-opacity">
      <div className="bg-white w-full max-w-6xl h-[88vh] md:h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header del Modal */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-white z-10 gap-3">
          <div className="min-w-0">
            <h3 className="text-base sm:text-xl font-bold text-gray-900 truncate">{nombre}</h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">Interactúa con el modelo arrastrando y haciendo zoom</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Cerrar visor 3D"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Visor 3D Area */}
        <div className="flex-1 w-full bg-gray-50/50 relative">
          <ModelViewer 
            src={modeloUrl} 
            alt={`Modelo 3D de ${nombre}`}
            poster={imagenUrl}
            innerRef={viewerRef}
          />
          
          {/* Top floating controls */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col gap-2 sm:gap-3 z-10">
            <button 
              onClick={() => setShowRoof(!showRoof)}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white/95 backdrop-blur-sm shadow-lg rounded-full hover:bg-white text-gray-800 transition-all hover:scale-105 active:scale-95 font-bold text-xs sm:text-sm border border-gray-200"
            >
              <Box className="w-4 h-4 text-blue-600" />
              <span>{showRoof ? 'Ver Interior' : 'Poner Techo'}</span>
            </button>
          </div>

          {/* Controles sobre el visor */}
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2 sm:gap-3 z-10">
            <button 
              onClick={handleReset}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-white/95 backdrop-blur-sm shadow-lg rounded-full hover:bg-white text-gray-700 transition-all hover:scale-105 active:scale-95"
              aria-label="Restablecer vista"
              title="Restablecer vista"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={handleFullscreen}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-white/95 backdrop-blur-sm shadow-lg rounded-full hover:bg-white text-gray-700 transition-all hover:scale-105 active:scale-95"
              aria-label="Pantalla completa"
              title="Pantalla completa"
            >
              <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
