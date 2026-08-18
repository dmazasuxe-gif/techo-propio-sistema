"use client";

import React, { useEffect, useState } from "react";
import { Activity, Users, MousePointerClick, Loader2, ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AnalyticsView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTraffic = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('landing_traffic')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (!error && data) {
      setData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTraffic();
  }, []);

  const totalViews = data.length;
  const uniqueUsers = new Set(data.map(d => d.session_id)).size;
  const clicks = data.filter(d => d.event_type === 'click').length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <Activity className="w-8 h-8 text-indigo-400" />
        <div>
          <h2 className="text-2xl font-black text-white">Métricas de la Landing Page</h2>
          <p className="text-slate-400 text-sm">Monitorea en tiempo real quién visita e interactúa con tu página web.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium">Vistas Totales</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl"><Activity className="w-5 h-5 text-indigo-400" /></div>
          </div>
          <div className="text-4xl font-black text-white">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : totalViews}</div>
          <div className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-3 h-3" /> En los últimos registros
          </div>
        </div>
        
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium">Usuarios Únicos (Aprox)</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl"><Users className="w-5 h-5 text-emerald-400" /></div>
          </div>
          <div className="text-4xl font-black text-white">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : uniqueUsers}</div>
          <div className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-2">
            Estimación por sesión
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium">Interacciones (Clicks)</span>
            <div className="p-2 bg-amber-500/10 rounded-xl"><MousePointerClick className="w-5 h-5 text-amber-400" /></div>
          </div>
          <div className="text-4xl font-black text-white">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : clicks}</div>
          <div className="text-xs text-amber-400 font-bold flex items-center gap-1 mt-2">
            Botones de WhatsApp y registro
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-white">Registro en Vivo (Últimos 100)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
              <tr>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Evento</th>
                <th className="px-6 py-4">Ruta</th>
                <th className="px-6 py-4">Dispositivo / Navegador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Cargando tráfico...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No hay registros de tráfico aún. (Asegúrate de ejecutar el comando SQL en Supabase).
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {new Date(row.created_at).toLocaleString('es-PE')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${row.event_type === 'click' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                        {row.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-400">{row.path}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 truncate max-w-xs" title={row.user_agent}>
                      {row.user_agent}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
