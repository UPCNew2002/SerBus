// ═══════════════════════════════════════════════════════
// COMPONENTE: ListaFotosOT
// ═══════════════════════════════════════════════════════
//
// Componente para mostrar todas las fotos de una OT
//
// USO:
// <ListaFotosOT
//   otNumero="OT-2024-001"
//   empresaId={1}
//   puedeEliminar={true}
// />
//
// ═══════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  obtenerFotosOT,
  eliminarFotoOT,
  FotoOT,
} from '../lib/supabase-storage';

const { width } = Dimensions.get('window');
const FOTO_SIZE = (width - 48) / 3; // 3 columnas con padding

// ───────────────────────────────────────────────────────
// TIPOS
// ───────────────────────────────────────────────────────

interface ListaFotosOTProps {
  otNumero: string;
  empresaId: number;
  puedeEliminar?: boolean;
  onFotoPress?: (foto: FotoOT) => void;
}

// ───────────────────────────────────────────────────────
// COMPONENTE
// ───────────────────────────────────────────────────────

export function ListaFotosOT({
  otNumero,
  empresaId,
  puedeEliminar = false,
  onFotoPress,
}: ListaFotosOTProps) {
  // Estado local
  const [fotos, setFotos] = useState<FotoOT[]>([]);
  const [loading, setLoading] = useState(true);
  const [eliminando, setEliminando] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────
  // CARGAR FOTOS AL MONTAR
  // ─────────────────────────────────────────────────────

  useEffect(() => {
    cargarFotos();
  }, [otNumero, empresaId]);

  // ─────────────────────────────────────────────────────
  // CARGAR FOTOS
  // ─────────────────────────────────────────────────────

  const cargarFotos = async () => {
    setLoading(true);

    try {
      const fotosObtenidas = await obtenerFotosOT(otNumero, empresaId);
      setFotos(fotosObtenidas);
    } catch (error) {
      console.error('Error cargando fotos:', error);
      Alert.alert('Error', 'No se pudieron cargar las fotos');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────
  // ELIMINAR FOTO
  // ─────────────────────────────────────────────────────

  const confirmarEliminar = (foto: FotoOT) => {
    Alert.alert(
      'Eliminar Foto',
      '¿Estás seguro de que quieres eliminar esta foto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminar(foto),
        },
      ]
    );
  };

  const eliminar = async (foto: FotoOT) => {
    setEliminando(foto.nombre);

    try {
      const eliminada = await eliminarFotoOT(
        otNumero,
        empresaId,
        foto.nombre
      );

      if (eliminada) {
        // Eliminar de la lista local
        setFotos(prev => prev.filter(f => f.nombre !== foto.nombre));
        Alert.alert('Éxito', 'Foto eliminada correctamente');
      } else {
        Alert.alert('Error', 'No se pudo eliminar la foto');
      }
    } catch (error) {
      console.error('Error eliminando foto:', error);
      Alert.alert('Error', 'Algo salió mal al eliminar la foto');
    } finally {
      setEliminando(null);
    }
  };

  // ─────────────────────────────────────────────────────
  // MANEJAR PRESIÓN EN FOTO
  // ─────────────────────────────────────────────────────

  const handleFotoPress = (foto: FotoOT) => {
    if (onFotoPress) {
      onFotoPress(foto);
    }
  };

  // ─────────────────────────────────────────────────────
  // RENDER FOTO INDIVIDUAL
  // ─────────────────────────────────────────────────────

  const renderFoto = ({ item: foto }: { item: FotoOT }) => {
    const estaEliminando = eliminando === foto.nombre;

    return (
      <View style={styles.fotoContainer}>
        {/* Imagen */}
        <TouchableOpacity
          onPress={() => handleFotoPress(foto)}
          activeOpacity={0.8}
        >
          <Image source={{ uri: foto.url }} style={styles.foto} />

          {/* Overlay con nombre */}
          <View style={styles.overlay}>
            <Text style={styles.nombreFoto} numberOfLines={1}>
              {foto.nombre}
            </Text>
          </View>

          {/* Loading al eliminar */}
          {estaEliminando && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Botón Eliminar */}
        {puedeEliminar && !estaEliminando && (
          <TouchableOpacity
            style={styles.botonEliminar}
            onPress={() => confirmarEliminar(foto)}
          >
            <Text style={styles.iconoEliminar}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ─────────────────────────────────────────────────────
  // RENDER VACÍO
  // ─────────────────────────────────────────────────────

  const renderVacio = () => (
    <View style={styles.vacioContainer}>
      <Text style={styles.iconoVacio}>📷</Text>
      <Text style={styles.textoVacio}>No hay fotos todavía</Text>
    </View>
  );

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.textoLoading}>Cargando fotos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.titulo}>
          Fotos de Evidencia ({fotos.length})
        </Text>
        <TouchableOpacity onPress={cargarFotos}>
          <Text style={styles.botonRecargar}>🔄 Recargar</Text>
        </TouchableOpacity>
      </View>

      {/* Grid de Fotos */}
      <FlatList
        data={fotos}
        renderItem={renderFoto}
        keyExtractor={foto => foto.nombre}
        numColumns={3}
        ListEmptyComponent={renderVacio}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

// ───────────────────────────────────────────────────────
// ESTILOS
// ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  botonRecargar: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  grid: {
    padding: 8,
  },
  fotoContainer: {
    width: FOTO_SIZE,
    height: FOTO_SIZE,
    margin: 4,
    position: 'relative',
  },
  foto: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  nombreFoto: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
  },
  botonEliminar: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoEliminar: {
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  textoLoading: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  vacioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  iconoVacio: {
    fontSize: 64,
    marginBottom: 16,
  },
  textoVacio: {
    fontSize: 16,
    color: '#6b7280',
  },
});
