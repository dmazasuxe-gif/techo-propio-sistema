/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Dimensiones, Insumo, PartidaAPU } from "../types";
import { TrendingUp, Trees, DollarSign, Edit3, ShieldCheck, Plus, Trash2, FileText, Download, Loader2 } from "lucide-react";

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

  const handleExportToPDF = async () => {
    setIsExporting(true);
    try {
      const allItems = [
        ...basePresupuestoItems.map(item => ({
          item: item.item,
          descripcion: item.descripcion,
          unidad: item.unidad,
          metrado: item.metrado,
          unitario: item.unitario,
          parcial: item.parcial,
          isCustom: false,
        })),
        ...customItems.map(item => ({
          item: item.item,
          descripcion: item.descripcion,
          unidad: item.unidad,
          metrado: item.metrado,
          unitario: item.unitario,
          parcial: item.parcial,
          isCustom: true,
        })),
      ];

      const payload = {
        items: allItems,
        costoDirecto,
        gastosPct,
        utilidadPct,
        gastosGenerales,
        utilidad,
        subTotalSinIgv,
        igvPct,
        igvMonto,
        presupuestoTotal,
        isSelvaExempt,
      };

      const res = await fetch("/api/presupuesto/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error generando PDF");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Presupuesto_TechoPropio_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("Error al generar el PDF del presupuesto.");
    } finally {
      setIsExporting(false);
    }
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
              <DollarSign className="w-4 h-4 text-emerald-400" /> Beneficio Tributario - Amazonía Peruana
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
