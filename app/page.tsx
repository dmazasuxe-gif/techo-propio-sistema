"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { Ruler, Building2, Hammer, ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react';
import type { LandingConfig } from '@/lib/landing_db';

export default function LandingPage() {
  const router = useRouter();
  
  // Easter egg: 3 taps on logo to login
  const [clickTimestamps, setClickTimestamps] = useState<number[]>([]);
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetch('/api/landing-config')
      .then(r => r.json())
      .then(data => {
        if (!data.error) setConfig(data);
      })
      .catch(console.error);
  }, []);

  // Background Image Slideshow
  useEffect(() => {
    if (!config?.imagenes_fondo || config.imagenes_fondo.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % config.imagenes_fondo.length
      );
    }, 6000); // Cambiar cada 6 segundos

    return () => clearInterval(interval);
  }, [config?.imagenes_fondo]);

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
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Fallback defaults in case config fails to load quickly
  const title = config?.titulo_principal || "Construyendo el Futuro con Precisión";
  const subtitle = config?.subtitulo || "Calidad inquebrantable e integridad estructural para proyectos residenciales, comerciales y de infraestructura a gran escala. Diseñamos la permanencia.";
  const phone = config?.telefono_contacto || "+51999999999";
  
  const formattedPhone = phone.replace(/\D/g,'');
  const wppLink = `https://wa.me/${formattedPhone}?text=Hola,%20quisiera%20cotizar%20un%20proyecto`;

  const images = config?.imagenes_fondo?.length ? config.imagenes_fondo : [
    "https://images.unsplash.com/photo-1541888081622-15cb343d3b40?q=80&w=2070&auto=format&fit=crop"
  ];

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] selection:bg-sky-500/30 font-sans overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px]" />
      </div>

      {/* Navigation - Glassmorphism */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-[#0a0c10]/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* Brand Logo - Secret Login */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={handleLogoClick}
            title="Constructora Maza Quiroz"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-shadow">
              <Building2 className="text-white w-5 h-5" />
            </div>
            <span className="font-bold tracking-widest text-lg hidden sm:block font-[family-name:var(--font-montserrat)] text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              MAZA QUIROZ
            </span>
          </motion.div>

          {/* Links */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300"
          >
            <a href="#servicios" className="hover:text-sky-400 transition-colors">Servicios</a>
            <a href="#proyectos" className="hover:text-sky-400 transition-colors">Proyectos</a>
            <a href="#estandar" className="hover:text-sky-400 transition-colors">El Estándar</a>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <a href={wppLink} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold transition-all hover:scale-105 hover:border-sky-500/30 flex items-center gap-2">
              Cotizar Proyecto <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </nav>

      <main className="relative z-10 pt-20">
        
        {/* HERO SECTION */}
        <section className="relative w-full min-h-[90vh] flex items-center justify-center px-6">
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#0a0c10]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c10]/40 via-[#0a0c10]/80 to-[#0a0c10] z-10"></div>
            <AnimatePresence mode="popLayout">
              <motion.img 
                key={currentImageIndex}
                src={images[currentImageIndex]}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 0.4, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                alt="Fondo de Construcción" 
                className="w-full h-full object-cover absolute inset-0"
              />
            </AnimatePresence>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-20">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex flex-col items-center"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold tracking-widest uppercase mb-8">
                <ShieldCheck className="w-3.5 h-3.5" />
                Ingeniería de Precisión
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 font-[family-name:var(--font-montserrat)] leading-tight whitespace-pre-wrap">
                {title}
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl font-[family-name:var(--font-work-sans)] leading-relaxed whitespace-pre-wrap">
                {subtitle}
              </motion.p>
              
              <motion.div variants={fadeUp}>
                <a href={wppLink} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-sky-600 rounded-full hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 shadow-lg shadow-sky-500/30 overflow-hidden">
                  <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                  <span className="relative flex items-center gap-2">Inicia tu Proyecto <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section id="servicios" className="py-32 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="mb-20 text-center"
            >
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-montserrat)] mb-4">Nuestra Experiencia</motion.h2>
              <motion.div variants={fadeUp} className="w-24 h-1 bg-gradient-to-r from-sky-500 to-indigo-500 mx-auto rounded-full mb-6"></motion.div>
              <motion.p variants={fadeUp} className="text-slate-400 max-w-2xl mx-auto">Ingeniería de precisión aplicada en diversos sectores de la construcción.</motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Ruler, title: "Residencial Premium", desc: "Proyectos residenciales a medida de alta gama diseñados para la longevidad y solidez estructural." },
                { icon: Building2, title: "Infraestructura Comercial", desc: "Construcciones escalables entregadas con planificación meticulosa y estricto cumplimiento técnico." },
                { icon: Hammer, title: "Renovación Estructural", desc: "Mejoras y transformaciones modernizadas de espacios existentes, priorizando seguridad." }
              ].map((service, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-sky-500/30 hover:bg-white/[0.04] transition-all hover:-translate-y-2 backdrop-blur-sm shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-14 h-14 rounded-xl bg-sky-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <service.icon className="w-7 h-7 text-sky-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-[family-name:var(--font-montserrat)] text-white">{service.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-[family-name:var(--font-work-sans)]">{service.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* THE STANDARD SECTION (Bento Grid Style) */}
        <section id="estandar" className="py-32 px-6 border-t border-white/5 bg-[#0a0c10]/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-montserrat)] mb-6 leading-tight">
                  El Estándar <br/><span className="text-sky-400">Maza Quiroz</span>
                </h2>
                <p className="text-lg text-slate-400 mb-10 font-[family-name:var(--font-work-sans)]">
                  No solo construimos; diseñamos estabilidad. Nuestro compromiso con protocolos rígidos asegura que cada proyecto resista la prueba del tiempo.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: Award, title: "Experiencia Inigualable", desc: "Décadas de experiencia colectiva en ingeniería aplicada a cada plano." },
                    { icon: ShieldCheck, title: "Materiales de Calidad", desc: "Obteniendo solo materiales de primera calidad, estructuralmente verificados." },
                    { icon: Clock, title: "Entrega Puntual", desc: "Líneas de tiempo rígidas que garantizan finalización sin compromisos." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="mt-1">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                          <item.icon className="w-5 h-5 text-indigo-400" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white font-bold tracking-wide mb-1 font-[family-name:var(--font-montserrat)]">{item.title}</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-sky-900/20 group"
              >
                <div className="absolute inset-0 bg-sky-500/10 group-hover:bg-transparent transition-colors z-10 mix-blend-overlay"></div>
                <img 
                  className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" 
                  alt="Architectural blueprints" 
                  src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop" 
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="contacto" className="border-t border-white/10 py-16 bg-[#06080a]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
                  <Building2 className="text-white w-4 h-4" />
                </div>
                <span className="font-bold tracking-widest text-white font-[family-name:var(--font-montserrat)]">MAZA QUIROZ</span>
              </div>
              <p className="text-slate-500 text-sm max-w-sm mb-6">
                Ingeniería de Precisión & Arquitectura Moderna. Elevando los estándares de construcción en cada proyecto.
              </p>
              <div className="text-slate-600 text-xs">
                © {new Date().getFullYear()} Constructora Maza Quiroz. Todos los derechos reservados.
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold mb-2">Navegación</h4>
              <a href="#servicios" className="text-slate-400 hover:text-sky-400 text-sm transition-colors w-fit">Servicios</a>
              <a href="#proyectos" className="text-slate-400 hover:text-sky-400 text-sm transition-colors w-fit">Proyectos</a>
              <a href="#estandar" className="text-slate-400 hover:text-sky-400 text-sm transition-colors w-fit">El Estándar</a>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold mb-2">Legal & Social</h4>
              <a href="#" className="text-slate-400 hover:text-sky-400 text-sm transition-colors w-fit">Aviso de Privacidad</a>
              <a href="#" className="text-slate-400 hover:text-sky-400 text-sm transition-colors w-fit">Términos de Servicio</a>
              <div className="flex gap-4 mt-2">
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-sky-500/20 hover:text-sky-400 text-slate-400 transition-colors">
                  IG
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-sky-500/20 hover:text-sky-400 text-slate-400 transition-colors">
                  LI
                </a>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
