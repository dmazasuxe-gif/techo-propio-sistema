/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Dimensiones } from "../types";
import { Sliders, Home, Maximize2, Minimize2, Check } from "lucide-react";

interface InteractivePlanoProps {
  dimensiones: Dimensiones;
  onChange: (dims: Dimensiones) => void;
}

export default function InteractivePlano({ dimensiones, onChange }: InteractivePlanoProps) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleSlider = (name: keyof Dimensiones, val: number) => {
    onChange({ ...dimensiones, [name]: val });
  };

  const { largo, ancho, altura, espesorMuro, habitaciones } = dimensiones;
  const area = largo * ancho;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      
      {/* Controles Deslizantes y Parámetros (Lado Izquierdo - 2 Columnas) */}
      <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" /> Parámetros del Plano
          </h3>
          <span className="text-[11px] font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
            {area.toFixed(2)} m²
          </span>
        </div>

        <div className="space-y-4">
          {/* Plantillas de Área Estándar (Presets) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Área Estándar (Plantilla)</span>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { label: "35 m²", largo: 7.0, ancho: 5.0, hab: 1 },
                { label: "40 m²", largo: 8.0, ancho: 5.0, hab: 2 },
                { label: "42 m²", largo: 7.0, ancho: 6.0, hab: 2 },
                { label: "49 m²", largo: 7.0, ancho: 7.0, hab: 2 },
                { label: "56 m²", largo: 8.0, ancho: 7.0, hab: 2 }
              ].map((p, idx) => {
                const active = Math.abs(largo * ancho - p.largo * p.ancho) < 0.1;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange({ ...dimensiones, largo: p.largo, ancho: p.ancho, habitaciones: p.hab })}
                    className={`py-2 rounded-xl text-[10px] font-black tracking-tight text-center transition duration-150 border ${
                      active 
                        ? "bg-sky-600 border-sky-400 text-white shadow-lg shadow-sky-600/30" 
                        : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slider Largo */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-400">Largo de Vivienda (Frente)</span>
              <span className="font-bold font-mono text-sky-400">{largo.toFixed(2)} m</span>
            </div>
            <input
              type="range" min="5.0" max="9.0" step="0.1" value={largo}
              onChange={(e) => handleSlider("largo", parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500 border border-slate-800"
            />
          </div>

          {/* Slider Ancho */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-400">Ancho de Vivienda (Fondo)</span>
              <span className="font-bold font-mono text-sky-400">{ancho.toFixed(2)} m</span>
            </div>
            <input
              type="range" min="4.5" max="7.5" step="0.1" value={ancho}
              onChange={(e) => handleSlider("ancho", parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500 border border-slate-800"
            />
          </div>

          {/* Slider Altura */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-400">Altura de Muros</span>
              <span className="font-bold font-mono text-sky-400">{altura.toFixed(2)} m</span>
            </div>
            <input
              type="range" min="2.4" max="3.3" step="0.05" value={altura}
              onChange={(e) => handleSlider("altura", parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500 border border-slate-800"
            />
          </div>

          {/* Habitaciones y Muro */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="space-y-1">
              <span className="font-semibold text-slate-400 block">Distribución</span>
              <select
                value={habitaciones}
                onChange={(e) => handleSlider("habitaciones", parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-2.5 text-white font-bold focus:outline-none transition"
              >
                <option value={1}>1 Dormitorio</option>
                <option value={2}>2 Dormitorios</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-slate-400 block">Muro (Espesor)</span>
              <select
                value={espesorMuro}
                onChange={(e) => handleSlider("espesorMuro", parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-2.5 text-white font-bold focus:outline-none transition"
              >
                <option value={0.15}>Soga (15 cm)</option>
                <option value={0.25}>Cabeza (25 cm)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resumen Métrica de Área */}
        <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-semibold text-sky-300 block">Área Construida Resultante</span>
            <span className="text-2xl font-black text-white font-mono">{area.toFixed(2)} m²</span>
          </div>
          <Home className="w-8 h-8 text-sky-400 opacity-90" />
        </div>
      </div>

      {/* Visualización del Plano Arquitectónico (Lado Derecho - 3 Columnas) */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-2xl flex flex-col justify-between space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-black uppercase text-white tracking-wider">
              PLANO ARQUITECTÓNICO INTERACTIVO (2D)
            </h3>
            <p className="text-[11px] text-slate-400">
              Distribución: Sala-Comedor, Cocina, Baño y 2 Dormitorios.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition shadow"
            title="Ampliar plano en pantalla completa"
          >
            <Maximize2 className="w-3.5 h-3.5 text-sky-400" /> Ampliar
          </button>
        </div>

        {/* Container del Plano Arquitectónico Vectorial Sin Distorsión */}
        <div className="relative flex-1 bg-white rounded-2xl p-4 overflow-hidden shadow-inner flex items-center justify-center min-h-[360px]">
          
          {/* Base Image Blueprint */}
          <div className="relative w-full h-full max-w-[560px] aspect-[5/4] flex items-center justify-center">
            <img
              src="/plano-base.png"
              alt="Plano Arquitectónico de Vivienda Unifamiliar Techo Propio"
              className="w-full h-full object-contain select-none pointer-events-none drop-shadow-md"
              draggable={false}
            />

            {/* Vector Overlay Cotas y Cotizaciones dinámicas sin distorsión de líneas */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 560 440"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Dynamic Outer Dimension Badges (Frente y Fondo únicamente) */}
              {/* Cota Largo (Frente) */}
              <g transform="translate(280, 22)">
                <rect x="-60" y="-14" width="120" height="24" rx="8" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
                <text x="0" y="2" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  FRENTE: {largo.toFixed(2)} m
                </text>
              </g>

              {/* Cota Ancho (Fondo) */}
              <g transform="translate(25, 220)">
                <rect x="-60" y="-14" width="120" height="24" rx="8" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
                <text x="0" y="2" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  FONDO: {ancho.toFixed(2)} m
                </text>
              </g>
            </svg>
          </div>

        </div>

        {/* Footnote Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-1 border-t border-slate-800">
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <Check className="w-3.5 h-3.5" /> Diseño oficial Techo Propio
          </span>
          <span className="font-mono">
            Escala vectorizada 1:50 | Alta Definición
          </span>
        </div>

      </div>

      {/* Modal Pantalla Completa (Fullscreen) sin distorsión */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl p-4 sm:p-8 flex flex-col justify-between animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white">Plano Arquitectónico en Alta Definición</h2>
              <p className="text-xs text-slate-400">
                Dimensiones actuales: <span className="font-mono text-sky-400 font-bold">{largo.toFixed(2)}m x {ancho.toFixed(2)}m</span> — Área: <span className="font-mono text-sky-400 font-bold">{area.toFixed(2)} m²</span>
              </p>
            </div>

            <button
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition"
            >
              <Minimize2 className="w-4 h-4 text-sky-400" /> Cerrar Pantalla Completa
            </button>
          </div>

          {/* Fullscreen HD Canvas Container */}
          <div className="flex-1 my-4 bg-white rounded-3xl p-6 flex items-center justify-center shadow-2xl relative overflow-hidden">
            <div className="relative w-full h-full max-w-[900px] max-h-[700px]">
              <img
                src="/plano-base.png"
                alt="Plano Arquitectónico Ampliado"
                className="w-full h-full object-contain select-none pointer-events-none"
                draggable={false}
              />

              {/* Vector overlays for Fullscreen */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 560 440"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Cota Largo (Superior) */}
                <g transform="translate(280, 22)">
                  <rect x="-55" y="-16" width="110" height="26" rx="8" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
                  <text x="0" y="3" fill="#ffffff" fontSize="13" fontWeight="black" textAnchor="middle" fontFamily="monospace">
                    LARGO: {largo.toFixed(2)} m
                  </text>
                </g>

                {/* Cota Ancho (Izquierda) */}
                <g transform="translate(25, 220)">
                  <rect x="-55" y="-16" width="110" height="26" rx="8" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
                  <text x="0" y="3" fill="#ffffff" fontSize="13" fontWeight="black" textAnchor="middle" fontFamily="monospace">
                    ANCHO: {ancho.toFixed(2)} m
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
