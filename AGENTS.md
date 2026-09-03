<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Knowledge & Updates (Techo Propio Sistema)
- **Visor 3D**: La landing page cuenta con un visor interactivo de modelos 3D (`.glb`). Hemos implementado una **barra de progreso de carga** y un **filtro de errores no fatales**. Si el archivo `.glb` (que idealmente debe pesar menos de 10MB) presenta un error menor o advertencia al cargar, el visor lo ignora o muestra un aviso con opción a "Cerrar mensaje", permitiendo que el modelo renderizado en el fondo se vea sin bloqueos.
- **Tarjetas de Modelos**: Las tarjetas que muestran la descripción de la vivienda (`ModeloCard.tsx`) implementan una funcionalidad de **"Leer más"** para expandir los textos largos, en lugar de cortarlos abruptamente, mejorando la usabilidad.
- **Objetivo General**: Mantener la estabilidad de estas implementaciones sin sobreescribir la barra de progreso ni romper el comportamiento asíncrono del visor 3D en futuras actualizaciones.
