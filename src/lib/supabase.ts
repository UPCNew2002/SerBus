// ═══════════════════════════════════════════════════════
// CLIENTE DE SUPABASE
// ═══════════════════════════════════════════════════════
//
// Este archivo inicializa la conexión con Supabase
// Se importa en cualquier parte de la app que necesite
// interactuar con el backend
//
// ═══════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ───────────────────────────────────────────────────────
// CONFIGURACIÓN
// ───────────────────────────────────────────────────────

const SUPABASE_URL = 'https://dgwqrbwxoupqbyfeuekb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnd3FyYnd4b3VwcWJ5ZmV1ZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTM0NTMsImV4cCI6MjA4NDQ4OTQ1M30.UhDDY217uBKXWjOMmHbTySXxPoILhGeYjz-um_e7yG0';

// ───────────────────────────────────────────────────────
// CREAR CLIENTE
// ───────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Guardar sesión en AsyncStorage (persiste entre cierres de app)
    storage: AsyncStorage,
    // Auto-refrescar token cuando expire
    autoRefreshToken: true,
    // Persistir sesión
    persistSession: true,
    // Detectar cambios de sesión
    detectSessionInUrl: false,
  },
});

// ───────────────────────────────────────────────────────
// FUNCIONES DE AUTENTICACIÓN
// ───────────────────────────────────────────────────────

/**
 * Iniciar sesión con username y contraseña
 *
 * @param username - Usuario (ej: "jperez")
 * @param password - Contraseña
 * @returns Datos de sesión o null si falla
 *
 * @example
 * const session = await signIn('jperez', 'Admin123!');
 * if (session) {
 *   console.log('Usuario autenticado:', session.user.email);
 * }
 */
export async function signIn(username: string, password: string) {
  try {
    // Mapear username a email de Gmail
    const emailMap: { [key: string]: string } = {
      'jperez': 'jperez@gmail.com',
      'mgarcia': 'mgarcia@gmail.com',
      'superadmin': 'superadmin@gmail.com',
    };
 
    // Si es un email completo, usarlo directamente, sino usar el mapeo
    const email = username.includes('@') ? username : (emailMap[username] || `${username}@gmail.com`);
 
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error en signIn:', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error en signIn:', error);
    return null;
  }
}

/**
 * Cerrar sesión
 *
 * @example
 * await signOut();
 * // Usuario deslogueado
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error en signOut:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en signOut:', error);
    return false;
  }
}

/**
 * Obtener sesión actual
 *
 * @returns Sesión actual o null si no hay usuario logueado
 *
 * @example
 * const session = await getSession();
 * if (session) {
 *   console.log('Usuario logueado:', session.user.email);
 * } else {
 *   console.log('No hay sesión activa');
 * }
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error obteniendo sesión:', error.message);
      return null;
    }

    return data.session;
  } catch (error) {
    console.error('Error obteniendo sesión:', error);
    return null;
  }
}

/**
 * Obtener perfil del usuario actual
 *
 * @returns Perfil con username, nombre, rol, empresa_id
 *
 * @example
 * const perfil = await getPerfilUsuario();
 * if (perfil) {
 *   console.log('Rol:', perfil.rol);
 *   console.log('Empresa ID:', perfil.empresa_id);
 * }
 */
export async function getPerfilUsuario() {
  try {
    console.log('📋 Iniciando getPerfilUsuario...');

    const session = await getSession();
    console.log('📋 Sesión obtenida:', session ? 'OK' : 'NULL');

    if (!session) {
      console.log('❌ No hay sesión activa');
      return null;
    }

    console.log('📋 Consultando tabla perfiles para user.id:', session.user.id);
    console.log('📋 Email del usuario:', session.user.email);

    // Crear promesa con timeout de 10 segundos
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: la consulta tardó más de 10 segundos')), 10000)
    );

    const queryPromise = supabase
      .from('perfiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    console.log('📋 Ejecutando query con timeout...');
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

    console.log('📋 Query completada. Data:', data);
    console.log('📋 Error:', error);

    if (error) {
      console.error('❌ Error obteniendo perfil:', error.message);
      console.error('❌ Error completo:', JSON.stringify(error, null, 2));

      // Si el error es "no rows", significa que no existe el perfil
      if (error.code === 'PGRST116') {
        console.error('❌ No existe perfil para este usuario. Crear perfil en Supabase.');
      }

      return null;
    }

    console.log('✅ Perfil obtenido exitosamente:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error en getPerfilUsuario:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    return null;
  }
}

// ───────────────────────────────────────────────────────
// LISTENER DE CAMBIOS DE SESIÓN
// ───────────────────────────────────────────────────────

/**
 * Escuchar cambios en la sesión (login, logout, token refresh)
 *
 * @param callback - Función que se ejecuta cuando hay cambios
 *
 * @example
 * onAuthStateChange((event, session) => {
 *   if (event === 'SIGNED_IN') {
 *     console.log('Usuario inició sesión');
 *   } else if (event === 'SIGNED_OUT') {
 *     console.log('Usuario cerró sesión');
 *   }
 * });
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}
