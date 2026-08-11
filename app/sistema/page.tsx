/* eslint-disable @typescript-eslint/no-unused-vars , react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { Beneficiario, Dimensiones, Insumo, PartidaAPU } from "../types";
import { BENEFICIARIOS_INICIALES, INSUMOS_INICIALES, PARTIDAS_APU_INICIALES } from "../constants/initialData";
import { ArrowLeft, User, Ruler, Wrench, Hourglass, FileText, CheckCircle2, Menu, X } from "lucide-react";

import Sidebar, { NavView } from "../components/Sidebar";
import PeruMap from "../components/PeruMap";
import Dashboard from "../components/Dashboard";
import BeneficiaryFicha from "../components/BeneficiaryFicha";
import DocumentManager from "../components/DocumentManager";
import ExpedientesView from "../components/ExpedientesView";
import FullRegistrationForm from "../components/FullRegistrationForm";
import InteractivePlano from "../components/InteractivePlano";
import MetradosSheet from "../components/MetradosSheet";
import ApuLibrary from "../components/ApuLibrary";
import PresupuestoSheet from "../components/PresupuestoSheet";
import CronogramaObra from "../components/CronogramaObra";
import PlanosIngenieria from "../components/PlanosIngenieria";
import CronogramaPagos from "../components/CronogramaPagos";
import CronogramaMaestros from "../components/CronogramaMaestros";
import ConsultaDniView from "../components/ConsultaDniView";
import LoginScreen from "../components/LoginScreen";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>(BENEFICIARIOS_INICIALES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingBeneficiaryForForm, setEditingBeneficiaryForForm] = useState<Beneficiario | null>(null);
  const [activeTab, setActiveTab] = useState<string>("ficha");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Navigation View State
  const [activeNavView, setActiveNavView] = useState<NavView>("resumen");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Dynamic engineering simulation states
  const [dimensiones, setDimensiones] = useState<Dimensiones>({ largo: 6.5, ancho: 5.5, altura: 2.80, espesorMuro: 0.15, habitaciones: 2 });
  const [insumos, setInsumos] = useState<Insumo[]>(INSUMOS_INICIALES);
  const [partidasApu, setPartidasApu] = useState<PartidaAPU[]>(PARTIDAS_APU_INICIALES);

  const selectedBeneficiary = beneficiarios.find(b => b.id === selectedId);

  const handleSelectExpediente = (id: string) => {
    setSelectedId(id);
    setActiveTab("ficha");
    setActiveNavView("expedientes");
  };

  const handleOpenNewModal = () => {
    setIsModalOpen(true);
  };

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
      } catch(e) {}
    }
    setDimensiones({ largo: 6.5, ancho: 5.5, altura: 2.80, espesorMuro: 0.15, habitaciones: 2 });
  }, [selectedId, beneficiarios]);

  const handleSaveExpedienteData = (key: string, data: any) => {
    if (!selectedBeneficiary) return;
    let notasObj: any = {};
    if (selectedBeneficiary.notas) {
      try { notasObj = JSON.parse(selectedBeneficiary.notas); } catch (e) {}
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
    const exists = beneficiarios.some(b => b.id === updated.id);
    if (exists) {
      setBeneficiarios(prev => prev.map(b => b.id === updated.id ? updated : b));
      fetch("/api/beneficiarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }).catch(console.error);
    } else {
      setBeneficiarios(prev => [updated, ...prev]);
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
    setBeneficiarios(prev => prev.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
    fetch(`/api/beneficiarios?id=${id}`, { method: "DELETE" }).catch(console.error);
  };

  const handleEditBeneficiary = async (updated: Beneficiario) => {
    setBeneficiarios(prev => prev.map(b => b.id === updated.id ? updated : b));
    fetch("/api/beneficiarios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(console.error);
  };

  const handleUpdateInsumoPrice = (id: string, newPrice: number) => {
    setInsumos(prev => prev.map(ins => ins.id === id ? { ...ins, precioUnitario: newPrice } : ins));
  };

  const calculateTotalBudget = (): number => {
    const area = dimensiones.largo * dimensiones.ancho;
    const longMuros = (2 * (dimensiones.largo + dimensiones.ancho)) + (dimensiones.habitaciones >= 1 ? dimensiones.ancho : 0) + (dimensiones.habitaciones >= 2 ? (dimensiones.largo * 0.5) : 0);
    const getQty = (item: string) => {
      if (["01.01", "01.02", "06.01"].includes(item)) return area;
      if (item === "02.01") return longMuros * 0.4 * 1;
      if (item === "03.01") return longMuros * 0.4 * 0.8;
      if (item === "04.01") return Math.max(0, (longMuros * dimensiones.altura) - 6.5);
      if (item === "05.01") return 12 * 0.15 * 0.25 * dimensiones.altura;
      if (item === "07.01" || item === "07.02") return Math.max(0, (longMuros * dimensiones.altura) - 6.5) * 2;
      return 1;
    };
    let totalDirecto = 0;
    partidasApu.forEach(p => {
      let unitCost = 0;
      [...p.manoDeObra, ...p.materiales, ...p.equipos].forEach(d => {
        const ins = insumos.find(i => i.id === d.insumoId);
        if (ins) unitCost += d.coeficiente * ins.precioUnitario;
      });
      totalDirecto += getQty(p.item) * unitCost;
    });
    return (totalDirecto * 1.15) * 1.18;
  };

  const nextAutoId = `REG-${String(beneficiarios.length + 1).padStart(4, "0")}`;

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => handleLoginStatus(true)} />;
  }

  return (
    <div className="flex h-[100svh] w-full bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      
      {/* ── DESKTOP Sidebar (hidden on mobile) ── */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar
          activeView={activeNavView}
          onSelectView={handleNavSelect}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={() => handleLoginStatus(false)}
        />
      </div>

      {/* ── MOBILE Drawer overlay ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── MOBILE Drawer panel ── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex flex-col md:hidden transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          activeView={activeNavView}
          onSelectView={handleNavSelect}
          isCollapsed={false}
          onToggleCollapse={() => setMobileMenuOpen(false)}
          onLogout={() => { handleLoginStatus(false); setMobileMenuOpen(false); }}
        />
      </div>

      {/* ── Main App Content Area ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Top App Header */}
        <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm md:text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              Techo Propio
              <span className="hidden sm:inline text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">Maza Quiroz</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-slate-400 font-semibold border border-slate-800 bg-slate-900 px-3 py-1.5 rounded-xl">
              Sistema de Gestión
            </span>
          </div>
        </header>

        {/* View Router */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
          
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

          {/* Module 4: Expediente Técnico e Ingeniería (Imagen 1: Ficha, Plano, Metrados, APU, Presupuesto, Cronograma, DWG) */}
          {activeNavView === "expedientes" && (
            !selectedId ? (
              <div className="w-full max-w-7xl mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
                <Wrench className="w-12 h-12 mx-auto text-sky-400" />
                <h2 className="text-xl font-black text-white">Selecciona un Beneficiario para el Expediente Técnico</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Por favor selecciona un expediente de la lista en el menú Registros para visualizar la Ficha Familiar, Planos, Metrados, APU y Presupuesto de obra.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (beneficiarios.length > 0) setSelectedId(beneficiarios[0].id);
                      else setActiveNavView("registros");
                    }}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-sky-600/20 active:scale-95 transition-transform duration-150"
                  >
                    Ver Expediente de {beneficiarios[0]?.postulante || "Ejemplo"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
                
                {/* Header for Selected Beneficiary */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 border-l-4 border-l-sky-500 shadow-xl">
                  <div className="space-y-1">
                    <button 
                      onClick={() => {
                        setActiveNavView("registros");
                      }} 
                      className="inline-flex items-center gap-1.5 text-xs text-sky-400 font-bold hover:text-sky-300 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Volver a Lista de Beneficiarios
                    </button>
                    <h2 className="text-2xl font-black text-white">{selectedBeneficiary?.postulante}</h2>
                    <p className="text-xs text-slate-400">
                      Expediente: <span className="font-bold font-mono text-sky-400">{selectedBeneficiary?.id}</span> — {selectedBeneficiary?.distrito}, {selectedBeneficiary?.departamento}
                    </p>
                  </div>
                  
                </div>


                {/* Navigation Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 no-print">
                  {[
                    { id: "ficha", label: "Ficha Familiar", icon: User },
                    { id: "plano", label: "Plano Interactivo", icon: Ruler },
                    { id: "presupuesto", label: "Presupuesto", icon: FileText },
                    { id: "gantt", label: "Cronograma de Obra", icon: Hourglass },
                    { id: "planos", label: "DWG e Ingeniería", icon: CheckCircle2 }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition duration-150 ${activeTab === tab.id ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}
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
                          className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-2 rounded-xl transition active:scale-95 transition-transform duration-150"
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
                    />
                  )}
                  {activeTab === "gantt" && (
                    <CronogramaObra 
                      tareas={
                        (() => {
                          if (selectedBeneficiary?.notas) {
                            try {
                              const parsed = JSON.parse(selectedBeneficiary.notas);
                              if (parsed.cronogramaObra) return parsed.cronogramaObra;
                            } catch(e) {}
                          }
                          return [];
                        })()
                      }
                      onSave={(tareas) => handleSaveExpedienteData("cronogramaObra", tareas)}
                    />
                  )}
                  {activeTab === "planos" && (
                    <PlanosIngenieria 
                      planos={
                        (() => {
                          if (selectedBeneficiary?.notas) {
                            try {
                              const parsed = JSON.parse(selectedBeneficiary.notas);
                              if (parsed.planosIngenieria) return parsed.planosIngenieria;
                            } catch(e) {}
                          }
                          return [];
                        })()
                      }
                      onSave={(planos) => handleSaveExpedienteData("planosIngenieria", planos)}
                    />
                  )}
                </div>
              </div>
            )
          )}

          {/* Module 5: Documentos (Gestor de Documentos) */}
          {activeNavView === "documentos" && (
            <DocumentManager beneficiarios={beneficiarios} onRefresh={loadBeneficiarios} />
          )}

          {/* Module 6: Cronograma de Pagos (Financieras + Desembolsos) */}
          {activeNavView === "pagos" && (
            <CronogramaPagos beneficiarios={beneficiarios} />
          )}

          {/* Module 7: Maestros de Obra */}
          {activeNavView === "maestros" && (
            <CronogramaMaestros beneficiarios={beneficiarios} />
          )}

          {/* Module 8: Consulta DNI */}
          {activeNavView === "consulta_dni" && (
            <ConsultaDniView />
          )}

        </main>

        {/* ── MOBILE Bottom Navigation Bar ── */}
        <nav className="md:hidden flex-shrink-0 flex items-stretch border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl safe-bottom">
          {([
            { id: "resumen",       label: "Inicio",    emoji: "🗺️" },
            { id: "registros",     label: "Lista",     emoji: "👥" },
            { id: "expedientes",   label: "Expediente",emoji: "📁" },
            { id: "documentos",    label: "Docs",      emoji: "📄" },
            { id: "pagos",         label: "Pagos",     emoji: "💳" },
            { id: "consulta_dni",  label: "DNI",       emoji: "🔍" },
          ] as { id: import("../components/Sidebar").NavView; label: string; emoji: string }[]).map(item => (
            <button
              key={item.id}
              onClick={() => handleNavSelect(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                activeNavView === item.id
                  ? "text-sky-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="text-base leading-none">{item.emoji}</span>
              <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
              {activeNavView === item.id && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-sky-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
