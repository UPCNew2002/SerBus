// ═══════════════════════════════════════════════════════
// FUNCIONES DE GESTIÓN DE USUARIOS
// ═══════════════════════════════════════════════════════
//
// Este archivo contiene funciones para:
// - Crear trabajadores (admin)
// - Obtener usuarios por empresa
// - Actualizar usuarios
// - Cambiar estado (activo/inactivo)
// - Verificar username duplicado
//
// ═══════════════════════════════════════════════════════
 
import { supabase } from './supabase';
 
// ───────────────────────────────────────────────────────
// TIPOS
// ───────────────────────────────────────────────────────
 
export interface Usuario {
  id: string;
  nombre: string;
  username: string;
  rol: 'super_admin' | 'admin' | 'trabajador';
  empresa_id: number | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}
 
export interface CrearTrabajadorParams {
  nombre: string;
  username: string;
  password: string;
  empresaId: number;
}

export interface CrearAdminParams {
  nombre: string;
  username: string;
  password: string;
  empresaId: number;
}

export interface ResultadoCrearUsuario {
  success: boolean;
  usuario?: Usuario;
  error?: string;
}
 
// ───────────────────────────────────────────────────────
// CREAR TRABAJADOR (Admin)
// ───────────────────────────────────────────────────────
 
/**
 * Crea un nuevo trabajador vinculado a una empresa
 *
 * Proceso:
 * 1. Verifica que el username no exista
 * 2. Crea el usuario en Supabase Auth (signUp)
 * 3. Crea el perfil del trabajador vinculado a la empresa
 *
 * @param params - Datos del trabajador
 * @returns Resultado con usuario creado
 *
 * @example
 * const resultado = await crearTrabajador({
 *   nombre: 'María García',
 *   username: 'mgarcia',
 *   password: 'Trabajo123!',
 *   empresaId: 1
 * });
 */
export async function crearTrabajador(
  params: CrearTrabajadorParams
): Promise<ResultadoCrearUsuario> {
  try {
    console.log('👤 Creando trabajador:', params.nombre);
 
    // 1. Verificar que el username no exista
    const usernameExiste = await verificarUsernameExiste(params.username);
    if (usernameExiste) {
      return {
        success: false,
        error: 'Ya existe un usuario con ese nombre de usuario'
      };
    }
 
    // 2. Crear usuario en Supabase Auth (usando signUp)
    const emailTrabajador = `${params.username}@gmail.com`;
 
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailTrabajador,
      password: params.password,
      options: {
        data: {
          username: params.username,
          nombre: params.nombre
        }
      }
    });
 
    if (authError || !authData.user) {
      console.error('❌ Error creando usuario trabajador:', authError?.message);
      return {
        success: false,
        error: `Error al crear usuario: ${authError?.message || 'Usuario no creado'}`
      };
    }
 
    console.log('✅ Usuario trabajador creado en auth:', authData.user.id);
 
    // 3. Crear perfil del trabajador
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .insert({
        id: authData.user.id, // Mismo ID que auth.users
        nombre: params.nombre,
        username: params.username,
        rol: 'trabajador',
        empresa_id: params.empresaId,
        activo: true,
        debe_cambiar_password: true  // ← Obligar cambio de contraseña en primer login
      })
      .select()
      .single();
 
    if (perfilError) {
      console.error('❌ Error creando perfil:', perfilError.message);
      console.warn('⚠️ No se puede hacer rollback de auth con ANON_KEY');
 
      return {
        success: false,
        error: `Error al crear perfil: ${perfilError.message}`
      };
    }
 
    console.log('✅ Perfil trabajador creado:', perfil.id);
 
    return {
      success: true,
      usuario: perfil
    };
 
  } catch (error: any) {
    console.error('❌ Error en crearTrabajador:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido'
    };
  }
}

// ───────────────────────────────────────────────────────
// CREAR ADMIN ADICIONAL (Super Admin)
// ───────────────────────────────────────────────────────

