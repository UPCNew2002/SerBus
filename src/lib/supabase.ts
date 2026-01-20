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

const SUPABASE_URL = 'https://uzkznawepjnmmbenhvbb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a3puYXdlcGpubW1iZW5odmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjUwNzMsImV4cCI6MjA4NDI0MTA3M30.vz20XqapuW6xQrdRryqEjw2qx5u0Wygqm4HRM_P2h0M';

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
    // Convertir username a email interno
    const email = `${username}@serbus.internal`;

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
    const session = await getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error obteniendo perfil:', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
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
