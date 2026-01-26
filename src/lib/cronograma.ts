// ═══════════════════════════════════════════════════════
// FUNCIONES DE CRONOGRAMA DE MANTENIMIENTO
// ═══════════════════════════════════════════════════════
//
// Este archivo contiene funciones para gestionar el
// cronograma de mantenimiento de buses
//
// ═══════════════════════════════════════════════════════
 
import { supabase } from './supabase';
 
// ───────────────────────────────────────────────────────
// TIPOS
// ───────────────────────────────────────────────────────
 
export interface Bus {
  id: number;
  empresa_id: number;
  placa: string;
  vin: string;
  marca: string;
  modelo: string;
  anio: number;
  kilometraje_actual: number;
  activo: boolean;
}
 
export interface ProximoMantenimiento {
  bus_id: number;
  placa: string;
  kilometraje_actual: number;
  kilometraje_proximo_mantenimiento: number;
  km_restantes: number;
  necesita_mantenimiento: boolean;
}
 
export interface BusNecesitaMantenimiento {
  bus_id: number;
  placa: string;
  vin: string; 
  marca: string;
  modelo: string;
  anio: number;
  dias_sin_mantenimiento: number;
  fecha_ultimo_mantenimiento: string | null;
  urgencia: 'URGENTE' | 'PRONTO' | 'NORMAL';
  proximo_trabajo: string;
}
 
export interface EstadisticasOTs {
  total_ots: number;
  ots_pendientes: number;
  ots_en_proceso: number;
  ots_completadas: number;
  ots_canceladas: number;
  tiempo_promedio_dias: number;
}
 
export interface HistorialMantenimiento {
  ot_id: number;
  numero_ot: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: string;
  trabajador_nombre: string;
  cantidad_trabajos: number;
  dias_duracion: number;
}
 
// ───────────────────────────────────────────────────────
// FUNCIONES
// ───────────────────────────────────────────────────────
 
/**
 * Generar número de OT automático
 *
 * @param empresaId - ID de la empresa
 * @returns Número de OT generado (ej: "OT-2026-0001")
 *
 * @example
 * const numeroOT = await generarNumeroOT(1);
 * // "OT-2026-0001"
 */
export async function generarNumeroOT(empresaId: number): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('generar_numero_ot', {
      p_empresa_id: empresaId,
    });
 
    if (error) {
      console.error('Error generando número de OT:', error.message);
      return null;
    }
 
    return data;
  } catch (error) {
    console.error('Error generando número de OT:', error);
    return null;
  }
}
 
/**
 * Calcular próximo mantenimiento de un bus
 *
 * @param busId - ID del bus
 * @returns Información sobre el próximo mantenimiento
 *
 * @example
 * const proximo = await calcularProximoMantenimiento(1);
 * if (proximo) {
 *   console.log(`Faltan ${proximo.km_restantes} km`);
 * }
 */
export async function calcularProximoMantenimiento(
  busId: number
): Promise<ProximoMantenimiento | null> {
  try {
    const { data, error } = await supabase.rpc('calcular_proximo_mantenimiento', {
      p_bus_id: busId,
    });
 
    if (error) {
      console.error('Error calculando próximo mantenimiento:', error.message);
      return null;
    }
 
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error calculando próximo mantenimiento:', error);
    return null;
  }
}
 
/**
 * Obtener buses que necesitan mantenimiento
 *
 * @param empresaId - ID de la empresa
 * @returns Lista de buses que necesitan mantenimiento pronto
 *
 * @example
 * const buses = await busesNecesitanMantenimiento(1);
 * const urgentes = buses.filter(b => b.urgencia === 'URGENTE');
 */
