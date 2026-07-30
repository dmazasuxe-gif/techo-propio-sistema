"use client";

import React, { useState } from "react";
import { Hourglass, TrendingUp } from "lucide-react";

interface TareaGantt {
  id: string;
  actividad: string;
  inicioSemana: number;
  duracionSemanas: number;
  avancePct: number;
  responsable: string;
}

export default function CronogramaObra() {
  const [tareas, setTareas] = useState<TareaGantt[]>([
    { id: "t1", actividad: "01. Obras Preliminares & Excavación",       inicioSemana: 1, duracionSemanas: 1, avancePct: 0, responsable: "Maestro de Obra" },
    { id: "t2", actividad: "02. Cimentación & Sobrecimientos",          inicioSemana: 1, duracionSemanas: 2, avancePct: 0, responsable: "Estructuras" },
    { id: "t3", actividad: "03. Muros de Ladrillo Soga",                inicioSemana: 2, duracionSemanas: 2, avancePct: 0, responsable: "Albañilería" },
    { id: "t4", actividad: "04. Columnas y Vigas de Concreto",          inicioSemana: 3, duracionSemanas: 2, avancePct: 0, responsable: "Estructuras" },
    { id: "t5", actividad: "05. Techo Aligerado & Vaciado",             inicioSemana: 4, duracionSemanas: 2, avancePct: 0, responsable: "Estructuras" },
    { id: "t6", actividad: "06. Tarrajeo, Pisos & Zócalos",             inicioSemana: 5, duracionSemanas: 2, avancePct: 0, responsable: "Acabados" },
    { id: "t7", actividad: "07. Instalaciones Sanitarias & Eléctricas", inicioSemana: 6, duracionSemanas: 2, avancePct: 0, responsable: "Instalaciones" },
    { id: "t8", actividad: "08. Pintura & Puertas / Ventanas",          inicioSemana: 7, duracionSemanas: 2, avancePct: 0, responsable: "Pintura" },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    fetch("/api/obras/cronograma")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTareas(data);
        }
      })
      .catch(err => console.error("Error loading cronogramaObra", err));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/obras/cronograma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tareas)
      });
    } catch (error) {
      console.error("Error saving cronogramaObra", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAvance = (id: string, pct: number) => {
    setTareas(prev => prev.map(t => t.id === id ? { ...t, avancePct: pct } : t));
  };

  const avanceTotalObra = Math.round(
    tareas.reduce((acc, t) => acc + t.avancePct, 0) / tareas.length
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-md">
              <Hourglass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Cronograma de Ejecución de Obra (Gantt Interactivo)
              </h2>
              <p className="text-xs text-slate-400">
                Ajusta el avance físico (%) de cada actividad del expediente de construcción.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm transition-colors"
            >
              {isSaving ? "Guardando..." : "Guardar Avance"}
            </button>
            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <TrendingUp className="w-5 h-5 text-sky-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Avance Físico Global</span>
                <span className="text-base font-black font-mono text-sky-400">{avanceTotalObra}% completado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gantt Rows */}
        <div className="space-y-4">
          {tareas.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">{t.actividad}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Responsable: {t.responsable}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-lg">
                    {t.avancePct}%
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={t.avancePct}
                    onChange={(e) => handleUpdateAvance(t.id, parseInt(e.target.value))}
                    className="w-32 sm:w-40 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-500 border border-slate-800"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    t.avancePct === 100
                      ? "bg-emerald-500 shadow-md shadow-emerald-500/40"
                      : t.avancePct > 0
                      ? "bg-sky-500 shadow-md shadow-sky-500/40"
                      : "bg-slate-800"
                  }`}
                  style={{ width: `${t.avancePct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

