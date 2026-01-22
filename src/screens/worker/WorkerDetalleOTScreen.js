// src/screens/worker/WorkerDetalleOTScreen.js

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import useOTsStore from '../../store/otsStore';

export default function WorkerDetalleOTScreen({ route, navigation }) {
  const { otId } = route.params;
  const { obtenerOT } = useOTsStore();
  const ot = obtenerOT(otId);

  if (!ot) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>OT no encontrada</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>{ot.numeroOT}</Text>
        <View style={styles.readOnlyBadge}>
          <Ionicons name="eye" size={16} color={COLORS.text} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Badge Solo Lectura */}
        <View style={styles.readOnlyInfo}>
          <Ionicons name="lock-closed" size={18} color={COLORS.accent} />
          <Text style={styles.readOnlyText}>Solo lectura - No se puede modificar</Text>
        </View>

        {/* Datos Básicos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS BÁSICOS</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={18} color={COLORS.textMuted} />
            <Text style={styles.infoLabel}>Fecha:</Text>
            <Text style={styles.infoValue}>
              {new Date(ot.fecha).toLocaleDateString('es-PE')}
            </Text>
          </View>
        </View>

        {/* Vehículo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VEHÍCULO</Text>
          <View style={styles.infoRow}>
            <Ionicons name="car" size={18} color={COLORS.textMuted} />
            <Text style={styles.infoLabel}>Placa:</Text>
            <Text style={styles.infoValue}>{ot.placa}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="barcode" size={18} color={COLORS.textMuted} />
            <Text style={styles.infoLabel}>VIN:</Text>
            <Text style={styles.infoValueMono}>{ot.vin}</Text>
          </View>
          {ot.kilometraje && (
            <View style={styles.infoRow}>
              <Ionicons name="speedometer" size={18} color={COLORS.accent} />
              <Text style={styles.infoLabel}>Kilometraje:</Text>
              <Text style={styles.infoValue}>
                {ot.kilometraje.toLocaleString()} km
              </Text>
            </View>
          )}
        </View>

        {/* Trabajos Realizados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRABAJOS REALIZADOS</Text>
          {ot.trabajos.map((trabajo, index) => (
            <View key={index} style={styles.trabajoItem}>
              <Ionicons
                name={trabajo.entraCronograma ? 'calendar' : 'construct'}
                size={20}
                color={trabajo.entraCronograma ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={styles.trabajoNombre}>{trabajo.nombre}</Text>
              {trabajo.entraCronograma && (
                <View style={styles.cronogramaBadge}>
                  <Text style={styles.cronogramaBadgeText}>Cronograma</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Servicios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DESCRIPCIÓN DE SERVICIOS</Text>
          <Text style={styles.serviciosText}>{ot.servicios}</Text>
        </View>

        {/* Productos */}
        {ot.productos && ot.productos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PRODUCTOS UTILIZADOS</Text>
            {ot.productos.map((producto, index) => (
              <View key={index} style={styles.productoItem}>
                <View style={styles.productoInfo}>
                  <Text style={styles.productoNombre}>{producto.nombre}</Text>
                  <Text style={styles.productoDetalle}>
                    {producto.cantidad || 0} × S/ {(producto.precio || 0).toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.productoTotal}>
                  S/ {((producto.cantidad || 0) * (producto.precio || 0)).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Precios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RESUMEN DE COSTOS</Text>
          <View style={styles.precioRow}>
            <Text style={styles.precioLabel}>Productos:</Text>
            <Text style={styles.precioValue}>S/ {(ot.precioProductos || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.precioRow}>
            <Text style={styles.precioLabel}>Servicios:</Text>
            <Text style={styles.precioValue}>S/ {(ot.precioServicios || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.precioTotalRow}>
            <Text style={styles.precioTotalLabel}>TOTAL:</Text>
            <Text style={styles.precioTotalValue}>S/ {(ot.precioTotal || 0).toFixed(2)}</Text>
          </View>
        </View>

        {/* Evidencia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EVIDENCIA FOTOGRÁFICA</Text>
          <Image source={{ uri: ot.evidencia }} style={styles.evidenciaImage} />
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
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
  scrollContent: { flex: 1 },
  content: { padding: 20 },
  readOnlyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  readOnlyText: { flex: 1, fontSize: 12, color: COLORS.textLight, fontStyle: 'italic' },
  section: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    letterSpacing: 1.5,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  infoLabel: { fontSize: 14, color: COLORS.textMuted, width: 100 },
  infoValue: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text },
  infoValueMono: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.text, fontFamily: 'monospace' },
  trabajoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  trabajoNombre: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '600' },
  cronogramaBadge: { backgroundColor: COLORS.backgroundLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  cronogramaBadgeText: { fontSize: 10, color: COLORS.accent, fontWeight: '600' },
  serviciosText: { fontSize: 14, color: COLORS.textLight, lineHeight: 20 },
  productoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  productoInfo: { flex: 1 },
  productoNombre: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 3 },
  productoDetalle: { fontSize: 12, color: COLORS.textMuted },
  productoTotal: { fontSize: 14, fontWeight: 'bold', color: COLORS.accent },
  precioRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  precioLabel: { fontSize: 14, color: COLORS.textLight },
  precioValue: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  precioTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  precioTotalLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  precioTotalValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  evidenciaImage: { width: '100%', height: 250, borderRadius: 12, backgroundColor: COLORS.backgroundLight },
  errorText: { color: COLORS.statusDanger, textAlign: 'center', marginTop: 50 },
});