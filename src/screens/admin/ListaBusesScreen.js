// src/screens/admin/ListaBusesScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import useAuthStore from '../../store/authStore';
import { obtenerBusesEmpresa } from '../../lib/cronograma';

export default function ListaBusesScreen({ navigation }) {
  const [buses, setBuses] = useState([]);
  const [busesFiltered, setBusesFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { empresa } = useAuthStore();

  useEffect(() => {
    cargarBuses();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setBusesFiltered(buses);
    } else {
      const filtered = buses.filter(
        (bus) =>
          bus.placa.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bus.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bus.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bus.vin.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setBusesFiltered(filtered);
    }
  }, [searchQuery, buses]);

  async function cargarBuses() {
    setLoading(true);
    try {
      const data = await obtenerBusesEmpresa(empresa.id);
      setBuses(data || []);
      setBusesFiltered(data || []);
    } catch (error) {
      console.error('Error cargando buses:', error);
    } finally {
      setLoading(false);
    }
  }

  function calcularUrgencia(km) {
    const restantes = 10000 - (km % 10000);
    if (restantes <= 500) return { nivel: 'URGENTE', color: COLORS.statusDanger };
    if (restantes <= 1000) return { nivel: 'PRÓXIMO', color: COLORS.statusWarning };
    return { nivel: 'NORMAL', color: COLORS.statusSuccess };
  }

  function renderBus({ item }) {
    const urgencia = calcularUrgencia(item.kilometraje_actual);
    const kmRestantes = 10000 - (item.kilometraje_actual % 10000);

    return (
      <TouchableOpacity
        style={styles.busCard}
        onPress={() => navigation.navigate('DetalleBus', { busId: item.id })}
      >
        <View style={styles.busHeader}>
          <View style={styles.busIconContainer}>
            <Ionicons name="bus" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.busHeaderInfo}>
            <Text style={styles.busPlaca}>{item.placa}</Text>
            <Text style={styles.busMarca}>
              {item.marca} {item.modelo} ({item.anio})
            </Text>
          </View>
          <View style={[styles.urgenciaBadge, { backgroundColor: urgencia.color }]}>
            <Text style={styles.urgenciaText}>{urgencia.nivel}</Text>
          </View>
        </View>

        <View style={styles.busInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="barcode-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.infoLabel}>VIN:</Text>
            <Text style={styles.infoValue}>{item.vin}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="speedometer-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.infoLabel}>Kilometraje:</Text>
            <Text style={styles.infoValue}>
              {item.kilometraje_actual.toLocaleString()} km
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.infoLabel}>Próximo mantenimiento:</Text>
            <Text style={[styles.infoValue, { color: urgencia.color, fontWeight: 'bold' }]}>
              {kmRestantes.toLocaleString()} km
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FLOTA DE BUSES</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por placa, marca, modelo o VIN"
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>Total: {busesFiltered.length} buses</Text>
      </View>

      <FlatList
        data={busesFiltered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBus}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarBuses} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bus-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No se encontraron buses' : 'No hay buses registrados'}
            </Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 15,
    marginTop: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: COLORS.text,
  },
  statsBar: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  statsText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
    gap: 15,
  },
  busCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  busHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  busIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  busHeaderInfo: {
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
    color: COLORS.textLight,
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
  busInfo: {
    padding: 15,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginRight: 5,
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 15,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
});
