import { supabase } from './supabase';

export interface BotCharacter {
  id: string;
  name: string;
  url: string;
  type: 'video' | 'image';
  isGreenScreen: boolean;
  active: boolean;
}

export interface LandingContent {
  nav: {
    logoImage: string;
    logoText: string;
    links: { label: string; href: string }[];
    ctaText: string;
  };
  hero: {
    badgeText: string;
    phone: string;
    whatsappMessage?: string;
    images: string[];
    bgOpacity: number;
  };
  services: {
    title: string;
    subtitle: string;
    items: { iconType: string; title: string; desc: string; images: string[]; statNum?: string; statText?: string }[];
  };
  standard: {
    titleHtml: string;
    subtitle: string;
    image: string;
    items: { iconType: string; title: string; desc: string }[];
  };
  footer: {
    logoImage: string;
    companyName: string;
    description: string;
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
    sectionTitle: string;
    title: string;
    subtitle: string;
    placeholder: string;
    buttonText: string;
  };
  projects: {
    title: string;
    items: { images: string[]; title: string }[];
  };
  about: {
    enabled: boolean;
    title: string;
    subtitle: string;
    content: string;
    image: string;
    images?: string[];
  };
  fonts: Record<string, string>;
  colors: Record<string, string>;
  chatbot?: {
    systemPrompt: string;
    companyInfo: string;
    images: { title: string; url: string; category: string }[];
    characters?: BotCharacter[];
    activeCharacterId?: string;
  };
}

