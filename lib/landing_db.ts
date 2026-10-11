import { supabase } from './supabase';

export interface BotCharacter {
  id: string;
  name: string;
  url: string;
  type: 'video' | 'image';
  isGreenScreen: boolean;
  active: boolean;
  speechText?: string;
}

export interface LandingContent {
  topBar?: {
    enabled: boolean;
    badgeText: string;
    description: string;
    subsidioText: string;
  };
  nav: {
    logoImage: string;
    logoText: string;
    logoSubtitle?: string;
    links: { label: string; href: string }[];
    ctaText: string;
  };
  hero: {
    enabled?: boolean;
    badgeText: string;
    title?: string;
    titleHighlight?: string;
    subtitle?: string;
    ctaPrimaryText?: string;
    ctaSecondaryText?: string;
    phone: string;
    whatsappMessage?: string;
    images: string[];
    bgOpacity: number;
    stats?: { num: string; label: string; sublabel: string }[];
  };
  services: {
    enabled?: boolean;
    badgeText?: string;
    title: string;
    subtitle: string;
    items: { iconType: string; title: string; desc: string; images: string[]; statNum?: string; statText?: string }[];
  };
  standard: {
    enabled?: boolean;
    badgeText?: string;
    titleHtml: string;
    subtitle: string;
    image: string;
    qualityBadgeTitle?: string;
    qualityBadgeSubtitle?: string;
    items: { iconType: string; title: string; desc: string }[];
  };
  models3D?: {
    enabled: boolean;
  };
  process?: {
    enabled: boolean;
    badgeText: string;
    title: string;
    subtitle: string;
    steps: { number: string; title: string; desc: string; badge: string }[];
    bannerTitle?: string;
    bannerSubtitle?: string;
    bannerCta?: string;
  };
  footer: {
    logoImage: string;
    companyName: string;
    subtitle?: string;
    description: string;
    accreditationNote?: string;
    copyright: string;
    email: string;
    links: { label: string; href: string }[];
    socialLinks: { platform: string; url: string }[];
  };
  announcement: {
    enabled: boolean;
    images: string[];
    backdropOpacity: number;
  };
  statusSearch: {
    enabled: boolean;
    sectionBadge?: string;
    sectionTitle: string;
    sectionDesc?: string;
    bullets?: string[];
    title: string;
    subtitle: string;
    placeholder: string;
    buttonText: string;
  };
  projects: {
    enabled?: boolean;
    badgeText?: string;
    title: string;
    subtitle?: string;
    items: { images: string[]; title: string }[];
  };
  about: {
    enabled: boolean;
    badgeText?: string;
    title: string;
    subtitle: string;
    content: string;
    image: string;
    images?: string[];
  };
  fonts: Record<string, string>;
  colors: Record<string, string>;
  chatbot?: {
    enabled?: boolean;
    systemPrompt: string;
    companyInfo: string;
    images: { title: string; url: string; category: string }[];
    characters?: BotCharacter[];
    activeCharacterId?: string;
    speechText?: string;
  };
}

