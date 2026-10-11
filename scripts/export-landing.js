const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const exportDir = path.join(rootDir, 'landing-page-codigo');
const zipDestPublic = path.join(rootDir, 'public', 'landing-page-codigo.zip');
const zipDestRoot = path.join(rootDir, 'landing-page-codigo.zip');

console.log('🚀 Iniciando empaquetado del código de la Landing Page...');

// Limpiar si ya existía
if (fs.existsSync(exportDir)) {
  fs.rmSync(exportDir, { recursive: true, force: true });
}
fs.mkdirSync(exportDir, { recursive: true });

// Lista de archivos específicos de la Landing Page
const filesToCopy = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/globals.css',
  'app/components/LandingChatbot.tsx',
  'app/components/ChromaVideoAvatar.tsx',
  'app/components/3d/ModelosViviendaSection.tsx',
  'app/components/3d/ModeloCard.tsx',
  'app/components/3d/Visor3DModal.tsx',
  'app/components/3d/ModelViewerWrapper.tsx',
  'app/api/landing-config/route.ts',
  'app/api/consulta-estado/route.ts',
  'lib/landing_db.ts',
  'lib/status-helper.ts'
];

// Copiar archivos manteniendo la estructura
for (const relPath of filesToCopy) {
  const src = path.join(rootDir, relPath);
  const dest = path.join(exportDir, relPath);
  
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(` ✅ Copiado: ${relPath}`);
  } else {
    console.warn(` ⚠️ No se encontró: ${relPath}`);
  }
}

// Generar README.md para la otra IA con instrucciones y contexto completo
const readmeContent = `# 🏠 CÓDIGO FUENTE DE LA LANDING PAGE - CONSTRUCTORA MAZA QUIROZ (TECHO PROPIO)

Este paquete contiene **exclusivamente el código de la Landing Page** del sistema oficial de Constructora Maza Quiroz para el programa habitacional Techo Propio (Construcción en Sitio Propio - CSP).

---

## 🎯 OBJETIVO DEL REDISEÑO
Buscamos rediseñar esta landing page para elevar su impacto visual, modernidad y conversión al siguiente nivel:
- **Aspecto visual:** Premium, de alta confianza corporativa y gubernamental, moderno e interactivo (estilo Bento Grid, microinteracciones, glassmorphism sutil, tipografía cuidada).
- **Enfoque:** Facilitar a las familias peruanas postular al bono habitacional de Techo Propio, ver los modelos de vivienda en 3D, y consultar el estado de su postulación con su DNI.
- **Responsividad:** 100% Mobile-First y perfecto en iPhone, iPad, Android y pantallas 4K.

---

## 🛠️ STACK TECNOLÓGICO
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript (Strict Mode).
- **Estilos:** Tailwind CSS v4 + Vanilla CSS.
- **Iconos:** \`lucide-react\`.
- **Animaciones:** \`framer-motion\`.
- **Visor 3D:** \`@google/model-viewer\` (para modelos de casas en formato \`.glb\`).

---

## 📂 ESTRUCTURA DE ARCHIVOS INCLUIDOS

\`\`\`
landing-page-codigo/
├── app/
│   ├── page.tsx                    # Landing Page principal con todas las secciones
│   ├── layout.tsx                  # Layout raíz con configuración de fuentes, metadata y PWA
│   ├── globals.css                 # Estilos globales y variables de diseño
│   ├── components/
│   │   ├── LandingChatbot.tsx       # Widget flotante del Asistente Virtual IA con ventana de chat
│   │   ├── ChromaVideoAvatar.tsx   # Avatar bot en video con remoción de fondo verde en canvas a 60fps
│   │   └── 3d/
│   │       ├── ModelosViviendaSection.tsx # Sección de catálogo de modelos de casas con filtros
│   │       ├── ModeloCard.tsx             # Tarjeta de modelo de vivienda (fotos, especificaciones, botón 3D)
│   │       ├── Visor3DModal.tsx           # Modal con visor interactivo 3D orbital y barra de carga
│   │       └── ModelViewerWrapper.tsx     # Wrapper seguro SSR para el componente <model-viewer>
│   └── api/
│       ├── landing-config/
│       │   └── route.ts            # Endpoint GET/POST con los textos e imágenes dinámicos del CMS
│       └── consulta-estado/
│           └── route.ts            # Endpoint de consulta en vivo por DNI de postulantes
└── lib/
    ├── landing_db.ts               # Tipos TypeScript (LandingContent, BotCharacter) y contenido por defecto
    └── status-helper.ts            # Semáforo y badges para los estados de expedientes/postulación
\`\`\`

---

## 🧩 SECCIONES ACTUALES DE LA LANDING PAGE (\`app/page.tsx\`)

1. **Header / Navbar:** Logo de Constructora Maza Quiroz, menú de enlaces rápidos a secciones, y botón CTA directo a WhatsApp. (Incluye triple-click secreto para administradores).
2. **Hero:** Slider/carrusel de imágenes panorámicas de viviendas de alta resolución con texto principal y llamado a la acción.
3. **Banner Modal / Anuncios:** Ventana emergente opcional para comunicar aperturas de convocatorias del Ministerio de Vivienda.
4. **Sección Dual (Servicios & Consulta DNI):**
   - **Lado izquierdo:** Tarjetas de beneficios del programa (Subsidio 100% del Estado, Construcción Antisísmica, Asesoría Legal).
   - **Lado derecho:** Módulo interactivo **"Consulta tu DNI"** para que los beneficiarios ingresen su número de documento y vean en tiempo real si están "Inscritos", "Elegibles" o "Aprobados".
5. **Catálogo de Modelos de Vivienda 3D (\`ModelosViviendaSection.tsx\`):**
   - Tarjetas con fotos de fachadas, distribución, metraje y botón interactivo para abrir el modelo 3D (\`.glb\`).
6. **Galería de Proyectos Entregados:** Carrusel de fotos reales de viviendas construidas y entregadas.
7. **Sección "Nosotros":** Historia y experiencia de Constructora Maza Quiroz.
8. **Footer:** Datos de contacto, enlaces de privacidad y redes sociales.
9. **Asistente Virtual Bot (\`LandingChatbot.tsx\`):**
   - Bot interactivo flotante en la esquina inferior derecha con avatar en video Chroma Key que saluda al usuario y resuelve dudas de postulación.

---

## 💡 GUÍA PARA LA IA DISEÑADORA
- Mantén intactas las llamadas a las API (\`/api/consulta-estado\`, \`/api/landing-config\`) y las interfaces TypeScript definidas en \`lib/landing_db.ts\`.
- Eres libre de revolucionar la estructura visual, jerarquía tipográfica, layouts en Bento Grid, paleta de colores, tarjetas de servicios y la experiencia general de usuario (UX/UI).
`;