/**
 * Crea un nuevo administrador para una empresa existente
 * Solo puede ser ejecutado por super_admin
 *
 * Proceso:
 * 1. Verifica que el username no exista
 * 2. Crea el usuario en Supabase Auth (signUp)
 * 3. Crea el perfil del admin vinculado a la empresa
 * 4. Marca debe_cambiar_password = true para forzar cambio en primer login
 *
 * @param params - Datos del admin
 * @returns Resultado con usuario creado
 *
 * @example
 * const resultado = await crearAdmin({
 *   nombre: 'Carlos Ruiz',
 *   username: 'cruiz',
 *   password: 'Admin123!',
 *   empresaId: 4
 * });
 */
export async function crearAdmin(
  params: CrearAdminParams
): Promise<ResultadoCrearUsuario> {
  try {
    console.log('👤 Creando admin:', params.nombre);

    // 1. Verificar que el username no exista
    const usernameExiste = await verificarUsernameExiste(params.username);
    if (usernameExiste) {
      return {
        success: false,
        error: 'Ya existe un usuario con ese nombre de usuario'
      };
    }

    // 2. Crear usuario en Supabase Auth (usando signUp)
    const emailAdmin = `${params.username}@gmail.com`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailAdmin,
      password: params.password,
      options: {
        data: {
          username: params.username,
          nombre: params.nombre
        }
      }
    });

    if (authError || !authData.user) {
      console.error('❌ Error creando usuario admin:', authError?.message);
      return {
        success: false,
        error: `Error al crear usuario: ${authError?.message || 'Usuario no creado'}`
      };
    }

    console.log('✅ Usuario admin creado en auth:', authData.user.id);

    // 3. Crear perfil del admin
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .insert({
        id: authData.user.id, // Mismo ID que auth.users
        nombre: params.nombre,
        username: params.username,
        rol: 'admin',
        empresa_id: params.empresaId,
        activo: true,
        debe_cambiar_password: true  // ← Obligar cambio de contraseña en primer login
      })
      .select()
      .single();

    if (perfilError) {
      console.error('❌ Error creando perfil:', perfilError.message);
      console.warn('⚠️ No se puede hacer rollback de auth con ANON_KEY');

      return {
        success: false,
        error: `Error al crear perfil: ${perfilError.message}`
      };
    }

    console.log('✅ Perfil admin creado:', perfil.id);

    return {
      success: true,
      usuario: perfil
    };

  } catch (error: any) {
    console.error('❌ Error en crearAdmin:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido'
    };
  }
}

// ───────────────────────────────────────────────────────
// OBTENER USUARIOS POR EMPRESA
// ───────────────────────────────────────────────────────
 
/**
 * Obtiene todos los usuarios de una empresa
 *
 * @param empresaId - ID de la empresa
 * @param soloTrabajadores - Si true, solo retorna trabajadores (default: true)
 * @returns Array de usuarios
 *
 * @example
 * const trabajadores = await obtenerUsuariosPorEmpresa(1);
 * console.log(`${trabajadores.length} trabajadores`);
 */
export async function obtenerUsuariosPorEmpresa(
  empresaId: number,
  soloTrabajadores: boolean = true
): Promise<Usuario[]> {
  try {
    let query = supabase
      .from('perfiles')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('nombre', { ascending: true });
 
    if (soloTrabajadores) {
      query = query.eq('rol', 'trabajador');
    }
 
    const { data, error } = await query;
 
    if (error) {
      console.error('❌ Error obteniendo usuarios:', error.message);
      return [];
    }
 
    return data || [];
  } catch (error) {
    console.error('❌ Error en obtenerUsuariosPorEmpresa:', error);
    return [];
  }
}
 
// ───────────────────────────────────────────────────────
// OBTENER USUARIO POR ID
// ───────────────────────────────────────────────────────
 
/**
 * Obtiene un usuario por su ID
 *
 * @param userId - ID del usuario
 * @returns Usuario o null
 *
 * @example
 * const usuario = await obtenerUsuarioPorId('uuid-del-usuario');
 */
