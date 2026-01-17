// src/screens/system/EditarEmpresaScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import useEmpresasStore from '../../store/empresasStore';

export default function EditarEmpresaScreen({ route, navigation }) {
  const { empresaId } = route.params;
  const { obtenerEmpresa, editarEmpresa, existeRUC } = useEmpresasStore();
  
  const empresa = obtenerEmpresa(empresaId);

  const [ruc, setRuc] = useState(empresa?.ruc || '');
  const [razonSocial, setRazonSocial] = useState(empresa?.razonSocial || '');
  const [loading, setLoading] = useState(false);

  const validarRUC = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    return cleaned.substring(0, 11);
  };

  const handleGuardar = () => {
    if (!ruc.trim()) {
      Alert.alert('Error', 'El RUC es obligatorio');
      return;
    }

    if (ruc.length !== 11) {
      Alert.alert('Error', 'El RUC debe tener 11 dígitos');
      return;
    }

    if (existeRUC(ruc, empresaId)) {
      Alert.alert('Error', 'Ya existe otra empresa con ese RUC');
      return;
    }

    if (!razonSocial.trim()) {
      Alert.alert('Error', 'La Razón Social es obligatoria');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      editarEmpresa(empresaId, { ruc, razonSocial });
      setLoading(false);
      Alert.alert('Éxito', 'Empresa actualizada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1000);
  };

  if (!empresa) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Empresa no encontrada</Text>
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
            <Text style={styles.infoValue}>@{empresa.adminUsuario}</Text>
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

        {/* Razón Social */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>RAZÓN SOCIAL *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="business" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Razón Social"
              placeholderTextColor={COLORS.textMuted}
              value={razonSocial}
              onChangeText={setRazonSocial}
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
  },
});