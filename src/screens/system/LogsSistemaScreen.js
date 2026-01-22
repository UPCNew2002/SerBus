// src/screens/system/LogsSistemaScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColores } from '../../hooks/useColores';

export default function LogsSistemaScreen({ navigation }) {
  const COLORS = useColores();
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Logs demo (en producción vendrían del backend)
  const logsDemoData = [
    {
      id: 1,
      tipo: 'login',
      usuario: 'admin',
      accion: 'Inicio de sesión',
      empresa: 'Transportes ABC',
      fecha: '2026-01-17 14:30:25',
      ip: '192.168.1.100',
    },
    {
      id: 2,
      tipo: 'ot',
      usuario: 'plopez',
      accion: 'Registró OT OT-2026-050',
      empresa: 'Transportes ABC',
      fecha: '2026-01-17 14:15:10',
      ip: '192.168.1.102',
    },
    {
      id: 3,
      tipo: 'usuario',
      usuario: 'admin',
      accion: 'Creó trabajador: cmendez',
      empresa: 'Transportes ABC',
      fecha: '2026-01-17 13:45:30',
      ip: '192.168.1.100',
    },
    {
      id: 4,
      tipo: 'password',
      usuario: 'superadmin',
      accion: 'Reseteó contraseña de: admin',
      empresa: 'Sistema',
      fecha: '2026-01-17 12:20:15',
      ip: '192.168.1.1',
    },
    {
      id: 5,
      tipo: 'empresa',
      usuario: 'superadmin',
      accion: 'Creó empresa: Transportes XYZ',
      empresa: 'Sistema',
      fecha: '2026-01-17 11:00:00',
      ip: '192.168.1.1',
    },
    {
      id: 6,
      tipo: 'logout',
      usuario: 'plopez',
      accion: 'Cerró sesión',
      empresa: 'Transportes ABC',
      fecha: '2026-01-17 10:30:45',
      ip: '192.168.1.102',
    },
  ];

  // Filtrar logs
  const logsFiltrados = logsDemoData.filter((log) => {
    const matchBusqueda =
      log.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.accion.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.empresa.toLowerCase().includes(busqueda.toLowerCase());

    const matchTipo = filtroTipo === 'todos' || log.tipo === filtroTipo;

    return matchBusqueda && matchTipo;
  });

  const getIconoTipo = (tipo) => {
    switch (tipo) {
      case 'login':
        return { icon: 'log-in', color: COLORS.statusOk };
      case 'logout':
        return { icon: 'log-out', color: COLORS.textMuted };
      case 'ot':
        return { icon: 'document-text', color: COLORS.accent };
      case 'usuario':
        return { icon: 'person-add', color: COLORS.primary };
      case 'password':
        return { icon: 'key', color: COLORS.statusWarning };
      case 'empresa':
        return { icon: 'business', color: COLORS.statusOk };
      default:
        return { icon: 'information-circle', color: COLORS.textMuted };
    }
  };

  const renderLog = ({ item }) => {
    const icono = getIconoTipo(item.tipo);

    return (
      <View style={[styles.logCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
        <View style={styles.logHeader}>
          <View style={[styles.logIconBox, { backgroundColor: COLORS.backgroundLight }]}>
            <Ionicons name={icono.icon} size={20} color={icono.color} />
          </View>
          <View style={styles.logInfo}>
            <Text style={[styles.logAccion, { color: COLORS.text }]}>{item.accion}</Text>
            <View style={styles.logDetalles}>
              <Ionicons name="person" size={12} color={COLORS.textMuted} />
              <Text style={[styles.logUsuario, { color: COLORS.textLight }]}>{item.usuario}</Text>
              <Text style={[styles.logSeparator, { color: COLORS.textMuted }]}>•</Text>
              <Ionicons name="business" size={12} color={COLORS.accent} />
              <Text style={[styles.logEmpresa, { color: COLORS.accent }]}>{item.empresa}</Text>
            </View>
            <View style={styles.logMeta}>
              <Ionicons name="time" size={12} color={COLORS.textMuted} />
              <Text style={[styles.logFecha, { color: COLORS.textMuted }]}>{item.fecha}</Text>
              <Text style={[styles.logSeparator, { color: COLORS.textMuted }]}>•</Text>
              <Ionicons name="globe" size={12} color={COLORS.textMuted} />
              <Text style={[styles.logIP, { color: COLORS.textMuted }]}>{item.ip}</Text>
            </View>
          </View>
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
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>LOGS DEL SISTEMA</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: COLORS.text }]}
            placeholder="Buscar en logs..."
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

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <Text style={[styles.filtroLabel, { color: COLORS.textMuted }]}>TIPO DE EVENTO:</Text>
        <View style={styles.filtroButtons}>
          {['todos', 'login', 'logout', 'ot', 'usuario', 'password', 'empresa'].map((tipo) => (
            <TouchableOpacity
              key={tipo}
              style={[
                styles.filtroButton,
                { backgroundColor: COLORS.card, borderColor: COLORS.border },
                filtroTipo === tipo && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
              ]}
              onPress={() => setFiltroTipo(tipo)}
            >
              <Text
                style={[
                  styles.filtroButtonText,
                  { color: COLORS.textLight },
                  filtroTipo === tipo && { color: COLORS.text },
                ]}
              >
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Info */}
      <View style={[styles.infoBox, { backgroundColor: COLORS.card, borderLeftColor: COLORS.accent, borderColor: COLORS.border }]}>
        <Ionicons name="information-circle" size={20} color={COLORS.accent} />
        <Text style={[styles.infoText, { color: COLORS.textLight }]}>
          Auditoría completa del sistema. Registro de todas las acciones importantes.
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
          <Text style={[styles.statNumber, { color: COLORS.text }]}>{logsFiltrados.length}</Text>
          <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Eventos</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
          <Text style={[styles.statNumber, { color: COLORS.statusOk }]}>
            {logsDemoData.filter((l) => l.tipo === 'login').length}
          </Text>
          <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Logins</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
          <Text style={[styles.statNumber, { color: COLORS.accent }]}>
            {logsDemoData.filter((l) => l.tipo === 'ot').length}
          </Text>
          <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>OTs</Text>
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={logsFiltrados}
        renderItem={renderLog}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color={COLORS.textMuted} />
            <Text style={[styles.emptyText, { color: COLORS.textMuted }]}>No hay logs para mostrar</Text>
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
  filtrosContainer: { paddingHorizontal: 15, paddingBottom: 15 },
  filtroLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  filtroButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filtroButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filtroButtonText: { fontSize: 11, fontWeight: '600' },
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
  lista: { padding: 15, paddingTop: 5, paddingBottom: 30 },
  logCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  logHeader: { flexDirection: 'row' },
  logIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logInfo: { flex: 1 },
  logAccion: { fontSize: 14, fontWeight: '600', marginBottom: 5 },
  logDetalles: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  logUsuario: { fontSize: 12, fontFamily: 'monospace' },
  logSeparator: { fontSize: 12 },
  logEmpresa: { fontSize: 12, fontWeight: '600' },
  logMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  logFecha: { fontSize: 11 },
  logIP: { fontSize: 11, fontFamily: 'monospace' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, marginTop: 15 },
});