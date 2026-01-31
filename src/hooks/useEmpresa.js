// src/hooks/useEmpresa.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerEmpresaPorId,
  actualizarEmpresa,
  actualizarTemaEmpresa,
  actualizarDatosEmpresa
} from '../lib/empresas';

/**
 * Hook para obtener empresa por ID
 * @param {number} empresaId - ID de la empresa
 */
export function useEmpresa(empresaId) {
  return useQuery({
    queryKey: ['empresa', empresaId],
    queryFn: () => obtenerEmpresaPorId(empresaId),
    enabled: !!empresaId,
  });
}

/**
 * Hook para obtener el tema de una empresa
 * @param {number} empresaId - ID de la empresa
 */
export function useTemaEmpresa(empresaId) {
  return useQuery({
    queryKey: ['empresa', 'tema', empresaId],
    queryFn: async () => {
      const empresa = await obtenerEmpresaPorId(empresaId);
      return empresa?.tema || null;
    },
    enabled: !!empresaId,
  });
}

/**
 * Hook para actualizar el tema de una empresa
 */
export function useActualizarTema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ empresaId, tema }) => actualizarTemaEmpresa(empresaId, tema),
    onSuccess: (data, variables) => {
      // Invalida el tema de la empresa para forzar recarga
      queryClient.invalidateQueries({ queryKey: ['empresa', 'tema', variables.empresaId] });
      queryClient.invalidateQueries({ queryKey: ['empresa', variables.empresaId] });
    },
  });
}

/**
 * Hook para actualizar datos de empresa
 */
export function useActualizarEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ empresaId, datos }) => actualizarDatosEmpresa(empresaId, datos),
    onSuccess: (data, variables) => {
      // Invalida las queries de empresa
      queryClient.invalidateQueries({ queryKey: ['empresa', variables.empresaId] });
    },
  });
}
