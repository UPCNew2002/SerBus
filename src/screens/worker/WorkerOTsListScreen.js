// src/screens/worker/WorkerOTsListScreen.js

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import useOTsStore from '../../store/otsStore';
import useAuthStore from '../../store/authStore';

export default function WorkerOTsListScreen({ navigation }) {
  const { ots } = useOTsStore();
  const { empresa } = useAuthStore();

  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('fecha_desc');
  const [showOrdenar, setShowOrdenar] = useState(false);

  // Filtrar OTs por empresa
  const otsEmpresa = ots.filter((ot) => ot.empresaId === empresa?.id);

  // Aplicar filtros y búsqueda
  const otsFiltradas = useMemo(() => {
    let resultado = [...otsEmpresa];

    // Búsqueda por texto
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(
        (ot) =>
          ot.placa.toLowerCase().includes(busquedaLower) ||
          ot.vin.toLowerCase().includes(busquedaLower) ||
          ot.numeroOT.toLowerCase().includes(busquedaLower)
      );
    }

    // Ordenar
    switch (ordenarPor) {
      case 'fecha_desc':
        resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        break;
      case 'fecha_asc':
        resultado.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        break;
      case 'placa':
        resultado.sort((a, b) => a.placa.localeCompare(b.placa));
        break;
      default:
        break;
    }

    return resultado;
  }, [otsEmpresa, busqueda, ordenarPor]);

  const renderOT = ({ item }) => (
    <TouchableOpacity
      style={styles.otCard}
      onPress={() => navigation.navigate('WorkerDetalleOT', { otId: item.id })}
    >
      {/* Header */}
      <View style={styles.otHeader}>
        <View style={styles.otIconBox}>
          <Ionicons name="document-text" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.otHeaderInfo}>
          <Text style={styles.otNumero}>{item.numeroOT}</Text>
          <Text style={styles.otFecha}>
            {new Date(item.fecha).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.otPrecioBox}>
          <Text style={styles.otPrecioLabel}>Total</Text>
          <Text style={styles.otPrecio}>S/ {(item.precioTotal || 0).toFixed(2)}</Text>
        </View>
      </View>

      {/* Vehículo */}
      <View style={styles.otVehiculo}>
        <Ionicons name="car" size={16} color={COLORS.textMuted} />
        <Text style={styles.otPlaca}>{item.placa}</Text>
        <Text style={styles.otSeparator}>•</Text>
        <Text style={styles.otVin}>VIN: {item.vin.substring(0, 8)}...</Text>
        {item.kilometraje && (
          <>
            <Text style={styles.otSeparator}>•</Text>
            <Ionicons name="speedometer" size={14} color={COLORS.accent} />
            <Text style={styles.otKm}>{item.kilometraje.toLocaleString()} km</Text>
          </>
        )}
      </View>

      {/* Trabajos */}
      <View style={styles.otTrabajos}>
        {item.trabajos.slice(0, 2).map((trabajo, index) => (
          <View key={index} style={styles.trabajoBadge}>
            <Text style={styles.trabajoBadgeText}>
              {trabajo.entraCronograma ? '📅' : '🔧'} {trabajo.nombre}
            </Text>
          </View>
        ))}
        {item.trabajos.length > 2 && (
          <View style={styles.trabajoBadge}>
            <Text style={styles.trabajoBadgeText}>+{item.trabajos.length - 2}</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.otFooter}>
        <Image source={{ uri: item.evidencia }} style={styles.otThumbnail} />
        <View style={styles.otFooterInfo}>
          <Text style={styles.otPrecioDetalle}>
            Productos: S/ {(item.precioProductos || 0).toFixed(2)}
          </Text>
          <Text style={styles.otPrecioDetalle}>
            Servicios: S/ {(item.precioServicios || 0).toFixed(2)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>CONSULTAR OTs</Text>
        <View style={styles.readOnlyBadge}>
          <Ionicons name="eye" size={16} color={COLORS.text} />
        </View>
      </View>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por placa, VIN o número OT..."
            placeholderTextColor={COLORS.textMuted}
            value={busqueda}
            onChangeText={setBusqueda}
            autoCapitalize="characters"
          />
          {busqueda ? (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.ordenarButton}
          onPress={() => setShowOrdenar(!showOrdenar)}
        >
          <Ionicons name="swap-vertical" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Panel ordenar */}
      {showOrdenar && (
        <View style={styles.ordenarPanel}>
          <TouchableOpacity
            style={[
              styles.ordenOption,
              ordenarPor === 'fecha_desc' && styles.ordenOptionActive,
            ]}
            onPress={() => {
              setOrdenarPor('fecha_desc');
              setShowOrdenar(false);
            }}
          >
            <Text
              style={[
                styles.ordenOptionText,
                ordenarPor === 'fecha_desc' && styles.ordenOptionTextActive,
              ]}
            >
              Más recientes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.ordenOption,
              ordenarPor === 'fecha_asc' && styles.ordenOptionActive,
            ]}
            onPress={() => {
              setOrdenarPor('fecha_asc');
              setShowOrdenar(false);
            }}
          >
            <Text
              style={[
                styles.ordenOptionText,
                ordenarPor === 'fecha_asc' && styles.ordenOptionTextActive,
              ]}
            >
              Más antiguos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.ordenOption,
              ordenarPor === 'placa' && styles.ordenOptionActive,
            ]}
            onPress={() => {
              setOrdenarPor('placa');
              setShowOrdenar(false);
            }}
          >
            <Text
              style={[
                styles.ordenOptionText,
                ordenarPor === 'placa' && styles.ordenOptionTextActive,
              ]}
            >
              Por placa
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{otsFiltradas.length}</Text>
          <Text style={styles.statLabel}>OTs Registradas</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.accent }]}>
            S/{' '}
            {otsFiltradas
              .reduce((sum, ot) => sum + (ot.precioTotal || 0), 0)
              .toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Total Facturado</Text>
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={otsFiltradas}
        renderItem={renderOT}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No se encontraron OTs</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, letterSpacing: 1.5 },
  readOnlyBadge: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: { flexDirection: 'row', padding: 15, gap: 10 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  ordenarButton: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ordenarPanel: {
    backgroundColor: COLORS.card,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  ordenOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundLight,
  },
  ordenOptionActive: { backgroundColor: COLORS.primary },
  ordenOptionText: { fontSize: 14, color: COLORS.textLight, textAlign: 'center' },
  ordenOptionTextActive: { color: COLORS.text, fontWeight: '600' },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 15, paddingBottom: 15, gap: 10 },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 5, textAlign: 'center' },
  lista: { padding: 15, paddingTop: 5, paddingBottom: 30 },
  otCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  otHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  otIconBox: {
    width: 45,
    height: 45,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  otHeaderInfo: { flex: 1 },
  otNumero: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 3 },
  otFecha: { fontSize: 12, color: COLORS.textMuted },
  otPrecioBox: { alignItems: 'flex-end' },
  otPrecioLabel: { fontSize: 10, color: COLORS.textMuted, marginBottom: 2 },
  otPrecio: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  otVehiculo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  otPlaca: { fontSize: 13, fontWeight: '600', color: COLORS.textLight },
  otSeparator: { fontSize: 12, color: COLORS.textMuted },
  otVin: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace' },
  otKm: { fontSize: 12, fontWeight: '600', color: COLORS.accent },
  otTrabajos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  trabajoBadge: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trabajoBadgeText: { fontSize: 11, color: COLORS.textLight, fontWeight: '600' },
  otFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  otThumbnail: { width: 60, height: 45, borderRadius: 8, backgroundColor: COLORS.backgroundLight },
  otFooterInfo: { flex: 1, gap: 5 },
  otPrecioDetalle: { fontSize: 11, color: COLORS.textMuted },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: COLORS.textMuted, marginTop: 15 },
});