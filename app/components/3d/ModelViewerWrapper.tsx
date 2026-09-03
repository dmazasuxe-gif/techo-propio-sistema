"use client";

import React, { useEffect, useState, useRef } from 'react';

// Wrapper para <model-viewer> ya que es un web component y queremos asegurar que solo
// se renderice/importe en el cliente.
export default function ModelViewerWrapper({
  src,
  alt,
  poster,
  innerRef,
}: {
  src: string;
  alt: string;
  poster?: string;
  innerRef?: React.RefObject<any> | React.MutableRefObject<any>;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const fallbackRef = useRef<any>(null);
  const viewerRef = innerRef || fallbackRef;

  useEffect(() => {
    // Importar la librería de google model-viewer dinámicamente solo en cliente
    import('@google/model-viewer').catch(console.error);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (viewer) {
      const handleLoad = () => {
        setModelLoaded(true);
        setLoadError(false);
      };
      const handleProgress = (event: any) => {
        setLoadProgress(Math.round(event.detail.totalProgress * 100));
      };
      const handleError = (event: any) => {
        console.warn('Aviso del visor 3D:', event);
        // Solo mostrar la pantalla de error si es un fallo crítico de carga
        if (event.detail && event.detail.type === 'loadfailure') {
          setLoadError(true);
        }
      };
      viewer.addEventListener('load', handleLoad);
      viewer.addEventListener('progress', handleProgress);
      viewer.addEventListener('error', handleError);
      return () => {
        viewer.removeEventListener('load', handleLoad);
        viewer.removeEventListener('progress', handleProgress);
        viewer.removeEventListener('error', handleError);
      };
    }
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const ModelViewerElement = 'model-viewer' as any;

  return (
    <ModelViewerElement
      ref={viewerRef}
      src={src}
      alt={alt}
      poster={poster}
      camera-controls
      auto-rotate
      ar
      shadow-intensity="1"
      environment-image="neutral"
      exposure="1"
      style={{ width: '100%', height: '100%' }}
      className="w-full h-full outline-none"
    >
      <div 
        slot="progress-bar" 
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 px-5 py-3 rounded-xl shadow-lg flex flex-col items-center gap-3 transition-opacity duration-300 ${modelLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        {loadError ? (
          <div className="text-center">
            <div className="text-red-500 font-bold mb-1">Aviso al cargar</div>
            <div className="text-sm text-gray-600 max-w-[200px] mb-3">El modelo es pesado o tuvo un problema menor, pero podría haber cargado en el fondo.</div>
            <button 
              onClick={() => {
                setLoadError(false);
                setModelLoaded(true);
              }}
              className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cerrar mensaje
            </button>
          </div>
        ) : (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-800">Cargando vivienda 3D...</div>
              <div className="text-xs text-gray-500 mt-1">{loadProgress}% - Puede demorar si el modelo es pesado</div>
            </div>
            
            {/* Progress bar background */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${loadProgress}%` }}></div>
            </div>
          </>
        )}
      </div>
    </ModelViewerElement>
  );
}
