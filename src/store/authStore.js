// src/store/authStore.js
// Store de autenticación con Zustand

import { create } from 'zustand';
import useTemaStore from './temaStore';
import useEmpresasStore from './empresasStore';

const useAuthStore = create((set) => ({
  // Estado inicial
  user: null,
  empresa: null,
  isAuthenticated: false,
  token: null,

  // Función para hacer login
login: (userData) => {
  set({
    user: userData.user,
    empresa: userData.empresa,
    token: userData.token,
    isAuthenticated: true,
  });
  
  // Cargar tema de la empresa
  if (userData.empresa) {
    // Obtener empresa completa del store para tener el tema actualizado
    const empresaCompleta = useEmpresasStore
      .getState()
      .empresas.find((e) => e.id === userData.empresa.id);
    
    if (empresaCompleta?.tema) {
      useTemaStore.getState().cargarTema(empresaCompleta.tema);
    } else {
      useTemaStore.getState().resetearTema();
    }
  } else {
    useTemaStore.getState().resetearTema();
  }
},

  // Función para hacer logout
logout: () => {
  set({
    user: null,
    empresa: null,
    token: null,
    isAuthenticated: false,
  });
  
  // Resetear tema
  useTemaStore.getState().resetearTema();
},

  // Función para actualizar usuario
  updateUser: (userData) => {
    set({ user: userData });
  },
}));

export default useAuthStore;