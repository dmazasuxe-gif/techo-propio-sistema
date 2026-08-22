const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Fix para Supabase en Node 20 sin soporte WebSocket nativo
global.WebSocket = require('ws');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("No se encontraron variables de entorno para Supabase.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Obteniendo usuarios...");
  const { data: users, error } = await supabase.from('usuarios').select('*');
  
  if (error) {
    console.error("Error al obtener usuarios:", error);
    process.exit(1);
  }

  console.log(`Se encontraron ${users.length} usuarios.`);
  
  let updatedCount = 0;
  for (const user of users) {
    // Si la contraseña ya es un hash de bcrypt, empieza con $2a$ o $2b$
    if (user.password && !user.password.startsWith('$2a$')) {
      console.log(`Encriptando contraseña para el usuario: ${user.username}`);
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(user.password, salt);
      
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ password: hashedPassword })
        .eq('id', user.id);
        
      if (updateError) {
        console.error(`Error al actualizar a ${user.username}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }
  
  console.log(`Proceso finalizado. Se encriptaron ${updatedCount} contraseñas.`);
}

main();
