import { Beneficiario, Insumo, PartidaAPU } from "../types";

export const INSUMOS_INICIALES: Insumo[] = [
  // Mano de Obra (costo por hora hombre HH)
  { id: "peon", descripcion: "Peón (Mano de Obra)", unidad: "HH", precioUnitario: 17.50 },
  { id: "oficial", descripcion: "Oficial (Mano de Obra)", unidad: "HH", precioUnitario: 20.00 },
  { id: "operario", descripcion: "Operario (Mano de Obra)", unidad: "HH", precioUnitario: 25.50 },

  // Materiales
  { id: "cemento", descripcion: "Cemento Portland Tipo I", unidad: "Bolsa", precioUnitario: 28.50 },
  { id: "arena_gruesa", descripcion: "Arena Gruesa", unidad: "m3", precioUnitario: 65.00 },
  { id: "arena_fina", descripcion: "Arena Fina", unidad: "m3", precioUnitario: 80.00 },
  { id: "piedra_chancada", descripcion: "Piedra Chancada de 1/2\"", unidad: "m3", precioUnitario: 90.00 },
  { id: "ladrillo_kk", descripcion: "Ladrillo King Kong 18 Huecos", unidad: "Unidad", precioUnitario: 1.10 },
  { id: "fierro_3_8", descripcion: "Acero Corrugado de 3/8\"", unidad: "Varilla", precioUnitario: 26.00 },
  { id: "alambre_16", descripcion: "Alambre Negro N° 16", unidad: "kg", precioUnitario: 8.00 },
  { id: "madera_encofrado", descripcion: "Madera Tornillo para Encofrado", unidad: "p2", precioUnitario: 9.00 },
  { id: "agua", descripcion: "Agua puesta en obra", unidad: "m3", precioUnitario: 15.00 },

  // Equipos / Herramientas
  { id: "mezcladora", descripcion: "Mezcladora de Concreto 9-11p3", unidad: "HM", precioUnitario: 20.00 },
  { id: "vibrador", descripcion: "Vibrador de Concreto 4HP", unidad: "HM", precioUnitario: 15.00 }
];

