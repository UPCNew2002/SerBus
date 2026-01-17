// src/hooks/useColores.js
// Hook para usar colores dinámicos en componentes

import { useEffect, useState } from 'react';
import useTemaStore from '../store/temaStore';

export const useColores = () => {
  const colores = useTemaStore((state) => state.colores);
  const [key, setKey] = useState(0);

  // Forzar re-render cuando cambien los colores
  useEffect(() => {
    const unsubscribe = useTemaStore.subscribe(() => {
      setKey((k) => k + 1);
    });
    return unsubscribe;
  }, []);

  return colores;
};