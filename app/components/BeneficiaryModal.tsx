/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
"use client";

import React, { useState } from "react";
import { Beneficiario } from "../types";
import { UBIGEO_PERU } from "../constants/ubigeoPeru";
import { X, ChevronDown, ChevronUp, RotateCcw, Save } from "lucide-react";

interface BeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Beneficiario) => void;
  initialData?: Beneficiario | null;
  nextId: string;
}

export default function BeneficiaryModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  nextId
}: BeneficiaryModalProps) {
  // Accordion state (open/closed sections)
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    expediente: true,
    postulante: true,
    ubicacion: true,
    linderos: false,
    notas: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const departamentosList = Object.keys(UBIGEO_PERU);

  const getInitialState = (): Beneficiario => {
    if (initialData) return { ...initialData };
    const defaultDep = "LIMA";
    const defaultProv = Object.keys(UBIGEO_PERU[defaultDep] || {})[0] || "LIMA";
    const defaultDist = (UBIGEO_PERU[defaultDep]?.[defaultProv] || [])[0] || "CARABAYLLO";

    return {
      id: nextId || "REG-0001",
      expediente: "",
      estado: "Activo",
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

  const [form, setForm] = useState<Beneficiario>(getInitialState);

  React.useEffect(() => {
    setForm(getInitialState());
  }, [initialData, nextId, isOpen]);

  if (!isOpen) return null;

  // Handle Cascading UBIGEO Selection
  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDep = e.target.value;
    const provinciasObj = UBIGEO_PERU[selectedDep] || {};
    const firstProv = Object.keys(provinciasObj)[0] || "";
    const distritosArr = provinciasObj[firstProv] || [];
    const firstDist = distritosArr[0] || "";

    setForm(prev => ({
      ...prev,
      departamento: selectedDep,
      provincia: firstProv,
      distrito: firstDist
    }));
  };

  const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProv = e.target.value;
    const distritosArr = UBIGEO_PERU[form.departamento]?.[selectedProv] || [];
    const firstDist = distritosArr[0] || "";

    setForm(prev => ({
      ...prev,
      provincia: selectedProv,
      distrito: firstDist
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleClear = () => {
    const defaultDep = "LIMA";
    const defaultProv = "LIMA";
    const defaultDist = "CARABAYLLO";

    setForm({
      id: nextId || "REG-0001",
      expediente: "",
      estado: "Activo",
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
      areaTotal: "",
      porFrente: "",
      porDerecha: "",
      porIzquierda: "",
      porFondo: "",
      areaTechada: "",
      areaConstruida: "",
      notas: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPostulante = form.postulante.trim() || `${form.nombres || ''} ${form.apellidoPaterno || ''} ${form.apellidoMaterno || ''}`.trim() || "Nuevo Postulante";
    const fullConyuge = form.tieneConyuge 
      ? ((form.conyuge || "").trim() || `${form.nombresConyuge || ''} ${form.apellidoPaternoConyuge || ''} ${form.apellidoMaternoConyuge || ''}`.trim())
      : "";
    const fullAddress = form.direccion.trim() || `${form.calle || ''} Mz. ${form.manzana || '-'} Lt. ${form.lote || '-'}`.trim();

    const dataToSave: Beneficiario = {
      ...form,
      postulante: fullPostulante,
      conyuge: fullConyuge,
      direccion: fullAddress
    };

    onSave(dataToSave);
    onClose();
  };

  const currentProvincias = Object.keys(UBIGEO_PERU[form.departamento] || {});
  const currentDistritos = UBIGEO_PERU[form.departamento]?.[form.provincia] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/90">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Nuevo registro</h2>
            <p className="text-xs text-slate-400 mt-0.5">Completa el registro por secciones.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} id="beneficiary-form" className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Section 1: Expediente */}
          <div className="border border-slate-800 rounded-2xl bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("expediente")}
              className="w-full flex items-center justify-between p-4 bg-slate-900/60 hover:bg-slate-800/50 transition text-left font-bold text-sm text-slate-100"
            >
              <span>Expediente</span>
              {openSections.expediente ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {openSections.expediente && (
              <div className="p-5 space-y-4 border-t border-slate-800/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Expediente</label>
                    <input
                      type="text"
                      name="expediente"
                      value={form.expediente || ""}
                      onChange={handleChange}
                      placeholder="Ej. SAN MARTÍN"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">ID automático si queda vacío</label>
                    <input
                      type="text"
                      name="id"
                      value={form.id}
                      onChange={handleChange}
                      placeholder="REG-0001"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:w-1/2 pr-2">
                  <label className="text-xs font-semibold text-slate-400">Estado</label>
                  <div className="relative">
                    <select
                      name="estado"
                      value={form.estado}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none appearance-none transition font-medium"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Borrador">Borrador</option>
                      <option value="Completado">Completado</option>
                      <option value="Presentado">Presentado</option>
                      <option value="Aprobado">Aprobado</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Postulante */}
          <div className="border border-slate-800 rounded-2xl bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("postulante")}
              className="w-full flex items-center justify-between p-4 bg-slate-900/60 hover:bg-slate-800/50 transition text-left font-bold text-sm text-slate-100"
            >
              <span>Postulante</span>
              {openSections.postulante ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {openSections.postulante && (
              <div className="p-5 space-y-4 border-t border-slate-800/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Apellido paterno</label>
                    <input
                      type="text"
                      name="apellidoPaterno"
                      value={form.apellidoPaterno || ""}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Apellido materno</label>
                    <input
                      type="text"
                      name="apellidoMaterno"
                      value={form.apellidoMaterno || ""}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Nombres</label>
                    <input
                      type="text"
                      name="nombres"
                      value={form.nombres || ""}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">DNI</label>
                    <input
                      type="text"
                      name="dniPostulante"
                      value={form.dniPostulante}
                      onChange={handleChange}
                      maxLength={8}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Teléfono</label>
                    <input
                      type="text"
                      name="celular"
                      value={form.celular}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Estado civil</label>
                    <div className="relative">
                      <select
                        name="estadoCivil"
                        value={form.estadoCivil || "Soltero/a"}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none appearance-none transition"
                      >
                        <option value="Soltero/a">Soltero/a</option>
                        <option value="Casado/a">Casado/a</option>
                        <option value="Conviviente">Conviviente</option>
                        <option value="Divorciado/a">Divorciado/a</option>
                        <option value="Viudo/a">Viudo/a</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="inline-flex items-center gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-950/60 cursor-pointer hover:bg-slate-900 transition select-none">
                    <input
                      type="checkbox"
                      name="tieneConyuge"
                      checked={form.tieneConyuge || false}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600 relative"></div>
                    <span className="text-sm font-bold text-white">Tiene cónyuge</span>
                  </label>
                </div>

                {form.tieneConyuge && (
                  <div className="p-4 border border-sky-500/20 bg-sky-500/5 rounded-2xl space-y-4 animate-in fade-in duration-150">
                    <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">Datos del Cónyuge</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">Apellido paterno cónyuge</label>
                        <input
                          type="text"
                          name="apellidoPaternoConyuge"
                          value={form.apellidoPaternoConyuge || ""}
                          onChange={handleChange}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">Apellido materno cónyuge</label>
                        <input
                          type="text"
                          name="apellidoMaternoConyuge"
                          value={form.apellidoMaternoConyuge || ""}
                          onChange={handleChange}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">Nombres cónyuge</label>
                        <input
                          type="text"
                          name="nombresConyuge"
                          value={form.nombresConyuge || ""}
                          onChange={handleChange}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">DNI cónyuge</label>
                        <input
                          type="text"
                          name="dniConyuge"
                          value={form.dniConyuge || ""}
                          onChange={handleChange}
                          maxLength={8}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Ubicacion (Cascading UBIGEO selects) */}
          <div className="border border-slate-800 rounded-2xl bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("ubicacion")}
              className="w-full flex items-center justify-between p-4 bg-slate-900/60 hover:bg-slate-800/50 transition text-left font-bold text-sm text-slate-100"
            >
              <span>Ubicacion (UBIGEO Perú)</span>
              {openSections.ubicacion ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {openSections.ubicacion && (
              <div className="p-5 space-y-4 border-t border-slate-800/50">
                
                {/* Cascading Dropdowns: Departamento -> Provincia -> Distrito */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Departamento Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Departamento</label>
                    <div className="relative">
                      <select
                        name="departamento"
                        value={form.departamento}
                        onChange={handleDepartamentoChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none appearance-none transition font-bold"
                      >
                        {departamentosList.map((dep) => (
                          <option key={dep} value={dep}>
                            {dep}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Provincia Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Provincia</label>
                    <div className="relative">
                      <select
                        name="provincia"
                        value={form.provincia}
                        onChange={handleProvinciaChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none appearance-none transition font-bold"
                      >
                        {currentProvincias.map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Distrito Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Distrito</label>
                    <div className="relative">
                      <select
                        name="distrito"
                        value={form.distrito}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none appearance-none transition font-bold"
                      >
                        {currentDistritos.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Centro poblado <span className="font-normal text-slate-500">opcional</span></label>
                    <input
                      type="text"
                      name="centroPoblado"
                      value={form.centroPoblado || ""}
                      onChange={handleChange}
                      placeholder="Escribe o selecciona"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Barrio / sector</label>
                    <input
                      type="text"
                      name="barrioSector"
                      value={form.barrioSector || ""}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Jr. / Av. / Calle</label>
                    <input
                      type="text"
                      name="calle"
                      value={form.calle || ""}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Manzana</label>
                      <input
                        type="text"
                        name="manzana"
                        value={form.manzana || ""}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Lote</label>
                      <input
                        type="text"
                        name="lote"
                        value={form.lote || ""}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Partida electrónica</label>
                    <input
                      type="text"
                      name="partidaElectronica"
                      value={form.partidaElectronica || ""}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Coordenadas (X / Y)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="coordenadaX"
                        value={form.coordenadaX || ""}
                        onChange={handleChange}
                        placeholder="Coordenada X"
                        className="w-1/2 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none transition"
                      />
                      <input
                        type="text"
                        name="coordenadaY"
                        value={form.coordenadaY || ""}
                        onChange={handleChange}
                        placeholder="Coordenada Y"
                        className="w-1/2 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Section 4: Área y linderos */}
          <div className="border border-slate-800 rounded-2xl bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("linderos")}
              className="w-full flex items-center justify-between p-4 bg-slate-900/60 hover:bg-slate-800/50 transition text-left font-bold text-sm text-slate-100"
            >
              <span>Área y linderos</span>
              {openSections.linderos ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {openSections.linderos && (
              <div className="p-5 space-y-4 border-t border-slate-800/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Área total</label>
                    <input
                      type="text"
                      name="areaTotal"
                      value={form.areaTotal || ""}
                      onChange={handleChange}
                      placeholder="Ej. 120 m²"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Por el frente</label>
                    <input
                      type="text"
                      name="porFrente"
                      value={form.porFrente || ""}
                      onChange={handleChange}
                      placeholder="Ej. 6.00 ml con Ca. Los Olivos"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Por la derecha</label>
                    <input
                      type="text"
                      name="porDerecha"
                      value={form.porDerecha || ""}
                      onChange={handleChange}
                      placeholder="Ej. 20.00 ml con Lote 11"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Por la izquierda</label>
                    <input
                      type="text"
                      name="porIzquierda"
                      value={form.porIzquierda || ""}
                      onChange={handleChange}
                      placeholder="Ej. 20.00 ml con Lote 13"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Por el fondo</label>
                    <input
                      type="text"
                      name="porFondo"
                      value={form.porFondo || ""}
                      onChange={handleChange}
                      placeholder="Ej. 6.00 ml con Lote 5"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Área techada</label>
                    <input
                      type="text"
                      name="areaTechada"
                      value={form.areaTechada || ""}
                      onChange={handleChange}
                      placeholder="Ej. 35.75 m²"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:w-1/2 pr-2">
                  <label className="text-xs font-semibold text-slate-400">Área construida</label>
                  <input
                    type="text"
                    name="areaConstruida"
                    value={form.areaConstruida || ""}
                    onChange={handleChange}
                    placeholder="Ej. 35.75 m²"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Notas */}
          <div className="border border-slate-800 rounded-2xl bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("notas")}
              className="w-full flex items-center justify-between p-4 bg-slate-900/60 hover:bg-slate-800/50 transition text-left font-bold text-sm text-slate-100"
            >
              <span>Notas</span>
              {openSections.notas ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {openSections.notas && (
              <div className="p-5 space-y-4 border-t border-slate-800/50">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Notas</label>
                  <textarea
                    name="notas"
                    rows={4}
                    value={form.notas || ""}
                    onChange={handleChange}
                    placeholder="Observaciones adicionales, estado del predio, documentos adjuntos..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-4 text-sm text-white focus:outline-none resize-y transition"
                  ></textarea>
                </div>
              </div>
            )}
          </div>

        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-900/90">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 border border-slate-700 hover:border-slate-500 bg-transparent text-slate-200 hover:text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition duration-150"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" /> Limpiar
          </button>
          
          <button
            type="submit"
            form="beneficiary-form"
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-sky-600/25 transition duration-150"
          >
            <Save className="w-4 h-4" /> Guardar
          </button>
        </div>

      </div>
    </div>
  );
}
