"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { DocumentoContable } from "../types";
import confetti from "canvas-confetti";
import {
  Receipt,
  FileText,
  Search,
  Loader2,
  Trash2,
  Sparkles,
  UploadCloud,
  Plus,
  X,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Building2,
  Eye,
  AlertCircle,
  TrendingUp,
  Bell,
  Clock,
  Send,
  AlertTriangle,
  Check,
  RotateCcw,
} from "lucide-react";

// Calcula la fecha límite de entrega al contador (25 días por defecto)
function getFechaEntregaContador(doc: DocumentoContable): {
  fechaLimite: string;
  diasRestantes: number;
  esEntregado: boolean;
  estadoAlerta: "entregado" | "vencido" | "vence_hoy" | "proximo" | "al_dia";
} {
  const esEntregado = doc.estado === "Entregado al Contador";

  // Buscar si tiene fecha guardada en el concepto [ENTREGA_CONTADOR: YYYY-MM-DD]
  let fechaLimite = "";
  const match = (doc.concepto || "").match(/\[ENTREGA_CONTADOR:\s*([0-9-]+)\]/);
  if (match && match[1]) {
    fechaLimite = match[1];
  } else if (doc.fecha) {
    try {
      const parts = doc.fecha.includes("-") ? doc.fecha.split("-") : doc.fecha.split("/");
      let d: Date;
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        } else {
          d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
      } else {
        d = new Date(doc.fecha);
      }
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() + 25);
        fechaLimite = d.toISOString().split("T")[0];
      }
    } catch {
      fechaLimite = "";
    }
  }

  if (!fechaLimite) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 25);
    fechaLimite = fallback.toISOString().split("T")[0];
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const limiteDate = new Date(fechaLimite + "T00:00:00");
  const diffTime = limiteDate.getTime() - hoy.getTime();
  const diasRestantes = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let estadoAlerta: "entregado" | "vencido" | "vence_hoy" | "proximo" | "al_dia" = "al_dia";
  if (esEntregado) {
    estadoAlerta = "entregado";
  } else if (diasRestantes < 0) {
    estadoAlerta = "vencido";
  } else if (diasRestantes === 0) {
    estadoAlerta = "vence_hoy";
  } else if (diasRestantes <= 5) {
    estadoAlerta = "proximo";
  } else {
    estadoAlerta = "al_dia";
  }

  return { fechaLimite, diasRestantes, esEntregado, estadoAlerta };
}

// Limpia el concepto removiendo la etiqueta interna de fecha de entrega
function cleanConcepto(concepto?: string): string {
  if (!concepto) return "Sin concepto";
  return concepto.replace(/\[ENTREGA_CONTADOR:[^\]]*\]/g, "").trim() || "Gasto o compra facturada";
}

