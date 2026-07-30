const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Variables de entorno de Supabase no encontradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
});

async function migrate() {
  const dbPath = path.join(__dirname, '../data/db.json');
  if (!fs.existsSync(dbPath)) {
    console.log('No se encontró el archivo db.json. Nada que migrar.');
    return;
  }

  const rawData = fs.readFileSync(dbPath, 'utf-8');
  const db = JSON.parse(rawData);

  function toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  function convertKeys(obj) {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[toSnakeCase(key)] = obj[key];
      }
    }
    // Remove UI only state that shouldn't go to DB
    delete newObj.presupuesto;
    delete newObj.expandida;
    delete newObj.expandido;
    return newObj;
  }

  console.log('Iniciando migración a Supabase...');

  // 1. Migrar Beneficiarios
  if (db.beneficiarios && db.beneficiarios.length > 0) {
    console.log(`Migrando ${db.beneficiarios.length} beneficiarios...`);
    for (const b of db.beneficiarios) {
      const { error } = await supabase.from('beneficiarios').upsert(convertKeys(b));
      if (error) console.error(`Error al insertar beneficiario ${b.id}:`, error.message);
    }
    console.log('Beneficiarios migrados.');
  }

  // 2. Migrar Maestros
  if (db.maestros && db.maestros.length > 0) {
    console.log(`Migrando ${db.maestros.length} maestros...`);
    for (const m of db.maestros) {
      const { error } = await supabase.from('maestros').upsert(convertKeys(m));
      if (error) console.error(`Error al insertar maestro ${m.id}:`, error.message);
    }
    console.log('Maestros migrados.');
  }

  // 3. Migrar Financieras
  if (db.financieras && db.financieras.length > 0) {
    console.log(`Migrando ${db.financieras.length} financieras...`);
    for (const f of db.financieras) {
      const { error } = await supabase.from('financieras').upsert(convertKeys(f));
      if (error) console.error(`Error al insertar financiera ${f.id}:`, error.message);
    }
    console.log('Financieras migradas.');
  }

  // 4. Migrar Cronograma Maestros
  if (db.cronogramaMaestros && db.cronogramaMaestros.length > 0) {
    console.log(`Migrando ${db.cronogramaMaestros.length} registros de cronograma de maestros...`);
    for (const cm of db.cronogramaMaestros) {
      const { error } = await supabase.from('cronograma_maestros').upsert(convertKeys(cm));
      if (error) console.error(`Error al insertar cronograma_maestro ${cm.id}:`, error.message);
    }
    console.log('Cronograma de maestros migrado.');
  }

  // 5. Migrar Cronograma Obra
  if (db.cronogramaObra && db.cronogramaObra.length > 0) {
    console.log(`Migrando ${db.cronogramaObra.length} registros de cronograma de obra...`);
    for (const co of db.cronogramaObra) {
      const { error } = await supabase.from('cronograma_obra').upsert(convertKeys(co));
      if (error) console.error(`Error al insertar cronograma_obra ${co.id}:`, error.message);
    }
    console.log('Cronograma de obra migrado.');
  }

  // 6. Migrar Planos
  if (db.planosIngenieria && db.planosIngenieria.length > 0) {
    console.log(`Migrando ${db.planosIngenieria.length} planos de ingeniería...`);
    for (const p of db.planosIngenieria) {
      const { error } = await supabase.from('planos_ingenieria').upsert(convertKeys(p));
      if (error) console.error(`Error al insertar plano ${p.id}:`, error.message);
    }
    console.log('Planos migrados.');
  }

  console.log('¡Migración completada con éxito!');
}

migrate();
