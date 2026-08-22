"use client";

import React from "react";
import {
  Map,
  FolderOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sparkles,
  ClipboardList,
  Wrench,
  Users,
  CreditCard,
  Hammer,
  LogOut,
  Activity
, Globe } from "lucide-react";
import Link from "next/link";

export type NavView = "resumen" | "ficha_registro" | "registros" | "expedientes" | "documentos" | "pagos" | "maestros" | "consulta_dni" | "contabilidad" | "analytics" | "landing_config";

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  onLogout?: () => void;
}

export default function Sidebar({
  activeView,
  onSelectView,
  onLogout
}: SidebarProps) {
  const menuItems = [
    { id: "resumen" as NavView, label: "Resumen", subtitle: "Mapa del Perú & Indicadores", icon: Map },
    { id: "ficha_registro" as NavView, label: "Ficha de Registro", subtitle: "Formulario de postulación", icon: ClipboardList },
    { id: "registros" as NavView, label: "EXPEDIENTES", subtitle: "Lista de beneficiarios", icon: Users },
    { id: "expedientes" as NavView, label: "Expediente Técnico", subtitle: "APU, Metrados y Planos", icon: Wrench },
    { id: "documentos" as NavView, label: "DOCUMENTOS", subtitle: "Archivos PDF e imágenes", icon: FileText },
    { id: "pagos" as NavView, label: "Pagos", subtitle: "Cronograma de Pagos", icon: CreditCard },
    { id: "maestros" as NavView, label: "Maestros", subtitle: "Planificación de Maestros", icon: Hammer },
    { id: "consulta_dni" as NavView, label: "Consulta DNI", subtitle: "Búsqueda informativa", icon: Sparkles },
    { id: "contabilidad" as NavView, label: "Contabilidad", subtitle: "Facturas y Recibos", icon: FileText },
    { id: "landing_config" as NavView, label: "Config Landing", subtitle: "Personalizar página web", icon: Map },
  ];

  return (
    <aside
      className={`relative flex flex-col h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 z-30 select-none w-64`}
    >
      {/* Sidebar Header / Branding */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-0.5 truncate">
            <h2 className="text-base font-black text-white tracking-tight flex items-center gap-1">
              Maza Quiroz
            </h2>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Registro de beneficiarios
            </p>
          </div>
        </div>

        
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 group relative ${isActive
                  ? "bg-slate-950 text-white border border-sky-500/40 shadow-lg shadow-sky-500/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
                }`}
              
            >
              {/* Left active line indicator */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-sky-500 rounded-r-full"></span>
              )}

              <div className={`p-2 rounded-xl transition duration-150 shrink-0 ${isActive ? "bg-sky-600 text-white shadow-md shadow-sky-600/30" : "bg-slate-800/60 text-slate-400 group-hover:text-white group-hover:bg-slate-800"
                }`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="text-left truncate">
                <span className="block text-sm font-extrabold text-white leading-snug">
                  {item.label}
                </span>
                <span className="block text-[11px] font-normal text-slate-400 truncate">
                  {item.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-2">
        <Link href="/" className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-sky-500/10 text-slate-400 hover:text-sky-400 border border-slate-700/50 hover:border-sky-500/30 transition-all group">
          <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Ir a la Landing Page</span>
        </Link>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/30 transition-all group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-bold">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

