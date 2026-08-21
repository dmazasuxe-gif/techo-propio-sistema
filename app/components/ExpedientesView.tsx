"use client";

import React, { useState, useMemo } from "react";
import { Beneficiario } from "../types";
import { UBIGEO_PERU } from "../constants/ubigeoPeru";
import { getExpedienteStatusBadge, ESTADOS_EXPEDIENTE } from "@/lib/status-helper";
import { 
  Folder, 
  RefreshCw, 
  Search, 
  MapPin, 
  ChevronDown, 
  FilterX, 
  UserCheck,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  X,
  Save,
  Globe
} from "lucide-react";

interface ExpedientesViewProps {
  beneficiarios: Beneficiario[];
  onSelectBeneficiary: (id: string) => void;
  onDeleteBeneficiary?: (id: string) => void;
  onEditBeneficiary?: (updated: Beneficiario) => void;
  onOpenEditForm?: (b: Beneficiario) => void;
  onRefresh?: () => void;
}

export default function ExpedientesView({ 
  beneficiarios, 
  onSelectBeneficiary, 
  onDeleteBeneficiary,
  onEditBeneficiary,
  onOpenEditForm,
  onRefresh 
}: ExpedientesViewProps) {

  // Search Filters State (3 UBIGEO dropdowns + text search)
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("TODOS");
  const [selectedProvFilter, setSelectedProvFilter] = useState<string>("TODAS");
  const [selectedDistFilter, setSelectedDistFilter] = useState<string>("TODOS");
  const [textSearch, setTextSearch] = useState<string>("");

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Edit modal state
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiario | null>(null);

  // Ubigeo lists for dropdowns
  const departamentosList = useMemo(() => ["TODOS", ...Object.keys(UBIGEO_PERU)], []);

  const provinciasList = useMemo(() => {
    if (selectedDeptFilter === "TODOS" || !UBIGEO_PERU[selectedDeptFilter]) {
      const allProvs = new Set<string>();
      Object.values(UBIGEO_PERU).forEach(depObj => {
        Object.keys(depObj).forEach(prov => allProvs.add(prov));
      });
      return ["TODAS", ...Array.from(allProvs).sort()];
    }
    return ["TODAS", ...Object.keys(UBIGEO_PERU[selectedDeptFilter])];
  }, [selectedDeptFilter]);

  const distritosList = useMemo(() => {
    if (selectedDeptFilter !== "TODOS" && selectedProvFilter !== "TODAS") {
      const dists = UBIGEO_PERU[selectedDeptFilter]?.[selectedProvFilter] || [];
      return ["TODOS", ...dists];
    }
    return ["TODOS"];
  }, [selectedDeptFilter, selectedProvFilter]);

  const handleDeptFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDeptFilter(val);
    setSelectedProvFilter("TODAS");
    setSelectedDistFilter("TODOS");
  };

  const handleProvFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProvFilter(val);
    setSelectedDistFilter("TODOS");
  };

  const handleClearFilters = () => {
    setSelectedDeptFilter("TODOS");
    setSelectedProvFilter("TODAS");
    setSelectedDistFilter("TODOS");
    setTextSearch("");
  };

  // Filtered list
  const filteredBeneficiarios = useMemo(() => {
    return beneficiarios.filter(b => {
      if (selectedDeptFilter !== "TODOS") {
        const bDept = (b.departamento || "").trim().toUpperCase();
        if (bDept !== selectedDeptFilter && !bDept.includes(selectedDeptFilter)) return false;
      }

      if (selectedProvFilter !== "TODAS") {
        const bProv = (b.provincia || "").trim().toUpperCase();
        if (bProv !== selectedProvFilter && !bProv.includes(selectedProvFilter)) return false;
      }

      if (selectedDistFilter !== "TODOS") {
        const bDist = (b.distrito || "").trim().toUpperCase();
        if (bDist !== selectedDistFilter && !bDist.includes(selectedDistFilter)) return false;
      }

      if (textSearch.trim() !== "") {
        const q = textSearch.toLowerCase();
        const matchName = b.postulante.toLowerCase().includes(q);
        const matchDni = (b.dniPostulante || "").includes(q);
        const matchId = b.id.toLowerCase().includes(q);
        const matchExp = (b.expediente || "").toLowerCase().includes(q);
        if (!matchName && !matchDni && !matchId && !matchExp) return false;
      }

      return true;
    });
  }, [beneficiarios, selectedDeptFilter, selectedProvFilter, selectedDistFilter, textSearch]);

  // Confirm delete
  const confirmDelete = () => {
    if (deletingId && onDeleteBeneficiary) {
      onDeleteBeneficiary(deletingId);
      setDeletingId(null);
    }
  };

  // Confirm edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBeneficiary && onEditBeneficiary) {
      onEditBeneficiary(editingBeneficiary);
      setEditingBeneficiary(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-md">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Expedientes de Beneficiarios</h1>
            <p className="text-xs text-slate-400">
              Listado completo de beneficiarios registrados, acciones de edición/eliminación y exportación a Excel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 border border-slate-700 hover:border-slate-500 bg-slate-800/80 hover:bg-slate-800 active:scale-95 text-slate-200 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition duration-150 shadow"
          >
            <RefreshCw className="w-4 h-4 text-sky-400" /> Actualizar
          </button>
        </div>
      </div>

      {/* TOP SEARCH & FILTER BAR: 3 UBIGEO SELECTORS + SEARCH BAR */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-black uppercase text-white tracking-wider">
              BÚSQUEDA Y FILTROS POR DEPARTAMENTO, PROVINCIA Y DISTRITO
            </h2>
          </div>

          {(selectedDeptFilter !== "TODOS" || selectedProvFilter !== "TODAS" || selectedDistFilter !== "TODOS" || textSearch !== "") && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-bold transition"
            >
              <FilterX className="w-3.5 h-3.5" /> Limpiar filtros
            </button>
          )}
        </div>

        {/* 3 Dropdown Search Boxes + Text Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Box 1: Departamento */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-sky-400">1. DEPARTAMENTO</label>
            <div className="relative">
              <select
                value={selectedDeptFilter}
                onChange={handleDeptFilterChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold appearance-none focus:outline-none transition shadow-sm"
              >
                <option value="TODOS">Todos los departamentos</option>
                {departamentosList.filter(d => d !== "TODOS").map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Box 2: Provincia */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-sky-400">2. PROVINCIA</label>
            <div className="relative">
              <select
                value={selectedProvFilter}
                onChange={handleProvFilterChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold appearance-none focus:outline-none transition shadow-sm"
              >
                <option value="TODAS">Todas las provincias</option>
                {provinciasList.filter(p => p !== "TODAS").map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Box 3: Distrito */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-sky-400">3. DISTRITO</label>
            <div className="relative">
              <select
                value={selectedDistFilter}
                onChange={(e) => setSelectedDistFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold appearance-none focus:outline-none transition shadow-sm"
              >
                <option value="TODOS">Todos los distritos</option>
                {distritosList.filter(d => d !== "TODOS").map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Text Search Bar */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">BÚSQUEDA LIBRE</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nombre, DNI o código..."
                value={textSearch}
                onChange={(e) => setTextSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

        </div>
      </div>

      {/* BENEFICIARIES LIST TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-black uppercase text-white tracking-wider">
              LISTA DE BENEFICIARIOS REGISTRADOS
            </h2>
          </div>

          <span className="text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full font-mono">
            {filteredBeneficiarios.length} {filteredBeneficiarios.length === 1 ? "beneficiario" : "beneficiarios"}
          </span>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/50">
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">IDENTIFICACIÓN</th>
                <th className="py-3.5 px-4">POSTULANTE</th>
                <th className="py-3.5 px-4">DNI</th>
                <th className="py-3.5 px-4">DEPARTAMENTO</th>
                <th className="py-3.5 px-4">PROVINCIA</th>
                <th className="py-3.5 px-4">DISTRITO</th>
                <th className="py-3.5 px-4">COORD. (X, Y)</th>
                <th className="py-3.5 px-4 text-center">ESTADO</th>
                <th className="py-3.5 px-4 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredBeneficiarios.length > 0 ? (
                filteredBeneficiarios.map((b) => {
                  const coordsStr = b.coordenadaX && b.coordenadaY ? `${b.coordenadaX}, ${b.coordenadaY}` : "-";

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-800/60 transition duration-150 text-slate-200 group"
                    >
                      <td 
                        onClick={() => onSelectBeneficiary(b.id)}
                        className="py-4 px-4 font-mono font-bold text-sky-400 group-hover:text-sky-300 cursor-pointer"
                      >
                        {b.id}
                      </td>
                      <td 
                        onClick={() => onSelectBeneficiary(b.id)}
                        className="py-4 px-4 font-bold text-white group-hover:text-sky-300 transition-colors cursor-pointer"
                      >
                        {b.postulante}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-300">
                        {b.dniPostulante || "12345678"}
                      </td>
                      <td className="py-4 px-4 text-slate-300 uppercase font-semibold">
                        {b.departamento}
                      </td>
                      <td className="py-4 px-4 text-slate-300 uppercase">
                        {b.provincia}
                      </td>
                      <td className="py-4 px-4 text-slate-300 uppercase">
                        {b.distrito}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-400 text-[11px]">
                        {coordsStr}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {(() => {
                          const badge = getExpedienteStatusBadge(b.estado);
                          return (
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${badge.colorClass}`}>
                              {badge.label}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Action Buttons: Mapa, Ver, Editar, Eliminar */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              if (b.coordenadaX && b.coordenadaY) {
                                window.open(`https://www.google.com/maps/search/?api=1&query=${b.coordenadaX},${b.coordenadaY}`, '_blank');
                              }
                            }}
                            className={`p-1.5 rounded-lg border transition active:scale-95 transition-transform duration-150 ${b.coordenadaX && b.coordenadaY ? 'bg-slate-900 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border-slate-800' : 'bg-slate-900/50 text-slate-600 border-slate-800/50 cursor-not-allowed'}`}
                            title={b.coordenadaX && b.coordenadaY ? "Ver en Google Maps" : "No tiene coordenadas registradas"}
                            disabled={!b.coordenadaX || !b.coordenadaY}
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectBeneficiary(b.id)}
                            className="p-1.5 bg-slate-900 hover:bg-sky-600/20 text-sky-400 hover:text-sky-300 rounded-lg border border-slate-800 transition active:scale-95 transition-transform duration-150"
                            title="Ver expediente técnico"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEditForm ? onOpenEditForm(b) : setEditingBeneficiary({ ...b })}
                            className="p-1.5 bg-slate-900 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 rounded-lg border border-slate-800 transition active:scale-95 transition-transform duration-150"
                            title="Editar en formulario completo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(b.id)}
                            className="p-1.5 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-800 transition active:scale-95 transition-transform duration-150"
                            title="Eliminar beneficiario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500 space-y-2">
                    <p className="font-semibold text-xs">No se encontraron beneficiarios registrados en este filtro.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">Confirmar eliminación</h3>
            </div>
            
            <p className="text-xs text-slate-400">
              ¿Estás seguro de que deseas eliminar este beneficiario registrado? Esta acción removerá el expediente del listado.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition active:scale-95 transition-transform duration-150"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-rose-600/20 active:scale-95 transition-transform duration-150"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Beneficiary Modal */}
      {editingBeneficiary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" /> Editar Beneficiario: {editingBeneficiary.id}
              </h3>
              <button 
                onClick={() => setEditingBeneficiary(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-400">Postulante (Nombre Completo)</label>
                  <input
                    type="text"
                    required
                    value={editingBeneficiary.postulante}
                    onChange={(e) => setEditingBeneficiary({ ...editingBeneficiary, postulante: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-400">DNI</label>
                  <input
                    type="text"
                    maxLength={8}
                    value={editingBeneficiary.dniPostulante}
                    onChange={(e) => setEditingBeneficiary({ ...editingBeneficiary, dniPostulante: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-400">Departamento</label>
                  <input
                    type="text"
                    value={editingBeneficiary.departamento}
                    onChange={(e) => setEditingBeneficiary({ ...editingBeneficiary, departamento: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-400">Provincia</label>
                  <input
                    type="text"
                    value={editingBeneficiary.provincia}
                    onChange={(e) => setEditingBeneficiary({ ...editingBeneficiary, provincia: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-400">Distrito</label>
                  <input
                    type="text"
                    value={editingBeneficiary.distrito}
                    onChange={(e) => setEditingBeneficiary({ ...editingBeneficiary, distrito: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-400">Centro Poblado</label>
                  <input
                    type="text"
                    value={editingBeneficiary.centroPoblado || ""}
                    onChange={(e) => setEditingBeneficiary({ ...editingBeneficiary, centroPoblado: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase"
                  />
                </div>

                <div>
                  <label className="font-semibold text-sky-400">Coordenada X (Este)</label>
                  <input
                    type="text"
                    value={editingBeneficiary.coordenadaX || ""}
                    onChange={(e) => setEditingBeneficiary({ ...editingBeneficiary, coordenadaX: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-sky-500/40 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-sky-400">Coordenada Y (Norte)</label>
                  <input
                    type="text"
                    value={editingBeneficiary.coordenadaY || ""}
                    onChange={(e) => setEditingBeneficiary({ ...editingBeneficiary, coordenadaY: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-sky-500/40 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="font-semibold text-amber-400">Estado del Expediente</label>
                  <select
                    value={editingBeneficiary.estado}
                    onChange={(e) => setEditingBeneficiary({ ...editingBeneficiary, estado: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    {ESTADOS_EXPEDIENTE.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBeneficiary(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl active:scale-95 transition-transform duration-150"
                >
                  <Save className="w-3.5 h-3.5" /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
