// src/store/otsStore.js
// Store para Órdenes de Trabajo

import { create } from 'zustand';

const useOTsStore = create((set, get) => ({
  // OTs demo
  ots: [
    {
  id: 1,
  numeroOT: 'OT-2026-001',
  fecha: '2026-01-10',
  placa: 'ABC-123',
  vin: '1HGBH41JXMN109186',
  kilometraje: 65000,
  trabajos: [
    { id: 1, nombre: 'Cambio de Arrancador', entraCronograma: true },
    { id: 2, nombre: 'Cambio de Alternador AC', entraCronograma: true },
  ],
  servicios: 'Cambio de arrancador completo con limpieza de terminales. Instalación de alternador AC y ajuste de correa.',
  productos: [
    { nombre: 'Arrancador Bosch', cantidad: 1, precio: 450 },
    { nombre: 'Alternador AC Denso', cantidad: 1, precio: 680 },
  ],
  precioProductos: 1130,    // 👈 Asegúrate que esté
  precioServicios: 250,     // 👈 Asegúrate que esté
  precioTotal: 1380,        // 👈 Asegúrate que esté
  evidencia: 'https://via.placeholder.com/400x300',
  empresaId: 1,
},
  ],

  // Agregar OT
  agregarOT: (ot) => {
    const nuevaOT = {
      id: Date.now(),
      ...ot,
    };
    set((state) => ({
      ots: [...state.ots, nuevaOT],
    }));
    return nuevaOT;
  },

  // Editar OT
  editarOT: (id, datos) => {
    set((state) => ({
      ots: state.ots.map((ot) => (ot.id === id ? { ...ot, ...datos } : ot)),
    }));
  },

  // Eliminar OT
  eliminarOT: (id) => {
    set((state) => ({
      ots: state.ots.filter((ot) => ot.id !== id),
    }));
  },

  // Obtener OT por ID
  obtenerOT: (id) => {
    return get().ots.find((ot) => ot.id === id);
  },

  // Verificar si número OT existe
  existeNumeroOT: (numeroOT, excludeId = null) => {
    return get().ots.some(
      (ot) => ot.numeroOT === numeroOT && ot.id !== excludeId
    );
  },

  // Obtener OTs por empresa
  obtenerOTsPorEmpresa: (empresaId) => {
    return get().ots.filter((ot) => ot.empresaId === empresaId);
  },
}));

export default useOTsStore;