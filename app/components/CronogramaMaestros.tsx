/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef } from "react";
import { Beneficiario } from "../types";
import {
  Hammer,
  Plus,
  Trash2,
  Upload,
  X,
  Users,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Phone,
  Coins,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import DniLookupModal from "./DniLookupModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PagoMaestro {
  id: string;
  descripcion: string;
  fecha: string;
  monto: number;
  estado: "Pendiente" | "Pagado parcial" | "Pagado";
  comprobante?: string;
}

interface Maestro {
  id: string;
  nombre: string;
  dni: string;
  celular: string;
  especialidad: string;
  montoPorVivienda: number;          // S/ por cada vivienda
  beneficiariosAsignados: string[];
  pagos: PagoMaestro[];
  expandido: boolean;
}

interface CronogramaMaestrosProps {
  beneficiarios: Beneficiario[];
}

// ─── Estado Badge ─────────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: PagoMaestro["estado"] }) {
  const map = {
    Pagado:           { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: <CheckCircle className="w-3 h-3" /> },
    "Pagado parcial": { color: "text-amber-400 bg-amber-500/10 border-amber-500/30",   icon: <Clock className="w-3 h-3" /> },
    Pendiente:        { color: "text-slate-400 bg-slate-800 border-slate-700",           icon: <AlertCircle className="w-3 h-3" /> },
  };
  const s = map[estado];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.color}`}>
      {s.icon} {estado}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CronogramaMaestros({ beneficiarios }: CronogramaMaestrosProps) {
  const [maestros, setMaestrosState] = useState<Maestro[]>([]);

  React.useEffect(() => {
    fetch("/api/maestros/cronograma")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMaestrosState(data);
      })
      .catch(err => console.error("Error loading cronogramaMaestros", err));
  }, []);

  const setMaestros = (value: React.SetStateAction<Maestro[]>) => {
    setMaestrosState(prev => {
      const nextState = typeof value === "function" ? value(prev) : value;
      fetch("/api/maestros/cronograma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextState)
      }).catch(err => console.error("Error saving cronogramaMaestros", err));
      return nextState;
    });
  };

  const [selectorOpen, setSelectorOpen] = useState<string | null>(null); // maestro id
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTarget, setUploadTarget] = useState<{ maestroId: string; pagoId: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDniModalOpen, setIsDniModalOpen] = useState(false);

  // ─── Handlers Maestros ────────────────────────────────────────────────────

  const handleAddMaestro = () => {
    setIsDniModalOpen(true);
  };

  const handleDeleteMaestro = async (id: string) => {
    // 1. Remove from local state + sync cronograma_maestros via POST
    setMaestros(prev => prev.filter(m => m.id !== id));

    // 2. Also delete from the main `maestros` table in Supabase
    try {
      await fetch(`/api/maestros/cronograma?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error eliminando maestro de la tabla principal:", err);
    }
  };


  const handleUpdateMaestro = <K extends keyof Maestro>(id: string, field: K, value: Maestro[K]) =>
    setMaestros(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));

  const handleToggle = (id: string) =>
    setMaestros(prev => prev.map(m => m.id === id ? { ...m, expandido: !m.expandido } : m));

  // ─── Handlers Pagos ───────────────────────────────────────────────────────

  const handleAddPago = (maestroId: string) => {
    const id = `p${Date.now()}`;
    setMaestros(prev =>
      prev.map(m => {
        if (m.id !== maestroId) return m;
        return {
          ...m,
          pagos: [
            ...m.pagos,
            {
              id,
              descripcion: `Pago ${m.pagos.length + 1}`,
              fecha: new Date().toISOString().slice(0, 10),
              monto: 2000,
              estado: "Pendiente" as const,
            },
          ],
        };
      })
    );
  };

  const handleUpdatePago = <K extends keyof PagoMaestro>(
    maestroId: string,
    pagoId: string,
    field: K,
    value: PagoMaestro[K]
  ) =>
    setMaestros(prev =>
      prev.map(m => {
        if (m.id !== maestroId) return m;
        return {
          ...m,
          pagos: m.pagos.map(p => p.id === pagoId ? { ...p, [field]: value } : p),
        };
      })
    );

  const handleDeletePago = (maestroId: string, pagoId: string) =>
    setMaestros(prev =>
      prev.map(m => {
        if (m.id !== maestroId) return m;
        return { ...m, pagos: m.pagos.filter(p => p.id !== pagoId) };
      })
    );

  // ─── Beneficiarios ────────────────────────────────────────────────────────

  const toggleBeneficiario = (maestroId: string, benId: string) =>
    setMaestros(prev =>
      prev.map(m => {
        if (m.id !== maestroId) return m;
        const already = m.beneficiariosAsignados.includes(benId);
        return {
          ...m,
          beneficiariosAsignados: already
            ? m.beneficiariosAsignados.filter(id => id !== benId)
            : [...m.beneficiariosAsignados, benId],
        };
      })
    );

  // ─── Comprobante ──────────────────────────────────────────────────────────

  const handleUploadClick = (maestroId: string, pagoId: string) => {
    setUploadTarget({ maestroId, pagoId });
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    const url = URL.createObjectURL(file);
    handleUpdatePago(uploadTarget.maestroId, uploadTarget.pagoId, "comprobante", url);
    e.target.value = "";
    setUploadTarget(null);
  };

  // ─── Export ───────────────────────────────────────────────────────────────

  const handleExport = () => {
    const rows: string[] = [
      ["MAESTRO", "DNI", "CELULAR", "ESPECIALIDAD", "MONTO/VIVIENDA", "N° VIVIENDAS", "CONTRATO TOTAL", "PAGO", "FECHA", "MONTO PAGO (S/)", "ESTADO", "BENEFICIARIOS"].join(";"),
    ];
    maestros.forEach(m => {
      const benNames = m.beneficiariosAsignados
        .map(id => beneficiarios.find(b => b.id === id)?.postulante || id)
        .join(" | ");
      const nViv = m.beneficiariosAsignados.length;
      const contratoTotal = m.montoPorVivienda * nViv;
      if (m.pagos.length === 0) {
        rows.push([`"${m.nombre}"`, m.dni, m.celular, `"${m.especialidad}"`, m.montoPorVivienda, nViv, contratoTotal, "-", "-", "0", "-", `"${benNames}"`].join(";"));
      } else {
        m.pagos.forEach(p => {
          rows.push([`"${m.nombre}"`, m.dni, m.celular, `"${m.especialidad}"`, m.montoPorVivienda, nViv, contratoTotal, `"${p.descripcion}"`, p.fecha, p.monto, p.estado, `"${benNames}"`].join(";"));
        });
      }
    });
    const csv = "\uFEFF" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MaestrosObra_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // ─── Totals ───────────────────────────────────────────────────────────────

  const grandTotal = maestros.flatMap(m => m.pagos).reduce((s, p) => s + p.monto, 0);
  const totalPagado = maestros
    .flatMap(m => m.pagos)
    .filter(p => p.estado === "Pagado")
    .reduce((s, p) => s + p.monto, 0);
  const handleDownloadPDF = (maestro: Maestro) => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      alert("Por favor permite ventanas emergentes para descargar el PDF.");
      return;
    }

    const nViviendas = maestro.beneficiariosAsignados.length || 0;
    const contratoTotal = maestro.montoPorVivienda * nViviendas;
    const pagado = maestro.pagos
      .filter(p => p.estado === "Pagado" || p.estado === "Pagado parcial")
      .reduce((acc, curr) => acc + curr.monto, 0);

    const pagosHtml = maestro.pagos.map((p, i) => `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${p.descripcion}</td>
        <td style="text-align:center">${p.fecha}</td>
        <td style="text-align:right">S/ ${p.monto.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</td>
        <td style="text-align:center"><span class="badge badge-${p.estado.replace(" ", "")}">${p.estado}</span></td>
      </tr>
    `).join("");

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Cronograma - ${maestro.nombre}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; font-size: 11px; margin: 15mm; }
    
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fff; padding: 20px 24px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header h1 { font-size: 17px; font-weight: 900; margin-bottom: 2px; }
    .header p { font-size: 10px; opacity: 0.8; }
    
    .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; background: #f8fafc; }
    .info-box { display: flex; flex-direction: column; }
    .info-box span { font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
    .info-box strong { font-size: 11px; color: #0f172a; }

    table { border-collapse: collapse; margin-bottom: 20px; width: 100%; }
    th { background: #0f172a; color: white; padding: 8px; font-size: 10px; text-transform: uppercase; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
    
    .totals { width: 300px; margin-left: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .totals-row:last-child { background: #f8fafc; border-bottom: none; font-weight: bold; }

    .badge { font-size: 9px; font-weight: bold; padding: 3px 6px; border-radius: 4px; border: 1px solid; }
    .badge-Pagado { background: rgba(34,197,94,0.15); color: #166534; border-color: rgba(34,197,94,0.4); }
    .badge-Pagadoparcial { background: rgba(245,158,11,0.15); color: #b45309; border-color: rgba(245,158,11,0.4); }
    .badge-Pendiente { background: rgba(100,116,139,0.15); color: #475569; border-color: rgba(100,116,139,0.4); }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>👷 Cronograma de Maestro de Obra</h1>
      <p>Constructora Maza Quiroz - Sistema Techo Propio</p>
    </div>
    <div style="text-align:right">
      <span style="font-size:9px;opacity:0.6">Fecha de Emisión: ${new Date().toLocaleDateString("es-PE")}</span>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box"><span>Nombre</span><strong>${maestro.nombre}</strong></div>
    <div class="info-box"><span>DNI</span><strong>${maestro.dni || "—"}</strong></div>
    <div class="info-box"><span>Celular</span><strong>${maestro.celular || "—"}</strong></div>
    <div class="info-box"><span>Especialidad</span><strong>${maestro.especialidad || "—"}</strong></div>
  </div>

  <h2 style="font-size:12px; margin-bottom:10px; color:#0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">Detalle de Avances y Pagos</h2>
  <table>
    <thead>
      <tr>
        <th style="width:30px">N°</th>
        <th style="text-align:left">Descripción del Avance</th>
        <th style="width:100px">Fecha Est.</th>
        <th style="width:100px; text-align:right">Monto</th>
        <th style="width:100px">Estado</th>
      </tr>
    </thead>
    <tbody>
      ${pagosHtml || `<tr><td colspan="5" style="text-align:center; padding:15px; color:#64748b;">No hay pagos registrados</td></tr>`}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span style="color:#64748b; font-size:10px; font-weight:bold;">CONTRATO TOTAL (${nViviendas} viv.)</span>
      <span>S/ ${contratoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="totals-row">
      <span style="color:#64748b; font-size:10px; font-weight:bold;">TOTAL PAGADO</span>
      <span style="color:#166534">S/ ${pagado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="totals-row" style="background:#0f172a; color:white;">
      <span style="font-size:10px;">SALDO PENDIENTE</span>
      <span>S/ ${(contratoTotal - pagado).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
    </div>
  </div>

  <div style="margin-top: 50px; text-align:center;">
    <div style="width:200px; border-top:1px solid #64748b; margin:0 auto; padding-top:5px; font-size:10px; color:#64748b;">
      Firma de Maestro de Obra
    </div>
  </div>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Image preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-2xl w-full p-4" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewUrl(null)} className="absolute -top-2 -right-2 p-1.5 bg-slate-800 border border-slate-700 rounded-full text-slate-300 hover:text-white z-10">
              <X className="w-4 h-4" />
            </button>
            <img src={previewUrl} alt="Comprobante" className="w-full rounded-2xl border border-slate-700 shadow-2xl" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-md">
            <Hammer className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Maestros de Obra</h1>
            <p className="text-xs text-slate-400">Planificación de pagos, asignación de beneficiarios y comprobantes.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 text-right">
            <span className="block text-[10px] text-slate-400 uppercase font-bold">Pagado / Total</span>
            <span className="font-black font-mono text-amber-400">
              S/ {totalPagado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-slate-500 font-mono text-xs">
              {" "}/ S/ {grandTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button onClick={handleAddMaestro} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-sky-600/20 active:scale-95 transition-transform duration-150">
            <Plus className="w-4 h-4" />
            Consultar y Agregar Maestro
          </button>
        </div>
      </div>

      {maestros.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 text-sm">
          Sin maestros aún. Haz clic en &ldquo;Nuevo Maestro&rdquo; para comenzar.
        </div>
      )}

      {/* Maestros List */}
      {maestros.map(m => {
        const totalM = m.pagos.reduce((s, p) => s + p.monto, 0);
        const pagadoM = m.pagos.filter(p => p.estado === "Pagado").reduce((s, p) => s + p.monto, 0);
        const nViviendas = m.beneficiariosAsignados.length;
        const contratoTotal = m.montoPorVivienda * nViviendas;
        const benNames = m.beneficiariosAsignados
          .map(id => beneficiarios.find(b => b.id === id)?.postulante || id)
          .join(", ");

        return (
          <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">

            {/* Maestro Header */}
            <div className="p-5 border-b border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Name & info */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1">
                  <div>
                    <label className="text-[10px] font-bold text-amber-400 uppercase block mb-1">Nombre</label>
                    <input
                      type="text"
                      value={m.nombre}
                      onChange={e => handleUpdateMaestro(m.id, "nombre", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">DNI</label>
                    <input
                      type="text"
                      maxLength={8}
                      value={m.dni}
                      onChange={e => handleUpdateMaestro(m.id, "dni", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none transition"
                      placeholder="12345678"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Celular
                    </label>
                    <input
                      type="text"
                      value={m.celular}
                      onChange={e => handleUpdateMaestro(m.id, "celular", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none transition"
                      placeholder="9XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Especialidad</label>
                    <input
                      type="text"
                      value={m.especialidad}
                      onChange={e => handleUpdateMaestro(m.id, "especialidad", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-right">
                    <span className="block text-[10px] text-slate-400 font-bold">PAGADO / TOTAL</span>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      S/ {pagadoM.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {" "}/ {totalM.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <button onClick={() => handleAddPago(m.id)} className="flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-400 font-bold text-xs px-3 py-1.5 rounded-xl transition active:scale-95 transition-transform duration-150">
                    <Plus className="w-3.5 h-3.5" /> Pago
                  </button>
                  <button onClick={() => handleDownloadPDF(m)} className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold text-xs px-3 py-1.5 rounded-xl transition active:scale-95 transition-transform duration-150" title="Exportar Cronograma PDF">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button onClick={() => handleToggle(m.id)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition active:scale-95 transition-transform duration-150">
                    {m.expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDeleteMaestro(m.id)} className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition active:scale-95 transition-transform duration-150" title="Eliminar maestro">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

                {/* ── Monto Contrato Row ── */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/60">
                  {/* Monto por Vivienda input */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-amber-400 uppercase whitespace-nowrap">
                      Monto por Vivienda (S/)
                    </label>
                    <div className="relative">
                      <Coins className="w-3.5 h-3.5 text-amber-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        step="100"
                        min="0"
                        value={m.montoPorVivienda}
                        onChange={e => handleUpdateMaestro(m.id, "montoPorVivienda", parseFloat(e.target.value) || 0)}
                        className="bg-slate-950 border border-amber-500/40 focus:border-amber-400 rounded-xl pl-8 pr-3 py-1.5 text-xs text-amber-300 font-mono font-bold focus:outline-none transition w-36"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* × beneficiarios = total */}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <span className="text-slate-600">×</span>
                    <span className="px-2 py-1 bg-slate-800 rounded-lg font-mono text-white">
                      {nViviendas} vivienda{nViviendas !== 1 ? "s" : ""}
                    </span>
                    <span className="text-slate-600">=</span>
                  </div>

                  {/* Contrato Total pill */}
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl border font-mono font-black text-sm ${
                    contratoTotal > 0
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-slate-800 border-slate-700 text-slate-500"
                  }`}>
                    <Coins className="w-3.5 h-3.5" />
                    <span>S/ {contratoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
                    <span className="text-[10px] font-normal text-slate-400 ml-1">CONTRATO TOTAL</span>
                  </div>
                </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => setSelectorOpen(selectorOpen === m.id ? null : m.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-3 py-1.5 transition active:scale-95 transition-transform duration-150"
                >
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  {m.beneficiariosAsignados.length === 0 ? "Asignar beneficiarios" : `${m.beneficiariosAsignados.length} asignado(s)`}
                  {selectorOpen === m.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {benNames && <span className="text-[10px] text-slate-500">{benNames}</span>}
              </div>

              {selectorOpen === m.id && (
                <div className="p-3 bg-slate-950 border border-slate-700 rounded-2xl space-y-1 max-h-44 overflow-y-auto">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Beneficiarios asignados a este maestro:</p>
                  {beneficiarios.length === 0 && <p className="text-xs text-slate-500">No hay beneficiarios registrados.</p>}
                  {beneficiarios.map(b => {
                    const checked = m.beneficiariosAsignados.includes(b.id);
                    return (
                      <label key={b.id} className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition ${checked ? "bg-sky-600/10 border border-sky-500/30" : "hover:bg-slate-800 border border-transparent"}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleBeneficiario(m.id, b.id)} className="accent-sky-500 w-3.5 h-3.5 rounded" />
                        <div className="flex-1 min-w-0">
                          <span className="block text-xs font-bold text-white truncate">{b.postulante}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">{b.id} · {b.distrito}, {b.departamento}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagos */}
            {m.expandido && (
              <div className="p-5 space-y-3">
                {m.pagos.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">Sin pagos registrados aún.</p>
                )}
                {m.pagos.map(p => (
                  <div key={p.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Descripción</label>
                        <input
                          type="text"
                          value={p.descripcion}
                          onChange={e => handleUpdatePago(m.id, p.id, "descripcion", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Fecha</label>
                        <input
                          type="date"
                          value={p.fecha}
                          onChange={e => handleUpdatePago(m.id, p.id, "fecha", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Monto (S/)</label>
                        <div className="relative">
                          <Coins className="w-3.5 h-3.5 text-amber-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="number"
                            step="100"
                            value={p.monto}
                            onChange={e => handleUpdatePago(m.id, p.id, "monto", parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-8 pr-3 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none transition"
                          />
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Estado</label>
                          <select
                            value={p.estado}
                            onChange={e => handleUpdatePago(m.id, p.id, "estado", e.target.value as PagoMaestro["estado"])}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Pagado parcial">Pagado parcial</option>
                            <option value="Pagado">Pagado</option>
                          </select>
                        </div>
                        <button onClick={() => handleDeletePago(m.id, p.id)} className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition mb-0.5 active:scale-95 transition-transform duration-150" title="Eliminar pago">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Estado + comprobante */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-800">
                      <EstadoBadge estado={p.estado} />
                      <div className="flex items-center gap-2 ml-auto">
                        {p.comprobante ? (
                          <>
                            <button onClick={() => setPreviewUrl(p.comprobante!)} className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 transition">
                              <ImageIcon className="w-3.5 h-3.5" /> Ver comprobante
                            </button>
                            <button onClick={() => handleUpdatePago(m.id, p.id, "comprobante", undefined)} className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition" title="Eliminar comprobante">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleUploadClick(m.id, p.id)} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-3 py-1.5 transition active:scale-95 transition-transform duration-150">
                            <Upload className="w-3.5 h-3.5" /> Subir comprobante
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <DniLookupModal
        isOpen={isDniModalOpen}
        onClose={() => setIsDniModalOpen(false)}
        title="Consultar DNI - Maestro de Obra"
        confirmText="SÍ, REGISTRAR MAESTRO DE OBRA"
        hidePersonalData={false}
        onConfirm={(data) => {
          const duplicate = maestros.find(m => m.dni === data.dni);
          if (duplicate) {
            alert("Este DNI ya se encuentra registrado como maestro de obra.");
            return;
          }
          
          const id = `maestro_${Date.now()}`;
          setMaestros(prev => [
            {
              id,
              // STRICT REQUIREMENT: Only save Nombres and DNI, discard surnames and birthdate
              nombre: data.nombres,
              dni: data.dni,
              celular: "",
              especialidad: "Construcción Civil",
              montoPorVivienda: 0,
              beneficiariosAsignados: [],
              pagos: [],
              expandido: true,
            },
            ...prev
          ]);
          setIsDniModalOpen(false);
        }}
      />
    </div>
  );
}
