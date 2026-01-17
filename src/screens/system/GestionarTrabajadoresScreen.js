// src/screens/system/GestionarTrabajadoresScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColores } from '../../hooks/useColores';
import useUsuariosStore from '../../store/usuariosStore';
import useEmpresasStore from '../../store/empresasStore';

export default function GestionarTrabajadoresScreen({ navigation }) {
  const COLORS = useColores();
  const { usuarios, editarUsuario, cambiarEstadoUsuario } = useUsuariosStore();
  const { empresas } = useEmpresasStore();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('todas');

  // Filtrar trabajadores
  const trabajadoresFiltrados = usuarios.filter((user) => {
    const matchBusqueda =
      user.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      user.usuario.toLowerCase().includes(busqueda.toLowerCase());

    const matchEmpresa =
      filtroEmpresa === 'todas' || user.empresaId === parseInt(filtroEmpresa);

    return matchBusqueda && matchEmpresa;
  });

  const handleResetPassword = (trabajador) => {
    const empresa = empresas.find((e) => e.id === trabajador.empresaId);

    Alert.alert(
      '🔐 Resetear Contraseña',
      `¿Resetear la contraseña de "${trabajador.nombre}"?\n\nEmpresa: ${empresa?.razonSocial}\nUsuario: ${trabajador.usuario}\n\nSe generará una contraseña temporal: "reset123"`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: () => {
            editarUsuario(trabajador.id, { password: 'reset123' });
            Alert.alert(
              '✅ Contraseña Reseteada',
              `Nueva contraseña temporal para ${trabajador.usuario}:\n\nContraseña: reset123\n\nInforma al trabajador que debe cambiarla.`
            );
          },
        },
      ]
    );
  };

  const handleToggleEstado = (trabajador) => {
    const accion = trabajador.activo ? 'desactivar' : 'activar';
    Alert.alert(
      `${trabajador.activo ? '🔴' : '🟢'} ${accion.charAt(0).toUpperCase() + accion.slice(1)} Trabajador`,
      `¿Estás seguro de ${accion} a "${trabajador.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: accion.charAt(0).toUpperCase() + accion.slice(1),
          onPress: () => cambiarEstadoUsuario(trabajador.id),
        },
      ]
    );
  };

  const renderTrabajador = ({ item }) => {
    const empresa = empresas.find((e) => e.id === item.empresaId);

    return (
      <View style={[styles.trabajadorCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
        <View style={styles.trabajadorHeader}>
          <View style={[styles.trabajadorIconBox, { backgroundColor: COLORS.backgroundLight }]}>
            <Ionicons name="person" size={24} color={COLORS.statusOk} />
          </View>
          <View style={styles.trabajadorInfo}>
            <Text style={[styles.trabajadorNombre, { color: COLORS.text }]}>{item.nombre}</Text>
            <View style={styles.trabajadorDetalles}>
              <Ionicons name="at" size={12} color={COLORS.textMuted} />
              <Text style={[styles.trabajadorUsuario, { color: COLORS.textLight }]}>{item.usuario}</Text>
            </View>
            <View style={styles.empresaRow}>
              <Ionicons name="business" size={12} color={COLORS.accent} />
              <Text style={[styles.empresaText, { color: COLORS.accent }]}>
                {empresa?.razonSocial || 'Sin empresa'}
              </Text>
            </View>
            <Text style={[styles.trabajadorFecha, { color: COLORS.textMuted }]}>
              Creado: {new Date(item.fechaCreacion).toLocaleDateString('es-PE')}
            </Text>
          </View>
          <View
            style={[
              styles.estadoBadge,
              { backgroundColor: item.activo ? COLORS.statusOk : COLORS.metal },
            ]}
          >
            <Text style={[styles.estadoText, { color: COLORS.text }]}>
              {item.activo ? 'ACTIVO' : 'INACTIVO'}
            </Text>
          </View>
        </View>

        <View style={[styles.trabajadorFooter, { borderTopColor: COLORS.border }]}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.backgroundLight, borderColor: COLORS.border }]}
            onPress={() => handleResetPassword(item)}
          >
            <Ionicons name="key" size={16} color={COLORS.statusWarning} />
            <Text style={[styles.actionText, { color: COLORS.statusWarning }]}>Resetear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.backgroundLight, borderColor: COLORS.border }]}
            onPress={() => handleToggleEstado(item)}
          >
            <Ionicons
              name={item.activo ? 'close-circle' : 'checkmark-circle'}
              size={16}
              color={item.activo ? COLORS.statusDanger : COLORS.statusOk}
            />
            <Text style={[styles.actionText, { color: item.activo ? COLORS.statusDanger : COLORS.statusOk }]}>
              {item.activo ? 'Desactivar' : 'Activar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: COLORS.card, borderBottomColor: COLORS.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>GESTIONAR TRABAJADORES</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: COLORS.text }]}
            placeholder="Buscar por nombre o usuario..."
            placeholderTextColor={COLORS.textMuted}
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda ? (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filtro por empresa */}
      <View style={styles.filtroContainer}>
        <Text style={[styles.filtroLabel, { color: COLORS.textMuted }]}>FILTRAR POR EMPRESA:</Text>
        <View style={styles.filtroButtons}>
          <TouchableOpacity
            style={[
              styles.filtroButton,
              { backgroundColor: COLORS.card, borderColor: COLORS.border },
              filtroEmpresa === 'todas' && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
            ]}
            onPress={() => setFiltroEmpresa('todas')}
          >
            <Text
              style={[
                styles.filtroButtonText,
                { color: COLORS.textLight },
                filtroEmpresa === 'todas' && { color: COLORS.text },
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>
          {empresas.map((empresa) => (
            <TouchableOpacity
              key={empresa.id}
              style={[
                styles.filtroButton,
                { backgroundColor: COLORS.card, borderColor: COLORS.border },
                filtroEmpresa === empresa.id.toString() && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
              ]}
              onPress={() => setFiltroEmpresa(empresa.id.toString())}
            >
              <Text
                style={[
                  styles.filtroButtonText,
                  { color: COLORS.textLight },
                  filtroEmpresa === empresa.id.toString() && { color: COLORS.text },
                ]}
              >
                {empresa.razonSocial}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
          <Text style={[styles.statNumber, { color: COLORS.text }]}>{trabajadoresFiltrados.length}</Text>
          <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>
            {filtroEmpresa === 'todas' ? 'Total' : 'Filtrados'}
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
          <Text style={[styles.statNumber, { color: COLORS.statusOk }]}>
            {trabajadoresFiltrados.filter((u) => u.activo).length}
          </Text>
          <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Activos</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
          <Text style={[styles.statNumber, { color: COLORS.textMuted }]}>
            {trabajadoresFiltrados.filter((u) => !u.activo).length}
          </Text>
          <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Inactivos</Text>
        </View>
      </View>

      {/* Info */}
      <View style={[styles.infoBox, { backgroundColor: COLORS.card, borderLeftColor: COLORS.statusWarning, borderColor: COLORS.border }]}>
        <Ionicons name="shield-checkmark" size={20} color={COLORS.statusWarning} />
        <Text style={[styles.infoText, { color: COLORS.textLight }]}>
          Control total: Puedes resetear contraseñas y activar/desactivar trabajadores de todas las empresas
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={trabajadoresFiltrados}
        renderItem={renderTrabajador}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color={COLORS.textMuted} />
            <Text style={[styles.emptyText, { color: COLORS.textMuted }]}>
              No se encontraron trabajadores
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 2,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', letterSpacing: 1.5 },
  searchContainer: { padding: 15 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filtroContainer: { paddingHorizontal: 15, paddingBottom: 15 },
  filtroLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  filtroButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filtroButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filtroButtonText: { fontSize: 12, fontWeight: '600' },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 15, paddingBottom: 15, gap: 10 },
  statBox: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 11, marginTop: 5 },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    gap: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  infoText: { flex: 1, fontSize: 12 },
  lista: { padding: 15, paddingTop: 5, paddingBottom: 30 },
  trabajadorCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
  },
  trabajadorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  trabajadorIconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trabajadorInfo: { flex: 1 },
  trabajadorNombre: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  trabajadorDetalles: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  trabajadorUsuario: { fontSize: 13, fontFamily: 'monospace' },
  empresaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  empresaText: { fontSize: 12, fontWeight: '600' },
  trabajadorFecha: { fontSize: 11 },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  estadoText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  trabajadorFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionText: { fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, marginTop: 15 },
});