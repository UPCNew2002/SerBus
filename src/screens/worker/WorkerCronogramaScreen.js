// src/screens/worker/WorkerCronogramaScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import useAuthStore from '../../store/authStore';
import { busesNecesitanMantenimiento } from '../../lib/cronograma';

export default function WorkerCronogramaScreen({ navigation }) {
  const { empresa } = useAuthStore();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroUrgencia, setFiltroUrgencia] = useState('todos');

  useEffect(() => {
    cargarCronograma();
  }, []);

  async function cargarCronograma() {
    setLoading(true);
    try {
      const data = await busesNecesitanMantenimiento(empresa.id);
      setBuses(data || []);
    } catch (error) {
      console.error('Error cargando cronograma:', error);
    } finally {
      setLoading(false);
    }
  }

  // Aplicar filtros
  const busesFiltrados = buses.filter((bus) => {
    // Filtro por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      const coincide =
        (bus.placa || '').toLowerCase().includes(busquedaLower) ||
        (bus.marca || '').toLowerCase().includes(busquedaLower) ||
        (bus.modelo || '').toLowerCase().includes(busquedaLower);
      if (!coincide) return false;
    }

    // Filtro por urgencia
    if (filtroUrgencia !== 'todos') {
      if (bus.urgencia !== filtroUrgencia) return false;
    }

    return true;
  });

  // Estadísticas
  const stats = {
    urgentes: buses.filter((b) => b.urgencia === 'URGENTE').length,
    proximos: buses.filter((b) => b.urgencia === 'PRÓXIMO').length,
    total: buses.length,
  };

  const renderBus = ({ item }) => {
    const urgenciaColor = {
      URGENTE: COLORS.statusDanger,
      PRÓXIMO: COLORS.statusWarning,
      NORMAL: COLORS.statusSuccess,
    };

    return (
      <TouchableOpacity style={styles.busCard}>
        {/* Header */}
        <View style={styles.busHeader}>
          <View style={styles.busIconBox}>
            <Ionicons name="bus" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.busInfo}>
            <Text style={styles.busPlaca}>{item.placa}</Text>
            <Text style={styles.busMarca}>
              {item.marca} {item.modelo}
            </Text>
          </View>
          <View
            style={[
              styles.urgenciaBadge,
              { backgroundColor: urgenciaColor[item.urgencia] },
            ]}
          >
            <Text style={styles.urgenciaText}>{item.urgencia}</Text>
          </View>
        </View>

        {/* Kilometraje */}
        <View style={styles.kmRow}>
          <View style={styles.kmBox}>
            <Text style={styles.kmLabel}>Actual</Text>
            <View style={styles.kmValueRow}>
              <Ionicons name="speedometer" size={16} color={COLORS.accent} />
              <Text style={styles.kmValue}>
                {item.kilometraje_actual?.toLocaleString()} km
              </Text>
            </View>
          </View>

          <View style={styles.kmArrow}>
            <Ionicons name="arrow-forward" size={16} color={COLORS.textMuted} />
          </View>

          <View style={styles.kmBox}>
            <Text style={styles.kmLabel}>Próximo Mant.</Text>
            <View style={styles.kmValueRow}>
              <Ionicons name="construct" size={16} color={COLORS.primary} />
              <Text style={styles.kmValue}>
                {item.km_proximo_mantenimiento?.toLocaleString()} km
              </Text>
            </View>
          </View>
        </View>

        {/* Restantes */}
        <View style={styles.restantesBox}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.max(
                    0,
                    Math.min(100, (item.km_restantes / 10000) * 100)
                  )}%`,
                  backgroundColor: urgenciaColor[item.urgencia],
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.restantesText,
              { color: urgenciaColor[item.urgencia] },
            ]}
          >
            {item.km_restantes > 0
              ? `${item.km_restantes.toLocaleString()} km restantes`
              : 'Mantenimiento vencido'}
          </Text>
        </View>

        {/* Próximo trabajo */}
        {item.proximo_trabajo && (
          <View style={styles.trabajoBox}>
            <Ionicons name="construct" size={14} color={COLORS.textMuted} />
            <Text style={styles.trabajoText}>{item.proximo_trabajo}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CRONOGRAMA</Text>
        <View style={styles.readOnlyBadge}>
          <Ionicons name="eye" size={16} color={COLORS.text} />
        </View>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.urgentes}</Text>
          <Text style={styles.statLabel}>Urgentes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.proximos}</Text>
          <Text style={styles.statLabel}>Próximos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por placa, marca..."
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
      </View>

      {/* Filtros de urgencia */}
      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[
            styles.filtroButton,
            filtroUrgencia === 'todos' && styles.filtroButtonActive,
          ]}
          onPress={() => setFiltroUrgencia('todos')}
        >
          <Text
            style={[
              styles.filtroButtonText,
              filtroUrgencia === 'todos' && styles.filtroButtonTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroButton,
            filtroUrgencia === 'URGENTE' && styles.filtroButtonActive,
          ]}
          onPress={() => setFiltroUrgencia('URGENTE')}
        >
          <Text
            style={[
              styles.filtroButtonText,
              filtroUrgencia === 'URGENTE' && styles.filtroButtonTextActive,
            ]}
          >
            Urgentes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroButton,
            filtroUrgencia === 'PRÓXIMO' && styles.filtroButtonActive,
          ]}
          onPress={() => setFiltroUrgencia('PRÓXIMO')}
        >
          <Text
            style={[
              styles.filtroButtonText,
              filtroUrgencia === 'PRÓXIMO' && styles.filtroButtonTextActive,
            ]}
          >
            Próximos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de buses */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando cronograma...</Text>
        </View>
      ) : busesFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>
            {busqueda || filtroUrgencia !== 'todos'
              ? 'No se encontraron buses'
              : 'No hay buses en el cronograma'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={busesFiltrados}
          keyExtractor={(item) => item.id?.toString() || item.placa}
          renderItem={renderBus}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={cargarCronograma}
              tintColor={COLORS.primary}
            />
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
  readOnlyBadge: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  filtrosContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
    gap: 10,
  },
  filtroButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  filtroButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filtroButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  filtroButtonTextActive: {
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  listContent: {
    padding: 15,
    gap: 15,
  },
  busCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  busHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  busIconBox: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  busInfo: {
    flex: 1,
  },
  busPlaca: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 3,
  },
  busMarca: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  urgenciaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  urgenciaText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  kmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  kmBox: {
    flex: 1,
  },
  kmLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 5,
  },
  kmValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  kmValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  kmArrow: {
    paddingHorizontal: 5,
  },
  restantesBox: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  restantesText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  trabajoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  trabajoText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
