/* eslint-disable @typescript-eslint/no-explicit-any , react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { Beneficiario } from "../types";
import { UBIGEO_PERU } from "../constants/ubigeoPeru";
import { 
  UserPlus, 
  Save, 
  RotateCcw, 
  MapPin, 
  User, 
  FolderCheck, 
  Ruler, 
  FileText,
  ChevronDown,
  CheckCircle
} from "lucide-react";

interface FullRegistrationFormProps {
  onSave: (data: Beneficiario) => void;
  nextId: string;
  editingData?: Beneficiario | null;
  onCancelEdit?: () => void;
  beneficiarios?: Beneficiario[];
}

import DniLookupModal from "./DniLookupModal";

export default function FullRegistrationForm({ onSave, nextId, editingData, onCancelEdit, beneficiarios = [] }: FullRegistrationFormProps) {
  const [isDniModalOpen, setIsDniModalOpen] = useState(false);
  const departamentosList = Object.keys(UBIGEO_PERU);

  const getInitialState = (): Beneficiario => {
    const defaultDep = "SAN MARTIN";
    const defaultProv = Object.keys(UBIGEO_PERU[defaultDep] || {})[0] || "SAN MARTIN";
    const defaultDist = (UBIGEO_PERU[defaultDep]?.[defaultProv] || [])[0] || "TARAPOTO";

    return {
      id: nextId || `REG-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      expediente: "",
      estado: "Expediente en Revisión",
      postulante: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      nombres: "",
      dniPostulante: "",
      celular: "",
      estadoCivil: "Soltero/a",
      tieneConyuge: false,
      conyuge: "",
      dniConyuge: "",
      apellidoPaternoConyuge: "",
      apellidoMaternoConyuge: "",
      nombresConyuge: "",
      departamento: defaultDep,
      provincia: defaultProv,
      distrito: defaultDist,
      centroPoblado: "",
      barrioSector: "",
      calle: "",
      manzana: "",
      lote: "",
      partidaElectronica: "",
      coordenadaX: "",
      coordenadaY: "",
      direccion: "",
      fechaNacimiento: "",
      fechaNacimientoConyuge: "",
      areaTotal: "",
      porFrente: "",
      porDerecha: "",
      porIzquierda: "",
      porFondo: "",
      areaTechada: "",
      areaConstruida: "",
      notas: ""
    };
  };

  const [form, setForm] = useState<Beneficiario>(() => editingData || getInitialState());

  useEffect(() => {
    if (editingData) {
      setForm(editingData);
    }
  }, [editingData]);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cascading UBIGEO options
  const provinciasObj = UBIGEO_PERU[form.departamento] || {};
  const provinciasList = Object.keys(provinciasObj);
  const distritosList = provinciasObj[form.provincia] || [];

  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDep = e.target.value;
    const provs = UBIGEO_PERU[selectedDep] || {};
    const firstProv = Object.keys(provs)[0] || "";
    const dists = provs[firstProv] || [];
    const firstDist = dists[0] || "";

    setForm(prev => ({
      ...prev,
      departamento: selectedDep,
      provincia: firstProv,
      distrito: firstDist,
      expediente: selectedDep
    }));
  };

  const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProv = e.target.value;
    const dists = provinciasObj[selectedProv] || [];
    const firstDist = dists[0] || "";

    setForm(prev => ({
      ...prev,
      provincia: selectedProv,
      distrito: firstDist
    }));
  };

  const updateFullName = (nom: string, pat: string, mat: string) => {
    const full = `${nom} ${pat} ${mat}`.trim();
    setForm(prev => ({ ...prev, postulante: full }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingData && form.dniPostulante) {
      const duplicate = beneficiarios.find(b => b.dniPostulante === form.dniPostulante);
      if (duplicate) {
        alert(`Este DNI ya se encuentra registrado como beneficiario (Expediente: ${duplicate.id}). No se puede crear un registro duplicado.`);
        return;
      }
    }

    const fullDir = `${form.calle || ""} Mz ${form.manzana || ""} Lt ${form.lote || ""}`.trim();
    const finalDir = fullDir || `Distrito de ${form.distrito}`;

    const fullPostulante = `${form.nombres || ""} ${form.apellidoPaterno || ""} ${form.apellidoMaterno || ""}`.trim() || form.postulante || "Postulante Sin Nombre";

    const finalData: Beneficiario = {
      ...form,
      postulante: fullPostulante,
      direccion: finalDir
    };

    onSave(finalData);
    setSuccessMessage(`¡Beneficiario ${form.postulante} registrado con éxito con expediente ${form.id}!`);

    // Reset form after 2.5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
      setForm(getInitialState());
    }, 2500);
  };

  const handleReset = () => {
    setForm(getInitialState());
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {editingData ? `Editando Expediente: ${editingData.postulante}` : "Ficha de Registro de Beneficiario"}
            </h1>
            <p className="text-xs text-slate-400">
              {editingData ? "Modifica cualquier dato del formulario oficial y guarda los cambios." : "Formulario oficial completo de postulación Techo Propio (Código CSP: Maza Quiroz)."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3.5 py-2 rounded-xl">
            {form.id}
          </span>
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex items-center gap-1.5 border border-slate-700 hover:border-slate-500 bg-slate-800 text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition"
            >
              Cancelar Edición
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 border border-slate-700 hover:border-slate-500 bg-slate-800 text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Limpiar
          </button>
        </div>
      </div>

      {/* Alert Banner for Success */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-2 shadow-lg animate-in slide-in-from-top duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Full Screen Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Expediente & Identificación */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <FolderCheck className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-black uppercase text-white tracking-wider">
              1. IDENTIFICACIÓN Y EXPEDIENTE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">ID Expediente Autogenerado</label>
              <input
                type="text"
                disabled
                value={form.id}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-sky-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Nombre de Grupo / Expediente</label>
              <input
                type="text"
                value={form.expediente || ""}
                onChange={(e) => setForm({ ...form, expediente: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-bold focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Estado del Registro</label>
              <select
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value as any })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-semibold focus:outline-none transition"
              >
                <option value="Expediente en Revisión">Expediente en Revisión</option>
                <option value="Expediente Inscrito">Expediente Inscrito</option>
                <option value="Expediente Elegible">Expediente Elegible</option>
                <option value="Expediente No Elegible">Expediente No Elegible</option>
                <option value="Expediente con Código de Proyecto">Expediente con Código de Proyecto</option>
                <option value="Expediente Aprobado">Expediente Aprobado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Datos del Postulante */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-black uppercase text-white tracking-wider">
              2. DATOS PERSONALES DEL POSTULANTE
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">Nombres *</label>
              <input
                type="text"
                required
                value={form.nombres || ""}
                onChange={(e) => {
                  const nom = e.target.value;
                  setForm({ ...form, nombres: nom });
                  updateFullName(nom, form.apellidoPaterno || "", form.apellidoMaterno || "");
                }}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-bold focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Apellido Paterno *</label>
              <input
                type="text"
                required
                value={form.apellidoPaterno || ""}
                onChange={(e) => {
                  const pat = e.target.value;
                  setForm({ ...form, apellidoPaterno: pat });
                  updateFullName(form.nombres || "", pat, form.apellidoMaterno || "");
                }}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-bold focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Apellido Materno *</label>
              <input
                type="text"
                required
                value={form.apellidoMaterno || ""}
                onChange={(e) => {
                  const mat = e.target.value;
                  setForm({ ...form, apellidoMaterno: mat });
                  updateFullName(form.nombres || "", form.apellidoPaterno || "", mat);
                }}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-bold focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">DNI del Postulante *</label>
              <div className="flex gap-2">
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={8}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none transition"
                  value={form.dniPostulante}
                  onChange={(e) => setForm({ ...form, dniPostulante: e.target.value.replace(/\D/g, '') })}
                />
                {!editingData && (
                  <button
                    type="button"
                    onClick={() => setIsDniModalOpen(true)}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap"
                  >
                    🔍 Consultar DNI
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-400">Fecha de Nacimiento (DD/MM/AAAA)</label>
              <input
                type="tel"
                inputMode="decimal"
                placeholder="DD/MM/AAAA"
                value={form.fechaNacimiento || ""}
                onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Celular / Teléfono</label>
              <input
                type="tel"
                inputMode="numeric"
                value={form.celular}
                onChange={(e) => setForm({ ...form, celular: e.target.value.replace(/[^0-9]/g, '') })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Estado Civil</label>
              <select
                value={form.estadoCivil}
                onChange={(e) => setForm({ ...form, estadoCivil: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition font-semibold"
              >
                <option value="Soltero/a">Soltero/a</option>
                <option value="Casado/a">Casado/a</option>
                <option value="Conviviente">Conviviente</option>
                <option value="Divorciado/a">Divorciado/a</option>
                <option value="Viudo/a">Viudo/a</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Carga Familiar / Cónyuge */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-sky-400" />
              <h2 className="text-xs font-black uppercase text-white tracking-wider">
                3. CARGA FAMILIAR / CÓNYUGE
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                const nuevaCarga = form.cargaFamiliar ? [...form.cargaFamiliar] : [];
                nuevaCarga.push({
                  id: Math.random().toString(36).substring(7),
                  parentesco: "Cónyuge / Conviviente",
                  nombres: "",
                  apellidos: "",
                  dni: "",
                  fechaNacimiento: ""
                });
                setForm({ ...form, cargaFamiliar: nuevaCarga });
              }}
              className="bg-sky-500 hover:bg-sky-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-lg shadow-sky-500/20"
            >
              + Agregar integrante
            </button>
          </div>

          <p className="text-[10px] text-slate-500 font-medium">
            Incluye cónyuge o conviviente, hijos, hermanos, padres o abuelos que dependan del postulante.
          </p>

          {(form.cargaFamiliar || []).length > 0 && (
            <div className="space-y-3">
              {(form.cargaFamiliar || []).map((integrante, index) => (
                <div key={integrante.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 relative group animate-in fade-in">
                  
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Parentesco</label>
                    <select
                      value={integrante.parentesco}
                      onChange={(e) => {
                        const newCarga = [...(form.cargaFamiliar || [])];
                        newCarga[index].parentesco = e.target.value;
                        setForm({ ...form, cargaFamiliar: newCarga });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg px-2 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Cónyuge / Conviviente">Cónyuge / Conviviente</option>
                      <option value="Esposo o Esposa">Esposo o Esposa</option>
                      <option value="Mamá">Mamá</option>
                      <option value="Papá">Papá</option>
                      <option value="Hijo o Hija">Hijo o Hija</option>
                      <option value="Hermano o Hermana">Hermano o Hermana</option>
                      <option value="Nieto o Nieta">Nieto o Nieta</option>
                      <option value="Abuelo o Abuela">Abuelo o Abuela</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Nombres</label>
                    <input
                      type="text"
                      value={integrante.nombres}
                      onChange={(e) => {
                        const newCarga = [...(form.cargaFamiliar || [])];
                        newCarga[index].nombres = e.target.value;
                        setForm({ ...form, cargaFamiliar: newCarga });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg px-2 py-2 text-xs text-white uppercase focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Apellidos</label>
                    <input
                      type="text"
                      value={integrante.apellidos}
                      onChange={(e) => {
                        const newCarga = [...(form.cargaFamiliar || [])];
                        newCarga[index].apellidos = e.target.value;
                        setForm({ ...form, cargaFamiliar: newCarga });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg px-2 py-2 text-xs text-white uppercase focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">DNI</label>
                    <div className="flex gap-1">
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={8}
                        value={integrante.dni}
                        onChange={(e) => {
                          const newCarga = [...(form.cargaFamiliar || [])];
                          newCarga[index].dni = e.target.value.replace(/\D/g, '');
                          setForm({ ...form, cargaFamiliar: newCarga });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg px-2 py-2 text-xs text-white font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (integrante.dni.length === 8) {
                            try {
                              const res = await fetch(`/api/consulta-dni?dni=${integrante.dni}`);
                              const data = await res.json();
                              if (data.success && data.data) {
                                const newCarga = [...(form.cargaFamiliar || [])];
                                newCarga[index].nombres = data.data.nombres || "";
                                newCarga[index].apellidos = `${data.data.apellidoPaterno || ""} ${data.data.apellidoMaterno || ""}`.trim();
                                setForm({ ...form, cargaFamiliar: newCarga });
                              } else {
                                alert("DNI no encontrado");
                              }
                            } catch (e) {
                              alert("Error consultando DNI");
                            }
                          }
                        }}
                        className="bg-sky-600 hover:bg-sky-500 text-white px-2 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center"
                        title="Consultar DNI"
                      >
                        🔍
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">F. Nacimiento (DD/MM/AAAA)</label>
                    <input
                      type="tel"
                      inputMode="decimal"
                      value={integrante.fechaNacimiento || ""}
                      onChange={(e) => {
                        const newCarga = [...(form.cargaFamiliar || [])];
                        newCarga[index].fechaNacimiento = e.target.value;
                        setForm({ ...form, cargaFamiliar: newCarga });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg px-2 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1 relative flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const newCarga = [...(form.cargaFamiliar || [])];
                        newCarga.splice(index, 1);
                        setForm({ ...form, cargaFamiliar: newCarga });
                      }}
                      className="w-full bg-red-950/50 hover:bg-red-900/80 text-red-400 border border-red-900/50 hover:border-red-500/50 rounded-lg py-2 text-[10px] font-bold transition flex items-center justify-center gap-1"
                    >
                      Eliminar X
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Ubicación con UBIGEO Nacional Completo */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <MapPin className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-black uppercase text-white tracking-wider">
              4. UBICACIÓN GEOGRÁFICA DEL PREDIO (UBIGEO NACIONAL DEL PERÚ)
            </h2>
          </div>

          {/* Cascading 3 UBIGEO Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Departamento Dropdown */}
            <div>
              <label className="text-xs font-bold text-sky-400">1. DEPARTAMENTO *</label>
              <div className="relative mt-1">
                <select
                  value={form.departamento}
                  onChange={handleDepartamentoChange}
                  className="w-full bg-slate-950 border border-sky-500/50 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold appearance-none focus:outline-none transition shadow-md shadow-sky-500/10"
                >
                  {departamentosList.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-sky-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Provincia Dropdown */}
            <div>
              <label className="text-xs font-bold text-sky-400">2. PROVINCIA *</label>
              <div className="relative mt-1">
                <select
                  value={form.provincia}
                  onChange={handleProvinciaChange}
                  className="w-full bg-slate-950 border border-sky-500/50 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold appearance-none focus:outline-none transition shadow-md shadow-sky-500/10"
                >
                  {provinciasList.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-sky-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Distrito Dropdown */}
            <div>
              <label className="text-xs font-bold text-sky-400">3. DISTRITO *</label>
              <div className="relative mt-1">
                <select
                  value={form.distrito}
                  onChange={(e) => setForm({ ...form, distrito: e.target.value })}
                  className="w-full bg-slate-950 border border-sky-500/50 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold appearance-none focus:outline-none transition shadow-md shadow-sky-500/10"
                >
                  {distritosList.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-sky-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Urban details */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-400">Centro Poblado</label>
              <input
                type="text"
                value={form.centroPoblado || ""}
                onChange={(e) => setForm({ ...form, centroPoblado: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Barrio / Sector</label>
              <input
                type="text"
                value={form.barrioSector || ""}
                onChange={(e) => setForm({ ...form, barrioSector: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Jr. / Av. / Calle</label>
              <input
                type="text"
                value={form.calle || ""}
                onChange={(e) => setForm({ ...form, calle: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Partida Registral SUNARP</label>
              <input
                type="text"
                inputMode="decimal"
                value={form.partidaElectronica || ""}
                onChange={(e) => setForm({ ...form, partidaElectronica: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
              />
            </div>
          </div>

          {/* Licencia Construcción y Conformidad de Obra */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-400">N° Licencia de Construcción</label>
              <input
                type="text"
                value={(form as any).licenciaConstruccion || ""}
                onChange={(e) => setForm({ ...form, licenciaConstruccion: e.target.value } as any)}
                placeholder="Ej. LC-2026-001234"
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">N° Conformidad de Obra</label>
              <input
                type="text"
                value={(form as any).conformidadObra || ""}
                onChange={(e) => setForm({ ...form, conformidadObra: e.target.value } as any)}
                placeholder="Ej. CO-2026-005678"
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
              />
            </div>
          </div>


          {/* Manzana, Lote, y Coordenadas UTM X e Y */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-400">Manzana (Mz.)</label>
              <input
                type="text"
                value={form.manzana || ""}
                onChange={(e) => setForm({ ...form, manzana: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Lote (Lt.)</label>
              <input
                type="text"
                value={form.lote || ""}
                onChange={(e) => setForm({ ...form, lote: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-sky-400">Coordenada X (Este UTM)</label>
              <input
                type="tel"
                inputMode="decimal"
                value={form.coordenadaX || ""}
                onChange={(e) => setForm({ ...form, coordenadaX: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-sky-500/40 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none transition shadow-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-sky-400">Coordenada Y (Norte UTM)</label>
              <input
                type="tel"
                inputMode="decimal"
                value={form.coordenadaY || ""}
                onChange={(e) => setForm({ ...form, coordenadaY: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-sky-500/40 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none transition shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Datos del Terreno y Medidas */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Ruler className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-black uppercase text-white tracking-wider">
              4. DIMENSIONES DEL PREDIO Y LINDEROS (M2 Y METROS LINEALES)
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">Área Total (m²)</label>
              <input
                type="tel"
                inputMode="decimal"
                value={form.areaTotal || ""}
                onChange={(e) => setForm({ ...form, areaTotal: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Por el Frente (m)</label>
              <input
                type="tel"
                inputMode="decimal"
                value={form.porFrente || ""}
                onChange={(e) => setForm({ ...form, porFrente: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Por la Derecha (m)</label>
              <input
                type="tel"
                inputMode="decimal"
                value={form.porDerecha || ""}
                onChange={(e) => setForm({ ...form, porDerecha: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Por el Fondo (m)</label>
              <input
                type="tel"
                inputMode="decimal"
                value={form.porFondo || ""}
                onChange={(e) => setForm({ ...form, porFondo: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Section 7: Notas y Observaciones */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileText className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-black uppercase text-white tracking-wider">
              7. NOTAS Y OBSERVACIONES
            </h2>
          </div>

          <div>
            <textarea
              rows={3}
              value={form.notas || ""}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl p-4 text-xs text-white focus:outline-none transition"
            />
          </div>
        </div>

        {/* Section 6: Documentos y Archivos Adjuntos */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FolderCheck className="w-4 h-4 text-sky-400" />
              <h2 className="text-xs font-black uppercase text-white tracking-wider">
                6. DOCUMENTOS Y ARCHIVOS ADJUNTOS (DNI, COPIA LITERAL, AUTOAVALUO, FOTOS, OTROS)
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
              {(form.documentos || []).length} archivos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { type: "DNI Postulante", label: "DNI del Postulante" },
              { type: "DNI Cónyuge", label: "DNI del Cónyuge" },
              { type: "DNI Carga Familiar", label: "DNI Carga Familiar" },
              { type: "Copia Literal", label: "Copia Literal SUNARP" },
              { type: "Autoavaluo", label: "Autoavaluo / HR / PU" },
              { type: "Fotografías del Predio", label: "Fotos de la Vivienda / Predio" },
              { type: "Otros Documentos", label: "Otros Documentos Adjuntos" },
            ].map(item => {
              const attached = (form.documentos || []).find(d => d.tipo === item.type);

              return (
                <div key={item.type} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 truncate">
                    <span className="text-xs font-bold text-slate-300 block">{item.label}</span>
                    <span className="text-[11px] font-mono text-slate-500 truncate block">
                      {attached ? attached.nombre : "Sin archivo adjunto"}
                    </span>
                  </div>

                  <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-sky-400 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 transition shrink-0">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const newDoc = {
                            id: `DOC-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                            tipo: item.type,
                            nombre: file.name,
                            url: URL.createObjectURL(file),
                            fecha: new Date().toLocaleDateString("es-PE")
                          };
                          setForm(prev => ({
                            ...prev,
                            documentos: [...(prev.documentos || []).filter(d => d.tipo !== item.type), newDoc]
                          }));
                        }
                      }}
                    />
                    {attached ? "Cambiar" : "+ Subir"}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl transition duration-150 shadow-lg shadow-sky-600/30"
          >
            <Save className="w-4 h-4" /> {editingData ? "Guardar Cambios del Expediente" : "Guardar Registro de Beneficiario"}
          </button>
        </div>

      </form>

      <DniLookupModal
        isOpen={isDniModalOpen}
        onClose={() => setIsDniModalOpen(false)}
        title="Consultar DNI - Beneficiario"
        confirmText="SÍ, REGISTRAR BENEFICIARIO"
        onConfirm={(data) => {
          // Check for duplicates before filling form
          const duplicate = beneficiarios.find(b => b.dniPostulante === data.dni);
          if (duplicate) {
            alert("Este DNI ya se encuentra registrado como beneficiario.");
            return;
          }
          setForm(prev => ({
            ...prev,
            dniPostulante: data.dni,
            nombres: data.nombres,
            apellidoPaterno: data.apellidoPaterno || "",
            apellidoMaterno: data.apellidoMaterno || "",
            fechaNacimiento: data.fechaNacimiento || prev.fechaNacimiento
          }));
          setIsDniModalOpen(false);
        }}
      />
    </div>
  );
}
