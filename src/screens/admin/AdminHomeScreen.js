// src/screens/admin/AdminHomeScreen.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColores } from '../../hooks/useColores';
import useAuthStore from '../../store/authStore';

export default function AdminHomeScreen({ navigation }) {
  const { user, empresa, logout } = useAuthStore();
  const COLORS = useColores();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: COLORS.card, borderBottomColor: COLORS.primary }]}>
        <Ionicons name="briefcase" size={40} color={COLORS.primary} />
        <Text style={[styles.title, { color: COLORS.text }]}>PANEL EMPRESA</Text>
        <Text style={[styles.subtitle, { color: COLORS.textMuted }]}>Administrador</Text>
        <Text style={[styles.empresaName, { color: COLORS.primary }]}>
          {empresa?.nombre || 'Mi Empresa'}
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

        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
            <Text style={[styles.statNumber, { color: COLORS.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Buses</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
            <Text style={[styles.statNumber, { color: COLORS.statusDanger }]}>3</Text>
            <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Vencidos</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
            <Text style={[styles.statNumber, { color: COLORS.statusWarning }]}>5</Text>
            <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Próximos</Text>
          </View>
        </View>

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
});