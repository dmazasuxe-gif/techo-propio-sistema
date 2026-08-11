import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="bg-surface text-on-surface antialiased pt-20">
      {/* TopNavBar Component */}
      <nav className="bg-surface dark:bg-surface text-primary dark:text-primary-fixed-dim font-label-md text-label-md uppercase tracking-wider fixed top-0 left-0 w-full z-50 border-b border-outline-variant dark:border-on-surface-variant">
        <div className="max-w-container-max mx-auto px-margin-desktop flex justify-between items-center h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center">
            <img 
              alt="CONSTRUCTORA MAZA QUIROZ" 
              className="h-12 w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBW4_asTQxvdL1s7s5Mu1Xow1hLVxR9hko8evbeZrw6eMKXPHAi1R4-PPFFOrY8uFJ2ZAR4kuFiRFZYFm51Dt1s8ouObY45FLymztKWQ80JjtTUuFLTtYZwwG_pH-IrS9E22o5WEwDYF25EirX5kU1ZthWIjdj14uVLkrS5VE-p8FjyQfkU_w3RT0WYNqqASjj5zvVMxF9r75LvCLCJfB9AdNT811SGUyIoNhltBTptr-sadjP8vg_2VQTgOoUCnIDv3A" 
            />
          </Link>

          {/* Navigation Links (Web) */}
          <div className="hidden md:flex space-x-gutter items-center h-full">
            <Link href="#services" className="text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors duration-200 active:scale-95 transition-transform duration-150 h-full flex items-center px-4">
              Servicios
            </Link>
            <Link href="#projects" className="text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors duration-200 active:scale-95 transition-transform duration-150 h-full flex items-center px-4">
              Proyectos
            </Link>
            <Link href="#contact" className="text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors duration-200 active:scale-95 transition-transform duration-150 h-full flex items-center px-4">
              Contacto
            </Link>
          </div>

          {/* Trailing Action & Acceso Sistema */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/sistema" className="text-primary hover:text-secondary transition-colors font-bold">
              Acceso al Sistema
            </Link>
            <Link href="#contact" className="bg-primary text-on-primary px-6 py-3 font-label-md text-label-md hover:bg-surface-tint transition-colors duration-200 active:scale-95">
              Solicitar Cotización
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-primary">
            {/* simple hamburger icon using tailwind/svg if material symbols not loaded, but material is used in original */}
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative w-full min-h-[819px] flex items-center bg-surface-container-lowest overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="bg-cover bg-center w-full h-full opacity-30" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDVMSiPGYO6-FWYnFWekhq8591dx4Kq0s-gXmZ5BdKPvWgzinPRMbMbSBq6JDTCOwIUaKN3sdj9mVTeRjAdASEjhP49OFSvxRTxwsKlTn11YGu0mqvKgYKxIv3JK10KdS_RNa7v8X5x7tIMfB_k_39aUHMp-s8hYVyRXR-Q9rCF7B2rHISbDalac_FXytMHWCCaJadi_bCEaCMbulDVsm3sq4Zw8cbMFqcB4hhyc8ntMo89DkdsT8r3')" }}
          ></div>
        </div>
        <div className="relative z-10 max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop w-full py-rhythm-y-8">
          <div className="max-w-2xl bg-surface/90 backdrop-blur-md p-8 md:p-12 arch-border">
            <h1 className="font-headline-xl text-headline-xl md:font-headline-xl text-primary mb-6">Construyendo el Futuro con Precisión.</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-lg">
                CONSTRUCTORA MAZA QUIROZ ofrece calidad inquebrantable e integridad estructural para proyectos residenciales, comerciales y de infraestructura a gran escala. Diseñamos la permanencia.
            </p>
            <Link href="#contact" className="inline-flex bg-primary text-on-primary px-8 py-4 font-label-md text-label-md hover:bg-surface-tint transition-colors duration-200 active:scale-95 uppercase tracking-wider">
                Inicia tu Proyecto
            </Link>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section id="services" className="py-24 bg-surface">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="mb-16 max-w-3xl">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Nuestra Experiencia</h2>
            <div className="w-16 h-1 bg-secondary mb-6"></div>
            <p className="font-body-md text-body-md text-on-surface-variant">Ingeniería de precisión aplicada en diversos sectores de la construcción.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Service 1 */}
            <div className="bg-surface-container-lowest p-8 arch-border hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-surface-container-low flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">architecture</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary mb-4">Construcción Residencial</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Proyectos residenciales a medida de alta gama diseñados para la longevidad y una solidez estructural incomparable.</p>
            </div>
            {/* Service 2 */}
            <div className="bg-surface-container-lowest p-8 arch-border hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-surface-container-low flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">domain</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary mb-4">Infraestructura Comercial</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Construcciones comerciales escalables y robustas entregadas con planificación meticulosa y estricto cumplimiento de especificaciones técnicas.</p>
            </div>
            {/* Service 3 */}
            <div className="bg-surface-container-lowest p-8 arch-border hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-surface-container-low flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">construction</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary mb-4">Renovación y Remodelación</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Mejoras estructurales y transformaciones modernizadas de espacios existentes, priorizando la seguridad y la elevación estética.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="projects" className="py-24 bg-surface">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="mb-16 max-w-3xl">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Proyectos Recientes</h2>
            <div className="w-16 h-1 bg-secondary mb-6"></div>
            <p className="font-body-md text-body-md text-on-surface-variant">Una muestra de nuestra excelencia en ingeniería y diseño arquitectónico.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Project 1 */}
            <div className="group overflow-hidden arch-border bg-surface-container-lowest">
              <div className="relative h-64 overflow-hidden">
                <img alt="Residencia Horizonte" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida/AP1WRLvCbzTC4pQ-Zw1BvOO72BX6HAej-8XC3PERX6bjPtq6VWfGutqC9zXAEieYWNQ94peTf3lXltJ7aYj6KNY8H9PLsHnxv0aToYeJnrOf-HPcQw_gIES2kcSkDwdTk6zFULqX9-jJOoUP04mS21uoA2Mqqhsv07NPhVhVYtRkRX1W6qhE1mkQ3XSw30w2AhD868rgoMSjThNROHRlQdWJG46ouDGGGH5cA1qbse-oe9luNX5fIQ08yVMEDQs" />
              </div>
              <div className="p-8">
                <h3 className="font-headline-md text-headline-md text-primary mb-2">Residencia Horizonte</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Vivienda unifamiliar de lujo con diseño minimalista.</p>
              </div>
            </div>
            {/* Project 2 */}
            <div className="group overflow-hidden arch-border bg-surface-container-lowest">
              <div className="relative h-64 overflow-hidden">
                <img alt="Centro Corporativo Sky" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida/AP1WRLv5J5xMkU93MXbvbpcIjfm9TvS-pZAiHEmFir6g5UEC0rqXHMSecILlToo2Ly8L317v_gQp_Ey2We18IgmszA3iNpEifaHww48NmJpYBI8pvYbbRN4Ez6EQiXKELqQdem9pOJbmuS38CwY5MbALoO3StLvROMDoqmNfxhUWfOCXqHe0A6gn4XWwfWD5vq6w6OF0cW5VkNI0nWR49AfRQqx5TZxuYpsYe7c9M65tL4k5s6H8c93vx8eypA" />
              </div>
              <div className="p-8">
                <h3 className="font-headline-md text-headline-md text-primary mb-2">Centro Corporativo Sky</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Edificio de oficinas de alta eficiencia energética.</p>
              </div>
            </div>
            {/* Project 3 */}
            <div className="group overflow-hidden arch-border bg-surface-container-lowest">
              <div className="relative h-64 overflow-hidden">
                <img alt="Renovación Loft Urbano" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida/AP1WRLvd5VkHpdiXAq4bwpL8bMIl3nNKkvDO6Vgd-p6yGBYmFdeFWfVIB9VRBrzvFr6rmUtE5a0yLDsYZlzBRe7FpYVcsYQ93_v6hcf4_TjpaRT-sZCtz49gdkUl0DtGQNWUQW_nbNHOjAU3Nw-LwftrUTMzYHD2g77OA0aF9xadlG1b00gTIQXBdTEGjvwLA2COeqU-90Ap29xHEmDKkOA-f8hkg1Ca74ez-e6XQIHiP9LIo-IXW9_P3aqo3_Y" />
              </div>
              <div className="p-8">
                <h3 className="font-headline-md text-headline-md text-primary mb-2">Renovación Loft Urbano</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Transformación integral de interiores con acabados premium.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Standard Section */}
      <section className="py-24 bg-surface-container-low border-y border-outline-variant">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">El Estándar Maza Quiroz</h2>
              <div className="w-16 h-1 bg-secondary mb-8"></div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-12">No solo construimos; diseñamos estabilidad. Nuestro compromiso con protocolos rígidos asegura que cada proyecto resista la prueba del tiempo.</p>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-secondary mr-4 mt-1">verified</span>
                  <div>
                    <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider mb-1">Experiencia Inigualable</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">Décadas de experiencia colectiva en ingeniería aplicada a cada plano.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-secondary mr-4 mt-1">diamond</span>
                  <div>
                    <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider mb-1">Materiales de Calidad</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">Obteniendo solo materiales de primera calidad, estructuralmente verificados para una integridad absoluta.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-secondary mr-4 mt-1">schedule</span>
                  <div>
                    <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider mb-1">Entrega Puntual</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">Líneas de tiempo rígidas de gestión de proyectos que garantizan la finalización a tiempo sin compromisos.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative h-[600px] arch-border">
              <img className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700" alt="Architectural blueprints" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7hbgxJs7cmzk4DNztVWwB95QHZz4gSUo8W8pdnbK0Y8d-Qmm1G6TPUybh2lmrHq-oKGM4BL2xG2E3dYE6UxLKPBjA22uKzTEjqPSiAfQacwRoCgMNFI5vdo4LHPtYJmG_C9FTY_U8Z05Vr-A5iS11BcjhdfuEWZZA2OHdStHDSSGUaL_Pgr9Dsx6LPl6OsAThghy2uHRY12p58zwARdIADtw8DSWTWLiIIeEbhfFvX7TEPM2FElbx" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Component */}
      <footer id="contact" className="bg-primary dark:bg-surface-container-lowest text-on-primary dark:text-on-surface font-body-md text-body-md w-full py-16 border-t border-outline dark:border-outline-variant">
        <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter">
          {/* Brand & Copyright */}
          <div className="col-span-1 md:col-span-1 flex flex-col justify-between">
            <div>
              <img alt="CONSTRUCTORA MAZA QUIROZ" className="h-16 w-auto object-contain mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJdcSVEJdyomoe9L8JcdiIsJIgzcYbd3a4jv_Tz5-Q57g3qLQU8r2mdjKqY7ONkrvOG_y2xt4STPfCoP2n15LYD8_97wRdsN5Bp0ZmIq0Aky8aqAZKDCt4UhvFIrEmuM60GPaemPQbrlRmjbQCkwnhGmiFJHMWiRZebMdKo5k9p8Kc-oOEI5cMkFERYtV4UhNBmm33FAyCRayZHJi98gJBL4hmTt9E9vnj0o1maQYVhsNlRmYoinHjVPehb0VqLNzTJw" />
            </div>
            <div className="mt-8 md:mt-0 opacity-70 text-sm">
                © {new Date().getFullYear()} Constructora Maza Quiroz. Todos los derechos reservados. Ingeniería de Precisión & Arquitectura Moderna.
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="flex flex-col space-y-4">
            <Link href="#services" className="text-on-primary-container dark:text-on-surface-variant hover:text-on-primary dark:hover:text-on-surface hover:underline transition-all duration-200 opacity-90 hover:opacity-100 w-fit">Servicios</Link>
            <Link href="#projects" className="text-on-primary-container dark:text-on-surface-variant hover:text-on-primary dark:hover:text-on-surface hover:underline transition-all duration-200 opacity-90 hover:opacity-100 w-fit">Proyectos</Link>
            <Link href="#contact" className="text-on-primary-container dark:text-on-surface-variant hover:text-on-primary dark:hover:text-on-surface hover:underline transition-all duration-200 opacity-90 hover:opacity-100 w-fit">Contacto</Link>
          </div>

          {/* Links Column 2 */}
          <div className="flex flex-col space-y-4">
            <Link href="#" className="text-on-primary-container dark:text-on-surface-variant hover:text-on-primary dark:hover:text-on-surface hover:underline transition-all duration-200 opacity-90 hover:opacity-100 w-fit">Aviso de Privacidad</Link>
            <Link href="#" className="text-on-primary-container dark:text-on-surface-variant hover:text-on-primary dark:hover:text-on-surface hover:underline transition-all duration-200 opacity-90 hover:opacity-100 w-fit">Términos de Servicio</Link>
          </div>

          {/* Social Links */}
          <div className="flex flex-col space-y-4">
            <a href="#" className="text-on-primary-container dark:text-on-surface-variant hover:text-on-primary dark:hover:text-on-surface hover:underline transition-all duration-200 opacity-90 hover:opacity-100 w-fit flex items-center gap-2">
                Instagram
            </a>
            <a href="#" className="text-on-primary-container dark:text-on-surface-variant hover:text-on-primary dark:hover:text-on-surface hover:underline transition-all duration-200 opacity-90 hover:opacity-100 w-fit flex items-center gap-2">
                LinkedIn
            </a>
            <a href="#" className="text-on-primary-container dark:text-on-surface-variant hover:text-on-primary dark:hover:text-on-surface hover:underline transition-all duration-200 opacity-90 hover:opacity-100 w-fit flex items-center gap-2">
                Facebook
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
