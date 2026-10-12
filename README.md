# Sistema Techo Propio - Constructora Maza Quiroz S.A.C.

Plataforma web integral de gestión operativa, portal público, visor 3D de viviendas, bot con video Chroma Key en vivo y administración técnica para el programa social **Techo Propio** (Construcción en Sitio Propio) del Fondo MIVIVIENDA / Ministerio de Vivienda del Perú.

🌐 **Portal Oficial en Producción:** [https://www.mazaquiroz.com](https://www.mazaquiroz.com)

---

## 📖 Documentación Completa del Sistema

Toda la documentación técnica, manual de arquitectura, esquemas de base de datos, APIs, módulos de IA y configuración de la aplicación se encuentra detallada en el documento maestro:

👉 **[DOCUMENTACION_SISTEMA_MAZA_QUIROZ.md](DOCUMENTACION_SISTEMA_MAZA_QUIROZ.md)**

### Contenido Destacado del Documento:
1. **Ficha Técnica y Resumen Ejecutivo:** Stack con Next.js 16, React 19, TypeScript, Supabase y OpenAI.
2. **Landing Page Oficial (`app/page.tsx`):** Diseño "Structural Integrity" ultra-responsive con 0px de desbordamiento horizontal en todo tipo de celular.
3. **Visor 3D Interactivo (`app/components/3d`):** Modelos `.glb` con barra de progreso de carga y techo interactivo desmontable.
4. **Asistente Virtual Bot:** Motor Chroma Key en tiempo real a 60 FPS con canvas acelerado por hardware y cerebro LLM con OpenAI.
5. **Consulta de Expedientes por DNI:** Portal público de seguimiento del avance del subsidio Techo Propio.
6. **Visual Builder CMS (`LandingCMS.tsx`):** Control del 100% de la landing page desde el panel de administración.
7. **Panel de Administración (`/sistema`):** Interfaz nativa iOS/iPadOS con drawer deslizable, expedientes, cronogramas y presupuestos.
8. **Contabilidad Inteligente con IA (`DocumentosContables.tsx`):** Lector de facturas PDF (stream parser nativo zlib) y fotos con reglas SUNAT Perú, semáforo de plazos de 25 días para entrega al contador y envío directo a WhatsApp en 1 clic.
9. **Motor Universal de PDFs (`lib/print-document.ts`):** Generación de PDFs reales en memoria resolviendo la limitación de WebKit en iPhone PWA instalada.
10. **PWA y Apple Touch Icons:** Iconos nativos con margen seguro contra el squircle de iOS.

---

## 🚀 Inicio Rápido (Desarrollo Local)

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilación de producción
npm run build
```

