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

  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      alert("Por favor permite ventanas emergentes para descargar el PDF.");
      return;
    }

    const itemsHtml = tareas.map(t => {
      const avance = t.avancePct || 0;
      const bgClass = avance === 100 ? 'bg-emerald' : (avance > 0 ? 'bg-sky' : 'bg-slate');
      return `
        <div class="task-card">
          <div class="task-header">
            <div class="task-info">
              <span class="actividad">${t.actividad}</span>
              <span class="responsable">Responsable: ${t.responsable}</span>
            </div>
            <div class="task-pct">${avance}%</div>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill ${bgClass}" style="width: ${avance}%"></div>
          </div>
        </div>
      `;
    }).join("");

    const printContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Cronograma de Ejecución de Obra</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 portrait; margin: 15mm 12mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; font-size: 11px; }
    
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fff; padding: 18px 22px; border-radius: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .header-title h1 { font-size: 18px; font-weight: 900; margin-bottom: 4px; }
    .header-title p { font-size: 10px; opacity: 0.7; }
    
    .global-progress { background: #0f172a; border: 1px solid #1e3a5f; padding: 10px 16px; border-radius: 12px; text-align: right; }
    .global-progress .label { font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; display: block; }
    .global-progress .value { font-size: 16px; font-weight: 900; color: #38bdf8; font-family: monospace; }
    
    .task-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
    .task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .task-info { display: flex; flex-direction: column; gap: 2px; }
    .actividad { font-size: 12px; font-weight: 800; color: #0f172a; }
    .responsable { font-size: 10px; color: #64748b; font-weight: 600; }
    
    .task-pct { background: rgba(56,189,248,0.15); color: #0284c7; border: 1px solid rgba(56,189,248,0.3); font-weight: 800; font-family: monospace; font-size: 12px; padding: 4px 8px; border-radius: 6px; }
    
    .progress-bar-bg { width: 100%; background: #e2e8f0; border-radius: 999px; height: 10px; overflow: hidden; }
    .progress-bar-fill { height: 100%; border-radius: 999px; }
    .bg-emerald { background: #10b981; }
    .bg-sky { background: #38bdf8; }
    .bg-slate { background: #cbd5e1; }
    
    .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title">
      <h1>⏳ Cronograma de Ejecución de Obra</h1>
      <p>Reporte de Avance Físico General</p>
    </div>
    <div class="global-progress">
      <span class="label">Avance Global</span>
      <span class="value">${avanceTotalObra}% COMPLETADO</span>
    </div>
  </div>
  
  <div class="tasks">
    ${itemsHtml}
  </div>

  <div class="footer">
    <div>Sistema Techo Propio — Constructora Maza Quiroz</div>
    <div>Generado el ${new Date().toLocaleString("es-PE")}</div>
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
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-md">
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
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold rounded-xl text-sm transition-colors"
            >
              Generar PDF
            </button>
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

