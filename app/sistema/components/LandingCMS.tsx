"use client";

import React, { useState, useEffect } from 'react';
import { 
  Save, Loader2, ArrowRight, ShieldCheck, Building2, Hammer, Ruler, 
  Clock, Award, HardHat, Pickaxe, Shovel, Truck, Warehouse, 
  Wrench, Paintbrush, X, Bot, Plus, ImageIcon, Video, CheckCircle2, 
  Trash2, UploadCloud, Sparkles, FileSearch, Home, PhoneCall, 
  MapPin, BadgeCheck, FileText, Check, ArrowUpRight, Eye, Layers, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LandingContent, LandingConfig, BotCharacter } from '@/lib/landing_db';
import { DEFAULT_LANDING_CONTENT } from '@/lib/landing_db';
import { EditableText } from './VisualEditor/EditableText';
import { EditableImage } from './VisualEditor/EditableImage';
import ChromaVideoAvatar from '@/app/components/ChromaVideoAvatar';

const iconMap: Record<string, any> = { 
  Ruler, Building2, Hammer, ArrowRight, ShieldCheck, Clock, Award, 
  HardHat, Pickaxe, Shovel, Truck, Warehouse, Wrench, Paintbrush,
  CheckCircle2, FileSearch, Home, PhoneCall, Sparkles, MapPin, BadgeCheck, FileText, Check
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
      <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center gap-2 p-4">
        <span className="text-slate-400 text-xs">Sin imágenes</span>
        {onImagesChange && (
          <EditableImage src="" onUpload={(u) => onImagesChange([u])}>
            <button className="px-3 py-1 bg-[#162839] text-white text-xs font-bold rounded-lg shadow">+ Agregar Imagen</button>
          </EditableImage>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden group/carousel bg-slate-900">
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
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20">
          <EditableImage src="" onUpload={(u) => onImagesChange([...images, u])}>
            <button className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg shadow-lg leading-none hover:bg-blue-700">+</button>
          </EditableImage>
          {images.length > 1 && (
            <button 
              onClick={() => onImagesChange(images.filter((_, i) => i !== index))}
              className="w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-lg leading-none hover:bg-red-700"
              title="Eliminar esta foto"
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
  const [activeTab, setActiveTab] = useState<'editor' | 'sections' | 'bot'>('editor');

  // For bot characters in CMS
  const [isAddingChar, setIsAddingChar] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharUrl, setNewCharUrl] = useState('');
  const [newCharGreenScreen, setNewCharGreenScreen] = useState(true);
  const [newCharSpeechText, setNewCharSpeechText] = useState('¡Hola! ¿Dudas sobre tu casa? Haz clic aquí 👋');
  const [uploadingCharFile, setUploadingCharFile] = useState(false);

  useEffect(() => {
    fetch(`/api/landing-config?t=${Date.now()}`)
      .then(r => r.json())
      .then((data: LandingConfig) => {
        if (data && data.content) {
          setConfig({
            ...DEFAULT_LANDING_CONTENT,
            ...data.content,
            topBar: { ...DEFAULT_LANDING_CONTENT.topBar!, ...(data.content.topBar || {}) },
            nav: { 
              ...DEFAULT_LANDING_CONTENT.nav, 
              ...(data.content.nav || {}),
              links: Array.isArray(data.content.nav?.links) ? data.content.nav.links : DEFAULT_LANDING_CONTENT.nav.links
            },
            hero: { 
              ...DEFAULT_LANDING_CONTENT.hero, 
              ...(data.content.hero || {}),
              stats: Array.isArray(data.content.hero?.stats) && data.content.hero.stats.length > 0
                ? data.content.hero.stats
                : DEFAULT_LANDING_CONTENT.hero.stats
            },
            services: { 
              ...DEFAULT_LANDING_CONTENT.services, 
              ...(data.content.services || {}),
              items: Array.isArray(data.content.services?.items) && data.content.services.items.length > 0
                ? data.content.services.items
                : DEFAULT_LANDING_CONTENT.services.items
            },
            standard: {
              ...DEFAULT_LANDING_CONTENT.standard,
              ...(data.content.standard || {}),
              items: Array.isArray(data.content.standard?.items) && data.content.standard.items.length > 0
                ? data.content.standard.items
                : DEFAULT_LANDING_CONTENT.standard.items
            },
            models3D: {
              ...DEFAULT_LANDING_CONTENT.models3D!,
              ...(data.content.models3D || {})
            },
            process: {
              ...DEFAULT_LANDING_CONTENT.process!,
              ...(data.content.process || {}),
              steps: Array.isArray(data.content.process?.steps) && data.content.process.steps.length > 0
                ? data.content.process.steps
                : DEFAULT_LANDING_CONTENT.process!.steps
            },
            footer: { 
              ...DEFAULT_LANDING_CONTENT.footer, 
              ...(data.content.footer || {}), 
              links: data.content.footer?.links || DEFAULT_LANDING_CONTENT.footer.links, 
              socialLinks: data.content.footer?.socialLinks || DEFAULT_LANDING_CONTENT.footer.socialLinks 
            },
            statusSearch: { 
              ...DEFAULT_LANDING_CONTENT.statusSearch, 
              ...(data.content.statusSearch || {}),
              bullets: Array.isArray(data.content.statusSearch?.bullets) && data.content.statusSearch.bullets.length > 0
                ? data.content.statusSearch.bullets
                : DEFAULT_LANDING_CONTENT.statusSearch.bullets
            },
            projects: { 
              ...DEFAULT_LANDING_CONTENT.projects, 
              ...(data.content.projects || {}),
              items: Array.isArray(data.content.projects?.items) && data.content.projects.items.length > 0
                ? data.content.projects.items
                : DEFAULT_LANDING_CONTENT.projects.items
            },
            announcement: { 
              ...DEFAULT_LANDING_CONTENT.announcement, 
              ...(data.content.announcement || {}),
              images: data.content.announcement?.images || [],
              backdropOpacity: data.content.announcement?.backdropOpacity ?? 80
            },
            about: {
              ...DEFAULT_LANDING_CONTENT.about,
              ...(data.content.about || {}),
              images: data.content.about?.images || DEFAULT_LANDING_CONTENT.about.images
            },
            chatbot: {
              enabled: data.content.chatbot?.enabled ?? DEFAULT_LANDING_CONTENT.chatbot!.enabled,
              systemPrompt: data.content.chatbot?.systemPrompt || DEFAULT_LANDING_CONTENT.chatbot!.systemPrompt,
              companyInfo: data.content.chatbot?.companyInfo || DEFAULT_LANDING_CONTENT.chatbot!.companyInfo,
              images: data.content.chatbot?.images || DEFAULT_LANDING_CONTENT.chatbot!.images,
              characters: (data.content.chatbot?.characters && data.content.chatbot.characters.length > 0)
                ? data.content.chatbot.characters
                : DEFAULT_LANDING_CONTENT.chatbot!.characters,
              activeCharacterId: data.content.chatbot?.activeCharacterId || DEFAULT_LANDING_CONTENT.chatbot!.activeCharacterId,
              speechText: data.content.chatbot?.speechText || DEFAULT_LANDING_CONTENT.chatbot!.speechText,
            },
            fonts: data.content.fonts || {},
            colors: data.content.colors || {}
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
      alert("¡Configuración 100% actualizada y publicada en vivo!");
    } catch (error) {
      alert("Hubo un error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const updateNestedConfig = (path: string[], valueOrUpdater: any) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const newConfig = JSON.parse(JSON.stringify(prev));
      let current = newConfig;
      for (let i = 0; i < path.length - 1; i++) {
        if (current[path[i]] === undefined) {
          current[path[i]] = {};
        }
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

  const handleActivateChar = (charId: string) => {
    if (!config?.chatbot) return;
    const chars = (config.chatbot.characters || []).map((c) => ({
      ...c,
      active: c.id === charId,
    }));
    updateNestedConfig(['chatbot', 'characters'], chars);
    updateNestedConfig(['chatbot', 'activeCharacterId'], charId);
  };

  const handleToggleGreenScreen = (charId: string, isGreenScreen: boolean) => {
    if (!config?.chatbot) return;
    const chars = (config.chatbot.characters || []).map((c) =>
      c.id === charId ? { ...c, isGreenScreen } : c
    );
    updateNestedConfig(['chatbot', 'characters'], chars);
  };

  const handleUpdateCharSpeechText = (charId: string, speechText: string) => {
    if (!config?.chatbot) return;
    const chars = (config.chatbot.characters || []).map((c) =>
      c.id === charId ? { ...c, speechText } : c
    );
    updateNestedConfig(['chatbot', 'characters'], chars);
  };

  const handleDeleteChar = (charId: string) => {
    if (!config?.chatbot) return;
    const chars = (config.chatbot.characters || []).filter((c) => c.id !== charId);
    if (chars.length > 0 && !chars.some((c) => c.active)) {
      chars[0].active = true;
    }
    updateNestedConfig(['chatbot', 'characters'], chars);
  };

  const handleCreateChar = () => {
    if (!newCharUrl.trim()) {
      alert("Por favor sube un archivo o ingresa una URL válida.");
      return;
    }
    const isVideo = newCharUrl.endsWith('.mp4') || newCharUrl.endsWith('.webm') || newCharUrl.includes('video') || newCharUrl.includes('.mp4');
    const newChar: BotCharacter = {
      id: `char-${Date.now()}`,
      name: newCharName.trim() || 'Nuevo Personaje',
      url: newCharUrl.trim(),
      type: isVideo ? 'video' : 'image',
      isGreenScreen: newCharGreenScreen,
      speechText: newCharSpeechText.trim() || '¡Hola! ¿Dudas sobre tu casa? Haz clic aquí 👋',
      active: false,
    };
    const currentChars = config?.chatbot?.characters || [];
    updateNestedConfig(['chatbot', 'characters'], [...currentChars, newChar]);
    setIsAddingChar(false);
    setNewCharName('');
    setNewCharUrl('');
    setNewCharGreenScreen(true);
    setNewCharSpeechText('¡Hola! ¿Dudas sobre tu casa? Haz clic aquí 👋');
  };

  const handleUploadCharFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCharFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subfolder', 'chatbot');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setNewCharUrl(data.url);
        if (!newCharName) {
          setNewCharName(file.name.replace(/\.[^/.]+$/, ""));
        }
      } else {
        alert("Error al subir el archivo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor de subida.");
    } finally {
      setUploadingCharFile(false);
    }
  };

  if (loading || !config) {
    return <div className="p-8 flex justify-center h-full items-center"><Loader2 className="animate-spin w-12 h-12 text-[#e67e22]" /></div>;
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)] bg-[#162839] border border-slate-800 rounded-xl overflow-hidden flex flex-col font-sans">
      
      {/* =========================================================================
          TOP CONTROL TOOLBAR (100% CONTROL OF SECTIONS & SAVING)
         ========================================================================= */}
      <div className="flex-shrink-0 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col xl:flex-row gap-4 justify-between items-center z-30 shadow-2xl relative">
        
        {/* Title & Modes */}
        <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-start">
          <div className="flex items-center gap-3">
            <div className="bg-[#e67e22]/20 text-[#fc8f34] p-2.5 rounded-xl border border-[#e67e22]/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black font-[family-name:var(--font-montserrat)] text-white flex items-center gap-2">
                Editor Visual 100% Control
                <span className="text-[10px] bg-[#e67e22]/20 text-[#fc8f34] px-2 py-0.5 rounded-full border border-[#e67e22]/40 uppercase tracking-widest font-bold">V4 PRO</span>
              </h2>
              <p className="text-xs text-slate-400">Haz clic sobre cualquier texto, color, icono o imagen para editar en vivo.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'editor' ? 'bg-[#162839] text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <Eye className="w-3.5 h-3.5" /> Vista Previa
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'sections' ? 'bg-[#e67e22] text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <Layers className="w-3.5 h-3.5" /> Secciones ({[
                config.topBar?.enabled ?? true,
                config.hero.enabled ?? true,
                config.statusSearch.enabled ?? true,
                config.services.enabled ?? true,
                config.standard.enabled ?? true,
                config.models3D?.enabled ?? true,
                config.process?.enabled ?? true,
                config.projects.enabled ?? true,
                config.about.enabled,
                config.chatbot?.enabled ?? true,
                config.announcement.enabled
              ].filter(Boolean).length}/11)
            </button>
            <button
              onClick={() => {
                setActiveTab('editor');
                setTimeout(() => document.getElementById('chatbot-config')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 transition-all flex items-center gap-1.5 border border-indigo-500/30"
            >
              <Bot className="w-3.5 h-3.5" /> Chatbot & Bot
            </button>
          </div>
        </div>

        {/* Quick Save and Jump */}
        <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#e67e22] to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 hover:scale-105 active:scale-95"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Publicando en Vercel...' : 'Publicar Cambios'}
          </button>
        </div>

      </div>

      {/* =========================================================================
          SECTIONS MANAGER DRAWER/PANEL (TOGGLE ON/OFF 100% OF SECTIONS)
         ========================================================================= */}
      {activeTab === 'sections' && (
        <div className="p-6 bg-slate-900 border-b border-white/10 z-20 overflow-y-auto max-h-[360px]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#fc8f34]" /> Visibilidad de Secciones de la Landing Page
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            
            {/* Top Bar */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 cursor-pointer">
              <span className="text-xs font-bold text-white">Barra Superior Institucional</span>
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#e67e22]" 
                checked={config.topBar?.enabled ?? true}
                onChange={(e) => updateNestedConfig(['topBar', 'enabled'], e.target.checked)}
              />
            </label>

            {/* Hero */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 cursor-pointer">
              <span className="text-xs font-bold text-white">Portada Hero & Bento Stats</span>
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#e67e22]" 
                checked={config.hero.enabled ?? true}
                onChange={(e) => updateNestedConfig(['hero', 'enabled'], e.target.checked)}
              />
            </label>

            {/* Consulta DNI */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 cursor-pointer">
              <span className="text-xs font-bold text-white">Consulta DNI Oficial</span>
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#e67e22]" 
                checked={config.statusSearch.enabled ?? true}
                onChange={(e) => updateNestedConfig(['statusSearch', 'enabled'], e.target.checked)}
              />
            </label>

            {/* Servicios */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 cursor-pointer">
              <span className="text-xs font-bold text-white">Servicios & Experiencia</span>
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#e67e22]" 
                checked={config.services.enabled ?? true}
                onChange={(e) => updateNestedConfig(['services', 'enabled'], e.target.checked)}
              />
            </label>

            {/* El Estándar */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 cursor-pointer">
              <span className="text-xs font-bold text-white">El Estándar Maza Quiroz</span>
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#e67e22]" 
                checked={config.standard.enabled ?? true}
                onChange={(e) => updateNestedConfig(['standard', 'enabled'], e.target.checked)}
              />
            </label>

            {/* Modelos 3D */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 cursor-pointer">
              <span className="text-xs font-bold text-white">Catálogo & Visor 3D</span>
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#e67e22]" 
                checked={config.models3D?.enabled ?? true}
                onChange={(e) => updateNestedConfig(['models3D', 'enabled'], e.target.checked)}
              />
            </label>

            {/* Proceso Paso a Paso */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 cursor-pointer">
              <span className="text-xs font-bold text-white">Proceso Paso a Paso</span>
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#e67e22]" 
                checked={config.process?.enabled ?? true}
                onChange={(e) => updateNestedConfig(['process', 'enabled'], e.target.checked)}
              />
            </label>

            {/* Proyectos */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 cursor-pointer">
              <span className="text-xs font-bold text-white">Obras Entregadas (Proyectos)</span>
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#e67e22]" 
                checked={config.projects.enabled ?? true}
                onChange={(e) => updateNestedConfig(['projects', 'enabled'], e.target.checked)}
              />
            </label>

            {/* Nosotros */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 cursor-pointer">
              <span className="text-xs font-bold text-white">Sobre Nosotros</span>
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#e67e22]" 
                checked={config.about.enabled}
                onChange={(e) => updateNestedConfig(['about', 'enabled'], e.target.checked)}
              />
            </label>

            {/* Chatbot Bot */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 cursor-pointer">
              <span className="text-xs font-bold text-white">Bot Asistente Virtual</span>
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#e67e22]" 
                checked={config.chatbot?.enabled ?? true}
                onChange={(e) => updateNestedConfig(['chatbot', 'enabled'], e.target.checked)}
              />
            </label>

            {/* Anuncio */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 cursor-pointer">
              <span className="text-xs font-bold text-white">Popup de Comunicado</span>
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#e67e22]" 
                checked={config.announcement.enabled}
                onChange={(e) => updateNestedConfig(['announcement', 'enabled'], e.target.checked)}
              />
            </label>

          </div>
        </div>
      )}

      {/* =========================================================================
          EDITOR CANVAS: 100% WYSIWYG ARCHITECTURAL DESIGN
         ========================================================================= */}
      <div className="flex-1 overflow-y-auto bg-[#fcf9f6] text-[#1c1c1a] font-sans relative selection:bg-[#e67e22]/20">
        
        {/* =======================================================================
            POPUP BANNER ANNOUNCEMENT PREVIEW
           ======================================================================= */}
        {config.announcement.enabled && (
          <div className="p-6 m-4 border-2 border-dashed border-[#e67e22] rounded-3xl bg-[#162839] text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-white/10">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#fc8f34]" /> Popup Anuncio / Comunicado
                </h3>
                <p className="text-xs text-slate-300">Aparece flotando al entrar a la web.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300">Opacidad Fondo:</span>
                <input 
                  type="range" min="0" max="100" 
                  value={config.announcement.backdropOpacity}
                  onChange={(e) => updateNestedConfig(['announcement', 'backdropOpacity'], Number(e.target.value))}
                  className="accent-[#e67e22]"
                />
                <span className="text-xs font-mono text-[#fc8f34]">{config.announcement.backdropOpacity}%</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {config.announcement.images.map((img, idx) => (
                <div key={idx} className="relative w-28 h-36 rounded-xl overflow-hidden border border-white/20 group">
                  <img src={img} className="w-full h-full object-cover" alt="Anuncio" />
                  <div 
                    className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
                    onClick={() => updateNestedConfig(['announcement', 'images'], (old: string[]) => old.filter((_, i) => i !== idx))}
                  >
                    <span className="text-white text-xs font-bold">Eliminar</span>
                  </div>
                </div>
              ))}
              
              {config.announcement.images.length < 5 && (
                <EditableImage 
                  src="" 
                  onUpload={(url) => updateNestedConfig(['announcement', 'images'], (old: string[]) => [...old, url])}
                >
                  <div className="w-28 h-36 rounded-xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center text-slate-300 hover:bg-white/10 cursor-pointer transition-colors">
                    <span className="text-2xl font-bold">+</span>
                    <span className="text-[11px] mt-1">Añadir Foto</span>
                  </div>
                </EditableImage>
              )}
            </div>
          </div>
        )}

        {/* =======================================================================
            1. TOP INSTITUTIONAL BAR
           ======================================================================= */}
        {(config.topBar?.enabled ?? true) && (
          <div className="bg-[#162839] text-white text-[12px] font-medium py-2 px-4 md:px-8 border-b border-[#2c3e50] relative group">
            <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <EditableText 
                  value={config.topBar?.badgeText || "Entidad Técnica Autorizada"} 
                  onChange={(v) => updateNestedConfig(['topBar', 'badgeText'], v)}
                  fontFamily={config.fonts?.['topBar.badgeText']}
                  onFontChange={(f) => updateNestedConfig(['fonts', 'topBar.badgeText'], f)}
                  color={config.colors?.['topBar.badgeText']}
                  onColorChange={(c) => updateNestedConfig(['colors', 'topBar.badgeText'], c)}
                  className="font-semibold text-slate-200 tracking-wide uppercase"
                />
                <span className="text-slate-400">|</span>
                <EditableText 
                  value={config.topBar?.description || "Programa Techo Propio · Fondo MIVIVIENDA (Construcción en Sitio Propio)"} 
                  onChange={(v) => updateNestedConfig(['topBar', 'description'], v)}
                  fontFamily={config.fonts?.['topBar.description']}
                  onFontChange={(f) => updateNestedConfig(['fonts', 'topBar.description'], f)}
                  color={config.colors?.['topBar.description']}
                  onColorChange={(c) => updateNestedConfig(['colors', 'topBar.description'], c)}
                  className="text-slate-300"
                />
              </div>
              <div className="flex items-center gap-3">
                <EditableText 
                  value={config.topBar?.subsidioText || "Bono 100% Gratuito"} 
                  onChange={(v) => updateNestedConfig(['topBar', 'subsidioText'], v)}
                  fontFamily={config.fonts?.['topBar.subsidioText']}
                  onFontChange={(f) => updateNestedConfig(['fonts', 'topBar.subsidioText'], f)}
                  color={config.colors?.['topBar.subsidioText']}
                  onColorChange={(c) => updateNestedConfig(['colors', 'topBar.subsidioText'], c)}
                  className="bg-[#e67e22]/20 text-[#fc8f34] px-2.5 py-0.5 rounded-full font-bold border border-[#e67e22]/30"
                />
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            2. NAVBAR ARCHITECTURAL
           ======================================================================= */}
        <header className="sticky top-0 z-40 bg-[#fcf9f6]/95 backdrop-blur-md border-b border-[#c4c6cd]/60">
          <nav className="max-w-[1360px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <EditableImage 
                src={config.nav.logoImage} 
                onUpload={(url) => updateNestedConfig(['nav', 'logoImage'], url)}
              >
                <div className="w-10 h-10 rounded-xl bg-[#162839] text-white flex items-center justify-center border border-[#2c3e50] overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#e67e22]">
                  {config.nav.logoImage ? (
                    <img src={config.nav.logoImage} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <Building2 className="w-6 h-6 text-[#fc8f34]" />
                  )}
                </div>
              </EditableImage>

              <div className="flex flex-col leading-none">
                <EditableText 
                  value={config.nav.logoText} 
                  onChange={(v) => updateNestedConfig(['nav', 'logoText'], v)}
                  fontFamily={config.fonts?.['nav.logoText']}
                  onFontChange={(f) => updateNestedConfig(['fonts', 'nav.logoText'], f)}
                  color={config.colors?.['nav.logoText']}
                  onColorChange={(c) => updateNestedConfig(['colors', 'nav.logoText'], c)}
                  className="font-black text-lg md:text-xl font-[family-name:var(--font-montserrat)] text-[#162839] tracking-tight"
                />
                <EditableText 
                  value={config.nav.logoSubtitle || "CONSTRUCTORA & ET"} 
                  onChange={(v) => updateNestedConfig(['nav', 'logoSubtitle'], v)}
                  fontFamily={config.fonts?.['nav.logoSubtitle']}
                  onFontChange={(f) => updateNestedConfig(['fonts', 'nav.logoSubtitle'], f)}
                  color={config.colors?.['nav.logoSubtitle']}
                  onColorChange={(c) => updateNestedConfig(['colors', 'nav.logoSubtitle'], c)}
                  className="text-[10px] tracking-widest uppercase text-[#e67e22] font-bold mt-0.5"
                />
              </div>
            </div>

            {/* Links */}
            <div className="hidden lg:flex items-center gap-6 text-[14px] font-semibold text-[#43474c]">
              {(config.nav.links || []).map((link, i) => (
                <div key={i} className="flex items-center gap-1 group/lnk">
                  <EditableText 
                    value={link.label}
                    onChange={(v) => {
                      const newLinks = [...config.nav.links];
                      newLinks[i].label = v;
                      updateNestedConfig(['nav', 'links'], newLinks);
                    }}
                    fontFamily={config.fonts?.[`nav.links.${i}.label`]}
                    onFontChange={(f) => updateNestedConfig(['fonts', `nav.links.${i}.label`], f)}
                    color={config.colors?.[`nav.links.${i}.label`]}
                    onColorChange={(c) => updateNestedConfig(['colors', `nav.links.${i}.label`], c)}
                  />
                  <button 
                    onClick={() => {
                      const newLinks = config.nav.links.filter((_, idx) => idx !== i);
                      updateNestedConfig(['nav', 'links'], newLinks);
                    }}
                    className="opacity-0 group-hover/lnk:opacity-100 text-red-500 hover:text-red-700 text-xs px-1"
                    title="Eliminar enlace"
                  >×</button>
                </div>
              ))}
              <button 
                onClick={() => {
                  const newLinks = [...(config.nav.links || []), { label: "Nuevo Enlace", href: "#" }];
                  updateNestedConfig(['nav', 'links'], newLinks);
                }}
                className="text-xs text-[#e67e22] font-bold hover:underline"
              >+ Enlace</button>
            </div>

            {/* CTA and WhatsApp info */}
            <div className="flex items-center gap-3">
              <div className="px-5 py-2.5 rounded-full bg-[#162839] text-white text-[13px] font-bold shadow-sm flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#fc8f34]" />
                <EditableText 
                  value={config.nav.ctaText}
                  onChange={(v) => updateNestedConfig(['nav', 'ctaText'], v)}
                  fontFamily={config.fonts?.['nav.ctaText']}
                  onFontChange={(f) => updateNestedConfig(['fonts', 'nav.ctaText'], f)}
                  color={config.colors?.['nav.ctaText']}
                  onColorChange={(c) => updateNestedConfig(['colors', 'nav.ctaText'], c)}
                />
              </div>
            </div>

          </nav>
        </header>

        {/* =======================================================================
            3. HERO & BENTO STATS
           ======================================================================= */}
        {(config.hero.enabled ?? true) && (
          <section className="relative w-full overflow-hidden bg-[#162839] text-white border-b border-[#2c3e50] py-16 md:py-20 px-4 md:px-8">
            <div className="max-w-[1360px] mx-auto">
              
              {/* Controls bar for Hero */}
              <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#fc8f34] uppercase tracking-wider">Fondo Hero ({config.hero.images?.length || 0} fotos):</span>
                  <div className="flex flex-wrap gap-2">
                    {(config.hero.images || []).map((img, imgIdx) => (
                      <div key={imgIdx} onClick={() => setCurrentImageIndex(imgIdx)} className={`w-9 h-9 rounded-lg border overflow-hidden relative group cursor-pointer ${currentImageIndex === imgIdx ? 'border-[#fc8f34] ring-2 ring-[#fc8f34]/50' : 'border-white/30'}`}>
                        <img src={img} className="w-full h-full object-cover" alt="Hero background" />
                        <div 
                          className="absolute inset-0 bg-red-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newImages = config.hero.images.filter((_, idx) => idx !== imgIdx);
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
                      <div className="w-9 h-9 rounded-lg border border-dashed border-white/50 flex items-center justify-center text-white hover:bg-white/10 cursor-pointer font-bold text-sm">
                        +
                      </div>
                    </EditableImage>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span>Teléfono WhatsApp:</span>
                    <EditableText value={config.hero.phone} onChange={(v) => updateNestedConfig(['hero', 'phone'], v)} className="bg-white/10 px-2 py-0.5 rounded text-white font-mono" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>Opacidad:</span>
                    <input 
                      type="range" min="10" max="90" 
                      value={config.hero.bgOpacity ?? 30} 
                      onChange={(e) => updateNestedConfig(['hero', 'bgOpacity'], Number(e.target.value))} 
                      className="accent-[#e67e22] w-20"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Contents */}
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-6">
                  <ShieldCheck className="w-4 h-4 text-[#fc8f34]" />
                  <EditableText 
                    value={config.hero.badgeText} 
                    onChange={(v) => updateNestedConfig(['hero', 'badgeText'], v)}
                    fontFamily={config.fonts?.['hero.badgeText']}
                    onFontChange={(f) => updateNestedConfig(['fonts', 'hero.badgeText'], f)}
                    color={config.colors?.['hero.badgeText']}
                    onColorChange={(c) => updateNestedConfig(['colors', 'hero.badgeText'], c)}
                    className="text-xs uppercase tracking-wider font-bold text-slate-200"
                  />
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-[family-name:var(--font-montserrat)] tracking-tight leading-[1.1] mb-6 text-white">
                  <EditableText 
                    value={config.hero.title || "Construimos Tu Hogar de Material Noble con el Subsidio 100% del Estado."} 
                    onChange={(v) => updateNestedConfig(['hero', 'title'], v)}
                    fontFamily={config.fonts?.['hero.title']}
                    onFontChange={(f) => updateNestedConfig(['fonts', 'hero.title'], f)}
                    color={config.colors?.['hero.title']}
                    onColorChange={(c) => updateNestedConfig(['colors', 'hero.title'], c)}
                    multiline
                  />
                </h1>

                <div className="text-base sm:text-lg md:text-xl text-slate-300 font-[family-name:var(--font-work-sans)] leading-relaxed mb-8 max-w-2xl">
                  <EditableText 
                    value={config.hero.subtitle || "Accede al Bono Familiar Habitacional (BFH)..."} 
                    onChange={(v) => updateNestedConfig(['hero', 'subtitle'], v)}
                    fontFamily={config.fonts?.['hero.subtitle']}
                    onFontChange={(f) => updateNestedConfig(['fonts', 'hero.subtitle'], f)}
                    color={config.colors?.['hero.subtitle']}
                    onColorChange={(c) => updateNestedConfig(['colors', 'hero.subtitle'], c)}
                    multiline
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-14">
                  <div className="px-7 py-3.5 rounded-full bg-[#e67e22] text-white font-bold text-sm md:text-base flex items-center gap-2.5 shadow-lg">
                    <FileSearch className="w-5 h-5" />
                    <EditableText 
                      value={config.hero.ctaPrimaryText || "Consultar Estado DNI"} 
                      onChange={(v) => updateNestedConfig(['hero', 'ctaPrimaryText'], v)}
                      fontFamily={config.fonts?.['hero.ctaPrimaryText']}
                      onFontChange={(f) => updateNestedConfig(['fonts', 'hero.ctaPrimaryText'], f)}
                      color={config.colors?.['hero.ctaPrimaryText']}
                      onColorChange={(c) => updateNestedConfig(['colors', 'hero.ctaPrimaryText'], c)}
                    />
                  </div>

                  <div className="px-7 py-3.5 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm md:text-base flex items-center gap-2.5">
                    <PhoneCall className="w-5 h-5 text-[#fc8f34]" />
                    <EditableText 
                      value={config.hero.ctaSecondaryText || "Postular por WhatsApp"} 
                      onChange={(v) => updateNestedConfig(['hero', 'ctaSecondaryText'], v)}
                      fontFamily={config.fonts?.['hero.ctaSecondaryText']}
                      onFontChange={(f) => updateNestedConfig(['fonts', 'hero.ctaSecondaryText'], f)}
                      color={config.colors?.['hero.ctaSecondaryText']}
                      onColorChange={(c) => updateNestedConfig(['colors', 'hero.ctaSecondaryText'], c)}
                    />
                  </div>
                </div>
              </div>

              {/* Bento Stats Grid */}
              <div className="pt-8 border-t border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider">Tarjetas Estadísticas Bento ({config.hero.stats?.length || 0})</h4>
                  <button 
                    onClick={() => {
                      const newStats = [...(config.hero.stats || []), { num: "100%", label: "Nueva Métrica", sublabel: "Descripción breve" }];
                      updateNestedConfig(['hero', 'stats'], newStats);
                    }}
                    className="text-xs text-[#fc8f34] font-bold hover:underline"
                  >+ Añadir Tarjeta Estadística</button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(config.hero.stats || []).map((st, sIdx) => (
                    <div key={sIdx} className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 relative group">
                      <button 
                        onClick={() => {
                          const newStats = config.hero.stats!.filter((_, idx) => idx !== sIdx);
                          updateNestedConfig(['hero', 'stats'], newStats);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar métrica"
                      >×</button>
                      <div className="text-3xl md:text-4xl font-black font-[family-name:var(--font-montserrat)] text-[#fc8f34] mb-1">
                        <EditableText 
                          value={st.num} 
                          onChange={(v) => {
                            const newStats = [...config.hero.stats!];
                            newStats[sIdx].num = v;
                            updateNestedConfig(['hero', 'stats'], newStats);
                          }}
                          fontFamily={config.fonts?.[`hero.stats.${sIdx}.num`]}
                          onFontChange={(f) => updateNestedConfig(['fonts', `hero.stats.${sIdx}.num`], f)}
                          color={config.colors?.[`hero.stats.${sIdx}.num`]}
                          onColorChange={(c) => updateNestedConfig(['colors', `hero.stats.${sIdx}.num`], c)}
                        />
                      </div>
                      <div className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                        <EditableText 
                          value={st.label} 
                          onChange={(v) => {
                            const newStats = [...config.hero.stats!];
                            newStats[sIdx].label = v;
                            updateNestedConfig(['hero', 'stats'], newStats);
                          }}
                          fontFamily={config.fonts?.[`hero.stats.${sIdx}.label`]}
                          onFontChange={(f) => updateNestedConfig(['fonts', `hero.stats.${sIdx}.label`], f)}
                          color={config.colors?.[`hero.stats.${sIdx}.label`]}
                          onColorChange={(c) => updateNestedConfig(['colors', `hero.stats.${sIdx}.label`], c)}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        <EditableText 
                          value={st.sublabel} 
                          onChange={(v) => {
                            const newStats = [...config.hero.stats!];
                            newStats[sIdx].sublabel = v;
                            updateNestedConfig(['hero', 'stats'], newStats);
                          }}
                          fontFamily={config.fonts?.[`hero.stats.${sIdx}.sublabel`]}
                          onFontChange={(f) => updateNestedConfig(['fonts', `hero.stats.${sIdx}.sublabel`], f)}
                          color={config.colors?.[`hero.stats.${sIdx}.sublabel`]}
                          onColorChange={(c) => updateNestedConfig(['colors', `hero.stats.${sIdx}.sublabel`], c)}
                        />
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>
        )}

        {/* =======================================================================
            4. CONSULTA DNI
           ======================================================================= */}
        {(config.statusSearch.enabled ?? true) && (
          <section className="w-full py-16 bg-[#f6f3f0] border-b border-[#c4c6cd]/50 px-4 md:px-8">
            <div className="max-w-[1360px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left */}
                <div className="lg:col-span-5 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e67e22] mb-3">
                    <BadgeCheck className="w-4 h-4" />
                    <EditableText 
                      value={config.statusSearch.sectionBadge || "Portal Oficial de Verificación"}
                      onChange={(v) => updateNestedConfig(['statusSearch', 'sectionBadge'], v)}
                      fontFamily={config.fonts?.['statusSearch.sectionBadge']}
                      onFontChange={(f) => updateNestedConfig(['fonts', 'statusSearch.sectionBadge'], f)}
                      color={config.colors?.['statusSearch.sectionBadge']}
                      onColorChange={(c) => updateNestedConfig(['colors', 'statusSearch.sectionBadge'], c)}
                    />
                  </div>

                  <h2 className="text-3xl md:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-[#162839] tracking-tight mb-4">
                    <EditableText 
                      value={config.statusSearch.sectionTitle || "Consulta el Estado de tu Postulación"}
                      onChange={(v) => updateNestedConfig(['statusSearch', 'sectionTitle'], v)}
                      fontFamily={config.fonts?.['statusSearch.sectionTitle']}
                      onFontChange={(f) => updateNestedConfig(['fonts', 'statusSearch.sectionTitle'], f)}
                      color={config.colors?.['statusSearch.sectionTitle']}
                      onColorChange={(c) => updateNestedConfig(['colors', 'statusSearch.sectionTitle'], c)}
                    />
                  </h2>

                  <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6 font-[family-name:var(--font-work-sans)]">
                    <EditableText 
                      value={config.statusSearch.sectionDesc || "Si ya te registraste con nosotros o presentaste tus documentos, consulta en tiempo real la fase de tu expediente técnico ante el Fondo MIVIVIENDA."}
                      onChange={(v) => updateNestedConfig(['statusSearch', 'sectionDesc'], v)}
                      fontFamily={config.fonts?.['statusSearch.sectionDesc']}
                      onFontChange={(f) => updateNestedConfig(['fonts', 'statusSearch.sectionDesc'], f)}
                      color={config.colors?.['statusSearch.sectionDesc']}
                      onColorChange={(c) => updateNestedConfig(['colors', 'statusSearch.sectionDesc'], c)}
                      multiline
                    />
                  </p>

                  <div className="space-y-3">
                    {(config.statusSearch.bullets || []).map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-3 text-xs md:text-sm text-slate-700 group/blt">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <EditableText 
                          value={bullet}
                          onChange={(v) => {
                            const newBullets = [...config.statusSearch.bullets!];
                            newBullets[bIdx] = v;
                            updateNestedConfig(['statusSearch', 'bullets'], newBullets);
                          }}
                          fontFamily={config.fonts?.[`statusSearch.bullets.${bIdx}`]}
                          onFontChange={(f) => updateNestedConfig(['fonts', `statusSearch.bullets.${bIdx}`], f)}
                          color={config.colors?.[`statusSearch.bullets.${bIdx}`]}
                          onColorChange={(c) => updateNestedConfig(['colors', `statusSearch.bullets.${bIdx}`], c)}
                          className="flex-1"
                        />
                        <button 
                          onClick={() => {
                            const newBullets = config.statusSearch.bullets!.filter((_, idx) => idx !== bIdx);
                            updateNestedConfig(['statusSearch', 'bullets'], newBullets);
                          }}
                          className="opacity-0 group-hover/blt:opacity-100 text-red-500 text-xs px-1"
                          title="Eliminar punto"
                        >×</button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newBullets = [...(config.statusSearch.bullets || []), "Nuevo beneficio o garantía de consulta"];
                        updateNestedConfig(['statusSearch', 'bullets'], newBullets);
                      }}
                      className="text-xs text-[#e67e22] font-bold hover:underline"
                    >+ Añadir Punto de Consulta</button>
                  </div>
                </div>

                {/* Right Input Card */}
                <div className="lg:col-span-7">
                  <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#c4c6cd]/60 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileSearch className="w-5 h-5 text-[#162839]" />
                        <h3 className="text-lg md:text-xl font-bold text-[#162839] font-[family-name:var(--font-montserrat)]">
                          <EditableText 
                            value={config.statusSearch.title}
                            onChange={(v) => updateNestedConfig(['statusSearch', 'title'], v)}
                            fontFamily={config.fonts?.['statusSearch.title']}
                            onFontChange={(f) => updateNestedConfig(['fonts', 'statusSearch.title'], f)}
                            color={config.colors?.['statusSearch.title']}
                            onColorChange={(c) => updateNestedConfig(['colors', 'statusSearch.title'], c)}
                          />
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono font-bold bg-[#f6f3f0] text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                        DNI (8 dígitos)
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 mb-6 font-[family-name:var(--font-work-sans)]">
                      <EditableText 
                        value={config.statusSearch.subtitle}
                        onChange={(v) => updateNestedConfig(['statusSearch', 'subtitle'], v)}
                        fontFamily={config.fonts?.['statusSearch.subtitle']}
                        onFontChange={(f) => updateNestedConfig(['fonts', 'statusSearch.subtitle'], f)}
                        color={config.colors?.['statusSearch.subtitle']}
                        onColorChange={(c) => updateNestedConfig(['colors', 'statusSearch.subtitle'], c)}
                        multiline
                      />
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 bg-[#fcf9f6] border-2 border-slate-200 rounded-2xl px-5 py-4 text-[#162839] font-mono text-base font-semibold">
                        <EditableText 
                          value={config.statusSearch.placeholder}
                          onChange={(v) => updateNestedConfig(['statusSearch', 'placeholder'], v)}
                        />
                      </div>
                      <div className="bg-[#162839] text-white font-bold px-8 py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 whitespace-nowrap text-sm">
                        <EditableText 
                          value={config.statusSearch.buttonText}
                          onChange={(v) => updateNestedConfig(['statusSearch', 'buttonText'], v)}
                          fontFamily={config.fonts?.['statusSearch.buttonText']}
                          onFontChange={(f) => updateNestedConfig(['fonts', 'statusSearch.buttonText'], f)}
                          color={config.colors?.['statusSearch.buttonText']}
                          onColorChange={(c) => updateNestedConfig(['colors', 'statusSearch.buttonText'], c)}
                        />
                        <ArrowRight className="w-4 h-4 text-[#fc8f34]" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* =======================================================================
            5. SERVICIOS & EXPERIENCIA
           ======================================================================= */}
        {(config.services.enabled ?? true) && (
          <section className="w-full py-20 bg-[#fcf9f6] px-4 md:px-8">
            <div className="max-w-[1360px] mx-auto">
              
              <div className="mb-14 max-w-3xl">
                <span className="text-xs uppercase font-bold tracking-widest text-[#e67e22] block mb-2">
                  <EditableText 
                    value={config.services.badgeText || "Ingeniería Estructural & Especialidad"}
                    onChange={(v) => updateNestedConfig(['services', 'badgeText'], v)}
                    fontFamily={config.fonts?.['services.badgeText']}
                    onFontChange={(f) => updateNestedConfig(['fonts', 'services.badgeText'], f)}
                    color={config.colors?.['services.badgeText']}
                    onColorChange={(c) => updateNestedConfig(['colors', 'services.badgeText'], c)}
                  />
                </span>

                <h2 className="text-3xl md:text-5xl font-black font-[family-name:var(--font-montserrat)] text-[#162839] tracking-tight mb-4">
                  <EditableText 
                    value={config.services.title}
                    onChange={(v) => updateNestedConfig(['services', 'title'], v)}
                    fontFamily={config.fonts?.['services.title']}
                    onFontChange={(f) => updateNestedConfig(['fonts', 'services.title'], f)}
                    color={config.colors?.['services.title']}
                    onColorChange={(c) => updateNestedConfig(['colors', 'services.title'], c)}
                  />
                </h2>
                <div className="w-16 h-1.5 bg-[#e67e22] mb-6"></div>

                <p className="text-slate-600 text-base md:text-lg leading-relaxed font-[family-name:var(--font-work-sans)]">
                  <EditableText 
                    value={config.services.subtitle}
                    onChange={(v) => updateNestedConfig(['services', 'subtitle'], v)}
                    fontFamily={config.fonts?.['services.subtitle']}
                    onFontChange={(f) => updateNestedConfig(['fonts', 'services.subtitle'], f)}
                    color={config.colors?.['services.subtitle']}
                    onColorChange={(c) => updateNestedConfig(['colors', 'services.subtitle'], c)}
                    multiline
                  />
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {config.services.items.map((service, i) => {
                  const Icon = iconMap[service.iconType] || Hammer;
                  return (
                    <div key={i} className="bg-white rounded-3xl p-8 arch-border flex flex-col justify-between shadow-sm relative group">
                      
                      {/* Delete card */}
                      <button 
                        onClick={() => {
                          const newItems = config.services.items.filter((_, idx) => idx !== i);
                          updateNestedConfig(['services', 'items'], newItems);
                        }}
                        className="absolute top-4 right-4 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        title="Eliminar tarjeta de servicio"
                      >×</button>

                      <div>
                        {/* Icon selector */}
                        <div className="w-14 h-14 rounded-2xl bg-[#f6f3f0] border border-[#c4c6cd]/50 flex items-center justify-center mb-6 relative cursor-pointer">
                          <Icon className="w-7 h-7 text-[#162839]" />
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

                        <h3 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-montserrat)] text-[#162839] mb-3">
                          <EditableText 
                            value={service.title}
                            onChange={(v) => {
                              const newItems = [...config.services.items];
                              newItems[i].title = v;
                              updateNestedConfig(['services', 'items'], newItems);
                            }}
                            fontFamily={config.fonts?.[`services.items.${i}.title`]}
                            onFontChange={(f) => updateNestedConfig(['fonts', `services.items.${i}.title`], f)}
                            color={config.colors?.[`services.items.${i}.title`]}
                            onColorChange={(c) => updateNestedConfig(['colors', `services.items.${i}.title`], c)}
                          />
                        </h3>

                        <p className="text-[14px] md:text-[15px] text-slate-600 leading-relaxed font-[family-name:var(--font-work-sans)] mb-8">
                          <EditableText 
                            value={service.desc}
                            onChange={(v) => {
                              const newItems = [...config.services.items];
                              newItems[i].desc = v;
                              updateNestedConfig(['services', 'items'], newItems);
                            }}
                            fontFamily={config.fonts?.[`services.items.${i}.desc`]}
                            onFontChange={(f) => updateNestedConfig(['fonts', `services.items.${i}.desc`], f)}
                            color={config.colors?.[`services.items.${i}.desc`]}
                            onColorChange={(c) => updateNestedConfig(['colors', `services.items.${i}.desc`], c)}
                            multiline
                          />
                        </p>
                      </div>

                      <div className="pt-6 border-t border-slate-100 mt-auto flex items-end justify-between">
                        <div>
                          <div className="text-3xl md:text-4xl font-black text-[#162839] font-[family-name:var(--font-montserrat)] tracking-tight">
                            <EditableText 
                              value={service.statNum || "0"}
                              onChange={(v) => {
                                const newItems = [...config.services.items];
                                newItems[i].statNum = v;
                                updateNestedConfig(['services', 'items'], newItems);
                              }}
                              fontFamily={config.fonts?.[`services.items.${i}.statNum`]}
                              onFontChange={(f) => updateNestedConfig(['fonts', `services.items.${i}.statNum`], f)}
                              color={config.colors?.[`services.items.${i}.statNum`]}
                              onColorChange={(c) => updateNestedConfig(['colors', `services.items.${i}.statNum`], c)}
                            />
                          </div>
                          <div className="text-xs font-semibold text-slate-500 mt-0.5">
                            <EditableText 
                              value={service.statText || "Dato"}
                              onChange={(v) => {
                                const newItems = [...config.services.items];
                                newItems[i].statText = v;
                                updateNestedConfig(['services', 'items'], newItems);
                              }}
                              fontFamily={config.fonts?.[`services.items.${i}.statText`]}
                              onFontChange={(f) => updateNestedConfig(['fonts', `services.items.${i}.statText`], f)}
                              color={config.colors?.[`services.items.${i}.statText`]}
                              onColorChange={(c) => updateNestedConfig(['colors', `services.items.${i}.statText`], c)}
                            />
                          </div>
                        </div>

                        {/* Gallery photos */}
                        <div className="flex items-center gap-1">
                          {(service.images || []).map((img, imgIdx) => (
                            <div key={imgIdx} className="w-8 h-8 rounded border border-slate-200 overflow-hidden relative group/img">
                              <img src={img} className="w-full h-full object-cover" alt="Service photo" />
                              <div 
                                className="absolute inset-0 bg-red-600/90 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => {
                                  const newItems = [...config.services.items];
                                  newItems[i].images = newItems[i].images.filter((_, idx) => idx !== imgIdx);
                                  updateNestedConfig(['services', 'items'], newItems);
                                }}
                              >
                                <span className="text-white text-[10px] font-bold">X</span>
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
                            <div className="w-8 h-8 rounded border border-dashed border-[#e67e22] text-[#e67e22] flex items-center justify-center text-xs font-bold hover:bg-[#e67e22]/10 cursor-pointer">
                              +
                            </div>
                          </EditableImage>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => {
                    const newItems = [
                      ...config.services.items,
                      { iconType: 'Hammer', title: 'Nuevo Servicio', desc: 'Descripción del servicio constructivo.', images: [], statNum: '100%', statText: 'Garantizado' }
                    ];
                    updateNestedConfig(['services', 'items'], newItems);
                  }}
                  className="px-6 py-2.5 rounded-full bg-white border border-[#c4c6cd] text-[#162839] font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm"
                >+ Añadir Tarjeta de Servicio</button>
              </div>

            </div>
          </section>
        )}

        {/* =======================================================================
            6. EL ESTÁNDAR MAZA QUIROZ
           ======================================================================= */}
        {(config.standard.enabled ?? true) && (
          <section className="w-full py-20 bg-[#f6f3f0] border-y border-[#c4c6cd]/60 px-4 md:px-8">
            <div className="max-w-[1360px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                
                {/* Left */}
                <div className="lg:col-span-6">
                  <span className="text-xs uppercase font-bold tracking-widest text-[#e67e22] block mb-2">
                    <EditableText 
                      value={config.standard.badgeText || "Garantía y Credibilidad"}
                      onChange={(v) => updateNestedConfig(['standard', 'badgeText'], v)}
                      fontFamily={config.fonts?.['standard.badgeText']}
                      onFontChange={(f) => updateNestedConfig(['fonts', 'standard.badgeText'], f)}
                      color={config.colors?.['standard.badgeText']}
                      onColorChange={(c) => updateNestedConfig(['colors', 'standard.badgeText'], c)}
                    />
                  </span>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-[family-name:var(--font-montserrat)] text-[#162839] tracking-tight mb-4">
                    <EditableText 
                      value={config.standard.titleHtml || "El Estándar Maza Quiroz"}
                      onChange={(v) => updateNestedConfig(['standard', 'titleHtml'], v)}
                      fontFamily={config.fonts?.['standard.titleHtml']}
                      onFontChange={(f) => updateNestedConfig(['fonts', 'standard.titleHtml'], f)}
                      color={config.colors?.['standard.titleHtml']}
                      onColorChange={(c) => updateNestedConfig(['colors', 'standard.titleHtml'], c)}
                    />
                  </h2>
                  <div className="w-16 h-1.5 bg-[#e67e22] mb-6"></div>

                  <p className="text-slate-600 text-base md:text-lg leading-relaxed font-[family-name:var(--font-work-sans)] mb-10">
                    <EditableText 
                      value={config.standard.subtitle}
                      onChange={(v) => updateNestedConfig(['standard', 'subtitle'], v)}
                      fontFamily={config.fonts?.['standard.subtitle']}
                      onFontChange={(f) => updateNestedConfig(['fonts', 'standard.subtitle'], f)}
                      color={config.colors?.['standard.subtitle']}
                      onColorChange={(c) => updateNestedConfig(['colors', 'standard.subtitle'], c)}
                      multiline
                    />
                  </p>

                  <div className="space-y-6">
                    {(config.standard.items || []).map((pillar, pIdx) => {
                      const Icon = iconMap[pillar.iconType] || Award;
                      return (
                        <div key={pIdx} className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#c4c6cd]/50 shadow-sm relative group">
                          <button 
                            onClick={() => {
                              const newItems = config.standard.items.filter((_, idx) => idx !== pIdx);
                              updateNestedConfig(['standard', 'items'], newItems);
                            }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Eliminar pilar"
                          >×</button>

                          <div className="w-12 h-12 rounded-xl bg-[#162839] text-[#fc8f34] flex items-center justify-center shrink-0 relative cursor-pointer">
                            <Icon className="w-6 h-6" />
                            <select 
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              value={pillar.iconType}
                              onChange={(e) => {
                                const newItems = [...config.standard.items];
                                newItems[pIdx].iconType = e.target.value;
                                updateNestedConfig(['standard', 'items'], newItems);
                              }}
                            >
                              {Object.keys(iconMap).map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          </div>

                          <div className="flex-1 pr-6">
                            <h4 className="font-bold text-base md:text-lg font-[family-name:var(--font-montserrat)] text-[#162839] mb-1">
                              <EditableText 
                                value={pillar.title}
                                onChange={(v) => {
                                  const newItems = [...config.standard.items];
                                  newItems[pIdx].title = v;
                                  updateNestedConfig(['standard', 'items'], newItems);
                                }}
                                fontFamily={config.fonts?.[`standard.items.${pIdx}.title`]}
                                onFontChange={(f) => updateNestedConfig(['fonts', `standard.items.${pIdx}.title`], f)}
                                color={config.colors?.[`standard.items.${pIdx}.title`]}
                                onColorChange={(c) => updateNestedConfig(['colors', `standard.items.${pIdx}.title`], c)}
                              />
                            </h4>
                            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-[family-name:var(--font-work-sans)]">
                              <EditableText 
                                value={pillar.desc}
                                onChange={(v) => {
                                  const newItems = [...config.standard.items];
                                  newItems[pIdx].desc = v;
                                  updateNestedConfig(['standard', 'items'], newItems);
                                }}
                                fontFamily={config.fonts?.[`standard.items.${pIdx}.desc`]}
                                onFontChange={(f) => updateNestedConfig(['fonts', `standard.items.${pIdx}.desc`], f)}
                                color={config.colors?.[`standard.items.${pIdx}.desc`]}
                                onColorChange={(c) => updateNestedConfig(['colors', `standard.items.${pIdx}.desc`], c)}
                                multiline
                              />
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    <button 
                      onClick={() => {
                        const newItems = [
                          ...(config.standard.items || []),
                          { iconType: 'Award', title: 'Nuevo Pilar Institucional', desc: 'Descripción del pilar de garantía.' }
                        ];
                        updateNestedConfig(['standard', 'items'], newItems);
                      }}
                      className="px-5 py-2 rounded-full bg-white border border-[#c4c6cd] text-[#162839] text-xs font-bold hover:bg-slate-50"
                    >+ Añadir Pilar de Calidad</button>
                  </div>

                </div>

                {/* Right Image */}
                <div className="lg:col-span-6">
                  <div className="relative rounded-3xl overflow-hidden arch-border shadow-2xl bg-slate-900 group">
                    <EditableImage 
                      src={config.standard.image}
                      onUpload={(url) => updateNestedConfig(['standard', 'image'], url)}
                      className="relative h-[480px] sm:h-[560px] w-full"
                    >
                      <img 
                        src={config.standard.image} 
                        alt="Planos y rigor de ingeniería" 
                        className="w-full h-full object-cover"
                      />
                    </EditableImage>

                    <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-[#162839]/95 backdrop-blur-md border border-white/10 text-white">
                      <div className="flex items-center justify-between mb-1">
                        <EditableText 
                          value={config.standard.qualityBadgeTitle || "Control de Calidad Riguroso"}
                          onChange={(v) => updateNestedConfig(['standard', 'qualityBadgeTitle'], v)}
                          className="text-xs uppercase tracking-wider font-bold text-[#fc8f34]"
                        />
                        <span className="text-[11px] font-mono text-slate-300">ISO / RNE</span>
                      </div>
                      <div className="font-bold text-sm md:text-base font-[family-name:var(--font-montserrat)]">
                        <EditableText 
                          value={config.standard.qualityBadgeSubtitle || "Ensayos de probeta de concreto y resistencia..."}
                          onChange={(v) => updateNestedConfig(['standard', 'qualityBadgeSubtitle'], v)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* =======================================================================
            7. PROCESO PASO A PASO
           ======================================================================= */}
        {(config.process?.enabled ?? true) && (
          <section className="w-full py-20 bg-[#fcf9f6] px-4 md:px-8">
            <div className="max-w-[1360px] mx-auto">
              
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-xs uppercase font-bold tracking-widest text-[#e67e22] block mb-2">
                  <EditableText 
                    value={config.process?.badgeText || "Paso a Paso"}
                    onChange={(v) => updateNestedConfig(['process', 'badgeText'], v)}
                  />
                </span>

                <h2 className="text-3xl md:text-5xl font-black font-[family-name:var(--font-montserrat)] text-[#162839] tracking-tight mb-4">
                  <EditableText 
                    value={config.process?.title || "¿Cómo Obtener tu Vivienda Techo Propio?"}
                    onChange={(v) => updateNestedConfig(['process', 'title'], v)}
                  />
                </h2>
                <div className="w-16 h-1.5 bg-[#e67e22] mx-auto mb-6"></div>

                <p className="text-slate-600 text-base md:text-lg leading-relaxed font-[family-name:var(--font-work-sans)]">
                  <EditableText 
                    value={config.process?.subtitle || "Nosotros nos encargamos de todo el trámite..."}
                    onChange={(v) => updateNestedConfig(['process', 'subtitle'], v)}
                    multiline
                  />
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(config.process?.steps || []).map((step, sIdx) => (
                  <div key={sIdx} className="bg-white rounded-3xl p-7 arch-border flex flex-col justify-between shadow-sm relative group">
                    <button 
                      onClick={() => {
                        const newSteps = config.process!.steps.filter((_, idx) => idx !== sIdx);
                        updateNestedConfig(['process', 'steps'], newSteps);
                      }}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full bg-red-600 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar paso"
                    >×</button>

                    <div className="text-5xl font-black text-[#162839]/10 font-[family-name:var(--font-montserrat)] absolute top-4 right-8">
                      <EditableText 
                        value={step.number}
                        onChange={(v) => {
                          const newSteps = [...config.process!.steps];
                          newSteps[sIdx].number = v;
                          updateNestedConfig(['process', 'steps'], newSteps);
                        }}
                      />
                    </div>

                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#162839] text-[#fc8f34] flex items-center justify-center mb-5">
                        <Check className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold font-[family-name:var(--font-montserrat)] text-[#162839] mb-2">
                        <EditableText 
                          value={step.title}
                          onChange={(v) => {
                            const newSteps = [...config.process!.steps];
                            newSteps[sIdx].title = v;
                            updateNestedConfig(['process', 'steps'], newSteps);
                          }}
                        />
                      </h3>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-[family-name:var(--font-work-sans)]">
                        <EditableText 
                          value={step.desc}
                          onChange={(v) => {
                            const newSteps = [...config.process!.steps];
                            newSteps[sIdx].desc = v;
                            updateNestedConfig(['process', 'steps'], newSteps);
                          }}
                          multiline
                        />
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-[#e67e22]">
                      <EditableText 
                        value={step.badge}
                        onChange={(v) => {
                          const newSteps = [...config.process!.steps];
                          newSteps[sIdx].badge = v;
                          updateNestedConfig(['process', 'steps'], newSteps);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => {
                    const newSteps = [
                      ...(config.process?.steps || []),
                      { number: `0${(config.process?.steps?.length || 0) + 1}`, title: "Nuevo Paso", desc: "Descripción del proceso.", badge: "Fase Técnica" }
                    ];
                    updateNestedConfig(['process', 'steps'], newSteps);
                  }}
                  className="px-5 py-2 rounded-full bg-white border border-[#c4c6cd] text-[#162839] text-xs font-bold hover:bg-slate-50"
                >+ Añadir Paso al Cronograma</button>
              </div>

              {/* Banner WhatsApp */}
              <div className="mt-14 p-8 rounded-3xl bg-[#162839] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div>
                  <h4 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-montserrat)] mb-1">
                    <EditableText 
                      value={config.process?.bannerTitle || "¿Tienes un terreno propio y deseas construir tu casa?"}
                      onChange={(v) => updateNestedConfig(['process', 'bannerTitle'], v)}
                    />
                  </h4>
                  <p className="text-sm text-slate-300">
                    <EditableText 
                      value={config.process?.bannerSubtitle || "Comunícate hoy mismo con nuestros ingenieros..."}
                      onChange={(v) => updateNestedConfig(['process', 'bannerSubtitle'], v)}
                    />
                  </p>
                </div>

                <div className="px-8 py-4 rounded-full bg-[#e67e22] text-white font-bold text-sm md:text-base flex items-center gap-2">
                  <PhoneCall className="w-5 h-5" />
                  <EditableText 
                    value={config.process?.bannerCta || "Postular Ahora Mismo"}
                    onChange={(v) => updateNestedConfig(['process', 'bannerCta'], v)}
                  />
                </div>
              </div>

            </div>
          </section>
        )}

        {/* =======================================================================
            8. OBRAS ENTREGADAS / PROYECTOS
           ======================================================================= */}
        {(config.projects.enabled ?? true) && (
          <section className="w-full py-20 bg-[#f6f3f0] border-t border-[#c4c6cd]/60 px-4 md:px-8">
            <div className="max-w-[1360px] mx-auto">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-[#e67e22] block mb-2">
                    <EditableText 
                      value={config.projects.badgeText || "Galería de Viviendas Reales"}
                      onChange={(v) => updateNestedConfig(['projects', 'badgeText'], v)}
                    />
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black font-[family-name:var(--font-montserrat)] text-[#162839] tracking-tight">
                    <EditableText 
                      value={config.projects.title}
                      onChange={(v) => updateNestedConfig(['projects', 'title'], v)}
                      fontFamily={config.fonts?.['projects.title']}
                      onFontChange={(f) => updateNestedConfig(['fonts', 'projects.title'], f)}
                      color={config.colors?.['projects.title']}
                      onColorChange={(c) => updateNestedConfig(['colors', 'projects.title'], c)}
                    />
                  </h2>
                  <div className="w-16 h-1.5 bg-[#e67e22] mt-4"></div>
                </div>

                <p className="text-slate-600 text-sm md:text-base max-w-md font-[family-name:var(--font-work-sans)]">
                  <EditableText 
                    value={config.projects.subtitle || "Evidencia tangible de nuestro compromiso estructural. Familias que ya disfrutan de su vivienda digna y segura."}
                    onChange={(v) => updateNestedConfig(['projects', 'subtitle'], v)}
                  />
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {(config.projects.items || []).map((item, idx) => (
                  <div key={idx} className="group bg-white rounded-3xl overflow-hidden arch-border shadow-sm flex flex-col relative">
                    <button 
                      onClick={() => {
                        const newItems = config.projects.items.filter((_, i) => i !== idx);
                        updateNestedConfig(['projects', 'items'], newItems);
                      }}
                      className="absolute top-3 right-3 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs z-30 shadow-md"
                      title="Eliminar proyecto"
                    >×</button>

                    <div className="w-full h-[260px] sm:h-[300px] overflow-hidden relative">
                      <ProjectCarousel 
                        images={item.images}
                        onImagesChange={(urls) => {
                          const newItems = [...config.projects.items];
                          newItems[idx].images = urls;
                          updateNestedConfig(['projects', 'items'], newItems);
                        }}
                      />
                    </div>

                    <div className="p-6 md:p-7 flex-1 flex flex-col justify-between">
                      <h4 className="text-lg md:text-xl font-bold text-[#162839] font-[family-name:var(--font-montserrat)] mb-2">
                        <EditableText 
                          value={item.title}
                          onChange={(v) => {
                            const newItems = [...config.projects.items];
                            newItems[idx].title = v;
                            updateNestedConfig(['projects', 'items'], newItems);
                          }}
                          fontFamily={config.fonts?.[`projects.items.${idx}.title`]}
                          onFontChange={(f) => updateNestedConfig(['fonts', `projects.items.${idx}.title`], f)}
                          color={config.colors?.[`projects.items.${idx}.title`]}
                          onColorChange={(c) => updateNestedConfig(['colors', `projects.items.${idx}.title`], c)}
                        />
                      </h4>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Techo Propio</span>
                        <span className="text-emerald-600 font-bold">100% Entregado</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => {
                    const newItems = [...(config.projects.items || []), { images: [], title: "Nuevo Proyecto Techo Propio" }];
                    updateNestedConfig(['projects', 'items'], newItems);
                  }}
                  className="px-6 py-2.5 rounded-full bg-white border border-[#c4c6cd] text-[#162839] font-bold text-xs hover:bg-slate-50 shadow-sm"
                >+ Añadir Tarjeta de Proyecto</button>
              </div>

            </div>
          </section>
        )}

        {/* =======================================================================
            9. SOBRE NOSOTROS
           ======================================================================= */}
        {config.about.enabled && (
          <section className="w-full py-20 bg-[#fcf9f6] px-4 md:px-8">
            <div className="max-w-[1360px] mx-auto">
              <div className="bg-white rounded-3xl p-8 md:p-14 arch-border shadow-xl flex flex-col lg:flex-row gap-10 lg:gap-14 items-center">
                
                <div className="w-full lg:w-1/2">
                  <span className="text-xs uppercase font-bold tracking-widest text-[#e67e22] block mb-2">
                    <EditableText 
                      value={config.about.badgeText || "Trayectoria y Compromiso"}
                      onChange={(v) => updateNestedConfig(['about', 'badgeText'], v)}
                    />
                  </span>

                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-[family-name:var(--font-montserrat)] text-[#162839] tracking-tight mb-3">
                    <EditableText 
                      value={config.about.title}
                      onChange={(v) => updateNestedConfig(['about', 'title'], v)}
                      fontFamily={config.fonts?.['about.title']}
                      onFontChange={(f) => updateNestedConfig(['fonts', 'about.title'], f)}
                      color={config.colors?.['about.title']}
                      onColorChange={(c) => updateNestedConfig(['colors', 'about.title'], c)}
                    />
                  </h2>

                  <h3 className="text-lg md:text-xl font-bold text-[#e67e22] mb-6 font-[family-name:var(--font-montserrat)]">
                    <EditableText 
                      value={config.about.subtitle}
                      onChange={(v) => updateNestedConfig(['about', 'subtitle'], v)}
                      fontFamily={config.fonts?.['about.subtitle']}
                      onFontChange={(f) => updateNestedConfig(['fonts', 'about.subtitle'], f)}
                      color={config.colors?.['about.subtitle']}
                      onColorChange={(c) => updateNestedConfig(['colors', 'about.subtitle'], c)}
                    />
                  </h3>
                  <div className="w-16 h-1.5 bg-[#e67e22] mb-6"></div>

                  <p className="text-sm md:text-base text-slate-600 leading-relaxed font-[family-name:var(--font-work-sans)] whitespace-pre-wrap">
                    <EditableText 
                      value={config.about.content}
                      onChange={(v) => updateNestedConfig(['about', 'content'], v)}
                      fontFamily={config.fonts?.['about.content']}
                      onFontChange={(f) => updateNestedConfig(['fonts', 'about.content'], f)}
                      color={config.colors?.['about.content']}
                      onColorChange={(c) => updateNestedConfig(['colors', 'about.content'], c)}
                      multiline
                    />
                  </p>
                </div>

                <div className="w-full lg:w-1/2 flex flex-col gap-4">
                  <div className="w-full h-72 sm:h-96 md:h-[400px] rounded-2xl overflow-hidden arch-border shadow-md relative bg-slate-900">
                    <ProjectCarousel 
                      images={config.about.images || []}
                      onImagesChange={(urls) => updateNestedConfig(['about', 'images'], urls)}
                    />
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* =======================================================================
            10. FOOTER ARCHITECTURAL
           ======================================================================= */}
        <footer className="w-full bg-[#162839] text-white border-t border-[#2c3e50] pt-16 pb-12 px-4 md:px-8 mt-12">
          <div className="max-w-[1360px] mx-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
              
              {/* Brand */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <EditableImage 
                      src={config.footer.logoImage}
                      onUpload={(url) => updateNestedConfig(['footer', 'logoImage'], url)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden cursor-pointer">
                        {config.footer.logoImage ? (
                          <img src={config.footer.logoImage} alt="Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                          <Building2 className="w-6 h-6 text-[#fc8f34]" />
                        )}
                      </div>
                    </EditableImage>

                    <div>
                      <h3 className="font-extrabold text-xl font-[family-name:var(--font-montserrat)] text-white tracking-tight">
                        <EditableText 
                          value={config.footer.companyName}
                          onChange={(v) => updateNestedConfig(['footer', 'companyName'], v)}
                          fontFamily={config.fonts?.['footer.companyName']}
                          onFontChange={(f) => updateNestedConfig(['fonts', 'footer.companyName'], f)}
                          color={config.colors?.['footer.companyName']}
                          onColorChange={(c) => updateNestedConfig(['colors', 'footer.companyName'], c)}
                        />
                      </h3>
                      <span className="text-[10px] tracking-widest uppercase text-[#fc8f34] font-bold">
                        <EditableText 
                          value={config.footer.subtitle || "Entidad Técnica Techo Propio"}
                          onChange={(v) => updateNestedConfig(['footer', 'subtitle'], v)}
                        />
                      </span>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-[family-name:var(--font-work-sans)] max-w-sm mb-6">
                    <EditableText 
                      value={config.footer.description}
                      onChange={(v) => updateNestedConfig(['footer', 'description'], v)}
                      multiline
                    />
                  </p>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 max-w-sm">
                    <EditableText 
                      value={config.footer.accreditationNote || "Acreditación MIVIVIENDA: Construcción en Sitio Propio (CSP)..."}
                      onChange={(v) => updateNestedConfig(['footer', 'accreditationNote'], v)}
                      multiline
                    />
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="lg:col-span-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-[family-name:var(--font-montserrat)] mb-4">
                  Navegación Rápida
                </h4>
                <ul className="space-y-2.5 text-xs md:text-sm text-slate-300">
                  {(config.footer.links || []).map((link, i) => (
                    <li key={i} className="flex items-center gap-1 group/flnk">
                      <EditableText 
                        value={link.label}
                        onChange={(v) => {
                          const newLinks = [...config.footer.links];
                          newLinks[i].label = v;
                          updateNestedConfig(['footer', 'links'], newLinks);
                        }}
                      />
                      <button 
                        onClick={() => {
                          const newLinks = config.footer.links.filter((_, idx) => idx !== i);
                          updateNestedConfig(['footer', 'links'], newLinks);
                        }}
                        className="opacity-0 group-hover/flnk:opacity-100 text-red-400 text-xs px-1"
                      >×</button>
                    </li>
                  ))}
                  <button 
                    onClick={() => {
                      const newLinks = [...(config.footer.links || []), { label: "Nuevo Link", href: "#" }];
                      updateNestedConfig(['footer', 'links'], newLinks);
                    }}
                    className="text-xs text-[#fc8f34] font-bold hover:underline"
                  >+ Link</button>
                </ul>
              </div>

              {/* Contact */}
              <div className="lg:col-span-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-[family-name:var(--font-montserrat)] mb-4">
                  Contacto & Redes
                </h4>
                
                <div className="space-y-3 text-xs md:text-sm text-slate-300 mb-6 font-mono">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-[#fc8f34] shrink-0" />
                    <span>Central: <EditableText value={config.hero.phone} onChange={(v) => updateNestedConfig(['hero', 'phone'], v)} /></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#fc8f34] font-bold font-sans">@</span>
                    <span><EditableText value={config.footer.email} onChange={(v) => updateNestedConfig(['footer', 'email'], v)} /></span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(config.footer.socialLinks || []).map((social, i) => (
                    <div key={i} className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg border border-white/10 group/soc">
                      <select 
                        value={social.platform}
                        onChange={(e) => {
                          const newSocials = [...config.footer.socialLinks];
                          newSocials[i].platform = e.target.value;
                          updateNestedConfig(['footer', 'socialLinks'], newSocials);
                        }}
                        className="bg-transparent text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="facebook" className="text-black">FB</option>
                        <option value="instagram" className="text-black">IG</option>
                        <option value="linkedin" className="text-black">IN</option>
                        <option value="tiktok" className="text-black">TK</option>
                        <option value="youtube" className="text-black">YT</option>
                      </select>
                      <button 
                        onClick={() => {
                          const newSocials = config.footer.socialLinks.filter((_, idx) => idx !== i);
                          updateNestedConfig(['footer', 'socialLinks'], newSocials);
                        }}
                        className="text-red-400 text-xs px-1 hover:text-red-300"
                      >×</button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newSocials = [...(config.footer.socialLinks || []), { platform: "facebook", url: "#" }];
                      updateNestedConfig(['footer', 'socialLinks'], newSocials);
                    }}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-lg"
                  >+ Red Social</button>
                </div>

                <div className="text-xs text-slate-400">
                  © {new Date().getFullYear()} <EditableText value={config.footer.copyright} onChange={(v) => updateNestedConfig(['footer', 'copyright'], v)} />
                </div>
              </div>

            </div>

          </div>
        </footer>

        {/* =======================================================================
            11. CHATBOT IA & AVATAR CHARACTER SECTION
           ======================================================================= */}
        <section id="chatbot-config" className="w-full px-4 md:px-8 my-12 scroll-mt-28">
          <div className="max-w-[1360px] mx-auto bg-white rounded-3xl p-6 md:p-10 shadow-xl border-2 border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-[family-name:var(--font-montserrat)] text-slate-800">Cerebro del Chatbot IA & Avatar Bot</h2>
                  <p className="text-slate-500 text-sm">Gestiona el personaje 3D/video y entrena a tu asistente virtual.</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-indigo-50 px-3.5 py-2 rounded-xl border border-indigo-200">
                <input 
                  type="checkbox" 
                  className="accent-indigo-600 w-4 h-4" 
                  checked={config.chatbot?.enabled ?? true}
                  onChange={(e) => updateNestedConfig(['chatbot', 'enabled'], e.target.checked)}
                />
                <span className="text-xs font-bold text-indigo-900">Activar Bot Flotante</span>
              </label>
            </div>

            {/* SECCIÓN DE PERSONAJES / AVATAR DE CUERPO COMPLETO */}
            <div className="mb-10 p-6 bg-gradient-to-br from-indigo-50/50 via-slate-50 to-purple-50/30 rounded-2xl border-2 border-indigo-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Video className="w-5 h-5 text-indigo-600" /> Personajes y Avatar del Bot (Cuerpo Completo)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Gestiona el personaje que sale flotando en la web. Puedes usar videos MP4 en bucle con pantalla verde, videos WebM o imágenes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingChar(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" /> Nuevo Personaje
                </button>
              </div>

              {isAddingChar && (
                <div className="mb-6 p-5 bg-white rounded-xl border-2 border-indigo-200 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> Añadir Nuevo Personaje
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del Personaje</label>
                      <input
                        type="text"
                        value={newCharName}
                        onChange={(e) => setNewCharName(e.target.value)}
                        placeholder="Ej. Asesora Virtual, Ingeniero Carlos"
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Archivo de Video o Imagen</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCharUrl}
                          onChange={(e) => setNewCharUrl(e.target.value)}
                          placeholder="Ruta local (ej. /personaje-bot.mp4) o URL"
                          className="flex-1 p-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                        />
                        <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 transition-colors border border-slate-200">
                          {uploadingCharFile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                          <span>{uploadingCharFile ? "Subiendo..." : "Subir"}</span>
                          <input
                            type="file"
                            accept="video/mp4,video/webm,image/*"
                            onChange={handleUploadCharFile}
                            className="hidden"
                            disabled={uploadingCharFile}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Texto del Bocadillo (Globito de saludo sobre el personaje):
                      </label>
                      <input
                        type="text"
                        value={newCharSpeechText}
                        onChange={(e) => setNewCharSpeechText(e.target.value)}
                        placeholder="¡Hola! ¿Dudas sobre tu casa? Haz clic aquí 👋"
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newCharGreenScreen}
                        onChange={(e) => setNewCharGreenScreen(e.target.checked)}
                        className="w-4 h-4 accent-indigo-600 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-700">Tiene pantalla verde (remover fondo en vivo con Chroma Key)</span>
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingChar(false);
                          setNewCharName('');
                          setNewCharUrl('');
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateChar}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition-colors"
                      >
                        Guardar Personaje
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid de Personajes Configurados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(config.chatbot?.characters || []).map((char, idx) => {
                  const isActive = char.active;
                  return (
                    <div
                      key={char.id || idx}
                      className={`relative rounded-xl p-4 transition-all flex flex-col justify-between ${
                        isActive
                          ? 'bg-white border-2 border-indigo-500 shadow-lg ring-2 ring-indigo-500/10'
                          : 'bg-white/80 border border-slate-200 hover:border-indigo-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">
                          {char.name}
                        </span>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Activo
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActivateChar(char.id)}
                            className="px-2.5 py-0.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 rounded-full text-[11px] font-bold transition-colors"
                          >
                            Activar
                          </button>
                        )}
                      </div>

                      <div className="h-44 w-full bg-slate-900/5 rounded-lg flex items-center justify-center overflow-hidden relative border border-slate-100 my-2">
                        {char.type === 'video' ? (
                          char.isGreenScreen ? (
                            <ChromaVideoAvatar
                              videoSrc={char.url}
                              isGreenScreen={true}
                              characterName={char.name}
                              speechText={char.speechText || '¡Hola! ¿Dudas sobre tu casa? Haz clic aquí 👋'}
                              heightClass="h-36"
                              className="pointer-events-none"
                            />
                          ) : (
                            <video
                              src={char.url}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="h-36 w-auto object-contain rounded drop-shadow-md"
                            />
                          )
                        ) : (
                          <img
                            src={char.url}
                            alt={char.name}
                            className="h-36 w-auto object-contain drop-shadow-md"
                          />
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Texto del Bocadillo (Globito):
                        </label>
                        <input
                          type="text"
                          value={char.speechText || '¡Hola! ¿Dudas sobre tu casa? Haz clic aquí 👋'}
                          onChange={(e) => handleUpdateCharSpeechText(char.id, e.target.value)}
                          className="w-full p-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white"
                        />
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={char.isGreenScreen}
                              onChange={(e) => handleToggleGreenScreen(char.id, e.target.checked)}
                              className="w-3.5 h-3.5 accent-indigo-600 rounded"
                            />
                            <span className="text-[11px] text-slate-600 font-medium">Fondo Verde</span>
                          </label>

                          {(config.chatbot?.characters || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteChar(char.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors text-xs flex items-center gap-1"
                              title="Eliminar personaje"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Eliminar</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prompt & Knowledge */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Instrucciones de Comportamiento (System Prompt)</label>
                  <textarea
                    value={config.chatbot?.systemPrompt || ''}
                    onChange={(e) => updateNestedConfig(['chatbot', 'systemPrompt'], e.target.value)}
                    className="w-full h-32 p-3 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none resize-none"
                    placeholder="Ej. Eres un vendedor amable..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Información de la Empresa (Base de Conocimiento)</label>
                  <textarea
                    value={config.chatbot?.companyInfo || ''}
                    onChange={(e) => updateNestedConfig(['chatbot', 'companyInfo'], e.target.value)}
                    className="w-full h-64 p-3 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none resize-none"
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
                    <p className="text-xs text-slate-500">Imágenes que la IA puede enviar.</p>
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
                          const newImages = config.chatbot!.images.filter((_, idx) => idx !== i);
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