export async function busesNecesitanMantenimiento(
  empresaId: number
): Promise<BusNecesitaMantenimiento[]> {
  try {
    console.log('🔧 Consultando buses que necesitan mantenimiento para empresa_id:', empresaId);
 
    // Obtener todos los buses de la empresa
    const { data: buses, error: busesError } = await supabase
      .from('buses')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('activo', true);
 
    if (busesError) {
      console.error('❌ Error obteniendo buses:', busesError.message);
      return [];
    }
 
    if (!buses || buses.length === 0) {
      console.log('⚠️ No hay buses para esta empresa');
      return [];
    }
 
    console.log(`📋 ${buses.length} buses encontrados, analizando mantenimientos...`);
 
    // Para cada bus, calcular si necesita mantenimiento
    const busesConMantenimiento: BusNecesitaMantenimiento[] = [];
 
    // Fecha actual
    const hoy = new Date();
 
    for (const bus of buses) {
      // Obtener el último mantenimiento del bus
      const { data: ultimoMant, error: mantError } = await supabase
        .from('ots')
        .select('fecha_fin')
        .eq('bus_id', bus.id)
        .eq('estado', 'completado')
        .not('fecha_fin', 'is', null)
        .order('fecha_fin', { ascending: false })
        .limit(1)
        .maybeSingle();
 
      // Si hay error, continuar con el siguiente bus
      if (mantError) {
        console.warn(`⚠️ Error obteniendo mantenimiento del bus ${bus.placa}:`, mantError.message);
        continue;
      }
 
      // Calcular días desde último mantenimiento
      let diasSinMantenimiento: number;
      let fechaUltimoMantenimiento: string | null = null;
 
      if (ultimoMant?.fecha_fin) {
        // Tiene mantenimiento previo
        fechaUltimoMantenimiento = ultimoMant.fecha_fin;
        const fechaUltMant = new Date(ultimoMant.fecha_fin);
        const diffTime = Math.abs(hoy.getTime() - fechaUltMant.getTime());
        diasSinMantenimiento = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        // Nunca tuvo mantenimiento - considerarlo urgente (999 días)
        diasSinMantenimiento = 999;
      }
 
      // Determinar urgencia basada en días
      // Mantenimiento preventivo cada 90 días
      let urgencia: 'URGENTE' | 'PRONTO' | 'NORMAL' = 'NORMAL';
      if (diasSinMantenimiento >= 90) {
        urgencia = 'URGENTE';
      } else if (diasSinMantenimiento >= 75) {
        urgencia = 'PRONTO';
      }
 
      // Agregar solo buses que necesitan mantenimiento pronto (>= 75 días)
      if (diasSinMantenimiento >= 75) {
        busesConMantenimiento.push({
          bus_id: bus.id,
          placa: bus.placa,
          vin: bus.vin,
          marca: bus.marca,
          modelo: bus.modelo,
          anio: bus.anio,
          dias_sin_mantenimiento: diasSinMantenimiento,
          fecha_ultimo_mantenimiento: fechaUltimoMantenimiento,
          urgencia: urgencia,
          proximo_trabajo: 'Mantenimiento preventivo',
        });
      }
    }
 
    console.log(`✅ ${busesConMantenimiento.length} buses necesitan mantenimiento pronto`);
    return busesConMantenimiento;
  } catch (error: any) {
    console.error('❌ Error en busesNecesitanMantenimiento:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    return [];
  }
}
 
/**
 * Obtener estadísticas de OTs de una empresa
 *
 * @param empresaId - ID de la empresa
 * @returns Estadísticas generales de OTs
 *
 * @example
 * const stats = await obtenerEstadisticasOTs(1);
 * console.log(`${stats.ots_pendientes} OTs pendientes`);
 */
export async function obtenerEstadisticasOTs(
  empresaId: number
): Promise<EstadisticasOTs | null> {
  try {
    console.log('📊 Consultando estadisticas_ots para empresa_id:', empresaId);
 
    const { data, error } = await supabase.rpc('estadisticas_ots', {
      p_empresa_id: empresaId,
    });
 
    console.log('📊 Respuesta de RPC estadisticas_ots:');
    console.log('📊 Data:', data);
    console.log('📊 Error:', error);
 
    if (error) {
      console.error('❌ Error obteniendo estadísticas:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error hint:', error.hint);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      console.warn('⚠️ Función RPC tiene problemas. Retornando null para no bloquear la app.');
      return null;
    }
 
    console.log('✅ Estadísticas obtenidas');
    return data && data.length > 0 ? data[0] : null;
  } catch (error: any) {
    console.error('❌ Error en obtenerEstadisticasOTs:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    return null;
  }
}
 
/**
 * Obtener detalle completo de una OT
 *
 * @param otId - ID de la OT
 * @returns Detalle completo con bus, trabajador y trabajos
 *
 * @example
 * const detalle = await obtenerDetalleOT(1);
 * console.log(detalle.bus.placa);
 * console.log(detalle.trabajos);
 */
export async function obtenerDetalleOT(otId: number): Promise<any | null> {
  try {
    const { data, error } = await supabase.rpc('detalle_ot', {
      p_ot_id: otId,
    });
 
    if (error) {
      console.error('Error obteniendo detalle de OT:', error.message);
      return null;
    }
 
    return data;
  } catch (error) {
    console.error('Error obteniendo detalle de OT:', error);
    return null;
  }
}
 
/**
 * Obtener historial de mantenimiento de un bus
 *
 * @param busId - ID del bus
 * @returns Historial de OTs del bus
 *
 * @example
 * const historial = await obtenerHistorialMantenimiento(1);
 * console.log(`${historial.length} mantenimientos realizados`);
 */
export async function obtenerHistorialMantenimiento(
  busId: number
): Promise<HistorialMantenimiento[]> {
  try {
    const { data, error } = await supabase.rpc('historial_mantenimiento_bus', {
      p_bus_id: busId,
    });
 
    if (error) {
      console.error('Error obteniendo historial:', error.message);
      return [];
    }
 
    return data || [];
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return [];
  }
}
 
// ───────────────────────────────────────────────────────
// FUNCIONES AUXILIARES
// ───────────────────────────────────────────────────────
 
/**
 * Obtener lista de buses de una empresa
 *
 * @param empresaId - ID de la empresa
 * @returns Lista de buses activos
 *
 * @example
 * const buses = await obtenerBusesEmpresa(1);
 * console.log(`${buses.length} buses encontrados`);
 */
export async function obtenerBusesEmpresa(
  empresaId: number
): Promise<Bus[]> {
  try {
    const { data, error } = await supabase
      .from('buses')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .order('placa', { ascending: true });
 
    if (error) {
      console.error('Error obteniendo buses:', error.message);
      return [];
    }
 
    return data || [];
  } catch (error) {
    console.error('Error obteniendo buses:', error);
    return [];
  }
}
/**
 * Crear un nuevo bus en la flota
 *
 * @param bus - Datos del bus
 * @returns Bus creado
 *
 * @example
 * const bus = await crearBus({
 *   empresa_id: 1,
 *   placa: 'ABC-123',
 *   vin: '1HGBH41JXMN109186',
 *   marca: 'Mercedes-Benz',
 *   modelo: 'OF-1721',
 *   anio: 2020,
 *   color: 'Blanco',
 *   kilometraje_actual: 0
 * });
 */
export async function crearBus(datos: {
  empresa_id: number;
  placa: string;
  vin?: string | null;
  marca?: string | null;
  modelo?: string | null;
  anio?: number | null;
  color?: string | null;
  kilometraje_actual?: number;
}): Promise<Bus | null> {
  try {
    console.log('🚌 Creando nuevo bus:', datos.placa);
 
    const { data: bus, error } = await supabase
      .from('buses')
      .insert({
        empresa_id: datos.empresa_id,
        placa: datos.placa,
        vin: datos.vin || null,
        marca: datos.marca || null,
        modelo: datos.modelo || null,
        anio: datos.anio || null,
        color: datos.color || null,
        kilometraje_actual: datos.kilometraje_actual || 0,
        activo: true,
      })
      .select()
      .single();
 
    if (error) {
      console.error('❌ Error creando bus:', error.message);
      return null;
    }
 
    console.log('✅ Bus creado exitosamente:', bus.placa);
    return bus;
  } catch (error) {
    console.error('❌ Error en crearBus:', error);
    return null;
  }
}

 /**
 * Obtener lista de OTs de una empresa
 *
 * @param empresaId - ID de la empresa
 * @returns Lista de OTs con información de bus, trabajador y trabajos
 *
 * @example
 * const ots = await obtenerOTsEmpresa(1);
 * console.log(`${ots.length} OTs encontradas`);
 */
export async function obtenerOTsEmpresa(empresaId: number): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('ots')
      .select(`
        *,
        buses:bus_id (placa, vin, marca, modelo, anio),
        perfiles:trabajador_id (nombre),
        ots_trabajos (
          id,
          estado,
          trabajos:trabajo_id (id, nombre, descripcion)
        )
      `)
      .eq('empresa_id', empresaId)
      .order('fecha_inicio', { ascending: false });
 
    if (error) {
      console.error('Error obteniendo OTs:', error.message);
      return [];
    }
 
    return data || [];
  } catch (error) {
    console.error('Error obteniendo OTs:', error);
    return [];
  }
}
// ───────────────────────────────────────────────────────
// FUNCIONES CRUD BÁSICAS
// ───────────────────────────────────────────────────────
 
