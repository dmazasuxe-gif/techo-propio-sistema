"use client";

import React from "react";
import {
  Map,
  FileText,
  ChevronRight,
  Building2,
  Sparkles,
  ClipboardList,
  Wrench,
  Users,
  CreditCard,
  Hammer,
  LogOut,
  Globe,
  X
} from "lucide-react";
import Link from "next/link";

export type NavView =
  | "resumen"
  | "ficha_registro"
  | "registros"
  | "expedientes"
  | "documentos"
  | "pagos"
  | "maestros"
  | "consulta_dni"
  | "contabilidad"
  | "analytics"
  | "landing_config"
  | "modelos_3d";

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  onLogout?: () => void;
  onClose?: () => void;
}

interface MenuGroup {
  title: string;
  items: {
    id: NavView;
    label: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export default function Sidebar({
  activeView,
  onSelectView,
  onLogout,
  onClose
}: SidebarProps) {
  const menuGroups: MenuGroup[] = [
    {
      title: "OPERACIONES",
      items: [
        { id: "resumen", label: "Resumen", subtitle: "Mapa del Perú & Indicadores", icon: Map },
        { id: "ficha_registro", label: "Ficha de Registro", subtitle: "Nueva postulación", icon: ClipboardList, badge: "Nuevo" },
        { id: "registros", label: "Beneficiarios", subtitle: "Lista de expedientes", icon: Users },
      ]
    },
    {
      title: "INGENIERÍA & CONTROL",
      items: [
        { id: "expedientes", label: "Expediente Técnico", subtitle: "APU, Metrados y Planos", icon: Wrench },
        { id: "documentos", label: "Documentos", subtitle: "Archivos PDF e imágenes", icon: FileText },
        { id: "pagos", label: "Cronograma Pagos", subtitle: "Financieras y desembolsos", icon: CreditCard },
        { id: "maestros", label: "Maestros de Obra", subtitle: "Asignación y avance", icon: Hammer },
      ]
    },
    {
      title: "ADMINISTRACIÓN & WEB",
      items: [
        { id: "consulta_dni", label: "Consulta DNI", subtitle: "Búsqueda informativa RENIEC", icon: Sparkles },
        { id: "contabilidad", label: "Contabilidad", subtitle: "Facturas y recibos", icon: FileText },
        { id: "modelos_3d", label: "Modelos 3D", subtitle: "Catálogo de viviendas", icon: Sparkles },
        { id: "landing_config", label: "Config Landing", subtitle: "Personalizar página web", icon: Globe },
      ]
    }
  ];

  return (
    <aside className="relative flex flex-col h-full bg-slate-950/95 backdrop-blur-2xl border-r border-white/10 select-none w-72 sm:w-80 shadow-2xl">
      {/* Header / Branding (iOS style) */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-0.5 truncate">
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
              Maza Quiroz
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-wider">
              Panel Administrativo
            </p>
          </div>
        </div>

        {/* Mobile close button if inside drawer */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 rounded-full bg-white/10 active:bg-white/20 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-90"
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List grouped iOS style */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto overscroll-contain">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1">
              {group.title}
            </h3>

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeView === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectView(item.id);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 group relative active:scale-[0.98] ${
                      isActive
                        ? "bg-sky-500/15 text-white border border-sky-500/30 shadow-md shadow-sky-500/10"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl transition duration-150 shrink-0 ${
                          isActive
                            ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                            : "bg-white/[0.06] text-slate-400 group-hover:text-white group-hover:bg-white/[0.1]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="text-left truncate">
                        <div className="flex items-center gap-2">
                          <span className={`block text-xs font-extrabold truncate ${isActive ? "text-white" : "text-slate-200"}`}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className="block text-[10px] font-medium text-slate-500 truncate">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                        isActive ? "text-sky-400 translate-x-0.5" : "text-slate-600 group-hover:text-slate-400"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* iOS style footer actions */}
      <div className="p-3.5 border-t border-white/10 bg-slate-950/80 space-y-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white/[0.05] hover:bg-sky-500/15 active:bg-sky-500/20 text-slate-300 hover:text-sky-400 border border-white/10 hover:border-sky-500/30 transition-all text-xs font-bold active:scale-[0.98]"
        >
          <Globe className="w-4 h-4 text-sky-400" />
          <span>Ver Landing Page</span>
        </Link>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-white/[0.03] hover:bg-rose-500/15 active:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-all text-xs font-bold active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        )}
      </div>
    </aside>
  );
}
