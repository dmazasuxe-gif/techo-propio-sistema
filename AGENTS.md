<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Knowledge & Updates (Techo Propio Sistema)
- **Visor 3D**: La landing page cuenta con un visor interactivo de modelos 3D (`.glb`). Hemos implementado una **barra de progreso de carga** y un **filtro de errores no fatales**. Si el archivo `.glb` (que idealmente debe pesar menos de 10MB) presenta un error menor o advertencia al cargar, el visor lo ignora o muestra un aviso con opción a "Cerrar mensaje", permitiendo que el modelo renderizado en el fondo se vea sin bloqueos.
- **Tarjetas de Modelos**: Las tarjetas que muestran la descripción de la vivienda (`ModeloCard.tsx`) implementan una funcionalidad de **"Leer más"** para expandir los textos largos, en lugar de cortarlos abruptamente, mejorando la usabilidad.
- **Personaje Bot con Video y Chroma Key en Vivo (`ChromaVideoAvatar.tsx` y `LandingChatbot.tsx`)**:
  - **Ubicación**: Anclado firmemente a la esquina inferior derecha (`bottom-2 right-1 sm:bottom-4 sm:right-3`) para no obstaculizar la información de la landing page.
  - **Procesador Chroma Key a 60fps**: Remueve el fondo verde en tiempo real mediante un `<canvas>` acelerado por hardware con despill (eliminación de halos verdes en piel/ropa) y proyecta una sombra de suelo dinámica debajo de los pies.
  - **Estabilidad de Aspecto y Sin Saltos**: El canvas se inicializa con dimensiones fijas (`width={475} height={690}` con `aspectRatio: "475 / 690"`). Esto previene desplazamientos iniciales de derecha a izquierda en la carga.
  - **Recorte Exacto y Margen de Mano**: El video `public/personaje-bot.mp4` tiene resolución panorámica (1280x720) con el personaje abarcando `X: 244 a 660`. Se encuadra con `sx = 210` y `sw = 475` para que la mano al saludar (en `X: 244`) nunca se corte.
  - **Bucle Continuo sin Desplazamiento**: En el video original, los primeros 0.48s tenían al personaje desfasado 80px a la derecha (`X: 612` vs `X: 532` del resto del video). Se implementó un bucle fluido de `0.55s` a `duration - 0.08s` junto con compensación de offset (`sx = 290` para `t < 0.48s`), asegurando que el personaje permanezca 100% estático en el píxel 322 en cualquier fotograma.
  - **Ventana de Chat**: El título principal de la ventana desplegable del chat es **`ASISTENTE VIRTUAL`** con estado *"En línea"*.
- **Visual Builder CMS (`LandingCMS.tsx` & `lib/landing_db.ts`)**:
  - Subpanel de **"Personajes y Avatar del Bot (Cuerpo Completo)"** en `/sistema` -> Landing Page -> Chatbot Inteligente.
  - Permite activar personajes, alternar "Fondo Verde", subir videos/fotos a Supabase (`/api/upload`) y eliminar personajes.
  - **Bocadillo Flotante Editable con Emojis**: Cada personaje cuenta con el campo `"Texto del Bocadillo (Globito)"` y una barra de emojis rápidos (`👋 🏠 💬 👷 🏗️ ✨ 🇵🇪 📞 💡`), sincronizado en tiempo real con la landing page.
- **Requisitos para Nuevos Videos del Bot**:
  - Formato: `.mp4` (H.264) con pantalla verde uniforme bien iluminada.
  - Peso recomendado: 1 a 5 MB para optimizar el consumo de datos y velocidad en smartphones.
  - En el panel `/sistema`, mantener marcada la casilla "Tiene pantalla verde".
- **Objetivo General**: Mantener la estabilidad de estas implementaciones sin sobreescribir la barra de progreso del visor 3D, el anclaje lateral del bot, ni las fórmulas de compensación de coordenadas en futuras actualizaciones.
