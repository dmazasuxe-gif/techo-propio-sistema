export interface DocumentoAdjunto {
  id: string;
  tipo: "DNI" | "Contrato" | "Acta" | "Plano" | "Voucher" | "Resolución" | "Otro" | string;
  nombre: string;
  url?: string;
  fecha: string;
}

export interface IntegranteCargaFamiliar {
  id: string;
  parentesco: string;
  nombres: string;
  apellidos: string;
  dni: string;
  fechaNacimiento: string;
}

export interface MaestroObra {
  id: string;
  nombre: string;
  dni: string;
  celular: string;
  especialidad: string;
  tarifaVivienda: string;
  beneficiarioAsignadoId?: string;
  beneficiarioAsignadoNombre?: string;
}

export interface HistorialCambio {
  id: string;
  fecha: string;
  usuario: string;
  accion: string;
  campoModificado?: string;
  valorAnterior?: string;
  valorNuevo?: string;
}

export type EstadoExpediente = 
  | "Expediente en Revisión"
  | "Expediente Inscrito"
  | "Expediente Elegible"
  | "Expediente No Elegible"
  | "Expediente con Código de Proyecto"
  | "Expediente Aprobado";

export interface Beneficiario {
  id: string; // ID automático (ej. REG-0001 / EXP-2026-001)
  expediente?: string; // Ej. SAN MARTÍN
  estado: EstadoExpediente | string;

  // Postulante
  postulante: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nombres?: string;
  dniPostulante: string;
  fechaNacimiento?: string;
  sexo?: string;
  celular: string;
  estadoCivil?: string;
  tieneConyuge?: boolean;

  // Cónyuge (Legacy - para retrocompatibilidad)
  conyuge?: string;
  dniConyuge?: string;
  apellidoPaternoConyuge?: string;
  apellidoMaternoConyuge?: string;
  nombresConyuge?: string;
  fechaNacimientoConyuge?: string;

  // Carga Familiar / Cónyuge (Nueva estructura dinámica)
  cargaFamiliar?: IntegranteCargaFamiliar[];

  // Ubicación
  ubicacion?: string;
  departamento: string;
  provincia: string;
  distrito: string;
  centroPoblado?: string;
  barrioSector?: string;
  calle?: string; // Jr. / Av. / Calle
  manzana?: string;
  lote?: string;
  partidaElectronica?: string;
  coordenadaX?: string;
  coordenadaY?: string;
  direccion: string;
  licenciaConstruccion?: string;  // N° Licencia de Construcción
  conformidadObra?: string;       // N° Conformidad de Obra

  // Programa y Obra
  programa?: string; // Ej. AVN (Adquisición de Vivienda Nueva), CSP (Construcción en Sitio Propio)
  etapaVivienda?: string; // Ej. Obras Preliminares, Cimentación, Muros, Columnas, Techo, Acabados, Entregado
  avanceViviendaPct?: number;
  fechaInicioObra?: string;
  fechaFinObra?: string;
  maestroAsignadoId?: string;
  maestroAsignadoNombre?: string;

  // Área y linderos
  areaTotal?: string;
  porFrente?: string;
  porDerecha?: string;
  porIzquierda?: string;
  porFondo?: string;
  areaTechada?: string;
  areaConstruida?: string;

  // Archivos e historial
  documentos?: DocumentoAdjunto[];
  historial?: HistorialCambio[];

  // Notas
  notas?: string;
}

export interface Dimensiones {
  largo: number; // metros
  ancho: number; // metros
  altura: number; // metros
  espesorMuro: number; // metros (0.15 o 0.25)
  habitaciones: number; // 1 o 2 habitaciones
}

export interface PartidaMetrado {
  item: string;
  descripcion: string;
  unidad: string;
  formula: string;
  cantidad: number;
}

export interface Insumo {
  id: string;
  descripcion: string;
  unidad: string;
  precioUnitario: number;
}

export interface DetalleAPU {
  insumoId: string;
  coeficiente: number; // rendimiento o cantidad por unidad de partida
}

export interface PartidaAPU {
  item: string;
  descripcion: string;
  unidad: string;
  rendimiento: number; // e.g. 10 m2 por dia
  manoDeObra: DetalleAPU[];
  materiales: DetalleAPU[];
  equipos: DetalleAPU[];
}

export interface Desembolso {
  id: string;
  hito: string;
  fecha: string;
  monto: number;
  estado: "Pendiente" | "En trámite" | "Desembolsado" | string;
  beneficiariosAsignados: string[]; // IDs de beneficiarios
  comprobante?: string; // URL objectURL de imagen
}

export interface Financiera {
  id: string;
  nombre: string;
  desembolsos: Desembolso[];
  expandida?: boolean;
}

export interface DocumentoContable {
  id: string;
  tipoDocumento: string;
  fecha?: string;
  monto?: number;
  emisor?: string;
  ruc?: string;
  concepto?: string;
  urlArchivo?: string;
  estado?: string;
  createdAt?: string;
}

export interface ModeloVivienda {
  id: string;
  nombre: string;
  descripcion?: string;
  dimensiones?: string;
  areaM2?: number;
  tipoTecho?: string;
  modelo3dUrl?: string;
  imagenUrl?: string;
  activo?: boolean;
  orden?: number;
  createdAt?: string;
  updatedAt?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

