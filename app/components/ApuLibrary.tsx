"use client";

import React, { useState } from "react";
import { Insumo, PartidaAPU } from "../types";
import { Settings, Coins, Layers, ChevronDown, ChevronUp } from "lucide-react";

interface ApuLibraryProps {
  insumos: Insumo[];
  partidasApu: PartidaAPU[];
  onUpdateInsumoPrice: (id: string, newPrice: number) => void;
}

export default function ApuLibrary({ insumos, partidasApu, onUpdateInsumoPrice }: ApuLibraryProps) {
  const [editingInsumo, setEditingInsumo] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>("");
  const [expandedPartida, setExpandedPartida] = useState<string | null>(null);

  const getInsumo = (id: string) => insumos.find(i => i.id === id);

  const calculatePartidaTotal = (partida: PartidaAPU) => {
    let total = 0;
    const calculateSection = (details: any[]) => {
      details.forEach(d => {
        const insumo = getInsumo(d.insumoId);
        if (insumo) total += d.coeficiente * insumo.precioUnitario;
      });
    };
    calculateSection(partida.manoDeObra);
    calculateSection(partida.materiales);
    calculateSection(partida.equipos);
    return total;
  };

  const handleStartEdit = (insumo: Insumo) => {
    setEditingInsumo(insumo.id);
    setTempPrice(insumo.precioUnitario.toString());
  };

  const handleSavePrice = (id: string) => {
    const parsed = parseFloat(tempPrice);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateInsumoPrice(id, parsed);
    }
    setEditingInsumo(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
      {/* Listado de Insumos / Almacén (Lado Izquierdo) */}
      <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
          <Coins className="w-4 h-4 text-indigo-400" /> Costo de Insumos Básicos
        </h3>
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {insumos.map((insumo) => (
            <div key={insumo.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 transition text-xs">
              <div>
                <span className="font-semibold text-white block">{insumo.descripcion}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Unidad: {insumo.unidad}</span>
              </div>
              {editingInsumo === insumo.id ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number" step="0.01" value={tempPrice}
                    onChange={(e) => setTempPrice(e.target.value)}
                    className="w-16 bg-slate-900 border border-indigo-500 rounded p-1 text-center font-bold text-white"
                  />
                  <button onClick={() => handleSavePrice(insumo.id)} className="bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold px-2 py-1 rounded text-white">Ok</button>
                </div>
              ) : (
                <div onClick={() => handleStartEdit(insumo)} className="cursor-pointer group flex items-center gap-1">
                  <span className="font-bold text-indigo-400 group-hover:text-indigo-300 transition">S/ {insumo.precioUnitario.toFixed(2)}</span>
                  <Settings className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Análisis de Precios Unitarios (Lado Derecho) */}
      <div className="lg:col-span-3 glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
          <Layers className="w-4 h-4 text-indigo-400" /> Fichas APU por Partida
        </h3>
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 divide-y divide-slate-900">
          {partidasApu.map((p) => {
            const isExpanded = expandedPartida === p.item;
            const totalUnitario = calculatePartidaTotal(p);
            return (
              <div key={p.item} className="pt-2.5 first:pt-0 space-y-2">
                <div 
                  onClick={() => setExpandedPartida(isExpanded ? null : p.item)}
                  className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-white/5 rounded-xl transition"
                >
                  <div className="text-xs">
                    <span className="font-bold text-indigo-400 mr-2">{p.item}</span>
                    <span className="font-semibold text-white">{p.descripcion}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-extrabold text-emerald-400">S/ {totalUnitario.toFixed(2)} / {p.unidad}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-3 bg-slate-950/70 border border-slate-900 rounded-xl space-y-3 text-[10px]">
                    <div className="flex justify-between text-slate-500 font-bold border-b border-slate-800 pb-1 uppercase tracking-wider">
                      <span>Insumo Detalle</span>
                      <div className="flex gap-12">
                        <span>Rendimiento</span>
                        <span>Parcial</span>
                      </div>
                    </div>
                    {/* Renderización rápida de subpartidas */}
                    {[...p.manoDeObra, ...p.materiales, ...p.equipos].map((det, dIdx) => {
                      const ins = getInsumo(det.insumoId);
                      if (!ins) return null;
                      const parcial = det.coeficiente * ins.precioUnitario;
                      return (
                        <div key={dIdx} className="flex justify-between items-center text-slate-300">
                          <span className="font-medium text-slate-400">{ins.descripcion} <span className="text-[9px] text-slate-600">({ins.unidad})</span></span>
                          <div className="flex gap-12 font-mono">
                            <span className="w-12 text-right">{det.coeficiente.toFixed(3)}</span>
                            <span className="w-12 text-right text-white font-bold">S/ {parcial.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
