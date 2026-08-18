"use client";

import React, { useState } from "react";
import { Beneficiario } from "../types";
import { getExpedienteStatusBadge } from "@/lib/status-helper";
import { FileText, Folder, Clipboard, UserPlus, CheckCircle2, Search, MapPin, Phone, Plus, ChevronRight } from "lucide-react";

interface DashboardProps {
  beneficiarios: Beneficiario[];
  onSelectExpediente: (id: string) => void;
  onNewExpediente: () => void;
}

export default function Dashboard({ beneficiarios, onSelectExpediente, onNewExpediente }: DashboardProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");

  const filtered = beneficiarios.filter(b => {
    const matchesSearch = 
      b.postulante.toLowerCase().includes(search.toLowerCase()) ||
      b.dniPostulante.includes(search) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      (b.expediente && b.expediente.toLowerCase().includes(search.toLowerCase())) ||
      (b.distrito && b.distrito.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "TODOS" || b.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Uses the official 6-state system from status-helper

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Dynamic Header & CTA */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/60 border border-slate-800/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> Sistema Techo Propio CSP
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Expedientes de Beneficiarios
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Gestión técnica integral automatizada para Construcción en Sitio Propio. Registro, presupuesto, planos de ingeniería y cronogramas.
          </p>
        </div>

        <button
          onClick={onNewExpediente}
          className="relative z-10 flex items-center justify-center gap-2.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold px-6 py-3.5 rounded-2xl transition-all duration-200 shadow-xl shadow-sky-600/25 hover:shadow-sky-500/40 hover:-translate-y-0.5"
        >
          <UserPlus className="w-5 h-5" />
          <span>Nuevo Registro</span>
        </button>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Registros", val: beneficiarios.length, icon: Folder, col: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "En Revisión / Inscritos", val: beneficiarios.filter(b => (b.estado || "").includes("Revisión") || (b.estado || "").includes("Inscrito")).length, icon: FileText, col: "text-sky-400", bg: "bg-sky-500/10" },
          { label: "Elegibles / Código Proyecto", val: beneficiarios.filter(b => (b.estado || "").includes("Elegible") || (b.estado || "").includes("Código")).length, icon: Clipboard, col: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Aprobados", val: beneficiarios.filter(b => (b.estado || "").includes("Aprobado")).length, icon: CheckCircle2, col: "text-purple-400", bg: "bg-purple-500/10" }
        ].map((stat, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition duration-200 flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 block tracking-wide">{stat.label}</span>
              <span className="text-3xl font-extrabold text-white block">{stat.val}</span>
            </div>
            <div className={`p-3.5 rounded-2xl border border-slate-800 ${stat.bg} ${stat.col}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Beneficiary List */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <Clipboard className="w-5 h-5 text-indigo-400" /> Registro de Expedientes
            </h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
              {filtered.length} registrados
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Quick Status Filter Tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold w-full sm:w-auto overflow-x-auto gap-0.5">
              {[
                { label: "TODOS", val: "TODOS" },
                { label: "Revisión", val: "Expediente en Revisión" },
                { label: "Inscrito", val: "Expediente Inscrito" },
                { label: "Elegible", val: "Expediente Elegible" },
                { label: "No Elegible", val: "Expediente No Elegible" },
                { label: "Código Proy.", val: "Expediente con Código de Proyecto" },
                { label: "Aprobado", val: "Expediente Aprobado" },
              ].map(({ label, val }) => {
                const badge = val !== "TODOS" ? getExpedienteStatusBadge(val) : null;
                return (
                  <button
                    key={val}
                    onClick={() => setStatusFilter(val)}
                    className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition ${
                      statusFilter === val
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar postulante, DNI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-slate-500 transition"
              />
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="divide-y divide-slate-800/60">
          {filtered.length > 0 ? (
            filtered.map((b) => (
              <div 
                key={b.id} 
                onClick={() => onSelectExpediente(b.id)}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition duration-150 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-lg font-mono">
                      {b.id}
                    </span>
                    {b.expediente && (
                      <span className="text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-lg">
                        {b.expediente}
                      </span>
                    )}
                    {(() => {
                      const badge = getExpedienteStatusBadge(b.estado);
                      return (
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.colorClass}`}>
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {b.postulante}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {b.direccion || "Dirección no asignada"} — <strong className="text-slate-300">{b.distrito}, {b.departamento}</strong>
                    </span>
                    {b.celular && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {b.celular}
                      </span>
                    )}
                    <span className="font-mono text-slate-500">DNI: {b.dniPostulante || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition">
                    Abrir Expediente
                  </span>
                  <div className="p-2 rounded-xl bg-slate-800/80 group-hover:bg-indigo-600 transition duration-150">
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-16 text-center text-slate-500 space-y-2">
              <Folder className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">No se encontraron expedientes con los criterios ingresados.</p>
              <button
                onClick={onNewExpediente}
                className="mt-2 inline-flex items-center gap-2 text-xs text-sky-400 hover:text-sky-300 font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar nuevo postulante
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
