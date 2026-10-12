# DOCUMENTACIÓN INTEGRAL DEL SISTEMA TECHO PROPIO
## Constructora Maza Quiroz S.A.C.
**Manual Técnico de Arquitectura, Módulos, Landing Page, Visor 3D, Bot IA y Administración**

---

### Resumen del Documento
- **Nombre Oficial del Documento:** `DOCUMENTACION_SISTEMA_MAZA_QUIROZ.md`
- **Proyecto:** Sistema Techo Propio - Constructora Maza Quiroz
- **Empresa:** Constructora Maza Quiroz S.A.C.
- **Programa:** Programa Techo Propio - Modalidad Construcción en Sitio Propio (CSP)
- **Entidades Vinculadas:** Fondo MIVIVIENDA / Ministerio de Vivienda, Construcción y Saneamiento del Perú (MVCS)
- **Dominio de Producción:** [https://www.mazaquiroz.com](https://www.mazaquiroz.com)
- **Infraestructura de Despliegue:** Vercel (Next.js App Router + Turbopack)
- **Fecha de Consolidación:** Octubre 2026
- **Versión del Sistema:** v4.2 PRO (Enterprise Multi-Platform)

---

## TABLA DE CONTENIDOS

1. [Ficha Técnica y Resumen Ejecutivo](#1-ficha-técnica-y-resumen-ejecutivo)
2. [Arquitectura de Software y Estructura de Directorios](#2-arquitectura-de-software-y-estructura-de-directorios)
3. [Landing Page Oficial (Portal Público - app/page.tsx)](#3-landing-page-oficial-portal-público---apppagetsx)
4. [Visor de Viviendas en 3D Interactivo (app/components/3d)](#4-visor-de-viviendas-en-3d-interactivo-appcomponents3d)
5. [Asistente Virtual Bot con Video y Chroma Key en Vivo](#5-asistente-virtual-bot-con-video-y-chroma-key-en-vivo)
6. [Portal de Consulta Pública de Expedientes por DNI](#6-portal-de-consulta-pública-de-expedientes-por-dni)
7. [Visual Builder CMS para la Landing Page (LandingCMS.tsx)](#7-visual-builder-cms-para-la-landing-page-landingcmstsx)
8. [Panel Administrador (/sistema) y Gestión de Expedientes](#8-panel-administrador-sistema-y-gestión-de-expedientes)
9. [Módulo de Contabilidad Inteligente con IA (DocumentosContables.tsx)](#9-módulo-de-contabilidad-inteligente-con-ia-documentoscontablestsx)
10. [Motor Universal de Generación y Descarga de PDFs (lib/print-document.ts)](#10-motor-universal-de-generación-y-descarga-de-pdfs-libprint-documentts)
11. [PWA Nativo, Iconos de Apple y Experiencia Móvil 100%](#11-pwa-nativo-iconos-de-apple-y-experiencia-móvil-100)
12. [Catálogo de Endpoints de Backend (/app/api)](#12-catálogo-de-endpoints-de-backend-appapi)
13. [Base de Datos Supabase (Tablas, Esquemas y Storage)](#13-base-de-datos-supabase-tablas-esquemas-y-storage)
14. [Seguridad, Secretos y Rate Limiting](#14-seguridad-secretos-y-rate-limiting)
15. [Guía de Despliegue, Vercel y Comandos de Mantenimiento](#15-guía-de-despliegue-vercel-y-comandos-de-mantenimiento)

---

## 1. FICHA TÉCNICA Y RESUMEN EJECUTIVO

### 1.1 Objetivo del Software
El **Sistema Techo Propio - Constructora Maza Quiroz** es una plataforma tecnológica integral diseñada para gestionar de punta a punta las operaciones de la entidad técnica en el marco del programa social **Techo Propio (Construcción en Sitio Propio - CSP)**. Combina:
1. **Un Portal Web Público de Alta Conversión y Autoridad:** Presenta los modelos de vivienda en 3D interactivo, los estándares técnicos de construcción antisísmica, testimonios reales, consulta directa de expedientes por DNI y un bot asistente con video en vivo procesado en tiempo real.
2. **Un Sistema de Administración Operativa y Financiera (ERP/CRM):** Administra expedientes de beneficiarios, integración de consultas RENIEC, cronogramas de obra con maestros, metrados, presupuestos maestros con APUs, gestión documental probatoria y control tributario de comprobantes de pago asistido por Inteligencia Artificial.

### 1.2 Stack Tecnológico Principal

| Capa | Tecnología / Herramienta | Versión / Detalle |
| :--- | :--- | :--- |
| **Framework Web** | Next.js (App Router, Turbopack) | v16.x |
| **Librería UI** | React | v19.x |
| **Lenguaje** | TypeScript | Strict Mode |
| **Estilos y Diseño** | Tailwind CSS | Utility-first, Mobile-First, Safe Areas |
| **Animaciones** | Framer Motion | Gestos táctiles, AnimatePresence, Drawers |
| **Iconografía** | Lucide React | Paquete completo de iconos vectoriales |
| **Base de Datos** | PostgreSQL (Supabase) | Tablas relacionales con Row Level Security |
| **Almacenamiento de Archivos** | Supabase Storage | Buckets públicos y privados para PDFs, fotos y 3D |
| **Inteligencia Artificial** | OpenAI (`gpt-4o-mini`) | Chatbot asistente y Visión OCR para facturas |
| **Renderizado 3D** | `@google/model-viewer` / Three.js | Modelos `.glb` con techo desmontable interactivo |
| **Motor de Chroma Key** | Canvas HTML5 acelerado por hardware | Algoritmo propio Despill a 60 FPS |
| **Generación de PDFs** | jsPDF + html2canvas | Motor cliente A4 Retina 2x multi-página |
| **Procesador de Facturas** | Node.js `zlib` stream inflate | Extractor nativo en memoria de operadores `Tj`/`TJ` |
| **Infraestructura Cloud** | Vercel Edge & Serverless | Despliegue CI/CD continuo conectado a GitHub |

---

## 2. ARQUITECTURA DE SOFTWARE Y ESTRUCTURA DE DIRECTORIOS

El repositorio sigue la arquitectura estándar de Next.js App Router optimizada para alto rendimiento y desacoplamiento modular:

```
d:\Sistema-TechoPropio\
├── app/                                 # Rutas y páginas de la aplicación (App Router)
│   ├── api/                             # Endpoints REST Serverless (Backend)
│   │   ├── auth/                        # Autenticación y credenciales administrativas
│   │   ├── beneficiarios/               # CRUD de postulantes y beneficiarios
│   │   ├── consulta-dni/                # Proxy y consulta RENIEC
│   │   ├── consulta-estado/             # Búsqueda pública del estado de expediente
│   │   ├── documentos-contables/        # Gestión y lectura inteligente de facturas
│   │   │   └── procesar/                # Extractor de facturas PDF / Fotos con IA
│   │   ├── exportar-excel/              # Generación de reportes de datos
│   │   ├── file-proxy/                  # Proxy seguro para descarga de archivos
│   │   ├── landing-bot/                 # Cerebro LLM del Asistente Virtual
│   │   ├── landing-config/              # Endpoint de lectura/escritura del CMS
│   │   ├── maestros/                    # Control de maestros de obra
│   │   ├── modelos-vivienda/            # Catálogo de modelos 3D y especificaciones
│   │   ├── obras/                       # Cronograma de avance físico de obras
│   │   ├── planos/                      # Planos arquitectónicos e ingeniería
│   │   ├── presupuesto/                 # Presupuestos de obra por beneficiario
│   │   ├── presupuesto-master/          # Presupuesto maestro y partidas APU
│   │   └── upload/                      # Subida directa de archivos a Supabase
│   ├── components/                      # Componentes reutilizables de UI
│   │   ├── 3d/                          # Visor 3D y tarjetas de modelos
│   │   │   ├── ModelViewerWrapper.tsx   # Envoltorio web component de Google
│   │   │   ├── ModeloCard.tsx           # Tarjeta de modelo con "Leer más"
│   │   │   ├── ModelosViviendaSection.tsx # Sección de modelos en la landing
│   │   │   └── Visor3DModal.tsx         # Modal full screen del visor 3D
│   │   ├── ChromaVideoAvatar.tsx        # Canvas procesador de video con Chroma Key
│   │   ├── LandingChatbot.tsx           # Interfaz de chat del Asistente Virtual
│   │   ├── BeneficiaryFicha.tsx         # Ficha imprimible/descargable del beneficiario
│   │   ├── BeneficiaryModal.tsx         # Modal de edición y detalle de expediente
│   │   ├── ExpedientesView.tsx          # Vista principal de gestión de expedientes
│   │   ├── FullRegistrationForm.tsx     # Formulario de registro completo con RENIEC
│   │   ├── DocumentosContables.tsx      # Módulo contable con IA y semáforo 25 días
│   │   ├── CronogramaObra.tsx           # Cronograma de ejecución física
│   │   ├── CronogramaMaestros.tsx       # Asignación y control de cuadrillas
│   │   ├── PresupuestoSheet.tsx         # Hoja de cálculo de presupuesto
│   │   ├── PlanosIngenieria.tsx         # Visor y administrador de planos
│   │   ├── InteractivePlano.tsx         # Plano técnico interactivo
│   │   ├── DocumentManager.tsx          # Gestor de expedientes digitales
│   │   └── Sidebar.tsx                  # Navegación del panel administrativo
│   ├── sistema/                         # Módulo interno del Administrador (/sistema)
│   │   ├── components/                  # Componentes exclusivos del panel
│   │   │   └── LandingCMS.tsx           # Visual Builder V4 PRO de la Landing
│   │   └── page.tsx                     # Controlador principal del panel administrativo
│   ├── layout.tsx                       # Layout raíz (PWA meta, fuentes, manifest)
│   ├── page.tsx                         # Landing Page oficial (Portal público)
│   ├── globals.css                      # Estilos globales y reglas de scroll
│   ├── terminos/                        # Términos y condiciones del servicio
│   └── privacidad/                      # Políticas de tratamiento de datos personales
├── lib/                                 # Librerías de utilidad y acceso a datos
│   ├── db.ts                            # Capa de abstracción sobre Supabase DB
│   ├── landing_db.ts                    # Persistencia y schemas del CMS de la Landing
│   ├── supabase.ts                      # Cliente público de Supabase
│   ├── supabase-admin.ts                # Cliente con privilegios de servicio (Service Role)
│   ├── custom-llm.ts                    # Cliente personalizado para llamadas a OpenAI
│   ├── print-document.ts                # Motor universal de exportación de PDF (iOS fix)
│   ├── pdf-generator.ts                 # Generador serverless con Puppeteer
│   └── session-store.ts                 # Manejador de historial en memoria para el bot
├── public/                              # Archivos públicos estáticos
│   ├── apple-touch-icon.png             # Icono de inicio iOS con safe-area (180x180)
│   ├── apple-touch-icon-precomposed.png # Icono precompuesto de iOS
│   ├── icon-192.png / icon-512.png      # Iconos estándar PWA para Android
│   ├── manifest.json                    # Manifiesto de aplicación web progresiva
│   ├── personaje-bot.mp4                # Video original en pantalla verde del avatar
│   └── favicon.ico                      # Favicon de pestaña del navegador
├── scripts/                             # Scripts de utilidad, pruebas y sincronización
├── techo_propio_excel/                  # Módulos y código VBA de la extensión de escritorio
├── proxy.ts                             # Middleware de Rate Limiting en memoria
└── next.config.ts                       # Configuración de compilación Next.js
```

---

## 3. LANDING PAGE OFICIAL (PORTAL PÚBLICO - `app/page.tsx`)

La página de inicio es una experiencia visual de alto impacto inspirada en la arquitectura técnica contemporánea y los lineamientos del Fondo MIVIVIENDA.

### 3.1 Identidad Visual y Estética "Structural Integrity"
- **Paleta de Colores de Alta Autoridad:**
  - `Deep Slate Navy` (`#162839` / `#0b131b`): Fondos estructurales, solidez y seriedad ingenieril.
  - `Terracota Constructora` (`#e67e22` / `#d35400`): Detalles cálidos que evocan el ladrillo y la construcción de viviendas.
  - `Warm Stone & Pure White` (`#fcf9f6` / `#ffffff`): Textos de máxima legibilidad y tarjetas con bordes arquitectónicos (`.arch-border`).
- **Tipografías:**
  - Encabezados: `Montserrat` y `Outfit` con peso bold/extrabold.
  - Cuerpo técnico: `Work Sans` e `Inter` para óptima legibilidad en pantallas retina.

### 3.2 Secciones Integradas de la Landing Page

1. **Cinta Superior Institucional (Top Bar):**
   - Muestra la acreditación oficial: *"Entidad Técnica Autorizada - Código ET Oficial"*.
   - Destaca el beneficio del subsidio: *"Bono Familiar Habitacional (BFH) 100% Gratuito - No se devuelve"*.
   - Diseñada en una sola línea compacta en móviles sin saltos de línea bruscos.

2. **Navegación Principal Ultra-Responsive:**
   - Logotipo oficial de Constructora Maza Quiroz en alta resolución.
   - Enlaces de salto rápido (`whitespace-nowrap`): `Servicios`, `El Estándar`, `Modelos 3D`, `Paso a Paso`, `Obras Entregadas`, `Nosotros`.
   - Botón de llamado a la acción destacado "Contáctanos".
   - **Menú Móvil Adaptativo (Drawer):** Al hacer clic en el botón de menú en smartphones, se despliega un cajón lateral fluido con fondo translúcido (`backdrop-blur-xl`), animado con `Framer Motion` y cierre automático al seleccionar una sección.

3. **Portada Hero:**
   - Titulares de gran impacto: *"Construimos tu casa propia sin costo con Techo Propio"*.
   - Control de opacidad dinámica (`bgOpacity`): Permite ajustar mediante el CMS la cobertura oscura sobre la imagen de fondo (a mayor opacidad más oscuro y legible el texto; a menor opacidad más brillante la fotografía).
   - Acciones duales:
     - Botón principal: Redirige al portal de Consulta de DNI.
     - Botón secundario: Inicia conversación directa de WhatsApp con mensaje predeterminado.
   - **Bento Grid de Estadísticas:** Cuatro tarjetas métricas con diseño moderno:
     - `15+ Años` de trayectoria en el sector construcción.
     - `500+ Viviendas` entregadas con conformidad de obra.
     - `S/ 0 Cuota Inicial` (Subsidio no reembolsable del Estado).
     - `100% Antisísmico` con diseño estructural verificado.

4. **Portal de Consulta de Expedientes por DNI:**
   - Permite al postulante ingresar su número de DNI de 8 dígitos.
   - Consulta el estado en tiempo real sin recargar la página.
   - Presenta las etapas oficiales del proceso en una línea de tiempo interactiva.

5. **Nuestros Servicios Técnicos:**
   - Construcción en Sitio Propio (CSP).
   - Asesoría y gestión integral del Bono Familiar Habitacional.
   - Elaboración de planos arquitectónicos, estructurales, sanitarios y eléctricos.
   - Saneamiento físico-legal de predios y titulación.

6. **El Estándar Maza Quiroz:**
   - Sección de 2 columnas que compara la construcción informal frente a la construcción formal con ingeniería.
   - Pilares destacados: Supervisión por ingenieros colegiados (CIP) y arquitectos (CAP), uso exclusivo de cemento y fierro de primeras marcas peruanas, cimentaciones corridas y zapatas antisísmicas.

7. **Catálogo de Modelos de Vivienda 3D:**
   - Tarjetas interactivas con fotografías, distribución de ambientes (sala, comedor, cocina, dormitorios, baño) y área techada.
   - **Funcionalidad "Leer más":** Despliega el texto descriptivo completo si este excede las líneas predeterminadas.
   - Botón *"Explorar en 3D"* que levanta el visor interactivo.

8. **Proceso Paso a Paso (Cronograma del Subsidio):**
   - 4 fases explicadas didácticamente:
     1. Verificación de requisitos del grupo familiar y terreno.
     2. Armado de expediente técnico y registro en el sistema.
     3. Asignación y desembolso del Bono por el Fondo MIVIVIENDA.
     4. Ejecución de obra y entrega de llaves.

9. **Obras Entregadas (Portafolio Fotográfico):**
   - Carrusel de fotos reales de viviendas culminadas en diversas provincias, con familias beneficiarias y actas de entrega.

10. **Sobre Nosotros y Credenciales:**
    - Misión, visión y trayectoria de Constructora Maza Quiroz S.A.C. como Entidad Técnica de referencia en el norte del país.

11. **Pie de Página (Footer):**
    - Información legal, RUC, enlaces de interés, libro de reclamaciones, políticas de privacidad y términos y condiciones.

12. **Popup de Comunicado Oficial:**
    - Ventana modal administrable que se muestra al ingresar al portal si está activada en el CMS (ideal para avisos de convocatorias o nuevas resoluciones del Ministerio).

---

## 4. VISOR DE VIVIENDAS EN 3D INTERACTIVO (`app/components/3d/`)

El sistema incluye un visor tridimensional nativo de viviendas que funciona tanto en computadoras como en teléfonos móviles con pantalla táctil.

### 4.1 Componentes del Módulo 3D
- `ModelViewerWrapper.tsx`: Importa dinámicamente `@google/model-viewer` en el cliente, evitando problemas de hidratación en SSR.
- `Visor3DModal.tsx`: Ventana modal de pantalla completa con controles de navegación, iluminación y selector de pisos.
- `ModeloCard.tsx`: Tarjeta de presentación de cada modelo con preview visual y botón de apertura.
- `ModelosViviendaSection.tsx`: Contenedor de la sección en la landing page.

### 4.2 Características y Optimizaciones Clave
1. **Barra de Progreso de Carga en Tiempo Real:**
   - Los modelos 3D (`.glb`) pueden pesar entre 3 y 10 MB. El visor intercepta el evento de progreso del navegador y muestra una barra de carga porcentual (`0%` a `100%`) con diseño moderno, evitando pantallas en blanco o sensación de lentitud.
2. **Filtro de Errores No Fatales:**
   - Si el archivo `.glb` presenta advertencias menores de texturas o nodos secundarios que no impiden el renderizado, el visor suprime el bloqueo, permitiendo que el usuario explore la vivienda sin interrupciones.
3. **Interacción y Controles:**
   - Rotación libre de 360 grados (órbita con arrastre táctil o ratón).
   - Zoom in / Zoom out con pellizco táctil o rueda del ratón.
   - Botón de auto-rotación panorámica continua.
   - **Techo Interactivo:** Función que permite ocultar o mostrar el techo de la vivienda mediante recorrido de la escena Three.js (`mesh.name === 'techo_interactivo'`), permitiendo al usuario ver la distribución interior de habitaciones y muebles.

---

## 5. ASISTENTE VIRTUAL BOT CON VIDEO Y CHROMA KEY EN VIVO

Ubicado en la esquina inferior derecha del portal público (`app/components/ChromaVideoAvatar.tsx` y `app/components/LandingChatbot.tsx`).

### 5.1 Motor Chroma Key en Tiempo Real a 60 FPS
- **Tecnología:** Procesamiento de video fotograma a fotograma en un `<canvas>` HTML5 acelerado por hardware mediante WebGL / 2D context.
- **Remoción de Fondo Verde (Green Screen):** El algoritmo analiza los valores RGB de cada píxel, calcula la dominancia verde respecto a rojo y azul (`G > R * 1.15 && G > B * 1.15`), y asigna transparencia (`Alpha = 0`).
- **Filtro Despill:** Elimina los reflejos y halos verdes que rebotan en la piel y la ropa del avatar, reequilibrando el tono con el promedio de los canales rojo y azul.
- **Sombra de Suelo Dinámica:** Proyecta una elipse translúcida suave debajo de los pies del personaje para integrarlo de forma natural sobre el fondo de la landing page.

### 5.2 Estabilidad Geométrica y Corrección de Fotogramas
El video maestro (`public/personaje-bot.mp4`, resolución panorámica 1280x720) presentaba ciertas particularidades que fueron corregidas matemáticamente en el código:
- **Canvas con Dimensiones Fijas:** Inicializado estrictamente con `width={475}` y `height={690}` (`aspectRatio: "475 / 690"`), eliminando cualquier salto de anchura durante la carga inicial.
- **Encuadre Exacto del Brazo:** El personaje abarca `X: 244 a 660`. Se encuadra con `sx = 210` y `sw = 475` para que cuando el avatar levanta el brazo para saludar (en `X: 244`), la mano nunca se recorte.
- **Compensación de Offset y Bucle Continuo:**
  - En el archivo de video original, los primeros 0.48 segundos tenían al personaje desplazado 80 píxeles a la derecha (`X: 612` vs `X: 532`).
  - Se implementó una compensación matemática: si `t < 0.48s`, se desplaza la coordenada fuente a `sx = 290`; para `t >= 0.48s`, se fija en `sx = 210`.
  - El bucle de reproducción se reinicia suavemente entre `0.55s` y `duration - 0.08s`, garantizando que el personaje permanezca 100% estático en el píxel 322 en todo momento, sin saltos ni parpadeos.

### 5.3 Ventana de Chat Inteligente y Cerebro de IA
- **Título Oficial:** `ASISTENTE VIRTUAL` con insignia de estado verde *"En línea"*.
- **Endpoint Backend:** `/api/landing-bot/route.ts` conectado a OpenAI (`gpt-4o-mini`).
- **Conocimiento Especializado:** El modelo está parametrizado con los requisitos oficiales de Techo Propio (no tener otra propiedad inscrita en Registros Públicos, ingresos familiares menores a S/ 2,706, contar con terreno propio inscrito en SUNARP o con minuta legal, y ahorro mínimo exigido).
- **Bocadillo Flotante de Bienvenida:** Muestra un mensaje amigable configurable desde el CMS, acompañado de emojis directos para invitar al usuario a iniciar la conversación.

---

## 6. PORTAL DE CONSULTA PÚBLICA DE EXPEDIENTES POR DNI

Permite a cualquier familia postulante verificar el estado de su trámite de manera transparente las 24 horas del día.

### 6.1 Flujo de Consulta
1. El usuario digita su DNI (8 dígitos numéricos con validación automática).
2. Se realiza una solicitud a `/api/consulta-estado?dni=XXXXXXXX`.
3. El endpoint busca en la tabla `beneficiarios` de Supabase:
   - Nombre completo del titular.
   - Ubicación del predio (Departamento, Provincia, Distrito).
   - Estado actual del expediente.
   - Fecha de última actualización.
   - Observaciones o requerimientos pendientes (si aplica).

### 6.2 Etapas del Expediente Representadas Visualmente
- **Fase 1: Inscrito:** Expediente recepcionado por la entidad técnica, documentos iniciales verificados.
- **Fase 2: Elegible:** Verificación aprobada por el Fondo MIVIVIENDA (cumple con todos los requisitos del grupo familiar).
- **Fase 3: Asignado:** Bono Familiar Habitacional (BFH) asignado formalmente con código de proyecto.
- **Fase 4: En Construcción:** Obra iniciada con presencia de cuadrilla de maestros y supervisión de ingeniería.
- **Fase 5: Entregado:** Vivienda culminada al 100%, con actas de entrega de llaves y conformidad de obra firmadas.

---

## 7. VISUAL BUILDER CMS PARA LA LANDING PAGE (`LandingCMS.tsx`)

Ubicado en la ruta administrativa `/sistema` -> Menú "Landing Page", es un panel de control V4 PRO que otorga autonomía total a los administradores sin necesidad de tocar código fuente.

### 7.1 Capacidades del CMS
1. **Interruptores de Visibilidad de Secciones (On / Off):**
   - Barra Superior Institucional.
   - Portada Hero.
   - Portal de Consulta DNI.
   - Catálogo de Servicios.
   - Sección "El Estándar Maza Quiroz".
   - Catálogo de Modelos 3D.
   - Proceso Paso a Paso.
   - Obras Entregadas.
   - Sobre Nosotros.
   - Popup de Comunicado Oficial.
   - Asistente Virtual Bot.
2. **Editor de Tipografías y Textos:**
   - Selector de fuentes Google Fonts (Montserrat, Work Sans, Outfit, Inter, Poppins, Roboto).
   - Personalización de titulares, subtítulos, insignias y textos de botones.
3. **Control de Colores y Apariencia:**
   - Paleta de colores predeterminada y selector HEX libre para textos y fondos.
   - Los cambios de color se reflejan de forma estricta en la landing page (por ejemplo, `#ffffff` puro para el botón "Contáctanos").
4. **Control Deslizante de Opacidad de la Portada Hero (`bgOpacity`):**
   - Rango de 0% a 100%. A mayor valor, la capa oscura sobre la foto se intensifica para garantizar contraste del texto; a menor valor, la fotografía se hace más visible.
5. **Gestor Dinámico de Tarjetas (CRUD):**
   - Bento Grid de estadísticas: cambiar números, títulos y descripciones, o eliminar tarjetas sobrantes.
   - Servicios y Pilares de Calidad: agregar nuevos ítems, cambiar iconos y modificar descripciones.
   - Proyectos de Obras: subir múltiples fotografías por proyecto y actualizar títulos.
6. **Subpanel de Personajes del Bot:**
   - Activar o desactivar avatares.
   - Marcar si el archivo tiene pantalla verde (activa el canvas Chroma Key).
   - Subir nuevos videos `.mp4` o fotos a Supabase Storage mediante `/api/upload`.
   - Editor del texto del bocadillo flotante con barra de emojis rápidos (`👋 🏠 💬 👷 🏗️ ✨ 🇵🇪 📞 💡`).
7. **Persistencia Inmutable:**
   - Toda la configuración se serializa y guarda en la tabla `landing_config` mediante la capa `lib/landing_db.ts`.

---

## 8. PANEL ADMINISTRADOR (`/sistema`) Y GESTIÓN DE EXPEDIENTES

El centro de operaciones de Constructora Maza Quiroz para la gestión técnica, social y administrativa.

### 8.1 Experiencia de Usuario Nativa Móvil y Escritorio
- **Diseño Estilo iOS/iPadOS:** Barra superior de vidrio esmerilado (`backdrop-blur-2xl`), soporte completo para las zonas seguras del notch y barra de inicio de iPhone (`env(safe-area-inset-top)` y `env(safe-area-inset-bottom)`).
- **Eliminación de Barras Flotantes Inferiores:** Se descartó la barra inferior fija que saturaba las pantallas pequeñas, maximizando el espacio útil de trabajo en smartphones y tablets.
- **Drawer Deslizable con Microinteracciones:** Menú lateral accesible con toque táctil que agrupa las secciones:
  - Dashboard General.
  - Expedientes de Beneficiarios.
  - Cronogramas de Obras.
  - Control de Maestros de Obra.
  - Presupuestos y APUs.
  - Planos de Ingeniería.
  - Archivos Digitales.
  - Contabilidad Inteligente.
  - Configuración Landing Page.

### 8.2 Módulo de Expedientes (`ExpedientesView.tsx` y `FullRegistrationForm.tsx`)
- **Ficha Integral de Registro:**
  - **Datos del Titular y Cónyuge:** DNI, nombres, apellidos, fecha de nacimiento, estado civil, ocupación, grado de instrucción, teléfonos y correo.
  - **Consulta RENIEC Automática:** Botón directo que consulta el DNI en milisegundos y autocompleta nombres y apellidos sin abrir ventanas modales secundarias.
  - **Formateador Inteligente de Fechas:** Inserta barras diagonales automáticamente (`DD/MM/YYYY`) a medida que el usuario escribe, evitando errores de formato.
  - **Carga Familiar:** Tabla dinámica para agregar hijos, padres o dependientes (DNI, parentesco, fecha de nacimiento).
  - **Datos del Predio y Terreno:** Ubicación geográfica (Departamento, Provincia, Distrito, Centro Poblado), dirección exacta, linderos, área total, tipo de posesión (Título COFOPRI, SUNARP, Minuta, Donación), código de predio y suministro de agua/luz.
  - **Datos Notariales y Financieros:** Datos de escritura pública, notaría, ahorro previo acreditado en cuenta bancaria.
- **Vistas Adaptativas:**
  - En computadoras: Tabla completa con ordenamiento por columnas, filtros por estado, búsqueda instantánea y exportación a Excel.
  - En teléfonos celulares: Vista de tarjetas de alta densidad (`md:hidden`) con botones de acción directa (Ver Ficha, Editar, Ver Documentos, Eliminar).

### 8.3 Módulo de Cronograma de Obra y Maestros (`CronogramaObra.tsx` y `CronogramaMaestros.tsx`)
- Planificación semanal de partidas constructivas:
  - Movimiento de tierras y zanjas.
  - Cimentación y zapatas.
  - Asentado de muros de ladrillo y columnas de amarre.
  - Vaciado de losa aligerada (techo).
  - Instalaciones sanitarias y eléctricas.
  - Tarrajeo, pisos, puertas, ventanas y aparatos sanitarios.
- Asignación de cuadrillas de maestros de obra por proyecto y control de pagos semanales.

### 8.4 Módulo de Presupuestos y APUs (`PresupuestoSheet.tsx` y `ApuLibrary.tsx`)
- Librería de Análisis de Precios Unitarios (APU) según las partidas oficiales de Techo Propio.
- Cálculo automático de costos directos (materiales, mano de obra, equipos) y costos indirectos (gastos generales y utilidad).
- Generación de cotizaciones oficiales con formato estándar del Ministerio de Vivienda.

---

## 9. MÓDULO DE CONTABILIDAD INTELIGENTE CON IA (`DocumentosContables.tsx`)

Módulo diseñado para automatizar la recepción, procesamiento tributario y control de comprobantes de pago de obras (facturas de materiales como fierro, cemento, agregados, ladrillos, tuberías, y boletas de gastos).

### 9.1 Lector Híbrido de Facturas (PDF y Fotos) con IA
- **Ruta de Procesamiento:** `/api/documentos-contables/procesar/route.ts`.
- **Soporte de Formatos:** Archivos digitales `.pdf` y fotografías de celulares `.jpg`, `.jpeg`, `.png`, `.webp`.
- **Extractor Nativo de Streams PDF:**
  - Muchas librerías tradicionales de PDF (como `pdfjs-dist` o binarios nativos) fallan en entornos serverless Linux de Vercel debido a la falta de workers.
  - Se implementó un extractor nativo en memoria utilizando `zlib.inflateSync` que decodifica directamente los flujos de contenido de texto del estándar PDF, buscando operadores `Tj` y `TJ`.
  - En `next.config.ts` se añadió `serverExternalPackages: ['pdf-parse']` para evitar advertencias de empaquetado.
- **Extracción Inteligente con OpenAI (`gpt-4o-mini`):**
  - Aplica estrictamente las reglas tributarias de SUNAT Perú.
  - **Distinción Emisor vs Cliente:** Identifica con precisión a la empresa proveedora (vendedora) frente a Constructora Maza Quiroz (cliente/adquiriente).
  - **Campos Extraídos con Alta Precisión:**
    - Tipo de Comprobante (Factura Electrónica, Boleta de Venta, Recibo por Honorarios, Nota de Crédito).
    - RUC del Proveedor (11 dígitos numéricos válidos).
    - Razón Social del Proveedor.
    - Serie y Número de Comprobante (ej. `F001-00045231`).
    - Fecha de Emisión (`YYYY-MM-DD`).
    - Monto Total en Soles (`S/.`).
    - Desglose Completo de Productos: Lista detallada de materiales adquiridos con sus cantidades y descripciones en el campo `concepto`.

### 9.2 Almacenamiento Inmutable en Supabase Storage
- Todos los comprobantes procesados se suben permanentemente al bucket `documentos_beneficiarios/facturas/...` en Supabase.
- **Tratamiento de Enlaces Previos:** El sistema detecta comprobantes antiguos que tenían URLs temporales y ofrece el botón *"Adjuntar Archivo"* para subirlos de forma definitiva al almacenamiento permanente.

### 9.3 Sistema de Semáforo y Alerta de Plazos al Contador (25 Días)
Para cumplir con los plazos de declaración contable mensual ante la SUNAT, cada factura tiene una fecha límite de entrega:
- **Cálculo Automático:** Se suman 25 días a la fecha de emisión del comprobante (`[ENTREGA_CONTADOR: YYYY-MM-DD]`).
- **Semáforo Visual de Alertas:**
  - 🟢 **Verde (Al día):** Quedan más de 5 días para la fecha límite.
  - 🟡 **Amarillo (Próximo a vencer):** Quedan 5 días o menos.
  - 🔴 **Rojo Parpadeante (Vencido / Vence hoy):** Plazo expirado, requiere entrega inmediata.
  - 🟣 **Púrpura con Check (Entregado):** Comprobante ya remitido al contador.
- **Acciones Rápidas en 1-Clic:**
  1. **"Marcar Entregado":** Actualiza el estado en la base de datos vía `PATCH /api/documentos-contables`.
  2. **"Enviar por WhatsApp":** Descarga el archivo en memoria y lo comparte directamente adjunto en WhatsApp con el nombre y descripción de la factura mediante la API nativa `navigator.share({ files: [file], title, text })` en iOS y Android, eliminando textos innecesarios o enlaces rotos. En computadoras de escritorio ofrece un fallback directo al enlace de WhatsApp Web.
  3. **"🔔 Activar Alertas en el Celular":** Activa Web Push Notifications en el smartphone (`Notification.requestPermission()`).

---

## 10. MOTOR UNIVERSAL DE GENERACIÓN Y DESCARGA DE PDFS (`lib/print-document.ts`)

### 10.1 Diagnóstico del Problema en iPhone y iPad PWA
Al utilizar una aplicación web instalada en la pantalla de inicio de un iPhone (modo PWA / WebClip standalone), la función tradicional del navegador `window.print()` provoca un fallo crítico de WebKit: el motor activa la regla CSS `@media print` contrayendo toda la pantalla del sistema ("todo se encoge"), pero cancela de inmediato la operación al no disponer de un cuadro de diálogo nativo de AirPrint en modo standalone.

### 10.2 Solución Definitiva: Renderizado en Memoria Sandbox
Se construyó el motor universal `lib/print-document.ts` que desacopla la generación de documentos de la función de impresión del navegador:
1. **Contenedor Sandbox Fuera de Pantalla:** Se crea dinámicamente un nodo `#techo-propio-pdf-render-sandbox` posicionado en `left: -99999px` con ancho exacto A4 (794px a 96 DPI).
2. **Renderizado de Alta Resolución (Retina 2x):** `html2canvas` procesa el contenido con escala 2x, asegurando que textos, sellos y tablas se vean nítidos y vectoriales.
3. **Paginación Multi-Página Automática:** `jsPDF` calcula la altura del documento y corta el contenido en páginas A4 estándar (210mm x 297mm) de forma limpia sin superposición.
4. **Toast de Progreso Discreto:** Mientras el motor ensambla el PDF, se muestra un indicador visual elegante en pantalla (*"Generando archivo PDF..."*).
5. **Entrega Nativa Inteligente según el Dispositivo:**
   - **En iPhone / iPad (Safari y PWA):** Se crea un objeto binario `File([blob], fileName, { type: 'application/pdf' })` y se invoca la API nativa de iOS `navigator.share({ files: [file] })`. Esto abre la hoja de compartir oficial de Apple, permitiendo al usuario seleccionar *"Guardar en Archivos"*, *"Enviar por WhatsApp"*, *"Mail"* o *"Imprimir con AirPrint"* con el archivo ya generado y sin distorsionar la pantalla.
   - **En Computadoras de Escritorio (Windows / Mac / Linux):** Ejecuta la descarga automática e instantánea del archivo `.pdf` mediante `pdf.save(fileName)`.

### 10.3 Fichas y Módulos que Integran este Motor
- Ficha Oficial del Beneficiario (`BeneficiaryFicha.tsx`).
- Presupuesto de Obra (`PresupuestoSheet.tsx`).
- Cronograma de Ejecución de Obra (`CronogramaObra.tsx`).
- Cronograma y Asignación de Maestros (`CronogramaMaestros.tsx`).
- Planos y Especificaciones de Ingeniería (`PlanosIngenieria.tsx`).
- Gestor de Archivos y Documentación (`DocumentManager.tsx`).

---

## 11. PWA NATIVO, ICONOS DE APPLE Y EXPERIENCIA MÓVIL 100%

### 11.1 Configuración de Aplicación Web Progresiva (PWA)
En `app/layout.tsx` y `public/manifest.json`:
- `apple-mobile-web-app-capable: yes`: Oculta la barra de direcciones de Safari cuando se guarda la app en la pantalla de inicio.
- `apple-mobile-web-app-status-bar-style: black-translucent`: Hace que el contenido fluya debajo del notch e isla dinámica de iPhone.
- `viewport-fit=cover`: Aprovecha el 100% de la pantalla OLED de borde a borde.

### 11.2 Diseño de Iconos con Margen Seguro de Squircle
iOS aplica un recorte curvo (*squircle*) a todos los iconos añadidos al inicio. Si el logo no tiene margen, las esquinas y letras quedan cortadas.
- Se generaron los archivos oficiales con un 12% de padding interno seguro sobre fondo oscuro premium:
  - `public/apple-touch-icon.png` (180x180 px).
  - `public/apple-touch-icon-precomposed.png`.
  - `app/apple-icon.png`.
  - `public/icon-192.png` y `public/icon-512.png`.

### 11.3 Auditoría de Responsividad Móvil (0px Desbordamiento Horizontal)
Se ejecutaron pruebas automatizadas con Puppeteer simulando diversos dispositivos móviles con resultados de cero desbordamiento horizontal (`scrollWidth === innerWidth`):
- **iPhone SE / Pantallas Compactas (375x667):** ✅ PASS (0px overflow).
- **Android Galaxy / Pixel (360x800):** ✅ PASS (0px overflow).
- **iPhone 14 / 15 / 16 Estándar (390x844):** ✅ PASS (0px overflow).
- **iPhone 14 / 15 / 16 Pro Max / Plus (430x932):** ✅ PASS (0px overflow).

---

## 12. CATÁLOGO DE ENDPOINTS DE BACKEND (`/app/api`)

| Ruta API | Métodos | Descripción / Función |
| :--- | :--- | :--- |
| `/api/consulta-estado` | `GET` | Consulta pública del avance de expediente por DNI para postulantes. |
| `/api/consulta-dni` | `GET` | Proxy interno para consulta de datos RENIEC del titular y cónyuge. |
| `/api/beneficiarios` | `GET`, `POST`, `PUT`, `DELETE` | CRUD integral de expedientes de beneficiarios en Supabase. |
| `/api/documentos-contables` | `GET`, `POST`, `PATCH`, `DELETE` | Listado, edición y actualización de comprobantes y plazos del contador. |
| `/api/documentos-contables/procesar` | `POST` | Extracción con IA (OCR + Zlib parser) de facturas en PDF y fotos. |
| `/api/landing-bot` | `POST` | Interacción en lenguaje natural con el Asistente Virtual (`gpt-4o-mini`). |
| `/api/landing-config` | `GET`, `POST` | Obtención y actualización de toda la estructura visual del CMS. |
| `/api/upload` | `POST` | Subida de archivos binarios (fotos, videos, PDFs) a Supabase Storage. |
| `/api/modelos-vivienda` | `GET`, `POST`, `PUT`, `DELETE` | Catálogo de modelos de vivienda y vinculación de archivos `.glb`. |
| `/api/obras` | `GET`, `POST`, `PUT` | Registro de hitos y porcentaje de ejecución física de proyectos. |
| `/api/maestros` | `GET`, `POST`, `PUT` | Padrón de maestros de obra, cuadrillas y control de jornales. |
| `/api/presupuesto` | `GET`, `POST`, `PUT` | Hojas presupuestales asociadas a expedientes específicos. |
| `/api/presupuesto-master` | `GET`, `POST` | Catálogo maestro de partidas de construcción y precios de insumos. |
| `/api/planos` | `GET`, `POST` | Planos técnicos en PDF e imágenes de ingeniería. |
| `/api/exportar-excel` | `GET` | Generación de reportes tabulares de beneficiarios en formato Excel. |
| `/api/file-proxy` | `GET` | Descarga segura de archivos con cabeceras CORS controladas. |

---

## 13. BASE DE DATOS SUPABASE (TABLAS, ESQUEMAS Y STORAGE)

### 13.1 Tablas Principales en PostgreSQL
1. `beneficiarios`:
   - `id`: Identificador único (UUID / Serial).
   - `dni`: Documento nacional de identidad (Único).
   - `nombres`, `apellidos`, `telefono`, `estado_civil`.
   - `conyuge_dni`, `conyuge_nombres`, `conyuge_apellidos`.
   - `departamento`, `provincia`, `distrito`, `direccion`.
   - `codigo_predio`, `area_terreno`, `tipo_posesion`.
   - `estado`: Etapa del expediente (`Inscrito`, `Elegible`, `Asignado`, `En Construccion`, `Entregado`).
   - `observaciones`: Notas técnicas o requerimientos pendientes.
   - `created_at`, `updated_at`.
2. `cargas_familiares`:
   - `id`, `beneficiario_id` (FK), `dni`, `nombres`, `parentesco`, `fecha_nacimiento`.
3. `documentos_contables`:
   - `id`: Identificador del documento.
   - `ruc`: RUC de 11 dígitos del emisor.
   - `emisor`: Nombre comercial o razón social del proveedor.
   - `tipo_documento`: Factura, Boleta, Recibo, etc.
   - `serie_numero`: Número de serie del comprobante.
   - `fecha`: Fecha de emisión (`YYYY-MM-DD`).
   - `monto`: Importe total en soles (`DECIMAL(10,2)`).
   - `concepto`: Desglose detallado de materiales y productos adquiridos.
   - `url_archivo`: Enlace permanente en Supabase Storage.
   - `estado_contador`: `pendiente` o `entregado`.
   - `fecha_limite_contador`: Fecha límite (fecha + 25 días).
4. `landing_config`:
   - `id`: Registro singleton (`id = 1`).
   - `content`: JSONB con toda la estructura de la landing page (secciones, textos, imágenes, bot, colores, tipografías).
   - `updated_at`: Timestamp de última modificación.
5. `modelos_vivienda`:
   - `id`, `nombre`, `descripcion`, `area_techada`, `ambientes`, `url_glb`, `imagenes`.

### 13.2 Buckets en Supabase Storage
- `documentos_beneficiarios`: Almacena copias de DNI, títulos de propiedad, fichas y facturas contables.
- `documentos_contables`: Facturas y comprobantes procesados con IA.
- `modelos_3d`: Archivos `.glb` de las viviendas en tres dimensiones.
- `landing_assets`: Imágenes de proyectos, logotipos y videos de avatares subidos desde el CMS.

---

## 14. SEGURIDAD, SECRETOS Y RATE LIMITING

### 14.1 Aislamiento de Secretos y Variables de Entorno
Todos los secretos de la aplicación se gestionan exclusivamente mediante variables de entorno en `.env.local` y el panel de configuración de Vercel. No existen tokens ni credenciales quemadas en el código fuente:
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Llave pública anónima de Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: Llave secreta con privilegios administrativos para operaciones del backend.
- `OPENAI_API_KEY`: Llave de la API de OpenAI para el chatbot y la visión OCR.

### 14.2 Rate Limiting en Memoria (`proxy.ts`)
Para proteger las APIs de ataques de fuerza bruta o scraping abusivo:
- Se implementó un middleware en memoria que limita las peticiones a un máximo de **60 solicitudes por IP por minuto** en rutas `/api/*`.
- Si se excede el límite, se responde con código HTTP `429 Too Many Requests`.

### 14.3 Aislamiento Total de Telegram
Se removieron definitivamente todas las dependencias, webhooks y librerías vinculadas a bots de Telegram antiguos, eliminando cualquier vector de riesgo o enlaces rotos temporales.

---

## 15. GUÍA DE DESPLIEGUE, VERCEL Y COMANDOS DE MANTENIMIENTO

### 15.1 Despliegue en Vercel
El proyecto está configurado con integración continua en Vercel sobre la rama principal `main`:
- **Comando de Build:** `npm run build` (o `next build --webpack` / Turbopack).
- **Output:** Servidor Next.js optimizado.
- **Enlace de Dominio:** Vinculado con alias SSL directo a `https://www.mazaquiroz.com`.

### 15.2 Comandos Útiles de Desarrollo

```bash
# Instalar dependencias del proyecto
npm install

# Iniciar servidor de desarrollo local
npm run dev

# Ejecutar compilación de producción para validar tipos y empaquetado
npm run build

# Desplegar directamente a producción mediante Vercel CLI
npx vercel --prod --yes
```

---

## CONCLUSIÓN Y ESTADO FINAL
El **Sistema Techo Propio - Constructora Maza Quiroz S.A.C.** representa una solución integral, robusta y moderna que combina excelencia en diseño de experiencia de usuario (UI/UX) con ingeniería de software de nivel empresarial, asegurando alta disponibilidad, velocidad y total control operativo tanto en dispositivos móviles como en computadoras de escritorio.

*Documento técnico generado y guardado en la raíz del repositorio como `DOCUMENTACION_SISTEMA_MAZA_QUIROZ.md`.*
