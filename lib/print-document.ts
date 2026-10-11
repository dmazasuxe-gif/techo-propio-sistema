/**
 * Utilidad universal para imprimir y descargar cualquier ficha o documento en PDF.
 * Compatible al 100% con:
 * - iPhone y iPad (iOS / iPadOS Safari y PWA añadida a la pantalla de inicio)
 * - Celulares y tablets Android (Chrome, Edge, Samsung Internet)
 * - Computadoras de escritorio (Windows, Mac, Linux)
 * 
 * Elimina por completo las llamadas a `window.open("", "_blank", "width=...,height=...")`
 * que activaban el bloqueo de ventanas emergentes en teléfonos y tablets.
 */

export function printHtmlDocument(options: {
  title: string;
  htmlContent: string;
}): void {
  if (typeof window === "undefined") return;

  const { title, htmlContent } = options;

  // 1. Guardar y actualizar el título del documento (nombre sugerido al guardar en PDF)
  const originalTitle = document.title;
  const cleanTitle = title.replace(/[\\/:*?"<>|]/g, "_").trim() || "Ficha_Techo_Propio";
  document.title = cleanTitle;

  // 2. Crear o reutilizar el contenedor de impresión único en el DOM
  let printContainer = document.getElementById("techo-propio-print-area");
  if (!printContainer) {
    printContainer = document.createElement("div");
    printContainer.id = "techo-propio-print-area";
    document.body.appendChild(printContainer);
  }

  // 3. Crear o asegurar los estilos globales de aislamiento para la impresión
  let printStyle = document.getElementById("techo-propio-print-style");
  if (!printStyle) {
    printStyle = document.createElement("style");
    printStyle.id = "techo-propio-print-style";
    printStyle.innerHTML = `
      @media screen {
        #techo-propio-print-area {
          display: none !important;
        }
      }
      @media print {
        /* Ocultar toda la interfaz visual de la aplicación web */
        body > *:not(#techo-propio-print-area) {
          display: none !important;
        }
        html, body {
          background: #ffffff !important;
          color: #0f172a !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
        }
        #techo-propio-print-area {
          display: block !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          min-height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #0f172a !important;
          z-index: 99999999 !important;
          overflow: visible !important;
        }
        /* Preservar degradados, colores de badges, líneas y marcas de agua */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @page {
          size: A4 portrait;
          margin: 12mm 10mm;
        }
      }
    `;
    document.head.appendChild(printStyle);
  }

  // 4. Procesar el HTML: extraer <style> y <body> limpio
  const styleMatches = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  const stylesBlock = styleMatches.join("\n");

  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyInner = bodyMatch ? bodyMatch[1] : htmlContent;

  // Remover scripts incrustados del contenido para que no llamen a window.close prematuramente
  bodyInner = bodyInner.replace(/<script[\s\S]*?<\/script>/gi, "");

  // Insertar documento en el contenedor aislado
  printContainer.innerHTML = `${stylesBlock}<div class="ficha-printable-root">${bodyInner}</div>`;

  // 5. Función de limpieza tras imprimir o cancelar
  let isCleaned = false;
  const cleanup = () => {
    if (isCleaned) return;
    isCleaned = true;
    document.title = originalTitle;
    if (printContainer) {
      printContainer.innerHTML = "";
    }
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);

  // 6. Ejecutar impresión nativa (abre el visor de AirPrint / Guardar como PDF en iOS y Android)
  setTimeout(() => {
    try {
      window.print();
    } catch (err) {
      console.warn("Aviso en impresión nativa:", err);
      fallbackBlobPrint(cleanTitle, htmlContent);
    }
    // Timeout de seguridad en caso de que el navegador no emita evento afterprint
    setTimeout(cleanup, 6000);
  }, 120);
}

/**
 * Fallback si el dispositivo no soporta window.print directo:
 * Genera un Blob sin forzar dimensiones de popup para no ser bloqueado.
 */
function fallbackBlobPrint(title: string, htmlContent: string): void {
  try {
    const cleanHtml = htmlContent.replace(/<script[\s\S]*?<\/script>/gi, "");
    const blob = new Blob([cleanHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  } catch (err) {
    console.error("Error en fallback:", err);
  }
}
