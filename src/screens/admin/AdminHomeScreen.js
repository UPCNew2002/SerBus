// src/screens/admin/AdminHomeScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColores } from '../../hooks/useColores';
import useAuthStore from '../../store/authStore';
import { obtenerEstadisticasOTs, busesNecesitanMantenimiento } from '../../lib/cronograma';

export default function AdminHomeScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const empresaId = useAuthStore((state) => state.empresa?.id);
  const empresaNombre = useAuthStore((state) => state.empresa?.nombre);
  const logout = useAuthStore((state) => state.logout);
  const COLORS = useColores();
 
  const [estadisticas, setEstadisticas] = useState(null);
  const [busesUrgentes, setBusesUrgentes] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    if (!empresaId) return;
 
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const stats = await obtenerEstadisticasOTs(empresaId);
        setEstadisticas(stats);
 
        const buses = await busesNecesitanMantenimiento(empresaId);
        setBusesUrgentes(buses.filter(b => b.urgencia === 'URGENTE'));
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
 
    cargarDatos();
  }, [empresaId]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: COLORS.card, borderBottomColor: COLORS.primary }]}>
        <Ionicons name="briefcase" size={40} color={COLORS.primary} />
        <Text style={[styles.title, { color: COLORS.text }]}>PANEL EMPRESA</Text>
        <Text style={[styles.subtitle, { color: COLORS.textMuted }]}>Administrador</Text>
        <Text style={[styles.empresaName, { color: COLORS.primary }]}>
          {empresaNombre || 'Mi Empresa'}
        </Text>
      </View>

      {/* Content con ScrollView */}
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.welcomeText, { color: COLORS.textLight }]}>
          Hola, {user?.nombre || 'Admin'}
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: COLORS.textMuted }]}>Cargando estadísticas...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
                <Text style={[styles.statNumber, { color: COLORS.primary }]}>
                  {estadisticas?.total_ots || 0}
                </Text>
                <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>OTs Total</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
                <Text style={[styles.statNumber, { color: COLORS.statusWarning }]}>
                  {estadisticas?.ots_en_proceso || 0}
                </Text>
                <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>En Proceso</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
                <Text style={[styles.statNumber, { color: COLORS.statusDanger }]}>
                  {busesUrgentes.length}
                </Text>
                <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Urgentes</Text>
              </View>
            </View>

            {/* Alertas de mantenimiento urgente */}
            {busesUrgentes.length > 0 && (
              <View style={[styles.alertBox, { backgroundColor: COLORS.card, borderColor: COLORS.statusDanger }]}>
                <View style={styles.alertHeader}>
                  <Ionicons name="warning" size={20} color={COLORS.statusDanger} />
                  <Text style={[styles.alertTitle, { color: COLORS.statusDanger }]}>
                    MANTENIMIENTO URGENTE
                  </Text>
                </View>
                {busesUrgentes.slice(0, 3).map((bus) => (
                  <View key={bus.bus_id} style={styles.alertBusRow}>
                    <Text style={[styles.alertBusPlaca, { color: COLORS.text }]}>{bus.placa}</Text>
                    <Text style={[styles.alertBusKm, { color: COLORS.textMuted }]}>
                      {bus.dias_sin_mantenimiento === 999
                        ? 'Sin mantenimiento'
                        : `${bus.dias_sin_mantenimiento} días sin mant.`}
                    </Text>
                  </View>
                ))}
                {busesUrgentes.length > 3 && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Cronograma')}
                    style={styles.alertVerMasButton}
                  >
                    <Text style={[styles.alertVerMasText, { color: COLORS.statusDanger }]}>
                      Ver {busesUrgentes.length - 3} más →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}

        <Text style={[styles.sectionTitle, { color: COLORS.textMuted }]}>ACCESOS RÁPIDOS</Text>

        {/* Registrar OT */}
        <TouchableOpacity 
          style={[styles.menuCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('RegistrarOT')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: COLORS.backgroundLight }]}>
            <Ionicons name="document-text" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextBox}>
            <Text style={[styles.menuTitle, { color: COLORS.text }]}>Registrar OT</Text>
            <Text style={[styles.menuSubtitle, { color: COLORS.textMuted }]}>Nueva orden de trabajo</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Cronograma */}
        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('Cronograma')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: COLORS.backgroundLight }]}>
            <Ionicons name="calendar" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextBox}>
            <Text style={[styles.menuTitle, { color: COLORS.text }]}>Cronograma</Text>
            <Text style={[styles.menuSubtitle, { color: COLORS.textMuted }]}>Mantenimientos preventivos</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Flota de Buses */}
        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('ListaBuses')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: COLORS.backgroundLight }]}>
            <Ionicons name="bus" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextBox}>
            <Text style={[styles.menuTitle, { color: COLORS.text }]}>Flota de Buses</Text>
            <Text style={[styles.menuSubtitle, { color: COLORS.textMuted }]}>Ver todos los buses</Text>
            </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Reportes */}
        <TouchableOpacity 
          style={[styles.menuCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('OTsList')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: COLORS.backgroundLight }]}>
            <Ionicons name="bar-chart" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextBox}>
            <Text style={[styles.menuTitle, { color: COLORS.text }]}>Reportes</Text>
            <Text style={[styles.menuSubtitle, { color: COLORS.textMuted }]}>Historial y estadísticas</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Personalización */}
        <TouchableOpacity 
          style={[styles.menuCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('ConfigurarColores')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: COLORS.backgroundLight }]}>
            <Ionicons name="color-palette" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextBox}>
            <Text style={[styles.menuTitle, { color: COLORS.text }]}>Personalización</Text>
            <Text style={[styles.menuSubtitle, { color: COLORS.textMuted }]}>Colores y apariencia</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Trabajos */}
        <TouchableOpacity 
          style={[styles.menuCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('TrabajosList')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: COLORS.backgroundLight }]}>
            <Ionicons name="settings" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextBox}>
            <Text style={[styles.menuTitle, { color: COLORS.text }]}>Trabajos</Text>
            <Text style={[styles.menuSubtitle, { color: COLORS.textMuted }]}>Configurar tipos de trabajo</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Usuarios */}
        <TouchableOpacity 
          style={[styles.menuCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('UsuariosList')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: COLORS.backgroundLight }]}>
            <Ionicons name="people" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextBox}>
            <Text style={[styles.menuTitle, { color: COLORS.text }]}>Usuarios</Text>
            <Text style={[styles.menuSubtitle, { color: COLORS.textMuted }]}>Gestionar trabajadores</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: COLORS.metal }]} 
          onPress={logout}
        >
          <Ionicons name="log-out" size={20} color={COLORS.text} />
          <Text style={[styles.logoutText, { color: COLORS.text }]}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Espaciado final */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 25,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 5,
  },
  empresaName: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },
  statBox: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
    letterSpacing: 1.5,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  menuIconBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextBox: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  logoutText: {
    fontWeight: '600',
    fontSize: 15,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    fontSize: 14,
  },
  alertBox: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 2,
    borderLeftWidth: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  alertBusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff20',
  },
  alertBusPlaca: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertBusKm: {
    fontSize: 12,
  },
  alertVerMasButton: {
    paddingTop: 10,
    alignItems: 'center',
  },
  alertVerMasText: {
    fontSize: 13,
    fontWeight: '600',
  },
});