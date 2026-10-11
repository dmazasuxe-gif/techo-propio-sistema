"use client";

import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { Beneficiario, Dimensiones, Insumo, PartidaAPU } from "../types";
import { BENEFICIARIOS_INICIALES } from "../constants/initialData";
import {
  ArrowLeft,
  User,
  Ruler,
  Wrench,
  Hourglass,
  FileText,
  CheckCircle2,
  Menu,
  Plus,
  RotateCw,
  Sparkles,
  Map,
  ClipboardList,
  Users,
  CreditCard,
  Hammer,
  Globe
} from "lucide-react";

import Sidebar, { NavView } from "../components/Sidebar";
import PeruMap from "../components/PeruMap";
import BeneficiaryFicha from "../components/BeneficiaryFicha";
import DocumentManager from "../components/DocumentManager";
import ExpedientesView from "../components/ExpedientesView";
import FullRegistrationForm from "../components/FullRegistrationForm";
import InteractivePlano from "../components/InteractivePlano";
import PresupuestoSheet from "../components/PresupuestoSheet";
import CronogramaObra from "../components/CronogramaObra";
import PlanosIngenieria from "../components/PlanosIngenieria";
import CronogramaPagos from "../components/CronogramaPagos";
import CronogramaMaestros from "../components/CronogramaMaestros";
import ConsultaDniView from "../components/ConsultaDniView";
import LoginScreen from "../components/LoginScreen";
import { LandingCMS } from "./components/LandingCMS";
import DocumentosContables from "../components/DocumentosContables";
import ModelosViviendaAdmin from "../components/admin/ModelosViviendaAdmin";

