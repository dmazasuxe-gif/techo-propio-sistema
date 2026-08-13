# Estado del Proyecto y Memoria (Actualizado: Agosto 2026)

## Resumen de la Última Sesión
Durante la última sesión se realizaron actualizaciones masivas al **Visual Builder (Landing CMS)** del Sistema Techo Propio, enfocadas en darle control absoluto al usuario sobre el diseño y contenido de su página web pública, además de integrar un Chatbot de Inteligencia Artificial para atención al cliente.

### Cambios Principales Realizados en la Landing Page y CMS (Visual Builder)
1. **Edición Visual y Tipografías:**
   - Todo el texto de la Landing Page ahora es editable en vivo desde el CMS (`LandingCMS.tsx`).
   - Se integró un **Selector de Tipografías** con más de 10 opciones de Google Fonts (Montserrat, Inter, Roboto, Lato, Poppins, etc.) disponible para cada elemento de texto.
2. **Selector de Colores Global:**
   - Se añadió un **Selector de Colores dinámico** (con 14 opciones base) integrado en el componente `<EditableText />`.
   - El usuario puede cambiar el color individual de cada título, descripción, número estadístico o texto del pie de página.
3. **Sección "Nuestra Experiencia" (Estadísticas Dinámicas):**
   - Los números como "10+" o "500+" y sus descripciones dejaron de estar *hardcodeados*. 
   - Ahora se guardan en `config.services.items` como `statNum` y `statText` y pueden editarse y colorearse desde el Visual Builder.
4. **Sección "Sobre Nosotros" Sincronizada:**
   - Se corrigieron los problemas de renderizado para que el Título, Subtítulo y Contenido de "Sobre Nosotros" reflejen los cambios en tiempo real y apliquen correctamente sus tipografías y colores.
5. **Integración del Chatbot de IA:**
   - Se añadió un Asistente Virtual en la Landing Page (esquina inferior derecha) con el avatar 3D proporcionado por el usuario (`chatbot-avatar.png`).
   - Se agregó una sección exclusiva para la configuración de la IA (`chatbot.systemPrompt` y `chatbot.companyInfo`) en el CMS.
   - El Chatbot extrae la información de la empresa automáticamente de la base de datos (teléfono, servicios, información general) y asiste a los usuarios sin capacidad de alterar el sistema central.

### Otras Mejoras Anteriores
1. **Rediseño del Login:** Adaptativo para celulares, tablets y computadoras.
2. **Generación de PDFs:** Solución a problemas de URL de Supabase para descargar PDFs de Financieras, Cronogramas y Presupuestos.
3. **Carga de Documentos en Registro:** Subida directa a Vercel Blob Storage mediante `/api/upload`.
4. **UI Móvil Optimizada:** Teclado numérico activado automáticamente (`type="tel"`, `inputMode="decimal"`) en campos pertinentes.
5. **Integración con Telegram Bot:** NLU Engine para generación de reportes y envíos mediante IA.

## Estado Actual de la Infraestructura
- **Frontend:** Next.js (React), TailwindCSS, TypeScript.
- **Backend/Storage:** Vercel API Routes, Supabase (PostgreSQL y Storage), Vercel Blob.
- **Servicios:** Puppeteer (Generación de PDFs), Bot de Telegram integrado, OpenAI API (Chatbot Landing).
- **Despliegue:** Vercel (Producción - Proyecto `techo-propio-sistema`).

## Notas para el Futuro AI
Al abrir este proyecto, lee este archivo para comprender el punto en el que nos quedamos. El sistema se encuentra 100% operativo y el usuario cuenta con un Visual Builder poderoso que permite editar textos, imágenes, tipografías y colores de su web pública sin tocar código. Los datos de la web se leen/escriben en `landing_db.ts` utilizando Supabase. Si actualizas la Landing, asegúrate de mantener la estructura de componentes `<EditableText>` sincronizados. Todo despliegue de Vercel debe realizarse utilizando `npx vercel --prod --yes`.