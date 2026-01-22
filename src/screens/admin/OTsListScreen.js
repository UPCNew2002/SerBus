// src/screens/admin/OTsListScreen.js
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import useOTsStore from '../../store/otsStore';
import useAuthStore from '../../store/authStore';
import { obtenerOTsEmpresa } from '../../lib/cronograma';
 
export default function OTsListScreen({ navigation }) {
  const { ots: otsLocal } = useOTsStore();
  const { empresa } = useAuthStore();
 
  // Estados
  const [otsSupabase, setOtsSupabase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('fecha_desc');
 
  useEffect(() => {
    cargarOTs();
  }, []);
 
  async function cargarOTs() {
    setLoading(true);
    try {
      const data = await obtenerOTsEmpresa(empresa.id);
      setOtsSupabase(data || []);
    } catch (error) {
      console.error('Error cargando OTs:', error);
    } finally {
      setLoading(false);
    }
  }
 
  // Combinar OTs de Supabase con OTs locales (por si registraron alguna sin guardar)
  const otsEmpresa = [
   ...otsSupabase.map(ot => {
      // Parsear observaciones JSON si existe
      let datosAdicionales = {
        servicios: '',
        productos: [],
        precioProductos: 0,
        precioServicios: 0,
        precioTotal: 0,
        evidencia: null,
      };
 
      if (ot.observaciones) {
        try {
          // Intentar parsear como JSON (OTs nuevas)
          datosAdicionales = JSON.parse(ot.observaciones);
        } catch (error) {
          // Si falla, es texto simple (OTs de prueba antiguas)
          // No hacer nada, usar valores por defecto
        }
      }
 
      return {
        id: ot.id,
        numeroOT: ot.numero_ot || '',
        fecha: ot.fecha_inicio || '',
        placa: ot.buses?.placa || 'N/A',
        vin: ot.buses?.vin || 'N/A',
        estado: ot.estado || 'pendiente',
        trabajador: ot.perfiles?.nombre || 'N/A',
        marca: ot.buses?.marca || '',
        modelo: ot.buses?.modelo || '',
        kilometraje: ot.kilometraje || 0,
        trabajos: (ot.ots_trabajos || []).map(otTrabajo => ({
          id: otTrabajo.trabajos?.id,
          nombre: otTrabajo.trabajos?.nombre || 'Trabajo',
          entraCronograma: false, // Por ahora siempre false, se puede mejorar después
        })),
        precioProductos: datosAdicionales.precioProductos || 0,
        precioServicios: datosAdicionales.precioServicios || 0,
        evidencia: datosAdicionales.evidencia || null,
        precioTotal: datosAdicionales.precioTotal || 0,
        fromSupabase: true,
      };
    }),
    ...otsLocal.filter(ot => ot.empresaId === empresa?.id && !ot.fromSupabase)
  ];

  // Aplicar filtros y búsqueda
  const otsFiltradas = useMemo(() => {
    let resultado = [...otsEmpresa];

    // Búsqueda por texto (Placa, VIN, Número OT)
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(
        (ot) =>
          (ot.placa || '').toLowerCase().includes(busquedaLower) ||
          (ot.vin || '').toLowerCase().includes(busquedaLower) ||
          (ot.numeroOT || '').toLowerCase().includes(busquedaLower)
      );
    }

    // Filtro por rango de fechas
    if (filtroFechaDesde) {
      resultado = resultado.filter((ot) => ot.fecha >= filtroFechaDesde);
    }
    if (filtroFechaHasta) {
      resultado = resultado.filter((ot) => ot.fecha <= filtroFechaHasta);
    }

    // Ordenar
    switch (ordenarPor) {
      case 'fecha_desc':
        resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        break;
      case 'fecha_asc':
        resultado.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        break;
      case 'precio_desc':
        resultado.sort((a, b) => (b.precioTotal || 0) - (a.precioTotal || 0));
        break;
      case 'precio_asc':
        resultado.sort((a, b) => (a.precioTotal || 0) - (b.precioTotal || 0));
        break;
      case 'placa':
        resultado.sort((a, b) => a.placa.localeCompare(b.placa));
        break;
      default:
        break;
    }

    return resultado;
  }, [otsEmpresa, busqueda, filtroFechaDesde, filtroFechaHasta, ordenarPor]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setOrdenarPor('fecha_desc');
  };

  // Contar filtros activos
  const filtrosActivos =
    (busqueda ? 1 : 0) +
    (filtroFechaDesde ? 1 : 0) +
    (filtroFechaHasta ? 1 : 0) +
    (ordenarPor !== 'fecha_desc' ? 1 : 0);

  const renderOT = ({ item }) => (
    <TouchableOpacity
      style={styles.otCard}
      onPress={() => navigation.navigate('DetalleOT', { otId: item.id })}
    >
      {/* Header de la OT */}
      <View style={styles.otHeader}>
        <View style={styles.otIconBox}>
          <Ionicons name="document-text" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.otHeaderInfo}>
          <Text style={styles.otNumero}>{item.numeroOT || 'N/A'}</Text>
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
        <Text style={styles.otPlaca}>{item.placa || 'N/A'}</Text>
        <Text style={styles.otSeparator}>•</Text>
        <Text style={styles.otVin}>VIN: {(item.vin || 'N/A').substring(0, 8)}...</Text>
        {item.kilometraje > 0 && (
          <>
            <Text style={styles.otSeparator}>•</Text>
            <Ionicons name="speedometer" size={14} color={COLORS.accent} />
            <Text style={styles.otKm}>{item.kilometraje.toLocaleString()} km</Text>
          </>
        )}
      </View>
 
      {/* Trabajos realizados */}
      <View style={styles.otTrabajos}>
        {(item.trabajos || []).slice(0, 2).map((trabajo, index) => (
          <View key={index} style={styles.trabajoBadge}>
            <Text style={styles.trabajoBadgeText}>
              {trabajo.entraCronograma ? '📅' : '🔧'} {trabajo.nombre || 'Trabajo'}
            </Text>
          </View>
        ))}
        {(item.trabajos || []).length > 2 && (
          <View style={styles.trabajoBadge}>
            <Text style={styles.trabajoBadgeText}>+{(item.trabajos || []).length - 2}</Text>

          </View>
        )}
      </View>

      {/* Footer con foto */}
      <View style={styles.otFooter}>
        {item.evidencia ? (
          <Image source={{ uri: item.evidencia }} style={styles.otThumbnail} />
        ) : (
          <View style={[styles.otThumbnail, { justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="image-outline" size={24} color={COLORS.textMuted} />
          </View>
        )}
        <View style={styles.otFooterInfo}>
          <View style={styles.otPreciosRow}>
            <Text style={styles.otPrecioDetalle}>
              Productos: S/ {(item.precioProductos || 0).toFixed(2)}
            </Text>
            <Text style={styles.otPrecioDetalle}>
              Servicios: S/ {(item.precioServicios || 0).toFixed(2)}
            </Text>
          </View>
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
        <Text style={styles.headerTitle}>ÓRDENES DE TRABAJO</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('RegistrarOT')}
        >
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda */}
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
          style={styles.filtrosButton}
          onPress={() => setShowFiltros(!showFiltros)}
        >
          <Ionicons name="filter" size={20} color={COLORS.text} />
          {filtrosActivos > 0 && (
            <View style={styles.filtroBadge}>
              <Text style={styles.filtroBadgeText}>{filtrosActivos}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Panel de filtros */}
      {showFiltros && (
        <View style={styles.filtrosPanel}>
          <Text style={styles.filtrosTitulo}>FILTROS Y ORDEN</Text>

          {/* Rango de fechas */}
          <View style={styles.filtroGroup}>
            <Text style={styles.filtroLabel}>RANGO DE FECHAS</Text>
            <View style={styles.fechasRow}>
              <View style={styles.fechaInput}>
                <Text style={styles.fechaPlaceholder}>Desde:</Text>
                <TextInput
                  style={styles.fechaText}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor={COLORS.textMuted}
                  value={filtroFechaDesde}
                  onChangeText={setFiltroFechaDesde}
                />
              </View>
              <View style={styles.fechaInput}>
                <Text style={styles.fechaPlaceholder}>Hasta:</Text>
                <TextInput
                  style={styles.fechaText}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor={COLORS.textMuted}
                  value={filtroFechaHasta}
                  onChangeText={setFiltroFechaHasta}
                />
              </View>
            </View>
          </View>

          {/* Ordenar por */}
          <View style={styles.filtroGroup}>
            <Text style={styles.filtroLabel}>ORDENAR POR</Text>
            <View style={styles.ordenOptions}>
              <TouchableOpacity
                style={[
                  styles.ordenButton,
                  ordenarPor === 'fecha_desc' && styles.ordenButtonActive,
                ]}
                onPress={() => setOrdenarPor('fecha_desc')}
              >
                <Text
                  style={[
                    styles.ordenButtonText,
                    ordenarPor === 'fecha_desc' && styles.ordenButtonTextActive,
                  ]}
                >
                  Más recientes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ordenButton,
                  ordenarPor === 'fecha_asc' && styles.ordenButtonActive,
                ]}
                onPress={() => setOrdenarPor('fecha_asc')}
              >
                <Text
                  style={[
                    styles.ordenButtonText,
                    ordenarPor === 'fecha_asc' && styles.ordenButtonTextActive,
                  ]}
                >
                  Más antiguos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ordenButton,
                  ordenarPor === 'precio_desc' && styles.ordenButtonActive,
                ]}
                onPress={() => setOrdenarPor('precio_desc')}
              >
                <Text
                  style={[
                    styles.ordenButtonText,
                    ordenarPor === 'precio_desc' && styles.ordenButtonTextActive,
                  ]}
                >
                  Mayor precio
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ordenButton,
                  ordenarPor === 'placa' && styles.ordenButtonActive,
                ]}
                onPress={() => setOrdenarPor('placa')}
              >
                <Text
                  style={[
                    styles.ordenButtonText,
                    ordenarPor === 'placa' && styles.ordenButtonTextActive,
                  ]}
                >
                  Por placa
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.limpiarButton} onPress={limpiarFiltros}>
            <Ionicons name="refresh" size={18} color={COLORS.text} />
            <Text style={styles.limpiarButtonText}>Limpiar Filtros</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{otsFiltradas.length}</Text>
          <Text style={styles.statLabel}>
            {busqueda || filtroFechaDesde || filtroFechaHasta ? 'Filtradas' : 'Total OTs'}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.statusOk }]}>
            {otsFiltradas.filter((ot) =>
              ot.trabajos.some((t) => t.entraCronograma)
            ).length}
          </Text>
          <Text style={styles.statLabel}>Con Cronograma</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.accent }]}>
            S/{' '}
            {otsFiltradas
              .reduce((sum, ot) => sum + (ot.precioTotal || 0), 0)
              .toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Lista de OTs */}
      <FlatList
        data={otsFiltradas}
        renderItem={renderOT}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarOTs} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={busqueda || filtrosActivos ? 'search-outline' : 'document-text-outline'}
              size={60}
              color={COLORS.textMuted}
            />
            <Text style={styles.emptyText}>
              {busqueda || filtrosActivos
                ? 'No se encontraron OTs con esos filtros'
                : 'No hay OTs registradas'}
            </Text>
            {(busqueda || filtrosActivos) ? (
              <TouchableOpacity style={styles.emptyButton} onPress={limpiarFiltros}>
                <Text style={styles.emptyButtonText}>Limpiar Filtros</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('RegistrarOT')}
              >
                <Text style={styles.emptyButtonText}>Registrar Primera OT</Text>
              </TouchableOpacity>
            )}
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
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
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
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  filtrosButton: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  filtroBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtroBadgeText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: 'bold',
  },
  filtrosPanel: {
    backgroundColor: COLORS.card,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filtrosTitulo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    letterSpacing: 1.5,
  },
  filtroGroup: {
    marginBottom: 15,
  },
  filtroLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 10,
    letterSpacing: 1,
  },
  fechasRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fechaInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fechaPlaceholder: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 5,
  },
  fechaText: {
    fontSize: 13,
    color: COLORS.text,
  },
  ordenOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ordenButton: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ordenButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  ordenButtonText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  ordenButtonTextActive: {
    color: COLORS.text,
  },
  limpiarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.metal,
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  limpiarButtonText: {
    fontSize: 13,
    fontWeight: '600',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 5,
    textAlign: 'center',
  },
  lista: {
    padding: 15,
    paddingTop: 5,
    paddingBottom: 30,
  },
  otCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  otHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  otIconBox: {
    width: 45,
    height: 45,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  otHeaderInfo: {
    flex: 1,
  },
  otNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 3,
  },
  otFecha: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  otPrecioBox: {
    alignItems: 'flex-end',
  },
  otPrecioLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  otPrecio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  otVehiculo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  otPlaca: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  otSeparator: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  otVin: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  otKm: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },
  otTrabajos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  trabajoBadge: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trabajoBadgeText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  otFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  otThumbnail: {
    width: 60,
    height: 45,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundLight,
  },
  otFooterInfo: {
    flex: 1,
  },
  otPreciosRow: {
    gap: 8,
  },
  otPrecioDetalle: {
    fontSize: 11,
    color: COLORS.textMuted,
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
    textAlign: 'center',
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
});