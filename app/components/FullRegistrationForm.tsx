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
}

export default function FullRegistrationForm({ onSave, nextId, editingData, onCancelEdit }: FullRegistrationFormProps) {
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
      codigoCatastral: "",
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

  const updateConyugeFullName = (nom: string, pat: string, mat: string) => {
    const full = `${nom} ${pat} ${mat}`.trim();
    setForm(prev => ({ ...prev, conyuge: full }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fullDir = `${form.calle || ""} Mz ${form.manzana || ""} Lt ${form.lote || ""}`.trim();
    const finalDir = fullDir || `Distrito de ${form.distrito}`;

    const fullPostulante = `${form.nombres || ""} ${form.apellidoPaterno || ""} ${form.apellidoMaterno || ""}`.trim() || form.postulante || "Postulante Sin Nombre";

    const finalData: Beneficiario = {
      ...form,
      postulante: fullPostulante,
      direccion: finalDir,
      codigoCatastral: form.codigoCatastral || `${Math.floor(10000000000000 + Math.random() * 90000000000000)}`
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
              <label className="text-xs font-semibold text-slate-400">DNI del Postulante *</label>
              <input
                type="text"
                required
                maxLength={8}
                value={form.dniPostulante}
                onChange={(e) => setForm({ ...form, dniPostulante: e.target.value.replace(/\D/g, '') })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-400">Fecha de Nacimiento (DD/MM/AAAA)</label>
              <input
                type="text"
                placeholder="DD/MM/AAAA"
                value={form.fechaNacimiento || ""}
                onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Celular / Teléfono</label>
              <input
                type="text"
                value={form.celular}
                onChange={(e) => setForm({ ...form, celular: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Estado Civil</label>
              <select
                value={form.estadoCivil}
                onChange={(e) => {
                  const st = e.target.value;
                  const hasConyuge = st === "Casado/a" || st === "Conviviente";
                  setForm({ ...form, estadoCivil: st, tieneConyuge: hasConyuge });
                }}
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

          {/* Cónyuge sub-section if married */}
          {form.tieneConyuge && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 mt-3 animate-in fade-in">
              <h3 className="text-xs font-bold text-sky-400 uppercase">DATOS DEL CÓNYUGE / CONVIVIENTE</h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Nombres Cónyuge</label>
                  <input
                    type="text"
                    value={form.nombresConyuge || ""}
                    onChange={(e) => {
                      const nom = e.target.value;
                      setForm({ ...form, nombresConyuge: nom });
                      updateConyugeFullName(nom, form.apellidoPaternoConyuge || "", form.apellidoMaternoConyuge || "");
                    }}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Ap. Paterno Cónyuge</label>
                  <input
                    type="text"
                    value={form.apellidoPaternoConyuge || ""}
                    onChange={(e) => {
                      const pat = e.target.value;
                      setForm({ ...form, apellidoPaternoConyuge: pat });
                      updateConyugeFullName(form.nombresConyuge || "", pat, form.apellidoMaternoConyuge || "");
                    }}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Ap. Materno Cónyuge</label>
                  <input
                    type="text"
                    value={form.apellidoMaternoConyuge || ""}
                    onChange={(e) => {
                      const mat = e.target.value;
                      setForm({ ...form, apellidoMaternoConyuge: mat });
                      updateConyugeFullName(form.nombresConyuge || "", form.apellidoPaternoConyuge || "", mat);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">DNI Cónyuge</label>
                  <input
                    type="text"
                    maxLength={8}
                    value={form.dniConyuge || ""}
                    onChange={(e) => setForm({ ...form, dniConyuge: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">F. Nacimiento (DD/MM/AAAA)</label>
                  <input
                    type="text"
                    value={form.fechaNacimientoConyuge || ""}
                    onChange={(e) => setForm({ ...form, fechaNacimientoConyuge: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Ubicación con UBIGEO Nacional Completo */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <MapPin className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-black uppercase text-white tracking-wider">
              3. UBICACIÓN GEOGRÁFICA DEL PREDIO (UBIGEO NACIONAL DEL PERÚ)
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
                type="text"
                value={form.coordenadaX || ""}
                onChange={(e) => setForm({ ...form, coordenadaX: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-sky-500/40 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none transition shadow-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-sky-400">Coordenada Y (Norte UTM)</label>
              <input
                type="text"
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
                type="text"
                value={form.areaTotal || ""}
                onChange={(e) => setForm({ ...form, areaTotal: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Por el Frente (m)</label>
              <input
                type="text"
                value={form.porFrente || ""}
                onChange={(e) => setForm({ ...form, porFrente: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Por la Derecha (m)</label>
              <input
                type="text"
                value={form.porDerecha || ""}
                onChange={(e) => setForm({ ...form, porDerecha: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Por el Fondo (m)</label>
              <input
                type="text"
                value={form.porFondo || ""}
                onChange={(e) => setForm({ ...form, porFondo: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Notas y Observaciones */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileText className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-black uppercase text-white tracking-wider">
              5. NOTAS Y OBSERVACIONES
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

    </div>
  );
}
