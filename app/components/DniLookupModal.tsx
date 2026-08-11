import React, { useState } from "react";
import { Search, AlertCircle, X, Check, Loader2 } from "lucide-react";

interface DniData {
  dni: string;
  nombres: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  fechaNacimiento?: string;
}

interface DniLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: DniData) => void;
  title?: string;
  confirmText?: string;
  hidePersonalData?: boolean;
}

export default function DniLookupModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Consultar DNI",
  confirmText = "SÍ, UTILIZAR ESTOS DATOS",
  hidePersonalData = false
}: DniLookupModalProps) {
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DniData | null>(null);

  if (!isOpen) return null;

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

  const handleConfirm = () => {
    if (result) {
      onConfirm(result);
      // Reset state on close
      setDni("");
      setResult(null);
      setError(null);
    }
  };

  const handleClose = () => {
    setDni("");
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-sky-400" />
            {title}
          </h2>
          <button onClick={handleClose} className="p-1 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Ingrese el DNI</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="Ej. 12345678"
                className="flex-1 bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition font-mono text-lg tracking-wider"
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={loading || dni.length !== 8}
                className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Buscar
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Datos Encontrados</h3>
              
              <div className="grid gap-3">
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">DNI</span>
                  <span className="text-white font-mono">{result.dni}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Nombres</span>
                  <span className="text-white font-semibold">{result.nombres}</span>
                </div>
                
                {!hidePersonalData && result.apellidoPaterno && (
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Apellido Paterno</span>
                    <span className="text-white font-semibold">{result.apellidoPaterno}</span>
                  </div>
                )}
                
                {!hidePersonalData && result.apellidoMaterno && (
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Apellido Materno</span>
                    <span className="text-white font-semibold">{result.apellidoMaterno}</span>
                  </div>
                )}
                
                {!hidePersonalData && result.fechaNacimiento && (
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Fecha de Nacimiento</span>
                    <span className="text-white font-semibold">{result.fechaNacimiento}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {result && (
          <div className="p-4 border-t border-slate-800 bg-slate-800/30 flex flex-col gap-3">
            <p className="text-sm text-center text-slate-300 font-medium">¿Desea utilizar estos datos?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleClose}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 rounded-xl transition"
              >
                NO
              </button>
              <button
                onClick={handleConfirm}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-sky-600/20"
              >
                {confirmText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
