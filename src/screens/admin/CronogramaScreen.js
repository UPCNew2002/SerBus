// src/screens/admin/CronogramaScreen.js

import React, { useState, useMemo } from 'react';
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
import { COLORS } from '../../constants/colors';
import useBusesStore from '../../store/busesStore';
import useOTsStore from '../../store/otsStore';
import useTrabajosStore from '../../store/trabajosStore';
import useAuthStore from '../../store/authStore';
import {
  calcularCronogramaBus,
  getEstadoColor,
  getEstadoIcono,
  getEstadoTexto,
} from '../../utils/cronogramaUtils';

export default function CronogramaScreen({ navigation }) {
  const { buses } = useBusesStore();
  const { ots } = useOTsStore();
  const { trabajos } = useTrabajosStore();
  const { empresa } = useAuthStore();

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // todos, vencido, proximo, ok

  // Filtrar buses por empresa
  const busesEmpresa = buses.filter((bus) => bus.empresaId === empresa?.id);

  // Calcular cronograma para todos los buses
  const cronogramaCompleto = useMemo(() => {
    return busesEmpresa.map((bus) => ({
      bus,
      mantenimientos: calcularCronogramaBus(bus, ots, trabajos),
    }));
  }, [busesEmpresa, ots, trabajos]);

  // Aplicar filtros
  const cronogramaFiltrado = useMemo(() => {
    let resultado = [...cronogramaCompleto];

    // Buscar por placa
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter((item) =>
        item.bus.placa.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter((item) =>
        item.mantenimientos.some((m) => m.estado === filtroEstado)
      );
    }

    return resultado;
  }, [cronogramaCompleto, busqueda, filtroEstado]);

  // Estadísticas
  const stats = useMemo(() => {
    let totalVencidos = 0;
    let totalProximos = 0;
    let totalOk = 0;

    cronogramaCompleto.forEach((item) => {
      item.mantenimientos.forEach((m) => {
        if (m.estado === 'vencido') totalVencidos++;
        else if (m.estado === 'proximo') totalProximos++;
        else if (m.estado === 'ok') totalOk++;
      });
    });

    return { totalVencidos, totalProximos, totalOk };
  }, [cronogramaCompleto]);

  const renderBus = ({ item }) => (
    <View style={styles.busCard}>
      {/* Header del bus */}
      <View style={styles.busHeader}>
        <View style={styles.busIconBox}>
          <Ionicons name="bus" size={28} color={COLORS.primary} />
        </View>
        <View style={styles.busInfo}>
          <Text style={styles.busPlaca}>{item.bus.placa}</Text>
          <View style={styles.busKmRow}>
            <Ionicons name="speedometer" size={14} color={COLORS.accent} />
            <Text style={styles.busKm}>
              {item.bus.kilometrajeActual.toLocaleString()} km
            </Text>
          </View>
        </View>
        <View style={styles.busBadges}>
          {item.mantenimientos.filter((m) => m.estado === 'vencido').length > 0 && (
            <View style={[styles.badge, { backgroundColor: COLORS.statusDanger }]}>
              <Text style={styles.badgeText}>
                {item.mantenimientos.filter((m) => m.estado === 'vencido').length} 🔴
              </Text>
            </View>
          )}
          {item.mantenimientos.filter((m) => m.estado === 'proximo').length > 0 && (
            <View style={[styles.badge, { backgroundColor: COLORS.statusWarning }]}>
              <Text style={styles.badgeText}>
                {item.mantenimientos.filter((m) => m.estado === 'proximo').length} 🟡
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Mantenimientos */}
      {item.mantenimientos.length > 0 ? (
        <View style={styles.mantenimientosContainer}>
          {item.mantenimientos.map((mant, index) => (
            <View
              key={index}
              style={[
                styles.mantenimientoItem,
                { borderLeftColor: getEstadoColor(mant.estado) },
              ]}
            >
              <View style={styles.mantenimientoHeader}>
                <Ionicons
                  name={getEstadoIcono(mant.estado)}
                  size={18}
                  color={getEstadoColor(mant.estado)}
                />
                <Text style={styles.mantenimientoNombre}>{mant.trabajo}</Text>
                <View
                  style={[
                    styles.estadoBadge,
                    { backgroundColor: getEstadoColor(mant.estado) },
                  ]}
                >
                  <Text style={styles.estadoText}>{getEstadoTexto(mant.estado)}</Text>
                </View>
              </View>

              <View style={styles.mantenimientoInfo}>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={14} color={COLORS.textMuted} />
                  <Text style={styles.infoText}>
                    Próximo: {new Date(mant.proximaFechaPorDias).toLocaleDateString('es-PE')}
                    {mant.diasRestantes >= 0 ? (
                      <Text style={{ color: getEstadoColor(mant.estado) }}>
                        {' '}
                        (en {mant.diasRestantes} días)
                      </Text>
                    ) : (
                      <Text style={{ color: COLORS.statusDanger }}>
                        {' '}
                        (vencido hace {Math.abs(mant.diasRestantes)} días)
                      </Text>
                    )}
                  </Text>
                </View>
                {mant.ultimaOTKm > 0 && (
                  <View style={styles.infoRow}>
                    <Ionicons name="speedometer" size={14} color={COLORS.textMuted} />
                    <Text style={styles.infoText}>
                      Próximo: {mant.proximoKmPorKm.toLocaleString()} km
                      <Text style={{ color: getEstadoColor(mant.estado) }}>
                        {' '}
                        (faltan {mant.kmRestantes.toLocaleString()} km)
                      </Text>
                    </Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Ionicons name="time" size={14} color={COLORS.textMuted} />
                  <Text style={styles.infoText}>
                    Última vez: {new Date(mant.ultimaOTFecha).toLocaleDateString('es-PE')}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.sinDatos}>
          <Ionicons name="information-circle" size={20} color={COLORS.textMuted} />
          <Text style={styles.sinDatosText}>
            Sin datos de mantenimiento preventivo
          </Text>
        </View>
      )}
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
        <Text style={styles.headerTitle}>CRONOGRAMA</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por placa..."
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

      {/* Filtros de estado */}
      <View style={styles.filtrosEstado}>
        <TouchableOpacity
          style={[
            styles.filtroEstadoButton,
            filtroEstado === 'todos' && styles.filtroEstadoButtonActive,
          ]}
          onPress={() => setFiltroEstado('todos')}
        >
          <Text
            style={[
              styles.filtroEstadoText,
              filtroEstado === 'todos' && styles.filtroEstadoTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filtroEstadoButton,
            filtroEstado === 'vencido' && styles.filtroEstadoButtonActive,
            { borderColor: COLORS.statusDanger },
          ]}
          onPress={() => setFiltroEstado('vencido')}
        >
          <Text
            style={[
              styles.filtroEstadoText,
              filtroEstado === 'vencido' && styles.filtroEstadoTextActive,
            ]}
          >
            🔴 Vencidos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filtroEstadoButton,
            filtroEstado === 'proximo' && styles.filtroEstadoButtonActive,
            { borderColor: COLORS.statusWarning },
          ]}
          onPress={() => setFiltroEstado('proximo')}
        >
          <Text
            style={[
              styles.filtroEstadoText,
              filtroEstado === 'proximo' && styles.filtroEstadoTextActive,
            ]}
          >
            🟡 Próximos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filtroEstadoButton,
            filtroEstado === 'ok' && styles.filtroEstadoButtonActive,
            { borderColor: COLORS.statusOk },
          ]}
          onPress={() => setFiltroEstado('ok')}
        >
          <Text
            style={[
              styles.filtroEstadoText,
              filtroEstado === 'ok' && styles.filtroEstadoTextActive,
            ]}
          >
            🟢 Al día
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.statusDanger }]}>
            {stats.totalVencidos}
          </Text>
          <Text style={styles.statLabel}>Vencidos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.statusWarning }]}>
            {stats.totalProximos}
          </Text>
          <Text style={styles.statLabel}>Próximos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.statusOk }]}>
            {stats.totalOk}
          </Text>
          <Text style={styles.statLabel}>Al día</Text>
        </View>
      </View>

      {/* Lista de buses */}
      <FlatList
        data={cronogramaFiltrado}
        renderItem={renderBus}
        keyExtractor={(item) => item.bus.id.toString()}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No hay datos de cronograma</Text>
            <Text style={styles.emptySubtext}>
              Registra OTs con kilometraje y trabajos de cronograma
            </Text>
          </View>
        }
      />
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
  searchContainer: {
    padding: 15,
  },
  searchBox: {
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
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  filtrosEstado: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
    gap: 8,
  },
  filtroEstadoButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  filtroEstadoButtonActive: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.primary,
  },
  filtroEstadoText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filtroEstadoTextActive: {
    color: COLORS.text,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 5,
  },
  lista: {
    padding: 15,
    paddingTop: 0,
    paddingBottom: 30,
  },
  busCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  busHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  busIconBox: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  busInfo: {
    flex: 1,
  },
  busPlaca: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  busKmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  busKm: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
  },
  busBadges: {
    flexDirection: 'row',
    gap: 5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mantenimientosContainer: {
    gap: 12,
  },
  mantenimientoItem: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
  },
  mantenimientoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  mantenimientoNombre: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  estadoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mantenimientoInfo: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textLight,
    flex: 1,
  },
  sinDatos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 15,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
  },
  sinDatosText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 15,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});