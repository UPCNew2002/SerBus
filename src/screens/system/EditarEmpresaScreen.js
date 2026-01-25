// src/screens/system/EditarEmpresaScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { obtenerEmpresaPorId, actualizarDatosEmpresa } from '../../lib/empresas';
import { supabase } from '../../lib/supabase';

export default function EditarEmpresaScreen({ route, navigation }) {
  const { empresaId } = route.params;

  const [cargando, setCargando] = useState(true);
  const [empresa, setEmpresa] = useState(null);
  const [ruc, setRuc] = useState('');
  const [nombre, setNombre] = useState('');
  const [adminUsuario, setAdminUsuario] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarEmpresa();
  }, []);

  const cargarEmpresa = async () => {
    setCargando(true);

    // Obtener datos de la empresa
    const empresaData = await obtenerEmpresaPorId(empresaId);

    if (!empresaData) {
      setCargando(false);
      return;
    }

    // Obtener usuario admin de la empresa
    const { data: admin } = await supabase
      .from('perfiles')
      .select('username')
      .eq('empresa_id', empresaId)
      .eq('rol', 'admin')
      .single();

    setEmpresa(empresaData);
    setRuc(empresaData.ruc);
    setNombre(empresaData.nombre);
    setAdminUsuario(admin?.username || 'Sin admin');
    setCargando(false);
  };

  const validarRUC = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    return cleaned.substring(0, 11);
  };

  const handleGuardar = async () => {
    if (!ruc.trim()) {
      Alert.alert('Error', 'El RUC es obligatorio');
      return;
    }

    if (ruc.length !== 11) {
      Alert.alert('Error', 'El RUC debe tener 11 dígitos');
      return;
    }

    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre de la empresa es obligatorio');
      return;
    }

    setLoading(true);

    const resultado = await actualizarDatosEmpresa(empresaId, {
      ruc: ruc.trim(),
      nombre: nombre.trim(),
    });

    setLoading(false);

    if (resultado.success) {
      Alert.alert('Éxito', 'Empresa actualizada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', resultado.error || 'No se pudo actualizar la empresa');
    }
  };

  if (cargando) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando empresa...</Text>
      </View>
    );
  }

  if (!empresa) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Empresa no encontrada</Text>
        <TouchableOpacity
          style={styles.backToListButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backToListText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>EDITAR EMPRESA</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={20} color={COLORS.statusWarning} />
          <Text style={styles.warningText}>
            Solo edita estos datos en casos excepcionales. El usuario Admin no puede cambiarse.
          </Text>
        </View>

        {/* Info admin (no editable) */}
        <View style={styles.infoBox}>
          <Ionicons name="person" size={20} color={COLORS.textLight} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>USUARIO ADMIN (no editable)</Text>
            <Text style={styles.infoValue}>@{adminUsuario}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>DATOS EDITABLES</Text>

        {/* RUC */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>RUC *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="document-text" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="RUC (11 dígitos)"
              placeholderTextColor={COLORS.textMuted}
              value={ruc}
              onChangeText={(text) => setRuc(validarRUC(text))}
              keyboardType="numeric"
              maxLength={11}
            />
          </View>
        </View>

        {/* Nombre de la Empresa */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>NOMBRE DE LA EMPRESA *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="business" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la empresa"
              placeholderTextColor={COLORS.textMuted}
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[styles.guardarButton, loading && styles.guardarButtonDisabled]}
          onPress={handleGuardar}
          disabled={loading}
        >
          <Ionicons
            name={loading ? 'hourglass' : 'save'}
            size={24}
            color={COLORS.text}
          />
          <Text style={styles.guardarButtonText}>
            {loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
  content: {
    flex: 1,
    padding: 20,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.statusWarning,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  warningText: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 13,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    gap: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 3,
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    letterSpacing: 1.5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  inputIconBox: {
    width: 45,
    height: 50,
    backgroundColor: COLORS.metal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 15,
    color: COLORS.text,
  },
  guardarButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
  },
  guardarButtonDisabled: {
    opacity: 0.6,
  },
  guardarButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  errorText: {
    color: COLORS.statusDanger,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
    marginTop: 15,
    fontSize: 14,
  },
  backToListButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    alignSelf: 'center',
  },
  backToListText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
});