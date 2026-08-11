"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { 
  Ruler, Building2, Hammer, ArrowRight, ShieldCheck, Clock, Award, 
  LucideIcon, HardHat, Pickaxe, Shovel, Truck, Warehouse, Wrench, Paintbrush,
  X, ChevronLeft, ChevronRight, ImageIcon
} from 'lucide-react';
import type { LandingContent, LandingConfig } from '@/lib/landing_db';
import { DEFAULT_LANDING_CONTENT } from '@/lib/landing_db';

const iconMap: Record<string, LucideIcon> = {
  Ruler, Building2, Hammer, ArrowRight, ShieldCheck, Clock, Award,
  HardHat, Pickaxe, Shovel, Truck, Warehouse, Wrench, Paintbrush
};

export default function LandingPage() {
  const router = useRouter();
  
  const [clickTimestamps, setClickTimestamps] = useState<number[]>([]);
  const [config, setConfig] = useState<LandingContent>(DEFAULT_LANDING_CONTENT);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Status Search State
  const [searchDni, setSearchDni] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Modal States
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [viewingGalleryIndex, setViewingGalleryIndex] = useState<number | null>(null);
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    fetch('/api/landing-config')
      .then(r => r.json())
      .then((data: LandingConfig) => {
        if (data && data.content) {
          // Merge defaults in case db json lacks new properties
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
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!config.hero.images || config.hero.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % config.hero.images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [config.hero.images]);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    const newTimestamps = [...clickTimestamps, now].slice(-3);
    setClickTimestamps(newTimestamps);

    if (newTimestamps.length === 3) {
      const timeDifference = newTimestamps[2] - newTimestamps[0];
      if (timeDifference < 1000) {
        router.push('/sistema');
      }
    }
  }, [clickTimestamps, router]);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const formattedPhone = config.hero.phone.replace(/\D/g,'');
  const wppLink = `https://wa.me/${formattedPhone}?text=Hola,%20quisiera%20cotizar%20un%20proyecto`;

  const images = config.hero.images.length ? config.hero.images : [
    "https://images.unsplash.com/photo-1541888081622-15cb343d3b40?q=80&w=2070&auto=format&fit=crop"
  ];

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
    setSearchError(null);
    setSearchResult(null);
    
    if (!searchDni) {
      setSearchError("Por favor ingrese un número de DNI.");
      return;
    }
    if (!/^\d{8}$/.test(searchDni)) {
      setSearchError("El DNI debe contener exactamente 8 dígitos.");
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(`/api/consulta-estado?dni=${searchDni}`);
      const data = await res.json();
      
      if (!res.ok) {
        setSearchError(data.error || "Error al realizar la consulta.");
      } else if (!data.results || data.results.length === 0) {
        setSearchError("No se encontró ninguna postulación con este número de DNI.");
      } else {
        setSearchResult(data.results);
      }
    } catch (err) {
      setSearchError("El servicio no está disponible en este momento.");
    } finally {
      setSearchLoading(false);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[#0a0c10]" />;

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] selection:bg-sky-500/30 font-sans overflow-x-hidden relative">
      
      {/* =========================================
          ANNOUNCEMENT POPUP
          ========================================= */}
      <AnimatePresence>
        {config.announcement?.enabled && showAnnouncement && config.announcement.images && config.announcement.images.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: `rgba(0, 0, 0, ${(config.announcement.backdropOpacity || 80) / 100})` }}
          >
            <button 
              onClick={() => setShowAnnouncement(false)}
              className="absolute top-6 right-6 z-[260] p-3 bg-black/60 hover:bg-black/90 rounded-full text-white transition-colors border border-white/20 shadow-2xl"
            >
              <X className="w-8 h-8" />
            </button>

            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
            >
              
              <div className="w-full h-full max-h-[90vh] flex items-center justify-center relative">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={announcementImageIndex}
                    src={config.announcement.images[announcementImageIndex]}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    alt="Announcement" 
                    className="w-full h-full object-contain max-h-[90vh] drop-shadow-2xl rounded-xl"
                  />
                </AnimatePresence>
                
                {/* Dots indicator if multiple images */}
                {config.announcement.images.length > 1 && (
                  <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
                    {config.announcement.images.map((_, idx) => (
                      <div key={idx} className={`w-3 h-3 rounded-full shadow-lg ${idx === announcementImageIndex ? 'bg-sky-500' : 'bg-white/40'}`} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================
          GALLERY LIGHTBOX
          ========================================= */}
      <AnimatePresence>
        {viewingGalleryIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          >
            <button 
              onClick={() => setViewingGalleryIndex(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
            >
              <X className="w-6 h-6" />
            </button>

            {config.services.items[viewingGalleryIndex].images.length > 0 ? (
              <div className="relative w-full max-w-6xl h-[80vh] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={galleryImageIndex}
                    src={config.services.items[viewingGalleryIndex].images[galleryImageIndex]}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  />
                </AnimatePresence>

                {config.services.items[viewingGalleryIndex].images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const len = config.services.items[viewingGalleryIndex!].images.length;
                        setGalleryImageIndex((prev) => (prev - 1 + len) % len);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const len = config.services.items[viewingGalleryIndex!].images.length;
                        setGalleryImageIndex((prev) => (prev + 1) % len);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  </>
                )}
                
                <div className="absolute bottom-[-40px] left-0 w-full text-center text-white/50 text-sm font-semibold tracking-widest">
                  {galleryImageIndex + 1} / {config.services.items[viewingGalleryIndex].images.length}
                </div>
              </div>
            ) : (
              <div className="text-white text-xl">No hay imágenes en esta galería.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px]" />
      </div>

      <nav className="fixed top-0 left-0 w-full z-40 border-b border-white/5 bg-[#0a0c10]/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center gap-3 cursor-pointer group" onClick={handleLogoClick} title="Constructora"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-shadow overflow-hidden">
              {config.nav.logoImage ? (
                <img src={config.nav.logoImage} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="text-white w-5 h-5" />
              )}
            </div>
            <span className="font-bold tracking-widest text-lg hidden sm:block font-[family-name:var(--font-montserrat)] text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              {config.nav.logoText}
            </span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300"
          >
            {config.nav.links.map((link, i) => (
              <a key={i} href={link.href} className="hover:text-sky-400 transition-colors">{link.label}</a>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <a href={wppLink} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold transition-all hover:scale-105 hover:border-sky-500/30 flex items-center gap-2">
              {config.nav.ctaText} <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </nav>

      <main className="relative z-10 pt-20">
        
        <section className="relative w-full min-h-[90vh] flex items-center justify-center px-6">
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#0a0c10]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c10]/40 via-[#0a0c10]/80 to-[#0a0c10] z-10"></div>
            <AnimatePresence mode="popLayout">
              <motion.img 
                key={currentImageIndex}
                src={images[currentImageIndex]}
                initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 0.4, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                alt="Fondo de Construcción" className="w-full h-full object-cover absolute inset-0"
              />
            </AnimatePresence>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-20">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold tracking-widest uppercase mb-8">
                <ShieldCheck className="w-3.5 h-3.5" /> {config.hero.badgeText}
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 font-[family-name:var(--font-montserrat)] leading-tight whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: config.hero.titleHtml }}
              />
              
              <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl font-[family-name:var(--font-work-sans)] leading-relaxed whitespace-pre-wrap">
                {config.hero.subtitle}
              </motion.p>
              
              <motion.div variants={fadeUp}>
                <a href={wppLink} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-sky-600 rounded-full hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 shadow-lg shadow-sky-500/30 overflow-hidden">
                  <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                  <span className="relative flex items-center gap-2">{config.hero.ctaText} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="servicios" className="py-32 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="mb-20 text-center">
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-montserrat)] mb-4">{config.services.title}</motion.h2>
              <motion.div variants={fadeUp} className="w-24 h-1 bg-gradient-to-r from-sky-500 to-indigo-500 mx-auto rounded-full mb-6"></motion.div>
              <motion.p variants={fadeUp} className="text-slate-400 max-w-2xl mx-auto whitespace-pre-wrap">{config.services.subtitle}</motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {config.services.items.map((service, i) => {
                const Icon = iconMap[service.iconType] || Hammer;
                const hasImages = service.images && service.images.length > 0;
                
                return (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} 
                    className={`group p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-2xl relative overflow-hidden transition-all duration-300 ${hasImages ? 'cursor-pointer hover:border-sky-500/50 hover:bg-sky-500/5 hover:-translate-y-2' : 'hover:border-sky-500/30 hover:bg-white/[0.04]'}`}
                    onClick={() => {
                      if (hasImages) {
                        setGalleryImageIndex(0);
                        setViewingGalleryIndex(i);
                      }
                    }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-xl bg-sky-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-7 h-7 text-sky-400" />
                      </div>
                      {hasImages && (
                        <div className="flex items-center gap-2 bg-sky-500/10 text-sky-400 text-xs font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <ImageIcon className="w-3.5 h-3.5" />
                          Ver Galería
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold mb-3 font-[family-name:var(--font-montserrat)] text-white">{service.title}</h3>
                    <p className="text-slate-400 leading-relaxed font-[family-name:var(--font-work-sans)] whitespace-pre-wrap">{service.desc}</p>
                    
                    {/* Visual Indicator of Gallery images below */}
                    {hasImages && (
                      <div className="mt-6 flex gap-2">
                        {service.images.slice(0, 3).map((img, idx) => (
                          <div key={idx} className="w-10 h-10 rounded border border-white/10 overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity">
                            <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0" />
                          </div>
                        ))}
                        {service.images.length > 3 && (
                          <div className="w-10 h-10 rounded border border-white/10 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 opacity-50 group-hover:opacity-100">
                            +{service.images.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================
            STATUS SEARCH SECTION
            ========================================= */}
        {config.statusSearch?.enabled && (
          <section id="consulta-estado" className="py-24 px-6 border-t border-white/5 bg-[#0a0c10]/80 backdrop-blur-md relative z-10">
            <div className="max-w-5xl mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[80px]"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-montserrat)] text-white mb-4">
                      {config.statusSearch.title}
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto whitespace-pre-wrap text-lg">
                      {config.statusSearch.subtitle}
                    </p>
                  </div>

                  <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4 mb-8">
                    <input 
                      type="text" 
                      value={searchDni}
                      onChange={(e) => setSearchDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      onKeyDown={(e) => e.key === 'Enter' && handleStatusSearch()}
                      placeholder="Ingrese número de DNI" 
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-6 py-4 text-white text-lg tracking-widest font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-inner"
                      disabled={searchLoading}
                    />
                    <button 
                      onClick={handleStatusSearch}
                      disabled={searchLoading || searchDni.length !== 8}
                      className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold px-10 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-500/20 active:scale-95 flex items-center justify-center min-w-[140px]"
                    >
                      {searchLoading ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {searchError && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="max-w-xl mx-auto bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center font-medium"
                      >
                        {searchError}
                      </motion.div>
                    )}

                    {searchResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-10 overflow-x-auto rounded-xl border border-white/10 bg-slate-950/50 shadow-inner"
                      >
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                          <thead>
                            <tr className="bg-slate-900/80 text-sky-400 text-xs uppercase tracking-wider font-bold border-b border-white/10">
                              <th className="p-4 rounded-tl-xl">Postulante</th>
                              <th className="p-4">Nro Doc.</th>
                              <th className="p-4">Estado</th>
                              <th className="p-4">Fec. Estado</th>
                              <th className="p-4">Dpto. / Prov. / Dist.</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {searchResult.map((res, i) => (
                              <tr key={i} className="hover:bg-white/[0.02] transition-colors text-sm text-slate-300">
                                <td className="p-4 font-medium text-white">{res.postulante}</td>
                                <td className="p-4 font-mono">{res.dni_postulante}</td>
                                <td className="p-4">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                    {res.estado}
                                  </span>
                                </td>
                                <td className="p-4 text-slate-400">{res.created_at ? new Date(res.created_at).toLocaleDateString() : '-'}</td>
                                <td className="p-4">{[res.departamento, res.provincia, res.distrito].filter(Boolean).join(' / ') || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        <section id="estandar" className="py-32 px-6 border-t border-white/5 bg-[#0a0c10]/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h2 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-montserrat)] mb-6 leading-tight whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: config.standard.titleHtml }} />
                <p className="text-lg text-slate-400 mb-10 font-[family-name:var(--font-work-sans)] whitespace-pre-wrap">{config.standard.subtitle}</p>
                <div className="space-y-6">
                  {config.standard.items.map((item, i) => {
                    const Icon = iconMap[item.iconType] || ShieldCheck;
                    return (
                      <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="mt-1">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                            <Icon className="w-5 h-5 text-indigo-400" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-white font-bold tracking-wide mb-1 font-[family-name:var(--font-montserrat)]">{item.title}</h4>
                          <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-sky-900/20 group">
                <div className="absolute inset-0 bg-sky-500/10 group-hover:bg-transparent transition-colors z-10 mix-blend-overlay"></div>
                <img className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" alt="Standard Blueprint" src={config.standard.image} />
              </motion.div>
            </div>
          </div>
        </section>

        <footer id="contacto" className="border-t border-white/10 py-16 bg-[#06080a]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center overflow-hidden">
                  {config.footer.logoImage ? (
                    <img src={config.footer.logoImage} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="text-white w-4 h-4" />
                  )}
                </div>
                <span className="font-bold tracking-widest text-white font-[family-name:var(--font-montserrat)]">{config.footer.companyName}</span>
              </div>
              <p className="text-slate-500 text-sm max-w-sm mb-6 whitespace-pre-wrap">{config.footer.description}</p>
              <div className="text-slate-600 text-xs">© {new Date().getFullYear()} {config.footer.copyright}</div>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold mb-2">Navegación</h4>
              {config.nav.links.map((link, i) => (
                <a key={i} href={link.href} className="text-slate-400 hover:text-sky-400 text-sm transition-colors w-fit">{link.label}</a>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold mb-2">Legal & Social</h4>
              <a href="/privacidad" className="text-slate-400 hover:text-sky-400 text-sm transition-colors w-fit">Aviso de Privacidad</a>
              <a href="/terminos" className="text-slate-400 hover:text-sky-400 text-sm transition-colors w-fit">Términos de Servicio</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