/**
 * Crear una nueva OT
 *
 * @param ot - Datos de la OT
 * @returns OT creada
 *
 * @example
 * const ot = await crearOT({
 *   empresa_id: 1,
 *   bus_id: 1,
 *   trabajador_id: 'uuid-del-trabajador',
 *   numero_ot: 'OT-2026-0001',
 *   fecha_inicio: '2026-01-20',
 *   trabajos_ids: [1, 2, 3]
 * });
 */
export async function crearOT(datos: {
  empresa_id: number;
  bus_id: number;
  trabajador_id?: string;
  numero_ot: string;
  fecha_inicio: string;
  observaciones?: string;
  trabajos_ids?: number[];
}) {
  try {
    // Crear OT
    const { data: ot, error: otError } = await supabase
      .from('ots')
      .insert({
        empresa_id: datos.empresa_id,
        bus_id: datos.bus_id,
        trabajador_id: datos.trabajador_id,
        numero_ot: datos.numero_ot,
        fecha_inicio: datos.fecha_inicio,
        observaciones: datos.observaciones,
        estado: 'pendiente',
      })
      .select()
      .single();
 
    if (otError) {
      console.error('Error creando OT:', otError.message);
      return null;
    }
 
    // Agregar trabajos si se especificaron
    if (datos.trabajos_ids && datos.trabajos_ids.length > 0) {
      const trabajosData = datos.trabajos_ids.map(trabajoId => ({
        ot_id: ot.id,
        trabajo_id: trabajoId,
        estado: 'pendiente',
      }));
 
      const { error: trabajosError } = await supabase
        .from('ots_trabajos')
        .insert(trabajosData);
 
      if (trabajosError) {
        console.error('Error agregando trabajos a OT:', trabajosError.message);
      }
    }
 
    return ot;
  } catch (error) {
    console.error('Error creando OT:', error);
    return null;
  }
}
 
