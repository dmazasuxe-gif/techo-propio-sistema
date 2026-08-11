import { supabase } from './supabase';

export interface LandingConfig {
  id: number;
  titulo_principal: string;
  subtitulo: string;
  telefono_contacto: string;
  imagenes_fondo: string[];
  updated_at: string;
}

export async function getLandingConfig(): Promise<LandingConfig | null> {
  const { data, error } = await supabase
    .from('landing_config')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    console.error("Error fetching landing config:", error);
    // Return a default config if it fails (e.g. table not created yet)
    return {
      id: 1,
      titulo_principal: 'Construyendo el Futuro con Precisión',
      subtitulo: 'Calidad inquebrantable e integridad estructural para proyectos residenciales, comerciales y de infraestructura a gran escala. Diseñamos la permanencia.',
      telefono_contacto: '+51999999999',
      imagenes_fondo: ['https://images.unsplash.com/photo-1541888081622-15cb343d3b40?q=80&w=2070&auto=format&fit=crop'],
      updated_at: new Date().toISOString()
    };
  }
  return data;
}

export async function updateLandingConfig(config: Partial<LandingConfig>): Promise<LandingConfig | null> {
  const { data, error } = await supabase
    .from('landing_config')
    .update({ ...config, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single();

  if (error) {
    console.error("Error updating landing config:", error);
    return null;
  }
  return data;
}