export interface LandingConfig {
  id: number;
  content: LandingContent;
  updated_at: string;
}

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  topBar: {
    enabled: true,
    badgeText: "Entidad Técnica Autorizada",
    description: "Programa Techo Propio · Fondo MIVIVIENDA (Construcción en Sitio Propio)",
    subsidioText: "Bono 100% Gratuito"
  },
  nav: {
    logoImage: "",
    logoText: "MAZA QUIROZ",
    logoSubtitle: "CONSTRUCTORA & ET",
    links: [
      { label: "Servicios", href: "#servicios" },
      { label: "El Estándar", href: "#estandar" },
      { label: "Modelos 3D", href: "#modelos-3d" },
      { label: "Paso a Paso", href: "#proceso" },
      { label: "Obras Entregadas", href: "#proyectos" },
      { label: "Consulta DNI", href: "#consulta-estado" }
    ],
    ctaText: "Postular al Bono"
  },
  hero: {
    enabled: true,
    badgeText: "Entidad Técnica Autorizada Fondo MIVIVIENDA",
    title: "Construimos Tu Hogar de Material Noble con el Subsidio 100% del Estado.",
    titleHighlight: "Subsidio 100% del Estado",
    subtitle: "Accede al Bono Familiar Habitacional (BFH) modalidad Construcción en Sitio Propio. Transformamos tu lote en una vivienda moderna y 100% antisísmica sin cuota inicial ni préstamos bancarios.",
    ctaPrimaryText: "Consultar Estado DNI",
    ctaSecondaryText: "Postular por WhatsApp",
    phone: "+51999999999",
    whatsappMessage: "Hola, deseo información para postular al Bono Techo Propio con Constructora Maza Quiroz.",
    images: [
      "https://images.unsplash.com/photo-1541888081622-15cb343d3b40?q=80&w=2070&auto=format&fit=crop"
    ],
    bgOpacity: 30,
    stats: [
      { num: "15+", label: "Años de Trayectoria", sublabel: "Experiencia técnica en ingeniería" },
      { num: "500+", label: "Viviendas Entregadas", sublabel: "Familias peruanas beneficiadas" },
      { num: "S/ 0", label: "Cuota Inicial", sublabel: "Subsidio cubierto al 100%" },
      { num: "100%", label: "Antisísmico & RNE", sublabel: "Ingeniería colegiada CIP/CAP" }
    ]
  },
  services: {
    enabled: true,
    badgeText: "Ingeniería Estructural & Especialidad",
    title: "Nuestra Experiencia Constructiva",
    subtitle: "Ingeniería de precisión aplicada con rigor normativo para garantizar solidez, habitabilidad y durabilidad de por vida.",
    items: [
      { iconType: 'hammer', title: 'Diseño y Planificación', desc: 'Desarrollamos planos arquitectónicos y distribución eficiente del espacio respetando la normativa.', images: [], statNum: '10+', statText: 'Años de Experiencia' },
      { iconType: 'hard-hat', title: 'Construcción Segura', desc: 'Utilizamos materiales certificados y mano de obra calificada para garantizar la durabilidad de tu vivienda.', images: [], statNum: '500+', statText: 'Casas Construidas' },
      { iconType: 'ruler', title: 'Acabados de Primera', desc: 'Entregamos viviendas listas para habitar con acabados estéticos y funcionales que mejoran tu calidad de vida.', images: [], statNum: '98%', statText: 'Clientes Satisfechos' }
    ]
  },
  standard: {
    enabled: true,
    badgeText: "Garantía y Credibilidad",
    titleHtml: "El Estándar Maza Quiroz",
    subtitle: "No solo construimos paredes; diseñamos estabilidad para tu familia. Cada vivienda del programa Techo Propio ejecutada por nuestra constructora cumple estrictamente con las normas técnicas E-030 (Sismorresistente) y E-070 (Albañilería Confinada).",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7hbgxJs7cmzk4DNztVWwB95QHZz4gSUo8W8pdnbK0Y8d-Qmm1G6TPUybh2lmrHq-oKGM4BL2xG2E3dYE6UxLKPBjA22uKzTEjqPSiAfQacwRoCgMNFI5vdo4LHPtYJmG_C9FTY_U8Z05Vr-A5iS11BcjhdfuEWZZA2OHdStHDSSGUaL_Pgr9Dsx6LPl6OsAThghy2uHRY12p58zwARdIADtw8DSWTWLiIIeEbhfFvX7TEPM2FElbx",
    qualityBadgeTitle: "Control de Calidad Riguroso",
    qualityBadgeSubtitle: "Ensayos de probeta de concreto y resistencia de compresión en cada vaciado.",
    items: [
      { iconType: "Award", title: "Ingeniería y Supervisión Colegiada (CIP / CAP)", desc: "Planos arquitectónicos, cálculos estructurales e instalaciones supervisadas permanentemente por ingenieros civiles residentes colegiados." },
      { iconType: "ShieldCheck", title: "Materiales de Primera Calidad Certificada", desc: "Fierro corrugado siderúrgico, cemento tipo I de alta resistencia y ladrillo King Kong de arcilla cocida que garantizan solidez de por vida." },
      { iconType: "Clock", title: "Entrega Puntual Llave en Mano", desc: "Cronograma de obra riguroso. Tu casa se entrega lista para habitar con baño completo, red de agua, desagüe y luminarias operativas." }
    ]
  },
  models3D: {
    enabled: true
  },
  process: {
    enabled: true,
    badgeText: "Paso a Paso",
    title: "¿Cómo Obtener tu Vivienda Techo Propio?",
    subtitle: "Nosotros nos encargamos de todo el trámite técnico y administrativo ante el Fondo MIVIVIENDA.",
    steps: [
      { number: "01", title: "Inscripción y Verificación", desc: "Verificamos que cuentes con DNI, carga familiar y título de propiedad o constancia de posesión inscrita en SUNARP.", badge: "Trámite 100% Gratuito" },
      { number: "02", title: "Evaluación Técnica de Lote", desc: "Nuestros ingenieros visitan tu terreno para levantamiento topográfico, verificación de linderos y estudio de suelo.", badge: "Visita a domicilio" },
      { number: "03", title: "Aprobación del Bono BFH", desc: "Presentamos el expediente técnico ante el Fondo MIVIVIENDA hasta obtener la resolución de desembolso del subsidio.", badge: "Asignación del subsidio" },
      { number: "04", title: "Construcción y Llaves en Mano", desc: "Iniciamos la edificación con material noble según planos aprobados y te hacemos entrega formal de tu vivienda terminada.", badge: "¡Hogar listo para vivir!" }
    ],
    bannerTitle: "¿Tienes un terreno propio y deseas construir tu casa?",
    bannerSubtitle: "Comunícate hoy mismo con nuestros ingenieros y asesores autorizados para validar tu postulación.",
    bannerCta: "Postular Ahora Mismo"
  },
  statusSearch: {
    enabled: true,
    sectionBadge: "Portal Oficial de Verificación",
    sectionTitle: "Consulta el Estado de tu Postulación",
    sectionDesc: "Si ya te registraste con nosotros o presentaste tus documentos, consulta en tiempo real la fase de tu expediente técnico ante el Fondo MIVIVIENDA.",
    bullets: [
      "Validación directa con la base de datos de expedientes",
      "Conoce si tu bono ya fue asignado o está en construcción",
      "100% gratuito y confidencial"
    ],
    title: "Ingresa tu Documento Nacional de Identidad",
    subtitle: "Ingresa tu número de DNI para consultar el avance técnico y estado de aprobación de tu vivienda.",
    placeholder: "Ej: 71234567",
    buttonText: "Consultar Estado"
  },
  projects: {
    enabled: true,
    badgeText: "Galería de Viviendas Reales",
    title: "Obras Entregadas & En Ejecución",
    subtitle: "Evidencia tangible de nuestro compromiso estructural. Familias que ya disfrutan de su vivienda digna y segura.",
    items: [
      { images: [], title: "Residencia Horizonte" },
      { images: [], title: "Módulo Techo Propio" },
      { images: [], title: "Vivienda Unifamiliar CSP" }
    ]
  },
  about: {
    enabled: false,
    badgeText: "Trayectoria y Compromiso",
    title: "Sobre Constructora Maza Quiroz",
    subtitle: "Entidad Técnica Autorizada para hacer realidad el sueño de tu casa propia",
    content: "Somos una empresa líder en el desarrollo de proyectos inmobiliarios bajo el programa Techo Propio, comprometidos con mejorar la calidad de vida de las familias peruanas mediante la construcción de viviendas dignas, seguras y modernas.",
    image: "https://images.unsplash.com/photo-1541888081622-15cb343d3b40?q=80&w=2070&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1541888081622-15cb343d3b40?q=80&w=2070&auto=format&fit=crop"]
  },
  footer: {
    logoImage: "",
    companyName: "CONSTRUCTORA MAZA QUIROZ",
    subtitle: "Entidad Técnica Techo Propio",
    description: "Ingeniería de Precisión & Arquitectura Sismorresistente. Edificando hogares dignos y permanentes para las familias del Perú bajo el subsidio del Estado.",
    accreditationNote: "Acreditación MIVIVIENDA: Construcción en Sitio Propio (CSP) · Tramitación y ejecución avalada por el Ministerio de Vivienda, Construcción y Saneamiento.",
    copyright: "Constructora Maza Quiroz. Todos los derechos reservados.",
    email: "mail@sistematecho.com",
    links: [
      { label: "Aviso Legal", href: "/privacidad" },
      { label: "Trabaja con nosotros", href: "#" }
    ],
    socialLinks: [
      { platform: "facebook", url: "#" },
      { platform: "instagram", url: "#" },
      { platform: "linkedin", url: "#" }
    ]
  },
  announcement: {
    enabled: false,
    images: [],
    backdropOpacity: 80
  },
  chatbot: {
    enabled: true,
    systemPrompt: "Eres el asistente virtual oficial y vendedor estrella de la empresa de construcción. Tu objetivo es ser extremadamente amable, resolver dudas y animarlos a contactarnos para iniciar su proyecto. Responde SIEMPRE de manera breve, clara y conversacional.",
    companyInfo: "Construimos casas bajo el programa Techo Propio. Nuestras casas tienen 2 habitaciones, sala, comedor, cocina y baño.",
    images: [],
    characters: [
      {
        id: "char-1",
        name: "Asistente Virtual",
        url: "/personaje-bot.mp4",
        type: "video",
        isGreenScreen: true,
        active: true,
        speechText: "¡Hola! ¿Dudas sobre tu casa? Haz clic aquí 👋"
      }
    ],
    activeCharacterId: "char-1",
    speechText: "¡Hola! ¿Dudas sobre tu casa? Haz clic aquí 👋"
  },
  fonts: {},
  colors: {}
};

