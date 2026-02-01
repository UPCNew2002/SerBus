// src/hooks/useBuses.js
 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerBusesEmpresa,
  crearBus,
  actualizarKilometraje,
  busesNecesitanMantenimiento
} from '../lib/cronograma';
 
/**
 * Hook para obtener buses de una empresa
 * @param {number} empresaId - ID de la empresa
 */
export function useBuses(empresaId) {
  return useQuery({
    queryKey: ['buses', empresaId],
    queryFn: () => obtenerBusesEmpresa(empresaId),
    enabled: !!empresaId,
  });
}
 
/**
 * Hook para obtener buses que necesitan mantenimiento
 * @param {number} empresaId - ID de la empresa
 */
export function useBusesMantenimiento(empresaId) {
  return useQuery({
    queryKey: ['buses', 'mantenimiento', empresaId],
    queryFn: () => busesNecesitanMantenimiento(empresaId),
    enabled: !!empresaId,
  });
}
 
/**
 * Hook para crear un nuevo bus
 */
export function useCrearBus() {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: (datos) => crearBus(datos),
    onSuccess: (data, variables) => {
      // Invalida y refresca la lista de buses de la empresa
      queryClient.invalidateQueries({ queryKey: ['buses', variables.empresa_id] });
      queryClient.invalidateQueries({ queryKey: ['buses', 'mantenimiento', variables.empresa_id] });
    },
  });
}
 
/**
 * Hook para actualizar el kilometraje de un bus
 */
export function useActualizarKilometraje() {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: ({ busId, kilometraje, empresaId }) => actualizarKilometraje(busId, kilometraje),
    onSuccess: (data, variables) => {
      // Invalida y refresca la lista de buses
      queryClient.invalidateQueries({ queryKey: ['buses', variables.empresaId] });
      queryClient.invalidateQueries({ queryKey: ['buses', 'mantenimiento', variables.empresaId] });
    },
  });
}