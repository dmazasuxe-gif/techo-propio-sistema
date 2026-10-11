# Estado del Proyecto y Memoria (Actualizado: Octubre 2026)

## Actualización Reciente (Octubre 2026 - Eliminación de Telegram Bot y Optimización Nativa iOS/Móvil)
1. **Eliminación Definitiva de Telegram Bot:** Se removieron de forma completa todas las funciones, webhooks (`/api/telegram`), librerías (`node-telegram-bot-api`), utilidades (`telegram-sender.ts`), scripts (`scripts/telegram-bot.js`), herramientas de IA de Telegram (`ai-tools.ts`, `nlu-engine.ts`) y pruebas asociadas, aislando el sistema de cualquier dependencia o riesgo futuro.
2. **Chatbot Web Inteligente Preservado:** El asistente virtual del Landing Page (con video Chroma Key a 60 fps en canvas acelerado y LLM seguro en `/api/landing-bot`) se mantiene 100% operativo y autónomo.
3. **Experiencia Móvil y Tablet Nativa iOS:** Se eliminó la barra inferior fija sobrecargada y se implementó una interfaz nativa de iPhone/iPadOS con barra superior de vidrio esmerilado (`backdrop-blur-2xl`), cajón lateral flotante con microinteracciones hápticas, y listas de tarjetas adaptativas de alta densidad.
4. **Icono Web y PWA Nativo de iPhone (Apple Touch Icon):** Se generaron todos los assets de iconos (`apple-touch-icon.png`, `apple-touch-icon-precomposed.png`, `icon-192.png`, `icon-512.png`) con márgenes seguros para el squircle de iOS, y se configuró `manifest.json` y `layout.tsx` en modo `standalone` con `viewport-fit=cover`.
5. **Limpieza de Cabecera en `/sistema`:** Se eliminó el botón `+` en la cabecera que causaba redirecciones accidentales a la Ficha de Registro.
6. **Módulo Contable Inteligente con IA (`/api/documentos-contables/procesar`):**
   - Lector robusto de facturas en PDF (con extractor nativo en memoria de streams zlib) y fotos (JPG/PNG/WebP) usando OpenAI Visión (`gpt-4o-mini`).
   - Extracción de RUC de 11 dígitos, emisor/proveedor vendedor, fecha, monto decimal, y desglose íntegro de productos/cantidades adquiridas en `concepto`.
   - Almacenamiento permanente en Supabase Storage (`documentos_beneficiarios/facturas/...`).
   - Diagnóstico de facturas de Telegram antiguas: Se identificó que Telegram purgaba sus links temporales con 404; el sistema ahora detecta esos enlaces y ofrece el botón "Adjuntar Archivo" para re-subirlos a Supabase Storage permanente.
7. **Control de Plazos al Contador (25 Días) y Alertas al Celular:**
   - Cada factura calcula automáticamente su fecha límite de entrega al contador (fecha de emisión + 25 días).
   - Semáforo de estados: Al día (verde), Por vencer en ≤ 5 días (amarillo), Vence hoy / Vencido (rojo parpadeante) y Entregado (púrpura).
   - Botón directo para marcar entregado (`PATCH /api/documentos-contables`), compartir al contador por WhatsApp en 1 clic, y botón de notificaciones push web para el celular (`Notification.requestPermission()`).
8. **Rediseño Visual de Alta Gama de la Landing Page (Stitch "Structural Integrity"):**
   - Estética arquitectónica de máxima autoridad con paleta Deep Slate Navy (`#162839`), Terracota (`#e67e22`) y Warm Stone (`#fcf9f6`), con bordes técnicos `.arch-border` y tipografía Montserrat + Work Sans.
   - Cinta superior institucional con acreditación Fondo MIVIVIENDA / Techo Propio.
   - Portada Hero con titulares de gran impacto, llamados a la acción duales (DNI y WhatsApp) y Bento Grid de métricas clave (15+ Años, 500+ Viviendas, S/ 0 Cuota Inicial, 100% Antisísmico).
   - Portal oficial de Consulta DNI en tiempo real con validación y modal detallado de avance.
   - Sección de 2 columnas "El Estándar Maza Quiroz" con pilares de supervisión colegiada CIP/CAP, materiales certificados y fotografía técnica de planos.
   - Cronograma visual "Paso a Paso" de 4 fases para postular al subsidio Techo Propio.
