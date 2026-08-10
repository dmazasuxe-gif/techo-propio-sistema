import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import { saveLocalFileToStorage } from './file-manager';
import { Beneficiario, MaestroObra } from '../app/types';

async function getBrowser() {
  const browserlessToken = process.env.BROWSERLESS_API_TOKEN;

  if (browserlessToken) {
    const puppeteerCore = await import('puppeteer-core');
    return await puppeteerCore.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${browserlessToken}`,
      defaultViewport: { width: 1200, height: 800 },
    });
  }

  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    const puppeteerCore = await import('puppeteer-core');
    return await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: { width: 1200, height: 800 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } else {
    return await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
    });
  }
}
import { getDb } from './db';

const UPLOADS_DIR = process.env.VERCEL 
  ? path.join('/tmp', 'fichas') 
  : path.join(process.cwd(), 'public', 'uploads', 'fichas');

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname, { recursive: true });
}

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

export async function generarFichaBeneficiarioPDF(id: string): Promise<string | null> {
  const db = await getDb();
  const searchStr = id.toLowerCase().trim();
  const form = db.beneficiarios.find(b => 
    b.id === id || 
    (b.postulante && b.postulante.toLowerCase().includes(searchStr)) || 
    (b.dniPostulante && b.dniPostulante.includes(searchStr))
  );
  if (!form) return null;

  const timestamp = Date.now();
  const fileName = `Ficha_Beneficiario_${id}_${timestamp}.pdf`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  ensureDirectoryExistence(filePath);

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
      <span style="font-size:9px;opacity:0.6">Emitido: ${new Date().toLocaleDateString("es-PE")}</span>
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
        <div class="field"><label>Nombres</label><value>${form.nombres || "—"}</value></div>
        <div class="field"><label>Apellido Paterno</label><value>${form.apellidoPaterno || "—"}</value></div>
        <div class="field"><label>Apellido Materno</label><value>${form.apellidoMaterno || "—"}</value></div>
        <div class="field mono"><label>Fecha de Nacimiento</label><value>${form.fechaNacimiento || "—"}</value></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>Teléfono / Celular</label><value>${form.celular || "—"}</value></div>
        <div class="field"><label>Estado Civil</label><value>${form.estadoCivil || "—"}</value></div>
      </div>
    </div>
  </div>
  ${form.cargaFamiliar && form.cargaFamiliar.length > 0 ? `
  <div class="section">
    <div class="section-title">👥 Carga Familiar / Integrantes</div>
    <div class="section-body" style="padding: 0;">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 10px;">
        <thead style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569;">
          <tr>
            <th style="padding: 8px 14px;">Parentesco</th>
            <th style="padding: 8px 14px;">Nombres y Apellidos</th>
            <th style="padding: 8px 14px;">DNI</th>
            <th style="padding: 8px 14px;">F. Nacimiento</th>
          </tr>
        </thead>
        <tbody>
          ${form.cargaFamiliar.map((c: any) => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 14px;">${c.parentesco || "—"}</td>
            <td style="padding: 8px 14px; font-weight: 600;">${c.nombres || ""} ${c.apellidos || ""}</td>
            <td style="padding: 8px 14px; font-family: monospace;">${c.dni || "—"}</td>
            <td style="padding: 8px 14px; font-family: monospace;">${c.fechaNacimiento || "—"}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>` : ""}
  <div class="section">
    <div class="section-title">📍 Ubicación del Predio — UBIGEO Perú</div>
    <div class="section-body">
      <div class="grid-3">
        <div class="field"><label>Departamento</label><value>${form.departamento || "—"}</value></div>
        <div class="field"><label>Provincia</label><value>${form.provincia || "—"}</value></div>
        <div class="field"><label>Distrito</label><value>${form.distrito || "—"}</value></div>
      </div>
      <div class="grid-4">
        <div class="field"><label>Centro Poblado</label><value>${(form as any).centroPoblado || "—"}</value></div>
        <div class="field"><label>Barrio / Sector</label><value>${(form as any).barrioSector || "—"}</value></div>
        <div class="field"><label>Jr. / Av. / Calle</label><value>${(form as any).calle || "—"}</value></div>
        <div class="field"><label>Partida Registral SUNARP</label><value>${(form as any).partidaElectronica || "—"}</value></div>
      </div>
      <div class="grid-2">
        <div class="field mono"><label>N° Licencia de Construcción</label><value>${(form as any).licenciaConstruccion || "—"}</value></div>
        <div class="field mono"><label>N° Conformidad de Obra</label><value>${(form as any).conformidadObra || "—"}</value></div>
      </div>
      <div class="grid-4">
        <div class="field"><label>Manzana (Mz.)</label><value>${(form as any).manzana || "—"}</value></div>
        <div class="field"><label>Lote (Lt.)</label><value>${(form as any).lote || "—"}</value></div>
        <div class="field mono"><label>Coordenada X (Este UTM)</label><value>${form.coordenadaX || "—"}</value></div>
        <div class="field mono"><label>Coordenada Y (Norte UTM)</label><value>${form.coordenadaY || "—"}</value></div>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">📐 Área y Linderos del Terreno</div>
    <div class="section-body">
      <div class="grid-4">
        <div class="field"><label>Área Total (m²)</label><value>${(form as any).areaTotal || "—"}</value></div>
        <div class="field"><label>Por el Frente (m)</label><value>${(form as any).porFrente || "—"}</value></div>
        <div class="field"><label>Por la Derecha (m)</label><value>${(form as any).porDerecha || "—"}</value></div>
        <div class="field"><label>Por el Fondo (m)</label><value>${(form as any).porFondo || "—"}</value></div>
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
</body>
</html>`;

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(printContent, { waitUntil: 'load' });
    await page.pdf({ path: filePath, format: 'A4', margin: { top: '18mm', bottom: '18mm', left: '15mm', right: '15mm' } });
    await browser.close();
    const publicUrl = await saveLocalFileToStorage(filePath, 'fichas');
    return publicUrl || filePath;
  } catch (error) {
    console.error("Puppeteer error generating beneficiary PDF:", error);
    return null;
  }
}

export async function generarFichaMaestroPDF(id: string): Promise<string | null> {
  const db = await getDb();
  let m: any = undefined;
  const searchStr = id.toLowerCase().trim();
  
  // check cronogramaMaestros first (has pagados), then maestros
  if (db.cronogramaMaestros) {
    m = db.cronogramaMaestros.find(x => x.id === id || (x.nombre && x.nombre.toLowerCase().includes(searchStr)) || (x.dni && x.dni.includes(searchStr)));
  }
  if (!m && db.maestros) {
    m = db.maestros.find(x => x.id === id || (x.nombre && x.nombre.toLowerCase().includes(searchStr)) || (x.dni && x.dni.includes(searchStr))) as any;
  }

  if (!m) return null;

  const beneficiariosDelMaestro = (db.beneficiarios || []).filter((b: any) => 
    b.maestroAsignadoId === m.id || 
    (m.beneficiariosAsignados && Array.isArray(m.beneficiariosAsignados) && m.beneficiariosAsignados.includes(b.id))
  );

  const timestamp = Date.now();
  const fileName = `Ficha_Maestro_${id}_${timestamp}.pdf`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  ensureDirectoryExistence(filePath);

  const nViviendas = beneficiariosDelMaestro.length > 0 ? beneficiariosDelMaestro.length : (m.beneficiariosAsignados?.length || 0);
  const contratoTotal = m.montoPorVivienda ? (m.montoPorVivienda * nViviendas) : 0;
  const pagado = (m.pagos || [])
    .filter((p:any) => p.estado === "Pagado" || p.estado === "Pagado parcial")
    .reduce((acc:any, curr:any) => acc + curr.monto, 0);

  const beneficiariosHtml = beneficiariosDelMaestro.length > 0 ? `
  <h3 style="margin-top: 20px; margin-bottom: 10px; font-size: 12px; border-bottom: 2px solid #0f172a; padding-bottom: 5px;">Beneficiarios Asignados y Avance de Obra</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 50px;">N°</th>
        <th>Nombre del Beneficiario</th>
        <th style="width: 100px;">DNI</th>
        <th style="width: 150px;">Etapa Actual</th>
        <th style="width: 120px; text-align: center;">Avance Físico</th>
      </tr>
    </thead>
    <tbody>
      ${beneficiariosDelMaestro.map((b: any, i: number) => {
        const avance = b.avanceViviendaPct || 0;
        const color = avance === 100 ? '#16a34a' : (avance > 0 ? '#0284c7' : '#94a3b8');
        return `
          <tr>
            <td style="text-align:center">${i + 1}</td>
            <td style="font-weight: 600;">${b.postulante || '—'}</td>
            <td style="text-align:center; font-family: monospace;">${b.dniPostulante || "—"}</td>
            <td style="text-align:center">${b.etapaVivienda || "Pendiente"}</td>
            <td style="text-align:center">
              <div style="font-weight: 700; margin-bottom: 2px; color: ${color};">${avance}%</div>
              <div style="width: 100%; background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="width: ${avance}%; background: ${color}; height: 100%; border-radius: 3px;"></div>
              </div>
            </td>
          </tr>
        `;
      }).join("")}
    </tbody>
  </table>
  ` : '';

  const pagosHtml = (m.pagos || []).map((p:any, i:number) => `
    <tr>
      <td style="text-align:center">${i + 1}</td>
      <td>${p.descripcion}</td>
      <td style="text-align:center">${p.fecha}</td>
      <td style="text-align:right">S/ ${p.monto.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</td>
      <td style="text-align:center"><span class="badge badge-${p.estado.replace(" ", "")}">${p.estado}</span></td>
    </tr>
  `).join("");

  const printContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Ficha / Cronograma - ${m.nombre}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; font-size: 11px; }
    
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fff; padding: 20px 24px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header h1 { font-size: 17px; font-weight: 900; margin-bottom: 2px; }
    .header p { font-size: 10px; opacity: 0.8; }
    
    .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; background: #f8fafc; }
    .info-box { display: flex; flex-direction: column; }
    .info-box span { font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
    .info-box strong { font-size: 11px; color: #0f172a; }

    table { border-collapse: collapse; margin-bottom: 20px; width: 100%; }
    th { background: #0f172a; color: white; padding: 8px; font-size: 10px; text-transform: uppercase; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
    
    .totals { width: 300px; margin-left: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 30px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .totals-row:last-child { background: #f8fafc; border-bottom: none; font-weight: bold; }

    .badge { font-size: 9px; font-weight: bold; padding: 3px 6px; border-radius: 4px; border: 1px solid; }
    .badge-Pagado { background: rgba(34,197,94,0.15); color: #166534; border-color: rgba(34,197,94,0.4); }
    .badge-Pagadoparcial { background: rgba(245,158,11,0.15); color: #b45309; border-color: rgba(245,158,11,0.4); }
    .badge-Pendiente { background: rgba(100,116,139,0.15); color: #475569; border-color: rgba(100,116,139,0.4); }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>📋 Ficha / Cronograma de Pagos</h1>
      <p>Módulo de Control de Avance - Maestro de Obra</p>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 13px; font-weight: bold;">${m.nombre}</div>
      <div style="font-size: 10px; opacity: 0.7;">DNI: ${m.dni || "—"}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box"><span>Especialidad</span><strong>${m.especialidad || "—"}</strong></div>
    <div class="info-box"><span>Viviendas Asignadas</span><strong>${nViviendas} módulos</strong></div>
    <div class="info-box"><span>Tarifa por Módulo</span><strong>S/ ${m.montoPorVivienda ? m.montoPorVivienda.toLocaleString("es-PE", { minimumFractionDigits: 2 }) : "—"}</strong></div>
    <div class="info-box"><span>Contrato Total Estimado</span><strong>S/ ${contratoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</strong></div>
  </div>

  ${beneficiariosHtml}

  <h3 style="margin-top: 20px; margin-bottom: 10px; font-size: 12px; border-bottom: 2px solid #0f172a; padding-bottom: 5px;">Detalle de Avances y Pagos</h3>
  
  ${(m.pagos && m.pagos.length > 0) ? `
  <table>
    <thead>
      <tr>
        <th style="width: 50px;">N°</th>
        <th>Hito de Avance (Pago)</th>
        <th style="width: 100px;">Fecha</th>
        <th style="width: 120px; text-align: right;">Monto (S/)</th>
        <th style="width: 100px;">Estado</th>
      </tr>
    </thead>
    <tbody>
      ${pagosHtml}
    </tbody>
  </table>
  ` : `<p style="text-align:center; padding: 20px; color: #94a3b8; font-style: italic;">No hay pagos registrados aún para este maestro.</p>`}

  <div class="totals">
    <div class="totals-row">
      <span>Total Contratado:</span>
      <span>S/ ${contratoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="totals-row">
      <span>Total Pagado a la Fecha:</span>
      <span style="color: #166534;">S/ ${pagado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="totals-row">
      <span>Saldo Pendiente (Deuda):</span>
      <span style="color: #b45309;">S/ ${(contratoTotal - pagado).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
    </div>
  </div>

  <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8;">
    Documento autogenerado por Sistema Techo Propio — ${new Date().toLocaleString("es-PE")}
  </div>
</body>
</html>`;

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(printContent, { waitUntil: 'load' });
    await page.pdf({ path: filePath, format: 'A4', margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' } });
    await browser.close();
    const publicUrl = await saveLocalFileToStorage(filePath, 'fichas_maestros');
    return publicUrl || filePath;
  } catch (error) {
    console.error("Puppeteer error generating maestro PDF:", error);
    return null;
  }
}

export interface PresupuestoItemData {
  item: string;
  descripcion: string;
  unidad: string;
  metrado: number;
  unitario: number;
  parcial: number;
  isCustom?: boolean;
}

export interface PresupuestoData {
  beneficiarioNombre?: string;
  beneficiarioId?: string;
  items: PresupuestoItemData[];
  costoDirecto: number;
  gastosPct: number;
  utilidadPct: number;
  gastosGenerales: number;
  utilidad: number;
  subTotalSinIgv: number;
  igvPct: number;
  igvMonto: number;
  presupuestoTotal: number;
  isSelvaExempt: boolean;
}

export async function generarPresupuestoPDFFromData(data: PresupuestoData): Promise<string | null> {
  const fileName = `Presupuesto_${data.beneficiarioId || "General"}_${Date.now()}.pdf`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  ensureDirectoryExistence(filePath);

  const fmt = (n: number) => n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const itemsHtml = data.items.map((item, idx) => `
    <tr class="${idx % 2 === 0 ? '' : 'alt-row'}">
      <td class="code-col">${item.item}</td>
      <td class="desc-col">${item.descripcion}${item.isCustom ? ' <span class="custom-badge">Personalizado</span>' : ''}</td>
      <td class="center-col">${item.unidad}</td>
      <td class="num-col">${item.metrado.toFixed(2)}</td>
      <td class="num-col">${item.unitario.toFixed(2)}</td>
      <td class="num-col total-col">${item.parcial.toFixed(2)}</td>
    </tr>
  `).join("");

  const printContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Presupuesto de Obra - ${data.beneficiarioNombre || "Techo Propio"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 portrait; margin: 15mm 12mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; font-size: 10px; }
    
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fff; padding: 18px 22px; border-radius: 8px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header-title h1 { font-size: 16px; font-weight: 900; margin-bottom: 2px; letter-spacing: -0.3px; }
    .header-title p { font-size: 9px; opacity: 0.7; }
    .header-right { text-align: right; display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
    .exp-badge { background: rgba(56,189,248,0.2); border: 1px solid rgba(56,189,248,0.4); color: #7dd3fc; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 5px; font-family: monospace; letter-spacing: 0.5px; }
    .selva-badge { background: rgba(34,197,94,0.2); border: 1px solid rgba(34,197,94,0.4); color: #86efac; font-size: 8px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
    thead th { background: #0f172a; color: #e2e8f0; padding: 7px 8px; font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; border-bottom: 2px solid #334155; }
    tbody td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
    .alt-row { background: #f8fafc; }
    .code-col { font-weight: 700; color: #3b82f6; font-family: monospace; width: 55px; }
    .desc-col { font-weight: 600; color: #1e293b; }
    .center-col { text-align: center; color: #64748b; width: 50px; }
    .num-col { text-align: right; font-family: monospace; font-weight: 600; color: #334155; width: 85px; }
    .total-col { color: #059669; font-weight: 700; }
    .custom-badge { background: rgba(56,189,248,0.15); color: #0284c7; font-size: 7px; font-weight: 700; padding: 1px 4px; border-radius: 3px; margin-left: 4px; }
    
    .summary-box { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 14px; }
    .summary-row { display: flex; justify-content: space-between; padding: 7px 14px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
    .summary-row:last-child { border-bottom: none; }
    .summary-row.highlight { background: #f0fdf4; }
    .summary-row.total { background: #0f172a; color: #fff; font-size: 12px; font-weight: 900; }
    .summary-row .label { color: #475569; font-weight: 600; }
    .summary-row .value { font-family: monospace; font-weight: 700; color: #1e293b; }
    .summary-row.total .value { color: #34d399; font-size: 13px; }
    
    .footer { margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; align-items: center; }
    .footer-left { font-size: 8px; color: #94a3b8; }
    .footer-right { font-size: 8px; color: #94a3b8; }
    
    .watermark { position: fixed; bottom: 30mm; left: 50%; transform: translateX(-50%); font-size: 55px; color: rgba(15,23,42,0.03); font-weight: 900; white-space: nowrap; pointer-events: none; z-index: 0; }
  </style>
</head>
<body>
  <div class="watermark">TECHO PROPIO</div>
  
  <div class="header">
    <div class="header-title">
      <h1>📊 Presupuesto Detallado de Obra</h1>
      <p>Programa Construcción en Sitio Propio (CSP) — Constructora Maza Quiroz</p>
    </div>
    <div class="header-right">
      ${data.beneficiarioId ? '<div class="exp-badge">📋 EXP: ' + data.beneficiarioId + '</div>' : ''}
      ${data.isSelvaExempt ? '<div class="selva-badge">🌿 Ley Selva 27037 — IGV 0%</div>' : ''}
      <span style="font-size:8px;opacity:0.6">Emitido: ${new Date().toLocaleDateString("es-PE")}</span>
    </div>
  </div>
  
  ${data.beneficiarioNombre ? '<div style="margin-bottom:12px;padding:8px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:11px"><strong style="color:#475569">Beneficiario:</strong> <span style="font-weight:900;color:#0f172a">' + data.beneficiarioNombre + '</span></div>' : ''}
  
  <table>
    <thead>
      <tr>
        <th style="text-align:left">Item</th>
        <th style="text-align:left">Descripción de Partida / Producto</th>
        <th style="text-align:center">Und</th>
        <th style="text-align:right">Metrado</th>
        <th style="text-align:right">P. Unit (S/)</th>
        <th style="text-align:right">Parcial (S/)</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>
  
  <div class="summary-box">
    <div class="summary-row">
      <span class="label">Costo Directo Vivienda (Sin IGV)</span>
      <span class="value">S/ ${fmt(data.costoDirecto)}</span>
    </div>
    <div class="summary-row">
      <span class="label">Gastos Generales (${data.gastosPct}%)</span>
      <span class="value" style="color:#64748b">S/ ${fmt(data.gastosGenerales)}</span>
    </div>
    <div class="summary-row">
      <span class="label">Utilidad del Contratista (${data.utilidadPct}%)</span>
      <span class="value" style="color:#64748b">S/ ${fmt(data.utilidad)}</span>
    </div>
    <div class="summary-row" style="border-top:2px solid #e2e8f0">
      <span class="label" style="font-weight:800">Subtotal Vivienda Sin IGV</span>
      <span class="value" style="color:#0284c7">S/ ${fmt(data.subTotalSinIgv)}</span>
    </div>
    <div class="summary-row highlight">
      <span class="label">IGV (${data.igvPct}% ${data.isSelvaExempt ? "— Ley de la Selva 27037" : "— General"})</span>
      <span class="value" style="color:#64748b">S/ ${fmt(data.igvMonto)}</span>
    </div>
    <div class="summary-row total">
      <span>COSTO TOTAL VIVIENDA (S/)</span>
      <span class="value">S/ ${fmt(data.presupuestoTotal)}</span>
    </div>
  </div>
  
  <div class="footer">
    <div class="footer-left">Sistema Techo Propio — Constructora Maza Quiroz &nbsp;|&nbsp; Generado el ${new Date().toLocaleString("es-PE")}</div>
    <div class="footer-right">${data.beneficiarioId ? 'Expediente: <strong>' + data.beneficiarioId + '</strong>' : ''}</div>
  </div>
</body>
</html>`;

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(printContent, { waitUntil: 'load' });
    await page.pdf({ path: filePath, format: 'A4', margin: { top: '15mm', bottom: '15mm', left: '12mm', right: '12mm' } });
    await browser.close();
    const publicUrl = await saveLocalFileToStorage(filePath, 'presupuestos');
    return publicUrl || filePath;
  } catch (error) {
    console.error("Puppeteer error generating presupuesto PDF:", error);
    return null;
  }
}

export async function generarCronogramaObraPDF(): Promise<string | null> {
  const db = await getDb();
  
  let tareas = db.cronogramaObra || [];
  if (tareas.length === 0) {
    tareas = [
      { id: "t1", actividad: "01. Obras Preliminares & Excavación",       inicioSemana: 1, duracionSemanas: 1, avancePct: 0, responsable: "Maestro de Obra" },
      { id: "t2", actividad: "02. Cimentación & Sobrecimientos",          inicioSemana: 1, duracionSemanas: 2, avancePct: 0, responsable: "Estructuras" },
      { id: "t3", actividad: "03. Muros de Ladrillo Soga",                inicioSemana: 2, duracionSemanas: 2, avancePct: 0, responsable: "Albañilería" },
      { id: "t4", actividad: "04. Columnas y Vigas de Concreto",          inicioSemana: 3, duracionSemanas: 2, avancePct: 0, responsable: "Estructuras" },
      { id: "t5", actividad: "05. Techo Aligerado & Vaciado",             inicioSemana: 4, duracionSemanas: 2, avancePct: 0, responsable: "Estructuras" },
      { id: "t6", actividad: "06. Tarrajeo, Pisos & Zócalos",             inicioSemana: 5, duracionSemanas: 2, avancePct: 0, responsable: "Acabados" },
      { id: "t7", actividad: "07. Instalaciones Sanitarias & Eléctricas", inicioSemana: 6, duracionSemanas: 2, avancePct: 0, responsable: "Instalaciones" },
      { id: "t8", actividad: "08. Pintura & Puertas / Ventanas",          inicioSemana: 7, duracionSemanas: 2, avancePct: 0, responsable: "Pintura" },
    ] as any;
  }

  const avanceTotalObra = Math.round(
    tareas.reduce((acc: any, t: any) => acc + (t.avancePct || t.avance_pct || 0), 0) / tareas.length
  );

  const fileName = `Cronograma_Global_${Date.now()}.pdf`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  ensureDirectoryExistence(filePath);

  const itemsHtml = tareas.map((t: any) => {
    const avance = t.avancePct !== undefined ? t.avancePct : (t.avance_pct || 0);
    const bgClass = avance === 100 ? 'bg-emerald' : (avance > 0 ? 'bg-sky' : 'bg-slate');
    return `
      <div class="task-card">
        <div class="task-header">
          <div class="task-info">
            <span class="actividad">${t.actividad}</span>
            <span class="responsable">Responsable: ${t.responsable}</span>
          </div>
          <div class="task-pct">${avance}%</div>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill ${bgClass}" style="width: ${avance}%"></div>
        </div>
      </div>
    `;
  }).join("");

  const printContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Cronograma de Ejecución de Obra</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 portrait; margin: 15mm 12mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; font-size: 11px; }
    
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fff; padding: 18px 22px; border-radius: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .header-title h1 { font-size: 18px; font-weight: 900; margin-bottom: 4px; }
    .header-title p { font-size: 10px; opacity: 0.7; }
    
    .global-progress { background: #0f172a; border: 1px solid #1e3a5f; padding: 10px 16px; border-radius: 12px; text-align: right; }
    .global-progress .label { font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; display: block; }
    .global-progress .value { font-size: 16px; font-weight: 900; color: #38bdf8; font-family: monospace; }
    
    .task-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
    .task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .task-info { display: flex; flex-direction: column; gap: 2px; }
    .actividad { font-size: 12px; font-weight: 800; color: #0f172a; }
    .responsable { font-size: 10px; color: #64748b; font-weight: 600; }
    
    .task-pct { background: rgba(56,189,248,0.15); color: #0284c7; border: 1px solid rgba(56,189,248,0.3); font-weight: 800; font-family: monospace; font-size: 12px; padding: 4px 8px; border-radius: 6px; }
    
    .progress-bar-bg { width: 100%; background: #e2e8f0; border-radius: 999px; height: 10px; overflow: hidden; }
    .progress-bar-fill { height: 100%; border-radius: 999px; }
    .bg-emerald { background: #10b981; }
    .bg-sky { background: #38bdf8; }
    .bg-slate { background: #cbd5e1; }
    
    .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title">
      <h1>⏳ Cronograma de Ejecución de Obra</h1>
      <p>Reporte de Avance Físico General</p>
    </div>
    <div class="global-progress">
      <span class="label">Avance Global</span>
      <span class="value">${avanceTotalObra}% COMPLETADO</span>
    </div>
  </div>
  
  <div class="tasks">
    ${itemsHtml}
  </div>

  <div class="footer">
    <div>Sistema Techo Propio — Constructora Maza Quiroz</div>
    <div>Generado el ${new Date().toLocaleString("es-PE")}</div>
  </div>
</body>
</html>`;

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(printContent, { waitUntil: 'load' });
    await page.pdf({ path: filePath, format: 'A4', margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' } });
    await browser.close();
    const publicUrl = await saveLocalFileToStorage(filePath, 'cronogramas');
    return publicUrl || filePath;
  } catch (error) {
    console.error("Puppeteer error generating cronograma PDF:", error);
    return null;
  }
}
