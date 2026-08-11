"use client";

import React, { useState, useEffect } from 'react';
import { 
  Save, Loader2, ArrowRight, ShieldCheck, Building2, Hammer, Ruler, 
  Clock, Award, HelpCircle, HardHat, Pickaxe, Shovel, Truck, Warehouse, 
  Wrench, Paintbrush, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LandingContent, LandingConfig } from '@/lib/landing_db';
import { DEFAULT_LANDING_CONTENT } from '@/lib/landing_db';
import { EditableText } from './VisualEditor/EditableText';
import { EditableImage } from './VisualEditor/EditableImage';

const iconMap: Record<string, any> = { 
  Ruler, Building2, Hammer, ArrowRight, ShieldCheck, Clock, Award, 
  HardHat, Pickaxe, Shovel, Truck, Warehouse, Wrench, Paintbrush
};

export function LandingCMS() {
  const [config, setConfig] = useState<LandingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // For services gallery modal in CMS
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/landing-config')
      .then(r => r.json())
      .then((data: LandingConfig) => {
        if (data && data.content) {
          // Merge with default to ensure new fields (announcement, etc) exist
          setConfig({
            ...DEFAULT_LANDING_CONTENT,
            ...data.content,
            nav: { ...DEFAULT_LANDING_CONTENT.nav, ...data.content.nav },
            services: { 
              ...DEFAULT_LANDING_CONTENT.services, 
              ...data.content.services,
              items: data.content.services?.items?.map((item, i) => ({
                ...DEFAULT_LANDING_CONTENT.services.items[i],
                ...item,
                images: item.images || []
              })) || DEFAULT_LANDING_CONTENT.services.items
            },
            footer: { ...DEFAULT_LANDING_CONTENT.footer, ...data.content.footer },
            announcement: { 
              ...DEFAULT_LANDING_CONTENT.announcement, 
              ...data.content.announcement,
              images: data.content.announcement?.images || [],
              backdropOpacity: data.content.announcement?.backdropOpacity ?? 80
            }
          });
        } else {
          setConfig(DEFAULT_LANDING_CONTENT);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading config:", err);
        setConfig(DEFAULT_LANDING_CONTENT);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!config?.hero.images || config.hero.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % config.hero.images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [config?.hero.images]);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch('/api/landing-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: config }),
      });
      if (!res.ok) throw new Error("Error saving config");
      alert("¡Configuración de la web actualizada y en vivo!");
    } catch (error) {
      alert("Hubo un error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const updateNestedConfig = (path: string[], valueOrUpdater: any) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const newConfig = JSON.parse(JSON.stringify(prev)); // Deep copy
      let current = newConfig;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      const lastKey = path[path.length - 1];
      
      if (typeof valueOrUpdater === 'function') {
        current[lastKey] = valueOrUpdater(current[lastKey]);
      } else {
        current[lastKey] = valueOrUpdater;
      }
      
      return newConfig;
    });
  };

  if (loading || !config) {
    return <div className="p-8 flex justify-center h-full items-center"><Loader2 className="animate-spin w-12 h-12 text-sky-500" /></div>;
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      
      {/* Editor Toolbar */}
      <div className="flex-shrink-0 bg-slate-950/80 backdrop-blur-xl border-b border-sky-500/30 p-4 flex justify-between items-center z-[100] shadow-xl shadow-black/50 relative">
        <div className="flex items-center gap-4">
          <div className="bg-sky-500/20 text-sky-400 p-2 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-[family-name:var(--font-montserrat)] text-white flex items-center gap-2">
              Visual Builder 
              <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 uppercase tracking-widest font-bold">V3</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Haz clic sobre los textos, iconos y cuadros para editarlos.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Status Search Toggle */}
          <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-sky-500 transition-colors">
            <input 
              type="checkbox" 
              className="accent-sky-500 w-4 h-4"
              checked={config.statusSearch?.enabled ?? true}
              onChange={(e) => updateNestedConfig(['statusSearch', 'enabled'], e.target.checked)}
            />
            <span className="text-xs text-white font-bold">Activar Búsqueda DNI</span>
          </label>

          {/* Banner Toggle */}
          <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-sky-500 transition-colors">
            <input 
              type="checkbox" 
              className="accent-sky-500 w-4 h-4"
              checked={config.announcement.enabled}
              onChange={(e) => updateNestedConfig(['announcement', 'enabled'], e.target.checked)}
            />
            <span className="text-xs text-white font-bold">Activar Popup Banner</span>
          </label>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 hover:scale-105 active:scale-95"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Publicando...' : 'Publicar Cambios'}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#0a0c10] text-[#e2e8f0] font-sans relative selection:bg-sky-500/30">
        
        {/* =========================================
            POPUP BANNER (Preview inside CMS)
            ========================================= */}
        {config.announcement.enabled && (
          <div className="relative z-[90] p-4 flex flex-col items-center mt-4 border border-sky-500/20 rounded-2xl bg-slate-900/50">
            <div className="w-full mb-6">
              <label className="text-sm text-slate-300 font-bold flex justify-between">
                <span>Opacidad del Fondo Oscuro</span>
                <span className="text-sky-400">{config.announcement.backdropOpacity}%</span>
              </label>
              <input 
                type="range" min="0" max="100" 
                value={config.announcement.backdropOpacity}
                onChange={(e) => updateNestedConfig(['announcement', 'backdropOpacity'], Number(e.target.value))}
                className="w-full mt-2 accent-sky-500"
              />
              <p className="text-xs text-slate-500 mt-1">Ajusta qué tan oscuro se verá el fondo de la página detrás del anuncio.</p>
            </div>

            <div className="w-full max-w-3xl relative flex flex-col items-center">
              <div className="absolute top-4 right-4 z-20">
                <div className="p-2 bg-black/40 rounded-full text-slate-400 cursor-not-allowed">
                  <X className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 text-center">Imágenes del Anuncio (Máximo 5)</h3>
                
                <div className="flex flex-wrap gap-4 justify-center">
                  {config.announcement.images.map((img, idx) => (
                    <div key={idx} className="relative w-32 h-48 rounded-lg overflow-hidden border border-slate-600 group">
                      <img src={img} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
                            onClick={() => {
                              updateNestedConfig(['announcement', 'images'], (old: string[]) => old.filter((_, i) => i !== idx));
                            }}>
                        <span className="text-white text-xs font-bold">X</span>
                      </div>
                    </div>
                  ))}
                  
                  {config.announcement.images.length < 5 && (
                    <EditableImage 
                      src="" 
                      onUpload={(url) => {
                        updateNestedConfig(['announcement', 'images'], (old: string[]) => [...old, url]);
                      }}
                    >
                      <div className="w-32 h-48 rounded-lg border-2 border-dashed border-sky-500/50 flex flex-col items-center justify-center text-sky-400 hover:bg-sky-500/10 cursor-pointer transition-colors">
                        <span className="text-2xl">+</span>
                        <span className="text-xs mt-2 text-center px-2">Añadir Imagen</span>
                      </div>
                    </EditableImage>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ambient Backgrounds */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-600/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px]" />
        </div>

        {/* 1. NAVIGATION BAR */}
        <nav className="sticky top-0 left-0 w-full z-40 border-b border-white/5 bg-[#0a0c10]/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            
            <div className="flex items-center gap-3">
              <EditableImage 
                src={config.nav.logoImage} 
                onUpload={(url) => updateNestedConfig(['nav', 'logoImage'], url)}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 overflow-hidden cursor-pointer border border-sky-500/30 hover:border-sky-500">
                  {config.nav.logoImage ? (
                    <img src={config.nav.logoImage} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="text-white w-5 h-5" />
                  )}
                </div>
              </EditableImage>
              <div className="font-bold tracking-widest text-lg hidden sm:block font-[family-name:var(--font-montserrat)] text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                <EditableText 
                  value={config.nav.logoText} 
                  onChange={(v) => updateNestedConfig(['nav', 'logoText'], v)} 
                />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              {config.nav.links.map((link, i) => (
                <EditableText 
                  key={i} 
                  value={link.label} 
                  onChange={(v) => {
                    const newLinks = [...config.nav.links];
                    newLinks[i].label = v;
                    updateNestedConfig(['nav', 'links'], newLinks);
                  }} 
                />
              ))}
            </div>

            <div>
              <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold flex items-center gap-2">
                <EditableText 
                  value={config.nav.ctaText} 
                  onChange={(v) => updateNestedConfig(['nav', 'ctaText'], v)} 
                />
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </nav>

        {/* 2. HERO SECTION */}
        <section className="relative w-full min-h-[90vh] flex items-center justify-center px-6 pt-10">
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#0a0c10]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c10]/40 via-[#0a0c10]/80 to-[#0a0c10] z-10 pointer-events-none"></div>
            
            <EditableImage 
              src={config.hero.images[currentImageIndex]} 
              onUpload={(url) => {
                updateNestedConfig(['hero', 'images'], (old: string[]) => {
                  const newArray = [...old];
                  newArray[currentImageIndex] = url;
                  return newArray;
                });
              }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                key={currentImageIndex}
                src={config.hero.images[currentImageIndex] || "https://images.unsplash.com/photo-1541888081622-15cb343d3b40?q=80&w=2070&auto=format&fit=crop"}
                alt="Fondo de Construcción" 
                className="w-full h-full object-cover absolute inset-0 opacity-40 scale-100"
              />
            </EditableImage>
            
            {/* Quick Background Manager */}
            <div className="absolute top-24 right-6 z-50 bg-slate-900/90 border border-slate-700 p-4 rounded-xl shadow-xl flex flex-col gap-3 backdrop-blur-sm max-w-[200px]">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700 pb-2">Fondos Rotativos</h4>
              <div className="flex flex-wrap gap-2">
                {config.hero.images.map((img, i) => (
                  <div key={i} className={`w-10 h-10 rounded border-2 cursor-pointer overflow-hidden relative group ${i === currentImageIndex ? 'border-sky-500' : 'border-transparent'}`} onClick={() => setCurrentImageIndex(i)}>
                    <img src={img} className="w-full h-full object-cover" />
                    {config.hero.images.length > 1 && (
                      <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => {
                        e.stopPropagation();
                        updateNestedConfig(['hero', 'images'], (old: string[]) => old.filter((_, idx) => idx !== i));
                        setCurrentImageIndex(0);
                      }}>
                        <span className="text-white text-xs font-bold">X</span>
                      </div>
                    )}
                  </div>
                ))}
                
                <EditableImage 
                  src="" 
                  onUpload={(url) => {
                    updateNestedConfig(['hero', 'images'], (old: string[]) => [...old, url]);
                    // Auto-select the newly added image
                    setCurrentImageIndex(config.hero.images.length);
                  }}
                >
                  <div className="w-10 h-10 rounded border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-sky-500 cursor-pointer">
                    +
                  </div>
                </EditableImage>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-20">
            <div className="flex flex-col items-center">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold tracking-widest uppercase mb-8">
                <ShieldCheck className="w-3.5 h-3.5" />
                <EditableText 
                  value={config.hero.badgeText} 
                  onChange={(v) => updateNestedConfig(['hero', 'badgeText'], v)} 
                />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 font-[family-name:var(--font-montserrat)] leading-tight whitespace-pre-wrap">
                <EditableText 
                  value={config.hero.titleHtml} 
                  onChange={(v) => updateNestedConfig(['hero', 'titleHtml'], v)} 
                  multiline
                />
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl font-[family-name:var(--font-work-sans)] leading-relaxed whitespace-pre-wrap">
                <EditableText 
                  value={config.hero.subtitle} 
                  onChange={(v) => updateNestedConfig(['hero', 'subtitle'], v)} 
                  multiline
                />
              </p>
              
              <div className="flex flex-col items-center gap-4">
                <div className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-sky-600 rounded-full shadow-lg shadow-sky-500/30">
                  <EditableText 
                    value={config.hero.ctaText} 
                    onChange={(v) => updateNestedConfig(['hero', 'ctaText'], v)} 
                  />
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>

                <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700/50 mt-4">
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">WhatsApp:</span>
                  <EditableText 
                    value={config.hero.phone} 
                    onChange={(v) => updateNestedConfig(['hero', 'phone'], v)} 
                    className="text-green-400 font-mono font-bold"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. SERVICES SECTION */}
        <section id="servicios" className="py-32 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-montserrat)] mb-4">
                <EditableText 
                  value={config.services.title} 
                  onChange={(v) => updateNestedConfig(['services', 'title'], v)} 
                />
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-indigo-500 mx-auto rounded-full mb-6"></div>
              <p className="text-slate-400 max-w-2xl mx-auto">
                <EditableText 
                  value={config.services.subtitle} 
                  onChange={(v) => updateNestedConfig(['services', 'subtitle'], v)} 
                  multiline
                />
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {config.services.items.map((service, i) => {
                const Icon = iconMap[service.iconType] || Hammer;
                return (
                  <div key={i} className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-2xl relative">
                    
                    <div className="w-14 h-14 rounded-xl bg-sky-500/10 flex items-center justify-center mb-6 relative">
                      <Icon className="w-7 h-7 text-sky-400" />
                      <select 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        value={service.iconType}
                        onChange={(e) => {
                          const newItems = [...config.services.items];
                          newItems[i].iconType = e.target.value;
                          updateNestedConfig(['services', 'items'], newItems);
                        }}
                      >
                        {Object.keys(iconMap).map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>

                    <h3 className="text-xl font-bold mb-3 font-[family-name:var(--font-montserrat)] text-white">
                      <EditableText 
                        value={service.title} 
                        onChange={(v) => {
                          const newItems = [...config.services.items];
                          newItems[i].title = v;
                          updateNestedConfig(['services', 'items'], newItems);
                        }} 
                      />
                    </h3>
                    <p className="text-slate-400 leading-relaxed font-[family-name:var(--font-work-sans)] mb-6">
                      <EditableText 
                        value={service.desc} 
                        onChange={(v) => {
                          const newItems = [...config.services.items];
                          newItems[i].desc = v;
                          updateNestedConfig(['services', 'items'], newItems);
                        }} 
                        multiline
                      />
                    </p>

                    {/* Services Gallery Mini-Manager */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex justify-between items-center">
                        Galería de Imágenes 
                        <span className="text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded">{service.images.length}</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {service.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="w-12 h-12 rounded border border-slate-700 overflow-hidden relative group">
                            <img src={img} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
                                 onClick={() => {
                                   const newItems = [...config.services.items];
                                   newItems[i].images = newItems[i].images.filter((_, idx) => idx !== imgIdx);
                                   updateNestedConfig(['services', 'items'], newItems);
                                 }}>
                              <span className="text-white text-xs font-bold">X</span>
                            </div>
                          </div>
                        ))}
                        <EditableImage 
                          src="" 
                          onUpload={(url) => {
                            const newItems = [...config.services.items];
                            newItems[i].images = [...(newItems[i].images || []), url];
                            updateNestedConfig(['services', 'items'], newItems);
                          }}
                        >
                          <div className="w-12 h-12 rounded border border-dashed border-sky-500/50 flex items-center justify-center text-sky-400 hover:bg-sky-500/10 cursor-pointer transition-colors">
                            +
                          </div>
                        </EditableImage>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </section>


        {/* 4. THE STANDARD SECTION */}
        <section id="estandar" className="py-32 px-6 border-t border-white/5 bg-[#0a0c10]/80 backdrop-blur-xl relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-montserrat)] mb-6 leading-tight whitespace-pre-wrap">
                  <EditableText 
                    value={config.standard.titleHtml} 
                    onChange={(v) => updateNestedConfig(['standard', 'titleHtml'], v)} 
                    multiline
                  />
                </h2>
                <p className="text-lg text-slate-400 mb-10 font-[family-name:var(--font-work-sans)]">
                  <EditableText 
                    value={config.standard.subtitle} 
                    onChange={(v) => updateNestedConfig(['standard', 'subtitle'], v)} 
                    multiline
                  />
                </p>

                <div className="space-y-6">
                  {config.standard.items.map((item, i) => {
                    const Icon = iconMap[item.iconType] || ShieldCheck;
                    return (
                      <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="mt-1 relative">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 relative">
                            <Icon className="w-5 h-5 text-indigo-400" />
                            <select 
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              value={item.iconType}
                              onChange={(e) => {
                                const newItems = [...config.standard.items];
                                newItems[i].iconType = e.target.value;
                                updateNestedConfig(['standard', 'items'], newItems);
                              }}
                            >
                              {Object.keys(iconMap).map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-white font-bold tracking-wide mb-1 font-[family-name:var(--font-montserrat)]">
                            <EditableText 
                              value={item.title} 
                              onChange={(v) => {
                                const newItems = [...config.standard.items];
                                newItems[i].title = v;
                                updateNestedConfig(['standard', 'items'], newItems);
                              }} 
                            />
                          </h4>
                          <p className="text-slate-400 text-sm leading-relaxed">
                            <EditableText 
                              value={item.desc} 
                              onChange={(v) => {
                                const newItems = [...config.standard.items];
                                newItems[i].desc = v;
                                updateNestedConfig(['standard', 'items'], newItems);
                              }} 
                              multiline
                            />
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="relative h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-sky-900/20">
                <EditableImage 
                  src={config.standard.image}
                  onUpload={(url) => updateNestedConfig(['standard', 'image'], url)}
                  className="w-full h-full"
                >
                  <img 
                    className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700" 
                    alt="Standard" 
                    src={config.standard.image} 
                  />
                </EditableImage>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            STATUS SEARCH PREVIEW
            ========================================= */}
        {config.statusSearch?.enabled && (
          <section className="py-12 px-6 border-t border-white/5 bg-[#0a0c10]">
            <div className="max-w-6xl mx-auto bg-slate-900/50 rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">
                <EditableText 
                  value={config.statusSearch.title} 
                  onChange={(v) => updateNestedConfig(['statusSearch', 'title'], v)} 
                />
              </h2>
              <p className="text-slate-400 text-center mb-8">
                <EditableText 
                  value={config.statusSearch.subtitle} 
                  onChange={(v) => updateNestedConfig(['statusSearch', 'subtitle'], v)} 
                  multiline
                />
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto pointer-events-none opacity-50 grayscale">
                <input 
                  type="text" 
                  placeholder="Ingrese número de DNI" 
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                />
                <button className="bg-sky-600 text-white font-bold px-8 py-3 rounded-lg">
                  Buscar
                </button>
              </div>
              <p className="text-xs text-center text-slate-500 mt-4">(Esta es una vista previa, la búsqueda real funcionará en la página pública)</p>
            </div>
          </section>
        )}

        {/* 5. FOOTER */}
        <footer id="contacto" className="border-t border-white/10 py-16 bg-[#06080a] relative z-10">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <EditableImage 
                  src={config.footer.logoImage} 
                  onUpload={(url) => updateNestedConfig(['footer', 'logoImage'], url)}
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center overflow-hidden cursor-pointer">
                    {config.footer.logoImage ? (
                      <img src={config.footer.logoImage} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="text-white w-4 h-4" />
                    )}
                  </div>
                </EditableImage>
                <span className="font-bold tracking-widest text-white font-[family-name:var(--font-montserrat)]">
                  <EditableText 
                    value={config.footer.companyName} 
                    onChange={(v) => updateNestedConfig(['footer', 'companyName'], v)} 
                  />
                </span>
              </div>
              <p className="text-slate-500 text-sm max-w-sm mb-6">
                <EditableText 
                  value={config.footer.description} 
                  onChange={(v) => updateNestedConfig(['footer', 'description'], v)} 
                  multiline
                />
              </p>
              <div className="text-slate-600 text-xs">
                © {new Date().getFullYear()} <EditableText value={config.footer.copyright} onChange={(v) => updateNestedConfig(['footer', 'copyright'], v)} />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold mb-2">Navegación (Solo vista)</h4>
              {config.nav.links.map((link, i) => (
                <span key={i} className="text-slate-500 text-sm">{link.label}</span>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
