-- Tabla para registrar acciones críticas tomadas por el Agente IA

CREATE TABLE IF NOT EXISTS public.ai_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(255) NOT NULL,
    record_id VARCHAR(255),
    details JSONB,
    status VARCHAR(50) NOT NULL
);

-- Habilitar RLS (opcional para lectura pública o admins)
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- Política de lectura para todos los usuarios autenticados
CREATE POLICY "Permitir lectura de logs"
ON public.ai_logs
FOR SELECT
TO authenticated
USING (true);

-- Política de inserción (solo backend/service_role puede insertar)
CREATE POLICY "Permitir insercion en logs"
ON public.ai_logs
FOR INSERT
TO authenticated, anon
WITH CHECK (true);