export interface LandingConfig {
  id: number;
  content: LandingContent;
  updated_at: string;
}

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  nav: {
    logoImage: "",
    logoText: "MAZA QUIROZ",
    links: [
      { label: "Servicios", href: "#servicios" },
      { label: "Proyectos", href: "#proyectos" },
      { label: "Quienes Somos?", href: "#nosotros" }
    ],
    ctaText: "Cotizar Proyecto"
  },
  hero: {
    badgeText: "Ingeniería de Precisión",
    phone: "+51999999999",
    whatsappMessage: "Hola, quisiera cotizar un proyecto",
    images: [
      "https://images.unsplash.com/photo-1541888081622-15cb343d3b40?q=80&w=2070&auto=format&fit=crop"
    ],
    bgOpacity: 30
  },
  services: {
    title: "Nuestra Experiencia",
    subtitle: "Ingeniería de precisión aplicada en diversos sectores de la construcción.",
    items: [
      { iconType: 'hammer', title: 'Diseño y Planificación', desc: 'Desarrollamos planos arquitectónicos y distribución eficiente del espacio respetando la normativa.', images: [], statNum: '10+', statText: 'Años de Experiencia' },
      { iconType: 'hard-hat', title: 'Construcción Segura', desc: 'Utilizamos materiales certificados y mano de obra calificada para garantizar la durabilidad de tu vivienda.', images: [], statNum: '500+', statText: 'Casas Construidas' },
      { iconType: 'ruler', title: 'Acabados de Primera', desc: 'Entregamos viviendas listas para habitar con acabados estéticos y funcionales que mejoran tu calidad de vida.', images: [], statNum: '98%', statText: 'Clientes Satisfechos' }
    ]
  },
  standard: {
    titleHtml: "El Estándar \nMaza Quiroz",
    subtitle: "No solo construimos; diseñamos estabilidad. Nuestro compromiso con protocolos rígidos asegura que cada proyecto resista la prueba del tiempo.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop",
    items: [
      { iconType: "Award", title: "Experiencia Inigualable", desc: "Décadas de experiencia colectiva en ingeniería aplicada a cada plano." },
      { iconType: "ShieldCheck", title: "Materiales de Calidad", desc: "Obteniendo solo materiales de primera calidad, estructuralmente verificados." },
      { iconType: "Clock", title: "Entrega Puntual", desc: "Líneas de tiempo rígidas que garantizan finalización sin compromisos." }
    ]
  },
  footer: {
    logoImage: "",
    companyName: "MAZA QUIROZ",
    description: "Ingeniería de Precisión & Arquitectura Moderna. Elevando los estándares de construcción en cada proyecto.",
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
  statusSearch: {
    enabled: true,
    sectionTitle: "Consulta tu DNI",
    title: "ESTADO DE POSTULACIÓN",
    subtitle: "Para obtener una búsqueda más detallada indica las características de tu interés:",
    placeholder: "Ingresa DNI",
    buttonText: "Consultar"
  },
  projects: {
    title: "Últimos Proyectos",
    items: [
      { images: [], title: "Último Proyecto" },
      { images: [], title: "Último Proyecto" },
      { images: [], title: "Último Proyecto" }
    ]
  },
  about: {
    enabled: false,
    title: "Sobre Nosotros",
    subtitle: "Construyendo el futuro con bases sólidas",
    content: "Somos una empresa líder en el desarrollo de proyectos inmobiliarios bajo el programa Techo Propio, comprometidos con mejorar la calidad de vida de las familias peruanas mediante la construcción de viviendas dignas, seguras y modernas.",
    image: "https://images.unsplash.com/photo-1541888081622-15cb343d3b40?q=80&w=2070&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1541888081622-15cb343d3b40?q=80&w=2070&auto=format&fit=crop"]
  },
  chatbot: {
    systemPrompt: "Eres el asistente virtual oficial y vendedor estrella de la empresa de construcción. Tu objetivo es ser extremadamente amable, resolver dudas y animarlos a contactarnos para iniciar su proyecto. Responde SIEMPRE de manera breve, clara y conversacional.",
    companyInfo: "Construimos casas bajo el programa Techo Propio. Nuestras casas tienen 2 habitaciones, sala, comedor, cocina y baño.",
    images: [],
    characters: [
      {
        id: "char-1",
        name: "Personaje Principal (Video)",
        url: "/personaje-bot.mp4",
        type: "video",
        isGreenScreen: true,
        active: true
      }
    ],
    activeCharacterId: "char-1"
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
    // Return default config
    return {
      id: 1,
      content: DEFAULT_LANDING_CONTENT,
      updated_at: new Date().toISOString()
    };
  }
  
  // Merge loaded content with default content to ensure missing keys are present
  // Deep-ish merge to ensure nested objects have their defaults if missing keys
  const mergedContent: LandingContent = {
    ...DEFAULT_LANDING_CONTENT,
    ...data.content,
    nav: { ...DEFAULT_LANDING_CONTENT.nav, ...(data.content.nav || {}) },
    hero: { 
      ...DEFAULT_LANDING_CONTENT.hero, 
      ...(data.content.hero || {}),
      whatsappMessage: data.content.hero?.whatsappMessage || DEFAULT_LANDING_CONTENT.hero.whatsappMessage
    },
    services: { ...DEFAULT_LANDING_CONTENT.services, ...(data.content.services || {}) },
    statusSearch: { ...DEFAULT_LANDING_CONTENT.statusSearch, ...(data.content.statusSearch || {}) },
    projects: { ...DEFAULT_LANDING_CONTENT.projects, ...(data.content.projects || {}) },
    about: { 
      ...DEFAULT_LANDING_CONTENT.about, 
      ...(data.content.about || {}),
      images: data.content.about?.images && data.content.about.images.length > 0 
        ? data.content.about.images 
        : (data.content.about?.image ? [data.content.about.image] : DEFAULT_LANDING_CONTENT.about.images)
    },
    footer: { ...DEFAULT_LANDING_CONTENT.footer, ...(data.content.footer || {}) },
    chatbot: {
      systemPrompt: data.content.chatbot?.systemPrompt || DEFAULT_LANDING_CONTENT.chatbot!.systemPrompt,
      companyInfo: data.content.chatbot?.companyInfo || DEFAULT_LANDING_CONTENT.chatbot!.companyInfo,
      images: data.content.chatbot?.images || DEFAULT_LANDING_CONTENT.chatbot!.images,
      characters: (data.content.chatbot?.characters && data.content.chatbot.characters.length > 0)
        ? data.content.chatbot.characters
        : DEFAULT_LANDING_CONTENT.chatbot!.characters,
      activeCharacterId: data.content.chatbot?.activeCharacterId || DEFAULT_LANDING_CONTENT.chatbot!.activeCharacterId,
    },
  };

  // Data migrations for legacy objects
  if (!Array.isArray(mergedContent.footer.socialLinks)) {
    mergedContent.footer.socialLinks = DEFAULT_LANDING_CONTENT.footer.socialLinks;
  }
  if (!Array.isArray(mergedContent.projects.items)) {
    mergedContent.projects.items = DEFAULT_LANDING_CONTENT.projects.items;
  }
  if (!Array.isArray(mergedContent.footer.links)) {
    mergedContent.footer.links = DEFAULT_LANDING_CONTENT.footer.links;
  }
  
  // Data migration for Nosotros link
  if (mergedContent.nav && Array.isArray(mergedContent.nav.links)) {
    mergedContent.nav.links = mergedContent.nav.links.map(link => 
      link.href === '#estandar' ? { ...link, href: '#nosotros' } : link
    );
  }

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