fs.writeFileSync(path.join(exportDir, 'README.md'), readmeContent, 'utf-8');
console.log(' ✅ Creado: README.md con documentación completa para la otra IA.');

// Crear ZIP usando PowerShell Compress-Archive
console.log(' 📦 Comprimiendo a archivo ZIP...');
try {
  // Asegurar que public existe
  if (!fs.existsSync(path.join(rootDir, 'public'))) {
    fs.mkdirSync(path.join(rootDir, 'public'), { recursive: true });
  }

  // Eliminar zip previo si existe
  if (fs.existsSync(zipDestPublic)) fs.unlinkSync(zipDestPublic);
  if (fs.existsSync(zipDestRoot)) fs.unlinkSync(zipDestRoot);

  const psCommand = `Compress-Archive -Path "${exportDir}\\*" -DestinationPath "${zipDestPublic}" -Force`;
  execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'inherit' });
  
  // Copiar también a la raíz para fácil acceso local
  fs.copyFileSync(zipDestPublic, zipDestRoot);

  console.log(`\n🎉 ¡Archivo ZIP creado exitosamente!`);
  console.log(`📁 Ruta en public (descargable web): ${zipDestPublic}`);
  console.log(`📁 Ruta en raíz del proyecto: ${zipDestRoot}`);
} catch (err) {
  console.error('❌ Error creando archivo ZIP:', err);
} finally {
  // Limpiar directorio temporal
  if (fs.existsSync(exportDir)) {
    fs.rmSync(exportDir, { recursive: true, force: true });
  }
}
