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
  marca: string;
  modelo: string;
  kilometraje_actual: number;
  km_proximo_mantenimiento: number;
  km_restantes: number;
  urgencia: 'URGENTE' | 'PRONTO' | 'NORMAL';
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
    const { data, error } = await supabase.rpc('buses_necesitan_mantenimiento', {
      p_empresa_id: empresaId,
    });

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
    const { data, error } = await supabase.rpc('estadisticas_ots', {
      p_empresa_id: empresaId,
    });

    if (error) {
      console.error('Error obteniendo estadísticas:', error.message);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
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
 * Obtener lista de trabajos disponibles
 *
 * @returns Lista de trabajos
 *
 * @example
 * const trabajos = await obtenerTrabajos();
 * console.log(`${trabajos.length} trabajos disponibles`);
 */
export async function obtenerTrabajos(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('trabajos')
      .select('*')
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
 * Obtener lista de OTs de una empresa
 *
 * @param empresaId - ID de la empresa
 * @returns Lista de OTs con información de bus y trabajador
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
        perfiles:trabajador_id (nombre)
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
