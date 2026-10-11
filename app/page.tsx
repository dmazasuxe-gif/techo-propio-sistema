"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { 
  Ruler, Building2, Hammer, ArrowRight, ShieldCheck, Clock, Award, 
  LucideIcon, HardHat, Pickaxe, Shovel, Truck, Warehouse, Wrench, Paintbrush,
  X, ChevronLeft, ChevronRight, CheckCircle2, FileSearch, Home, PhoneCall, 
  Sparkles, MapPin, BadgeCheck, FileText, ChevronDown, Check, ArrowUpRight
} from 'lucide-react';
import type { LandingContent, LandingConfig } from '@/lib/landing_db';
import { DEFAULT_LANDING_CONTENT } from '@/lib/landing_db';
import { getExpedienteStatusBadge } from '@/lib/status-helper';
import LandingChatbot from '@/app/components/LandingChatbot';
import ModelosViviendaSection from '@/app/components/3d/ModelosViviendaSection';

const iconMap: Record<string, LucideIcon> = {
  Ruler, Building2, Hammer, ArrowRight, ShieldCheck, Clock, Award,
  HardHat, Pickaxe, Shovel, Truck, Warehouse, Wrench, Paintbrush,
  CheckCircle2, FileSearch, Home, PhoneCall, Sparkles, MapPin, BadgeCheck, FileText
};

function ProjectCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900">
      <AnimatePresence initial={false}>
        <motion.img
          key={index}
          src={images[index]}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          alt="Proyecto Constructora Maza Quiroz"
        />
      </AnimatePresence>
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
          {images.map((_, i) => (
            <span
              key={i}
              className={`block rounded-full transition-all duration-300 ${i === index ? 'w-5 h-1.5 bg-[#e67e22]' : 'w-1.5 h-1.5 bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AboutCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f0edea]">
      <AnimatePresence initial={false}>
        <motion.img
          key={index}
          src={images[index]}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          alt="Constructora Maza Quiroz Equipo"
        />
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  
  const [clickTimestamps, setClickTimestamps] = useState<number[]>([]);
  const [config, setConfig] = useState<LandingContent>(DEFAULT_LANDING_CONTENT);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Status Search State
  const [searchDni, setSearchDni] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Modal States
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [viewingGalleryIndex, setViewingGalleryIndex] = useState<number | null>(null);
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);
  const tracked = React.useRef(false);

  const trackInteraction = useCallback((btnName: string) => {
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: `boton_${btnName}`, eventType: 'click' })
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      fetch('/api/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: window.location.pathname, eventType: 'pageview' })
      }).catch(console.error);
    }
    setMounted(true);
    fetch(`/api/landing-config?t=${Date.now()}`)
      .then(r => r.json())
      .then((data: LandingConfig) => {
        if (data && data.content) {
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
            footer: { 
              ...DEFAULT_LANDING_CONTENT.footer, 
              ...data.content.footer, 
              links: data.content.footer?.links || DEFAULT_LANDING_CONTENT.footer.links, 
              socialLinks: data.content.footer?.socialLinks || DEFAULT_LANDING_CONTENT.footer.socialLinks 
            },
            statusSearch: { ...DEFAULT_LANDING_CONTENT.statusSearch, ...data.content.statusSearch },
            projects: { ...DEFAULT_LANDING_CONTENT.projects, ...data.content.projects },
            announcement: { 
              ...DEFAULT_LANDING_CONTENT.announcement, 
              ...data.content.announcement,
              images: data.content.announcement?.images || [],
              backdropOpacity: data.content.announcement?.backdropOpacity ?? 80
            }
          });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingConfig(false));
  }, []);

  useEffect(() => {
    if (!config.hero.images || config.hero.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % config.hero.images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [config.hero.images]);

  // Triple-click shortcut to admin panel
  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    const newTimestamps = [...clickTimestamps, now].slice(-3);
    setClickTimestamps(newTimestamps);

    if (newTimestamps.length === 3) {
      const timeDifference = newTimestamps[2] - newTimestamps[0];
      if (timeDifference < 1000) {
        localStorage.removeItem('techo-propio-logged-in');
        router.push('/sistema');
      }
    }
  }, [clickTimestamps, router]);

  const wppText = config?.hero?.whatsappMessage || "Hola, deseo información para postular al Bono Techo Propio con Constructora Maza Quiroz.";
  const formattedPhone = (config?.hero?.phone || '').replace(/\D/g,'');
  const wppLink = `https://wa.me/51${formattedPhone}?text=${encodeURIComponent(wppText)}`;

  // Announcement Carousel
  const [announcementImageIndex, setAnnouncementImageIndex] = useState(0);

  useEffect(() => {
    if (!config.announcement?.images || config.announcement.images.length <= 1 || !showAnnouncement) return;
    const interval = setInterval(() => {
      setAnnouncementImageIndex((prev) => (prev + 1) % config.announcement.images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [config.announcement?.images, showAnnouncement]);

  const handleStatusSearch = async () => {
    trackInteraction('consulta_dni');
    setSearchError(null);
    setSearchResult(null);
    
    if (!searchDni) {
      setSearchError("Por favor ingrese su número de DNI.");
      return;
    }
    if (!/^\d{8}$/.test(searchDni)) {
      setSearchError("El DNI debe contener exactamente 8 dígitos numéricos.");
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(`/api/consulta-estado?dni=${searchDni}`);
      const data = await res.json();
      
      if (!res.ok) {
        setSearchError(data.error || "Error al realizar la consulta.");
      } else if (!data.results || data.results.length === 0) {
        setSearchError("No se encontró ningún expediente registrado con este DNI. Contáctanos por WhatsApp para verificar tu postulación.");
      } else {
        setSearchResult(data.results);
      }
    } catch {
      setSearchError("El servicio de consulta no está disponible temporalmente.");
    } finally {
      setSearchLoading(false);
    }
  };

  if (isLoadingConfig) {
    return (
      <div className="min-h-screen bg-[#fcf9f6] flex flex-col items-center justify-center p-6">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-[#162839]/10 animate-ping"></div>
          <div className="w-16 h-16 rounded-full border-4 border-t-[#e67e22] border-r-[#162839] border-b-[#162839] border-l-[#162839]/20 animate-spin"></div>
        </div>
        <div className="text-center">
          <span className="text-xs uppercase tracking-widest text-[#e67e22] font-bold block mb-1">Entidad Técnica Autorizada</span>
          <h2 className="text-xl font-bold text-[#162839] font-[family-name:var(--font-montserrat)] tracking-tight">CONSTRUCTORA MAZA QUIROZ</h2>
          <p className="text-sm text-slate-500 mt-1 font-[family-name:var(--font-work-sans)]">Cargando plataforma oficial Techo Propio...</p>
        </div>
      </div>
    );
  }

  if (!mounted) return <div className="min-h-screen bg-[#fcf9f6]" />;

  return (
    <div className="min-h-screen bg-[#fcf9f6] text-[#1c1c1a] font-[family-name:var(--font-work-sans)] selection:bg-[#e67e22]/20 selection:text-[#162839] overflow-x-hidden relative flex flex-col">
      
      {/* =========================================================================
          ANNOUNCEMENT MODAL
         ========================================================================= */}
      <AnimatePresence>
        {config.announcement?.enabled && showAnnouncement && config.announcement.images && config.announcement.images.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 backdrop-blur-md"
            style={{ backgroundColor: `rgba(15, 23, 42, ${(config.announcement.backdropOpacity ?? 80) / 100})` }}
          >
            <button 
              onClick={() => setShowAnnouncement(false)} 
              className="absolute top-6 right-6 z-[260] p-3 bg-black/60 hover:bg-black/90 rounded-full text-white transition-colors border border-white/20 shadow-2xl"
              aria-label="Cerrar comunicado"
            >
              <X className="w-7 h-7" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
              className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center p-2 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="w-full h-full max-h-[80vh] flex items-center justify-center relative">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={announcementImageIndex} 
                    src={config.announcement.images[announcementImageIndex]} 
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0 }} 
                    transition={{ duration: 0.4 }} 
                    alt="Comunicado Oficial Constructora Maza Quiroz" 
                    className="w-full h-full object-contain max-h-[80vh] rounded-2xl" 
                  />
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          GALLERY LIGHTBOX MODAL
         ========================================================================= */}
      <AnimatePresence>
        {viewingGalleryIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8"
          >
            <button 
              onClick={() => setViewingGalleryIndex(null)} 
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
              aria-label="Cerrar galería"
            >
              <X className="w-6 h-6" />
            </button>
            {config.services.items[viewingGalleryIndex]?.images?.length > 0 ? (
              <div className="relative w-full max-w-6xl h-[80vh] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={galleryImageIndex} 
                    src={config.services.items[viewingGalleryIndex].images[galleryImageIndex]} 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }} 
                    transition={{ duration: 0.3 }} 
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
                    alt="Galería del servicio"
                  />
                </AnimatePresence>
                {config.services.items[viewingGalleryIndex].images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setGalleryImageIndex((prev) => (prev - 1 + config.services.items[viewingGalleryIndex].images.length) % config.services.items[viewingGalleryIndex].images.length); 
                      }} 
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/25 rounded-full text-white backdrop-blur-md transition-all"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setGalleryImageIndex((prev) => (prev + 1) % config.services.items[viewingGalleryIndex].images.length); 
                      }} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/25 rounded-full text-white backdrop-blur-md transition-all"
                      aria-label="Siguiente imagen"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-white text-xl">No hay fotografías cargadas para este servicio.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          DNI RESULT MODAL
         ========================================================================= */}
      <AnimatePresence>
        {searchResult && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[300] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl w-full max-w-4xl p-6 md:p-8 relative overflow-hidden shadow-2xl arch-border">
              <button 
                onClick={() => setSearchResult(null)} 
                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition-colors"
                aria-label="Cerrar resultados"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#162839] text-white flex items-center justify-center">
                  <BadgeCheck className="w-7 h-7 text-[#fc8f34]" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-[#e67e22]">Resultado Oficial</span>
                  <h2 className="text-2xl font-bold text-[#162839] font-[family-name:var(--font-montserrat)] tracking-tight">Estado de Expediente</h2>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left whitespace-nowrap text-[14px]">
                  <thead>
                    <tr className="bg-[#f6f3f0] text-[#162839] font-bold border-b border-slate-200">
                      <th className="p-4">Postulante</th>
                      <th className="p-4">DNI</th>
                      <th className="p-4">Estado Actual</th>
                      <th className="p-4">Fecha Actualización</th>
                      <th className="p-4">Ubicación del Terreno</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {searchResult.map((res, i) => {
                      const badge = getExpedienteStatusBadge(res.estado);
                      return (
                        <tr key={i} className="text-slate-800 hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-semibold text-[#162839]">{res.postulante}</td>
                          <td className="p-4 font-mono font-medium">{res.dni_postulante}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${badge.colorClass}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500">{res.created_at ? new Date(res.created_at).toLocaleDateString() : '-'}</td>
                          <td className="p-4 text-slate-600">{[res.departamento, res.provincia, res.distrito].filter(Boolean).join(' / ') || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-[#fcf9f6] border border-[#c4c6cd]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-600">
                  ¿Necesitas acelerar tu expediente o consultar observaciones?
                </div>
                <a 
                  href={wppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-[#162839] hover:bg-[#2c3e50] text-white text-xs font-bold transition-all flex items-center gap-2"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#e67e22]" /> Contactar a un Asesor Técnico
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          TOP INSTITUTIONAL BAR
         ========================================================================= */}
      <div className="bg-[#162839] text-white text-[12px] font-medium py-2 px-4 md:px-8 border-b border-[#2c3e50]">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200 tracking-wide uppercase">Entidad Técnica Autorizada</span>
            <span className="text-slate-400 hidden md:inline">|</span>
            <span className="text-slate-300 hidden md:inline">Programa Techo Propio · Fondo MIVIVIENDA (Construcción en Sitio Propio)</span>
          </div>
          <div className="flex items-center gap-6 text-slate-300 text-xs">
            <span className="hidden sm:inline">Atención directa: <strong className="text-white font-mono">{config.hero.phone}</strong></span>
            <span className="bg-[#e67e22]/20 text-[#fc8f34] px-2.5 py-0.5 rounded-full font-bold border border-[#e67e22]/30">Bono 100% Gratuito</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          NAVIGATION BAR (Sticky Architectural Nav)
         ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#fcf9f6]/90 backdrop-blur-md border-b border-[#c4c6cd]/60 transition-all duration-300">
        <nav className="max-w-[1360px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Logo with secret triple click to admin */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group" 
            onClick={handleLogoClick}
            title="Constructora Maza Quiroz"
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#162839] text-white flex items-center justify-center shadow-sm border border-[#2c3e50] overflow-hidden group-hover:scale-105 transition-transform">
              {config.nav.logoImage ? (
                <img src={config.nav.logoImage} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Building2 className="w-6 h-6 text-[#fc8f34]" />
              )}
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-lg md:text-xl font-[family-name:var(--font-montserrat)] text-[#162839] tracking-tight">
                {config.nav.logoText || "MAZA QUIROZ"}
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#e67e22] font-bold mt-0.5">
                CONSTRUCTORA & ET
              </span>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-8 text-[14px] font-semibold text-[#43474c]">
            <a href="#servicios" className="hover:text-[#162839] transition-colors py-1">Servicios</a>
            <a href="#estandar" className="hover:text-[#162839] transition-colors py-1">El Estándar</a>
            <a href="#modelos-3d" className="hover:text-[#162839] transition-colors py-1 flex items-center gap-1.5">
              <span>Modelos 3D</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-[#162839] text-white rounded font-bold">VR</span>
            </a>
            <a href="#proceso" className="hover:text-[#162839] transition-colors py-1">Paso a Paso</a>
            <a href="#proyectos" className="hover:text-[#162839] transition-colors py-1">Obras Entregadas</a>
            <a href="#consulta-estado" className="hover:text-[#162839] transition-colors py-1 flex items-center gap-1 text-[#e67e22]">
              <FileSearch className="w-4 h-4" />
              <span>Consulta DNI</span>
            </a>
            {config.about?.enabled && (
              <a href="#nosotros" className="hover:text-[#162839] transition-colors py-1">Nosotros</a>
            )}
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <a 
              href={wppLink}
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => trackInteraction('whatsapp_nav')}
              className="px-5 py-2.5 rounded-full bg-[#162839] hover:bg-[#2c3e50] text-white text-[13px] md:text-[14px] font-bold transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-[#fc8f34]" />
              <span className="hidden sm:inline">{config.nav.ctaText || "Postular al Bono"}</span>
              <span className="sm:hidden">Postular</span>
            </a>
          </div>
        </nav>
      </header>

      {/* =========================================================================
          MAIN CONTENT
         ========================================================================= */}
      <main className="flex-1 flex flex-col w-full">
        
        {/* =======================================================================
            HERO SECTION (High-Impact Architectural Hero with Bento Value Cards)
           ======================================================================= */}
        <section className="relative w-full overflow-hidden bg-[#162839] text-white border-b border-[#2c3e50]">
          
          {/* Background image slider with dark blueprint gradient */}
          <div className="absolute inset-0 z-0">
            <AnimatePresence>
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 0.28, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <Image 
                  src={config?.hero?.images?.[currentImageIndex] || "https://images.unsplash.com/photo-1541888081622-15cb343d3b40?q=80&w=2070&auto=format&fit=crop"}
                  alt="Constructora Maza Quiroz Techo Propio" 
                  fill
                  priority
                  unoptimized
                  sizes="100vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-[#162839] via-[#162839]/90 to-[#162839]/60 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(230,126,34,0.12),transparent_60%)] pointer-events-none"></div>
          </div>

          <div className="relative z-10 max-w-[1360px] mx-auto px-4 md:px-8 py-16 md:py-24 lg:py-28 flex flex-col">
            
            <div className="max-w-3xl">
              {/* Institution badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-6">
                <ShieldCheck className="w-4 h-4 text-[#fc8f34]" />
                <span className="text-xs uppercase tracking-wider font-bold text-slate-200">
                  {config.hero.badgeText || "Entidad Técnica Autorizada Fondo MIVIVIENDA"}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-[family-name:var(--font-montserrat)] tracking-tight leading-[1.1] mb-6 text-white">
                Construimos Tu Hogar de Material Noble con el <span className="text-[#fc8f34]">Subsidio 100% del Estado</span>.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-slate-300 font-[family-name:var(--font-work-sans)] leading-relaxed mb-8 max-w-2xl">
                Accede al Bono Familiar Habitacional (BFH) modalidad Construcción en Sitio Propio. Transformamos tu lote en una vivienda moderna y 100% antisísmica sin cuota inicial ni préstamos bancarios.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 mb-14">
                <a 
                  href="#consulta-estado"
                  className="px-7 py-3.5 rounded-full bg-[#e67e22] hover:bg-[#fc8f34] text-white font-bold text-sm md:text-base transition-all shadow-lg hover:shadow-orange-500/25 active:scale-95 flex items-center gap-2.5"
                >
                  <FileSearch className="w-5 h-5" />
                  <span>Consultar Estado DNI</span>
                </a>

                <a 
                  href={wppLink}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={() => trackInteraction('whatsapp_hero')}
                  className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm md:text-base transition-all backdrop-blur-md active:scale-95 flex items-center gap-2.5"
                >
                  <PhoneCall className="w-5 h-5 text-[#fc8f34]" />
                  <span>Postular por WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Bento Grid Stats from Stitch Design */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/10">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <div className="text-3xl md:text-4xl font-black font-[family-name:var(--font-montserrat)] text-[#fc8f34] mb-1">
                  15+
                </div>
                <div className="text-xs uppercase font-bold text-slate-300 tracking-wider">Años de Trayectoria</div>
                <p className="text-[11px] text-slate-400 mt-1">Experiencia técnica en ingeniería</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <div className="text-3xl md:text-4xl font-black font-[family-name:var(--font-montserrat)] text-white mb-1">
                  500+
                </div>
                <div className="text-xs uppercase font-bold text-slate-300 tracking-wider">Viviendas Entregadas</div>
                <p className="text-[11px] text-slate-400 mt-1">Familias peruanas beneficiadas</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <div className="text-3xl md:text-4xl font-black font-[family-name:var(--font-montserrat)] text-[#fc8f34] mb-1">
                  S/ 0
                </div>
                <div className="text-xs uppercase font-bold text-slate-300 tracking-wider">Cuota Inicial</div>
                <p className="text-[11px] text-slate-400 mt-1">Subsidio cubierto al 100%</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <div className="text-3xl md:text-4xl font-black font-[family-name:var(--font-montserrat)] text-white mb-1">
                  100%
                </div>
                <div className="text-xs uppercase font-bold text-slate-300 tracking-wider">Antisísmico & RNE</div>
                <p className="text-[11px] text-slate-400 mt-1">Ingeniería colegiada CIP/CAP</p>
              </div>
            </div>

          </div>
        </section>

        {/* =======================================================================
            CONSULTA DNI INTERACTIVA + BENEFICIOS INMEDIATOS
           ======================================================================= */}
        <section className="w-full py-16 md:py-20 bg-[#f6f3f0] border-b border-[#c4c6cd]/50" id="consulta-estado">
          <div className="max-w-[1360px] mx-auto px-4 md:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Context Box */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e67e22] mb-3">
                  <BadgeCheck className="w-4 h-4" />
                  <span>Portal Oficial de Verificación</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-[#162839] tracking-tight mb-4">
                  Consulta el Estado de tu Postulación
                </h2>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6 font-[family-name:var(--font-work-sans)]">
                  Si ya te registraste con nosotros o presentaste tus documentos, consulta en tiempo real la fase de tu expediente técnico ante el Fondo MIVIVIENDA.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs md:text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Validación directa con la base de datos de expedientes</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs md:text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Conoce si tu bono ya fue asignado o está en construcción</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs md:text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% gratuito y confidencial</span>
                  </div>
                </div>
              </div>

              {/* Right Interactive Search Card */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#c4c6cd]/60 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileSearch className="w-5 h-5 text-[#162839]" />
                      <h3 className="text-lg md:text-xl font-bold text-[#162839] font-[family-name:var(--font-montserrat)]">
                        {config.statusSearch.title || "Ingresa tu Documento Nacional de Identidad"}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-[#f6f3f0] text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                      DNI (8 dígitos)
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 mb-6 font-[family-name:var(--font-work-sans)]">
                    {config.statusSearch.subtitle || "Ingresa tu número de DNI para consultar el avance técnico y estado de aprobación de tu vivienda."}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        inputMode="numeric"
                        maxLength={8}
                        value={searchDni}
                        onChange={(e) => setSearchDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        onKeyDown={(e) => e.key === 'Enter' && handleStatusSearch()}
                        placeholder={config.statusSearch.placeholder || "Ej: 71234567"} 
                        className="w-full bg-[#fcf9f6] border-2 border-slate-200 focus:border-[#162839] rounded-2xl px-5 py-4 text-[#162839] placeholder:text-slate-400 font-mono text-base font-semibold transition-all outline-none"
                        disabled={searchLoading}
                      />
                      {searchDni.length === 8 && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={handleStatusSearch}
                      disabled={searchLoading || searchDni.length !== 8}
                      className="bg-[#162839] hover:bg-[#2c3e50] text-white font-bold px-8 py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                    >
                      {searchLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Verificando...</span>
                        </>
                      ) : (
                        <>
                          <span>{config.statusSearch.buttonText || "Consultar Estado"}</span>
                          <ArrowRight className="w-4 h-4 text-[#fc8f34]" />
                        </>
                      )}
                    </button>
                  </div>

                  {searchError && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2.5"
                    >
                      <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>{searchError}</span>
                    </motion.div>
                  )}

                  <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                    <span>Sistema de consulta en línea 24/7</span>
                    <a href={wppLink} target="_blank" rel="noopener noreferrer" className="text-[#162839] font-bold hover:underline flex items-center gap-1">
                      <span>¿Aún no has postulado? Inscríbete aquí</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#e67e22]" />
                    </a>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =======================================================================
            NUESTRA EXPERIENCIA (SERVICIOS Y CAPACIDADES TÉCNICAS)
           ======================================================================= */}
        <section className="w-full py-20 md:py-28 bg-[#fcf9f6]" id="servicios">
          <div className="max-w-[1360px] mx-auto px-4 md:px-8">
            
            <div className="mb-14 max-w-3xl">
              <span className="text-xs uppercase font-bold tracking-widest text-[#e67e22] block mb-2">
                Ingeniería Estructural & Especialidad
              </span>
              <h2 className="text-3xl md:text-5xl font-black font-[family-name:var(--font-montserrat)] text-[#162839] tracking-tight mb-4">
                {config.services.title || "Nuestra Experiencia Constructiva"}
              </h2>
              <div className="w-16 h-1.5 bg-[#e67e22] mb-6"></div>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed font-[family-name:var(--font-work-sans)]">
                {config.services.subtitle || "Ingeniería de precisión aplicada con rigor normativo para garantizar solidez, habitabilidad y durabilidad de por vida."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {(config?.services?.items || []).map((service, i) => {
                const Icon = iconMap[service.iconType] || Hammer;
                const hasImages = service.images && service.images.length > 0;
                const statNum = service.statNum || "0";
                const statText = service.statText || "Dato";

                return (
                  <div 
                    key={i}
                    onClick={() => {
                      if (hasImages) {
                        setGalleryImageIndex(0);
                        setViewingGalleryIndex(i);
                      }
                    }}
                    className={`bg-white rounded-3xl p-8 arch-border flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 group ${hasImages ? 'cursor-pointer ring-1 ring-transparent hover:ring-[#e67e22]/50' : ''}`}
                  >
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-[#f6f3f0] border border-[#c4c6cd]/50 flex items-center justify-center mb-6 group-hover:bg-[#162839] group-hover:text-white transition-colors">
                        <Icon className="w-7 h-7 text-[#162839] group-hover:text-[#fc8f34] transition-colors" strokeWidth={1.75} />
                      </div>

                      <h3 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-montserrat)] text-[#162839] mb-3">
                        {service.title}
                      </h3>

                      <p className="text-[14px] md:text-[15px] text-slate-600 leading-relaxed font-[family-name:var(--font-work-sans)] mb-8">
                        {service.desc}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 mt-auto flex items-end justify-between">
                      <div>
                        <div className="text-3xl md:text-4xl font-black text-[#162839] font-[family-name:var(--font-montserrat)] tracking-tight">
                          {statNum}
                        </div>
                        <div className="text-xs font-semibold text-slate-500 mt-0.5">
                          {statText}
                        </div>
                      </div>

                      {hasImages && (
                        <span className="text-xs font-bold text-[#e67e22] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Ver fotos <ChevronRight className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* =======================================================================
            EL ESTÁNDAR MAZA QUIROZ (PILARES DE CALIDAD INSTITUCIONAL STITCH)
           ======================================================================= */}
        <section className="w-full py-20 md:py-28 bg-[#f6f3f0] border-y border-[#c4c6cd]/60" id="estandar">
          <div className="max-w-[1360px] mx-auto px-4 md:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Pillars */}
              <div className="lg:col-span-6">
                <span className="text-xs uppercase font-bold tracking-widest text-[#e67e22] block mb-2">
                  Garantía y Credibilidad
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-[family-name:var(--font-montserrat)] text-[#162839] tracking-tight mb-4">
                  El Estándar Maza Quiroz
                </h2>
                <div className="w-16 h-1.5 bg-[#e67e22] mb-6"></div>
                
                <p className="text-slate-600 text-base md:text-lg leading-relaxed font-[family-name:var(--font-work-sans)] mb-10">
                  No solo construimos paredes; diseñamos estabilidad para tu familia. Cada vivienda del programa Techo Propio ejecutada por nuestra constructora cumple estrictamente con las normas técnicas E-030 (Sismorresistente) y E-070 (Albañilería Confinada).
                </p>

                <div className="space-y-6">
                  
                  {/* Pillar 1 */}
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#c4c6cd]/50 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-[#162839] text-[#fc8f34] flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base md:text-lg font-[family-name:var(--font-montserrat)] text-[#162839] mb-1">
                        Ingeniería y Supervisión Colegiada (CIP / CAP)
                      </h4>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-[family-name:var(--font-work-sans)]">
                        Planos arquitectónicos, cálculos estructurales e instalaciones supervisadas permanentemente por ingenieros civiles residentes colegiados.
                      </p>
                    </div>
                  </div>

                  {/* Pillar 2 */}
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#c4c6cd]/50 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-[#162839] text-[#fc8f34] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base md:text-lg font-[family-name:var(--font-montserrat)] text-[#162839] mb-1">
                        Materiales de Primera Calidad Certificada
                      </h4>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-[family-name:var(--font-work-sans)]">
                        Fierro corrugado siderúrgico, cemento tipo I de alta resistencia y ladrillo King Kong de arcilla cocida que garantizan solidez de por vida.
                      </p>
                    </div>
                  </div>

                  {/* Pillar 3 */}
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#c4c6cd]/50 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-[#162839] text-[#fc8f34] flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base md:text-lg font-[family-name:var(--font-montserrat)] text-[#162839] mb-1">
                        Entrega Puntual Llave en Mano
                      </h4>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-[family-name:var(--font-work-sans)]">
                        Cronograma de obra riguroso. Tu casa se entrega lista para habitar con baño completo, red de agua, desagüe y luminarias operativas.
                      </p>
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Column: Architectural Blueprint Visual from Stitch */}
              <div className="lg:col-span-6">
                <div className="relative rounded-3xl overflow-hidden arch-border shadow-2xl bg-slate-900 group">
                  <div className="relative h-[480px] sm:h-[560px] w-full">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7hbgxJs7cmzk4DNztVWwB95QHZz4gSUo8W8pdnbK0Y8d-Qmm1G6TPUybh2lmrHq-oKGM4BL2xG2E3dYE6UxLKPBjA22uKzTEjqPSiAfQacwRoCgMNFI5vdo4LHPtYJmG_C9FTY_U8Z05Vr-A5iS11BcjhdfuEWZZA2OHdStHDSSGUaL_Pgr9Dsx6LPl6OsAThghy2uHRY12p58zwARdIADtw8DSWTWLiIIeEbhfFvX7TEPM2FElbx" 
                      alt="Planos arquitectónicos y rigor de ingeniería Constructora Maza Quiroz" 
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#162839] via-transparent to-black/20 pointer-events-none"></div>
                  </div>

                  {/* Architectural Badge in corner */}
                  <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-[#162839]/90 backdrop-blur-md border border-white/10 text-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs uppercase tracking-wider font-bold text-[#fc8f34]">Control de Calidad Riguroso</span>
                      <span className="text-[11px] font-mono text-slate-300">ISO / RNE</span>
                    </div>
                    <div className="font-bold text-sm md:text-base font-[family-name:var(--font-montserrat)]">
                      Ensayos de probeta de concreto y resistencia de compresión en cada vaciado.
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =======================================================================
            MODELOS DE VIVIENDA 3D (3D VR VISOR INTEGRATION)
           ======================================================================= */}
        <ModelosViviendaSection />

        {/* =======================================================================
            PROCESO PASO A PASO (CÓMO POSTULAR Y OBTENER TU CASA)
           ======================================================================= */}
        <section className="w-full py-20 md:py-28 bg-[#fcf9f6]" id="proceso">
          <div className="max-w-[1360px] mx-auto px-4 md:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs uppercase font-bold tracking-widest text-[#e67e22] block mb-2">
                Paso a Paso
              </span>
              <h2 className="text-3xl md:text-5xl font-black font-[family-name:var(--font-montserrat)] text-[#162839] tracking-tight mb-4">
                ¿Cómo Obtener tu Vivienda Techo Propio?
              </h2>
              <div className="w-16 h-1.5 bg-[#e67e22] mx-auto mb-6"></div>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed font-[family-name:var(--font-work-sans)]">
                Nosotros nos encargamos de todo el trámite técnico y administrativo ante el Fondo MIVIVIENDA.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              
              {/* Step 1 */}
              <div className="bg-white rounded-3xl p-7 arch-border flex flex-col justify-between hover:shadow-lg transition-all relative group">
                <div className="text-5xl font-black text-[#162839]/10 font-[family-name:var(--font-montserrat)] absolute top-4 right-5 group-hover:text-[#e67e22]/20 transition-colors">
                  01
                </div>
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#162839] text-[#fc8f34] flex items-center justify-center mb-5">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold font-[family-name:var(--font-montserrat)] text-[#162839] mb-2">
                    Inscripción y Verificación
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-[family-name:var(--font-work-sans)]">
                    Verificamos que cuentes con DNI, carga familiar y título de propiedad o constancia de posesión inscrita en SUNARP.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-[#e67e22]">
                  Trámite 100% Gratuito
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-3xl p-7 arch-border flex flex-col justify-between hover:shadow-lg transition-all relative group">
                <div className="text-5xl font-black text-[#162839]/10 font-[family-name:var(--font-montserrat)] absolute top-4 right-5 group-hover:text-[#e67e22]/20 transition-colors">
                  02
                </div>
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#162839] text-[#fc8f34] flex items-center justify-center mb-5">
                    <Ruler className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold font-[family-name:var(--font-montserrat)] text-[#162839] mb-2">
                    Evaluación Técnica de Lote
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-[family-name:var(--font-work-sans)]">
                    Nuestros ingenieros visitan tu terreno para levantamiento topográfico, verificación de linderos y estudio de suelo.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-[#e67e22]">
                  Visita a domicilio
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-3xl p-7 arch-border flex flex-col justify-between hover:shadow-lg transition-all relative group">
                <div className="text-5xl font-black text-[#162839]/10 font-[family-name:var(--font-montserrat)] absolute top-4 right-5 group-hover:text-[#e67e22]/20 transition-colors">
                  03
                </div>
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#162839] text-[#fc8f34] flex items-center justify-center mb-5">
                    <BadgeCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold font-[family-name:var(--font-montserrat)] text-[#162839] mb-2">
                    Aprobación del Bono BFH
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-[family-name:var(--font-work-sans)]">
                    Presentamos el expediente técnico ante el Fondo MIVIVIENDA hasta obtener la resolución de desembolso del subsidio.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-[#e67e22]">
                  Asignación del subsidio
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-3xl p-7 arch-border flex flex-col justify-between hover:shadow-lg transition-all relative group">
                <div className="text-5xl font-black text-[#162839]/10 font-[family-name:var(--font-montserrat)] absolute top-4 right-5 group-hover:text-[#e67e22]/20 transition-colors">
                  04
                </div>
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#162839] text-[#fc8f34] flex items-center justify-center mb-5">
                    <Home className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold font-[family-name:var(--font-montserrat)] text-[#162839] mb-2">
                    Construcción y Llaves en Mano
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-[family-name:var(--font-work-sans)]">
                    Iniciamos la edificación con material noble según planos aprobados y te hacemos entrega formal de tu vivienda terminada.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-emerald-600">
                  ¡Hogar listo para vivir!
                </div>
              </div>

            </div>

            {/* Bottom CTA to WhatsApp */}
            <div className="mt-14 p-8 rounded-3xl bg-[#162839] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <h4 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-montserrat)] mb-1">
                  ¿Tienes un terreno propio y deseas construir tu casa?
                </h4>
                <p className="text-sm text-slate-300">
                  Comunícate hoy mismo con nuestros ingenieros y asesores autorizados para validar tu postulación.
                </p>
              </div>

              <a 
                href={wppLink}
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => trackInteraction('whatsapp_banner_proceso')}
                className="px-8 py-4 rounded-full bg-[#e67e22] hover:bg-[#fc8f34] text-white font-bold text-sm md:text-base transition-all shadow-lg active:scale-95 shrink-0 flex items-center gap-2"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Postular Ahora Mismo</span>
              </a>
            </div>

          </div>
        </section>

        {/* =======================================================================
            OBRAS ENTREGADAS (PROYECTOS RECIENTES)
           ======================================================================= */}
        <section className="w-full py-20 md:py-28 bg-[#f6f3f0] border-t border-[#c4c6cd]/60" id="proyectos">
          <div className="max-w-[1360px] mx-auto px-4 md:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-[#e67e22] block mb-2">
                  Galería de Viviendas Reales
                </span>
                <h2 className="text-3xl md:text-5xl font-black font-[family-name:var(--font-montserrat)] text-[#162839] tracking-tight">
                  {config.projects.title || "Obras Entregadas & En Ejecución"}
                </h2>
                <div className="w-16 h-1.5 bg-[#e67e22] mt-4"></div>
              </div>

              <p className="text-slate-600 text-sm md:text-base max-w-md font-[family-name:var(--font-work-sans)]">
                Evidencia tangible de nuestro compromiso estructural. Familias que ya disfrutan de su vivienda digna y segura.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {(config?.projects?.items || []).map((item, idx) => (
                <div 
                  key={idx} 
                  className="group bg-white rounded-3xl overflow-hidden arch-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="w-full h-[260px] sm:h-[300px] overflow-hidden relative">
                    <ProjectCarousel images={item.images} />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#162839]/90 text-white backdrop-blur-md border border-white/20">
                        Techo Propio
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg md:text-xl font-bold text-[#162839] font-[family-name:var(--font-montserrat)] mb-2">
                        {item.title}
                      </h4>
                      <p className="text-xs md:text-sm text-slate-500 font-[family-name:var(--font-work-sans)] leading-relaxed">
                        Construcción en Sitio Propio ejecutada bajo normativa antisísmica con acabados de primera calidad.
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#e67e22]" /> Terreno Propio
                      </span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 100% Entregado
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* =======================================================================
            NOSOTROS (QUIÉNES SOMOS)
           ======================================================================= */}
        {config.about?.enabled && (
          <section className="w-full py-20 md:py-28 bg-[#fcf9f6]" id="nosotros">
            <div className="max-w-[1360px] mx-auto px-4 md:px-8">
              
              <div className="bg-white rounded-3xl p-8 md:p-14 arch-border shadow-xl flex flex-col lg:flex-row gap-10 lg:gap-14 items-center">
                
                <div className="w-full lg:w-1/2">
                  <span className="text-xs uppercase font-bold tracking-widest text-[#e67e22] block mb-2">
                    Trayectoria y Compromiso
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-[family-name:var(--font-montserrat)] text-[#162839] tracking-tight mb-3">
                    {config.about.title || "Sobre Constructora Maza Quiroz"}
                  </h2>
                  <h3 className="text-lg md:text-xl font-bold text-[#e67e22] mb-6 font-[family-name:var(--font-montserrat)]">
                    {config.about.subtitle || "Entidad Técnica Autorizada para hacer realidad el sueño de tu casa propia"}
                  </h3>
                  <div className="w-16 h-1.5 bg-[#e67e22] mb-6"></div>
                  
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed font-[family-name:var(--font-work-sans)] whitespace-pre-wrap">
                    {config.about.content}
                  </p>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs md:text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#e67e22]" />
                      <span>Registro Oficial de Entidad Técnica</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#162839]" />
                      <span>Supervisión de Calidad Continua</span>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden arch-border shadow-md h-72 sm:h-96 md:h-[420px] relative">
                  <AboutCarousel images={config.about.images || (config.about.image ? [config.about.image] : [])} />
                </div>

              </div>

            </div>
          </section>
        )}

      </main>

      {/* =========================================================================
          FOOTER (Architectural Deep Slate with Trust Credentials)
         ========================================================================= */}
      <footer className="w-full bg-[#162839] text-white border-t border-[#2c3e50] pt-16 pb-12" id="contacto">
        <div className="max-w-[1360px] mx-auto px-4 md:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            
            {/* Col 1: Brand & Credentials */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={handleLogoClick}>
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                    {config.nav.logoImage ? (
                      <img src={config.nav.logoImage} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Building2 className="w-6 h-6 text-[#fc8f34]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl font-[family-name:var(--font-montserrat)] text-white tracking-tight">
                      {config.footer.companyName || "CONSTRUCTORA MAZA QUIROZ"}
                    </h3>
                    <span className="text-[10px] tracking-widest uppercase text-[#fc8f34] font-bold">
                      Entidad Técnica Techo Propio
                    </span>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-[family-name:var(--font-work-sans)] max-w-sm mb-6">
                  {config.footer.description || "Ingeniería de Precisión & Arquitectura Sismorresistente. Edificando hogares dignos y permanentes para las familias del Perú bajo el subsidio del Estado."}
                </p>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 max-w-sm">
                  <span className="text-[#fc8f34] font-bold block mb-1">Acreditación MIVIVIENDA:</span>
                  Construcción en Sitio Propio (CSP) · Tramitación y ejecución avalada por el Ministerio de Vivienda, Construcción y Saneamiento.
                </div>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="lg:col-span-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-[family-name:var(--font-montserrat)] mb-4">
                Navegación Rápida
              </h4>
              <ul className="space-y-2.5 text-xs md:text-sm text-slate-300">
                <li><a href="#servicios" className="hover:text-white transition-colors">Nuestros Servicios</a></li>
                <li><a href="#estandar" className="hover:text-white transition-colors">El Estándar de Calidad</a></li>
                <li><a href="#modelos-3d" className="hover:text-white transition-colors">Modelos de Vivienda 3D</a></li>
                <li><a href="#proceso" className="hover:text-white transition-colors">Cómo Postular al Bono</a></li>
                <li><a href="#proyectos" className="hover:text-white transition-colors">Obras Entregadas</a></li>
                <li><a href="#consulta-estado" className="hover:text-[#fc8f34] transition-colors font-bold">Consultar Estado de DNI</a></li>
              </ul>
            </div>

            {/* Col 3: Contact & Attention */}
            <div className="lg:col-span-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-[family-name:var(--font-montserrat)] mb-4">
                Contacto & Asesoría
              </h4>
              
              <div className="space-y-3 text-xs md:text-sm text-slate-300 mb-6 font-mono">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#fc8f34] shrink-0" />
                  <span>Central: <strong className="text-white">{config.hero.phone}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#fc8f34] font-bold font-sans">@</span>
                  <span>{config.footer.email}</span>
                </div>
              </div>

              <div className="flex gap-2.5 mb-6">
                {(config?.footer?.socialLinks || []).map((social, i) => (
                  <a 
                    key={i} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={() => trackInteraction(social.platform)}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#fc8f34] hover:text-[#162839] border border-white/10 flex items-center justify-center transition-all text-xs font-bold text-white"
                    aria-label={social.platform}
                  >
                    {social.platform === 'facebook' && 'FB'}
                    {social.platform === 'instagram' && 'IG'}
                    {social.platform === 'linkedin' && 'IN'}
                    {social.platform === 'tiktok' && 'TK'}
                    {social.platform === 'youtube' && 'YT'}
                    {!['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube'].includes(social.platform) && social.platform.substring(0, 2).toUpperCase()}
                  </a>
                ))}
              </div>

              <a 
                href={wppLink}
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#fc8f34] hover:bg-[#e67e22] text-[#162839] hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <span>Chatear con un Asesor Técnico</span>
              </a>
            </div>

          </div>

          {/* Copyright Row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              © {new Date().getFullYear()} {config.footer.copyright || "Constructora Maza Quiroz. Todos los derechos reservados."}
            </div>
            <div className="flex items-center gap-6">
              {(config?.footer?.links || [])
                .filter(link => !['soporte', 'faqs', 'contáctanos', 'contactanos'].includes(link.label.toLowerCase()))
                .map((link, i) => {
                  const isTrabaja = link.label.toLowerCase().includes('trabaja');
                  return (
                    <a key={i} href={isTrabaja ? wppLink : link.href} className="hover:text-white transition-colors">{link.label}</a>
                  );
              })}
            </div>
          </div>

        </div>
      </footer>

      {/* =========================================================================
          INTERACTIVE VIRTUAL ASSISTANT (Preserved with Chroma Key & Dynamic Speech)
         ========================================================================= */}
      <LandingChatbot config={config.chatbot} />

    </div>
  );
}
