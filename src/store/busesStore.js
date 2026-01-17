// src/store/busesStore.js
// Store para gestión de buses

import { create } from 'zustand';

const useBusesStore = create((set, get) => ({
  // Buses demo
  buses: [
    {
      id: 1,
      placa: 'ABC-123',
      vin: '1HGBH41JXMN109186',
      kilometrajeActual: 65000,
      empresaId: 1,
    },
    {
      id: 2,
      placa: 'XYZ-789',
      vin: '2FMDK3GC6BBA12345',
      kilometrajeActual: 48000,
      empresaId: 1,
    },
    {
      id: 3,
      placa: 'DEF-456',
      vin: '3FADP4EJ4DM123456',
      kilometrajeActual: 92000,
      empresaId: 1,
    },
  ],

  // Agregar bus
  agregarBus: (bus) => {
    const nuevoBus = {
      id: Date.now(),
      ...bus,
    };
    set((state) => ({
      buses: [...state.buses, nuevoBus],
    }));
    return nuevoBus;
  },

  // Actualizar kilometraje
  actualizarKilometraje: (busId, nuevoKm) => {
    set((state) => ({
      buses: state.buses.map((bus) =>
        bus.id === busId ? { ...bus, kilometrajeActual: nuevoKm } : bus
      ),
    }));
  },

  // Obtener bus por placa
  obtenerBusPorPlaca: (placa) => {
    return get().buses.find((bus) => bus.placa === placa);
  },

  // Obtener buses por empresa
  obtenerBusesPorEmpresa: (empresaId) => {
    return get().buses.filter((bus) => bus.empresaId === empresaId);
  },
}));

export default useBusesStore;