-- Script para actualizar la configuración de la Landing a V2 (Visual Builder)
-- Elimina la tabla anterior y crea la nueva basada enteramente en un campo JSONB.

DROP TABLE IF EXISTS landing_config;

CREATE TABLE landing_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE landing_config ADD CONSTRAINT single_row_check CHECK (id = 1);

-- Inserción de la configuración inicial por defecto
INSERT INTO landing_config (id, content)
VALUES (
  1, 
  '{
    "nav": {
      "logoText": "MAZA QUIROZ",
      "links": [
        { "label": "Servicios", "href": "#servicios" },
        { "label": "Proyectos", "href": "#proyectos" },
        { "label": "El Estándar", "href": "#estandar" }
      ],
      "ctaText": "Cotizar Proyecto"
    },
    "hero": {
      "badgeText": "Ingeniería de Precisión",
      "titleHtml": "Construyendo el \nFuturo con Precisión",
      "subtitle": "Calidad inquebrantable e integridad estructural para proyectos residenciales, comerciales y de infraestructura a gran escala. Diseñamos la permanencia.",
      "ctaText": "Inicia tu Proyecto",
      "phone": "+51999999999",
      "images": [
        "https://images.unsplash.com/photo-1541888081622-15cb343d3b40?q=80&w=2070&auto=format&fit=crop"
      ]
    },
    "services": {
      "title": "Nuestra Experiencia",
      "subtitle": "Ingeniería de precisión aplicada en diversos sectores de la construcción.",
      "items": [
        {
          "iconType": "Ruler",
          "title": "Residencial Premium",
          "desc": "Proyectos residenciales a medida de alta gama diseñados para la longevidad y solidez estructural."
        },
        {
          "iconType": "Building2",
          "title": "Infraestructura Comercial",
          "desc": "Construcciones escalables entregadas con planificación meticulosa y estricto cumplimiento técnico."
        },
        {
          "iconType": "Hammer",
          "title": "Renovación Estructural",
          "desc": "Mejoras y transformaciones modernizadas de espacios existentes, priorizando seguridad."
        }
      ]
    },
    "standard": {
      "titleHtml": "El Estándar \nMaza Quiroz",
      "subtitle": "No solo construimos; diseñamos estabilidad. Nuestro compromiso con protocolos rígidos asegura que cada proyecto resista la prueba del tiempo.",
      "image": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop",
      "items": [
        {
          "iconType": "Award",
          "title": "Experiencia Inigualable",
          "desc": "Décadas de experiencia colectiva en ingeniería aplicada a cada plano."
        },
        {
          "iconType": "ShieldCheck",
          "title": "Materiales de Calidad",
          "desc": "Obteniendo solo materiales de primera calidad, estructuralmente verificados."
        },
        {
          "iconType": "Clock",
          "title": "Entrega Puntual",
          "desc": "Líneas de tiempo rígidas que garantizan finalización sin compromisos."
        }
      ]
    },
    "footer": {
      "companyName": "MAZA QUIROZ",
      "description": "Ingeniería de Precisión & Arquitectura Moderna. Elevando los estándares de construcción en cada proyecto.",
      "copyright": "Constructora Maza Quiroz. Todos los derechos reservados."
    }
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

ALTER TABLE landing_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a anon (Desarrollo) - Landing Config" ON landing_config FOR ALL USING (true);
