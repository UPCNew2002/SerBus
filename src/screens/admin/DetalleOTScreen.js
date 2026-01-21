// src/screens/admin/DetalleOTScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { obtenerOTCompleta } from '../../lib/cronograma';

export default function DetalleOTScreen({ route, navigation }) {
  const { otId } = route.params;
  const [ot, setOt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDetalle();
  }, [otId]);

  async function cargarDetalle() {
    setLoading(true);
    try {
      const data = await obtenerOTCompleta(otId);
      if (data) {
        // Parsear observaciones
        let datosAdicionales = {
          servicios: '',
          productos: [],
          precioProductos: 0,
          precioServicios: 0,
          precioTotal: 0,
          evidencia: null,
        };

        if (data.observaciones) {
          try {
            datosAdicionales = JSON.parse(data.observaciones);
          } catch (error) {
            // Texto simple
          }
        }

        setOt({ ...data, datosAdicionales });
      } else {
        Alert.alert('Error', 'No se pudo cargar la OT');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error cargando detalle OT:', error);
      Alert.alert('Error', 'Error al cargar la OT');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando OT...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ot) {
    return null;
  }

  const estadoColor = {
    pendiente: COLORS.statusWarning,
    en_proceso: COLORS.accent,
    completado: COLORS.statusSuccess,
    cancelado: COLORS.statusDanger,
  };

  const estadoTexto = {
    pendiente: 'Pendiente',
    en_proceso: 'En Proceso',
    completado: 'Completado',
    cancelado: 'Cancelado',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>DETALLE DE OT</Text>
          <Text style={styles.headerSubtitle}>{ot.numero_ot}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estado */}
        <View style={[styles.estadoBadge, { backgroundColor: estadoColor[ot.estado] }]}>
          <Text style={styles.estadoText}>{estadoTexto[ot.estado]}</Text>
        </View>

        {/* Información del Bus */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VEHÍCULO</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.iconBox}>
                <Ionicons name="bus" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Placa</Text>
                <Text style={styles.cardValue}>{ot.buses?.placa || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.cardRow}>
              <View style={styles.iconBox}>
                <Ionicons name="barcode" size={20} color={COLORS.textMuted} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>VIN</Text>
                <Text style={styles.cardValue}>{ot.buses?.vin || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.cardRow}>
              <View style={styles.iconBox}>
                <Ionicons name="car-sport" size={20} color={COLORS.textMuted} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Marca y Modelo</Text>
                <Text style={styles.cardValue}>
                  {ot.buses?.marca} {ot.buses?.modelo} ({ot.buses?.anio})
                </Text>
              </View>
            </View>

            {ot.kilometraje > 0 && (
              <>
                <View style={styles.separator} />
                <View style={styles.cardRow}>
                  <View style={styles.iconBox}>
                    <Ionicons name="speedometer" size={20} color={COLORS.accent} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardLabel}>Kilometraje</Text>
                    <Text style={styles.cardValue}>{ot.kilometraje?.toLocaleString()} km</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Fechas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FECHAS</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.iconBox}>
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Fecha de Inicio</Text>
                <Text style={styles.cardValue}>
                  {new Date(ot.fecha_inicio).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            {ot.fecha_fin && (
              <>
                <View style={styles.separator} />
                <View style={styles.cardRow}>
                  <View style={styles.iconBox}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.statusSuccess} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardLabel}>Fecha de Finalización</Text>
                    <Text style={styles.cardValue}>
                      {new Date(ot.fecha_fin).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Trabajador */}
        {ot.perfiles && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TRABAJADOR ASIGNADO</Text>
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="person" size={20} color={COLORS.accent} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardValue}>{ot.perfiles.nombre}</Text>
                  <Text style={styles.cardLabel}>@{ot.perfiles.username}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Trabajos Realizados */}
        {ot.ots_trabajos && ot.ots_trabajos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TRABAJOS REALIZADOS</Text>
            <View style={styles.card}>
              {ot.ots_trabajos.map((otTrabajo, index) => (
                <View key={otTrabajo.id}>
                  {index > 0 && <View style={styles.separator} />}
                  <View style={styles.trabajoItem}>
                    <View style={styles.trabajoHeader}>
                      <Ionicons name="construct" size={18} color={COLORS.primary} />
                      <Text style={styles.trabajoNombre}>
                        {otTrabajo.trabajos?.nombre || 'Trabajo'}
                      </Text>
                    </View>
                    {otTrabajo.trabajos?.descripcion && (
                      <Text style={styles.trabajoDescripcion}>
                        {otTrabajo.trabajos.descripcion}
                      </Text>
                    )}
                    {otTrabajo.notas && (
                      <Text style={styles.trabajoNotas}>📝 {otTrabajo.notas}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Descripción de Servicios */}
        {ot.datosAdicionales?.servicios && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DESCRIPCIÓN DE SERVICIOS</Text>
            <View style={styles.card}>
              <Text style={styles.descripcionText}>{ot.datosAdicionales.servicios}</Text>
            </View>
          </View>
        )}

        {/* Productos */}
        {ot.datosAdicionales?.productos && ot.datosAdicionales.productos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PRODUCTOS UTILIZADOS</Text>
            <View style={styles.card}>
              {ot.datosAdicionales.productos.map((producto, index) => (
                <View key={index}>
                  {index > 0 && <View style={styles.separator} />}
                  <View style={styles.productoItem}>
                    <View style={styles.productoHeader}>
                      <Text style={styles.productoNombre}>{producto.nombre}</Text>
                      <Text style={styles.productoTotal}>
                        S/ {(producto.cantidad * producto.precio).toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.productoDetalle}>
                      Cantidad: {producto.cantidad} × S/ {producto.precio.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Precios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COSTOS</Text>
          <View style={styles.card}>
            <View style={styles.precioRow}>
              <Text style={styles.precioLabel}>Productos</Text>
              <Text style={styles.precioValue}>
                S/ {(ot.datosAdicionales?.precioProductos || 0).toFixed(2)}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.precioRow}>
              <Text style={styles.precioLabel}>Servicios (Mano de Obra)</Text>
              <Text style={styles.precioValue}>
                S/ {(ot.datosAdicionales?.precioServicios || 0).toFixed(2)}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.precioRow}>
              <Text style={styles.precioLabelTotal}>TOTAL</Text>
              <Text style={styles.precioValueTotal}>
                S/ {(ot.datosAdicionales?.precioTotal || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Evidencia */}
        {ot.datosAdicionales?.evidencia && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EVIDENCIA FOTOGRÁFICA</Text>
            <View style={styles.card}>
              <Image
                source={{ uri: ot.datosAdicionales.evidencia }}
                style={styles.evidenciaImage}
                resizeMode="cover"
              />
            </View>
          </View>
        )}

        {/* Observaciones (texto simple) */}
        {typeof ot.observaciones === 'string' &&
          !ot.observaciones.startsWith('{') &&
          ot.observaciones.trim() && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>OBSERVACIONES</Text>
              <View style={styles.card}>
                <Text style={styles.descripcionText}>{ot.observaciones}</Text>
              </View>
            </View>
          )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  estadoBadge: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  estadoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    letterSpacing: 1.5,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 3,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  trabajoItem: {
    gap: 8,
  },
  trabajoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trabajoNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  trabajoDescripcion: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  trabajoNotas: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  descripcionText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  productoItem: {
    gap: 5,
  },
  productoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productoNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  productoTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  productoDetalle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  precioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  precioLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  precioValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  precioLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  precioValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  evidenciaImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
});
