"use client";

import React, { useEffect, useState, useRef } from 'react';

// Wrapper para <model-viewer> ya que es un web component y queremos asegurar que solo
// se renderice/importe en el cliente.
export default function ModelViewerWrapper({
  src,
  alt,
  poster,
}: {
  src: string;
  alt: string;
  poster?: string;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const viewerRef = useRef<any>(null);

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
      };
      viewer.addEventListener('load', handleLoad);
      return () => {
        viewer.removeEventListener('load', handleLoad);
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
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 transition-opacity duration-300 ${modelLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
        <span className="text-sm font-medium text-gray-700">Cargando vivienda 3D...</span>
      </div>
    </ModelViewerElement>
  );
}
