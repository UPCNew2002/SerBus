// src/screens/admin/UsuariosListScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import useAuthStore from '../../store/authStore';
import {
  obtenerUsuariosPorEmpresa,
  cambiarEstadoUsuario,
  eliminarUsuario,
} from '../../lib/usuarios';
import { useFocusEffect } from '@react-navigation/native';

export default function UsuariosListScreen({ navigation }) {
  const { empresa } = useAuthStore();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Cargar usuarios desde Supabase
  const cargarUsuarios = async () => {
    if (!empresa?.id) return;

    setCargando(true);
    const usuariosData = await obtenerUsuariosPorEmpresa(empresa.id, true);
    setUsuarios(usuariosData);
    setCargando(false);
  };

  // Recargar cuando la pantalla obtiene foco
  useFocusEffect(
    React.useCallback(() => {
      cargarUsuarios();
    }, [empresa?.id])
  );

  const usuariosEmpresa = usuarios;

  const handleEliminar = (usuario) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Desactivar a "${usuario.nombre}"?\n\nPodrás reactivarlo más tarde.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: async () => {
            const exito = await eliminarUsuario(usuario.id);
            if (exito) {
              Alert.alert('Éxito', 'Usuario desactivado correctamente');
              cargarUsuarios(); // Recargar lista
            } else {
              Alert.alert('Error', 'No se pudo desactivar el usuario');
            }
          },
        },
      ]
    );
  };

  const handleCambiarEstado = async (usuario) => {
    const nuevoEstado = !usuario.activo;
    const exito = await cambiarEstadoUsuario(usuario.id, nuevoEstado);

    if (exito) {
      Alert.alert(
        'Éxito',
        `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`
      );
      cargarUsuarios(); // Recargar lista
    } else {
      Alert.alert('Error', 'No se pudo cambiar el estado del usuario');
    }
  };

  const renderUsuario = ({ item }) => (
    <View style={styles.usuarioCard}>
      <View style={styles.usuarioHeader}>
        <View style={styles.usuarioIconBox}>
          <Ionicons name="person" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.usuarioInfo}>
          <Text style={styles.usuarioNombre}>{item.nombre}</Text>
          <View style={styles.usuarioDetalles}>
            <Ionicons name="at" size={12} color={COLORS.textMuted} />
            <Text style={styles.usuarioUsuario}>{item.username}</Text>
          </View>
          <Text style={styles.usuarioFecha}>
            Creado: {new Date(item.created_at).toLocaleDateString('es-PE')}
          </Text>
        </View>
        <View
          style={[
            styles.estadoBadge,
            item.activo ? styles.estadoActivo : styles.estadoInactivo,
          ]}
        >
          <Text style={styles.estadoText}>
            {item.activo ? 'ACTIVO' : 'INACTIVO'}
          </Text>
        </View>
      </View>

      <View style={styles.usuarioFooter}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditarUsuario', { usuarioId: item.id })}
        >
          <Ionicons name="create" size={16} color={COLORS.accent} />
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => handleCambiarEstado(item)}
        >
          <Ionicons
            name={item.activo ? 'close-circle' : 'checkmark-circle'}
            size={16}
            color={item.activo ? COLORS.statusDanger : COLORS.statusOk}
          />
          <Text style={styles.toggleText}>
            {item.activo ? 'Desactivar' : 'Activar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleEliminar(item)}
        >
          <Ionicons name="trash" size={16} color={COLORS.statusDanger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>USUARIOS</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CrearUsuario')}
        >
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{usuariosEmpresa.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.statusOk }]}>
            {usuariosEmpresa.filter((u) => u.activo).length}
          </Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.textMuted }]}>
            {usuariosEmpresa.filter((u) => !u.activo).length}
          </Text>
          <Text style={styles.statLabel}>Inactivos</Text>
        </View>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={COLORS.accent} />
        <Text style={styles.infoText}>
          Los trabajadores pueden consultar OTs y cronogramas (solo lectura)
        </Text>
      </View>

      {/* Lista */}
      {cargando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      ) : (
        <FlatList
          data={usuariosEmpresa}
          renderItem={renderUsuario}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No hay trabajadores registrados</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('CrearUsuario')}
              >
                <Text style={styles.emptyButtonText}>Crear Primer Trabajador</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1.5,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 5,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 12,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 12,
  },
  lista: {
    padding: 15,
    paddingTop: 5,
    paddingBottom: 30,
  },
  usuarioCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  usuarioHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  usuarioIconBox: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  usuarioInfo: {
    flex: 1,
  },
  usuarioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  usuarioDetalles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  usuarioUsuario: {
    fontSize: 13,
    color: COLORS.textLight,
    fontFamily: 'monospace',
  },
  usuarioFecha: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  estadoActivo: {
    backgroundColor: COLORS.statusOk,
  },
  estadoInactivo: {
    backgroundColor: COLORS.metal,
  },
  estadoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  usuarioFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  deleteButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 15,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textMuted,
  },
});