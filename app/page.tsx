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
            announcement: { ...DEFAULT_LANDING_CONTENT.announcement, ...data.content.announcement }
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

  if (!mounted) return <div className="min-h-screen bg-[#0a0c10]" />;

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] selection:bg-sky-500/30 font-sans overflow-x-hidden relative">
      
      {/* =========================================
          ANNOUNCEMENT POPUP
          ========================================= */}
      <AnimatePresence>
        {config.announcement?.enabled && showAnnouncement && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-[100] bg-slate-900/95 backdrop-blur-2xl border-2 border-sky-500/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="absolute top-3 right-3 z-10">
              <button 
                onClick={() => setShowAnnouncement(false)}
                className="p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {config.announcement.image && (
              <div className="w-full h-32 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
                <img src={config.announcement.image} alt="Announcement" className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`p-6 ${config.announcement.image ? 'pt-2' : ''}`}>
              <h3 className="text-xl font-bold text-white mb-2 font-[family-name:var(--font-montserrat)]">
                {config.announcement.title}
              </h3>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed whitespace-pre-wrap">
                {config.announcement.description}
              </p>
              {config.announcement.buttonText && (
                <a 
                  href={config.announcement.buttonLink || wppLink}
                  className="inline-block px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-sky-500/20"
                >
                  {config.announcement.buttonText}
                </a>
              )}
            </div>
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
              <a href="#" className="text-slate-400 hover:text-sky-400 text-sm transition-colors w-fit">Aviso de Privacidad</a>
              <a href="#" className="text-slate-400 hover:text-sky-400 text-sm transition-colors w-fit">Términos de Servicio</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
