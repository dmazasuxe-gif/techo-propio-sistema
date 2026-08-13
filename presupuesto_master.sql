-- Tabla para guardar los insumos y partidas maestras del presupuesto global
CREATE TABLE IF NOT EXISTS presupuesto_master (
  id TEXT PRIMARY KEY DEFAULT '1',
  insumos JSONB DEFAULT '[]'::jsonb,
  partidas JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insertar el registro por defecto (vacío tal como lo solicitó el usuario)
INSERT INTO presupuesto_master (id, insumos, partidas) 
VALUES ('1', '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;
