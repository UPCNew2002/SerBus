// src/store/usuariosStore.js
// Store para gestión de usuarios (trabajadores)

import { create } from 'zustand';

const useUsuariosStore = create((set, get) => ({
  // Usuarios demo
  usuarios: [
    {
      id: 1,
      nombre: 'Juan Pérez',
      usuario: 'jperez',
      password: '123456', // En producción: hash
      rol: 'trabajador',
      empresaId: 1,
      activo: true,
      fechaCreacion: '2026-01-10',
    },
    {
      id: 2,
      nombre: 'María García',
      usuario: 'mgarcia',
      password: '123456',
      rol: 'trabajador',
      empresaId: 1,
      activo: true,
      fechaCreacion: '2026-01-12',
    },
  ],

  // Agregar usuario
  agregarUsuario: (usuario) => {
    const nuevoUsuario = {
      id: Date.now(),
      ...usuario,
      activo: true,
      fechaCreacion: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      usuarios: [...state.usuarios, nuevoUsuario],
    }));
    return nuevoUsuario;
  },

  // Editar usuario
  editarUsuario: (id, datos) => {
    set((state) => ({
      usuarios: state.usuarios.map((user) =>
        user.id === id ? { ...user, ...datos } : user
      ),
    }));
  },

  // Cambiar estado (activar/desactivar)
  cambiarEstadoUsuario: (id) => {
    set((state) => ({
      usuarios: state.usuarios.map((user) =>
        user.id === id ? { ...user, activo: !user.activo } : user
      ),
    }));
  },

  // Eliminar usuario
  eliminarUsuario: (id) => {
    set((state) => ({
      usuarios: state.usuarios.filter((user) => user.id !== id),
    }));
  },

  // Obtener usuario por ID
  obtenerUsuario: (id) => {
    return get().usuarios.find((user) => user.id === id);
  },

  // Verificar si usuario existe
  existeUsuario: (usuario, excludeId = null) => {
    return get().usuarios.some(
      (user) =>
        user.usuario.toLowerCase() === usuario.toLowerCase() &&
        user.id !== excludeId
    );
  },

  // Obtener usuarios por empresa
  obtenerUsuariosPorEmpresa: (empresaId) => {
    return get().usuarios.filter((user) => user.empresaId === empresaId);
  },
}));

export default useUsuariosStore;