export async function getLandingConfig(): Promise<LandingConfig | null> {
  const { data, error } = await supabase
    .from('landing_config')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) {
    console.error("Error fetching landing config:", error);
    return {
      id: 1,
      content: DEFAULT_LANDING_CONTENT,
      updated_at: new Date().toISOString()
    };
  }
  
  // Merge loaded content with default content to ensure missing keys are present
  const mergedContent: LandingContent = {
    ...DEFAULT_LANDING_CONTENT,
    ...data.content,
    topBar: { ...DEFAULT_LANDING_CONTENT.topBar!, ...(data.content.topBar || {}) },
    nav: { 
      ...DEFAULT_LANDING_CONTENT.nav, 
      ...(data.content.nav || {}),
      logoSubtitle: data.content.nav?.logoSubtitle || DEFAULT_LANDING_CONTENT.nav.logoSubtitle,
      links: Array.isArray(data.content.nav?.links) ? data.content.nav.links : DEFAULT_LANDING_CONTENT.nav.links
    },
    hero: { 
      ...DEFAULT_LANDING_CONTENT.hero, 
      ...(data.content.hero || {}),
      title: data.content.hero?.title || DEFAULT_LANDING_CONTENT.hero.title,
      titleHighlight: data.content.hero?.titleHighlight || DEFAULT_LANDING_CONTENT.hero.titleHighlight,
      subtitle: data.content.hero?.subtitle || DEFAULT_LANDING_CONTENT.hero.subtitle,
      ctaPrimaryText: data.content.hero?.ctaPrimaryText || DEFAULT_LANDING_CONTENT.hero.ctaPrimaryText,
      ctaSecondaryText: data.content.hero?.ctaSecondaryText || DEFAULT_LANDING_CONTENT.hero.ctaSecondaryText,
      stats: Array.isArray(data.content.hero?.stats) && data.content.hero.stats.length > 0 
        ? data.content.hero.stats 
        : DEFAULT_LANDING_CONTENT.hero.stats,
      whatsappMessage: data.content.hero?.whatsappMessage || DEFAULT_LANDING_CONTENT.hero.whatsappMessage
    },
    services: { 
      ...DEFAULT_LANDING_CONTENT.services, 
      ...(data.content.services || {}),
      badgeText: data.content.services?.badgeText || DEFAULT_LANDING_CONTENT.services.badgeText,
      items: Array.isArray(data.content.services?.items) && data.content.services.items.length > 0
        ? data.content.services.items
        : DEFAULT_LANDING_CONTENT.services.items
    },
    standard: {
      ...DEFAULT_LANDING_CONTENT.standard,
      ...(data.content.standard || {}),
      badgeText: data.content.standard?.badgeText || DEFAULT_LANDING_CONTENT.standard.badgeText,
      qualityBadgeTitle: data.content.standard?.qualityBadgeTitle || DEFAULT_LANDING_CONTENT.standard.qualityBadgeTitle,
      qualityBadgeSubtitle: data.content.standard?.qualityBadgeSubtitle || DEFAULT_LANDING_CONTENT.standard.qualityBadgeSubtitle,
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
    statusSearch: { 
      ...DEFAULT_LANDING_CONTENT.statusSearch, 
      ...(data.content.statusSearch || {}),
      sectionBadge: data.content.statusSearch?.sectionBadge || DEFAULT_LANDING_CONTENT.statusSearch.sectionBadge,
      sectionDesc: data.content.statusSearch?.sectionDesc || DEFAULT_LANDING_CONTENT.statusSearch.sectionDesc,
      bullets: Array.isArray(data.content.statusSearch?.bullets) && data.content.statusSearch.bullets.length > 0
        ? data.content.statusSearch.bullets
        : DEFAULT_LANDING_CONTENT.statusSearch.bullets
    },
    projects: { 
      ...DEFAULT_LANDING_CONTENT.projects, 
      ...(data.content.projects || {}),
      badgeText: data.content.projects?.badgeText || DEFAULT_LANDING_CONTENT.projects.badgeText,
      subtitle: data.content.projects?.subtitle || DEFAULT_LANDING_CONTENT.projects.subtitle,
      items: Array.isArray(data.content.projects?.items) && data.content.projects.items.length > 0
        ? data.content.projects.items
        : DEFAULT_LANDING_CONTENT.projects.items
    },
    about: { 
      ...DEFAULT_LANDING_CONTENT.about, 
      ...(data.content.about || {}),
      badgeText: data.content.about?.badgeText || DEFAULT_LANDING_CONTENT.about.badgeText,
      images: data.content.about?.images && data.content.about.images.length > 0 
        ? data.content.about.images 
        : (data.content.about?.image ? [data.content.about.image] : DEFAULT_LANDING_CONTENT.about.images)
    },
    footer: { 
      ...DEFAULT_LANDING_CONTENT.footer, 
      ...(data.content.footer || {}),
      subtitle: data.content.footer?.subtitle || DEFAULT_LANDING_CONTENT.footer.subtitle,
      accreditationNote: data.content.footer?.accreditationNote || DEFAULT_LANDING_CONTENT.footer.accreditationNote,
      links: Array.isArray(data.content.footer?.links) ? data.content.footer.links : DEFAULT_LANDING_CONTENT.footer.links,
      socialLinks: Array.isArray(data.content.footer?.socialLinks) ? data.content.footer.socialLinks : DEFAULT_LANDING_CONTENT.footer.socialLinks
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
  };

  return { ...data, content: mergedContent };
}

export async function updateLandingConfig(content: LandingContent): Promise<LandingConfig | null> {
  const { data, error } = await supabase
    .from('landing_config')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single();

  if (error) {
    console.error("Error updating landing config:", error);
    return null;
  }
  return data;
}
