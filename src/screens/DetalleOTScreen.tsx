// ═══════════════════════════════════════════════════════
// PANTALLA: DetalleOTScreen
// ═══════════════════════════════════════════════════════
//
// Pantalla de ejemplo que muestra cómo usar los componentes
// de fotos en una pantalla de detalle de OT
//
// ESTE ES UN EJEMPLO, ADAPTA A TU ESTRUCTURA
//
// ═══════════════════════════════════════════════════════
<<<<<<< HEAD
 
=======

>>>>>>> claude/serbus-supabase-backend-vmfkJ
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { SubirFotoOT } from '../components/SubirFotoOT';
import { ListaFotosOT } from '../components/ListaFotosOT';
import { getPerfilUsuario } from '../lib/supabase';
import type { FotoOT } from '../lib/supabase-storage';
<<<<<<< HEAD
 
// ───────────────────────────────────────────────────────
// TIPOS
// ───────────────────────────────────────────────────────
 
=======

// ───────────────────────────────────────────────────────
// TIPOS
// ───────────────────────────────────────────────────────

>>>>>>> claude/serbus-supabase-backend-vmfkJ
interface DetalleOTScreenProps {
  route: {
    params: {
      otNumero: string;
      // Puedes pasar más parámetros según tu estructura
    };
  };
}
<<<<<<< HEAD
 
// ───────────────────────────────────────────────────────
// COMPONENTE
// ───────────────────────────────────────────────────────
 
export function DetalleOTScreen({ route }: DetalleOTScreenProps) {
  const { otNumero } = route.params;
 
=======

// ───────────────────────────────────────────────────────
// COMPONENTE
// ───────────────────────────────────────────────────────

export function DetalleOTScreen({ route }: DetalleOTScreenProps) {
  const { otNumero } = route.params;

>>>>>>> claude/serbus-supabase-backend-vmfkJ
  // Estado local
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [rol, setRol] = useState<string>('');
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
 
  // ─────────────────────────────────────────────────────
  // CARGAR DATOS DEL USUARIO
  // ─────────────────────────────────────────────────────
 
  useEffect(() => {
    cargarPerfil();
  }, []);
 
  const cargarPerfil = async () => {
    try {
      const perfil = await getPerfilUsuario();
 
=======

  // ─────────────────────────────────────────────────────
  // CARGAR DATOS DEL USUARIO
  // ─────────────────────────────────────────────────────

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const perfil = await getPerfilUsuario();

>>>>>>> claude/serbus-supabase-backend-vmfkJ
      if (perfil) {
        setEmpresaId(perfil.empresa_id);
        setRol(perfil.rol);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };
<<<<<<< HEAD
 
  // ─────────────────────────────────────────────────────
  // CALLBACKS
  // ─────────────────────────────────────────────────────
 
=======

  // ─────────────────────────────────────────────────────
  // CALLBACKS
  // ─────────────────────────────────────────────────────

>>>>>>> claude/serbus-supabase-backend-vmfkJ
  const handleFotoSubida = (url: string) => {
    console.log('✅ Nueva foto subida:', url);
    // Aquí puedes guardar la URL en tu estado local de la OT
    // o recargar la lista de fotos
  };
<<<<<<< HEAD
 
=======

>>>>>>> claude/serbus-supabase-backend-vmfkJ
  const handleFotoPress = (foto: FotoOT) => {
    console.log('👆 Foto presionada:', foto.nombre);
    // Aquí puedes abrir un modal para ver la foto en grande
    // o implementar zoom/pan
  };
<<<<<<< HEAD
 
  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
 
=======

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────

>>>>>>> claude/serbus-supabase-backend-vmfkJ
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }
<<<<<<< HEAD
 
=======

>>>>>>> claude/serbus-supabase-backend-vmfkJ
  if (!empresaId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>Error: No se pudo cargar el perfil del usuario</Text>
        </View>
      </SafeAreaView>
    );
  }
<<<<<<< HEAD
 
  // Determinar si puede eliminar fotos (solo admin)
  const puedeEliminar = rol === 'admin' || rol === 'super_admin';
 
=======

  // Determinar si puede eliminar fotos (solo admin)
  const puedeEliminar = rol === 'admin' || rol === 'super_admin';

>>>>>>> claude/serbus-supabase-backend-vmfkJ
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titulo}>Orden de Trabajo</Text>
          <Text style={styles.numeroOT}>{otNumero}</Text>
        </View>
<<<<<<< HEAD
 
=======

>>>>>>> claude/serbus-supabase-backend-vmfkJ
        {/* Sección de Información de la OT */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Información</Text>
          {/* Aquí van los detalles de la OT */}
          <Text style={styles.textoInfo}>Bus: ABC-123</Text>
          <Text style={styles.textoInfo}>Fecha: 19/01/2024</Text>
          <Text style={styles.textoInfo}>Estado: En Proceso</Text>
        </View>
<<<<<<< HEAD
 
=======

>>>>>>> claude/serbus-supabase-backend-vmfkJ
        {/* Sección de Trabajos */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Trabajos Realizados</Text>
          {/* Aquí va la lista de trabajos */}
          <Text style={styles.textoInfo}>• Cambio de aceite</Text>
          <Text style={styles.textoInfo}>• Revisión de frenos</Text>
        </View>
<<<<<<< HEAD
 
        {/* Sección de Fotos */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Evidencias Fotográficas</Text>
 
=======

        {/* Sección de Fotos */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Evidencias Fotográficas</Text>

>>>>>>> claude/serbus-supabase-backend-vmfkJ
          {/* Componente para subir nueva foto */}
          <SubirFotoOT
            otNumero={otNumero}
            empresaId={empresaId}
            onFotoSubida={handleFotoSubida}
          />
<<<<<<< HEAD
 
=======

>>>>>>> claude/serbus-supabase-backend-vmfkJ
          {/* Lista de fotos existentes */}
          <ListaFotosOT
            otNumero={otNumero}
            empresaId={empresaId}
            puedeEliminar={puedeEliminar}
            onFotoPress={handleFotoPress}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
<<<<<<< HEAD
 
// ───────────────────────────────────────────────────────
// ESTILOS
// ───────────────────────────────────────────────────────
 
=======

// ───────────────────────────────────────────────────────
// ESTILOS
// ───────────────────────────────────────────────────────

>>>>>>> claude/serbus-supabase-backend-vmfkJ
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  header: {
    backgroundColor: '#dc2626',
    padding: 20,
  },
  titulo: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  numeroOT: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  seccion: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  textoInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
<<<<<<< HEAD
});
=======
});
>>>>>>> claude/serbus-supabase-backend-vmfkJ
