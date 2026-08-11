/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, Download, Trash2, Plus, FileCode, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface PlanoItem {
  id: string;
  title: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  createdAt?: string;
}

const DEFAULT_PLANOS: PlanoItem[] = [
  { id: "PLN-DEFAULT-1", title: "Arquitectura y Distribución (35m²)", type: "DWG (AutoCAD)", fileName: "", fileUrl: "", fileSize: "" },
  { id: "PLN-DEFAULT-2", title: "Cimentación, Columnas y Estructuras", type: "DWG (AutoCAD)", fileName: "", fileUrl: "", fileSize: "" },
  { id: "PLN-DEFAULT-3", title: "Instalaciones Sanitarias (Agua y Desagüe)", type: "DWG (AutoCAD)", fileName: "", fileUrl: "", fileSize: "" },
  { id: "PLN-DEFAULT-4", title: "Instalaciones Eléctricas (Alumbrado y Tomacorrientes)", type: "DWG (AutoCAD)", fileName: "", fileUrl: "", fileSize: "" },
];

interface PlanosIngenieriaProps {
  planos: PlanoItem[];
  onSave: (planos: PlanoItem[]) => void;
}

export default function PlanosIngenieria({ planos: initialPlanos, onSave }: PlanosIngenieriaProps) {
  const [planos, setPlanos] = useState<PlanoItem[]>(
    initialPlanos && initialPlanos.length > 0 ? initialPlanos : DEFAULT_PLANOS
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Sync state if props change from outside (e.g. switching beneficiary)
  useEffect(() => {
    if (initialPlanos && initialPlanos.length > 0) {
      setPlanos(initialPlanos);
    } else {
      setPlanos(DEFAULT_PLANOS);
    }
  }, [initialPlanos]);

  // Auto-dismiss toasts
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleUploadClick = (planoId: string) => {
    fileInputRefs.current[planoId]?.click();
  };

  const handleFileChange = async (planoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(planoId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subfolder", "planos");

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Error subiendo archivo");

      const uploadData = await uploadRes.json();

      const updatedPlanos = planos.map((p) =>
        p.id === planoId
          ? { ...p, fileName: uploadData.fileName, fileUrl: uploadData.url, fileSize: formatFileSize(uploadData.size) }
          : p
      );
      setPlanos(updatedPlanos);
      onSave(updatedPlanos);
      setToast({ msg: `✅ Archivo "${uploadData.fileName}" subido correctamente.`, type: "success" });
    } catch (err) {
      console.error("Upload error:", err);
      setToast({ msg: "❌ Error al subir el archivo.", type: "error" });
    } finally {
      setUploading(null);
      // Reset the input value so the same file can be re-selected
      if (fileInputRefs.current[planoId]) {
        fileInputRefs.current[planoId]!.value = "";
      }
    }
  };

  const handleDownload = (plano: PlanoItem) => {
    if (!plano.fileUrl) {
      setToast({ msg: "⚠️ No hay archivo subido para descargar.", type: "error" });
      return;
    }
    const link = document.createElement("a");
    link.href = plano.fileUrl;
    link.download = plano.fileName || "archivo";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (planoId: string) => {
    try {
      const updatedPlanos = planos.filter((p) => p.id !== planoId);
      setPlanos(updatedPlanos);
      onSave(updatedPlanos);
      setToast({ msg: "🗑️ Plano eliminado.", type: "success" });
    } catch (err) {
      console.error("Delete error:", err);
      setToast({ msg: "❌ Error eliminando plano.", type: "error" });
    }
  };

  const handleAddPlano = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!newTitle) return;
    try {
      const newPlano = {
        id: `PLN-${Date.now()}`,
        title: newTitle,
        type: "DWG (AutoCAD)",
        fileName: "",
        fileUrl: "",
        fileSize: "",
        createdAt: new Date().toISOString(),
      };
      const updatedPlanos = [...planos, newPlano];
      setPlanos(updatedPlanos);
      onSave(updatedPlanos);
      
      setNewTitle("");
      setShowAddForm(false);
      setToast({ msg: "✨ Nuevo plano creado.", type: "success" });
    } catch (err) {
      console.error("Add error:", err);
      setToast({ msg: "❌ Error al agregar plano.", type: "error" });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Cargando planos...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl border transition-all duration-300 animate-in slide-in-from-right ${
            toast.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10"
              : "bg-rose-950/90 text-rose-300 border-rose-500/30 shadow-rose-500/10"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" /> Gestor de Planos y Archivos DWG
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Añadir Nuevo Plano
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Sube, descarga y gestiona tus planos técnicos AutoCAD (.DWG) y cualquier archivo de ingeniería del proyecto.
        </p>

        {/* Add New Plano Form */}
        {showAddForm && (
          <div className="flex gap-3 items-end mb-4 p-4 rounded-xl bg-slate-950/60 border border-indigo-500/20 animate-in fade-in duration-200">
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-indigo-400 block mb-1 uppercase tracking-wider">
                Nombre del Plano
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej. Instalaciones de Gas Natural"
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
                onKeyDown={(e) => e.key === "Enter" && handleAddPlano()}
              />
            </div>
            <button
              onClick={handleAddPlano}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
            >
              <Plus className="w-4 h-4" /> Agregar
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewTitle(""); }}
              className="text-xs text-slate-500 hover:text-slate-300 px-3 py-2.5 transition"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Planos List */}
        <div className="space-y-3">
          {planos.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500">
              No hay planos registrados. Haz clic en &quot;Añadir Nuevo Plano&quot; para comenzar.
            </div>
          )}

          {planos.map((plano) => (
            <div
              key={plano.id}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-indigo-500/30 transition group"
            >
              {/* Info */}
              <div className="space-y-1 flex-1 min-w-0 mr-4">
                <span className="font-bold text-sm text-white block group-hover:text-indigo-400 transition truncate">
                  {plano.title}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                  <span>{plano.type}</span>
                  {plano.fileName && (
                    <>
                      <span className="text-slate-700">•</span>
                      <span className="text-indigo-400/80 normal-case">{plano.fileName}</span>
                    </>
                  )}
                  {plano.fileSize && (
                    <>
                      <span className="text-slate-700">•</span>
                      <span>{plano.fileSize}</span>
                    </>
                  )}
                  {!plano.fileUrl && (
                    <span className="text-amber-500/70 normal-case">Sin archivo</span>
                  )}
                  {plano.fileUrl && (
                    <span className="flex items-center gap-1 text-emerald-500/70 normal-case">
                      <CheckCircle2 className="w-3 h-3" /> Archivo subido
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={(el) => { fileInputRefs.current[plano.id] = el; }}
                  onChange={(e) => handleFileChange(plano.id, e)}
                  className="hidden"
                  accept=".dwg,.dxf,.pdf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.svg"
                />

                {/* Upload Button */}
                <button
                  onClick={() => handleUploadClick(plano.id)}
                  disabled={uploading === plano.id}
                  className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-lg border transition duration-150 ${
                    uploading === plano.id
                      ? "bg-indigo-900/30 text-indigo-300 border-indigo-800 cursor-wait"
                      : "bg-slate-900 hover:bg-indigo-600 text-indigo-400 hover:text-white border-slate-800 hover:border-indigo-500"
                  }`}
                >
                  {uploading === plano.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  {uploading === plano.id ? "Subiendo..." : "Subir"}
                </button>

                {/* Download Button */}
                <button
                  onClick={() => handleDownload(plano)}
                  className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-lg border transition duration-150 ${
                    plano.fileUrl
                      ? "bg-slate-900 hover:bg-emerald-600 text-emerald-400 hover:text-white border-slate-800 hover:border-emerald-500"
                      : "bg-slate-900/50 text-slate-600 border-slate-800/50 cursor-not-allowed"
                  }`}
                >
                  <Download className="w-3.5 h-3.5" /> Descargar
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(plano.id)}
                  className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-2 rounded-lg border bg-slate-900 hover:bg-rose-600 text-slate-500 hover:text-white border-slate-800 hover:border-rose-500 transition duration-150"
                  title="Eliminar plano"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
