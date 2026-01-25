// src/screens/system/GestionarAdminsScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColores } from '../../hooks/useColores';
import { obtenerTodasLasEmpresas } from '../../lib/empresas';
 
export default function GestionarAdminsScreen({ navigation }) {
  const COLORS = useColores();
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
 
  useEffect(() => {
    cargarEmpresas();
  }, []);
 
  const cargarEmpresas = async () => {
    setCargando(true);
    const datos = await obtenerTodasLasEmpresas();
    setEmpresas(datos);
    setCargando(false);
  };
  // Filtrar empresas por búsqueda
  const empresasFiltradas = empresas.filter(
    (e) =>
     e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.adminUsuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.ruc.includes(busqueda)
  );
 
  const handleResetPassword = (empresa) => {
    Alert.alert(
      '🔐 Resetear Contraseña',
      `Esta funcionalidad requiere actualizar la contraseña en Supabase Auth.\n\nPor ahora, contacta al administrador del sistema para resetear la contraseña del usuario: ${empresa.adminUsuario}`,
      [{ text: 'Entendido' }]
    );
  };

  const renderAdmin = ({ item }) => (
    <View style={[styles.adminCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
      <View style={styles.adminHeader}>
        <View style={[styles.adminIconBox, { backgroundColor: COLORS.backgroundLight }]}>
          <Ionicons name="person" size={24} color={COLORS.accent} />
        </View>
        <View style={styles.adminInfo}>
          <Text style={[styles.empresaNombre, { color: COLORS.text }]}>{item.nombre}</Text>
          <View style={styles.adminDetalles}>
            <Ionicons name="at" size={12} color={COLORS.textMuted} />
            <Text style={[styles.adminUsuario, { color: COLORS.textLight }]}>{item.adminUsuario}</Text>
          </View>
          <Text style={[styles.adminRuc, { color: COLORS.textMuted }]}>RUC: {item.ruc}</Text>
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

      <View style={styles.adminFooter}>
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: COLORS.backgroundLight, borderColor: COLORS.border }]}
          onPress={() => handleResetPassword(item)}
        >
          <Ionicons name="key" size={16} color={COLORS.statusWarning} />
          <Text style={[styles.resetText, { color: COLORS.statusWarning }]}>Resetear Clave</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.viewButton, { backgroundColor: COLORS.backgroundLight, borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('EditarEmpresa', { empresaId: item.id })}
        >
          <Ionicons name="eye" size={16} color={COLORS.accent} />
          <Text style={[styles.viewText, { color: COLORS.accent }]}>Ver Empresa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: COLORS.card, borderBottomColor: COLORS.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>GESTIONAR ADMINS</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: COLORS.text }]}
            placeholder="Buscar por empresa, usuario o RUC..."
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

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
          <Text style={[styles.statNumber, { color: COLORS.text }]}>{empresasFiltradas.length}</Text>
          <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Total Admins</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
          <Text style={[styles.statNumber, { color: COLORS.statusOk }]}>
            {empresasFiltradas.filter((e) => e.activo).length}
          </Text>
          <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Activos</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
          <Text style={[styles.statNumber, { color: COLORS.textMuted }]}>
            {empresasFiltradas.filter((e) => !e.activo).length}
          </Text>
          <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Inactivos</Text>
        </View>
      </View>

      {/* Info */}
      <View style={[styles.infoBox, { backgroundColor: COLORS.card, borderLeftColor: COLORS.statusWarning, borderColor: COLORS.border }]}>
        <Ionicons name="information-circle" size={20} color={COLORS.statusWarning} />
        <Text style={[styles.infoText, { color: COLORS.textLight }]}>
          Al resetear una contraseña, se generará la clave temporal "reset123"
        </Text>
      </View>

      {/* Lista */}
      {cargando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: COLORS.textMuted }]}>Cargando admins...</Text>
        </View>
      ) : (
        <FlatList
          data={empresasFiltradas}
          renderItem={renderAdmin}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color={COLORS.textMuted} />
              <Text style={[styles.emptyText, { color: COLORS.textMuted }]}>
                No se encontraron admins
              </Text>
            </View>
          }
        />
      )}
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
  adminCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  adminIconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  adminInfo: { flex: 1 },
  empresaNombre: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  adminDetalles: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  adminUsuario: { fontSize: 13, fontFamily: 'monospace' },
  adminRuc: { fontSize: 11 },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  estadoText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  adminFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  resetText: { fontSize: 12, fontWeight: '600' },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewText: { fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, marginTop: 15 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 15,
  },
});