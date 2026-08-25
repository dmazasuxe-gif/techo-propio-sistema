-- 1. Asegurar que TODAS las tablas tengan RLS activado
ALTER TABLE beneficiarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE maestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE financieras ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronograma_maestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronograma_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos_ingenieria ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_contables ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE landing_traffic ENABLE ROW LEVEL SECURITY;
ALTER TABLE modelos_vivienda ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas públicas permisivas antiguas
DROP POLICY IF EXISTS "Permitir todo a anon (Desarrollo) - Beneficiarios" ON beneficiarios;
DROP POLICY IF EXISTS "Permitir todo a anon (Desarrollo) - Maestros" ON maestros;
DROP POLICY IF EXISTS "Permitir todo a anon (Desarrollo) - Financieras" ON financieras;
DROP POLICY IF EXISTS "Permitir todo a anon (Desarrollo) - Cronog. Maestros" ON cronograma_maestros;
DROP POLICY IF EXISTS "Permitir todo a anon (Desarrollo) - Cronog. Obra" ON cronograma_obra;
DROP POLICY IF EXISTS "Permitir todo a anon (Desarrollo) - Planos" ON planos_ingenieria;
DROP POLICY IF EXISTS "Permitir todo a anon (Desarrollo) - Usuarios" ON usuarios;
DROP POLICY IF EXISTS "Permitir todo a anon (Desarrollo) - Documentos Contables" ON documentos_contables;
-- DROP POLICY IF EXISTS "Permitir todo a anon (Desarrollo) - Trafico" ON landing_traffic;

-- 3. Crear política de SOLO LECTURA para la tabla de Modelos de Vivienda (necesario para el Landing Page)
DROP POLICY IF EXISTS "Permitir lectura publica de modelos" ON modelos_vivienda;
CREATE POLICY "Permitir lectura publica de modelos" 
ON modelos_vivienda 
FOR SELECT 
USING (true);

-- Nota: No necesitamos crear políticas para el servidor interno (API Routes) 
-- porque ahora usa la 'Service Role Key', la cual ignora el RLS automáticamente.
