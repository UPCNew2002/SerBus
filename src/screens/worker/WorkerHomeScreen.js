// src/screens/worker/WorkerHomeScreen.js
 
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import useAuthStore from '../../store/authStore';
import { obtenerEstadisticasOTs, busesNecesitanMantenimiento } from '../../lib/cronograma';
 
export default function WorkerHomeScreen({ navigation }) {
  const { user, empresa, logout } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [busesUrgentes, setBusesUrgentes] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    cargarDatos();
  }, []);
 
  async function cargarDatos() {
    setLoading(true);
    try {
      const [statsData, busesData] = await Promise.all([
        obtenerEstadisticasOTs(empresa.id),
        busesNecesitanMantenimiento(empresa.id),
      ]);
      setStats(statsData);
      setBusesUrgentes((busesData || []).filter(b => b.urgencia === 'URGENTE'));
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="construct" size={40} color={COLORS.primary} />
        <Text style={styles.title}>PANEL OPERATIVO</Text>
        <Text style={styles.subtitle}>Trabajador</Text>
        <Text style={styles.empresaName}>{empresa?.nombre || 'Mi Empresa'}</Text>
      </View>
 
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarDatos} tintColor={COLORS.primary} />
        }
      >
        <Text style={styles.welcomeText}>Hola, {user?.nombre || 'Trabajador'}</Text>
 
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.accent} />
          <Text style={styles.infoText}>
            Modo solo lectura: Puedes consultar OTs y cronograma
          </Text>
        </View>
 
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats?.total_ots || 0}</Text>
                <Text style={styles.statLabel}>OTs Totales</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: COLORS.statusWarning }]}>
                  {stats?.ots_pendientes || 0}
                </Text>
                <Text style={styles.statLabel}>Pendientes</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: COLORS.statusSuccess }]}>
                  {stats?.ots_completadas || 0}
                </Text>
                <Text style={styles.statLabel}>Completadas</Text>
              </View>
            </View>
 
            {/* Alertas de buses urgentes */}
            {busesUrgentes.length > 0 && (
              <View style={styles.alertasBox}>
                <View style={styles.alertasHeader}>
                  <Ionicons name="warning" size={24} color={COLORS.statusDanger} />
                  <Text style={styles.alertasTitle}>Buses Urgentes</Text>
                </View>
                {busesUrgentes.slice(0, 3).map((bus) => (
                  <View key={bus.id} style={styles.alertaBus}>
                    <View style={styles.alertaBusIcon}>
                      <Ionicons name="bus" size={20} color={COLORS.statusDanger} />
                    </View>
                    <View style={styles.alertaBusInfo}>
                      <Text style={styles.alertaBusPlaca}>{bus.placa}</Text>
                      <Text style={styles.alertaBusKm}>
                        {bus.dias_sin_mantenimiento === 999
                          ? 'Sin mantenimiento'
                          : `${bus.dias_sin_mantenimiento} días sin mant.`}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
 
            {/* Menú de opciones */}
            <Text style={styles.sectionTitle}>OPCIONES</Text>
 
            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => navigation.navigate('WorkerOTsList')}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name="document-text" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.menuTextBox}>
                <Text style={styles.menuTitle}>Ver Órdenes de Trabajo</Text>
                <Text style={styles.menuSubtitle}>Consultar OTs de la empresa</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
 
            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => navigation.navigate('WorkerCronograma')}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name="calendar" size={24} color={COLORS.accent} />
              </View>
              <View style={styles.menuTextBox}>
                <Text style={styles.menuTitle}>Cronograma de Mantenimiento</Text>
                <Text style={styles.menuSubtitle}>Ver próximos mantenimientos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </>
        )}
 
        {/* Botón de logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out" size={20} color={COLORS.statusDanger} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
 
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
  header: {
    backgroundColor: COLORS.card,
    alignItems: 'center',
    paddingVertical: 25,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 5,
  },
  empresaName: {
    fontSize: 16,
    color: COLORS.accent,
    marginTop: 8,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 13,
    lineHeight: 18,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  alertasBox: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: COLORS.statusDanger,
  },
  alertasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  alertasTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  alertaBus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  alertaBusIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertaBusInfo: {
    flex: 1,
  },
  alertaBusPlaca: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  alertaBusKm: {
    fontSize: 13,
    color: COLORS.statusDanger,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    letterSpacing: 1.5,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  menuIconBox: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextBox: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 3,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.statusDanger,
    backgroundColor: COLORS.card,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.statusDanger,
  },
});