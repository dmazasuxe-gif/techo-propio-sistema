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
import { getExpedienteStatusBadge } from '@/lib/status-helper';
import LandingChatbot from '@/app/components/LandingChatbot';

const iconMap: Record<string, LucideIcon> = {
  Ruler, Building2, Hammer, ArrowRight, ShieldCheck, Clock, Award,
  HardHat, Pickaxe, Shovel, Truck, Warehouse, Wrench, Paintbrush
};


function ProjectCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full overflow-hidden">
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
    </div>
  );
}

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    fetch(`/api/landing-config?t=${Date.now()}`)
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
            footer: { ...DEFAULT_LANDING_CONTENT.footer, ...data.content.footer, links: data.content.footer?.links || DEFAULT_LANDING_CONTENT.footer.links, socialLinks: data.content.footer?.socialLinks || DEFAULT_LANDING_CONTENT.footer.socialLinks },
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
        // Force logout before navigating to the system page so the login screen appears
        localStorage.removeItem('techo-propio-logged-in');
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

  if (!mounted) return <div className="min-h-screen bg-[#F9FAFB]" />;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 selection:bg-slate-300/50 font-sans overflow-x-hidden relative flex flex-col">
      
      {/* MODALS */}
      <AnimatePresence>
        {config.announcement?.enabled && showAnnouncement && config.announcement.images && config.announcement.images.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: `rgba(0, 0, 0, ${(config.announcement.backdropOpacity ?? 80) / 100})` }}
          >
            <button onClick={() => setShowAnnouncement(false)} className="absolute top-6 right-6 z-[260] p-3 bg-black/60 hover:bg-black/90 rounded-full text-white transition-colors border border-white/20 shadow-2xl">
              <X className="w-8 h-8" />
            </button>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }} className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
              <div className="w-full h-full max-h-[90vh] flex items-center justify-center relative">
                <AnimatePresence mode="wait">
                  <motion.img key={announcementImageIndex} src={config.announcement.images[announcementImageIndex]} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: [0.98, 1.02, 0.98] }} exit={{ opacity: 0 }} transition={{ opacity: { duration: 0.5 }, scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }} alt="Announcement" className="w-full h-full object-contain max-h-[90vh] drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" />
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingGalleryIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
            <button onClick={() => setViewingGalleryIndex(null)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50">
              <X className="w-6 h-6" />
            </button>
            {config.services.items[viewingGalleryIndex].images.length > 0 ? (
              <div className="relative w-full max-w-6xl h-[80vh] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img key={galleryImageIndex} src={config.services.items[viewingGalleryIndex].images[galleryImageIndex]} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                </AnimatePresence>
                {config.services.items[viewingGalleryIndex].images.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setGalleryImageIndex((prev) => (prev - 1 + config.services.items[viewingGalleryIndex].images.length) % config.services.items[viewingGalleryIndex].images.length); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md">
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setGalleryImageIndex((prev) => (prev + 1) % config.services.items[viewingGalleryIndex].images.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md">
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-white text-xl">No hay imágenes en esta galería.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>


      {/* DNI MODAL */}
      <AnimatePresence>
        {searchResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl p-8 relative overflow-hidden shadow-2xl">
              <button onClick={() => setSearchResult(null)} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 font-[family-name:var(--font-montserrat)]">Resultados de Postulación</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap text-[15px]">
                  <thead>
                    <tr className="text-slate-500 font-bold border-b border-slate-200">
                      <th className="p-4">Postulante</th>
                      <th className="p-4">Nro Doc.</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4">Fec. Estado</th>
                      <th className="p-4">Ubicación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {searchResult.map((res, i) => {
                      const badge = getExpedienteStatusBadge(res.estado);
                      return (
                        <tr key={i} className="text-slate-800 hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-semibold">{res.postulante}</td>
                          <td className="p-4 font-mono">{res.dni_postulante}</td>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}

      <nav className="w-full z-50 bg-[#F9FAFB] py-6 px-6 md:px-12 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleLogoClick}>
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              {config.nav.logoImage ? (
                <img src={config.nav.logoImage} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="text-slate-900 w-8 h-8" />
              )}
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-xl md:text-2xl font-[family-name:var(--font-montserrat)] text-slate-900 tracking-tight whitespace-pre-line" style={{ fontFamily: config.fonts?.['nav.logoText'], color: config.colors?.['nav.logoText'] }}>{config.nav.logoText}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 text-[15px] font-semibold text-slate-600 font-[family-name:var(--font-work-sans)]">
            {config.nav.links.map((link, i) => (
              <a key={i} href={link.href} className="hover:text-slate-900 transition-colors">{link.label}</a>
            ))}
          </div>

          <div>
            <a href={wppLink} target="_blank" rel="noopener noreferrer" className="px-8 py-3 rounded-full bg-[#1c2331] text-white hover:bg-slate-800 text-[15px] font-medium transition-all hover:shadow-lg shadow-md whitespace-nowrap inline-block" style={{ fontFamily: config.fonts?.['nav.ctaText'], color: config.colors?.['nav.ctaText'] }}>
              {config.nav.ctaText}
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-[1400px] mx-auto">
        
        {/* HERO */}
        <section className="relative w-full mt-4 mb-16">
          <div className="relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden min-h-[400px] md:min-h-[650px] w-full flex items-center shadow-lg">
            
            <div className="absolute inset-0 z-0">
              <AnimatePresence>
                <motion.img 
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  src={config.hero.images[currentImageIndex] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"}
                  alt="Hero Image" 
                  className="w-full h-full object-cover absolute inset-0"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none"></div>
            </div>

            
          </div>
        </section>

        {/* DOS COLUMNAS: SERVICIOS Y DNI */}
        <section className="w-full mb-16" id="servicios">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-10">
            
            {/* IZQUIERDA: SERVICIOS */}
            <div className="flex flex-col">
              <h2 className="text-3xl font-extrabold font-[family-name:var(--font-montserrat)] text-slate-900 mb-8" style={{ fontFamily: config.fonts?.['services.title'], color: config.colors?.['services.title'] }}>{config.services.title}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                {config.services.items.map((service, i) => {
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
                      className={`flex flex-col bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 transition-all ${hasImages ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''}`}
                    >
                      <div className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center mb-6">
                        <Icon className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-bold mb-3 font-[family-name:var(--font-montserrat)] text-slate-900" style={{ fontFamily: config.fonts?.[`services.items.${i}.title`], color: config.colors?.[`services.items.${i}.title`] }}>{service.title}</h3>
                      <p className="text-[15px] text-slate-500 leading-relaxed font-[family-name:var(--font-work-sans)] mb-8 flex-1" style={{ fontFamily: config.fonts?.[`services.items.${i}.desc`], color: config.colors?.[`services.items.${i}.desc`] }}>
                        {service.desc}
                      </p>
                      
                      <div className="mt-auto">
                        <div className="text-4xl font-black text-slate-900 font-[family-name:var(--font-montserrat)] tracking-tight mb-1" style={{ fontFamily: config.fonts?.[`services.items.${i}.statNum`], color: config.colors?.[`services.items.${i}.statNum`] }}>{statNum}</div>
                        <div className="text-sm font-medium text-slate-500" style={{ fontFamily: config.fonts?.[`services.items.${i}.statText`], color: config.colors?.[`services.items.${i}.statText`] }}>{statText}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DERECHA: CONSULTA DNI */}
            <div className="flex flex-col" id="consulta-estado">
              <h2 className="text-3xl font-extrabold font-[family-name:var(--font-montserrat)] text-slate-900 mb-8 flex gap-2" style={{ fontFamily: config.fonts?.['statusSearch.sectionTitle'], color: config.colors?.['statusSearch.sectionTitle'] }}>{config.statusSearch.sectionTitle || "Consulta tu DNI"}</h2>
              
              <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex-1 flex flex-col relative z-10">
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-[family-name:var(--font-montserrat)]" style={{ fontFamily: config.fonts?.['statusSearch.title'], color: config.colors?.['statusSearch.title'] }}>{config.statusSearch.title}</h3>
                <p className="text-slate-500 text-[14px] mb-6 font-[family-name:var(--font-work-sans)] whitespace-pre-wrap" style={{ fontFamily: config.fonts?.['statusSearch.subtitle'], color: config.colors?.['statusSearch.subtitle'] }}>{config.statusSearch.subtitle}</p>
                
                <div className="flex flex-row items-center gap-3">
                  <input 
                    type="text" 
                    value={searchDni}
                    onChange={(e) => setSearchDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    onKeyDown={(e) => e.key === 'Enter' && handleStatusSearch()}
                    placeholder={config.statusSearch.placeholder} 
                    className="w-full bg-white border border-slate-300 rounded-[1rem] px-5 py-3 text-slate-900 focus:outline-none focus:border-[#2563eb] transition-all placeholder:text-slate-400 font-medium text-[15px]"
                    disabled={searchLoading}
                  />
                  <button 
                    onClick={handleStatusSearch}
                    disabled={searchLoading || searchDni.length !== 8}
                    className="bg-[#2563eb] hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-[1rem] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 whitespace-nowrap text-[15px]"
                  >
                    <span style={{ fontFamily: config.fonts?.['statusSearch.buttonText'], color: config.colors?.['statusSearch.buttonText'] }}>{searchLoading ? '...' : config.statusSearch.buttonText}</span>
                  </button>
                </div>
                {searchError && (
                  <div className="text-red-500 text-sm mt-4 font-medium">{searchError}</div>
                )}
              </div>
            </div>

          </div>
        </section>

        
        {/* ULTIMOS PROYECTOS */}
        <section className="w-full mb-16" id="proyectos">
          <h2 className="text-3xl font-extrabold font-[family-name:var(--font-montserrat)] text-slate-900 mb-8" style={{ fontFamily: config.fonts?.['projects.title'], color: config.colors?.['projects.title'] }}>{config.projects.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.projects.items.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-4 group cursor-pointer">
                <div className="w-full h-[280px] rounded-[2rem] overflow-hidden shadow-sm relative">
                  <ProjectCarousel images={item.images} />
                </div>
                <h4 className="text-lg font-bold text-slate-900 px-2" style={{ fontFamily: config.fonts?.[`projects.items.${idx}.title`], color: config.colors?.[`projects.items.${idx}.title`] }}>{item.title}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* NOSOTROS */}
        {config.about?.enabled && (
          <section className="w-full mb-16" id="nosotros">
            <div className="bg-white rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row gap-8 md:gap-12 items-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
              <div className="w-full md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-slate-900 mb-4" style={{ fontFamily: config.fonts?.['about.title'], color: config.colors?.['about.title'] }}>{config.about.title}</h2>
                <h3 className="text-xl md:text-2xl font-bold text-[#2563eb] mb-6 font-[family-name:var(--font-montserrat)]" style={{ fontFamily: config.fonts?.['about.subtitle'], color: config.colors?.['about.subtitle'] }}>{config.about.subtitle}</h3>
                <p className="text-[15px] md:text-[16px] text-slate-600 leading-relaxed font-[family-name:var(--font-work-sans)] whitespace-pre-wrap">
                  {config.about.content}
                </p>
              </div>
              <div className="w-full md:w-1/2 rounded-[2rem] overflow-hidden shadow-lg h-64 md:h-[400px]">
                <img src={config.about.image} alt="Nosotros" className="w-full h-full object-cover" />
              </div>
            </div>
          </section>
        )}

      </main>

      {/* FOOTER OSCURO */}
      <footer className="w-full px-4 md:px-8 mb-8" id="contacto">
        <div className="max-w-[1400px] mx-auto bg-[#1a202c] rounded-3xl p-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6 text-white shadow-xl">
          
          <div className="flex flex-col gap-2 items-center md:items-start w-full md:w-auto">
            <h2 className="font-extrabold text-xl font-[family-name:var(--font-montserrat)]" style={{ fontFamily: config.fonts?.['footer.companyName'], color: config.colors?.['footer.companyName'] }}>{config.footer.companyName}</h2>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {config.footer.links.map((link, i) => (
                <a key={i} href={link.href} className="text-slate-400 text-sm hover:text-white transition-colors">{link.label}</a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
            <div className="flex flex-col items-center md:items-end text-sm text-slate-400 font-mono gap-1">
              <span>{config.hero.phone}</span>
              <span>{config.footer.email}</span>
            </div>
            
            <div className="flex gap-3">
              {config.footer.socialLinks.map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-700 hover:border-slate-500 transition-colors text-xs font-bold text-slate-300">
                  {social.platform === 'facebook' && 'f'}
                  {social.platform === 'instagram' && 'ig'}
                  {social.platform === 'linkedin' && 'in'}
                  {social.platform === 'tiktok' && 'tk'}
                  {social.platform === 'youtube' && 'yt'}
                  {!['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube'].includes(social.platform) && social.platform.substring(0, 2)}
                </a>
              ))}
            </div>
            <div className="text-xs text-slate-500 mt-1">{config.footer.copyright}</div>
          </div>

        </div>
      </footer>

      <LandingChatbot />
    </div>
  );
}
