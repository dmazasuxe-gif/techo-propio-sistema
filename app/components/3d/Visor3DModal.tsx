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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-6 transition-opacity">
      <div className="bg-white w-full max-w-6xl h-[85vh] md:h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{nombre}</h3>
            <p className="text-sm text-gray-500">Interactúa con el modelo usando el mouse o pantalla táctil</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
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
          <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
            <button 
              onClick={() => setShowRoof(!showRoof)}
              className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm shadow-lg rounded-full hover:bg-white text-gray-800 transition-all hover:scale-105 active:scale-95 font-semibold text-sm border border-gray-200"
            >
              <Box className="w-4 h-4 text-primary" />
              {showRoof ? 'Ver Interior' : 'Poner Techo'}
            </button>
          </div>

          {/* Controles sobre el visor */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-10">
            <button 
              onClick={handleReset}
              className="p-3 bg-white/90 backdrop-blur-sm shadow-lg rounded-full hover:bg-white text-gray-700 transition-all hover:scale-105 active:scale-95"
              aria-label="Restablecer vista"
              title="Restablecer vista"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button 
              onClick={handleFullscreen}
              className="p-3 bg-white/90 backdrop-blur-sm shadow-lg rounded-full hover:bg-white text-gray-700 transition-all hover:scale-105 active:scale-95"
              aria-label="Pantalla completa"
              title="Pantalla completa"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