const VIEW_META: Record<
  NavView,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  resumen: { label: "Resumen General", icon: Map },
  ficha_registro: { label: "Ficha de Registro", icon: ClipboardList },
  registros: { label: "Beneficiarios", icon: Users },
  expedientes: { label: "Expediente Técnico", icon: Wrench },
  documentos: { label: "Documentos", icon: FileText },
  pagos: { label: "Cronograma de Pagos", icon: CreditCard },
  maestros: { label: "Maestros de Obra", icon: Hammer },
  consulta_dni: { label: "Consulta DNI", icon: Sparkles },
  contabilidad: { label: "Contabilidad", icon: FileText },
  modelos_3d: { label: "Modelos 3D", icon: Sparkles },
  landing_config: { label: "Config Landing", icon: Globe },
  analytics: { label: "Analíticas", icon: Globe },
};

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>(BENEFICIARIOS_INICIALES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingBeneficiaryForForm, setEditingBeneficiaryForForm] = useState<Beneficiario | null>(null);
  const [activeTab, setActiveTab] = useState<string>("ficha");
  
  // Navigation View State
  const [activeNavView, setActiveNavView] = useState<NavView>("resumen");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Dynamic engineering simulation states
  const [dimensiones, setDimensiones] = useState<Dimensiones>({
    largo: 6.5,
    ancho: 5.5,
    altura: 2.8,
    espesorMuro: 0.15,
    habitaciones: 2,
  });
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [partidasApu, setPartidasApu] = useState<PartidaAPU[]>([]);

  // Fetch Presupuesto Master
  useEffect(() => {
    const fetchPresupuestoMaster = async () => {
      try {
        const res = await fetch("/api/presupuesto-master");
        if (res.ok) {
          const data = await res.json();
          setInsumos(data.insumos || []);
          setPartidasApu(data.partidas || []);
        }
      } catch (err) {
        console.error("Error fetching presupuesto maestro:", err);
      }
    };
    fetchPresupuestoMaster();
  }, []);

  const handleSavePresupuestoMaster = async (newPartidas: PartidaAPU[]) => {
    try {
      const res = await fetch("/api/presupuesto-master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insumos, partidas: newPartidas }),
      });
      if (res.ok) {
        setPartidasApu(newPartidas);
      }
    } catch (err) {
      console.error("Error saving presupuesto maestro:", err);
    }
  };

  const selectedBeneficiary = beneficiarios.find((b) => b.id === selectedId);

  const handleNavSelect = (view: NavView) => {
    setActiveNavView(view);
    setMobileMenuOpen(false);
    if (view === "expedientes" && !selectedId && beneficiarios.length > 0) {
      setSelectedId(beneficiarios[0].id);
    }
  };

  // Sync Dimensiones with selected beneficiary
  useEffect(() => {
    if (selectedBeneficiary?.notas) {
      try {
        const parsed = JSON.parse(selectedBeneficiary.notas);
        if (parsed.dimensiones) {
          setDimensiones(parsed.dimensiones);
          return;
        }
      } catch {}
    }
    setDimensiones({ largo: 6.5, ancho: 5.5, altura: 2.8, espesorMuro: 0.15, habitaciones: 2 });
  }, [selectedId, beneficiarios]);

  const handleSaveExpedienteData = (key: string, data: any) => {
    if (!selectedBeneficiary) return;
    let notasObj: any = {};
    if (selectedBeneficiary.notas) {
      try {
        notasObj = JSON.parse(selectedBeneficiary.notas);
      } catch {}
    }
    notasObj[key] = data;
    const updatedBeneficiario = { ...selectedBeneficiary, notas: JSON.stringify(notasObj) };
    handleEditBeneficiary(updatedBeneficiario);
  };

  const loadBeneficiarios = useCallback(async () => {
    try {
      const res = await fetch("/api/beneficiarios");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBeneficiarios(data);
        }
      }
    } catch (err) {
      console.error("Error cargando beneficiarios desde API:", err);
    }
  }, []);

  useEffect(() => {
    loadBeneficiarios();
    const storedLogin = localStorage.getItem("techo-propio-logged-in");
    if (storedLogin === "true") {
      setIsLoggedIn(true);
    }
  }, [loadBeneficiarios]);

  const handleLoginStatus = (status: boolean) => {
    setIsLoggedIn(status);
    if (status) {
      localStorage.setItem("techo-propio-logged-in", "true");
    } else {
      localStorage.removeItem("techo-propio-logged-in");
    }
  };

  const handleSaveBeneficiary = async (updated: Beneficiario) => {
    const exists = beneficiarios.some((b) => b.id === updated.id);
    if (exists) {
      setBeneficiarios((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      fetch("/api/beneficiarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }).catch(console.error);
    } else {
      setBeneficiarios((prev) => [updated, ...prev]);
      setSelectedId(updated.id);
      setActiveTab("ficha");
      setActiveNavView("expedientes");
      fetch("/api/beneficiarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }).catch(console.error);
    }
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  };

  const handleDeleteBeneficiary = async (id: string) => {
    setBeneficiarios((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
    fetch(`/api/beneficiarios?id=${id}`, { method: "DELETE" }).catch(console.error);
  };

  const handleEditBeneficiary = async (updated: Beneficiario) => {
    setBeneficiarios((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    fetch("/api/beneficiarios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(console.error);
  };

  const nextAutoId = `REG-${String(beneficiarios.length + 1).padStart(4, "0")}`;
  const currentViewMeta = VIEW_META[activeNavView] || { label: "Panel", icon: Sparkles };
  const CurrentViewIcon = currentViewMeta.icon;

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => handleLoginStatus(true)} />;
  }

  return (
    <div className="flex h-[100svh] w-full bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white overflow-hidden">
      {/* ── DESKTOP Sidebar (hidden on mobile/tablet) ── */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar
          activeView={activeNavView}
          onSelectView={handleNavSelect}
          onLogout={() => handleLoginStatus(false)}
        />
      </div>

      {/* ── MOBILE Drawer overlay (iOS Sheet) ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── MOBILE Drawer panel (Slide-over) ── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden transition-transform duration-300 ease-out ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <Sidebar
          activeView={activeNavView}
          onSelectView={handleNavSelect}
          onLogout={() => {
            handleLoginStatus(false);
            setMobileMenuOpen(false);
          }}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* ── Main App Content Area ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top App Header (iOS Translucent Navigation Bar) */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 backdrop-blur-2xl px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between shadow-lg flex-shrink-0 pt-[calc(env(safe-area-inset-top,0px)+0.6rem)]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Mobile iOS Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/[0.2] border border-white/10 text-white shadow-sm backdrop-blur-md active:scale-95 transition-all shrink-0"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-200">Menú</span>
            </button>

            {/* iOS Pill showing current active screen */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 shadow-sm backdrop-blur-md truncate">
              <CurrentViewIcon className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-xs font-black tracking-tight text-white truncate max-w-[140px] sm:max-w-none">
                {currentViewMeta.label}
              </span>
            </div>

            <span className="hidden xl:inline text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
              Maza Quiroz
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Action: Nueva Postulación */}
            <button
              onClick={() => {
                setEditingBeneficiaryForForm(null);
                handleNavSelect("ficha_registro");
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-95 text-white font-bold text-xs px-3 sm:px-4 py-2 rounded-2xl shadow-md shadow-sky-500/20 transition-all"
              title="Registrar nueva postulación"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>

            {/* Refresh Data button */}
            <button
              onClick={() => {
                loadBeneficiarios();
                confetti({ particleCount: 30, spread: 50, origin: { y: 0.2 } });
              }}
              className="p-2 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.18] text-slate-300 hover:text-white border border-white/10 active:scale-95 transition-all shadow-sm"
              title="Actualizar datos"
            >
              <RotateCw className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </header>

        {/* View Router (Edge-to-edge Native Scrolling) */}
        <main className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5 md:p-6 space-y-4 md:space-y-6 pb-[max(2rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))]">
          {/* Module 1: Resumen (Mapa Interactivo del Perú) */}
          {activeNavView === "resumen" && (
            <PeruMap
              beneficiarios={beneficiarios}
              onSelectDepartmentFilter={() => {
                setActiveNavView("registros");
              }}
              onRefresh={() => {
                loadBeneficiarios();
                confetti({ particleCount: 50, spread: 60 });
              }}
            />
          )}

          {/* Module 2: Registros (Lista de Beneficiarios + Filtros UBIGEO + Excel) */}
          {activeNavView === "registros" && (
            <ExpedientesView
              beneficiarios={beneficiarios}
              onSelectBeneficiary={(id) => {
                setSelectedId(id);
                setActiveNavView("expedientes");
              }}
              onDeleteBeneficiary={handleDeleteBeneficiary}
              onEditBeneficiary={handleEditBeneficiary}
              onOpenEditForm={(b) => {
                setEditingBeneficiaryForForm(b);
                setActiveNavView("ficha_registro");
              }}
              onRefresh={() => {
                loadBeneficiarios();
                confetti({ particleCount: 50, spread: 60 });
              }}
            />
          )}

          {/* Module 3: Ficha de Registro (Formulario Oficial Completo) */}
          {activeNavView === "ficha_registro" && (
            <FullRegistrationForm
              onSave={(updated) => {
                handleSaveBeneficiary(updated);
                setEditingBeneficiaryForForm(null);
                setActiveNavView("registros");
              }}
              nextId={nextAutoId}
              editingData={editingBeneficiaryForForm}
              onCancelEdit={() => {
                setEditingBeneficiaryForForm(null);
                setActiveNavView("registros");
              }}
            />
          )}

          {/* Module 4: Expediente Técnico e Ingeniería */}
          {activeNavView === "expedientes" &&
            (!selectedId ? (
              <div className="w-full max-w-7xl mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
                <Wrench className="w-12 h-12 mx-auto text-sky-400" />
                <h2 className="text-xl font-black text-white">
                  Selecciona un Beneficiario para el Expediente Técnico
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Por favor selecciona un expediente de la lista en el menú Registros para
                  visualizar la Ficha Familiar, Planos, Metrados, APU y Presupuesto de obra.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (beneficiarios.length > 0) setSelectedId(beneficiarios[0].id);
                      else setActiveNavView("registros");
                    }}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-sky-600/20 active:scale-95"
                  >
                    Ver Expediente de {beneficiarios[0]?.postulante || "Ejemplo"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
                {/* Header for Selected Beneficiary */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 border-l-4 border-l-sky-500 shadow-xl">
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setActiveNavView("registros");
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-sky-400 font-bold hover:text-sky-300 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Volver a Lista de Beneficiarios
                    </button>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {selectedBeneficiary?.postulante}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Expediente:{" "}
                      <span className="font-bold font-mono text-sky-400">
                        {selectedBeneficiary?.id}
                      </span>{" "}
                      — {selectedBeneficiary?.distrito}, {selectedBeneficiary?.departamento}
                    </p>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 no-print overscroll-contain">
                  {[
                    { id: "ficha", label: "Ficha Familiar", icon: User },
                    { id: "plano", label: "Plano Interactivo", icon: Ruler },
                    { id: "presupuesto", label: "Presupuesto", icon: FileText },
                    { id: "gantt", label: "Cronograma de Obra", icon: Hourglass },
                    { id: "planos", label: "DWG e Ingeniería", icon: CheckCircle2 },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition duration-150 ${
                        activeTab === tab.id
                          ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Views */}
                <div className="py-2">
                  {activeTab === "ficha" && selectedBeneficiary && (
                    <BeneficiaryFicha
                      beneficiario={selectedBeneficiary}
                      onSave={handleSaveBeneficiary}
                      onBack={() => setActiveNavView("registros")}
                    />
                  )}
                  {activeTab === "plano" && (
                    <div>
                      <InteractivePlano
                        dimensiones={dimensiones}
                        onChange={(newDim) => {
                          setDimensiones(newDim);
                        }}
                      />
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => {
                            handleSaveExpedienteData("dimensiones", dimensiones);
                            confetti({ particleCount: 50, spread: 60 });
                          }}
                          className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-2.5 rounded-2xl transition active:scale-95 shadow-lg shadow-sky-600/20"
                        >
                          Guardar Dimensiones
                        </button>
                      </div>
                    </div>
                  )}
                  {activeTab === "presupuesto" && (
                    <PresupuestoSheet
                      dimensiones={dimensiones}
                      insumos={insumos}
                      partidasApu={partidasApu}
                      onSaveMaster={handleSavePresupuestoMaster}
                    />
                  )}
                  {activeTab === "gantt" && (
                    <CronogramaObra
                      tareas={(() => {
                        if (selectedBeneficiary?.notas) {
                          try {
                            const parsed = JSON.parse(selectedBeneficiary.notas);
                            if (parsed.cronogramaObra) return parsed.cronogramaObra;
                          } catch {}
                        }
                        return [];
                      })()}
                      onSave={(tareas) => handleSaveExpedienteData("cronogramaObra", tareas)}
                    />
                  )}
                  {activeTab === "planos" && (
                    <PlanosIngenieria
                      planos={(() => {
                        if (selectedBeneficiary?.notas) {
                          try {
                            const parsed = JSON.parse(selectedBeneficiary.notas);
                            if (parsed.planosIngenieria) return parsed.planosIngenieria;
                          } catch {}
                        }
                        return [];
                      })()}
                      onSave={(planos) => handleSaveExpedienteData("planosIngenieria", planos)}
                    />
                  )}
                </div>
              </div>
            ))}

          {/* Module 5: Documentos */}
          {activeNavView === "documentos" && (
            <DocumentManager beneficiarios={beneficiarios} onRefresh={loadBeneficiarios} />
          )}

          {/* Module 6: Cronograma de Pagos */}
          {activeNavView === "pagos" && <CronogramaPagos beneficiarios={beneficiarios} />}

          {/* Module 7: Maestros de Obra */}
          {activeNavView === "maestros" && <CronogramaMaestros beneficiarios={beneficiarios} />}

          {/* Module 8: Consulta DNI */}
          {activeNavView === "consulta_dni" && <ConsultaDniView />}

          {/* Module 8.5: Contabilidad */}
          {activeNavView === "contabilidad" && <DocumentosContables />}

          {/* Module 9: Configuración Landing */}
          {activeNavView === "landing_config" && <LandingCMS />}

          {/* Module 10: Modelos 3D Vivienda */}
          {activeNavView === "modelos_3d" && <ModelosViviendaAdmin />}
        </main>
      </div>
    </div>
  );
}
