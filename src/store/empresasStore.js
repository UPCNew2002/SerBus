// src/store/empresasStore.js
// Store temporal para empresas (sin backend por ahora)

import { create } from 'zustand';

const useEmpresasStore = create((set, get) => ({
  // Estado inicial
empresas: [
  {
    id: 1,
    ruc: '20123456789',
    razonSocial: 'Transportes ABC S.A.C.',
    adminUsuario: 'admin',
    adminPassword: 'admin123',
    activo: true,
    fechaCreacion: '2026-01-15',

    tema: {
      primary: '#dc2626',        // Rojo intenso
      secondary: '#0a0a0a',      // Negro profundo
      accent: '#fbbf24',         // Amarillo
      background: '#0f0f0f',     // Negro fondo
      card: '#1a1a1a',           // Gris oscuro
      text: '#ffffff',           // Blanco
    },
  },
],

// Actualizar tema de empresa
actualizarTema: (empresaId, nuevoTema) => {
  set((state) => ({
    empresas: state.empresas.map((empresa) =>
      empresa.id === empresaId
        ? { ...empresa, tema: { ...empresa.tema, ...nuevoTema } }
        : empresa
    ),
  }));
},

  // Agregar empresa
  agregarEmpresa: (empresa) => {
    const nuevaEmpresa = {
      id: Date.now(), // ID temporal
      ...empresa,
      estado: 'activa',
      fechaCreacion: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      empresas: [...state.empresas, nuevaEmpresa],
    }));
    return nuevaEmpresa;
  },

  // Editar empresa
  editarEmpresa: (id, datos) => {
    set((state) => ({
      empresas: state.empresas.map((emp) =>
        emp.id === id ? { ...emp, ...datos } : emp
      ),
    }));
  },

  // Cambiar estado (activar/desactivar)
  cambiarEstadoEmpresa: (id) => {
    set((state) => ({
      empresas: state.empresas.map((emp) =>
        emp.id === id
          ? { ...emp, estado: emp.estado === 'activa' ? 'inactiva' : 'activa' }
          : emp
      ),
    }));
  },

  // Obtener empresa por ID
  obtenerEmpresa: (id) => {
    return get().empresas.find((emp) => emp.id === id);
  },

  // Verificar si RUC existe
  existeRUC: (ruc, excludeId = null) => {
    return get().empresas.some(
      (emp) => emp.ruc === ruc && emp.id !== excludeId
    );
  },
}));

export default useEmpresasStore;