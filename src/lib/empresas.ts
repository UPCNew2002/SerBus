// ═══════════════════════════════════════════════════════
// FUNCIONES DE GESTIÓN DE EMPRESAS
// ═══════════════════════════════════════════════════════
//
// Este archivo contiene funciones para:
// - Crear empresas (super admin)
// - Obtener información de empresas
// - Actualizar empresas
// - Verificar RUC duplicado
//
// ═══════════════════════════════════════════════════════
 
import { supabase } from './supabase';
import { verificarUsernameExiste } from './usuarios';
// ───────────────────────────────────────────────────────
// TIPOS
// ───────────────────────────────────────────────────────
 
export interface Empresa {
  id: number;
  ruc: string;
  nombre: string;  // ← Cambié razon_social por nombre
  activo: boolean;
  created_at: string;
  updated_at: string;
}
 
export interface CrearEmpresaParams {
  ruc: string;
  razonSocial: string;  // ← Mantiene razonSocial en el frontend
  adminNombre: string;
  adminUsuario: string;
  adminPassword: string;
}
 
export interface ResultadoCrearEmpresa {
  success: boolean;
  empresa?: Empresa;
  admin?: any;
  error?: string;
}
 
// ───────────────────────────────────────────────────────
// CREAR EMPRESA CON ADMIN
// ───────────────────────────────────────────────────────
 
/**
 * Crea una nueva empresa junto con su usuario administrador
 *
 * Proceso:
* 1. Verifica que el RUC no exista
 * 2. Verifica que el username del admin no exista
 * 3. Crea el usuario admin en Supabase Auth (signUp)
 * 4. Crea la empresa en la tabla empresas
 * 5. Crea el perfil del admin vinculado a la empresa
 *
 * @param params - Datos de la empresa y admin
 * @returns Resultado con empresa y admin creados
 *
 * @example
 * const resultado = await crearEmpresaConAdmin({
 *   ruc: '20123456789',
 *   razonSocial: 'Transportes ABC',
 *   adminNombre: 'Juan Pérez',
 *   adminUsuario: 'jperez',
 *   adminPassword: 'Admin123!'
 * });
 */
export async function crearEmpresaConAdmin(
  params: CrearEmpresaParams
): Promise<ResultadoCrearEmpresa> {
  try {
    console.log('🏢 Creando empresa:', params.razonSocial);
 
    // 1. Verificar que el RUC no exista
    const rucExiste = await verificarRUCExiste(params.ruc);
    if (rucExiste) {
      return {
        success: false,
        error: 'Ya existe una empresa con ese RUC'
      };
    }
 
    // 2. Verificar que el username del admin no exista
    const usernameExiste = await verificarUsernameExiste(params.adminUsuario);
    if (usernameExiste) {
      return {
        success: false,
        error: 'Ya existe un usuario con ese nombre de usuario'
      };
    }
 
    // 3. Crear usuario admin en Supabase Auth (usando signUp)
    const emailAdmin = `${params.adminUsuario}@gmail.com`;
 
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailAdmin,
      password: params.adminPassword,
      options: {
        data: {
          username: params.adminUsuario,
          nombre: params.adminNombre
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
 
    console.log('✅ Usuario admin creado:', authData.user.id);
 
    // 4. Crear empresa en la tabla (usando "nombre" en lugar de "razon_social")
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .insert({
        ruc: params.ruc,
        nombre: params.razonSocial,  // ← Mapeo razonSocial → nombre
        activo: true
      })
      .select()
      .single();
 
    if (empresaError) {
      console.error('❌ Error creando empresa:', empresaError.message);
      console.warn('⚠️ No se puede hacer rollback de auth con ANON_KEY');
 
      return {
        success: false,
        error: `Error al crear empresa: ${empresaError.message}`
      };
    }
 
    console.log('✅ Empresa creada:', empresa.id);
 
    // 5. Crear perfil del admin vinculado a la empresa
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .insert({
        id: authData.user.id, // Mismo ID que auth.users
        nombre: params.adminNombre,
        username: params.adminUsuario,
        rol: 'admin',
        empresa_id: empresa.id,
        activo: true,
        debe_cambiar_password: true 
      })
      .select()
      .single();
 
    if (perfilError) {
      console.error('❌ Error creando perfil:', perfilError.message);
 
      // Rollback: eliminar empresa
      await supabase.from('empresas').delete().eq('id', empresa.id);
      console.warn('⚠️ No se puede hacer rollback de auth con ANON_KEY');
 
      return {
        success: false,
        error: `Error al crear perfil: ${perfilError.message}`
      };
    }
 
    console.log('✅ Perfil admin creado:', perfil.id);
 
    return {
      success: true,
      empresa: empresa,
      admin: perfil
    };
 
  } catch (error: any) {
    console.error('❌ Error en crearEmpresaConAdmin:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido'
    };
  }
}
 
// ───────────────────────────────────────────────────────
// OBTENER EMPRESA POR ID
// ───────────────────────────────────────────────────────
 
/**
 * Obtiene una empresa por su ID
 *
 * @param empresaId - ID de la empresa
 * @returns Datos de la empresa o null
 *
 * @example
 * const empresa = await obtenerEmpresaPorId(1);
 * if (empresa) {
 *   console.log(empresa.nombre);
 * }
 */
export async function obtenerEmpresaPorId(
  empresaId: number
): Promise<Empresa | null> {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', empresaId)
      .single();
 
    if (error) {
      console.error('❌ Error obteniendo empresa:', error.message);
      return null;
    }
 
    return data;
  } catch (error) {
    console.error('❌ Error en obtenerEmpresaPorId:', error);
    return null;
  }
}
 
// ───────────────────────────────────────────────────────
// LISTAR TODAS LAS EMPRESAS
// ───────────────────────────────────────────────────────
 
/**
 * Obtiene todas las empresas activas
 *
 * @returns Array de empresas
 *
 * @example
 * const empresas = await listarEmpresas();
 * console.log(`Total: ${empresas.length} empresas`);
 */
export async function listarEmpresas(): Promise<Empresa[]> {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true });  // ← Cambié razon_social por nombre
 
    if (error) {
      console.error('❌ Error listando empresas:', error.message);
      return [];
    }
 
    return data || [];
  } catch (error) {
    console.error('❌ Error en listarEmpresas:', error);
    return [];
  }
}
 