export async function obtenerUsuarioPorId(
  userId: string
): Promise<Usuario | null> {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();
 
    if (error) {
      console.error('❌ Error obteniendo usuario:', error.message);
      return null;
    }
 
    return data;
  } catch (error) {
    console.error('❌ Error en obtenerUsuarioPorId:', error);
    return null;
  }
}
 
// ───────────────────────────────────────────────────────
// ACTUALIZAR USUARIO
// ───────────────────────────────────────────────────────
 
/**
 * Actualiza los datos de un usuario
 *
 * @param userId - ID del usuario
 * @param datos - Datos a actualizar
 * @returns true si se actualizó correctamente
 *
 * @example
 * const actualizado = await actualizarUsuario('uuid', {
 *   nombre: 'Nuevo Nombre'
 * });
 */
export async function actualizarUsuario(
  userId: string,
  datos: { nombre?: string; activo?: boolean }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('perfiles')
      .update(datos)
      .eq('id', userId);
 
    if (error) {
      console.error('❌ Error actualizando usuario:', error.message);
      return false;
    }
 
    console.log('✅ Usuario actualizado');
    return true;
  } catch (error) {
    console.error('❌ Error en actualizarUsuario:', error);
    return false;
  }
}
 
// ───────────────────────────────────────────────────────
// CAMBIAR ESTADO (ACTIVAR/DESACTIVAR)
// ───────────────────────────────────────────────────────
 
/**
 * Activa o desactiva un usuario
 *
 * @param userId - ID del usuario
 * @param activo - true para activar, false para desactivar
 * @returns true si se cambió correctamente
 *
 * @example
 * const desactivado = await cambiarEstadoUsuario('uuid', false);
 */
export async function cambiarEstadoUsuario(
  userId: string,
  activo: boolean
): Promise<boolean> {
  return actualizarUsuario(userId, { activo });
}
 
// ───────────────────────────────────────────────────────
// VERIFICAR SI EXISTE USERNAME
// ───────────────────────────────────────────────────────
 
/**
 * Verifica si ya existe un usuario con el username dado
 *
 * @param username - Username a verificar
 * @returns true si existe
 *
 * @example
 * const existe = await verificarUsernameExiste('jperez');
 * if (existe) {
 *   alert('Username duplicado');
 * }
 */
export async function verificarUsernameExiste(username: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();
 
    if (error) {
      console.error('❌ Error verificando username:', error.message);
      return false;
    }
 
    return data !== null;
  } catch (error) {
    console.error('❌ Error en verificarUsernameExiste:', error);
    return false;
  }
}
 
// ───────────────────────────────────────────────────────
// ELIMINAR USUARIO (SOFT DELETE)
// ───────────────────────────────────────────────────────
 
/**
 * Desactiva un usuario (no lo elimina físicamente)
 *
 * @param userId - ID del usuario
 * @returns true si se desactivó correctamente
 *
 * @example
 * const eliminado = await eliminarUsuario('uuid');
 */
export async function eliminarUsuario(userId: string): Promise<boolean> {
  return cambiarEstadoUsuario(userId, false);
}
 
// ───────────────────────────────────────────────────────
// CAMBIAR CONTRASEÑA
// ───────────────────────────────────────────────────────
 
/**
 * Cambia la contraseña de un usuario (solo desde el cliente logueado)
 *
 * @param nuevaPassword - Nueva contraseña
 * @returns true si se cambió correctamente
 *
 * @example
 * const cambiado = await cambiarPassword('NuevaPass123!');
 */
export async function cambiarPassword(
  nuevaPassword: string
): Promise<boolean> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: nuevaPassword
    });
 
    if (error) {
      console.error('❌ Error cambiando contraseña:', error.message);
      return false;
    }
 
    console.log('✅ Contraseña actualizada');
    return true;
  } catch (error) {
    console.error('❌ Error en cambiarPassword:', error);
    return false;
  }
}