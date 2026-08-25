"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Box, Check, X, ArrowLeft, Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ModeloVivienda } from '@/app/types';

export default function ModelosViviendaAdmin() {
  const [modelos, setModelos] = useState<ModeloVivienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModelo, setEditingModelo] = useState<Partial<ModeloVivienda> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ type: string, progress: number } | null>(null);

  useEffect(() => {
    loadModelos();
  }, []);

  const loadModelos = async () => {
    setLoading(true);
    const res = await fetch('/api/modelos-vivienda');
    const data = await res.json();
    setModelos(data);
    setLoading(false);
  };

  const handleCreateNew = () => {
    setEditingModelo({
      nombre: '',
      descripcion: '',
      dimensiones: '',
      areaM2: 0,
      tipoTecho: '',
      activo: true,
      orden: modelos.length,
    });
  };

  const handleEdit = (m: ModeloVivienda) => {
    setEditingModelo({ ...m });
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este modelo de vivienda?')) {
      await fetch(`/api/modelos-vivienda?id=${id}`, { method: 'DELETE' });
      await loadModelos();
    }
  };

  const handleToggleActivo = async (m: ModeloVivienda) => {
    await fetch('/api/modelos-vivienda', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: m.id, activo: !m.activo })
    });
    await loadModelos();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'modelo_3d' | 'imagen') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'modelo_3d' && !file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
      alert("Por favor sube un archivo .GLB o .GLTF válido.");
      return;
    }

    try {
      setUploadProgress({ type, progress: 10 });
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      setUploadProgress({ type, progress: 50 });
      const { data, error } = await supabase.storage
        .from('modelos-3d')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;
      setUploadProgress({ type, progress: 90 });

      const { data: { publicUrl } } = supabase.storage
        .from('modelos-3d')
        .getPublicUrl(filePath);

      setEditingModelo(prev => {
        if (!prev) return prev;
        if (type === 'modelo_3d') return { ...prev, modelo3dUrl: publicUrl };
        if (type === 'imagen') return { ...prev, imagenUrl: publicUrl };
        return prev;
      });
    } catch (err: any) {
      console.error("Error upload:", err);
      alert("Error al subir archivo: " + err.message);
    } finally {
      setUploadProgress(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModelo) return;
    setIsSubmitting(true);
    
    try {
      if (editingModelo.id) {
        await fetch('/api/modelos-vivienda', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingModelo)
        });
      } else {
        await fetch('/api/modelos-vivienda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingModelo)
        });
      }
      setEditingModelo(null);
      await loadModelos();
    } catch (err: any) {
      alert("Error guardando modelo: " + (err.message || JSON.stringify(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (editingModelo) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button onClick={() => setEditingModelo(null)} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" /> Volver a la lista
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingModelo.id ? 'Editar Modelo de Vivienda' : 'Nuevo Modelo de Vivienda'}
          </h2>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nombre de la Vivienda</label>
                <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  value={editingModelo.nombre || ''} onChange={e => setEditingModelo({...editingModelo, nombre: e.target.value})}
                  placeholder="Ej. Vivienda Techo Aligerado 6 x 6" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Dimensiones</label>
                <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  value={editingModelo.dimensiones || ''} onChange={e => setEditingModelo({...editingModelo, dimensiones: e.target.value})}
                  placeholder="Ej. 6 x 6 m" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Área (m²)</label>
                <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  value={editingModelo.areaM2 || ''} onChange={e => setEditingModelo({...editingModelo, areaM2: Number(e.target.value)})}
                  placeholder="Ej. 36" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tipo de Techo</label>
                <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  value={editingModelo.tipoTecho || ''} onChange={e => setEditingModelo({...editingModelo, tipoTecho: e.target.value})}
                  placeholder="Ej. Techo Aligerado" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Descripción (Opcional)</label>
              <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-24 text-gray-900"
                value={editingModelo.descripcion || ''} onChange={e => setEditingModelo({...editingModelo, descripcion: e.target.value})}
                placeholder="Breve descripción del modelo..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
              {/* Modelo 3D Upload */}
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center">
                <Box className="w-10 h-10 text-blue-500 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Modelo 3D (.GLB)</h4>
                {editingModelo.modelo3dUrl ? (
                  <div className="text-sm text-green-600 mb-4 flex items-center font-medium"><Check className="w-4 h-4 mr-1"/> Archivo cargado</div>
                ) : (
                  <div className="text-sm text-gray-500 mb-4">Aún no se ha subido</div>
                )}
                
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  {uploadProgress?.type === 'modelo_3d' ? `Subiendo... ${uploadProgress.progress}%` : 'Seleccionar archivo .GLB'}
                  <input type="file" accept=".glb,.gltf" className="hidden" onChange={e => handleFileUpload(e, 'modelo_3d')} disabled={!!uploadProgress} />
                </label>
              </div>

              {/* Imagen Portada Upload */}
              <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center text-center">
                {editingModelo.imagenUrl ? (
                  <img src={editingModelo.imagenUrl} alt="Preview" className="w-24 h-24 object-cover rounded-xl mb-3 shadow-sm" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-emerald-500 mb-3" />
                )}
                <h4 className="font-semibold text-gray-900 mb-1">Imagen de Portada</h4>
                <div className="text-sm text-gray-500 mb-4">Recomendado: 800x600px</div>
                
                <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  {uploadProgress?.type === 'imagen' ? `Subiendo... ${uploadProgress.progress}%` : 'Seleccionar Imagen'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'imagen')} disabled={!!uploadProgress} />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded text-blue-600"
                  checked={editingModelo.activo ?? true} onChange={e => setEditingModelo({...editingModelo, activo: e.target.checked})} />
                <span className="font-medium text-gray-700">Mostrar en la landing page</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setEditingModelo(null)} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting || !!uploadProgress} className="px-6 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                Guardar Vivienda
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Modelos de Vivienda 3D</h1>
          <p className="text-gray-500 mt-1">Administra los modelos que se muestran en la landing page.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" /> Nuevo Modelo
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Modelo</th>
                <th className="p-4">Dimensiones</th>
                <th className="p-4">Archivos</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modelos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No hay modelos de vivienda registrados. Haz clic en "Nuevo Modelo" para empezar.
                  </td>
                </tr>
              ) : modelos.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {m.imagenUrl ? (
                          <img src={m.imagenUrl} alt="Portada" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="w-5 h-5" /></div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{m.nombre}</div>
                        <div className="text-xs text-gray-500">{m.tipoTecho}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-700">{m.dimensiones}</div>
                    <div className="text-xs text-gray-500">{m.areaM2} m²</div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {m.modelo3dUrl ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100" title="Modelo 3D GLB disponible">3D GLB</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-medium border border-red-100">Falta 3D</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleToggleActivo(m)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                        m.activo 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {m.activo ? 'Activo (Visible)' : 'Inactivo Oculto'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
