"use client";

import React, { useState, useEffect } from 'react';
import { 
  Save, Loader2, ArrowRight, ShieldCheck, Building2, Hammer, Ruler, 
  Clock, Award, HelpCircle, HardHat, Pickaxe, Shovel, Truck, Warehouse, 
  Wrench, Paintbrush, X, Bot, Plus, ImageIcon
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

function ProjectCarousel({ images, onImagesChange }: { images: string[], onImagesChange?: (urls: string[]) => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
      return (
          <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center gap-2">
              <span className="text-slate-400">Sin imágenes</span>
              {onImagesChange && (
                  <EditableImage src="" onUpload={(u) => onImagesChange([u])}>
                      <button className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded">Agregar Imagen</button>
                  </EditableImage>
              )}
          </div>
      );
  }

  return (
    <div className="relative w-full h-full overflow-hidden group/carousel">
      <AnimatePresence initial={false}>
        <motion.img
          key={index}
          src={images[index]}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          alt="Proyecto"
        />
      </AnimatePresence>
      {onImagesChange && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20">
            <EditableImage src="" onUpload={(u) => onImagesChange([...images, u])}>
                <button className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl shadow-lg leading-none">+</button>
            </EditableImage>
            {images.length > 1 && (
                <button 
                    onClick={() => onImagesChange(images.filter((_, i) => i !== index))}
                    className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm shadow-lg leading-none"
                >×</button>
            )}
        </div>
      )}
    </div>
  );
}