// ───────────────────────────────────────────────────────
// ACTUALIZAR EMPRESA
// ───────────────────────────────────────────────────────
 
/**
 * Actualiza los datos de una empresa
 *
 * @param empresaId - ID de la empresa
 * @param datos - Datos a actualizar
 * @returns true si se actualizó correctamente
 *
 * @example
 * const actualizado = await actualizarEmpresa(1, {
 *   nombre: 'Nuevo nombre'
 * });
 */
export async function actualizarEmpresa(
  empresaId: number,
  datos: { nombre?: string; activo?: boolean }  // ← Cambié razon_social por nombre
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('empresas')
      .update(datos)
      .eq('id', empresaId);
 
    if (error) {
      console.error('❌ Error actualizando empresa:', error.message);
      return false;
    }
 
    console.log('✅ Empresa actualizada');
    return true;
  } catch (error) {
    console.error('❌ Error en actualizarEmpresa:', error);
    return false;
  }
}
 
// ───────────────────────────────────────────────────────
// OBTENER TODAS LAS EMPRESAS (SUPER ADMIN)
// ───────────────────────────────────────────────────────
 
export interface EmpresaConAdmin {
  id: number;
  nombre: string;
  ruc: string;
  activo: boolean;
  created_at: string;
  adminUsuario: string;
  adminNombre: string;
}
 
/**
 * Obtiene todas las empresas (activas e inactivas) con información del admin
 * Solo para uso de super_admin
 */
export async function obtenerTodasLasEmpresas(): Promise<EmpresaConAdmin[]> {
  try {
    // Obtener todas las empresas
    const { data: empresas, error: errorEmpresas } = await supabase
      .from('empresas')
      .select('*')
      .order('created_at', { ascending: false });
 
    if (errorEmpresas) {
      console.error('❌ Error obteniendo empresas:', errorEmpresas.message);
      return [];
    }
 
    if (!empresas || empresas.length === 0) {
      return [];
    }
 
    // Para cada empresa, obtener el perfil del admin
    const empresasConAdmin: EmpresaConAdmin[] = [];
 
    for (const empresa of empresas) {
      // Buscar el perfil del admin de esta empresa
      const { data: admin } = await supabase
        .from('perfiles')
        .select('username, nombre')
        .eq('empresa_id', empresa.id)
        .eq('rol', 'admin')
        .single();
 
      empresasConAdmin.push({
        id: empresa.id,
        nombre: empresa.nombre,
        ruc: empresa.ruc,
        activo: empresa.activo,
        created_at: empresa.created_at,
        adminUsuario: admin?.username || 'Sin admin',
        adminNombre: admin?.nombre || 'Sin nombre',
      });
    }
 
    return empresasConAdmin;
  } catch (error) {
    console.error('❌ Error en obtenerTodasLasEmpresas:', error);
    return [];
  }
}
 
/**
 * Cambia el estado activo/inactivo de una empresa
 */