/**
 * Actualizar estado de una OT
 *
 * @param otId - ID de la OT
 * @param estado - Nuevo estado
 * @param fechaFin - Fecha de finalización (opcional)
 *
 * @example
 * await actualizarEstadoOT(1, 'completado', '2026-01-25');
 */
export async function actualizarEstadoOT(
  otId: number,
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado',
  fechaFin?: string
) {
  try {
    const updateData: any = { estado };
    if (fechaFin) {
      updateData.fecha_fin = fechaFin;
    }
 
    const { error } = await supabase
      .from('ots')
      .update(updateData)
      .eq('id', otId);
 
    if (error) {
      console.error('Error actualizando estado de OT:', error.message);
      return false;
    }
 
    return true;
  } catch (error) {
    console.error('Error actualizando estado de OT:', error);
    return false;
  }
}
 
/**
 * Obtener lista de trabajos disponibles
 *
 * @returns Lista de trabajos
 *
 * @example
 * const trabajos = await obtenerTrabajos();
 * console.log(`${trabajos.length} trabajos disponibles`);
 */
export async function obtenerTrabajos(empresaId: number): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('trabajos')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .order('nombre', { ascending: true });
 
    if (error) {
      console.error('Error obteniendo trabajos:', error.message);
      return [];
    }
 
    return data || [];
  } catch (error) {
    console.error('Error obteniendo trabajos:', error);
    return [];
  }
}

