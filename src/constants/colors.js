// src/constants/colors.js
// Colores dinámicos por empresa

import useTemaStore from '../store/temaStore';

// Función para obtener colores dinámicos
export const obtenerColores = () => {
  return useTemaStore.getState().colores;
};

// Export default para compatibilidad
export const COLORS = new Proxy({}, {
  get(target, prop) {
    return useTemaStore.getState().colores[prop];
  }
});

export default COLORS;