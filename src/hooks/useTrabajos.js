// src/hooks/useTrabajos.js
 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerTrabajos, crearTrabajo, eliminarTrabajo } from '../lib/cronograma';
 
/**
 * Hook para obtener trabajos de una empresa
 * @param {number} empresaId - ID de la empresa
 */
export function useTrabajos(empresaId) {
  return useQuery({
    queryKey: ['trabajos', empresaId],
    queryFn: () => obtenerTrabajos(empresaId),
    enabled: !!empresaId, // Solo ejecuta si hay empresaId
  });
}
 
/**
 * Hook para crear un nuevo trabajo
 */
export function useCrearTrabajo() {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: (datos) => crearTrabajo(datos),
    onSuccess: (data, variables) => {
      // Invalida y refresca la lista de trabajos de la empresa
      queryClient.invalidateQueries({ queryKey: ['trabajos', variables.empresa_id] });
    },
  });
}
 
/**
 * Hook para eliminar un trabajo
 */
export function useEliminarTrabajo() {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: ({ trabajoId, empresaId }) => eliminarTrabajo(trabajoId),
    onSuccess: (data, variables) => {
      // Invalida y refresca la lista de trabajos de la empresa
      queryClient.invalidateQueries({ queryKey: ['trabajos', variables.empresaId] });
    },
  });
}