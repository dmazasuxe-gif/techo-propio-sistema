"use client";

import React, { useEffect, useState } from 'react';
import { ModeloVivienda } from '@/app/types';
import ModeloCard from './ModeloCard';
import Visor3DModal from './Visor3DModal';
import { Box } from 'lucide-react';

export default function ModelosViviendaSection() {
  const [modelos, setModelos] = useState<ModeloVivienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [modeloActivo, setModeloActivo] = useState<ModeloVivienda | null>(null);

  useEffect(() => {
    async function loadModelos() {
      try {
        // Solo obtener los modelos activos para la landing page
        const res = await fetch('/api/modelos-vivienda?activosOnly=true');
        const data = await res.json();
        setModelos(data);
      } catch (error) {
        console.error('Error al cargar modelos de vivienda:', error);
      } finally {
        setLoading(false);
      }
    }
    loadModelos();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando modelos de vivienda...</p>
        </div>
      </section>
    );
  }

  if (modelos.length === 0) {
    return null; // Si no hay modelos activos, no mostramos la sección para no romper el flujo visual.
  }

  return (
    <section className="py-24 bg-gray-50/50 relative overflow-hidden" id="modelos-3d">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-blue-100 opacity-50 blur-3xl mix-blend-multiply"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-teal-100 opacity-50 blur-3xl mix-blend-multiply"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3 block">
            Innovación y Tecnología
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Conoce nuestras viviendas en <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">3D</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Explora nuestros modelos de vivienda y conoce cada propuesta desde diferentes ángulos mediante nuestro visor interactivo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modelos.map((modelo, idx) => (
            <div 
              key={modelo.id} 
              className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <ModeloCard 
                modelo={modelo} 
                onOpenVisor={setModeloActivo} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Visor 3D Modal */}
      <Visor3DModal 
        isOpen={!!modeloActivo} 
        onClose={() => setModeloActivo(null)}
        modeloUrl={modeloActivo?.modelo3dUrl || ""}
        nombre={modeloActivo?.nombre || ""}
        imagenUrl={modeloActivo?.imagenUrl}
      />
    </section>
  );
}
