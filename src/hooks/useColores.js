// src/hooks/useColores.js
// Hook para usar colores dinámicos en componentes

import useTemaStore from '../store/temaStore';

export const useColores = () => {
  const colores = useTemaStore((state) => state.colores);
  return colores;
};
