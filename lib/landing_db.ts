import { supabase } from './supabase';

export interface LandingContent {
  nav: {
    logoImage: string;
    logoText: string;
    links: { label: string; href: string }[];
    ctaText: string;
  };
  hero: {
    badgeText: string;
    titleHtml: string;
    subtitle: string;
    ctaText: string;
    phone: string;
    images: string[];
    bgOpacity?: number;
  };
  services: {
    title: string;
    subtitle: string;
    items: { iconType: string; title: string; desc: string; images: string[] }[];
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
  };
  announcement: {
    enabled: boolean;
    images: string[];
    backdropOpacity: number;
  };
  statusSearch: {
    enabled: boolean;
    title: string;
    subtitle: string;
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
      { label: "El Estándar", href: "#estandar" }
    ],
    ctaText: "Cotizar Proyecto"
  },
  hero: {
    badgeText: "Ingeniería de Precisión",
    titleHtml: "Construyendo el \nFuturo con Precisión",
    subtitle: "Calidad inquebrantable e integridad estructural para proyectos residenciales, comerciales y de infraestructura a gran escala. Diseñamos la permanencia.",
    ctaText: "Inicia tu Proyecto",
    phone: "+51999999999",
    images: [
      "https://images.unsplash.com/photo-1541888081622-15cb343d3b40?q=80&w=2070&auto=format&fit=crop"
    ],
    bgOpacity: 30
  },
  services: {
    title: "Nuestra Experiencia",
    subtitle: "Ingeniería de precisión aplicada en diversos sectores de la construcción.",
    items: [
      { iconType: "Ruler", title: "Residencial Premium", desc: "Proyectos residenciales a medida de alta gama diseñados para la longevidad y solidez estructural.", images: [] },
      { iconType: "Building2", title: "Infraestructura Comercial", desc: "Construcciones escalables entregadas con planificación meticulosa y estricto cumplimiento técnico.", images: [] },
      { iconType: "Hammer", title: "Renovación Estructural", desc: "Mejoras y transformaciones modernizadas de espacios existentes, priorizando seguridad.", images: [] }
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
    copyright: "Constructora Maza Quiroz. Todos los derechos reservados."
  },
  announcement: {
    enabled: false,
    images: [],
    backdropOpacity: 80
  },
  statusSearch: {
    enabled: true,
    title: "ESTADO DE POSTULACIÓN",
    subtitle: "Para obtener una búsqueda más detallada indica las características de tu interés:"
  }
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
  // (In case the database JSON lacks some newly added fields)
  const mergedContent = { ...DEFAULT_LANDING_CONTENT, ...data.content };
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
