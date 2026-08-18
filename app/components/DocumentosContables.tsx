"use client";

import React, { useEffect, useState } from "react";
import { DocumentoContable } from "../types";
import { Receipt, FileText, Search, Loader2 } from "lucide-react";

export default function DocumentosContables() {
  const [docs, setDocs] = useState<DocumentoContable[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documentos-contables");
      if (res.ok) {
        const data = await res.json();
        setDocs(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const filtered = docs.filter(d => 
    (d.emisor || "").toLowerCase().includes(search.toLowerCase()) || 
    (d.ruc || "").includes(search) ||
    (d.concepto || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-400" />
            Contabilidad y Facturación
          </h2>
          <p className="text-slate-400 text-sm">Registro de documentos contables extraídos por la IA y cargados manualmente.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por emisor, RUC o concepto..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full md:w-80 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-bold">Documento</th>
                <th className="px-6 py-4 font-bold">Fecha</th>
                <th className="px-6 py-4 font-bold">Emisor / RUC</th>
                <th className="px-6 py-4 font-bold">Concepto</th>
                <th className="px-6 py-4 font-bold">Monto</th>
                <th className="px-6 py-4 font-bold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Cargando documentos...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No se encontraron documentos contables.
                  </td>
                </tr>
              ) : (
                filtered.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        {doc.tipoDocumento}
                        {doc.urlArchivo && (
                          <a href={doc.urlArchivo} target="_blank" rel="noreferrer" className="text-xs bg-slate-800 hover:bg-emerald-600 px-2 py-0.5 rounded-md text-slate-300 hover:text-white transition-colors">Ver PDF/Img</a>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-1">{doc.id?.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{doc.fecha || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-200">{doc.emisor}</div>
                      <div className="text-xs text-slate-500 font-mono">RUC: {doc.ruc || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={doc.concepto || ''}>{doc.concepto || 'Sin concepto'}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        S/ {Number(doc.monto).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
                        {doc.estado || 'Registrado'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
