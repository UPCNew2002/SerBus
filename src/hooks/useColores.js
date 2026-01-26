// src/hooks/useColores.js
// Hook para usar colores dinámicos en componentes

import { useEffect, useState } from 'react';
import useTemaStore from '../store/temaStore';
 
export const useColores = () => {
  // El selector de Zustand ya es reactivo, no necesitamos subscribe manual
  const colores = useTemaStore((state) => state.colores);

  return colores;
};