/**
 * Crear un nuevo trabajo
 *
 * @param trabajo - Datos del trabajo
 * @returns Trabajo creado
 *
 * @example
 * const trabajo = await crearTrabajo({
 *   empresa_id: 1,
 *   nombre: 'Cambio de aceite',
 *   descripcion: 'Cambio de aceite del motor',
 *   entraCronograma: true,
 *   intervaloDias: 90,
 *   intervaloKm: null
 * });
 */
export async function crearTrabajo(datos: {
  empresa_id: number;
  nombre: string;
  descripcion?: string;
  categoria?: string;
}): Promise<any | null> {
  try {
    console.log('🔧 Creando nuevo trabajo:', datos.nombre);
 
    const { data: trabajo, error } = await supabase
      .from('trabajos')
      .insert({
        empresa_id: datos.empresa_id,
        nombre: datos.nombre,
        descripcion: datos.descripcion || null,
        categoria: datos.categoria || null,
        activo: true,
      })
      .select()
      .single();
 
    if (error) {
      console.error('❌ Error creando trabajo:', error.message);
      return null;
    }
 
    console.log('✅ Trabajo creado exitosamente:', trabajo.nombre);
    return trabajo;
  } catch (error) {
    console.error('❌ Error en crearTrabajo:', error);
    return null;
  }
}

/**
 * Obtener detalle completo de una OT con trabajos
 *
 * @param otId - ID de la OT
 * @returns Detalle completo de la OT
 *
 * @example
 * const detalle = await obtenerOTCompleta(1);
 */
export async function obtenerOTCompleta(otId: number): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('ots')
      .select(`
        *,
        buses:bus_id (*),
        perfiles:trabajador_id (nombre, username),
        ots_trabajos (
          id,
          estado,
          notas,
          trabajos:trabajo_id (*)
        )
      `)
      .eq('id', otId)
      .single();
 
    if (error) {
      console.error('Error obteniendo OT completa:', error.message);
      return null;
    }
 
    return data;
  } catch (error) {
    console.error('Error obteniendo OT completa:', error);
    return null;
  }
}


/**
 * Eliminar un trabajo (soft delete)
 *
 * @param trabajoId - ID del trabajo
 * @returns true si se eliminó correctamente
 *
 * @example
 * const eliminado = await eliminarTrabajo(1);
 */
export async function eliminarTrabajo(trabajoId: number): Promise<boolean> {
  try {
    console.log('🗑️ Eliminando trabajo:', trabajoId);
 
    const { error } = await supabase
      .from('trabajos')
      .update({ activo: false })
      .eq('id', trabajoId);
 
    if (error) {
      console.error('❌ Error eliminando trabajo:', error.message);
      return false;
    }
 
    console.log('✅ Trabajo eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error en eliminarTrabajo:', error);
    return false;
  }
}

/**
 * Actualizar kilometraje de un bus
 *
 * @param busId - ID del bus
 * @param kilometraje - Nuevo kilometraje
 *
 * @example
 * await actualizarKilometraje(1, 50000);
 */
export async function actualizarKilometraje(busId: number, kilometraje: number) {
  try {
    const { error } = await supabase
      .from('buses')
      .update({ kilometraje_actual: kilometraje })
      .eq('id', busId);
 
    if (error) {
      console.error('Error actualizando kilometraje:', error.message);
      return false;
    }
 
    return true;
  } catch (error) {
    console.error('Error actualizando kilometraje:', error);
    return false;
  }
}