// src/store/temaStore.js
// Store para gestión de tema dinámico por empresa

import { create } from 'zustand';

// Tema por defecto (industrial/mecánico)
const TEMA_DEFAULT = {
  primary: '#dc2626',
  secondary: '#0a0a0a',
  accent: '#fbbf24',
  background: '#0f0f0f',
  backgroundLight: '#1e1e1e',
  card: '#1a1a1a',
  text: '#ffffff',
  textLight: '#e5e5e5',
  textMuted: '#888888',
  border: '#333333',
  metal: '#374151',
  statusOk: '#22c55e',
  statusWarning: '#f59e0b',
  statusDanger: '#dc2626',
  primaryDark: '#991b1b',
};

const useTemaStore = create((set) => ({
  colores: { ...TEMA_DEFAULT },

  // Cargar tema de empresa
  cargarTema: (temaEmpresa) => {
    if (temaEmpresa) {
      set({
        colores: {
          ...TEMA_DEFAULT,
          ...temaEmpresa,
        },
      });
    } else {
      set({ colores: { ...TEMA_DEFAULT } });
    }
  },

  // Resetear a tema default
  resetearTema: () => {
    set({ colores: { ...TEMA_DEFAULT } });
  },

  // Obtener colores actuales
  obtenerColores: () => {
    return useTemaStore.getState().colores;
  },
}));

export default useTemaStore;