export default function DocumentosContables() {
  const [docs, setDocs] = useState<DocumentoContable[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("todos");
  const [onlyPendingAlerts, setOnlyPendingAlerts] = useState<boolean>(false);

  // Notificaciones Web / Celular
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  // Modal IA Estados
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingAi, setUploadingAi] = useState(false);
  const [aiStepText, setAiStepText] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);

  // Formulario de revisión / guardado
  const [formData, setFormData] = useState<{
    tipoDocumento: string;
    numeroDocumento?: string;
    emisor: string;
    ruc: string;
    fecha: string;
    fechaAlerta: string;
    monto: string;
    concepto: string;
    urlArchivo: string;
    estado: string;
  }>({
    tipoDocumento: "Factura",
    numeroDocumento: "",
    emisor: "",
    ruc: "",
    fecha: new Date().toISOString().split("T")[0],
    fechaAlerta: "",
    monto: "",
    concepto: "",
    urlArchivo: "",
    estado: "Pendiente Contador",
  });
  const [isFormReady, setIsFormReady] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);

  // Modal Manual Estado
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Reemplazo de archivo para facturas de Telegram
  const [replacingDocId, setReplacingDocId] = useState<string | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);

  // Compartir documento directo a WhatsApp
  const [sharingDocId, setSharingDocId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documentos-contables");
      if (res.ok) {
        const data = await res.json();
        setDocs(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  // Solicitar permiso de notificaciones push en el celular o navegador
  const requestNotificationAccess = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("Tu dispositivo o navegador no soporta notificaciones push.");
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === "granted") {
        new Notification("✅ Notificaciones activadas", {
          body: "Recibirás alertas de facturas por entregar al contador (plazo de 25 días).",
          icon: "/apple-touch-icon.png",
        });
        confetti({ particleCount: 30, spread: 50 });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Disparar notificación automática al cargar si hay alertas urgentes
  useEffect(() => {
    if (notificationPermission === "granted" && docs.length > 0) {
      const urgentes = docs.filter((d) => {
        const info = getFechaEntregaContador(d);
        return !info.esEntregado && (info.estadoAlerta === "vencido" || info.estadoAlerta === "vence_hoy" || info.estadoAlerta === "proximo");
      });

      if (urgentes.length > 0) {
        try {
          new Notification("⚠️ Alerta Contable (Plazo 25 días)", {
            body: `Tienes ${urgentes.length} factura(s) pendiente(s) de entrega al contador.`,
            icon: "/apple-touch-icon.png",
          });
        } catch (e) {
          console.warn("No se pudo mostrar la notificación:", e);
        }
      }
    }
  }, [docs, notificationPermission]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro que deseas eliminar este documento contable?")) return;
    try {
      const res = await fetch(`/api/documentos-contables?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocs((prev) => prev.filter((doc) => doc.id !== id));
      } else {
        alert("Hubo un error al eliminar el documento.");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión al eliminar.");
    }
  };

  // Alternar estado de entrega al contador (Pendiente <-> Entregado)
  const toggleEntregadoContador = async (doc: DocumentoContable) => {
    const nuevoEstado = doc.estado === "Entregado al Contador" ? "Pendiente Contador" : "Entregado al Contador";
    try {
      const res = await fetch("/api/documentos-contables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doc.id, estado: nuevoEstado }),
      });

      if (res.ok) {
        setDocs((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, estado: nuevoEstado } : d))
        );
        if (nuevoEstado === "Entregado al Contador") {
          confetti({ particleCount: 35, spread: 50 });
        }
      } else {
        alert("No se pudo actualizar el estado de entrega.");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión al actualizar.");
    }
  };

  // Procesamiento del archivo con IA (Visión / OCR / SUNAT)
  const handleProcessFile = async (file: File) => {
    setUploadingAi(true);
    setAiError(null);
    setIsFormReady(false);

    try {
      setAiStepText("Subiendo comprobante a Supabase Storage...");

      const bodyData = new FormData();
      bodyData.append("file", file);
      bodyData.append("autoSave", "false");

      setTimeout(() => {
        setAiStepText("Leyendo RUC, emisor, productos y montos con OpenAI Visión...");
      }, 1000);

      const res = await fetch("/api/documentos-contables/procesar", {
        method: "POST",
        body: bodyData,
      });

      const result = await res.json();

      if (!res.ok || !result.ok) {
        throw new Error(result.error || "No se pudo extraer la información del comprobante.");
      }

      const { datos, urlArchivo } = result;

      // Calcular plazo por defecto de 25 días desde la fecha de la factura
      let fechaAlertaCalc = datos.fechaAlerta || "";
      if (!fechaAlertaCalc && datos.fecha) {
        try {
          const d = new Date(datos.fecha);
          if (!isNaN(d.getTime())) {
            d.setDate(d.getDate() + 25);
            fechaAlertaCalc = d.toISOString().split("T")[0];
          }
        } catch {
          fechaAlertaCalc = "";
        }
      }

      setFormData({
        tipoDocumento: datos.tipoDocumento || "Factura",
        numeroDocumento: datos.numeroDocumento || "",
        emisor: datos.emisor || "",
        ruc: datos.ruc || "",
        fecha: datos.fecha || new Date().toISOString().split("T")[0],
        fechaAlerta: fechaAlertaCalc,
        monto: datos.monto ? String(datos.monto) : "",
        concepto: datos.concepto || "",
        urlArchivo: urlArchivo || "",
        estado: "Pendiente Contador",
      });

      setIsFormReady(true);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      console.error("Error al procesar archivo:", err);
      setAiError(err.message || "Error al procesar la factura con la IA.");
    } finally {
      setUploadingAi(false);
      setAiStepText("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Guardar documento verificado en la base de datos
  const handleSaveDocument = async () => {
    if (!formData.emisor.trim() || !formData.monto) {
      alert("Por favor completa al menos el Emisor y el Monto.");
      return;
    }

    setSavingDoc(true);
    try {
      const conceptoConAlerta = `${formData.concepto.trim()}${
        formData.fechaAlerta ? ` [ENTREGA_CONTADOR:${formData.fechaAlerta}]` : ""
      }`;

      const payload: DocumentoContable = {
        id: `DOC-CONT-${Date.now()}`,
        tipoDocumento: formData.tipoDocumento,
        fecha: formData.fecha,
        monto: parseFloat(formData.monto) || 0,
        emisor: formData.emisor.trim(),
        ruc: formData.ruc.trim(),
        concepto: conceptoConAlerta,
        urlArchivo: formData.urlArchivo,
        estado: formData.estado || "Pendiente Contador",
      };

      const res = await fetch("/api/documentos-contables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        setDocs((prev) => [saved, ...prev]);
        setIsAiModalOpen(false);
        setIsManualModalOpen(false);
        setIsFormReady(false);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.4 } });
      } else {
        const err = await res.json();
        alert(err.error || "Error al guardar el documento contable.");
      }
    } catch (e) {
      console.error("Error guardando:", e);
      alert("Error de conexión al guardar.");
    } finally {
      setSavingDoc(false);
    }
  };

  // Reemplazar archivo de Telegram expirado con un archivo nuevo permanente
  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingDocId) return;

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("subfolder", "facturas");

      const upRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const upJson = await upRes.json();
      if (!upRes.ok || !upJson.url) {
        alert("No se pudo subir el archivo.");
        return;
      }

      const patchRes = await fetch("/api/documentos-contables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: replacingDocId, urlArchivo: upJson.url }),
      });

      if (patchRes.ok) {
        setDocs((prev) =>
          prev.map((d) => (d.id === replacingDocId ? { ...d, urlArchivo: upJson.url } : d))
        );
        alert("✅ Archivo adjuntado y guardado permanentemente en Supabase.");
        confetti({ particleCount: 30, spread: 50 });
      }
    } catch (err) {
      console.error(err);
      alert("Error al adjuntar el archivo.");
    } finally {
      setReplacingDocId(null);
    }
  };

  // Compartir factura (archivo + nombre y descripción) directamente a WhatsApp
  const compartirDocumentoWhatsApp = async (doc: DocumentoContable) => {
    const emisorTexto = doc.emisor ? `${doc.tipoDocumento} - ${doc.emisor}` : (doc.tipoDocumento || "Comprobante");
    const descripcionFactura = `${emisorTexto}: ${cleanConcepto(doc.concepto)}`;

    // Si no tiene archivo o es link temporal expirado de Telegram
    if (!doc.urlArchivo || doc.urlArchivo.includes("api.telegram.org")) {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(descripcionFactura)}`, "_blank");
      return;
    }

    setSharingDocId(doc.id);

    try {
      // Descargamos el archivo como blob para enviarlo nativamente
      const res = await fetch(doc.urlArchivo);
      if (!res.ok) throw new Error("No se pudo obtener el archivo");
      const blob = await res.blob();

      // Detectar tipo MIME y extensión adecuada
      let mimeType = blob.type || "application/pdf";
      let ext = ".pdf";
      const urlLower = doc.urlArchivo.toLowerCase();

      if (mimeType.includes("jpeg") || mimeType.includes("jpg") || urlLower.includes(".jpg") || urlLower.includes(".jpeg")) {
        ext = ".jpg";
        mimeType = "image/jpeg";
      } else if (mimeType.includes("png") || urlLower.includes(".png")) {
        ext = ".png";
        mimeType = "image/png";
      } else if (mimeType.includes("webp") || urlLower.includes(".webp")) {
        ext = ".webp";
        mimeType = "image/webp";
      } else if (mimeType.includes("pdf") || urlLower.includes(".pdf")) {
        ext = ".pdf";
        mimeType = "application/pdf";
      }

      const safeName = (doc.emisor || "Factura").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
      const fileName = `${doc.tipoDocumento || "Comprobante"}_${safeName}${ext}`;
      const file = new File([blob], fileName, { type: mimeType });

      // Si el navegador soporta compartir archivos nativos (iOS Safari / Android Chrome / PWA)
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        (navigator as any).canShare &&
        (navigator as any).canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: fileName,
          text: descripcionFactura,
        });
        return;
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // El usuario canceló la acción de compartir voluntariamente
        return;
      }
      console.warn("No se pudo compartir el archivo directamente:", err);
    } finally {
      setSharingDocId(null);
    }

    // Fallback para navegadores de escritorio sin Web Share de archivos:
    const fallbackText = `${descripcionFactura}\n${doc.urlArchivo}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fallbackText)}`, "_blank");
  };

  // Filtrado y estadísticas
  const filtered = useMemo(() => {
    return docs.filter((d) => {
      const matchesSearch =
        (d.emisor || "").toLowerCase().includes(search.toLowerCase()) ||
        (d.ruc || "").includes(search) ||
        (d.concepto || "").toLowerCase().includes(search.toLowerCase()) ||
        (d.tipoDocumento || "").toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType !== "todos") {
        if (!(d.tipoDocumento || "").toLowerCase().includes(filterType.toLowerCase())) {
          return false;
        }
      }

      if (onlyPendingAlerts) {
        const info = getFechaEntregaContador(d);
        if (info.esEntregado) return false;
      }

      return true;
    });
  }, [docs, search, filterType, onlyPendingAlerts]);

  const totalMonto = useMemo(() => {
    return docs.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
  }, [docs]);

  // Contadores de alertas
  const alertasResumen = useMemo(() => {
    let pendientes = 0;
    let urgentes = 0;
    let entregados = 0;

    docs.forEach((d) => {
      const info = getFechaEntregaContador(d);
      if (info.esEntregado) {
        entregados++;
      } else {
        pendientes++;
        if (info.estadoAlerta === "vencido" || info.estadoAlerta === "vence_hoy" || info.estadoAlerta === "proximo") {
          urgentes++;
        }
      }
    });

    return { pendientes, urgentes, entregados };
  }, [docs]);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-6 animate-in fade-in duration-300">
      {/* Input oculto para reemplazar archivo de Telegram */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*,.pdf,application/pdf"
        className="hidden"
        onChange={handleReplaceFile}
      />

      {/* Banner de Alerta al Celular / Contador (Plazo 25 días) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                Alerta de Entrega al Contador
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Plazo legal: 25 días</span>
            </div>
            <p className="text-sm font-bold text-white">
              {alertasResumen.pendientes === 0
                ? "¡Excelente! Todas las facturas han sido entregadas al contador."
                : `${alertasResumen.pendientes} factura(s) pendiente(s) de entrega (${alertasResumen.urgentes} en plazo urgente).`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          {/* Botón Activar Notificaciones */}
          <button
            onClick={requestNotificationAccess}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
              notificationPermission === "granted"
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
            }`}
            title="Activar alertas push en tu iPhone o Android"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>
              {notificationPermission === "granted"
                ? "Alertas en Celular Activas"
                : "Activar Alertas en el Celular"}
            </span>
          </button>

          {/* Filtro rápido: Solo pendientes */}
          <button
            onClick={() => setOnlyPendingAlerts(!onlyPendingAlerts)}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all border ${
              onlyPendingAlerts
                ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20"
                : "bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border-white/10"
            }`}
          >
            {onlyPendingAlerts ? "Mostrando Solo Pendientes" : "Filtrar Pendientes"}
          </button>
        </div>
      </div>

      {/* Barra de Estadísticas / KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Comprobantes</div>
            <div className="text-xl sm:text-2xl font-black text-white">{docs.length} registrados</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monto Total Invertido</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              S/ {totalMonto.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lector Inteligente</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-300">
              OpenAI Visión + Extractor Zlib Activo
            </div>
          </div>
        </div>
      </div>

      {/* Cabecera Principal con Acciones y Búsqueda */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-emerald-400" />
            Contabilidad y Facturas
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Carga fotos o PDFs. La IA extraerá automáticamente RUC, proveedor, montos y productos comprados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botón Principal: Subir con IA */}
          <button
            onClick={() => {
              setIsFormReady(false);
              setAiError(null);
              setIsAiModalOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Subir Factura (PDF / Foto) con IA</span>
          </button>

          {/* Botón Secundario: Registro Manual */}
          <button
            onClick={() => {
              const hoy = new Date();
              const alerta = new Date();
              alerta.setDate(alerta.getDate() + 25);
              setFormData({
                tipoDocumento: "Factura",
                numeroDocumento: "",
                emisor: "",
                ruc: "",
                fecha: hoy.toISOString().split("T")[0],
                fechaAlerta: alerta.toISOString().split("T")[0],
                monto: "",
                concepto: "",
                urlArchivo: "",
                estado: "Pendiente Contador",
              });
              setIsManualModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.18] text-slate-300 hover:text-white border border-white/10 text-xs sm:text-sm font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Manual</span>
          </button>
        </div>
      </div>

      {/* Filtros rápidos y Barra de Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Pestañas de Filtro */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "todos", label: "Todos" },
            { id: "factura", label: "Facturas" },
            { id: "boleta", label: "Boletas" },
            { id: "recibo", label: "Recibos" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterType === tab.id
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input de Búsqueda */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por emisor, RUC o producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Vista de Tarjetas para Móviles (iOS / Teléfonos) */}
      <div className="block lg:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900/50 rounded-3xl border border-slate-800">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            Cargando documentos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900/50 rounded-3xl border border-slate-800">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            No se encontraron documentos contables.
          </div>
        ) : (
          filtered.map((doc) => {
            const alerta = getFechaEntregaContador(doc);
            const isTelegramUrl = (doc.urlArchivo || "").includes("api.telegram.org");

            return (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {doc.tipoDocumento}
                    </span>
                    {/* Badge de Alerta de Entrega */}
                    {alerta.esEntregado ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Entregado
                      </span>
                    ) : alerta.estadoAlerta === "vencido" ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Vencido ({Math.abs(alerta.diasRestantes)}d)
                      </span>
                    ) : alerta.estadoAlerta === "vence_hoy" ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-black">
                        ¡Vence HOY!
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                        Plazo: {alerta.diasRestantes}d
                      </span>
                    )}
                  </div>

                  <span className="text-base font-black text-emerald-400">
                    S/ {Number(doc.monto).toFixed(2)}
                  </span>
                </div>

                <div>
                  <div className="font-bold text-white text-sm">{doc.emisor}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    RUC: {doc.ruc || "N/A"} {doc.fecha ? `• Emitido: ${doc.fecha}` : ""}
                  </div>
                </div>

                {/* Detalle de Productos / Compra */}
                <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Detalle / Productos:</div>
                  <div className="leading-relaxed">{cleanConcepto(doc.concepto)}</div>
                </div>

                {/* Botones de Acción Móvil */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    {/* Botón Ver Comprobante */}
                    {doc.urlArchivo && !isTelegramUrl ? (
                      <a
                        href={doc.urlArchivo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-xl border border-emerald-500/20"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Factura
                      </a>
                    ) : isTelegramUrl ? (
                      <button
                        onClick={() => {
                          setReplacingDocId(doc.id);
                          replaceFileInputRef.current?.click();
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1.5 rounded-xl border border-amber-500/20"
                        title="El enlace temporal de Telegram expiró. Presiona para adjuntar el archivo directamente a Supabase."
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        Adjuntar Archivo
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500">Sin archivo</span>
                    )}

                    {/* Botón WhatsApp al Contador */}
                    <button
                      onClick={() => compartirDocumentoWhatsApp(doc)}
                      disabled={sharingDocId === doc.id}
                      className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 rounded-xl border border-emerald-500/20 disabled:opacity-50 transition-all"
                      title="Enviar archivo y descripción por WhatsApp"
                    >
                      {sharingDocId === doc.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Botón Marcar Entregado */}
                    <button
                      onClick={() => toggleEntregadoContador(doc)}
                      className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
                        alerta.esEntregado
                          ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                          : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      {alerta.esEntregado ? "Desmarcar" : "Marcar Entregado"}
                    </button>

                    {/* Botón Eliminar */}
                    <button
                      onClick={() => doc.id && handleDelete(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800/60 rounded-xl"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Vista de Tabla para Escritorio / Tablets */}
      <div className="hidden lg:block bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="px-5 py-4 font-bold">Documento</th>
                <th className="px-5 py-4 font-bold">Emisión</th>
                <th className="px-5 py-4 font-bold">Emisor / RUC</th>
                <th className="px-5 py-4 font-bold">Productos / Detalle</th>
                <th className="px-5 py-4 font-bold">Monto</th>
                <th className="px-5 py-4 font-bold">Entrega Contador (25d)</th>
                <th className="px-5 py-4 font-bold">Archivo</th>
                <th className="px-5 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                    Cargando documentos contables...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No se encontraron documentos contables.
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => {
                  const alerta = getFechaEntregaContador(doc);
                  const isTelegramUrl = (doc.urlArchivo || "").includes("api.telegram.org");

                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {doc.tipoDocumento}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-1">
                          {doc.id?.slice(0, 15)}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium">{doc.fecha || "N/A"}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-200">{doc.emisor}</div>
                        <div className="text-xs text-slate-400 font-mono">RUC: {doc.ruc || "N/A"}</div>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <div className="text-xs text-slate-300 line-clamp-2" title={cleanConcepto(doc.concepto)}>
                          {cleanConcepto(doc.concepto)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 whitespace-nowrap">
                          S/ {Number(doc.monto).toFixed(2)}
                        </span>
                      </td>

                      {/* Estado y Alerta de Entrega al Contador */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {alerta.esEntregado ? (
                          <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Entregado
                          </div>
                        ) : alerta.estadoAlerta === "vencido" ? (
                          <div className="inline-flex items-center gap-1 text-xs font-bold text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            Vencido ({Math.abs(alerta.diasRestantes)}d)
                          </div>
                        ) : alerta.estadoAlerta === "vence_hoy" ? (
                          <div className="inline-flex items-center gap-1 text-xs font-black text-rose-200 bg-rose-500/30 px-2.5 py-1 rounded-lg border border-rose-500/40">
                            ¡Vence HOY!
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/25">
                            <Clock className="w-3 h-3" />
                            Faltan {alerta.diasRestantes} días
                          </div>
                        )}
                      </td>

                      {/* Archivo Adjunto */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {doc.urlArchivo && !isTelegramUrl ? (
                          <a
                            href={doc.urlArchivo}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-emerald-600 px-3 py-1 rounded-lg text-slate-300 hover:text-white transition-colors border border-slate-700"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver Factura
                          </a>
                        ) : isTelegramUrl ? (
                          <button
                            onClick={() => {
                              setReplacingDocId(doc.id);
                              replaceFileInputRef.current?.click();
                            }}
                            className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/25"
                            title="El enlace temporal de Telegram expiró. Presiona para subir el archivo directamente a Supabase."
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            Adjuntar Archivo
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">Sin archivo</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4 text-right whitespace-nowrap space-x-1.5">
                        {/* Botón WhatsApp */}
                        <button
                          onClick={() => compartirDocumentoWhatsApp(doc)}
                          disabled={sharingDocId === doc.id}
                          className="p-1.5 bg-slate-800/60 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-xl transition-colors disabled:opacity-50"
                          title="Enviar archivo y descripción por WhatsApp"
                        >
                          {sharingDocId === doc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>

                        {/* Botón Cambiar Estado Entrega */}
                        <button
                          onClick={() => toggleEntregadoContador(doc)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                            alerta.esEntregado
                              ? "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                          }`}
                          title="Marcar como entregado o pendiente para el contador"
                        >
                          {alerta.esEntregado ? "Desmarcar" : "Entregado"}
                        </button>

                        {/* Botón Eliminar */}
                        <button
                          onClick={() => doc.id && handleDelete(doc.id)}
                          className="p-1.5 bg-slate-800/50 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-colors"
                          title="Eliminar documento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: SUBIR Y LEER FACTURA CON INTELIGENCIA ARTIFICIAL    */}
      {/* ============================================================ */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Escanear Factura con Inteligencia Artificial
                  </h3>
                  <p className="text-xs text-slate-400">
                    Extrae automáticamente RUC, emisor, productos y programa la entrega al contador (25 días).
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!uploadingAi) setIsAiModalOpen(false);
                }}
                disabled={uploadingAi}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {!isFormReady && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all ${
                    isDragging
                      ? "border-emerald-400 bg-emerald-500/10 scale-[1.01]"
                      : "border-slate-700 bg-slate-950/40 hover:border-slate-600"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploadingAi}
                  />

                  {uploadingAi ? (
                    <div className="space-y-4 py-4">
                      <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
                        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400">
                          <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">{aiStepText || "Procesando documento..."}</p>
                        <p className="text-xs text-slate-400">
                          Extrayendo RUC, proveedor, montos y lista de productos con IA...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm sm:text-base font-bold text-white">
                          Arrastra tu factura aquí o selecciónala
                        </p>
                        <p className="text-xs text-slate-400">
                          Admite PDF, JPG, PNG o WebP (facturas, boletas, recibos por honorarios)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all"
                      >
                        <UploadCloud className="w-4 h-4" />
                        Seleccionar Archivo (Foto o PDF)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {aiError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs sm:text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-rose-200">No se pudo procesar la factura</p>
                    <p>{aiError}</p>
                  </div>
                </div>
              )}

              {/* Formulario de revisión tras extracción con IA */}
              {isFormReady && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Datos extraídos con éxito por la IA. Revisa y confirma:
                    </div>
                    {formData.urlArchivo && (
                      <a
                        href={formData.urlArchivo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver archivo
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Tipo de Documento
                      </label>
                      <select
                        value={formData.tipoDocumento}
                        onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Factura">Factura</option>
                        <option value="Boleta de Venta">Boleta de Venta</option>
                        <option value="Recibo por Honorarios">Recibo por Honorarios</option>
                        <option value="Nota de Crédito">Nota de Crédito</option>
                        <option value="Comprobante">Comprobante / Ticket</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Fecha de Emisión
                      </label>
                      <input
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => {
                          const nuevaFecha = e.target.value;
                          let nuevaAlerta = formData.fechaAlerta;
                          try {
                            const d = new Date(nuevaFecha);
                            if (!isNaN(d.getTime())) {
                              d.setDate(d.getDate() + 25);
                              nuevaAlerta = d.toISOString().split("T")[0];
                            }
                          } catch {}
                          setFormData({ ...formData, fecha: nuevaFecha, fechaAlerta: nuevaAlerta });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        RUC del Emisor / Proveedor
                      </label>
                      <input
                        type="text"
                        maxLength={11}
                        placeholder="ej: 10472490228"
                        value={formData.ruc}
                        onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Monto Total (S/.)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.monto}
                        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Emisor / Proveedor (Razón Social o Nombre)
                      </label>
                      <input
                        type="text"
                        placeholder="ej: RUIZ MELENDEZ RICHARDS MANACES ERASMO"
                        value={formData.emisor}
                        onChange={(e) => setFormData({ ...formData, emisor: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Descripción de Productos / Compras */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Descripción de Productos / Compras
                      </label>
                      <textarea
                        rows={3}
                        placeholder="ej: Chicha de jora 1 Lt (1 un), Arroz norteño con panceta (1 un), Trio de mini causas"
                        value={formData.concepto}
                        onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none leading-relaxed"
                      />
                    </div>

                    {/* Plazo de Entrega al Contador */}
                    <div className="sm:col-span-2 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-400" />
                          Fecha Límite para Entrega al Contador (Plazo de 25 días)
                        </label>
                        <span className="text-[11px] text-amber-400 font-semibold">
                          Calculado automáticamente
                        </span>
                      </div>
                      <input
                        type="date"
                        value={formData.fechaAlerta}
                        onChange={(e) => setFormData({ ...formData, fechaAlerta: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/40 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-400">
                        El sistema te alertará automáticamente al celular cuando esta fecha se aproxime o se cumpla.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
              {isFormReady ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormReady(false);
                      setAiError(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800/40"
                  >
                    Escanear otro archivo
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAiModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDocument}
                      disabled={savingDoc}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      {savingDoc ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Guardar Factura en el Sistema
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(false)}
                    disabled={uploadingAi}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: REGISTRO MANUAL DE FACTURA O RECIBO                */}
      {/* ============================================================ */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Nuevo Registro Manual</h3>
                  <p className="text-xs text-slate-400">Ingresa los datos del documento contable</p>
                </div>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tipo de Documento</label>
                  <select
                    value={formData.tipoDocumento}
                    onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value="Factura">Factura</option>
                    <option value="Boleta de Venta">Boleta de Venta</option>
                    <option value="Recibo por Honorarios">Recibo por Honorarios</option>
                    <option value="Nota de Crédito">Nota de Crédito</option>
                    <option value="Comprobante">Comprobante</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Fecha de Emisión</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => {
                      const nf = e.target.value;
                      let na = formData.fechaAlerta;
                      try {
                        const d = new Date(nf);
                        if (!isNaN(d.getTime())) {
                          d.setDate(d.getDate() + 25);
                          na = d.toISOString().split("T")[0];
                        }
                      } catch {}
                      setFormData({ ...formData, fecha: nf, fechaAlerta: na });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">RUC</label>
                  <input
                    type="text"
                    maxLength={11}
                    placeholder="20123456789"
                    value={formData.ruc}
                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Monto Total (S/.)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-bold focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Emisor / Proveedor</label>
                  <input
                    type="text"
                    placeholder="Razón Social o Nombre"
                    value={formData.emisor}
                    onChange={(e) => setFormData({ ...formData, emisor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Descripción de Productos / Compras
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detalle o descripción de los bienes adquiridos"
                    value={formData.concepto}
                    onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                  <label className="block text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Fecha Límite para Entrega al Contador (Plazo 25 días)
                  </label>
                  <input
                    type="date"
                    value={formData.fechaAlerta}
                    onChange={(e) => setFormData({ ...formData, fechaAlerta: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-amber-500/30 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDocument}
                disabled={savingDoc}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
              >
                {savingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Guardar Documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
