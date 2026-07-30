/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars , react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { Beneficiario } from "../types";
import { UBIGEO_PERU } from "../constants/ubigeoPeru";
import { getExpedienteStatusBadge } from "@/lib/status-helper";
import {
  ArrowLeft, Save, ShieldCheck, Download,
  User, MapPin, FolderCheck, Ruler, FileText, ChevronDown
} from "lucide-react";

interface BeneficiaryFichaProps {
  beneficiario: Beneficiario;
  onSave: (data: Beneficiario) => void;
  onBack: () => void;
}

export default function BeneficiaryFicha({ beneficiario, onSave, onBack }: BeneficiaryFichaProps) {
  const [form, setForm] = useState<Beneficiario>({ ...beneficiario });

  useEffect(() => {
    setForm({ ...beneficiario });
  }, [beneficiario]);

  const departamentosList = Object.keys(UBIGEO_PERU);
  const provinciasObj = UBIGEO_PERU[form.departamento] || {};
  const provinciasList = Object.keys(provinciasObj);
  const distritosList = provinciasObj[form.provincia] || [];

  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDep = e.target.value;
    const provs = UBIGEO_PERU[selectedDep] || {};
    const firstProv = Object.keys(provs)[0] || "";
    const dists = provs[firstProv] || [];
    const firstDist = dists[0] || "";
    setForm(prev => ({ ...prev, departamento: selectedDep, provincia: firstProv, distrito: firstDist }));
  };

  const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProv = e.target.value;
    const dists = provinciasObj[selectedProv] || [];
    const firstDist = dists[0] || "";
    setForm(prev => ({ ...prev, provincia: selectedProv, distrito: firstDist }));
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
    const finalDir = fullDir || form.direccion || `Distrito de ${form.distrito}`;
    const fullPostulante = `${form.nombres || ""} ${form.apellidoPaterno || ""} ${form.apellidoMaterno || ""}`.trim() || form.postulante;
    onSave({ ...form, postulante: fullPostulante, direccion: finalDir });
  };

  // ── PDF / Print handler ────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      alert("Por favor permite ventanas emergentes para descargar el PDF.");
      return;
    }

    const printContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Ficha Beneficiario - ${form.postulante}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 portrait; margin: 18mm 15mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; font-size: 11px; }

    .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fff; padding: 20px 24px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header-title h1 { font-size: 17px; font-weight: 900; margin-bottom: 2px; letter-spacing: -0.3px; }
    .header-title p { font-size: 10px; opacity: 0.7; }
    .exp-badge { background: rgba(56,189,248,0.2); border: 1px solid rgba(56,189,248,0.4); color: #7dd3fc; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 5px; font-family: monospace; letter-spacing: 0.5px; }
    .status-badge { font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; border: 1px solid; }
    .status-revision { background: rgba(100,116,139,0.15); color: #64748b; border-color: rgba(100,116,139,0.4); }
    .status-inscrito { background: rgba(234,179,8,0.15); color: #a16207; border-color: rgba(234,179,8,0.4); }
    .status-elegible { background: rgba(34,197,94,0.15); color: #166534; border-color: rgba(34,197,94,0.4); }
    .status-noelegible { background: rgba(239,68,68,0.15); color: #991b1b; border-color: rgba(239,68,68,0.4); }
    .status-codigo { background: rgba(168,85,247,0.15); color: #6b21a8; border-color: rgba(168,85,247,0.4); }
    .status-aprobado { background: rgba(59,130,246,0.15); color: #1e3a8a; border-color: rgba(59,130,246,0.4); }
    .status-default { background: rgba(100,116,139,0.15); color: #64748b; border-color: rgba(100,116,139,0.4); }

    .section { margin-bottom: 14px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .section-title { background: #f8fafc; padding: 7px 14px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid #e2e8f0; color: #475569; }
    .section-body { padding: 12px 14px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 8px; }
    .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 8px; }
    .field { display: flex; flex-direction: column; gap: 2px; }
    .field label { font-size: 9px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .field value { font-size: 11px; font-weight: 600; color: #1e293b; padding: 4px 0; border-bottom: 1px solid #e2e8f0; min-height: 20px; }
    .field.mono value { font-family: monospace; }

    .footer { margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; }
    .footer-left { font-size: 9px; color: #94a3b8; }
    .footer-right { font-size: 9px; color: #94a3b8; }
    .sign-area { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; }
    .sign-line { border-top: 1px solid #334155; padding-top: 6px; text-align: center; font-size: 9px; color: #64748b; }
    .notes-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 8px 10px; min-height: 40px; font-size: 11px; color: #475569; }
    .watermark { position: fixed; bottom: 30mm; left: 50%; transform: translateX(-50%); font-size: 60px; color: rgba(15,23,42,0.035); font-weight: 900; white-space: nowrap; pointer-events: none; z-index: 0; }
  </style>
</head>
<body>
  <div class="watermark">TECHO PROPIO</div>

  <div class="header">
    <div class="header-title">
      <h1>🏠 Ficha del Beneficiario — Techo Propio</h1>
      <p>Programa Construcción en Sitio Propio (CSP) — Constructora Maza Quiroz</p>
    </div>
    <div style="text-align:right;display:flex;flex-direction:column;gap:6px;align-items:flex-end">
      <div class="exp-badge">📋 EXP: ${form.id}</div>
      ${getStatusHtmlClass(form.estado)}
      <span style="font-size:9px;opacity:0.6">Emitido: ${new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">👤 Datos del Postulante y Núcleo Familiar</div>
    <div class="section-body">
      <div class="grid-2">
        <div class="field" style="grid-column:span 1">
          <label>Nombres y Apellidos del Postulante</label>
          <value style="font-size:13px;font-weight:900;border-bottom:2px solid #3b82f6;padding-bottom:3px">${form.postulante || "—"}</value>
        </div>
        <div class="field mono">
          <label>DNI del Postulante</label>
          <value>${form.dniPostulante || "—"}</value>
        </div>
      </div>
      <div class="grid-4">
        <div class="field">
          <label>Nombres</label>
          <value>${form.nombres || "—"}</value>
        </div>
        <div class="field">
          <label>Apellido Paterno</label>
          <value>${form.apellidoPaterno || "—"}</value>
        </div>
        <div class="field">
          <label>Apellido Materno</label>
          <value>${form.apellidoMaterno || "—"}</value>
        </div>
        <div class="field mono">
          <label>Fecha de Nacimiento</label>
          <value>${form.fechaNacimiento || "—"}</value>
        </div>
      </div>
      <div class="grid-3">
        <div class="field">
          <label>Teléfono / Celular</label>
          <value>${form.celular || "—"}</value>
        </div>
        <div class="field">
          <label>Estado Civil</label>
          <value>${form.estadoCivil || "—"}</value>
        </div>
        <div class="field">
          <label>Cónyuge / Conviviente</label>
          <value>${form.conyuge || "—"}</value>
        </div>
      </div>
      ${form.dniConyuge ? `
      <div class="grid-4">
        <div class="field">
          <label>Nombres Cónyuge</label>
          <value>${form.nombresConyuge || "—"}</value>
        </div>
        <div class="field">
          <label>Ap. Paterno Cónyuge</label>
          <value>${form.apellidoPaternoConyuge || "—"}</value>
        </div>
        <div class="field">
          <label>Ap. Materno Cónyuge</label>
          <value>${form.apellidoMaternoConyuge || "—"}</value>
        </div>
        <div class="field mono">
          <label>DNI del Cónyuge</label>
          <value>${form.dniConyuge}</value>
        </div>
      </div>` : ""}
    </div>
  </div>

  <div class="section">
    <div class="section-title">📍 Ubicación del Predio — UBIGEO Perú</div>
    <div class="section-body">
      <div class="grid-3">
        <div class="field">
          <label>Departamento</label>
          <value>${form.departamento || "—"}</value>
        </div>
        <div class="field">
          <label>Provincia</label>
          <value>${form.provincia || "—"}</value>
        </div>
        <div class="field">
          <label>Distrito</label>
          <value>${form.distrito || "—"}</value>
        </div>
      </div>
      <div class="grid-4">
        <div class="field">
          <label>Centro Poblado</label>
          <value>${(form as any).centroPoblado || "—"}</value>
        </div>
        <div class="field">
          <label>Barrio / Sector</label>
          <value>${(form as any).barrioSector || "—"}</value>
        </div>
        <div class="field">
          <label>Jr. / Av. / Calle</label>
          <value>${(form as any).calle || "—"}</value>
        </div>
        <div class="field">
          <label>Partida Registral SUNARP</label>
          <value>${(form as any).partidaElectronica || "—"}</value>
        </div>
      </div>
      <div class="grid-3">
        <div class="field mono">
          <label>N° Licencia de Construcción</label>
          <value>${(form as any).licenciaConstruccion || form.codigoCatastral || "—"}</value>
        </div>
        <div class="field mono">
          <label>N° Conformidad de Obra</label>
          <value>${(form as any).conformidadObra || "—"}</value>
        </div>
        <div class="field mono">
          <label>Coordenadas (X / Y)</label>
          <value>${form.coordenadaX || "—"} / ${form.coordenadaY || "—"}</value>
        </div>
      </div>
      <div class="grid-4">
        <div class="field">
          <label>Manzana (Mz.)</label>
          <value>${(form as any).manzana || "—"}</value>
        </div>
        <div class="field">
          <label>Lote (Lt.)</label>
          <value>${(form as any).lote || "—"}</value>
        </div>
        <div class="field mono">
          <label>Coordenada X (Este UTM)</label>
          <value>${form.coordenadaX || "—"}</value>
        </div>
        <div class="field mono">
          <label>Coordenada Y (Norte UTM)</label>
          <value>${form.coordenadaY || "—"}</value>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">📐 Área y Linderos del Terreno</div>
    <div class="section-body">
      <div class="grid-4">
        <div class="field">
          <label>Área Total (m²)</label>
          <value>${(form as any).areaTotal || "—"}</value>
        </div>
        <div class="field">
          <label>Por el Frente (m)</label>
          <value>${(form as any).porFrente || "—"}</value>
        </div>
        <div class="field">
          <label>Por la Derecha (m)</label>
          <value>${(form as any).porDerecha || "—"}</value>
        </div>
        <div class="field">
          <label>Por el Fondo (m)</label>
          <value>${(form as any).porFondo || "—"}</value>
        </div>
      </div>
    </div>
  </div>

  ${(form as any).notas ? `
  <div class="section">
    <div class="section-title">📝 Notas y Observaciones Técnicas</div>
    <div class="section-body">
      <div class="notes-box">${(form as any).notas}</div>
    </div>
  </div>` : ""}

  <div class="sign-area">
    <div class="sign-line">
      _______________________________<br/>
      Firma del Postulante<br/>
      <strong>${form.postulante || "———"}</strong><br/>
      DNI: ${form.dniPostulante || "————"}
    </div>
    <div class="sign-line">
      _______________________________<br/>
      Responsable Técnico<br/>
      Firma y Sello
    </div>
  </div>

  <div class="footer">
    <div class="footer-left">Sistema Techo Propio — Constructora Maza Quiroz &nbsp;|&nbsp; Generado el ${new Date().toLocaleString("es-PE")}</div>
    <div class="footer-right">Expediente: <strong>${form.id}</strong></div>
  </div>

  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 800);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Helper: map estado to HTML status badge
  function getStatusHtmlClass(estado: string): string {
    const norm = (estado || "").toLowerCase();
    let cls = "status-default";
    let label = estado || "Expediente en Revisión";
    if (norm.includes("revis")) { cls = "status-revision"; label = "Expediente en Revisión"; }
    else if (norm.includes("no elegible")) { cls = "status-noelegible"; label = "Expediente No Elegible"; }
    else if (norm.includes("elegible")) { cls = "status-elegible"; label = "Expediente Elegible"; }
    else if (norm.includes("inscri")) { cls = "status-inscrito"; label = "Expediente Inscrito"; }
    else if (norm.includes("codigo") || norm.includes("código")) { cls = "status-codigo"; label = "Expediente con Código de Proyecto"; }
    else if (norm.includes("aproba")) { cls = "status-aprobado"; label = "Expediente Aprobado"; }
    return `<span class="status-badge ${cls}">${label}</span>`;
  }

  const statusBadge = getExpedienteStatusBadge(form.estado);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">

      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Lista de Beneficiarios
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-700/25 transition"
          >
            <Download className="w-4 h-4" /> Descargar Ficha PDF
          </button>
        </div>
      </div>

      {/* Ficha Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold font-mono mb-1">
              EXPEDIENTE: {form.id}
            </div>
            <h2 className="text-xl font-black text-white">Ficha del Beneficiario — Techo Propio</h2>
            <p className="text-xs text-slate-400">Formulario oficial CSP — Constructora Maza Quiroz</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Estado del Expediente</span>
          <span className={`text-xs font-bold px-4 py-2 rounded-full border ${statusBadge.colorClass} flex items-center gap-1.5`}>
            {statusBadge.label}
          </span>
          <span className="text-[10px] text-slate-600 italic">Cambiar desde: Bot de Telegram o Lista de Expedientes</span>
        </div>
      </div>

      <fieldset disabled className="space-y-6 opacity-90 pointer-events-none">
      {/* Section 1: Expediente & Identificación */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <FolderCheck className="w-4 h-4 text-sky-400" />
          <h2 className="text-xs font-black uppercase text-white tracking-wider">1. IDENTIFICACIÓN Y EXPEDIENTE</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400">ID Expediente</label>
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
          <h2 className="text-xs font-black uppercase text-white tracking-wider">2. DATOS PERSONALES DEL POSTULANTE</h2>
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
              value={form.estadoCivil || "Soltero/a"}
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

        {/* Cónyuge sub-section */}
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

      {/* Section 3: Ubicación UBIGEO */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <MapPin className="w-4 h-4 text-sky-400" />
          <h2 className="text-xs font-black uppercase text-white tracking-wider">3. UBICACIÓN GEOGRÁFICA DEL PREDIO (UBIGEO NACIONAL)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-400">Centro Poblado</label>
            <input
              type="text"
              value={(form as any).centroPoblado || ""}
              onChange={(e) => setForm({ ...form, centroPoblado: e.target.value } as any)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400">Barrio / Sector</label>
            <input
              type="text"
              value={(form as any).barrioSector || ""}
              onChange={(e) => setForm({ ...form, barrioSector: e.target.value } as any)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400">Jr. / Av. / Calle</label>
            <input
              type="text"
              value={(form as any).calle || ""}
              onChange={(e) => setForm({ ...form, calle: e.target.value } as any)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400">Partida Registral SUNARP</label>
            <input
              type="text"
              value={(form as any).partidaElectronica || ""}
              onChange={(e) => setForm({ ...form, partidaElectronica: e.target.value } as any)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
            />
          </div>
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-400">Manzana (Mz.)</label>
            <input
              type="text"
              value={(form as any).manzana || ""}
              onChange={(e) => setForm({ ...form, manzana: e.target.value } as any)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase focus:outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400">Lote (Lt.)</label>
            <input
              type="text"
              value={(form as any).lote || ""}
              onChange={(e) => setForm({ ...form, lote: e.target.value } as any)}
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

      {/* Section 4: Dimensiones del Predio */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Ruler className="w-4 h-4 text-sky-400" />
          <h2 className="text-xs font-black uppercase text-white tracking-wider">4. DIMENSIONES DEL PREDIO Y LINDEROS (M2 Y METROS LINEALES)</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400">Área Total (m²)</label>
            <input
              type="text"
              value={(form as any).areaTotal || ""}
              onChange={(e) => setForm({ ...form, areaTotal: e.target.value } as any)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400">Por el Frente (m)</label>
            <input
              type="text"
              value={(form as any).porFrente || ""}
              onChange={(e) => setForm({ ...form, porFrente: e.target.value } as any)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400">Por la Derecha (m)</label>
            <input
              type="text"
              value={(form as any).porDerecha || ""}
              onChange={(e) => setForm({ ...form, porDerecha: e.target.value } as any)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400">Por el Fondo (m)</label>
            <input
              type="text"
              value={(form as any).porFondo || ""}
              onChange={(e) => setForm({ ...form, porFondo: e.target.value } as any)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Notas y Observaciones */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <FileText className="w-4 h-4 text-sky-400" />
          <h2 className="text-xs font-black uppercase text-white tracking-wider">5. NOTAS Y OBSERVACIONES</h2>
        </div>
        <div>
          <textarea
            rows={3}
            value={(form as any).notas || ""}
            onChange={(e) => setForm({ ...form, notas: e.target.value } as any)}
            placeholder="Observaciones técnicas sobre el expediente..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl p-4 text-xs text-white focus:outline-none transition"
          />
        </div>
      </div>
      </fieldset>

      {/* Submit Row */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-8">
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg shadow-emerald-700/25 transition"
        >
          <Download className="w-4 h-4" /> Descargar Ficha PDF
        </button>
      </div>

    </div>
  );
}
