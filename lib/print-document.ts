import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Utilidad universal para generar, descargar e imprimir cualquier ficha o documento en PDF real (.pdf).
 * Compatible al 100% con:
 * - iPhone y iPad en Modo App / PWA instalada en pantalla de inicio (WebClip standalone)
 * - Navegador Safari Móvil y Chrome en teléfonos y tablets
 * - Computadoras de escritorio (Windows, Mac, Linux)
 * 
 * Resuelve definitivamente el problema de que la pantalla se encoja en iPhone PWA debido a window.print()
 * y entrega directamente un archivo PDF nativo mediante la hoja de compartir de iOS ("Guardar en Archivos" / WhatsApp)
 * o descarga automática del archivo .pdf en computadoras.
 */

export async function printHtmlDocument(options: {
  title: string;
  htmlContent: string;
}): Promise<void> {
  if (typeof window === "undefined") return;

  const { title, htmlContent } = options;
  const cleanTitle = title.replace(/[\\/:*?"<>|]/g, "_").trim() || "Ficha_Techo_Propio";
  const fileName = `${cleanTitle}.pdf`;

  // 1. Toast visual discreto mientras se procesa el PDF
  const toast = document.createElement("div");
  toast.id = "techo-propio-pdf-toast";
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;background:#090d16;color:#ffffff;padding:12px 20px;border-radius:18px;border:1px solid rgba(56,189,248,0.4);box-shadow:0 20px 30px -10px rgba(0,0,0,0.7);font-family:system-ui,-apple-system,sans-serif;font-size:13px;font-weight:600;backdrop-filter:blur(16px);">
      <svg style="animation:spin 1s linear infinite;width:18px;height:18px;color:#38bdf8;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <span>Generando archivo PDF...</span>
    </div>
    <style>
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    </style>
  `;
  toast.style.position = "fixed";
  toast.style.bottom = "24px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.zIndex = "999999999";
  toast.style.transition = "opacity 0.25s ease";
  document.body.appendChild(toast);

  const removeToast = () => {
    if (toast.parentNode) {
      toast.style.opacity = "0";
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }
  };

  // 2. Contenedor sandbox fuera de pantalla (renderiza el contenido sin afectar el viewport ni encoger la pantalla)
  const sandbox = document.createElement("div");
  sandbox.id = "techo-propio-pdf-render-sandbox";
  sandbox.style.position = "fixed";
  sandbox.style.top = "0";
  sandbox.style.left = "-99999px";
  sandbox.style.width = "794px"; // 210mm a 96 DPI (ancho exacto A4 estándar)
  sandbox.style.background = "#ffffff";
  sandbox.style.color = "#0f172a";
  sandbox.style.padding = "24px 28px";
  sandbox.style.boxSizing = "border-box";
  sandbox.style.zIndex = "-999999";
  sandbox.style.overflow = "visible";

  // Extraer estilos CSS
  const styleMatches = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  let stylesBlock = styleMatches.join("\n");
  stylesBlock = stylesBlock.replace(/@page\s*\{[^}]*\}/gi, "");

  // Extraer cuerpo HTML
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyInner = bodyMatch ? bodyMatch[1] : htmlContent;
  bodyInner = bodyInner.replace(/<script[\s\S]*?<\/script>/gi, "");

  sandbox.innerHTML = `
    ${stylesBlock}
    <style>
      #techo-propio-pdf-render-sandbox {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      }
      #techo-propio-pdf-render-sandbox * {
        box-sizing: border-box !important;
      }
    </style>
    <div class="pdf-inner-content">
      ${bodyInner}
    </div>
  `;

  document.body.appendChild(sandbox);

  try {
    // Breve pausa para asegurar cálculo de layout y fuentes
    await new Promise((r) => setTimeout(r, 90));

    // 3. Captura gráfica de alta resolución (2x escala Retina)
    const canvas = await html2canvas(sandbox, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });

    // 4. Generación de PDF multi-página A4 (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const totalPdfHeight = (canvasHeight * pdfWidth) / canvasWidth;
    let heightLeft = totalPdfHeight;
    let position = 0;

    const imgData = canvas.toDataURL("image/jpeg", 0.96);

    pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 2) {
      position = heightLeft - totalPdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const pdfBlob = pdf.output("blob");
    const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

    // 5. Detección de móvil / tablet / PWA standalone
    const isMobileDevice =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (
      isMobileDevice &&
      typeof navigator !== "undefined" &&
      navigator.canShare &&
      navigator.canShare({ files: [pdfFile] })
    ) {
      removeToast();
      try {
        await navigator.share({
          files: [pdfFile],
          title: cleanTitle,
          text: `Ficha: ${cleanTitle}`,
        });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return; // Usuario canceló la acción en el menú
        }
      }
    }

    // 6. En escritorio o fallback: Guardado directo del archivo PDF
    pdf.save(fileName);
  } catch (err) {
    console.error("Error al generar PDF con jsPDF:", err);
    fallbackOpen(fileName, htmlContent);
  } finally {
    removeToast();
    if (sandbox.parentNode) {
      sandbox.parentNode.removeChild(sandbox);
    }
  }
}

function fallbackOpen(title: string, htmlContent: string) {
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
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (e) {
    console.error("Error en fallback:", e);
  }
}
