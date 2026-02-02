// supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ───────────────────────────────────────────────────────
// CONFIGURACIÓN SUPABASE
// ───────────────────────────────────────────────────────

export const SUPABASE_URL = 'https://dgwqrbwxoupqbyfeuekb.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnd3FyYnd4b3VwcWJ5ZmV1ZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTM0NTMsImV4cCI6MjA4NDQ4OTQ1M30.UhDDY217uBKXWjOMmHbTySXxPoILhGeYjz-um_e7yG0';

// ───────────────────────────────────────────────────────
// CLIENTE SUPABASE (React Native)
// ───────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,     // Persistencia de sesión
    autoRefreshToken: true,    // Refrescar token
    persistSession: true,      // Mantener sesión
    detectSessionInUrl: false, // Necesario para RN / Expo
  },
});

// ───────────────────────────────────────────────────────
// AUTENTICACIÓN
// ───────────────────────────────────────────────────────

/**
 * Iniciar sesión usando username + password
 * Supabase autentica con email interno
 */
export async function signIn(
  username: string,
  password: string
) {
  try {
    if (!username || !password) {
      console.warn('Username o password vacío');
      return null;
    }

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
      console.error('❌ Error en signIn:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Excepción en signIn:', err);
    return null;
  }
}

/**
 * Cerrar sesión
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ Error en signOut:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('❌ Excepción en signOut:', err);
    return false;
  }
}

/**
 * Obtener sesión actual
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Error obteniendo sesión:', error.message);
      return null;
    }

    return data.session;
  } catch (err) {
    console.error('❌ Excepción obteniendo sesión:', err);
    return null;
  }
}

// ───────────────────────────────────────────────────────
// PERFIL DE USUARIO
// ───────────────────────────────────────────────────────

/**
 * Obtiene el perfil del usuario autenticado
 * Requiere tabla "perfiles" con id = auth.users.id
 */
export async function getPerfilUsuario() {
  try {
    const session = await getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('❌ Error obteniendo perfil:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Excepción obteniendo perfil:', err);
    return null;
  }
}

// ───────────────────────────────────────────────────────
// LISTENER DE CAMBIOS DE SESIÓN
// ───────────────────────────────────────────────────────

/**
 * Escuchar cambios de autenticación
 * SIGNED_IN | SIGNED_OUT | TOKEN_REFRESHED
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}
