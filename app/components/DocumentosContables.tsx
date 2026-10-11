"use client";

import React, { useEffect, useState, useRef } from "react";
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
  FileCheck,
  TrendingUp,
} from "lucide-react";

export default function DocumentosContables() {
  const [docs, setDocs] = useState<DocumentoContable[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("todos");

  // Modal IA Estados
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingAi, setUploadingAi] = useState(false);
  const [aiStepText, setAiStepText] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);

  // Formulario de revisión / guardado (post-extracción IA o manual)
  const [formData, setFormData] = useState<{
    tipoDocumento: string;
    numeroDocumento?: string;
    emisor: string;
    ruc: string;
    fecha: string;
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
    monto: "",
    concepto: "",
    urlArchivo: "",
    estado: "Registrado",
  });
  const [isFormReady, setIsFormReady] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);

  // Modal Manual Estado
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Preview Modal
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Procesamiento del archivo con IA (Vision / OCR)
  const handleProcessFile = async (file: File) => {
    setUploadingAi(true);
    setAiError(null);
    setIsFormReady(false);

    try {
      setAiStepText("Subiendo archivo a la nube segura...");

      const bodyData = new FormData();
      bodyData.append("file", file);
      bodyData.append("autoSave", "false"); // Permitir revisar antes de confirmar

      // Actualizar texto tras breve delay para feedback visual
      setTimeout(() => {
        setAiStepText("Extrayendo RUC, emisor, montos y fecha con Inteligencia Artificial...");
      }, 1200);

      const res = await fetch("/api/documentos-contables/procesar", {
        method: "POST",
        body: bodyData,
      });

      const result = await res.json();

      if (!res.ok || !result.ok) {
        throw new Error(result.error || "No se pudo extraer la información del documento.");
      }

      const { datos, urlArchivo } = result;

      setFormData({
        tipoDocumento: datos.tipoDocumento || "Factura",
        numeroDocumento: datos.numeroDocumento || "",
        emisor: datos.emisor || "",
        ruc: datos.ruc || "",
        fecha: datos.fecha || new Date().toISOString().split("T")[0],
        monto: datos.monto ? String(datos.monto) : "",
        concepto: datos.concepto || "",
        urlArchivo: urlArchivo || "",
        estado: "Registrado",
      });

      setIsFormReady(true);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
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
      const payload: DocumentoContable = {
        id: `DOC-CONT-${Date.now()}`,
        tipoDocumento: formData.tipoDocumento,
        fecha: formData.fecha,
        monto: parseFloat(formData.monto) || 0,
        emisor: formData.emisor.trim(),
        ruc: formData.ruc.trim(),
        concepto: formData.concepto.trim(),
        urlArchivo: formData.urlArchivo,
        estado: formData.estado || "Registrado",
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

  // Filtrado y estadísticas
  const filtered = docs.filter((d) => {
    const matchesSearch =
      (d.emisor || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.ruc || "").includes(search) ||
      (d.concepto || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.tipoDocumento || "").toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "todos") return true;
    return (d.tipoDocumento || "").toLowerCase().includes(filterType.toLowerCase());
  });

  const totalMonto = docs.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-6 animate-in fade-in duration-300">
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
            <div className="text-xs sm:text-sm font-semibold text-slate-300">OpenAI Visión + OCR Activo</div>
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
            Sube fotos o PDFs de tus facturas. El sistema extraerá los datos automáticamente con IA.
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
              setFormData({
                tipoDocumento: "Factura",
                numeroDocumento: "",
                emisor: "",
                ruc: "",
                fecha: new Date().toISOString().split("T")[0],
                monto: "",
                concepto: "",
                urlArchivo: "",
                estado: "Registrado",
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
            placeholder="Buscar por emisor, RUC o concepto..."
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
          filtered.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {doc.tipoDocumento}
                </span>
                <span className="text-base font-black text-emerald-400">
                  S/ {Number(doc.monto).toFixed(2)}
                </span>
              </div>

              <div>
                <div className="font-bold text-white text-sm">{doc.emisor}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  RUC: {doc.ruc || "N/A"} {doc.fecha ? `• ${doc.fecha}` : ""}
                </div>
              </div>

              {doc.concepto && (
                <div className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50 line-clamp-2">
                  {doc.concepto}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                {doc.urlArchivo ? (
                  <a
                    href={doc.urlArchivo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver Factura
                  </a>
                ) : (
                  <span className="text-xs text-slate-500">Sin archivo adjunto</span>
                )}

                <button
                  onClick={() => doc.id && handleDelete(doc.id)}
                  className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/60 hover:bg-rose-500/20 rounded-xl transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vista de Tabla para Escritorio / Tablets */}
      <div className="hidden lg:block bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-bold">Documento</th>
                <th className="px-6 py-4 font-bold">Fecha</th>
                <th className="px-6 py-4 font-bold">Emisor / RUC</th>
                <th className="px-6 py-4 font-bold">Concepto</th>
                <th className="px-6 py-4 font-bold">Monto</th>
                <th className="px-6 py-4 font-bold">Archivo Adjunto</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                    Cargando documentos contables...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No se encontraron documentos contables.
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {doc.tipoDocumento}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-1">{doc.id?.slice(0, 15)}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{doc.fecha || "N/A"}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-200">{doc.emisor}</div>
                      <div className="text-xs text-slate-400 font-mono">RUC: {doc.ruc || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={doc.concepto || ""}>
                      {doc.concepto || "Sin concepto"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        S/ {Number(doc.monto).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {doc.urlArchivo ? (
                        <a
                          href={doc.urlArchivo}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-emerald-600 px-3 py-1 rounded-lg text-slate-300 hover:text-white transition-colors border border-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver Factura
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">Sin archivo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => doc.id && handleDelete(doc.id)}
                        className="p-2 bg-slate-800/50 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-colors"
                        title="Eliminar documento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: SUBIR Y LEER FACTURA CON INTELIGENCIA ARTIFICIAL    */}
      {/* ============================================================ */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Escanear Factura con Inteligencia Artificial
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sube una foto o PDF de la factura para extraer y guardar los datos automáticamente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!uploadingAi) setIsAiModalOpen(false);
                }}
                disabled={uploadingAi}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* ZONA DE CARGA DE ARCHIVO */}
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
                          Analizando estructura fiscal, RUC, emisor y montos con OpenAI Visión.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm sm:text-base font-bold text-white">
                          Arrastra tu factura aquí o selecciónala
                        </p>
                        <p className="text-xs text-slate-400">
                          Admite formatos PDF, JPG, PNG o WebP (facturas, boletas, recibos por honorarios)
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

              {/* ERROR ALERT */}
              {aiError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs sm:text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-rose-200">No se pudo procesar la factura</p>
                    <p>{aiError}</p>
                  </div>
                </div>
              )}

              {/* FORMULARIO DE REVISIÓN Y GUARDADO CON DATOS EXTRAÍDOS */}
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
                        Ver archivo cargado
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
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        RUC del Emisor
                      </label>
                      <input
                        type="text"
                        maxLength={11}
                        placeholder="ej: 20123456789"
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
                        Emisor / Proveedor (Razón Social)
                      </label>
                      <input
                        type="text"
                        placeholder="ej: COMERCIAL FERRETERA S.A.C."
                        value={formData.emisor}
                        onChange={(e) => setFormData({ ...formData, emisor: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Concepto / Detalle de la Compra
                      </label>
                      <textarea
                        rows={2}
                        placeholder="ej: Cemento, fierro corrugado de 1/2 y agregados"
                        value={formData.concepto}
                        onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
              {isFormReady ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormReady(false);
                      setAiError(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800/40 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
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
                  <label className="block text-xs font-bold text-slate-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
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
                  <label className="block text-xs font-bold text-slate-300 mb-1">Monto (S/.)</label>
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
                  <label className="block text-xs font-bold text-slate-300 mb-1">Concepto</label>
                  <textarea
                    rows={2}
                    placeholder="Detalle o descripción de los bienes"
                    value={formData.concepto}
                    onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-none"
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
