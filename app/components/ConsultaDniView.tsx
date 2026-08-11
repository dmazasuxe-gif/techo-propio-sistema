import React, { useState } from "react";
import { Search, AlertCircle, Info, Loader2, Check } from "lucide-react";

interface DniData {
  dni: string;
  nombres: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  fechaNacimiento?: string;
}

export default function ConsultaDniView() {
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DniData | null>(null);

  const handleSearch = async () => {
    setError(null);
    setResult(null);
    
    if (!dni) {
      setError("Ingrese un número de DNI.");
      return;
    }
    if (!/^\d{8}$/.test(dni)) {
      setError("El DNI debe contener exactamente 8 dígitos.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/consulta-dni?dni=${dni}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "No fue posible realizar la consulta. Intente nuevamente.");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("El servicio de consulta DNI no está disponible actualmente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex items-start gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center shrink-0 border border-sky-500/20">
            <Search className="w-6 h-6 text-sky-400" />
          </div>
          <div className="space-y-2 flex-1">
            <h1 className="text-2xl font-black text-white">Consulta DNI</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Herramienta de búsqueda para verificar los datos de un DNI.
            </p>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl text-xs font-bold mt-2">
              <Info className="w-3.5 h-3.5" />
              Consulta informativa. Esta operación no modifica ni registra información en el sistema.
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-300">Número de DNI</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="Ingrese 8 dígitos..."
                className="flex-1 bg-slate-950 border border-slate-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition font-mono text-xl tracking-widest shadow-inner"
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={loading || dni.length !== 8}
                className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-sky-600/20"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-3xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wide">Datos Encontrados</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">DNI</span>
                <span className="text-xl text-white font-mono">{result.dni}</span>
              </div>
              
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Nombres</span>
                <span className="text-xl text-white font-semibold">{result.nombres}</span>
              </div>
              
              {result.apellidoPaterno && (
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                  <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Apellido Paterno</span>
                  <span className="text-lg text-white font-medium">{result.apellidoPaterno}</span>
                </div>
              )}
              
              {result.apellidoMaterno && (
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                  <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Apellido Materno</span>
                  <span className="text-lg text-white font-medium">{result.apellidoMaterno}</span>
                </div>
              )}
              
              {result.fechaNacimiento && (
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                  <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Fecha de Nacimiento</span>
                  <span className="text-lg text-white font-medium">{result.fechaNacimiento}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