export const PARTIDAS_APU_INICIALES: PartidaAPU[] = [
  {
    item: "01.01",
    descripcion: "Limpieza de terreno manual",
    unidad: "m2",
    rendimiento: 40, // 40 m2 por dia
    manoDeObra: [
      { insumoId: "peon", coeficiente: 0.2 } // 1 peon por 8h = 0.2 HH/m2
    ],
    materiales: [],
    equipos: [
      { insumoId: "peon", coeficiente: 0.03 } // 3% del costo de mano de obra para herramientas manuales
    ]
  },
  {
    item: "01.02",
    descripcion: "Trazo, nivelación y replanteo preliminar",
    unidad: "m2",
    rendimiento: 50,
    manoDeObra: [
      { insumoId: "operario", coeficiente: 0.16 },
      { insumoId: "peon", coeficiente: 0.16 }
    ],
    materiales: [
      { insumoId: "madera_encofrado", coeficiente: 0.1 },
      { insumoId: "alambre_16", coeficiente: 0.05 }
    ],
    equipos: []
  },
  {
    item: "02.01",
    descripcion: "Excavación manual de zanjas para cimientos (prof. = 1.00m)",
    unidad: "m3",
    rendimiento: 3.5,
    manoDeObra: [
      { insumoId: "peon", coeficiente: 2.28 }
    ],
    materiales: [],
    equipos: []
  },
  {
    item: "03.01",
    descripcion: "Cimientos corridos concreto 1:10 + 30% piedra grande",
    unidad: "m3",
    rendimiento: 12,
    manoDeObra: [
      { insumoId: "operario", coeficiente: 0.67 },
      { insumoId: "oficial", coeficiente: 0.67 },
      { insumoId: "peon", coeficiente: 4.0 }
    ],
    materiales: [
      { insumoId: "cemento", coeficiente: 2.9 },
      { insumoId: "arena_gruesa", coeficiente: 0.8 },
      { insumoId: "piedra_chancada", coeficiente: 0.4 },
      { insumoId: "agua", coeficiente: 0.12 }
    ],
    equipos: [
      { insumoId: "mezcladora", coeficiente: 0.67 }
    ]
  },
  {
    item: "04.01",
    descripcion: "Muro de ladrillo King Kong de cabeza con mezcla 1:5",
    unidad: "m2",
    rendimiento: 9,
    manoDeObra: [
      { insumoId: "operario", coeficiente: 0.89 },
      { insumoId: "peon", coeficiente: 0.44 }
    ],
    materiales: [
      { insumoId: "ladrillo_kk", coeficiente: 38 },
      { insumoId: "cemento", coeficiente: 0.35 },
      { insumoId: "arena_fina", coeficiente: 0.02 }
    ],
    equipos: []
  },
  {
    item: "05.01",
    descripcion: "Concreto en columnas f'c = 210 kg/cm2",
    unidad: "m3",
    rendimiento: 8,
    manoDeObra: [
      { insumoId: "operario", coeficiente: 1.5 },
      { insumoId: "oficial", coeficiente: 1.0 },
      { insumoId: "peon", coeficiente: 5.0 }
    ],
    materiales: [
      { insumoId: "cemento", coeficiente: 9.7 },
      { insumoId: "arena_gruesa", coeficiente: 0.52 },
      { insumoId: "piedra_chancada", coeficiente: 0.53 },
      { insumoId: "fierro_3_8", coeficiente: 15.0 }, // acero estimado por m3
      { insumoId: "alambre_16", coeficiente: 1.2 },
      { insumoId: "madera_encofrado", coeficiente: 12.0 }
    ],
    equipos: [
      { insumoId: "mezcladora", coeficiente: 1.0 },
      { insumoId: "vibrador", coeficiente: 1.0 }
    ]
  },
  {
    item: "06.01",
    descripcion: "Losa aligerada f'c = 175 kg/cm2",
    unidad: "m2",
    rendimiento: 18,
    manoDeObra: [
      { insumoId: "operario", coeficiente: 0.88 },
      { insumoId: "oficial", coeficiente: 0.44 },
      { insumoId: "peon", coeficiente: 2.22 }
    ],
    materiales: [
      { insumoId: "cemento", coeficiente: 0.85 },
      { insumoId: "arena_gruesa", coeficiente: 0.05 },
      { insumoId: "piedra_chancada", coeficiente: 0.06 },
      { insumoId: "fierro_3_8", coeficiente: 2.5 },
      { insumoId: "alambre_16", coeficiente: 0.15 },
      { insumoId: "madera_encofrado", coeficiente: 4.5 }
    ],
    equipos: [
      { insumoId: "mezcladora", coeficiente: 0.44 },
      { insumoId: "vibrador", coeficiente: 0.44 }
    ]
  },
  {
    item: "07.01",
    descripcion: "Tarrajeo en interiores y exteriores con mortero 1:4",
    unidad: "m2",
    rendimiento: 16,
    manoDeObra: [
      { insumoId: "operario", coeficiente: 0.5 },
      { insumoId: "peon", coeficiente: 0.25 }
    ],
    materiales: [
      { insumoId: "cemento", coeficiente: 0.12 },
      { insumoId: "arena_fina", coeficiente: 0.015 }
    ],
    equipos: []
  },
  {
    item: "07.02",
    descripcion: "Pintura latex en muros (2 manos)",
    unidad: "m2",
    rendimiento: 25,
    manoDeObra: [
      { insumoId: "operario", coeficiente: 0.32 },
      { insumoId: "peon", coeficiente: 0.08 }
    ],
    materiales: [],
    equipos: []
  },
  {
    item: "08.01",
    descripcion: "Instalación de red de agua y desagüe (Salida y tendido)",
    unidad: "Global",
    rendimiento: 1,
    manoDeObra: [
      { insumoId: "operario", coeficiente: 16.0 },
      { insumoId: "peon", coeficiente: 16.0 }
    ],
    materiales: [
      { insumoId: "cemento", coeficiente: 1.0 },
      { insumoId: "arena_gruesa", coeficiente: 0.2 }
    ],
    equipos: []
  }
];

export const BENEFICIARIOS_INICIALES: Beneficiario[] = [];
