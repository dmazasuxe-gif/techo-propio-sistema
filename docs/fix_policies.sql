-- ==========================================
-- CORRECCIÓN DE POLÍTICAS DE SEGURIDAD (RLS)
-- ==========================================
-- El sistema actual de la página web no utiliza el sistema de usuarios nativo de Supabase (Supabase Auth), 
-- sino que utiliza un acceso mediante credenciales propias almacenadas en la sesión. 
-- Por lo tanto, para la base de datos de Supabase, las acciones del administrador se identifican como rol "anon".
-- Este script corrige las políticas para permitir la subida de archivos y gestión de modelos.

-- 1. Arreglar políticas de la tabla modelos_vivienda
DROP POLICY IF EXISTS "Solo autenticados pueden modificar modelos" ON public.modelos_vivienda;

CREATE POLICY "Permitir gestion de modelos a rol anon y authenticated" 
    ON public.modelos_vivienda
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 2. Arreglar políticas del Storage (modelos-3d)
DROP POLICY IF EXISTS "Escritura autenticada de modelos" ON storage.objects;
DROP POLICY IF EXISTS "Actualización autenticada de modelos" ON storage.objects;
DROP POLICY IF EXISTS "Eliminación autenticada de modelos" ON storage.objects;

CREATE POLICY "Permitir subida de modelos (anon/auth)" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'modelos-3d');
    
CREATE POLICY "Permitir actualización de modelos (anon/auth)" 
    ON storage.objects FOR UPDATE 
    USING (bucket_id = 'modelos-3d');

CREATE POLICY "Permitir eliminación de modelos (anon/auth)" 
    ON storage.objects FOR DELETE 
    USING (bucket_id = 'modelos-3d');
