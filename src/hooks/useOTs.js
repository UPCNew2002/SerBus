// src/hooks/useOTs.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerOTsEmpresa,
  obtenerDetalleOT,
  obtenerOTCompleta,
  obtenerEstadisticasOTs,
  crearOT,
  actualizarEstadoOT,
  generarNumeroOT
} from '../lib/cronograma';

/**
 * Hook para obtener OTs de una empresa
 * @param {number} empresaId - ID de la empresa
 */
export function useOTs(empresaId) {
  return useQuery({
    queryKey: ['ots', empresaId],
    queryFn: () => obtenerOTsEmpresa(empresaId),
    enabled: !!empresaId,
  });
}

/**
 * Hook para obtener el detalle de una OT
 * @param {number} otId - ID de la OT
 */
export function useDetalleOT(otId) {
  return useQuery({
    queryKey: ['ots', 'detalle', otId],
    queryFn: () => obtenerDetalleOT(otId),
    enabled: !!otId,
  });
}

/**
 * Hook para obtener una OT completa (con todos los datos relacionados)
 * @param {number} otId - ID de la OT
 */
export function useOTCompleta(otId) {
  return useQuery({
    queryKey: ['ots', 'completa', otId],
    queryFn: () => obtenerOTCompleta(otId),
    enabled: !!otId,
  });
}

/**
 * Hook para obtener estadísticas de OTs
 * @param {number} empresaId - ID de la empresa
 */
export function useEstadisticasOTs(empresaId) {
  return useQuery({
    queryKey: ['ots', 'estadisticas', empresaId],
    queryFn: () => obtenerEstadisticasOTs(empresaId),
    enabled: !!empresaId,
  });
}

/**
 * Hook para generar número de OT
 * @param {number} empresaId - ID de la empresa
 */
export function useGenerarNumeroOT(empresaId) {
  return useQuery({
    queryKey: ['ots', 'generar', empresaId],
    queryFn: () => generarNumeroOT(empresaId),
    enabled: false, // Se ejecuta manualmente con refetch
  });
}

/**
 * Hook para crear una nueva OT
 */
export function useCrearOT() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datos) => crearOT(datos),
    onSuccess: (data, variables) => {
      // Invalida y refresca las listas de OTs
      queryClient.invalidateQueries({ queryKey: ['ots', variables.empresa_id] });
      queryClient.invalidateQueries({ queryKey: ['ots', 'estadisticas', variables.empresa_id] });
    },
  });
}

/**
 * Hook para actualizar el estado de una OT
 */
export function useActualizarEstadoOT() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ otId, estado, empresaId }) => actualizarEstadoOT(otId, estado),
    onSuccess: (data, variables) => {
      // Invalida las queries relacionadas con la OT
      queryClient.invalidateQueries({ queryKey: ['ots', variables.empresaId] });
      queryClient.invalidateQueries({ queryKey: ['ots', 'detalle', variables.otId] });
      queryClient.invalidateQueries({ queryKey: ['ots', 'completa', variables.otId] });
      queryClient.invalidateQueries({ queryKey: ['ots', 'estadisticas', variables.empresaId] });
    },
  });
}