export function LandingCMS() {
  const [config, setConfig] = useState<LandingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // For services gallery modal in CMS
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/landing-config?t=${Date.now()}`)
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
            footer: { ...DEFAULT_LANDING_CONTENT.footer, ...data.content.footer, links: data.content.footer?.links || DEFAULT_LANDING_CONTENT.footer.links, socialLinks: data.content.footer?.socialLinks || DEFAULT_LANDING_CONTENT.footer.socialLinks },
            statusSearch: { ...DEFAULT_LANDING_CONTENT.statusSearch, ...data.content.statusSearch },
            projects: { ...DEFAULT_LANDING_CONTENT.projects, ...data.content.projects },
            announcement: { 
              ...DEFAULT_LANDING_CONTENT.announcement, 
              ...data.content.announcement,
              images: data.content.announcement?.images || [],
              backdropOpacity: data.content.announcement?.backdropOpacity ?? 80
            },
            about: {
              ...DEFAULT_LANDING_CONTENT.about,
              ...data.content.about
            },
            chatbot: {
              systemPrompt: data.content.chatbot?.systemPrompt || DEFAULT_LANDING_CONTENT.chatbot!.systemPrompt,
              companyInfo: data.content.chatbot?.companyInfo || DEFAULT_LANDING_CONTENT.chatbot!.companyInfo,
              images: data.content.chatbot?.images || DEFAULT_LANDING_CONTENT.chatbot!.images,
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
    <div className="relative w-full h-[calc(100vh-80px)] bg-[#2a3a55] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      
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
            <span className="text-xs text-white font-bold">DNI</span>
          </label>

          {/* Go to Chatbot config (scroll) */}
          <button 
            onClick={() => document.getElementById('chatbot-config')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 bg-indigo-900/50 hover:bg-indigo-800/50 px-3 py-1.5 rounded-lg border border-indigo-500/50 transition-colors text-indigo-300 hover:text-indigo-200"
          >
            <Bot className="w-4 h-4" />
            <span className="text-xs font-bold">Chatbot IA</span>
          </button>

          {/* About Toggle */}
          <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-sky-500 transition-colors">
            <input 
              type="checkbox" 
              className="accent-sky-500 w-4 h-4"
              checked={config.about?.enabled ?? false}
              onChange={(e) => updateNestedConfig(['about', 'enabled'], e.target.checked)}
            />
            <span className="text-xs text-white font-bold">Nosotros</span>
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
      <div className="flex-1 overflow-y-auto bg-[#F5F5F5] text-slate-900 font-sans relative selection:bg-slate-300/50">
        
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
        <nav className="w-full z-40 bg-[#F9FAFB] py-6 px-6 md:px-12 transition-all duration-300 pointer-events-none">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <EditableImage 
                src={config.nav.logoImage} 
                onUpload={(url) => updateNestedConfig(['nav', 'logoImage'], url)}
                className="pointer-events-auto"
              >
                <div className="w-10 h-10 flex items-center justify-center overflow-hidden border border-dashed border-slate-300 rounded cursor-pointer hover:bg-slate-50">
                  {config.nav.logoImage ? (
                    <img src={config.nav.logoImage} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="text-slate-900 w-8 h-8" />
                  )}
                </div>
              </EditableImage>
              <div className="flex flex-col leading-none pointer-events-auto">
                <span className="font-extrabold text-xl md:text-2xl font-[family-name:var(--font-montserrat)] text-slate-900 tracking-tight whitespace-pre-line">
                  <EditableText 
                    value={config.nav.logoText} 
                    onChange={(v) => updateNestedConfig(['nav', 'logoText'], v)} 
                    fontFamily={config.fonts?.['nav.logoText']} 
                    onFontChange={(v) => updateNestedConfig(['fonts', 'nav.logoText'], v)} color={config.colors?.['nav.logoText']} onColorChange={(v) => updateNestedConfig(['colors', 'nav.logoText'], v)}
                    multiline
                  />
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 text-[15px] font-semibold text-slate-600 font-[family-name:var(--font-work-sans)] pointer-events-auto">
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

            <div className="pointer-events-auto flex items-center gap-4">
              <div className="px-8 py-3 rounded-full bg-[#1c2331] text-white hover:bg-slate-800 text-[15px] font-medium transition-all shadow-md whitespace-nowrap cursor-text flex flex-col">
                <EditableText 
                  value={config.nav.ctaText} 
                  onChange={(v) => updateNestedConfig(['nav', 'ctaText'], v)} 
                  fontFamily={config.fonts?.['nav.ctaText']} 
                  onFontChange={(v) => updateNestedConfig(['fonts', 'nav.ctaText'], v)} color={config.colors?.['nav.ctaText']} onColorChange={(v) => updateNestedConfig(['colors', 'nav.ctaText'], v)}
                />
              </div>
              <div className="flex items-center text-xs text-slate-500 bg-white px-2 py-1 rounded shadow-sm border border-slate-200">
                <span className="mr-1">WhatsApp:</span>
                <EditableText value={config.hero.phone} onChange={(v) => updateNestedConfig(['hero', 'phone'], v)} fontFamily={config.fonts?.['hero.phone']} onFontChange={(v) => updateNestedConfig(['fonts', 'hero.phone'], v)} color={config.colors?.['hero.phone']} onColorChange={(v) => updateNestedConfig(['colors', 'hero.phone'], v)} />
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-[1400px] mx-auto">
          
          {/* HERO */}
          <section className="relative w-full mt-4 mb-16">
            <div className="relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden min-h-[500px] md:min-h-[650px] w-full flex items-center shadow-lg">
              
              <div className="absolute inset-0 z-0">
                <EditableImage 
                  src={config.hero.images[currentImageIndex]} 
                  onUpload={(url) => {
                    updateNestedConfig(['hero', 'images'], (old: string[] = []) => {
                      const newArray = [...old];
                      newArray[currentImageIndex] = url;
                      return newArray;
                    });
                  }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img 
                    key={currentImageIndex}
                    src={config.hero.images[currentImageIndex] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"}
                    alt="Hero Image" 
                    className="w-full h-full object-cover absolute inset-0"
                  />
                </EditableImage>
                <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none"></div>
              </div>

              <div className="absolute bottom-6 right-6 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50">
                  <div className="w-full">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-2 shadow-sm">
                      Imágenes de Fondo ({config.hero.images?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(config.hero.images || []).map((img, imgIdx) => (
                        <div key={imgIdx} onClick={() => setCurrentImageIndex(imgIdx)} className={`w-10 h-10 rounded border overflow-hidden relative group cursor-pointer transition-all ${currentImageIndex === imgIdx ? 'border-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]' : 'border-white/50 hover:border-sky-300'}`}>
                          <img src={img} className="w-full h-full object-cover" />
                          <div 
                            className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
                            onClick={(e) => {
                              e.stopPropagation();
                              const newImages = [...config.hero.images];
                              newImages.splice(imgIdx, 1);
                              updateNestedConfig(['hero', 'images'], newImages);
                              if (currentImageIndex >= newImages.length) {
                                setCurrentImageIndex(Math.max(0, newImages.length - 1));
                              }
                            }}
                          >
                            <span className="text-white text-xs font-bold">X</span>
                          </div>
                        </div>
                      ))}
                      <EditableImage 
                        src="" 
                        onUpload={(url) => {
                          const newImages = [...(config.hero.images || []), url];
                          updateNestedConfig(['hero', 'images'], newImages);
                          setCurrentImageIndex(newImages.length - 1);
                        }}
                      >
                        <div className="w-10 h-10 rounded border border-dashed border-white/60 bg-white/20 flex items-center justify-center text-slate-800 hover:bg-white/40 cursor-pointer transition-colors text-lg font-bold">
                          +
                        </div>
                      </EditableImage>
                    </div>
                  </div>

                </div>
              </div>
              
          </section>

          {/* DOS COLUMNAS: SERVICIOS Y DNI */}
          <section className="w-full mb-16">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-10">
              
              {/* IZQUIERDA: SERVICIOS */}
              <div className="flex flex-col">
                <h2 className="text-3xl font-extrabold font-[family-name:var(--font-montserrat)] text-slate-900 mb-8">
                  <EditableText value={config.services.title} onChange={(v) => updateNestedConfig(['services', 'title'], v)} fontFamily={config.fonts?.['services.title']} onFontChange={(v) => updateNestedConfig(['fonts', 'services.title'], v)} color={config.colors?.['services.title']} onColorChange={(v) => updateNestedConfig(['colors', 'services.title'], v)} />
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                  {config.services.items.map((service, i) => {
                    const Icon = iconMap[service.iconType] || Hammer;
                    const visualNumbers = [
                      { num: "10+", txt: "Años de Experiencia" },
                      { num: "500+", txt: "Casas Construidas" },
                      { num: "98%", txt: "Clientes Satisfechos" }
                    ];
                    const stats = visualNumbers[i % visualNumbers.length];
                    
                    return (
                      <div key={i} className="flex flex-col bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 transition-all">
                        <div className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center mb-6 relative group">
                          <Icon className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
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
                        <h3 className="text-xl font-bold mb-3 font-[family-name:var(--font-montserrat)] text-slate-900">
                          <EditableText fontFamily={config.fonts?.[`services.items.${i}.title`]} onFontChange={(val) => updateNestedConfig(['fonts', `services.items.${i}.title`], val)} color={config.colors?.[`services.items.${i}.title`]} onColorChange={(val) => updateNestedConfig(['colors', `services.items.${i}.title`], val)} value={service.title} onChange={(v) => {
                              const newItems = [...config.services.items];
                              newItems[i].title = v;
                              updateNestedConfig(['services', 'items'], newItems);
                            }} 
                          />
                        </h3>
                        <p className="text-[15px] text-slate-500 leading-relaxed font-[family-name:var(--font-work-sans)] mb-8 flex-1">
                          <EditableText fontFamily={config.fonts?.[`services.items.${i}.desc`]} onFontChange={(val) => updateNestedConfig(['fonts', `services.items.${i}.desc`], val)} color={config.colors?.[`services.items.${i}.desc`]} onColorChange={(val) => updateNestedConfig(['colors', `services.items.${i}.desc`], val)} value={service.desc} onChange={(v) => {
                              const newItems = [...config.services.items];
                              newItems[i].desc = v;
                              updateNestedConfig(['services', 'items'], newItems);
                            }} 
                            multiline
                          />
                        </p>
                        
                        <div className="mt-auto">
                          <div className="text-4xl font-black text-slate-900 font-[family-name:var(--font-montserrat)] tracking-tight mb-1">
                            <EditableText 
                                fontFamily={config.fonts?.[`services.items.${i}.statNum`]} 
                                onFontChange={(val) => updateNestedConfig(['fonts', `services.items.${i}.statNum`], val)} 
                                color={config.colors?.[`services.items.${i}.statNum`]} 
                                onColorChange={(val) => updateNestedConfig(['colors', `services.items.${i}.statNum`], val)} 
                                value={service.statNum || "0"} 
                                onChange={(v) => {
                                  const newItems = [...config.services.items];
                                  newItems[i].statNum = v;
                                  updateNestedConfig(['services', 'items'], newItems);
                                }} 
                            />
                          </div>
                          <div className="text-sm font-medium text-slate-500">
                            <EditableText 
                                fontFamily={config.fonts?.[`services.items.${i}.statText`]} 
                                onFontChange={(val) => updateNestedConfig(['fonts', `services.items.${i}.statText`], val)} 
                                color={config.colors?.[`services.items.${i}.statText`]} 
                                onColorChange={(val) => updateNestedConfig(['colors', `services.items.${i}.statText`], val)} 
                                value={service.statText || "Dato"} 
                                onChange={(v) => {
                                  const newItems = [...config.services.items];
                                  newItems[i].statText = v;
                                  updateNestedConfig(['services', 'items'], newItems);
                                }} 
                            />
                          </div>
                        </div>

                        {/* Services Gallery Mini-Manager */}
                        <div className="mt-6 pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Imágenes ({service.images?.length || 0})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {(service.images || []).map((img, imgIdx) => (
                              <div key={imgIdx} className="w-10 h-10 rounded border border-slate-200 overflow-hidden relative group">
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
                              <div className="w-10 h-10 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors text-lg">
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

              {/* DERECHA: CONSULTA DNI PREVIEW */}
              {config.statusSearch?.enabled && (
                <div className="flex flex-col">
                  <h2 className="text-3xl font-extrabold font-[family-name:var(--font-montserrat)] text-slate-900 mb-8 flex gap-2">
                    <EditableText value={config.statusSearch.sectionTitle || "Consulta tu DNI"} onChange={(v) => updateNestedConfig(['statusSearch', 'sectionTitle'], v)} fontFamily={config.fonts?.['statusSearch.sectionTitle']} onFontChange={(v) => updateNestedConfig(['fonts', 'statusSearch.sectionTitle'], v)} color={config.colors?.['statusSearch.sectionTitle']} onColorChange={(v) => updateNestedConfig(['colors', 'statusSearch.sectionTitle'], v)} />
                  </h2>
                  
                  <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex-1 flex flex-col relative z-10 max-w-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 font-[family-name:var(--font-montserrat)]"><EditableText value={config.statusSearch.title} onChange={(v) => updateNestedConfig(['statusSearch', 'title'], v)} fontFamily={config.fonts?.['statusSearch.title']} onFontChange={(v) => updateNestedConfig(['fonts', 'statusSearch.title'], v)} color={config.colors?.['statusSearch.title']} onColorChange={(v) => updateNestedConfig(['colors', 'statusSearch.title'], v)} /></h3>
                    <p className="text-slate-500 text-[14px] mb-6 font-[family-name:var(--font-work-sans)]">
                      <EditableText value={config.statusSearch.subtitle} onChange={(v) => updateNestedConfig(['statusSearch', 'subtitle'], v)} fontFamily={config.fonts?.['statusSearch.subtitle']} onFontChange={(v) => updateNestedConfig(['fonts', 'statusSearch.subtitle'], v)} color={config.colors?.['statusSearch.subtitle']} onColorChange={(v) => updateNestedConfig(['colors', 'statusSearch.subtitle'], v)} multiline />
                    </p>
                    
                    <div className="flex flex-row items-center gap-3 opacity-50 grayscale pointer-events-none">
                      <input 
                        type="text" 
                        placeholder={config.statusSearch.placeholder} 
                        className="w-[140px] bg-white border border-slate-300 rounded-[0.8rem] px-4 py-2.5 text-slate-900"
                        readOnly
                      />
                      <button className="bg-[#2563eb] text-white font-semibold px-6 py-2.5 rounded-[1rem] whitespace-nowrap text-[15px]">
                        <EditableText value={config.statusSearch.buttonText} onChange={(v) => updateNestedConfig(['statusSearch', 'buttonText'], v)} fontFamily={config.fonts?.['statusSearch.buttonText']} onFontChange={(v) => updateNestedConfig(['fonts', 'statusSearch.buttonText'], v)} color={config.colors?.['statusSearch.buttonText']} onColorChange={(v) => updateNestedConfig(['colors', 'statusSearch.buttonText'], v)} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </section>

          {/* ULTIMOS PROYECTOS */}
          <section className="w-full mb-16">
            <h2 className="text-3xl font-extrabold font-[family-name:var(--font-montserrat)] text-slate-900 mb-8"><EditableText value={config.projects.title} onChange={(v) => updateNestedConfig(['projects', 'title'], v)} fontFamily={config.fonts?.['projects.title']} onFontChange={(v) => updateNestedConfig(['fonts', 'projects.title'], v)} color={config.colors?.['projects.title']} onColorChange={(v) => updateNestedConfig(['colors', 'projects.title'], v)} /></h2>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(config.projects.items || []).map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-4 group cursor-pointer relative border border-slate-200/50 p-2 rounded-[2.5rem]">
                    <button onClick={() => {
                        const newItems = [...config.projects.items];
                        newItems.splice(idx, 1);
                        updateNestedConfig(['projects', 'items'], newItems);
                    }} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center z-30 shadow-md">×</button>
                    <div className="w-full h-[280px] rounded-[2rem] overflow-hidden shadow-sm relative">
                      <ProjectCarousel 
                          images={item.images} 
                          onImagesChange={(urls) => {
                              const newItems = [...config.projects.items];
                              newItems[idx].images = urls;
                              updateNestedConfig(['projects', 'items'], newItems);
                          }}
                      />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 px-2 text-center">
                        <EditableText fontFamily={config.fonts?.[`projects.items.${idx}.title`]} onFontChange={(val) => updateNestedConfig(['fonts', `projects.items.${idx}.title`], val)} color={config.colors?.[`projects.items.${idx}.title`]} onColorChange={(val) => updateNestedConfig(['colors', `projects.items.${idx}.title`], val)} value={item.title} onChange={(v) => {
                                const newItems = [...config.projects.items];
                                newItems[idx].title = v;
                                updateNestedConfig(['projects', 'items'], newItems);
                            }} 
                        />
                    </h4>

                    {/* Projects Gallery Mini-Manager */}
                    <div className="mt-4 pt-4 border-t border-slate-100 px-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Imágenes ({item.images?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(item.images || []).map((img, imgIdx) => (
                          <div key={imgIdx} className="w-10 h-10 rounded border border-slate-200 overflow-hidden relative group">
                            <img src={img} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newItems = [...config.projects.items];
                                    newItems[idx].images = newItems[idx].images.filter((_, idx2) => idx2 !== imgIdx);
                                    updateNestedConfig(['projects', 'items'], newItems);
                                  }}>
                              <span className="text-white text-xs font-bold">X</span>
                            </div>
                          </div>
                        ))}
                        <EditableImage 
                          src="" 
                          onUpload={(url) => {
                            const newItems = [...config.projects.items];
                            newItems[idx].images = [...(newItems[idx].images || []), url];
                            updateNestedConfig(['projects', 'items'], newItems);
                          }}
                        >
                          <div className="w-10 h-10 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors text-lg">
                            +
                          </div>
                        </EditableImage>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
              <button 
                onClick={() => {
                    const newItems = [...(config.projects.items || []), { images: [], title: "Nuevo Proyecto" }];
                    updateNestedConfig(['projects', 'items'], newItems);
                }}
                className="mx-auto mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-full transition-colors text-sm border border-slate-200 shadow-sm flex items-center gap-2"
              >
                + Añadir Tarjeta de Proyecto
              </button>
            </div>
          </section>

          {/* NOSOTROS */}
          {config.about?.enabled && (
            <section className="w-full mb-16">
              <div className="bg-white rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row gap-12 items-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
                <div className="w-full md:w-1/2">
                  <h2 className="text-3xl md:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-slate-900 mb-4">
                    <EditableText value={config.about.title} onChange={(v) => updateNestedConfig(['about', 'title'], v)} fontFamily={config.fonts?.['about.title']} onFontChange={(v) => updateNestedConfig(['fonts', 'about.title'], v)} color={config.colors?.['about.title']} onColorChange={(v) => updateNestedConfig(['colors', 'about.title'], v)} />
                  </h2>
                  <h3 className="text-xl font-bold text-[#2563eb] mb-6 font-[family-name:var(--font-montserrat)]">
                    <EditableText 
                      value={config.about.subtitle} 
                      onChange={(v) => updateNestedConfig(['about', 'subtitle'], v)} fontFamily={config.fonts?.['about.subtitle']} onFontChange={(v) => updateNestedConfig(['fonts', 'about.subtitle'], v)} color={config.colors?.['about.subtitle']} onColorChange={(v) => updateNestedConfig(['colors', 'about.subtitle'], v)} 
                    />
                  </h3>
                  <p className="text-[16px] text-slate-600 leading-relaxed font-[family-name:var(--font-work-sans)] whitespace-pre-wrap">
                    <EditableText value={config.about.content} onChange={(v) => updateNestedConfig(['about', 'content'], v)} fontFamily={config.fonts?.['about.content']} onFontChange={(v) => updateNestedConfig(['fonts', 'about.content'], v)} color={config.colors?.['about.content']} onColorChange={(v) => updateNestedConfig(['colors', 'about.content'], v)} multiline />
                  </p>
                </div>
                <div className="w-full md:w-1/2 rounded-[2rem] overflow-hidden shadow-lg h-[400px]">
                  <EditableImage 
                    src={config.about.image}
                    onUpload={(url) => updateNestedConfig(['about', 'image'], url)}
                    className="w-full h-full"
                  >
                    <img src={config.about.image} alt="Nosotros" className="w-full h-full object-cover" />
                  </EditableImage>
                </div>
              </div>
            </section>
          )}

        </main>

        {/* FOOTER OSCURO */}
        <footer className="w-full px-4 md:px-8 mb-8 mt-auto">
          <div className="max-w-[1400px] mx-auto bg-[#1a202c] rounded-3xl p-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6 text-white shadow-xl">
            
            <div className="flex flex-col gap-2 items-center md:items-start w-full md:w-auto relative border border-slate-700/50 p-4 rounded-xl">
              <h2 className="font-extrabold text-xl font-[family-name:var(--font-montserrat)] flex items-center gap-2">
                <EditableImage 
                  src={config.footer.logoImage} 
                  onUpload={(url) => updateNestedConfig(['footer', 'logoImage'], url)}
                >
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden cursor-pointer border border-slate-700">
                    {config.footer.logoImage ? (
                      <img src={config.footer.logoImage} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="text-white w-4 h-4" />
                    )}
                  </div>
                </EditableImage>
                <EditableText 
                  value={config.footer.companyName} 
                  onChange={(v) => updateNestedConfig(['footer', 'companyName'], v)} 
                  fontFamily={config.fonts?.['footer.companyName']} 
                  onFontChange={(v) => updateNestedConfig(['fonts', 'footer.companyName'], v)} color={config.colors?.['footer.companyName']} onColorChange={(v) => updateNestedConfig(['colors', 'footer.companyName'], v)}
                />
              </h2>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {config.footer.links.map((link, i) => (
                  <div key={i} className="flex items-center gap-1 group/link text-slate-400 text-sm hover:text-white transition-colors">
                    <EditableText fontFamily={config.fonts?.[`nav.links.${i}.label`]} onFontChange={(val) => updateNestedConfig(['fonts', `nav.links.${i}.label`], val)} color={config.colors?.[`nav.links.${i}.label`]} onColorChange={(val) => updateNestedConfig(['colors', `nav.links.${i}.label`], val)} value={link.label} onChange={(v) => { const newLinks = [...config.footer.links]; newLinks[i].label = v; updateNestedConfig(['footer', 'links'], newLinks); }} />
                    <button onClick={() => { const newLinks = [...config.footer.links]; newLinks.splice(i, 1); updateNestedConfig(['footer', 'links'], newLinks); }} className="opacity-0 group-hover/link:opacity-100 text-red-400 text-xs hover:text-red-300">×</button>
                  </div>
                ))}
                <button onClick={() => { const newLinks = [...config.footer.links, {label: 'Nuevo', href: '#'}]; updateNestedConfig(['footer', 'links'], newLinks); }} className="text-xs text-blue-400 hover:text-blue-300">+ Link</button>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0 relative border border-slate-700/50 p-4 rounded-xl">
              <div className="flex flex-col items-center md:items-end text-sm text-slate-400 font-mono gap-1">
                <span className="flex items-center gap-2"><EditableText value={config.hero.phone} onChange={(v) => updateNestedConfig(['hero', 'phone'], v)} fontFamily={config.fonts?.['hero.phone']} onFontChange={(v) => updateNestedConfig(['fonts', 'hero.phone'], v)} color={config.colors?.['hero.phone']} onColorChange={(v) => updateNestedConfig(['colors', 'hero.phone'], v)} /></span>
                <span className="flex items-center gap-2"><EditableText value={config.footer.email} onChange={(v) => updateNestedConfig(['footer', 'email'], v)} fontFamily={config.fonts?.['footer.email']} onFontChange={(v) => updateNestedConfig(['fonts', 'footer.email'], v)} color={config.colors?.['footer.email']} onColorChange={(v) => updateNestedConfig(['colors', 'footer.email'], v)} /></span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {(config.footer.socialLinks || []).map((social, i) => (
                  <div key={i} className="flex flex-col gap-1 items-center bg-slate-800 p-2 rounded-lg border border-slate-700 group/social">
                    <select 
                      value={social.platform}
                      onChange={(e) => {
                          const newSocials = [...config.footer.socialLinks];
                          newSocials[i].platform = e.target.value;
                          updateNestedConfig(['footer', 'socialLinks'], newSocials);
                      }}
                      className="bg-slate-700 text-xs text-white p-1 rounded cursor-pointer w-[70px] outline-none"
                    >
                        <option value="facebook">FB</option>
                        <option value="instagram">IG</option>
                        <option value="linkedin">IN</option>
                        <option value="tiktok">TK</option>
                        <option value="youtube">YT</option>
                    </select>
                    <div className="w-full text-center text-[10px] text-slate-400">
                        <EditableText value={social.url} onChange={(v) => {
                            const newSocials = [...config.footer.socialLinks];
                            newSocials[i].url = v;
                            updateNestedConfig(['footer', 'socialLinks'], newSocials);
                        }} />
                    </div>
                    <button onClick={() => { const newSocials = [...config.footer.socialLinks]; newSocials.splice(i, 1); updateNestedConfig(['footer', 'socialLinks'], newSocials); }} className="text-red-400 text-xs mt-1">Borrar</button>
                  </div>
                ))}
                <button onClick={() => { const newSocials = [...(config.footer.socialLinks || []), {platform: 'facebook', url: '#'}]; updateNestedConfig(['footer', 'socialLinks'], newSocials); }} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded">+ Red Social</button>
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center gap-2">© {new Date().getFullYear()} <EditableText value={config.footer.copyright} onChange={(v) => updateNestedConfig(['footer', 'copyright'], v)} fontFamily={config.fonts?.['footer.copyright']} onFontChange={(v) => updateNestedConfig(['fonts', 'footer.copyright'], v)} color={config.colors?.['footer.copyright']} onColorChange={(v) => updateNestedConfig(['colors', 'footer.copyright'], v)} /></div>
            </div>

          </div>
        </footer>

        {/* CHATBOT IA CONFIGURATION */}
        <section id="chatbot-config" className="w-full px-4 md:px-8 mb-12">
          <div className="max-w-[1400px] mx-auto bg-white rounded-3xl p-6 md:p-10 shadow-xl border-2 border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-montserrat)] text-slate-800">Cerebro del Chatbot IA</h2>
                <p className="text-slate-500 text-sm">Entrena a tu asistente virtual con información clave y galería de imágenes.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Instrucciones de Comportamiento (System Prompt)</label>
                  <p className="text-xs text-slate-500 mb-2">Dile a la IA cómo debe comportarse y hablar con los clientes.</p>
                  <textarea
                    value={config.chatbot?.systemPrompt || ''}
                    onChange={(e) => updateNestedConfig(['chatbot', 'systemPrompt'], e.target.value)}
                    className="w-full h-32 p-3 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Ej. Eres un vendedor amable..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Información de la Empresa (Base de Conocimiento)</label>
                  <p className="text-xs text-slate-500 mb-2">Escribe aquí todo lo que la IA necesita saber: precios, medidas, requisitos de Techo Propio, historia de la empresa, etc.</p>
                  <textarea
                    value={config.chatbot?.companyInfo || ''}
                    onChange={(e) => updateNestedConfig(['chatbot', 'companyInfo'], e.target.value)}
                    className="w-full h-64 p-3 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Escribe la información aquí..."
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-indigo-500" /> Galería de la IA
                    </h3>
                    <p className="text-xs text-slate-500">Imágenes que la IA podrá enviar a los clientes.</p>
                  </div>
                  <EditableImage src="" onUpload={(url) => {
                    const newImages = [...(config.chatbot?.images || []), { title: 'Nueva Imagen', category: 'Planos', url }];
                    updateNestedConfig(['chatbot', 'images'], newImages);
                  }}>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors">
                      <Plus className="w-4 h-4" /> Añadir
                    </button>
                  </EditableImage>
                </div>

                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                  {(!config.chatbot?.images || config.chatbot.images.length === 0) && (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-sm text-slate-400">No hay imágenes en la galería de la IA.</p>
                    </div>
                  )}
                  {config.chatbot?.images?.map((img, i) => (
                    <div key={i} className="flex gap-4 p-3 bg-white border border-slate-200 rounded-xl shadow-sm relative group">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                        <img src={img.url} alt="img" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col gap-2 justify-center">
                        <EditableText 
                          value={img.title} 
                          onChange={(v) => {
                            const newImages = [...config.chatbot!.images];
                            newImages[i].title = v;
                            updateNestedConfig(['chatbot', 'images'], newImages);
                          }} 
                        />
                        <select 
                          value={img.category}
                          onChange={(e) => {
                            const newImages = [...config.chatbot!.images];
                            newImages[i].category = e.target.value;
                            updateNestedConfig(['chatbot', 'images'], newImages);
                          }}
                          className="bg-slate-100 border border-slate-200 text-xs p-1 rounded max-w-[120px] outline-none"
                        >
                          <option value="Planos">Planos</option>
                          <option value="Fachadas">Fachadas</option>
                          <option value="Proyectos">Proyectos</option>
                          <option value="Otros">Otros</option>
                        </select>
                      </div>
                      <button 
                        onClick={() => {
                          const newImages = [...config.chatbot!.images];
                          newImages.splice(i, 1);
                          updateNestedConfig(['chatbot', 'images'], newImages);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
