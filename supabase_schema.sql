-- Ejecuta este script en el Editor SQL de Supabase para crear las tablas necesarias

-- 1. Tabla de Beneficiarios
CREATE TABLE beneficiarios (
  id TEXT PRIMARY KEY,
  expediente TEXT,
  estado TEXT,
  postulante TEXT,
  apellido_paterno TEXT,
  apellido_materno TEXT,
  nombres TEXT,
  dni_postulante TEXT,
  fecha_nacimiento TEXT,
  sexo TEXT,
  celular TEXT,
  correo TEXT,
  estado_civil TEXT,
  tiene_conyuge BOOLEAN DEFAULT FALSE,
  conyuge TEXT,
  dni_conyuge TEXT,
  apellido_paterno_conyuge TEXT,
  apellido_materno_conyuge TEXT,
  nombres_conyuge TEXT,
  fecha_nacimiento_conyuge TEXT,
  departamento TEXT,
  provincia TEXT,
  distrito TEXT,
  centro_poblado TEXT,
  barrio_sector TEXT,
  calle TEXT,
  manzana TEXT,
  lote TEXT,
  partida_electronica TEXT,
  coordenada_x TEXT,
  coordenada_y TEXT,
  direccion TEXT,
  codigo_catastral TEXT,
  licencia_construccion TEXT,
  conformidad_obra TEXT,
  programa TEXT,
  etapa_vivienda TEXT,
  avance_vivienda_pct NUMERIC DEFAULT 0,
  fecha_inicio_obra TEXT,
  fecha_fin_obra TEXT,
  maestro_asignado_id TEXT,
  maestro_asignado_nombre TEXT,
  area_total TEXT,
  por_frente TEXT,
  por_derecha TEXT,
  por_izquierda TEXT,
  por_fondo TEXT,
  area_techada TEXT,
  area_construida TEXT,
  notas TEXT,
  documentos JSONB DEFAULT '[]'::jsonb,
  historial JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Tabla de Maestros
CREATE TABLE maestros (
  id TEXT PRIMARY KEY,
  nombre TEXT,
  dni TEXT,
  celular TEXT,
  especialidad TEXT,
  tarifa_vivienda TEXT,
  beneficiario_asignado_id TEXT,
  beneficiario_asignado_nombre TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Tabla de Financieras
CREATE TABLE financieras (
  id TEXT PRIMARY KEY,
  nombre TEXT,
  desembolsos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Tabla Cronograma de Maestros (si deseas mantenerla separada o usar la de maestros)
CREATE TABLE cronograma_maestros (
  id TEXT PRIMARY KEY,
  nombre TEXT,
  dni TEXT,
  celular TEXT,
  especialidad TEXT,
  monto_por_vivienda NUMERIC,
  beneficiarios_asignados JSONB DEFAULT '[]'::jsonb,
  pagos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Tabla Cronograma de Obra (Global)
CREATE TABLE cronograma_obra (
  id TEXT PRIMARY KEY,
  actividad TEXT,
  avance_pct NUMERIC DEFAULT 0,
  inicio_semana INTEGER,
  duracion_semanas INTEGER,
  responsable TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. Tabla de Planos de Ingeniería
CREATE TABLE planos_ingenieria (
  id TEXT PRIMARY KEY,
  title TEXT,
  type TEXT,
  file_name TEXT,
  file_url TEXT,
  file_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Activar RLS (Row Level Security) y crear políticas públicas (Para desarrollo)
-- IMPORTANTE: En producción, estas reglas deben ser más restrictivas.
ALTER TABLE beneficiarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE maestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE financieras ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronograma_maestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronograma_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos_ingenieria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo a anon (Desarrollo) - Beneficiarios" ON beneficiarios FOR ALL USING (true);
CREATE POLICY "Permitir todo a anon (Desarrollo) - Maestros" ON maestros FOR ALL USING (true);
CREATE POLICY "Permitir todo a anon (Desarrollo) - Financieras" ON financieras FOR ALL USING (true);
CREATE POLICY "Permitir todo a anon (Desarrollo) - Cronog. Maestros" ON cronograma_maestros FOR ALL USING (true);
CREATE POLICY "Permitir todo a anon (Desarrollo) - Cronog. Obra" ON cronograma_obra FOR ALL USING (true);
CREATE POLICY "Permitir todo a anon (Desarrollo) - Planos" ON planos_ingenieria FOR ALL USING (true);
