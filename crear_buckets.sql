-- EJECUTAR ESTO EN EL SQL EDITOR DE SUPABASE

-- 1. Crear bucket para Documentos de Beneficiarios (DNI, fotos, etc.)
insert into storage.buckets (id, name, public)
values ('documentos_beneficiarios', 'documentos_beneficiarios', true)
on conflict (id) do nothing;

-- 2. Crear bucket para PDFs Generados (Fichas, presupuestos, cronogramas)
insert into storage.buckets (id, name, public)
values ('pdfs_generados', 'pdfs_generados', true)
on conflict (id) do nothing;

-- 3. Políticas de seguridad (Para que cualquiera pueda ver y subir por ahora, o ajustarlo según tu auth)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id in ('documentos_beneficiarios', 'pdfs_generados') );

create policy "Public Upload"
  on storage.objects for insert
  with check ( bucket_id in ('documentos_beneficiarios', 'pdfs_generados') );

create policy "Public Update"
  on storage.objects for update
  using ( bucket_id in ('documentos_beneficiarios', 'pdfs_generados') );
