// ═══════════════════════════════════════════════════════
// SCRIPT PARA CREAR USUARIOS USANDO ADMIN API
// ═══════════════════════════════════════════════════════
//
// Este script usa la SERVICE_ROLE key para crear usuarios
// saltando el RLS que está bloqueando la creación desde el Dashboard
//
// EJECUTAR: node crear_usuarios_admin.js
//
// ═══════════════════════════════════════════════════════

const { createClient } = require('@supabase/supabase-js');

// Credenciales (SERVICE_ROLE key tiene permisos de admin)
const SUPABASE_URL = 'https://dgwqrbwxoupqbyfeuekb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnd3FyYnd4b3VwcWJ5ZmV1ZWtiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODkxMzQ1MywiZXhwIjoyMDg0NDg5NDUzfQ.v4U_Uh-86DaxXHz7qxvMnuLXVftKTelihEouYdiieZE';

// Crear cliente con SERVICE_ROLE (salta RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function crearUsuarios() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  CREANDO USUARIOS CON ADMIN API');
  console.log('═══════════════════════════════════════════════════════\n');

  const usuarios = [
    {
      email: 'jperez@serbus.internal',
      password: 'Admin123!',
      user_metadata: {
        username: 'jperez',
        nombre: 'Juan Pérez',
        rol: 'admin',
        empresa_id: 1
      }
    },
    {
      email: 'mgarcia@serbus.internal',
      password: 'Trabajo123!',
      user_metadata: {
        username: 'mgarcia',
        nombre: 'María García',
        rol: 'trabajador',
        empresa_id: 1
      }
    },
    {
      email: 'superadmin@serbus.internal',
      password: 'Super123!',
      user_metadata: {
        username: 'superadmin',
        nombre: 'Super Administrador',
        rol: 'super_admin'
      }
    }
  ];

  for (const usuario of usuarios) {
    console.log(`📝 Creando usuario: ${usuario.email}`);

    const { data, error } = await supabase.auth.admin.createUser({
      email: usuario.email,
      password: usuario.password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: usuario.user_metadata
    });

    if (error) {
      console.error(`❌ Error creando ${usuario.email}:`, error.message);
    } else {
      console.log(`✅ Usuario creado: ${usuario.email} (ID: ${data.user.id})`);

      // Crear perfil manualmente
      const { error: perfilError } = await supabase
        .from('perfiles')
        .insert({
          id: data.user.id,
          username: usuario.user_metadata.username,
          nombre: usuario.user_metadata.nombre,
          rol: usuario.user_metadata.rol,
          empresa_id: usuario.user_metadata.empresa_id || null
        });

      if (perfilError) {
        console.error(`❌ Error creando perfil para ${usuario.email}:`, perfilError.message);
      } else {
        console.log(`✅ Perfil creado para ${usuario.email}\n`);
      }
    }
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('  COMPLETADO');
  console.log('═══════════════════════════════════════════════════════');
}

crearUsuarios().catch(console.error);
