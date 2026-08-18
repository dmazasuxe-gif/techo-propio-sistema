# Estado del Proyecto y Memoria (Actualizado: Agosto 2026)

## Resumen de la Última Sesión
Durante la última sesión se realizaron actualizaciones integrales al sistema, incluyendo la adición del módulo de Contabilidad con lectura de PDFs, un módulo de Analíticas Web propio y mejoras directas en el Visual Builder (Landing CMS). El sistema mantuvo todas sus funcionalidades previas intactas.

### Nuevas Funcionalidades Añadidas
1. **Módulo Contable (Facturas y Recibos):**
   - Se añadió la vista de `DocumentosContables.tsx` para listar, ver y eliminar (CRUD) documentos subidos.
   - Estos archivos se gestionan mediante el bucket `documentos_contables` y la tabla `documentos_contables` en Supabase.
   - El NLU (Telegram AI) ahora extrae texto de archivos PDF localmente utilizando `pdf-parse` (librería añadida a `ai-tools.ts`). La IA procesa y analiza las facturas/recibos en PDF o imágenes sin pedir que el usuario las convierta, y luego puede retornar el archivo como respuesta.

2. **Módulo de Analíticas y Tráfico Web:**
   - Se implementó un rastreador nativo (`/api/track-visit`) en la Landing Page (`page.tsx`) que registra visitas y clicks en botones interactivos (WhatsApp, Consulta DNI, Redes Sociales).
   - Para esto se creó la tabla `landing_traffic` en Supabase.
   - Se creó el panel en tiempo real `AnalyticsView.tsx` accesible desde la barra lateral (debajo de Contabilidad) con gráficos y tablas de las interacciones recientes.

3. **Mejoras en el Visual Builder (Landing CMS):**
   - Se añadió un campo al panel "Config Landing" para editar el mensaje predeterminado de WhatsApp (por defecto: "Hola, quisiera cotizar un proyecto").
   - Ahora, todos los botones hacia WhatsApp en la Landing Page recogen este texto de manera dinámica con `encodeURIComponent`.

4. **Reestructuración de la Interfaz:**
   - En `app/sistema/page.tsx` y `Sidebar.tsx`, el módulo "Contabilidad" fue reubicado para aparecer justo después de "Consulta DNI", seguido del nuevo menú "Tráfico Web".

### Cambios Principales Anteriores en la Landing Page y CMS (Visual Builder)
1. **Edición Visual, Tipografías y Colores:** 
   - Todo el texto es editable en vivo desde el CMS (`LandingCMS.tsx`). Con selector de Google Fonts y colores integrados (`<EditableText />`).
2. **Secciones Dinámicas:** 
   - Las estadísticas de "Nuestra Experiencia" dejaron de estar fijas y ahora se editan visualmente.
   - La sección "Sobre Nosotros" está completamente sincronizada en diseño.
3. **Integración del Chatbot de IA:**
   - Asistente Virtual en la esquina inferior derecha (`chatbot-avatar.png`). Sus parámetros y *prompt* se configuran en el CMS.

### Otras Mejoras Históricas
1. Rediseño del Login adaptativo.
2. Generación de PDFs con Puppeteer para Financieras, Cronogramas y Presupuestos.
3. Carga de Documentos en Registro hacia Vercel Blob Storage.
4. UI Móvil Optimizada con teclados numéricos.
5. NLU Engine para Bot de Telegram integrado en todo el sistema.

## Estado Actual de la Infraestructura
- **Frontend:** Next.js (React), TailwindCSS, TypeScript.
- **Backend/Storage:** Vercel API Routes, Supabase (PostgreSQL y Storage), Vercel Blob.
- **Servicios Integrados:** Puppeteer (Generación de PDFs), Bot de Telegram integrado, OpenAI API (NLU y Chatbot), `pdf-parse` (Extracción de texto).
- **Despliegue:** GitHub integrado a Vercel (Producción - Proyecto `techo-propio-sistema`).

## Notas para el Futuro AI
Al abrir este proyecto, lee este archivo para comprender el punto en el que nos quedamos. El sistema es sumamente robusto y la premisa base **siempre** es NO romper lo que ya funciona.
- **Visual Builder:** Trabaja sobre `LandingCMS.tsx` y guarda en `landing_db.ts` utilizando Supabase. Respeta la estructura de componentes `<EditableText>` y `<EditableImage>`.
- **IA/NLU:** Todo procesamiento en Telegram pasa por `nlu-engine.ts` y las herramientas están en `ai-tools.ts`. La lectura de PDFs ahora es un estándar integrado con `pdf-parse`.
- **Tráfico Web:** Las rutas para trackear son asíncronas y tienen protecciones (ej. `useRef` en useEffects para evitar bucles de React StrictMode).