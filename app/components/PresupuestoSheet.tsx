/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Dimensiones, Insumo, PartidaAPU } from "../types";
import { TrendingUp, Trees, Coins, Edit3, ShieldCheck, Plus, Trash2, FileText, Download, Loader2 } from "lucide-react";

interface CustomBudgetItem {
  id: string;
  item: string;
  descripcion: string;
  unidad: string;
  metrado: number;
  unitario: number;
  parcial: number;
}

interface PresupuestoSheetProps {
  dimensiones: Dimensiones;
  insumos: Insumo[];
  partidasApu: PartidaAPU[];
}

export default function PresupuestoSheet({ dimensiones, insumos, partidasApu }: PresupuestoSheetProps) {
  const { largo, ancho, altura, habitaciones } = dimensiones;

  // State for editable Costo Directo, Gastos Generales, Utilidad and Selva Exemption
  const [isSelvaExempt, setIsSelvaExempt] = useState<boolean>(true); // Default true for Selva (Tarapoto / San Martín)
  const [customCostoDirecto, setCustomCostoDirecto] = useState<number | null>(null);
  const [gastosPct, setGastosPct] = useState<number>(10);
  const [utilidadPct, setUtilidadPct] = useState<number>(5);

  // Custom Items added manually or by bot
  const [customItems, setCustomItems] = useState<CustomBudgetItem[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Form State for Adding New Item
  const [newItemCode, setNewItemCode] = useState<string>("");
  const [newItemDesc, setNewItemDesc] = useState<string>("");
  const [newItemUnd, setNewItemUnd] = useState<string>("UND");
  const [newItemQty, setNewItemQty] = useState<string>("");
  const [newItemPrice, setNewItemPrice] = useState<string>("");

  // Re-cálculo de Metrados
  const areaPlanta = largo * ancho;
  const longTotalMuros = (2 * (largo + ancho)) + 
    (habitaciones >= 1 ? ancho : 0) + 
    (habitaciones >= 2 ? (largo * 0.5) : 0) + 
    (ancho * 0.6) + (largo * 0.25);

  const getMetrado = (item: string): number => {
    switch (item) {
      case "01.01": case "01.02": case "06.01": return areaPlanta;
      case "02.01": return longTotalMuros * 0.40 * 1.00;
      case "03.01": return longTotalMuros * 0.40 * 0.80;
      case "04.01": return Math.max(0, (longTotalMuros * altura) - 6.50);
      case "05.01": return 12 * 0.15 * 0.25 * altura;
      case "07.01": case "07.02": return Math.max(0, (longTotalMuros * altura) - 6.50) * 2;
      case "08.01": return 1.00;
      default: return 0;
    }
  };

  const getCostoUnitario = (p: PartidaAPU): number => {
    let total = 0;
    const calcSection = (details: any[]) => {
      details.forEach(d => {
        const ins = insumos.find(i => i.id === d.insumoId);
        if (ins) total += d.coeficiente * ins.precioUnitario;
      });
    };
    calcSection(p.manoDeObra);
    calcSection(p.materiales);
    calcSection(p.equipos);
    return total;
  };

  const basePresupuestoItems = partidasApu.map(p => {
    const metrado = getMetrado(p.item);
    const unitario = getCostoUnitario(p);
    const parcial = metrado * unitario;
    return { ...p, metrado, unitario, parcial };
  });

  const autoCostoDirectoBase = basePresupuestoItems.reduce((acc, curr) => acc + curr.parcial, 0);

  // Add custom items to total autoCostoDirecto
  const customItemsTotal = customItems.reduce((acc, curr) => acc + curr.parcial, 0);
  const autoCostoDirecto = autoCostoDirectoBase + customItemsTotal;

  const costoDirecto = customCostoDirecto !== null ? customCostoDirecto : autoCostoDirecto;
  const gastosGenerales = costoDirecto * (gastosPct / 100);
  const utilidad = costoDirecto * (utilidadPct / 100);
  const subTotalSinIgv = costoDirecto + gastosGenerales + utilidad;

  // IGV Calculation (0% for Ley de la Selva N° 27037 vs 18% General)
  const igvPct = isSelvaExempt ? 0 : 18;
  const igvMonto = subTotalSinIgv * (igvPct / 100);
  const presupuestoTotal = subTotalSinIgv + igvMonto;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemDesc.trim() || !newItemQty || !newItemPrice) return;

    const qty = parseFloat(newItemQty) || 0;
    const price = parseFloat(newItemPrice) || 0;
    const itemCode = newItemCode.trim() || `09.${String(customItems.length + 1).padStart(2, "0")}`;

    const newItem: CustomBudgetItem = {
      id: `ITEM-${Date.now()}`,
      item: itemCode,
      descripcion: newItemDesc.trim(),
      unidad: newItemUnd,
      metrado: qty,
      unitario: price,
      parcial: qty * price
    };

    setCustomItems([...customItems, newItem]);
    setNewItemCode("");
    setNewItemDesc("");
    setNewItemQty("");
    setNewItemPrice("");
  };

  const handleRemoveCustomItem = (id: string) => {
    setCustomItems(customItems.filter(item => item.id !== id));
  };

  const handleExportToPDF = () => {
    setIsExporting(true);
    
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      alert("Por favor permite ventanas emergentes para descargar el PDF.");
      setIsExporting(false);
      return;
    }

    const allItems = [
      ...basePresupuestoItems.map(item => ({ ...item, isCustom: false })),
      ...customItems.map(item => ({ ...item, isCustom: true })),
    ];

    const fmt = (n: number) => n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const itemsHtml = allItems.map((item, idx) => `
      <tr class="${idx % 2 === 0 ? '' : 'alt-row'}">
        <td class="code-col">${item.item}</td>
        <td class="desc-col">${item.descripcion}${item.isCustom ? ' <span class="custom-badge">Personalizado</span>' : ''}</td>
        <td class="center-col">${item.unidad}</td>
        <td class="num-col">${item.metrado.toFixed(2)}</td>
        <td class="num-col">${item.unitario.toFixed(2)}</td>
        <td class="num-col total-col">${item.parcial.toFixed(2)}</td>
      </tr>
    `).join("");

    const printContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Presupuesto de Obra</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 portrait; margin: 15mm 12mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; font-size: 10px; }
    
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fff; padding: 18px 22px; border-radius: 8px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header-title h1 { font-size: 16px; font-weight: 900; margin-bottom: 2px; letter-spacing: -0.3px; }
    .header-title p { font-size: 9px; opacity: 0.7; }
    .header-right { text-align: right; display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
    .selva-badge { background: rgba(34,197,94,0.2); border: 1px solid rgba(34,197,94,0.4); color: #86efac; font-size: 8px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
    thead th { background: #0f172a; color: #e2e8f0; padding: 7px 8px; font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; border-bottom: 2px solid #334155; text-align: left; }
    tbody td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
    .alt-row { background: #f8fafc; }
    .code-col { font-weight: 700; color: #3b82f6; font-family: monospace; width: 55px; }
    .desc-col { font-weight: 600; color: #1e293b; }
    .center-col { text-align: center; color: #64748b; width: 50px; }
    .num-col { text-align: right; font-family: monospace; font-weight: 600; color: #334155; width: 85px; }
    .total-col { color: #059669; font-weight: 700; text-align: right; }
    .custom-badge { background: rgba(56,189,248,0.15); color: #0284c7; font-size: 7px; font-weight: 700; padding: 1px 4px; border-radius: 3px; margin-left: 4px; }
    
    .summary-box { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 14px; }
    .summary-row { display: flex; justify-content: space-between; padding: 7px 14px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
    .summary-row:last-child { border-bottom: none; }
    .summary-row.highlight { background: #f0fdf4; }
    .summary-row.total { background: #0f172a; color: #fff; font-size: 12px; font-weight: 900; }
    .summary-row .label { color: #475569; font-weight: 600; }
    .summary-row .value { font-family: monospace; font-weight: 700; color: #1e293b; }
    .summary-row.total .value { color: #34d399; font-size: 13px; }
    
    .footer { margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; align-items: center; }
    .footer-left { font-size: 8px; color: #94a3b8; }
    
    .watermark { position: fixed; bottom: 30mm; left: 50%; transform: translateX(-50%); font-size: 55px; color: rgba(15,23,42,0.03); font-weight: 900; white-space: nowrap; pointer-events: none; z-index: 0; }
  </style>
</head>
<body>
  <div class="watermark">TECHO PROPIO</div>
  
  <div class="header">
    <div class="header-title">
      <h1>📊 Presupuesto Detallado de Obra</h1>
      <p>Programa Construcción en Sitio Propio (CSP) — Constructora Maza Quiroz</p>
    </div>
    <div class="header-right">
      ${isSelvaExempt ? '<div class="selva-badge">🌿 Ley Selva 27037 — IGV 0%</div>' : ''}
      <span style="font-size:8px;opacity:0.6">Emitido: ${new Date().toLocaleDateString("es-PE")}</span>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th style="text-align:left">Item</th>
        <th style="text-align:left">Descripción de Partida / Producto</th>
        <th style="text-align:center">Und</th>
        <th style="text-align:right">Metrado</th>
        <th style="text-align:right">P. Unit (S/)</th>
        <th style="text-align:right">Parcial (S/)</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="summary-box" style="page-break-inside: avoid;">
    <div class="summary-row">
      <span class="label">Costo Directo</span>
      <span class="value">S/ ${fmt(costoDirecto)}</span>
    </div>
    <div class="summary-row">
      <span class="label">Gastos Generales (${gastosPct}%)</span>
      <span class="value">S/ ${fmt(gastosGenerales)}</span>
    </div>
    <div class="summary-row">
      <span class="label">Utilidad (${utilidadPct}%)</span>
      <span class="value">S/ ${fmt(utilidad)}</span>
    </div>
    <div class="summary-row highlight">
      <span class="label">SUBTOTAL PRESUPUESTO BASE</span>
      <span class="value" style="color: #059669;">S/ ${fmt(subTotalSinIgv)}</span>
    </div>
    <div class="summary-row">
      <span class="label">IGV (${igvPct}%) ${isSelvaExempt ? '<span style="color:#22c55e;font-size:8px;padding-left:4px">(Exonerado)</span>' : ''}</span>
      <span class="value">S/ ${fmt(igvMonto)}</span>
    </div>
    <div class="summary-row total">
      <span class="label">PRESUPUESTO TOTAL (Referencial)</span>
      <span class="value">S/ ${fmt(presupuestoTotal)}</span>
    </div>
  </div>

  <div class="footer">
    <div class="footer-left">Sistema Techo Propio — Constructora Maza Quiroz &nbsp;|&nbsp; Generado el ${new Date().toLocaleString("es-PE")}</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(() => {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

    printWindow.document.write(printContent);
    printWindow.document.close();
    setIsExporting(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Selva Exemption Banner & Editable Bar */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Régimen Tributario & Exoneración de IGV (Ley N° 27037)
              </h2>
              <p className="text-xs text-slate-400">
                Aplica exoneración del 18% IGV para proyectos ejecutados en la Amazonía / Selva peruana.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSelvaExempt(!isSelvaExempt)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition duration-200 border ${
                isSelvaExempt
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              {isSelvaExempt ? "✓ Exonerado Ley de la Selva (0% IGV)" : "Aplica IGV General (18%)"}
            </button>
          </div>
        </div>

        {/* Editable Inputs for Custom Costo Directo & Overheads */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="text-xs font-bold text-sky-400 flex items-center gap-1 mb-1">
              <Edit3 className="w-3.5 h-3.5" /> Costo Vivienda Sin IGV (S/)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder={`Autocalculado: ${autoCostoDirecto.toFixed(2)}`}
              value={customCostoDirecto !== null ? customCostoDirecto : ""}
              onChange={(e) => setCustomCostoDirecto(e.target.value === "" ? null : parseFloat(e.target.value))}
              className="w-full bg-slate-950 border border-sky-500/50 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none transition shadow-sm"
            />
            {customCostoDirecto !== null && (
              <button
                onClick={() => setCustomCostoDirecto(null)}
                className="text-[10px] text-sky-400 hover:underline mt-1 block"
              >
                Restablecer a autocalculado (S/ {autoCostoDirecto.toFixed(2)})
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Gastos Generales (%)
            </label>
            <input
              type="number"
              step="0.5"
              value={gastosPct}
              onChange={(e) => setGastosPct(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Utilidad del Contratista (%)
            </label>
            <input
              type="number"
              step="0.5"
              value={utilidadPct}
              onChange={(e) => setUtilidadPct(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Resumen Bento y Tabla de Presupuesto */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        
        {/* Desglose de Costos de Presupuesto */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3.5 text-xs text-slate-300 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <TrendingUp className="w-4 h-4 text-sky-400" /> Resumen de Presupuesto (S/)
          </h3>

          <div className="flex justify-between">
            <span>Costo Directo Vivienda (Sin IGV)</span>
            <span className="font-mono font-extrabold text-white">S/ {costoDirecto.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between">
            <span>Gastos Generales ({gastosPct}%)</span>
            <span className="font-mono text-slate-400">S/ {gastosGenerales.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between">
            <span>Utilidad ({utilidadPct}%)</span>
            <span className="font-mono text-slate-400">S/ {utilidad.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold text-white">
            <span>Subtotal Vivienda Sin IGV</span>
            <span className="font-mono text-sky-400 font-extrabold">S/ {subTotalSinIgv.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              IGV ({igvPct}%)
              {isSelvaExempt && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">Ley Selva</span>}
            </span>
            <span className="font-mono font-bold text-slate-400">S/ {igvMonto.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="border-t border-slate-800 pt-3 mt-1 flex justify-between items-center bg-slate-950/80 p-3.5 rounded-2xl border">
            <span className="text-xs font-black uppercase text-white">COSTO TOTAL VIVIENDA</span>
            <span className="text-lg font-black font-mono text-emerald-400">
              S/ {presupuestoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Info Ley de la Selva & Export to Excel Button */}
        <div className="md:col-span-3 bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-emerald-400" /> Beneficio Tributario - Amazonía Peruana
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              En virtud de la **Ley N° 27037 (Ley de Promoción de la Inversión en la Amazonía)**, las viviendas sociales ejecutadas en departamentos de la Selva (San Martín, Loreto, Ucayali, Madre de Dios, Amazonas) gozan de exoneración total del Impuesto General a las Ventas (IGV 0%).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
            <span className="font-bold">Ahorro estimado por Ley de la Selva (18% IGV):</span>
            <span className="font-mono font-black text-sm text-emerald-400">
              S/ {(subTotalSinIgv * 0.18).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleExportToPDF}
              disabled={isExporting}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-wait"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {isExporting ? "Generando PDF..." : "Exportar Presupuesto a PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* Formulario para Agregar Nuevo Producto / Item al Presupuesto */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Plus className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-black uppercase text-white tracking-wider">
            AGREGAR NUEVO PRODUCTO / PARTIDA AL PRESUPUESTO
          </h3>
        </div>

        <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">Item / Código</label>
            <input
              type="text"
              placeholder="ej. 09.01"
              value={newItemCode}
              onChange={(e) => setNewItemCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">Descripción del Producto *</label>
            <input
              type="text"
              required
              placeholder="ej. Cemento Sol Tipo I (50kg)"
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">Unidad</label>
            <select
              value={newItemUnd}
              onChange={(e) => setNewItemUnd(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-sky-500"
            >
              <option value="UND">UND</option>
              <option value="Bolsa">Bolsa</option>
              <option value="M2">M2</option>
              <option value="M3">M3</option>
              <option value="KG">KG</option>
              <option value="GLN">GLN</option>
              <option value="ML">ML</option>
              <option value="GLB">GLB</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">Metrado / Qty *</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="50"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">P. Unitario (S/) *</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                required
                placeholder="32.50"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center justify-center shrink-0"
                title="Agregar item"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tabla Detallada de Partidas de Presupuesto */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-black uppercase text-white tracking-wider">
            PRESUPUESTO DETALLADO DE VIVIENDA UNIFAMILIAR
          </h3>
          <button
            onClick={handleExportToPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:underline disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {isExporting ? "Generando..." : "Exportar PDF"}
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/50">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-extrabold uppercase text-[11px]">
                <th className="py-3 px-4">ITEM</th>
                <th className="py-3 px-4">DESCRIPCIÓN DE PARTIDA / PRODUCTO</th>
                <th className="py-3 px-4 text-center">UND</th>
                <th className="py-3 px-4 text-right">METRADO</th>
                <th className="py-3 px-4 text-right">PRECIO UNIT (S/)</th>
                <th className="py-3 px-4 text-right">PARCIAL (S/)</th>
                <th className="py-3 px-4 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {basePresupuestoItems.map((item) => (
                <tr key={item.item} className="hover:bg-slate-800/50 text-slate-200 transition">
                  <td className="py-3 px-4 font-bold text-sky-400">{item.item}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-white">{item.descripcion}</td>
                  <td className="py-3 px-4 text-center text-slate-400">{item.unidad}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-300">{item.metrado.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-slate-300">{item.unitario.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">{item.parcial.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center text-slate-600 text-[10px]">Base</td>
                </tr>
              ))}

              {customItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50 text-slate-200 transition bg-sky-500/5">
                  <td className="py-3 px-4 font-bold text-amber-400">{item.item}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-white flex items-center gap-2">
                    {item.descripcion}
                    <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded font-mono font-bold">Personalizado</span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400">{item.unidad}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-300">{item.metrado.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-slate-300">{item.unitario.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">{item.parcial.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleRemoveCustomItem(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Eliminar item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
