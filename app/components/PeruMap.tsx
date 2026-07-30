/* eslint-disable @typescript-eslint/no-unused-vars, @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Beneficiario } from "../types";
import { RefreshCw, Search, MapPin } from "lucide-react";

interface PeruMapProps {
  beneficiarios: Beneficiario[];
  onSelectDepartmentFilter?: (dep: string) => void;
  onRefresh?: () => void;
}

/**
 * Interactive Peru Map with image base + overlaid department pins.
 * Uses /mapa-peru.png as the visual cartographic base.
 * Each department with active beneficiaries gets a pulsing, glowing pin overlay.
 */
export default function PeruMap({ beneficiarios, onSelectDepartmentFilter, onRefresh }: PeruMapProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDep, setSelectedDep] = useState<string | null>(null);

  // Official 25 Departments of Peru
  const ALL_DEPARTMENTS = [
    "AMAZONAS", "ANCASH", "APURIMAC", "AREQUIPA", "AYACUCHO", "CAJAMARCA", "CALLAO",
    "CUSCO", "HUANCAVELICA", "HUANUCO", "ICA", "JUNIN", "LA LIBERTAD", "LAMBAYEQUE",
    "LIMA", "LORETO", "MADRE DE DIOS", "MOQUEGUA", "PASCO", "PIURA", "PUNO",
    "SAN MARTIN", "TACNA", "TUMBES", "UCAYALI"
  ];

  /**
   * Pin positions calibrated from visual screenshot analysis (576×848 image).
   * Each coordinate places the pin at the CENTER of the colored territory,
   * NOT on the text label (which sometimes falls outside the territory).
   * Image: /mapa-peru.png
   */
  const DEPARTMENT_PIN_POSITIONS: { [key: string]: { top: number; left: number } } = {
    // ── Costa Norte ──
    TUMBES: { top: 20, left: 7 },   // Tiny NW corner – verified pixel on yellow land at 19%,8% → shifted right into territory
    PIURA: { top: 26, left: 10 },// Left coast – verified pixel on green land at 24%,9% → centered in Piura territory
    LAMBAYEQUE: { top: 35, left: 13 },   // Narrow strip below Piura – verified on land

    // ── Sierra Norte ──
    CAJAMARCA: { top: 37, left: 22 },   // Inland green/brown region right of Lambayeque
    AMAZONAS: { top: 30, left: 26 },   // Small green region between Cajamarca and San Martín

    // ── Selva Norte ──
    LORETO: { top: 25, left: 52 },   // Huge yellow NE region – center of "Loreto" text
    "SAN MARTIN": { top: 40, left: 37 },   // Orange region below Amazonas – near "San Martín" text

    // ── Costa y Sierra Central-Norte ──
    "LA LIBERTAD": { top: 44, left: 22 },   // Left, below Cajamarca – orange/salmon region
    ANCASH: { top: 52, left: 29 },   // Green region below La Libertad – near "Ancash" text
    HUANUCO: { top: 50, left: 42 },   // Orange region right of Ancash – near "Huánuco" text

    // ── Selva Central ──
    UCAYALI: { top: 51, left: 60 },   // Large tan region right side – near bold "Ucayali" text
    PASCO: { top: 55, left: 50 },   // Small green below Huánuco – near "Pasco" text

    // ── Centro ──
    JUNIN: { top: 62, left: 56 },   // Green/olive region – near bold "Junín" text
    CALLAO: { top: 65, left: 35 },   // Tiny coastal – verified pixel on land at 56%,27% → shifted right onto coast
    LIMA: { top: 61, left: 35 },   // Orange region stretching inland from coast

    // ── Sierra y Costa Sur ──
    HUANCAVELICA: { top: 73, left: 49 },   // Small region – near "Huancavelica" text
    ICA: { top: 80, left: 47 },   // Coastal olive – near "Ica" text
    AYACUCHO: { top: 78, left: 56 },   // Inland olive – near "Ayacucho" text
    APURIMAC: { top: 77, left: 67 },   // Small – between Ayacucho & Cusco, "Apurímac" text

    // ── Selva Sur y Sierra Sur ──
    CUSCO: { top: 69, left: 70 },   // Large brown – near bold "Cusco" text
    "MADRE DE DIOS": { top: 63, left: 83 },   // Large brown NE of Cusco – verified pixel on land at 54%,72%
    PUNO: { top: 83, left: 88 },   // Yellow-green SE – near bold "Puno" text

    // ── Costa Sur ──
    AREQUIPA: { top: 84, left: 70 },   // Large salmon southern – near bold "Arequipa" text
    MOQUEGUA: { top: 90, left: 85 },   // Small yellow – near "Moquegua" text
    TACNA: { top: 98, left: 88 },   // Bottom corner – verified pixel on orange land at 91%,74%
  };

  const getDepartmentCount = (depName: string): number => {
    return beneficiarios.filter(b => {
      const bDep = (b.departamento || "").trim().toUpperCase();
      return bDep === depName || bDep.includes(depName) || depName.includes(bDep);
    }).length;
  };

  const departmentsWithCounts = ALL_DEPARTMENTS.map(dep => ({
    name: dep,
    count: getDepartmentCount(dep)
  }));

  const activeDepartmentsCount = departmentsWithCounts.filter(d => d.count > 0).length;

  const filteredDepartments = departmentsWithCounts.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">

      {/* Main Grid: Left Peru Map Image + Right Departments List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: MAPA DEL PERÚ (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-3">
            <h2 className="text-xs font-black uppercase text-slate-300 tracking-wider">
              MAPA DEL PERÚ
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full font-mono">
                {activeDepartmentsCount} departamento{activeDepartmentsCount !== 1 ? "s" : ""} con registros
              </span>
              <button
                onClick={onRefresh}
                className="flex items-center gap-2 border border-slate-700 hover:border-slate-500 bg-slate-800 text-slate-200 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" /> Actualizar
              </button>
            </div>
          </div>

          {/* Map Container: Image Base + Overlay Pins */}
          <div className="relative w-full bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden">
            {/* Base Map Image */}
            <img
              src="/mapa-peru.png"
              alt="Mapa político del Perú"
              className="w-full h-auto object-contain select-none pointer-events-none"
              draggable={false}
            />

            {/* Overlay Interactive Pins */}
            {departmentsWithCounts.map((dep) => {
              const coords = DEPARTMENT_PIN_POSITIONS[dep.name];
              if (!coords) return null;
              const hasRegistros = dep.count > 0;
              const isSelected = selectedDep === dep.name;

              return (
                <div
                  key={dep.name}
                  className="absolute cursor-pointer group"
                  style={{
                    top: `${coords.top}%`,
                    left: `${coords.left}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: hasRegistros ? 20 : 10,
                  }}
                  onClick={() => {
                    setSelectedDep(dep.name);
                    if (onSelectDepartmentFilter) onSelectDepartmentFilter(dep.name);
                  }}
                >
                  {/* Pulsing Aura Ring for Active Departments */}
                  {hasRegistros && (
                    <span
                      className="absolute rounded-full animate-ping"
                      style={{
                        width: "32px",
                        height: "32px",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "rgba(239, 68, 68, 0.4)",
                      }}
                    />
                  )}

                  {/* Pin Dot */}
                  <span
                    className={`relative block rounded-full border-2 transition-all duration-200 ${hasRegistros
                      ? "bg-red-600 border-white shadow-lg shadow-red-600/50"
                      : "bg-slate-400 border-slate-300/60"
                      } ${isSelected ? "ring-2 ring-red-400 ring-offset-2 ring-offset-slate-950" : ""}`}
                    style={{
                      width: hasRegistros ? "16px" : "8px",
                      height: hasRegistros ? "16px" : "8px",
                    }}
                  />

                  {/* Tooltip Badge on Hover / Active */}
                  {hasRegistros && (
                    <div
                      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-3 py-1.5 rounded-xl text-[11px] font-black border shadow-xl transition-all duration-200 pointer-events-none ${isSelected
                        ? "opacity-100 scale-100 bg-red-600 text-white border-red-500"
                        : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 bg-slate-900/95 text-white border-red-500/50"
                        }`}
                    >
                      {dep.name} ({dep.count})
                    </div>
                  )}
                </div>
              );
            })}

            {/* Map Legend */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-[11px] text-slate-300 space-y-1 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse border border-white" /> Departamento con expedientes
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500 border border-slate-400" /> Sin registros
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: DEPARTAMENTOS List (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[750px]">

          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
            <h2 className="text-xs font-black uppercase text-slate-300 tracking-wider">
              DEPARTAMENTOS
            </h2>
            <span className="text-xs font-bold text-slate-400">
              25 departamentos
            </span>
          </div>

          {/* Department Search Input */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          {/* Department Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {filteredDepartments.map((dep) => {
              const isSelected = selectedDep === dep.name;

              return (
                <div
                  key={dep.name}
                  onClick={() => {
                    setSelectedDep(dep.name);
                    if (onSelectDepartmentFilter) onSelectDepartmentFilter(dep.name);
                  }}
                  className={`py-2.5 px-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-150 group border ${isSelected
                    ? "bg-sky-600/10 border-sky-500/30"
                    : "hover:bg-slate-800/50 border-transparent"
                    }`}
                >
                  <div className="space-y-0.5">
                    <h3 className={`text-xs font-extrabold uppercase transition-colors ${dep.count > 0 ? "text-white group-hover:text-sky-400" : "text-slate-400"
                      }`}>
                      {dep.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {dep.count > 0 ? `${dep.count} registro${dep.count !== 1 ? "s" : ""}` : "Sin registros"}
                    </p>
                  </div>

                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${dep.count > 0
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                    : "bg-slate-800/80 text-slate-500"
                    }`}>
                    {dep.count}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
