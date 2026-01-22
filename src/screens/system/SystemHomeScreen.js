// src/screens/system/SystemHomeScreen.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColores } from '../../hooks/useColores';
import useAuthStore from '../../store/authStore';
import useEmpresasStore from '../../store/empresasStore';
import useUsuariosStore from '../../store/usuariosStore';

export default function SystemHomeScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const { empresas } = useEmpresasStore();
  const { usuarios } = useUsuariosStore();
  const COLORS = useColores();

  // Estadísticas generales
  const totalEmpresas = empresas.length;
  const empresasActivas = empresas.filter(e => e.activo).length;
  const totalAdmins = empresas.length; // Cada empresa tiene 1 admin
  const totalTrabajadores = usuarios.length;
  const trabajadoresActivos = usuarios.filter(u => u.activo).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: COLORS.card, borderBottomColor: COLORS.primary }]}>
        <Ionicons name="shield-checkmark" size={40} color={COLORS.primary} />
        <Text style={[styles.title, { color: COLORS.text }]}>PANEL SISTEMA</Text>
        <Text style={[styles.subtitle, { color: COLORS.textMuted }]}>Super Administrador</Text>
      </View>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.welcomeText, { color: COLORS.textLight }]}>
          Bienvenido, {user?.nombre || 'Super Admin'}
        </Text>

        {/* Estadísticas Generales */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
            <Ionicons name="business" size={28} color={COLORS.primary} />
            <Text style={[styles.statNumber, { color: COLORS.text }]}>{totalEmpresas}</Text>
            <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Empresas</Text>
            <Text style={[styles.statDetail, { color: COLORS.statusOk }]}>
              {empresasActivas} activas
            </Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
            <Ionicons name="people" size={28} color={COLORS.accent} />
            <Text style={[styles.statNumber, { color: COLORS.text }]}>{totalAdmins}</Text>
            <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Admins</Text>
            <Text style={[styles.statDetail, { color: COLORS.textLight }]}>
              1 por empresa
            </Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
            <Ionicons name="person" size={28} color={COLORS.statusOk} />
            <Text style={[styles.statNumber, { color: COLORS.text }]}>{totalTrabajadores}</Text>
            <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Trabajadores</Text>
            <Text style={[styles.statDetail, { color: COLORS.statusOk }]}>
              {trabajadoresActivos} activos
            </Text>
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: COLORS.card, borderLeftColor: COLORS.accent, borderColor: COLORS.border }]}>
          <Ionicons name="information-circle" size={20} color={COLORS.accent} />
          <Text style={[styles.infoText, { color: COLORS.textLight }]}>
            Como Super Admin tienes control total sobre todas las empresas, admins y trabajadores del sistema
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: COLORS.textMuted }]}>GESTIÓN DEL SISTEMA</Text>

        {/* Gestionar Empresas */}
        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('ListarEmpresas')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: COLORS.backgroundLight }]}>
            <Ionicons name="business" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.menuTextBox}>
            <Text style={[styles.menuTitle, { color: COLORS.text }]}>Gestionar Empresas</Text>
            <Text style={[styles.menuSubtitle, { color: COLORS.textMuted }]}>
              {totalEmpresas} empresas • {empresasActivas} activas
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Gestionar Admins */}
        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('GestionarAdmins')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: COLORS.backgroundLight }]}>
            <Ionicons name="people" size={24} color={COLORS.accent} />
          </View>
          <View style={styles.menuTextBox}>
            <Text style={[styles.menuTitle, { color: COLORS.text }]}>Gestionar Admins</Text>
            <Text style={[styles.menuSubtitle, { color: COLORS.textMuted }]}>
              Ver y administrar todos los administradores
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Gestionar Trabajadores */}
        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('GestionarTrabajadores')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: COLORS.backgroundLight }]}>
            <Ionicons name="person" size={24} color={COLORS.statusOk} />
          </View>
          <View style={styles.menuTextBox}>
            <Text style={[styles.menuTitle, { color: COLORS.text }]}>Gestionar Trabajadores</Text>
            <Text style={[styles.menuSubtitle, { color: COLORS.textMuted }]}>
              {totalTrabajadores} trabajadores • {trabajadoresActivos} activos
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Logs del Sistema */}
        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('LogsSistema')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: COLORS.backgroundLight }]}>
            <Ionicons name="document-text" size={24} color={COLORS.statusWarning} />
          </View>
          <View style={styles.menuTextBox}>
            <Text style={[styles.menuTitle, { color: COLORS.text }]}>Logs del Sistema</Text>
            <Text style={[styles.menuSubtitle, { color: COLORS.textMuted }]}>
              Auditoría y actividad del sistema
            </Text>
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

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  scrollContent: { flex: 1 },
  content: { padding: 20 },
  welcomeText: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    gap: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
  },
  statDetail: {
    fontSize: 10,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
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
  menuTextBox: { flex: 1 },
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
});