export const ESTADOS_EXPEDIENTE = [
  "Expediente en Revisión",
  "Expediente Inscrito",
  "Expediente Elegible",
  "Expediente No Elegible",
  "Expediente con Código de Proyecto",
  "Expediente Aprobado",
] as const;

export function getExpedienteStatusBadge(estado: string) {
  const norm = (estado || "").trim().toLowerCase();

  if (norm.includes("revis")) {
    return {
      label: "Expediente en Revisión",
      colorClass: "bg-slate-500/20 text-slate-300 border-slate-500/30",
      hexColor: "#64748b" // Gris
    };
  }
  if (norm.includes("inscri")) {
    return {
      label: "Expediente Inscrito",
      colorClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      hexColor: "#eab308" // Amarillo
    };
  }
  if (norm.includes("no elegible") || norm.includes("no_elegible")) {
    return {
      label: "Expediente No Elegible",
      colorClass: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      hexColor: "#ef4444" // Rojo
    };
  }
  if (norm.includes("elegible")) {
    return {
      label: "Expediente Elegible",
      colorClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      hexColor: "#22c55e" // Verde
    };
  }
  if (norm.includes("codigo") || norm.includes("código")) {
    return {
      label: "Expediente con Código de Proyecto",
      colorClass: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      hexColor: "#a855f7" // Morado
    };
  }
  if (norm.includes("aproba")) {
    return {
      label: "Expediente Aprobado",
      colorClass: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      hexColor: "#3b82f6" // Azul
    };
  }

  // Fallback
  return {
    label: estado || "Expediente en Revisión",
    colorClass: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    hexColor: "#64748b"
  };
}
