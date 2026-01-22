// src/screens/system/ListarEmpresasScreen.js

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import useEmpresasStore from '../../store/empresasStore';

export default function ListarEmpresasScreen({ navigation }) {
  const { empresas, cambiarEstadoEmpresa } = useEmpresasStore();

  const renderEmpresa = ({ item }) => (
    <View style={styles.empresaCard}>
      <View style={styles.empresaHeader}>
        <View style={styles.empresaIconBox}>
          <Ionicons name="business" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.empresaInfo}>
          <Text style={styles.empresaNombre}>{item.razonSocial}</Text>
          <Text style={styles.empresaRuc}>RUC: {item.ruc}</Text>
          <Text style={styles.empresaFecha}>
            Creada: {new Date(item.fechaCreacion).toLocaleDateString('es-PE')}
          </Text>
        </View>
        <View
          style={[
            styles.estadoBadge,
            item.estado === 'activa' ? styles.estadoActiva : styles.estadoInactiva,
          ]}
        >
          <Text style={styles.estadoText}>
            {item.estado === 'activa' ? 'ACTIVA' : 'INACTIVA'}
          </Text>
        </View>
      </View>

      <View style={styles.empresaFooter}>
  <View style={styles.adminInfo}>
    <Ionicons name="person" size={14} color={COLORS.textMuted} />
    <Text style={styles.adminEmail}>@{item.adminUsuario}</Text>
  </View>
  
  <View style={styles.actionsRow}>
    <TouchableOpacity
      style={styles.editButton}
      onPress={() => navigation.navigate('EditarEmpresa', { empresaId: item.id })}
    >
      <Ionicons name="create" size={16} color={COLORS.accent} />
      <Text style={styles.editText}>Editar</Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={styles.toggleButton}
      onPress={() => cambiarEstadoEmpresa(item.id)}
    >
      <Ionicons
        name={item.estado === 'activa' ? 'close-circle' : 'checkmark-circle'}
        size={18}
        color={item.estado === 'activa' ? COLORS.statusDanger : COLORS.statusOk}
      />
      <Text style={styles.toggleText}>
        {item.estado === 'activa' ? 'Desactivar' : 'Activar'}
      </Text>
    </TouchableOpacity>
  </View>
</View>
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
        <Text style={styles.headerTitle}>EMPRESAS</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CrearEmpresa')}
        >
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{empresas.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.statusOk }]}>
            {empresas.filter((e) => e.estado === 'activa').length}
          </Text>
          <Text style={styles.statLabel}>Activas</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.statusDanger }]}>
            {empresas.filter((e) => e.estado === 'inactiva').length}
          </Text>
          <Text style={styles.statLabel}>Inactivas</Text>
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={empresas}
        renderItem={renderEmpresa}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={60} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No hay empresas registradas</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CrearEmpresa')}
            >
              <Text style={styles.emptyButtonText}>Crear Primera Empresa</Text>
            </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
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
  },
  lista: {
    padding: 15,
    paddingTop: 5,
  },
  empresaCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  empresaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  empresaIconBox: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  empresaInfo: {
    flex: 1,
  },
  empresaNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 3,
  },
  empresaRuc: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  empresaFecha: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  estadoActiva: {
    backgroundColor: COLORS.statusOk,
  },
  estadoInactiva: {
    backgroundColor: COLORS.metal,
  },
  estadoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  empresaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adminEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
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
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionsRow: {
  flexDirection: 'row',
  gap: 8,
},
editButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5,
  backgroundColor: COLORS.backgroundLight,
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: COLORS.border,
},
editText: {
  fontSize: 12,
  color: COLORS.accent,
  fontWeight: '600',
},
  emptyButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
});