/* eslint-disable @typescript-eslint/no-unused-vars, @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Beneficiario, DocumentoAdjunto } from "../types";
import { 
  FileText, 
  Upload, 
  RefreshCw, 
  Eye, 
  Download, 
  Trash2, 
  Image as ImageIcon,
  ChevronDown,
  X,
  Plus,
  FolderOpen,
  UserCheck,
  ShieldAlert,
  FileCheck,
  Save,
  FilePlus,
  Loader2
} from "lucide-react";

interface DocumentManagerProps {
  beneficiarios: Beneficiario[];
  onRefresh?: () => void;
}

export const DEFAULT_DOCUMENT_TYPES = [
  "DNI Postulante",
  "DNI Cónyuge",
  "DNI Carga Familiar",
  "Copia Literal",
  "Autoavaluo",
  "Fotografías del Predio",
];

export default function DocumentManager({ beneficiarios, onRefresh }: DocumentManagerProps) {
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>(
    beneficiarios[0]?.id || ""
  );

  const [documentosLocal, setDocumentosLocal] = useState<{ [beneficiarioId: string]: DocumentoAdjunto[] }>({});
  const [previewDoc, setPreviewDoc] = useState<DocumentoAdjunto | null>(null);
  
  // Custom document types per beneficiary
  const [customTypes, setCustomTypes] = useState<{ [bId: string]: string[] }>({});
  const [isUploading, setIsUploading] = useState<string | null>(null); // track currently uploading doc ID/tipo

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetTipo, setUploadTargetTipo] = useState<string | null>(null);

  const selectedBeneficiary = beneficiarios.find(b => b.id === selectedBeneficiaryId) || beneficiarios[0];

  // Merge beneficiary prop documents with local uploads
  const getDocsForBeneficiary = (bId: string): DocumentoAdjunto[] => {
    const b = beneficiarios.find(item => item.id === bId);
    const fromProp = b?.documentos || [];
    const fromLocal = documentosLocal[bId] || [];

    const ids = new Set(fromProp.map(d => d.id));
    const merged = [...fromProp];
    for (const d of fromLocal) {
      if (!ids.has(d.id)) {
        merged.push(d);
      }
    }
    return merged;
  };

  const beneficiaryDocs = selectedBeneficiaryId ? getDocsForBeneficiary(selectedBeneficiaryId) : [];

  // Combine default types with any existing docs + custom added types
  const getActiveTypes = (bId: string) => {
    const existingDocs = getDocsForBeneficiary(bId);
    const existingTypes = existingDocs.map(d => d.tipo);
    const userCustomTypes = customTypes[bId] || [];
    
    // Merge all unique types
    const allTypes = new Set([...DEFAULT_DOCUMENT_TYPES, ...existingTypes, ...userCustomTypes]);
    return Array.from(allTypes);
  };

  const activeTypes = selectedBeneficiaryId ? getActiveTypes(selectedBeneficiaryId) : [];

  const handleAddCustomField = () => {
    if (!selectedBeneficiaryId) return;
    const fieldName = prompt("Nombre del nuevo campo de documento:");
    if (!fieldName || fieldName.trim() === "") return;
    
    setCustomTypes(prev => {
      const existing = prev[selectedBeneficiaryId] || [];
      if (existing.includes(fieldName.trim()) || DEFAULT_DOCUMENT_TYPES.includes(fieldName.trim())) {
        return prev;
      }
      return {
        ...prev,
        [selectedBeneficiaryId]: [...existing, fieldName.trim()]
      };
    });
  };

  const handleRemoveField = (tipo: string) => {
    if (!selectedBeneficiaryId) return;
    const confirmDelete = confirm(`¿Estás seguro que deseas eliminar el cuadro de "${tipo}"?`);
    if (!confirmDelete) return;

    // Check if there is an uploaded file
    const doc = beneficiaryDocs.find(d => d.tipo === tipo);
    if (doc) {
      handleDeleteDoc(doc.id);
    }

    // Remove from custom types if it exists there
    setCustomTypes(prev => {
      const existing = prev[selectedBeneficiaryId] || [];
      return {
        ...prev,
        [selectedBeneficiaryId]: existing.filter(t => t !== tipo)
      };
    });
  };

  const triggerUploadFor = (tipo: string) => {
    setUploadTargetTipo(tipo);
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 50);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && uploadTargetTipo && selectedBeneficiaryId) {
      const selectedFile = e.target.files[0];
      const tipo = uploadTargetTipo;
      
      setIsUploading(tipo);

      try {
        // Step 1: Upload file to Supabase Storage via /api/upload
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("subfolder", "documentos");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        let finalUrl: string;
        let finalName = selectedFile.name;

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalUrl = uploadData.url;
          finalName = uploadData.fileName || selectedFile.name;
        } else {
          // Fallback: use local blob URL (only works in current session)
          console.warn("Upload to storage failed, using temporary local URL");
          finalUrl = URL.createObjectURL(selectedFile);
        }

        const newDoc: DocumentoAdjunto = {
          id: `DOC-${Date.now()}`,
          tipo: tipo,
          nombre: finalName,
          url: finalUrl,
          fecha: new Date().toLocaleDateString("es-PE")
        };

        // Step 2: Save document reference in Supabase DB
        await fetch("/api/beneficiarios/documentos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ beneficiarioId: selectedBeneficiaryId, documento: newDoc })
        });
        
        setDocumentosLocal(prev => ({
          ...prev,
          [selectedBeneficiaryId]: [...(prev[selectedBeneficiaryId] || []).filter(d => d.tipo !== tipo), newDoc]
        }));
        
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error("Error al subir el documento:", err);
      }

      setIsUploading(null);
      setUploadTargetTipo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!selectedBeneficiaryId) return;

    setDocumentosLocal(prev => ({
      ...prev,
      [selectedBeneficiaryId]: (prev[selectedBeneficiaryId] || []).filter(d => d.id !== docId)
    }));

    try {
      await fetch(`/api/beneficiarios/documentos?beneficiarioId=${selectedBeneficiaryId}&docId=${encodeURIComponent(docId)}`, {
        method: "DELETE"
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error eliminando documento:", err);
    }
  };
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!onRefresh) return;
    setIsSyncing(true);
    await onRefresh();
    // Extra delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSyncing(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      
      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
      />

      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Gestor de Archivos</h1>
            <p className="text-sm text-slate-400 mt-1">
              Administra los expedientes y documentos de cada beneficiario.
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 border border-slate-700 hover:border-sky-500 bg-slate-800 hover:bg-slate-800/80 active:scale-95 text-slate-200 hover:text-white text-xs font-bold px-5 py-2.5 rounded-xl transition duration-200 shadow-lg relative z-10 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-sky-400 ${isSyncing ? "animate-spin" : ""}`} /> 
            {isSyncing ? "Sincronizando..." : "Sincronizar"}
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[600px] backdrop-blur-xl">
        
        {/* Left Column: BENEFICIARY CARDS (4 Cols) */}
        <div className="lg:col-span-4 border-r border-slate-800/80 p-5 space-y-4 bg-slate-950 flex flex-col relative z-10">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h2 className="text-xs font-black uppercase text-slate-300 tracking-widest flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-400" /> Beneficiarios
            </h2>
            <span className="text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-md font-mono">
              {beneficiarios.length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 max-h-[600px] pr-2 custom-scrollbar">
            {beneficiarios.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-3 border border-dashed border-slate-800 rounded-2xl">
                <FileText className="w-10 h-10 mx-auto text-slate-600 opacity-50" />
                <p className="text-sm font-semibold">No hay beneficiarios registrados.</p>
              </div>
            ) : (
              beneficiarios.map((b) => {
                const isSelected = selectedBeneficiaryId === b.id;
                const docsCount = getDocsForBeneficiary(b.id).length;

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBeneficiaryId(b.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 group border relative overflow-hidden ${
                      isSelected 
                        ? "bg-slate-900 border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.15)] ring-1 ring-sky-500/50" 
                        : "bg-slate-900/40 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-transparent pointer-events-none" />}
                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-950 text-sky-400 border border-slate-800 inline-block">
                          {b.id}
                        </span>
                        <h3 className={`text-sm font-black uppercase truncate transition-colors ${isSelected ? "text-white" : "text-slate-200 group-hover:text-sky-300"}`}>
                          {b.postulante}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 truncate">
                          DNI: {b.dniPostulante || "S/D"}
                        </p>
                      </div>

                      <span className={`px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono shrink-0 flex items-center gap-1.5 border ${
                        isSelected 
                          ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20" 
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}>
                        <FileCheck className="w-3.5 h-3.5" /> {docsCount}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: DOCUMENT DETAILS & UPLOAD PANEL (8 Cols) */}
        <div className="lg:col-span-8 p-6 flex flex-col bg-slate-900/20 relative z-10">
          
          {/* Header for Selected Beneficiary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">
                {selectedBeneficiary ? selectedBeneficiary.postulante : "SELECCIONA UN BENEFICIARIO"}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-2 py-1 rounded bg-slate-800 text-[11px] font-mono font-bold text-sky-400 border border-slate-700">
                  {selectedBeneficiary?.id || "-"}
                </span>
                <p className="text-xs text-slate-400 font-medium">
                  Documentos del Expediente
                </p>
              </div>
            </div>

            <button
              onClick={handleAddCustomField}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20 border border-emerald-500 shrink-0 self-start sm:self-auto active:scale-95 transition-transform duration-150"
            >
              <FilePlus className="w-4 h-4" /> Añadir Nuevo Cuadro
            </button>
          </div>

          {/* Dynamic Documents List */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar pb-10">
            {selectedBeneficiary && activeTypes.length > 0 ? (
              activeTypes.map((tipo) => {
                const doc = beneficiaryDocs.find(d => d.tipo === tipo);
                const isUploadingThis = isUploading === tipo;

                return (
                  <div 
                    key={tipo} 
                    className={`p-4 rounded-2xl border transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                      doc ? "bg-slate-800/80 border-sky-500/30" : "bg-slate-900 border-slate-800 border-dashed"
                    }`}
                  >
                    {/* Document Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`p-3 rounded-xl flex-shrink-0 ${doc ? "bg-sky-500/10 text-sky-400" : "bg-slate-800 text-slate-500"}`}>
                        {doc ? (
                          ((doc.nombre || "").toLowerCase().endsWith(".jpg") || (doc.nombre || "").toLowerCase().endsWith(".png")) ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />
                        ) : (
                          <FolderOpen className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-bold uppercase tracking-wide truncate ${doc ? "text-white" : "text-slate-400"}`}>
                          {tipo}
                        </h3>
                        {doc ? (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                            <span className="text-xs text-sky-400 font-medium truncate" title={doc.nombre || "Documento"}>
                              {doc.nombre || "Documento sin nombre"}
                            </span>
                            <span className="hidden sm:inline text-slate-600 text-[10px]">•</span>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {doc.fecha}
                            </span>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 mt-1 font-medium">Pendiente de subida</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 md:border-l md:border-slate-800 md:pl-4">
                      
                      {!doc && (
                        <button
                          onClick={() => triggerUploadFor(tipo)}
                          disabled={isUploadingThis}
                          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl transition shadow-md active:scale-95 transition-transform duration-150"
                        >
                          {isUploadingThis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {isUploadingThis ? "Subiendo..." : "Subir Archivo"}
                        </button>
                      )}

                      {doc && (
                        <>
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-2 bg-slate-950 hover:bg-slate-800 text-sky-400 hover:text-white rounded-xl border border-slate-700 transition active:scale-95 transition-transform duration-150"
                            title="Previsualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {doc.url ? (
                            <a
                              href={doc.url}
                              download={doc.nombre}
                              className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition active:scale-95 transition-transform duration-150"
                              title="Descargar"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          ) : (
                            <button
                              onClick={() => alert(`Descargando copia local de: ${doc.nombre}`)}
                              className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition active:scale-95 transition-transform duration-150"
                              title="Descargar"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteDoc(doc.id || doc.url || doc.tipo)}
                            className="p-2 bg-slate-950 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl border border-slate-700 transition active:scale-95 transition-transform duration-150"
                            title="Eliminar Archivo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {!DEFAULT_DOCUMENT_TYPES.includes(tipo) && !doc && (
                        <button
                          onClick={() => handleRemoveField(tipo)}
                          className="p-2 bg-slate-900 hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 rounded-xl border border-slate-800 transition ml-2 active:scale-95 transition-transform duration-150"
                          title="Eliminar Cuadro"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center">
                <p className="text-sm text-slate-500 font-medium">Selecciona un beneficiario para gestionar sus documentos.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Modal Previewer */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-4 p-6 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase">{previewDoc.tipo}</h3>
                  <p className="text-sm font-mono text-slate-400 mt-0.5">{previewDoc.nombre}</p>
                </div>
              </div>

              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors active:scale-95 transition-transform duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Viewer Body */}
            <div className="w-full h-[60vh] bg-[#030712] rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
              {(() => {
                const rawUrl = previewDoc.url || "";

                // Detect invalid URLs
                const isBroken = !rawUrl || rawUrl === "[URL_DE_LA_IMAGEN]" || rawUrl.includes("placehold.co");

                if (isBroken) {
                  return (
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                        <FileText className="w-10 h-10 text-rose-400" />
                      </div>
                      <div>
                        <p className="text-rose-400 font-bold text-lg">Archivo no disponible</p>
                        <p className="text-slate-500 text-sm mt-1">El archivo original no pudo ser recuperado.</p>
                        <p className="text-slate-600 text-xs mt-1">Elimina este registro y vuelve a subirlo.</p>
                      </div>
                    </div>
                  );
                }

                // Convert Telegram direct URLs to our proxy endpoint
                const telegramMatch = rawUrl.match(/api\.telegram\.org\/file\/bot[^/]+\/(.+)/);
                const displayUrl = telegramMatch
                  ? `/api/file-proxy?path=${encodeURIComponent(telegramMatch[1])}`
                  : rawUrl;

                const isImg =
                  displayUrl.startsWith("data:image/") ||
                  displayUrl.match(/\.(jpg|jpeg|png|gif|svg|webp)(\?|$)/i) ||
                  (previewDoc.nombre || "").match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                  telegramMatch !== null; // Telegram photos are usually images

                if (isImg) {
                  return (
                    <img
                      src={displayUrl}
                      alt={previewDoc.nombre || "Documento"}
                      className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#0f172a"/><text x="200" y="110" font-family="sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">No se pudo cargar la imagen</text></svg>');
                      }}
                    />
                  );
                }
                return <iframe src={displayUrl} className="w-full h-full rounded-xl border border-slate-800 bg-white" title={previewDoc.nombre || "Documento"} />;
              })()}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              {(() => {
                const rawUrl = previewDoc.url || "";
                const isBroken = !rawUrl || rawUrl === "[URL_DE_LA_IMAGEN]" || rawUrl.includes("placehold.co");
                if (isBroken) return null;

                const telegramMatch = rawUrl.match(/api\.telegram\.org\/file\/bot[^/]+\/(.+)/);
                const downloadUrl = telegramMatch
                  ? `/api/file-proxy?path=${encodeURIComponent(telegramMatch[1])}`
                  : rawUrl;

                return (
                  <a
                    href={downloadUrl}
                    download={previewDoc.nombre || "documento"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-sky-600/20 transition-all active:scale-95"
                  >
                    <Download className="w-5 h-5" /> Descargar Archivo Original
                  </a>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
