// src/screens/admin/TrabajosListScreen.js

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import useAuthStore from '../../store/authStore';
import { useTrabajos, useEliminarTrabajo } from '../../hooks/useTrabajos';

export default function TrabajosListScreen({ navigation }) {
  const empresaId = useAuthStore((state) => state.empresa?.id);

  // React Query hooks
  const { data: trabajos = [], isLoading, refetch } = useTrabajos(empresaId);
  const eliminarMutation = useEliminarTrabajo();

  const handleEliminar = (trabajo) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Eliminar "${trabajo.nombre}"?\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarMutation.mutateAsync({
                trabajoId: trabajo.id,
                empresaId
              });
              Alert.alert('Éxito', `Trabajo "${trabajo.nombre}" eliminado`);
            } catch (error) {
              console.error('Error eliminando trabajo:', error);
              Alert.alert('Error', 'No se pudo eliminar el trabajo');
            }
          },
        },
      ]
    );
  };

  const renderTrabajo = ({ item }) => (
    <View style={styles.trabajoCard}>
      <View style={styles.trabajoHeader}>
        <View style={styles.trabajoIconBox}>
          <Ionicons
            name={item.entraCronograma ? 'calendar' : 'construct'}
            size={24}
            color={item.entraCronograma ? COLORS.primary : COLORS.textMuted}
          />
        </View>
        
        <View style={styles.trabajoInfo}>
          <Text style={styles.trabajoNombre}>{item.nombre}</Text>
          
          {item.entraCronograma ? (
            <View style={styles.intervaloContainer}>
              <View style={styles.intervaloBox}>
                <Ionicons name="time" size={14} color={COLORS.accent} />
                <Text style={styles.intervaloText}>{item.intervaloDias} días</Text>
              </View>
              <View style={styles.intervaloBox}>
                <Ionicons name="speedometer" size={14} color={COLORS.accent} />
                <Text style={styles.intervaloText}>{item.intervaloKm.toLocaleString()} km</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noCronogramaText}>No entra a cronograma</Text>
          )}
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.entraCronograma ? '📅' : '🔧'}
          </Text>
        </View>
      </View>

      <View style={styles.trabajoFooter}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditarTrabajo', { trabajoId: item.id })}
        >
          <Ionicons name="create" size={16} color={COLORS.accent} />
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleEliminar(item)}
        >
          <Ionicons name="trash" size={16} color={COLORS.statusDanger} />
          <Text style={styles.deleteText}>Eliminar</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>TRABAJOS</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CrearTrabajo')}
        >
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{trabajos.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.primary }]}>
            {trabajos.filter((t) => t.entraCronograma).length}
          </Text>
          <Text style={styles.statLabel}>En Cronograma</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.textMuted }]}>
            {trabajos.filter((t) => !t.entraCronograma).length}
          </Text>
          <Text style={styles.statLabel}>Solo Registro</Text>
        </View>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={COLORS.accent} />
        <Text style={styles.infoText}>
          Los trabajos con 📅 actualizan el cronograma automáticamente
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={trabajos}
        renderItem={renderTrabajo}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={60} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No hay trabajos configurados</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CrearTrabajo')}
            >
              <Text style={styles.emptyButtonText}>Crear Primer Trabajo</Text>
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
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 12,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 12,
  },
  lista: {
    padding: 15,
    paddingTop: 5,
    paddingBottom: 30,
  },
  trabajoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trabajoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  trabajoIconBox: {
    width: 45,
    height: 45,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trabajoInfo: {
    flex: 1,
  },
  trabajoNombre: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  intervaloContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  intervaloBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  intervaloText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  noCronogramaText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  badge: {
    width: 35,
    height: 35,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 18,
  },
  trabajoFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deleteText: {
    fontSize: 12,
    color: COLORS.statusDanger,
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
  emptyButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
});