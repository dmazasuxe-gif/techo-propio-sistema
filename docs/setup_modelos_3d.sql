-- ==========================================
-- 1. CREAR TABLA: modelos_vivienda
-- ==========================================
CREATE TABLE public.modelos_vivienda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    dimensiones TEXT,
    area_m2 NUMERIC,
    tipo_techo TEXT,
    modelo_3d_url TEXT,
    imagen_url TEXT,
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.modelos_vivienda ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública
CREATE POLICY "Modelos visibles para todos" ON public.modelos_vivienda
    FOR SELECT USING (true);

-- Política de modificación para administradores (asumiendo autenticación por supabase auth)
CREATE POLICY "Solo autenticados pueden modificar modelos" ON public.modelos_vivienda
    FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- 2. CREAR BUCKETS EN STORAGE
-- ==========================================
-- Ojo: Puedes ejecutar esto desde la interfaz visual de Supabase Storage.
-- Crear un bucket público llamado: "modelos-3d"

-- Opcionalmente por SQL (si usas extensión storage):
INSERT INTO storage.buckets (id, name, public) VALUES ('modelos-3d', 'modelos-3d', true) ON CONFLICT DO NOTHING;

-- Políticas del bucket (Lectura pública, escritura autenticada)
CREATE POLICY "Lectura pública de modelos" ON storage.objects
    FOR SELECT USING (bucket_id = 'modelos-3d');

CREATE POLICY "Escritura autenticada de modelos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'modelos-3d' AND auth.role() = 'authenticated');
    
CREATE POLICY "Actualización autenticada de modelos" ON storage.objects
    FOR UPDATE USING (bucket_id = 'modelos-3d' AND auth.role() = 'authenticated');

CREATE POLICY "Eliminación autenticada de modelos" ON storage.objects
    FOR DELETE USING (bucket_id = 'modelos-3d' AND auth.role() = 'authenticated');
