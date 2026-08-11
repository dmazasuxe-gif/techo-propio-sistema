-- 8. Tabla de Configuración de Landing Page
CREATE TABLE landing_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  titulo_principal TEXT NOT NULL DEFAULT 'Construyendo el Futuro con Precisión',
  subtitulo TEXT NOT NULL DEFAULT 'Calidad inquebrantable e integridad estructural para proyectos residenciales, comerciales y de infraestructura a gran escala. Diseñamos la permanencia.',
  telefono_contacto TEXT NOT NULL DEFAULT '+51999999999',
  imagenes_fondo JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Asegurarnos de que solo exista una fila (id = 1)
ALTER TABLE landing_config ADD CONSTRAINT single_row_check CHECK (id = 1);

-- Insertar la fila inicial por defecto
INSERT INTO landing_config (id, titulo_principal, subtitulo, telefono_contacto, imagenes_fondo)
VALUES (
  1, 
  'Construyendo el Futuro con Precisión', 
  'Calidad inquebrantable e integridad estructural para proyectos residenciales, comerciales y de infraestructura a gran escala. Diseñamos la permanencia.', 
  '+51999999999', 
  '["https://images.unsplash.com/photo-1541888081622-15cb343d3b40?q=80&w=2070&auto=format&fit=crop"]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS (Desarrollo)
ALTER TABLE landing_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a anon (Desarrollo) - Landing Config" ON landing_config FOR ALL USING (true);
