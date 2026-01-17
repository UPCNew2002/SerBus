// src/screens/worker/WorkerHomeScreen.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import useAuthStore from '../../store/authStore';
import useOTsStore from '../../store/otsStore';
import useBusesStore from '../../store/busesStore';
import useTrabajosStore from '../../store/trabajosStore';
import { useColores } from '../../hooks/useColores';
import { calcularCronogramaBus } from '../../utils/cronogramaUtils';

export default function WorkerHomeScreen({ navigation }) {
  const { user, empresa, logout } = useAuthStore();
  const { ots } = useOTsStore();
  const { buses } = useBusesStore();
  const { trabajos } = useTrabajosStore();

  const COLORS = useColores(); 
  // Filtrar por empresa
  const otsEmpresa = ots.filter((ot) => ot.empresaId === empresa?.id);
  const busesEmpresa = buses.filter((bus) => bus.empresaId === empresa?.id);

  // Calcular estadísticas del cronograma
  let totalVencidos = 0;
  let totalProximos = 0;

  busesEmpresa.forEach((bus) => {
    const cronograma = calcularCronogramaBus(bus, ots, trabajos);
    totalVencidos += cronograma.filter((m) => m.estado === 'vencido').length;
    totalProximos += cronograma.filter((m) => m.estado === 'proximo').length;
  });

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
      >
        <Text style={styles.welcomeText}>Hola, {user?.nombre || 'Trabajador'}</Text>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.accent} />
          <Text style={styles.infoText}>
            Modo solo lectura: Puedes consultar OTs y cronograma, pero no modificar
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{otsEmpresa.length}</Text>
            <Text style={styles.statLabel}>OTs Totales</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: COLORS.statusDanger }]}>
              {totalVencidos}
            </Text>
            <Text style={styles.statLabel}>Vencidos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: COLORS.statusWarning }]}>
              {totalProximos}
            </Text>
            <Text style={styles.statLabel}>Próximos</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>ACCESOS RÁPIDOS</Text>

        {/* Ver OTs */}
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('WorkerOTsList')}
        >
          <View style={styles.menuIconBox}>
            <Ionicons name="document-text" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextBox}>
            <Text style={styles.menuTitle}>Ver OTs</Text>
            <Text style={styles.menuSubtitle}>
              Consultar órdenes de trabajo registradas
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Ver Cronograma */}
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('WorkerCronograma')}
        >
          <View style={styles.menuIconBox}>
            <Ionicons name="calendar" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextBox}>
            <Text style={styles.menuTitle}>Ver Cronograma</Text>
            <Text style={styles.menuSubtitle}>
              Consultar mantenimientos preventivos
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out" size={20} color={COLORS.text} />
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
    padding: 25,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 5,
  },
  empresaName: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 5,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: COLORS.textLight,
    marginBottom: 20,
    fontWeight: '600',
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
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
    color: COLORS.statusOk,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 5,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textMuted,
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
  },
  menuIconBox: {
    width: 45,
    height: 45,
    backgroundColor: COLORS.backgroundLight,
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
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.metal,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  logoutText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 15,
  },
});