"use client";

import React, { useState, useEffect } from 'react';
import { Save, Upload, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LandingConfig } from '@/lib/landing_db';

export function LandingCMS() {
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/landing-config')
      .then(r => r.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading config:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch('/api/landing-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Error saving config");
      alert("Configuración guardada correctamente");
    } catch (error) {
      alert("Hubo un error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;

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
        setConfig({
          ...config,
          imagenes_fondo: [...(config.imagenes_fondo || []), data.url]
        });
      } else {
        alert("Error al subir imagen");
      }
    } catch (error) {
      console.error(error);
      alert("Error al procesar la subida");
    } finally {
      setUploading(false);
      e.target.value = ''; // clear input
    }
  };

  const handleRemoveImage = (index: number) => {
    if (!config) return;
    const newImages = [...config.imagenes_fondo];
    newImages.splice(index, 1);
    setConfig({ ...config, imagenes_fondo: newImages });
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-sky-500" /></div>;
  }

  if (!config) {
    return <div className="p-8 text-red-500">Error: No se pudo cargar la configuración de la base de datos. ¿Aseguraste de ejecutar el script SQL?</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-slate-900 p-8 rounded-xl border border-slate-800 text-slate-200">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-[family-name:var(--font-montserrat)] text-white">Configuración Landing Page</h2>
          <p className="text-sm text-slate-400 mt-1">Edita los textos y gestiona las imágenes de fondo en vivo.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Guardar Cambios
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Título Principal (Hero)</label>
          <input 
            type="text" 
            value={config.titulo_principal}
            onChange={(e) => setConfig({ ...config, titulo_principal: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Subtítulo (Descripción)</label>
          <textarea 
            rows={3}
            value={config.subtitulo}
            onChange={(e) => setConfig({ ...config, subtitulo: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Teléfono de Contacto (Cotizaciones)</label>
          <input 
            type="text" 
            value={config.telefono_contacto}
            onChange={(e) => setConfig({ ...config, telefono_contacto: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="border-t border-slate-800 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Fondo Rotativo (Slideshow)</h3>
            <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg cursor-pointer transition-colors text-sm font-medium">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Subir Imagen
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {config.imagenes_fondo && config.imagenes_fondo.length > 0 ? (
              config.imagenes_fondo.map((url, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={i} 
                  className="relative group aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700"
                >
                  <img src={url} alt={`Fondo ${i+1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => handleRemoveImage(i)}
                      className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                      title="Eliminar imagen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-700 rounded-lg text-slate-500 flex flex-col items-center">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <p>No hay imágenes subidas. El fondo será oscuro por defecto.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
