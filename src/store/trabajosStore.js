// src/store/trabajosStore.js
// Store para tipos de trabajo

import { create } from 'zustand';

const useTrabajosStore = create((set, get) => ({
  // Trabajos demo
  trabajos: [
    {
      id: 1,
      nombre: 'Cambio de Arrancador',
      entraCronograma: true,
      intervaloDias: 180,
      intervaloKm: 15000,
    },
    {
      id: 2,
      nombre: 'Cambio de Alternador AC',
      entraCronograma: true,
      intervaloDias: 365,
      intervaloKm: 30000,
    },
    {
      id: 3,
      nombre: 'Limpieza General',
      entraCronograma: false,
      intervaloDias: null,
      intervaloKm: null,
    },
    {
      id: 4,
      nombre: 'Cambio de Frenos',
      entraCronograma: true,
      intervaloDias: 90,
      intervaloKm: 10000,
    },
  ],

  // Agregar trabajo
  agregarTrabajo: (trabajo) => {
    const nuevoTrabajo = {
      id: Date.now(),
      ...trabajo,
    };
    set((state) => ({
      trabajos: [...state.trabajos, nuevoTrabajo],
    }));
    return nuevoTrabajo;
  },

  // Editar trabajo
  editarTrabajo: (id, datos) => {
    set((state) => ({
      trabajos: state.trabajos.map((trabajo) =>
        trabajo.id === id ? { ...trabajo, ...datos } : trabajo
      ),
    }));
  },

  // Eliminar trabajo
  eliminarTrabajo: (id) => {
    set((state) => ({
      trabajos: state.trabajos.filter((trabajo) => trabajo.id !== id),
    }));
  },

  // Obtener trabajo por ID
  obtenerTrabajo: (id) => {
    return get().trabajos.find((trabajo) => trabajo.id === id);
  },

  // Verificar si nombre existe
  existeNombre: (nombre, excludeId = null) => {
    return get().trabajos.some(
      (trabajo) =>
        trabajo.nombre.toLowerCase() === nombre.toLowerCase() &&
        trabajo.id !== excludeId
    );
  },
}));

export default useTrabajosStore;