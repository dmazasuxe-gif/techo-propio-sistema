-- Ejecutar este script en el SQL Editor de Supabase para agregar restricciones UNIQUE

ALTER TABLE beneficiarios
ADD CONSTRAINT beneficiarios_dni_postulante_key UNIQUE (dni_postulante);

ALTER TABLE maestros
ADD CONSTRAINT maestros_dni_key UNIQUE (dni);
