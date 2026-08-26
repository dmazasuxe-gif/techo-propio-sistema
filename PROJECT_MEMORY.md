# Estado del Proyecto y Memoria (Actualizado: Agosto 2026)

## Resumen de la Última Sesión (Agosto 2026 - Extensión Escritorio en Excel)
Iniciamos la **Primera Etapa** de la creación de una extensión de escritorio para el sistema utilizando Microsoft Excel con Macros (.xlsm). El objetivo es registrar, editar y administrar beneficiarios, predios, ubicaciones y cargas familiares offline. La arquitectura de tablas en Excel es idéntica a Supabase (`BD_BENEFICIARIOS`, `BD_CARGA_FAMILIAR`, etc.) para una futura integración.

**Lo que construimos:**
1. **Archivo Base (`Techo_Propio_Base.xlsx`)**: Creado vía un script de Node.js (`scripts/build_excel.mjs`) que incluye el dashboard (INICIO) y las bases de datos maestras con sus respectivos `ListObjects`.
2. **Módulos VBA**: El código fue generado modularmente y guardado en `techo_propio_excel/vba_src/` (`modInicio.bas`, `modBeneficiarios.bas`, `modUbicaciones.bas`, `modExportacion.bas`, `modBaseDatos.bas` y el código del formulario `frmBeneficiario_Code.bas`).
3. **Acuerdo de Fase 1**: Todo el Excel está diseñado de manera robusta pero offline. **Aún NO hay conexión API con el sistema web ni base de datos remota**; esto queda estrictamente para la Etapa 2, una vez validada la herramienta de Excel.

## Sesión Anterior (Agosto 2026 - Seguridad y Documentación)
Durante la última sesión nos enfocamos en endurecer la seguridad de la aplicación y documentar la arquitectura de datos:
1. **Rate Limiting:** Implementado a través de `proxy.ts` (previamente `middleware.ts`, adaptado para Next.js 16.2.6) para interceptar rutas `/api/*`. Limita a 60 peticiones por IP por minuto en memoria para evitar ataques y abusos.
2. **Seguridad de Llaves (Secretos):** Eliminación de tokens estáticos/harcodeados (ej. `DNI_API_TOKEN`) del código fuente. Se migraron a `.env.local` con validaciones de existencia en las rutas para evitar exposición.
3. **Documentación del Sistema:** Se redactó un manual exhaustivo (`documentacion_sistema.md`) sobre qué datos guarda el sistema para Beneficiarios, Maestros, Archivos de Supabase Storage (`documentos_beneficiarios` y `pdfs_generados`) y control contable.

### Funcionalidades Añadidas Anteriormente
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