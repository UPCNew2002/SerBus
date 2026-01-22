// ═══════════════════════════════════════════════════════
// COMPONENTE: SubirFotoOT
// ═══════════════════════════════════════════════════════
//
// Componente para tomar y subir fotos de evidencia de OTs
//
// USO:
// <SubirFotoOT
//   otNumero="OT-2024-001"
//   empresaId={1}
//   onFotoSubida={(url) => console.log('Foto subida:', url)}
// />
//
// ═══════════════════════════════════════════════════════
 
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { subirFotoOT } from '../lib/supabase-storage';
 
// ───────────────────────────────────────────────────────
// TIPOS
// ───────────────────────────────────────────────────────
 
interface SubirFotoOTProps {
  otNumero: string;
  empresaId: number;
  onFotoSubida?: (url: string) => void;
  onError?: (error: string) => void;
}
 
// ───────────────────────────────────────────────────────
// COMPONENTE
// ───────────────────────────────────────────────────────
 
export function SubirFotoOT({
  otNumero,
  empresaId,
  onFotoSubida,
  onError,
}: SubirFotoOTProps) {
  // Estado local
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
 
  // ─────────────────────────────────────────────────────
  // PEDIR PERMISOS DE CÁMARA
  // ─────────────────────────────────────────────────────
 
  const solicitarPermisosCamara = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
 
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Necesitamos acceso a la cámara para tomar fotos'
      );
      return false;
    }
 
    return true;
  };
 
  // ─────────────────────────────────────────────────────
  // TOMAR FOTO CON CÁMARA
  // ─────────────────────────────────────────────────────
 
  const tomarFoto = async () => {
    // 1. Verificar permisos
    const tienePermiso = await solicitarPermisosCamara();
    if (!tienePermiso) return;
 
    try {
      // 2. Abrir cámara
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8, // Comprimir al 80% para reducir tamaño
        allowsEditing: true,
        aspect: [4, 3],
      });
 
      // 3. Si no canceló, guardar URI
      if (!result.canceled) {
        setFotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error tomando foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };
 
  // ─────────────────────────────────────────────────────
  // SELECCIONAR FOTO DE GALERÍA
  // ─────────────────────────────────────────────────────
 
  const seleccionarFotoGaleria = async () => {
    try {
      // 1. Abrir galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });
 
      // 2. Si no canceló, guardar URI
      if (!result.canceled) {
        setFotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error seleccionando foto:', error);
      Alert.alert('Error', 'No se pudo seleccionar la foto');
    }
  };
 
  // ─────────────────────────────────────────────────────
  // MOSTRAR OPCIONES: CÁMARA O GALERÍA
  // ─────────────────────────────────────────────────────
 
  const mostrarOpciones = () => {
    Alert.alert(
      'Agregar Foto',
      'Elige una opción',
      [
        {
          text: 'Tomar Foto',
          onPress: tomarFoto,
        },
        {
          text: 'Seleccionar de Galería',
          onPress: seleccionarFotoGaleria,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };
 
  // ─────────────────────────────────────────────────────
  // SUBIR FOTO A SUPABASE
  // ─────────────────────────────────────────────────────
 
  const subirFoto = async () => {
    if (!fotoUri) return;
 
    setUploading(true);
 
    try {
      // 1. Generar nombre único con timestamp
      const timestamp = Date.now();
      const nombreArchivo = `evidencia-${timestamp}.jpg`;
 
      // 2. Subir a Supabase Storage
      const url = await subirFotoOT(
        otNumero,
        empresaId,
        fotoUri,
        nombreArchivo
      );
 
      if (url) {
        // 3. Éxito
        Alert.alert('Éxito', 'Foto subida correctamente');
        setFotoUri(null); // Limpiar preview
 
        // 4. Notificar al componente padre
        if (onFotoSubida) {
          onFotoSubida(url);
        }
      } else {
        // 4. Error
        Alert.alert('Error', 'No se pudo subir la foto');
 
        if (onError) {
          onError('Error al subir foto');
        }
      }
    } catch (error) {
      console.error('Error subiendo foto:', error);
      Alert.alert('Error', 'Algo salió mal al subir la foto');
 
      if (onError) {
        onError('Error desconocido');
      }
    } finally {
      setUploading(false);
    }
  };
 
  // ─────────────────────────────────────────────────────
  // CANCELAR FOTO
  // ─────────────────────────────────────────────────────
 
  const cancelarFoto = () => {
    setFotoUri(null);
  };
 
  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
 
  return (
    <View style={styles.container}>
      {/* PREVIEW DE FOTO */}
      {fotoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: fotoUri }} style={styles.preview} />
 
          <View style={styles.botonesPreview}>
            {/* Botón Cancelar */}
            <TouchableOpacity
              style={[styles.boton, styles.botonCancelar]}
              onPress={cancelarFoto}
              disabled={uploading}
            >
              <Text style={styles.textoBoton}>Cancelar</Text>
            </TouchableOpacity>
 
            {/* Botón Subir */}
            <TouchableOpacity
              style={[styles.boton, styles.botonSubir]}
              onPress={subirFoto}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.textoBoton}>Subir Foto</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* BOTÓN AGREGAR FOTO */
        <TouchableOpacity
          style={styles.botonAgregar}
          onPress={mostrarOpciones}
        >
          <Text style={styles.iconoAgregar}>📷</Text>
          <Text style={styles.textoAgregar}>Agregar Foto</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
 
// ───────────────────────────────────────────────────────
// ESTILOS
// ───────────────────────────────────────────────────────
 
const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  previewContainer: {
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  botonesPreview: {
    flexDirection: 'row',
    gap: 12,
  },
  boton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonCancelar: {
    backgroundColor: '#6b7280',
  },
  botonSubir: {
    backgroundColor: '#dc2626',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  botonAgregar: {
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#dc2626',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  iconoAgregar: {
    fontSize: 48,
    marginBottom: 8,
  },
  textoAgregar: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});