export async function cambiarEstadoEmpresa(empresaId: number): Promise<boolean> {
  try {
    // Primero obtener el estado actual
    const { data: empresa } = await supabase
      .from('empresas')
      .select('activo')
      .eq('id', empresaId)
      .single();
 
    if (!empresa) {
      return false;
    }
 
    // Cambiar al estado opuesto
    const nuevoEstado = !empresa.activo;
 
    const { error } = await supabase
      .from('empresas')
      .update({ activo: nuevoEstado })
      .eq('id', empresaId);
 
    if (error) {
      console.error('❌ Error cambiando estado:', error.message);
      return false;
    }
 
    console.log(`✅ Empresa ${nuevoEstado ? 'activada' : 'desactivada'}`);
    return true;
  } catch (error) {
    console.error('❌ Error en cambiarEstadoEmpresa:', error);
    return false;
  }
}
 
// ───────────────────────────────────────────────────────
// VERIFICAR SI EXISTE RUC
// ───────────────────────────────────────────────────────
 
/**
 * Verifica si ya existe una empresa con el RUC dado
 *
 * @param ruc - RUC a verificar
 * @returns true si existe
 *
 * @example
 * const existe = await verificarRUCExiste('20123456789');
 * if (existe) {
 *   alert('RUC duplicado');
 * }
 */
export async function verificarRUCExiste(ruc: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('id')
      .eq('ruc', ruc)
      .maybeSingle();
 
    if (error) {
      console.error('❌ Error verificando RUC:', error.message);
      return false;
    }
 
    return data !== null;
  } catch (error) {
    console.error('❌ Error en verificarRUCExiste:', error);
    return false;
  }
}
 
// ───────────────────────────────────────────────────────
// ACTUALIZAR DATOS DE EMPRESA
// ───────────────────────────────────────────────────────
 
export interface ActualizarEmpresaParams {
  nombre?: string;
  ruc?: string;
}
 
/**
 * Actualiza los datos de una empresa (RUC y/o nombre)
 */
export async function actualizarDatosEmpresa(
  empresaId: number,
  datos: ActualizarEmpresaParams
): Promise<{ success: boolean; error?: string }> {
  try {
    // Si se está actualizando el RUC, verificar que no esté duplicado
    if (datos.ruc) {
      const { data: empresaExistente } = await supabase
        .from('empresas')
        .select('id')
        .eq('ruc', datos.ruc)
        .neq('id', empresaId)
        .maybeSingle();
 
      if (empresaExistente) {
        return { success: false, error: 'Ya existe otra empresa con ese RUC' };
      }
    }
 
    const { error } = await supabase
      .from('empresas')
      .update(datos)
      .eq('id', empresaId);
 
    if (error) {
      console.error('❌ Error actualizando empresa:', error.message);
      return { success: false, error: error.message };
    }
 
    console.log('✅ Empresa actualizada correctamente');
    return { success: true };
  } catch (error) {
    console.error('❌ Error en actualizarDatosEmpresa:', error);
    return { success: false, error: 'Error al actualizar empresa' };
  }
}
 
// ───────────────────────────────────────────────────────
// DESACTIVAR EMPRESA
// ───────────────────────────────────────────────────────
 
/**
 * Desactiva una empresa (soft delete)
 *
 * @param empresaId - ID de la empresa
 * @returns true si se desactivó correctamente
 *
 * @example
 * const desactivada = await desactivarEmpresa(1);
 */
export async function desactivarEmpresa(empresaId: number): Promise<boolean> {
  return actualizarEmpresa(empresaId, { activo: false });
}


// ───────────────────────────────────────────────────────
// ACTUALIZAR TEMA DE EMPRESA
// ───────────────────────────────────────────────────────
 
export interface TemaEmpresa {
  primary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
}
 
/**
 * Actualiza el tema visual de una empresa
 *
 * @param empresaId - ID de la empresa
 * @param tema - Objeto con los colores del tema
 * @returns true si se actualizó correctamente
 *
 * @example
 * const exito = await actualizarTemaEmpresa(1, {
 *   primary: '#dc2626',
 *   accent: '#fbbf24',
 *   background: '#0f0f0f',
 *   card: '#1a1a1a',
 *   text: '#ffffff'
 * });
 */
export async function actualizarTemaEmpresa(
  empresaId: number,
  tema: TemaEmpresa
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('empresas')
      .update({ tema })
      .eq('id', empresaId);
 
    if (error) {
      console.error('❌ Error actualizando tema:', error.message);
      return false;
    }
 
    console.log('✅ Tema de empresa actualizado');
    return true;
  } catch (error) {
    console.error('❌ Error en actualizarTemaEmpresa:', error);
    return false;
  }
}