/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { Dimensiones, PartidaMetrado } from "../types";
import { Calculator } from "lucide-react";

interface MetradosSheetProps {
  dimensiones: Dimensiones;
}

export default function MetradosSheet({ dimensiones }: MetradosSheetProps) {
  const { largo, ancho, altura, espesorMuro, habitaciones } = dimensiones;

  // Cálculos geométricos detallados para metrados técnicos
  const areaPlanta = largo * ancho;
  
  // Cálculo de longitud total de muros (perímetro + internos)
  const perimetroExterior = 2 * (largo + ancho);
  const longitudMurosInternos = 
    (habitaciones >= 1 ? ancho : 0) + // Divisor central
    (habitaciones >= 2 ? (largo * 0.5) : 0) + // Divisor dormitorio
    (ancho * 0.6) + (largo * 0.25); // Baño
  
  const longitudTotalMuros = perimetroExterior + longitudMurosInternos;

  // Partidas técnicas calculadas dinámicamente
  const partidas: PartidaMetrado[] = [
    {
      item: "01.01",
      descripcion: "Limpieza de terreno manual",
      unidad: "m2",
      formula: `Largo (${largo.toFixed(2)}m) x Ancho (${ancho.toFixed(2)}m)`,
      cantidad: areaPlanta
    },
    {
      item: "01.02",
      descripcion: "Trazo, nivelación y replanteo preliminar",
      unidad: "m2",
      formula: `Largo (${largo.toFixed(2)}m) x Ancho (${ancho.toFixed(2)}m)`,
      cantidad: areaPlanta
    },
    {
      item: "02.01",
      descripcion: "Excavación manual de zanjas para cimientos (prof. = 1.00m)",
      unidad: "m3",
      formula: `Long. Muros (${longitudTotalMuros.toFixed(2)}m) x Ancho Cimiento (0.40m) x Altura (1.00m)`,
      cantidad: longitudTotalMuros * 0.40 * 1.00
    },
    {
      item: "03.01",
      descripcion: "Cimientos corridos concreto 1:10 + 30% piedra grande",
      unidad: "m3",
      formula: `Vol. Excavado (${(longitudTotalMuros * 0.40 * 1.00).toFixed(2)}m3) x 0.80`,
      cantidad: longitudTotalMuros * 0.40 * 0.80
    },
    {
      item: "04.01",
      descripcion: "Muro de ladrillo King Kong de soga con mezcla 1:5",
      unidad: "m2",
      formula: `Long. Muros (${longitudTotalMuros.toFixed(2)}m) x Altura (${altura.toFixed(2)}m) - Vanos (6.50m2)`,
      cantidad: Math.max(0, (longitudTotalMuros * altura) - 6.50)
    },
    {
      item: "05.01",
      descripcion: "Concreto en columnas f'c = 210 kg/cm2",
      unidad: "m3",
      formula: `12 Columnas x Sección (0.15m x 0.25m) x Altura (${altura.toFixed(2)}m)`,
      cantidad: 12 * 0.15 * 0.25 * altura
    },
    {
      item: "06.01",
      descripcion: "Losa aligerada f'c = 175 kg/cm2",
      unidad: "m2",
      formula: `Largo (${largo.toFixed(2)}m) x Ancho (${ancho.toFixed(2)}m)`,
      cantidad: areaPlanta
    },
    {
      item: "07.01",
      descripcion: "Tarrajeo en interiores y exteriores con mortero 1:4",
      unidad: "m2",
      formula: `Área Muros (${Math.max(0, (longitudTotalMuros * altura) - 6.50).toFixed(2)}m2) x 2 Caras`,
      cantidad: Math.max(0, (longitudTotalMuros * altura) - 6.50) * 2
    },
    {
      item: "07.02",
      descripcion: "Pintura latex en muros (2 manos)",
      unidad: "m2",
      formula: `Área Tarrajeo (${(Math.max(0, (longitudTotalMuros * altura) - 6.50) * 2).toFixed(2)}m2)`,
      cantidad: Math.max(0, (longitudTotalMuros * altura) - 6.50) * 2
    },
    {
      item: "08.01",
      descripcion: "Instalación de red de agua y desagüe (Salida y tendido)",
      unidad: "Global",
      formula: "Equipamiento e instalaciones sanitarias base para vivienda",
      cantidad: 1.00
    }
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-6">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <Calculator className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-base font-bold text-white">Planilla de Metrados Dinámica</h3>
          <p className="text-xs text-slate-400">Cálculos sustentados geométricamente sobre las cotas actuales del terreno</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3 px-2">Ítem</th>
              <th className="py-3 px-2">Descripción de Partida</th>
              <th className="py-3 px-2">Unidad</th>
              <th className="py-3 px-2">Fórmula de Sustento</th>
              <th className="py-3 px-2 text-right">Metrado Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900 text-slate-300">
            {partidas.map((partida) => (
              <tr key={partida.item} className="hover:bg-slate-900/35 transition duration-75">
                <td className="py-3 px-2 font-bold text-indigo-400">{partida.item}</td>
                <td className="py-3 px-2 font-medium text-white">{partida.descripcion}</td>
                <td className="py-3 px-2 text-slate-400">{partida.unidad}</td>
                <td className="py-3 px-2 font-mono text-slate-500 text-[10px]">{partida.formula}</td>
                <td className="py-3 px-2 text-right font-bold text-white bg-slate-950/20">{partida.cantidad.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

