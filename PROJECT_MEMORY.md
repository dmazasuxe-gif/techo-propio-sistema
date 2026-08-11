# Estado del Proyecto y Memoria (Actualizado: Agosto 2026)

## Resumen de la Última Sesión
Durante la última sesión se realizaron actualizaciones críticas al Sistema Techo Propio, enfocadas en la experiencia de usuario, generación de reportes y robustez de la integración con IA.

### Cambios Principales Realizados
1. **Rediseño del Login:** Se implementó un diseño moderno, responsivo y adaptativo para celulares, tablets y computadoras.
2. **Generación de PDFs de Financieras:**
   - Se añadió un botón de 'Generar PDF' por cada financiera en el Cronograma de Pagos.
   - Se solucionó el problema de descarga de PDFs, asegurando que el servidor lea las URLs públicas de Supabase mediante 'fetch' en lugar de 'fs.readFileSync'. Esto se aplicó a todas las rutas de PDF (Cronograma, Presupuesto, Financieras).
3. **Carga de Documentos en Registro:**
   - Se corrigió el formulario oficial de registro para que los documentos subidos se envíen inmediatamente a Vercel Blob Storage mediante '/api/upload', guardando URLs permanentes en Supabase en lugar de 'blob:http' temporales.
4. **Teclado Numérico en Inputs Móviles:**
   - Se optimizaron los campos de celular, DNI, fecha de nacimiento, coordenadas y linderos para invocar teclados numéricos ('inputMode="decimal"' y 'type="tel"') en dispositivos móviles.
5. **Lupa de Consulta DNI:**
   - Se corrigió y habilitó el botón de la lupa en Carga Familiar/Cónyuge para que funcione correctamente la consulta a la API de DNI.
6. **Integración con IA (Telegram Bot):**
   - El NLU Engine ('lib/nlu-engine.ts') fue actualizado con el intent 'generar_y_enviar_reporte_financiera'. La IA puede ahora generar PDFs de financieras específicas y enviarlos por Telegram.
7. **Integridad de Base de Datos:**
   - Se verificó que al eliminar un Maestro de Obra, se limpien las referencias de forma más estricta.

## Estado Actual de la Infraestructura
- **Frontend:** Next.js (React), TailwindCSS, TypeScript.
- **Backend/Storage:** Vercel API Routes, Supabase (PostgreSQL para datos y Storage para documentos).
- **Servicios:** Puppeteer (Generación de PDFs), Bot de Telegram integrado.
- **Despliegue:** Vercel (Producción).

## Notas para el Futuro AI
Al abrir este proyecto, lee este archivo para comprender el punto en el que nos quedamos. El sistema se encuentra 100% operativo, estable, y en producción. Respeta siempre los colores corporativos ('sky', 'slate-900') y asegura que toda integración con PDFs use 'fetch' para recursos alojados externamente.