9. **100% de Control y Edición en el Administrador (Visual Builder V4 PRO - `LandingCMS.tsx`):**
   - Control absoluto sobre la visibilidad de todas las secciones mediante el panel "Secciones Visibles" (Activar/Desactivar: Barra Superior, Portada Hero, Consulta DNI, Servicios, El Estándar, Modelos 3D, Proceso Paso a Paso, Obras Entregadas, Sobre Nosotros, Popup Comunicado y Bot Asistente).
   - Edición WYSIWYG de textos, fuentes (Montserrat, Work Sans, Outfit, Inter, etc.), colores predeterminados y HEX personalizado en cada elemento.
   - Gestión dinámica de tarjetas: agregar, reordenar y eliminar tarjetas de estadísticas Bento, servicios, pilares del Estándar, pasos del cronograma, y proyectos con carruseles de fotos.
   - Sincronización inmutable mediante `lib/landing_db.ts` y persistencia en Supabase.

## Resumen de la Sesión Previa (Agosto 2026 - Extensión Escritorio en Excel)
Iniciamos la **Primera Etapa** de la creación de una extensión de escritorio para el sistema utilizando Microsoft Excel con Macros (.xlsm). El objetivo es registrar, editar y administrar beneficiarios, predios, ubicaciones y cargas familiares offline. La arquitectura de tablas en Excel es idéntica a Supabase (`BD_BENEFICIARIOS`, `BD_CARGA_FAMILIAR`, etc.) para una futura integración.

**Lo que construimos:**
1. **Archivo Base (`Techo_Propio_Base.xlsx`)**: Creado vía un script de Node.js (`scripts/build_excel.mjs`) que incluye el dashboard (INICIO) y las bases de datos maestras con sus respectivos `ListObjects`.
2. **Módulos VBA**: El código fue generado modularmente y guardado en `techo_propio_excel/vba_src/`.
3. **Acuerdo de Fase 1**: Todo el Excel está diseñado de manera robusta pero offline (sin conexión remota aún).

## Sesión Anterior (Seguridad y Documentación)
1. **Rate Limiting:** Implementado a través de `proxy.ts` para interceptar rutas `/api/*` (60 peticiones por IP por minuto en memoria).
2. **Seguridad de Llaves (Secretos):** Eliminación de tokens estáticos/harcodeados del código fuente. Migrados a `.env.local` con validaciones de existencia.
3. **Documentación del Sistema:** Manual exhaustivo sobre Beneficiarios, Maestros, Archivos de Supabase Storage (`documentos_beneficiarios` y `pdfs_generados`) y control contable.

### Funcionalidades del Sistema
1. **Módulo Contable (Facturas y Recibos):**
   - Vista `DocumentosContables.tsx` para listar, ver y eliminar documentos contables con el bucket `documentos_contables` de Supabase.
2. **Módulo de Analíticas y Tráfico Web:**
   - Rastreador nativo (`/api/track-visit`) en la Landing Page que registra visitas y clicks.
3. **Visual Builder (Landing CMS):**
   - Todo el texto, imágenes y modelos 3D son editables en vivo desde el CMS (`LandingCMS.tsx`). Con selector de Google Fonts, colores y configuración del Asistente Virtual.

## Estado Actual de la Infraestructura
- **Frontend:** Next.js 16 (App Router), TailwindCSS, TypeScript.
- **Backend/Storage:** Vercel API Routes, Supabase (PostgreSQL y Storage), Vercel Blob.
- **Servicios Integrados:** Puppeteer (Generación de PDFs de Cronogramas, Presupuestos y Financieras), OpenAI API (Chatbot web de la Landing).
- **Despliegue:** GitHub integrado a Vercel (Producción - Proyecto `techo-propio-sistema`).

## Notas para el Futuro AI
- **Visual Builder:** Trabaja sobre `LandingCMS.tsx` y guarda en `landing_db.ts` utilizando Supabase.
- **Expedientes y PDFs:** Rutas en `/api/presupuesto/pdf`, `/api/obras/cronograma/pdf` y `/api/financieras/pdf` utilizan `pdf-generator.ts`.
- **Aislamiento:** No volver a introducir dependencias de Telegram Bot.