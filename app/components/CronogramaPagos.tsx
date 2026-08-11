/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef } from "react";
import { Beneficiario, Desembolso, Financiera } from "../types";
import {
  CreditCard,
  Building2,
  Plus,
  Trash2,
  Upload,
  X,
  Users,
  ChevronDown,
  ChevronUp,
  Coins,
  CheckCircle,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  FileSpreadsheet,
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────────────────
interface CronogramaPagosProps {
  beneficiarios: Beneficiario[];
}

// ─── Helper Components ────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: Desembolso["estado"] }) {
  const map = {
    Desembolsado: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: <CheckCircle className="w-3 h-3" /> },
    "En trámite": { color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: <Clock className="w-3 h-3" /> },
    Pendiente:    { color: "text-slate-400 bg-slate-800 border-slate-700", icon: <AlertCircle className="w-3 h-3" /> },
  };
  const s = (map as Record<string, { color: string; icon: React.ReactNode }>)[estado] || map.Pendiente;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.color}`}>
      {s.icon} {estado}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CronogramaPagos({ beneficiarios }: CronogramaPagosProps) {
  const [financieras, setFinancierasState] = useState<Financiera[]>([]);

  React.useEffect(() => {
    fetch("/api/financieras")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFinancierasState(data);
      })
      .catch(err => console.error("Error loading financieras", err));
  }, []);

  const setFinancieras = (value: React.SetStateAction<Financiera[]>) => {
    setFinancierasState(prev => {
      const nextState = typeof value === "function" ? value(prev) : value;
      fetch("/api/financieras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextState)
      }).catch(err => console.error("Error saving financieras", err));
      return nextState;
    });
  };

  // Selector de beneficiarios abierto para qué desembolso
  const [selectorOpen, setSelectorOpen] = useState<{ finId: string; desId: string } | null>(null);
  // Vista previa de comprobante
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTarget, setUploadTarget] = useState<{ finId: string; desId: string } | null>(null);

  // ─── Handlers Financieras ────────────────────────────────────────────────

  const handleAddFinanciera = () => {
    const id = `f${Date.now()}`;
    setFinancieras(prev => [
      ...prev,
      { id, nombre: "Nueva Financiera", expandida: true, desembolsos: [] },
    ]);
  };

  const handleDeleteFinanciera = (finId: string) => {
    setFinancieras(prev => prev.filter(f => f.id !== finId));
  };

  const handleUpdateFinanciera = (finId: string, nombre: string) => {
    setFinancieras(prev =>
      prev.map(f => f.id === finId ? { ...f, nombre } : f)
    );
  };

  const handleToggleExpand = (finId: string) => {
    setFinancieras(prev =>
      prev.map(f => f.id === finId ? { ...f, expandida: !f.expandida } : f)
    );
  };

  // ─── Handlers Desembolsos ─────────────────────────────────────────────────

  const handleAddDesembolso = (finId: string) => {
    const id = `d${Date.now()}`;
    setFinancieras(prev =>
      prev.map(f => {
        if (f.id !== finId) return f;
        return {
          ...f,
          desembolsos: [
            ...f.desembolsos,
            {
              id,
              hito: `Desembolso ${f.desembolsos.length + 1}`,
              fecha: new Date().toISOString().slice(0, 10),
              monto: 10000,
              estado: "Pendiente" as const,
              beneficiariosAsignados: [],
            },
          ],
        };
      })
    );
  };

  const handleUpdateDesembolso = (
    finId: string,
    desId: string,
    field: keyof Desembolso,
    value: unknown
  ) => {
    setFinancieras(prev =>
      prev.map(f => {
        if (f.id !== finId) return f;
        return {
          ...f,
          desembolsos: f.desembolsos.map(d =>
            d.id === desId ? { ...d, [field]: value } : d
          ),
        };
      })
    );
  };

  const handleDeleteDesembolso = (finId: string, desId: string) => {
    setFinancieras(prev =>
      prev.map(f => {
        if (f.id !== finId) return f;
        return { ...f, desembolsos: f.desembolsos.filter(d => d.id !== desId) };
      })
    );
  };

  // ─── Handlers Asignación Beneficiarios ───────────────────────────────────

  const toggleBeneficiario = (finId: string, desId: string, benId: string) => {
    setFinancieras(prev =>
      prev.map(f => {
        if (f.id !== finId) return f;
        return {
          ...f,
          desembolsos: f.desembolsos.map(d => {
            if (d.id !== desId) return d;
            const already = d.beneficiariosAsignados.includes(benId);
            return {
              ...d,
              beneficiariosAsignados: already
                ? d.beneficiariosAsignados.filter(id => id !== benId)
                : [...d.beneficiariosAsignados, benId],
            };
          }),
        };
      })
    );
  };

  // ─── Handlers Comprobante ─────────────────────────────────────────────────

  const handleUploadClick = (finId: string, desId: string) => {
    setUploadTarget({ finId, desId });
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    const url = URL.createObjectURL(file);
    handleUpdateDesembolso(uploadTarget.finId, uploadTarget.desId, "comprobante", url);
    // Reset file input so same file can be re-selected
    e.target.value = "";
    setUploadTarget(null);
  };

  const [isExportingPDF, setIsExportingPDF] = useState<string | null>(null);

  const handleExportFinancieraPDF = async (fin: Financiera) => {
    try {
      setIsExportingPDF(fin.id);
      const res = await fetch("/api/financieras/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ financiera: fin, beneficiarios })
      });
      if (!res.ok) throw new Error("Error generando PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_${fin.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
    } catch (err) {
      console.error(err);
      alert("No se pudo generar el PDF");
    } finally {
      setIsExportingPDF(null);
    }
  };
  // ─── Totals ───────────────────────────────────────────────────────────────

  const grandTotal = financieras.flatMap(f => f.desembolsos || []).reduce((s, d) => s + (d?.monto || 0), 0);
  const totalDesembolsado = financieras
    .flatMap(f => f.desembolsos || [])
    .filter(d => d && d.estado === "Desembolsado")
    .reduce((s, d) => s + (d?.monto || 0), 0);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Image Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-2xl w-full p-4" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-2 -right-2 p-1.5 bg-slate-800 border border-slate-700 rounded-full text-slate-300 hover:text-white z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={previewUrl} alt="Comprobante" className="w-full rounded-2xl border border-slate-700 shadow-2xl" />
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Cronograma de Pagos</h1>
            <p className="text-xs text-slate-400">
              Gestión de financieras, desembolsos y asignación de beneficiarios.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Totals pill */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 text-right">
            <span className="block text-[10px] text-slate-400 uppercase font-bold">Total recibido / pactado</span>
            <span className="font-black font-mono text-emerald-400">
              S/ {totalDesembolsado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-slate-500 font-mono text-xs">
              {" "}/ S/ {grandTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button
            onClick={handleAddFinanciera}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-sky-600/20"
          >
            <Plus className="w-4 h-4" /> Nueva Financiera
          </button>
        </div>
      </div>

      {/* ── Financieras ── */}
      {financieras.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 text-sm">
          Sin financieras aún. Haz clic en &ldquo;Nueva Financiera&rdquo; para comenzar.
        </div>
      )}

      {financieras.map(fin => {
        const totalFin = fin.desembolsos.reduce((s, d) => s + d.monto, 0);
        const desembFin = fin.desembolsos
          .filter(d => d.estado === "Desembolsado")
          .reduce((s, d) => s + d.monto, 0);

        return (
          <div key={fin.id} className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">

            {/* Financiera Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-800">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={fin.nombre}
                  onChange={e => handleUpdateFinanciera(fin.id, e.target.value)}
                  className="bg-transparent border-0 focus:outline-none text-base font-black text-white w-full truncate"
                  placeholder="Nombre de la financiera..."
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-right">
                  <span className="block text-[10px] text-slate-400 font-bold">RECIBIDO / TOTAL</span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    S/ {desembFin.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    {" "}/ {totalFin.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <button
                  onClick={() => handleExportFinancieraPDF(fin)}
                  disabled={isExportingPDF === fin.id}
                  className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center shrink-0"
                  title="Generar PDF"
                >
                  {isExportingPDF === fin.id ? <AlertCircle className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleAddDesembolso(fin.id)}
                  className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold text-xs px-3 py-1.5 rounded-xl transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Desembolso
                </button>
                <button
                  onClick={() => handleToggleExpand(fin.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title={fin.expandida ? "Contraer" : "Expandir"}
                >
                  {fin.expandida ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDeleteFinanciera(fin.id)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                  title="Eliminar financiera"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Desembolsos Table */}
            {fin.expandida && (
              <div className="p-5 space-y-4">
                {fin.desembolsos.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-6">Sin desembolsos. Agrega uno con el botón de arriba.</p>
                )}

                {fin.desembolsos.map(des => {
                  const isSelectorThis =
                    selectorOpen?.finId === fin.id && selectorOpen?.desId === des.id;
                  const benNames = des.beneficiariosAsignados
                    .map(id => beneficiarios.find(b => b.id === id)?.postulante || id)
                    .join(", ");

                  return (
                    <div
                      key={des.id}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition"
                    >
                      {/* Row 1: Hito, Fecha, Monto, Estado, Acciones */}
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                        {/* Hito */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Hito / Descripción</label>
                          <input
                            type="text"
                            value={des.hito}
                            onChange={e => handleUpdateDesembolso(fin.id, des.id, "hito", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none transition"
                          />
                        </div>
                        {/* Fecha */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Fecha</label>
                          <input
                            type="date"
                            value={des.fecha}
                            onChange={e => handleUpdateDesembolso(fin.id, des.id, "fecha", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none transition"
                          />
                        </div>
                        {/* Monto */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Monto (S/)</label>
                          <div className="relative">
                            <Coins className="w-3.5 h-3.5 text-emerald-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="number"
                              step="500"
                              value={des.monto}
                              onChange={e => handleUpdateDesembolso(fin.id, des.id, "monto", parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-8 pr-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none transition"
                            />
                          </div>
                        </div>
                        {/* Estado + acciones */}
                        <div className="flex items-end gap-2">
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Estado</label>
                            <select
                              value={des.estado}
                              onChange={e => handleUpdateDesembolso(fin.id, des.id, "estado", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none"
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="En trámite">En trámite</option>
                              <option value="Desembolsado">Desembolsado</option>
                            </select>
                          </div>
                          <button
                            onClick={() => handleDeleteDesembolso(fin.id, des.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition mb-0.5"
                            title="Eliminar desembolso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Row 2: Estado badge + Beneficiarios + Comprobante */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-800">
                        <EstadoBadge estado={des.estado} />

                        {/* Beneficiarios Asignados */}
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() =>
                              setSelectorOpen(
                                isSelectorThis ? null : { finId: fin.id, desId: des.id }
                              )
                            }
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-3 py-1.5 transition"
                          >
                            <Users className="w-3.5 h-3.5 text-sky-400" />
                            {des.beneficiariosAsignados.length === 0
                              ? "Asignar beneficiarios"
                              : `${des.beneficiariosAsignados.length} asignado(s)`}
                            {isSelectorThis ? (
                              <ChevronUp className="w-3.5 h-3.5 ml-1" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 ml-1" />
                            )}
                          </button>
                          {benNames && (
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs">{benNames}</p>
                          )}
                        </div>

                        {/* Comprobante */}
                        <div className="flex items-center gap-2 shrink-0">
                          {des.comprobante ? (
                            <>
                              <button
                                onClick={() => setPreviewUrl(des.comprobante!)}
                                className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 transition"
                              >
                                <ImageIcon className="w-3.5 h-3.5" /> Ver comprobante
                              </button>
                              <button
                                onClick={() => handleUpdateDesembolso(fin.id, des.id, "comprobante", undefined)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Eliminar comprobante"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleUploadClick(fin.id, des.id)}
                              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-3 py-1.5 transition"
                            >
                              <Upload className="w-3.5 h-3.5" /> Subir comprobante
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Beneficiary Checkbox Selector Dropdown */}
                      {isSelectorThis && (
                        <div className="mt-2 p-3 bg-slate-900 border border-slate-700 rounded-2xl space-y-1 max-h-48 overflow-y-auto">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                            Selecciona beneficiarios para este desembolso:
                          </p>
                          {beneficiarios.length === 0 && (
                            <p className="text-xs text-slate-500">No hay beneficiarios registrados aún.</p>
                          )}
                          {beneficiarios.map(b => {
                            const checked = des.beneficiariosAsignados.includes(b.id);
                            return (
                              <label
                                key={b.id}
                                className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition ${
                                  checked
                                    ? "bg-sky-600/10 border border-sky-500/30"
                                    : "hover:bg-slate-800 border border-transparent"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleBeneficiario(fin.id, des.id, b.id)}
                                  className="accent-sky-500 w-3.5 h-3.5 rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <span className="block text-xs font-bold text-white truncate">
                                    {b.postulante}
                                  </span>
                                  <span className="block text-[10px] text-slate-400 font-mono">
                                    {b.id} · {b.distrito}, {b.departamento}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
