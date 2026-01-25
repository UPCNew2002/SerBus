// src/screens/system/CrearEmpresaScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { crearEmpresaConAdmin } from '../../lib/empresas';
 
export default function CrearEmpresaScreen({ navigation }) {
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [adminNombre, setAdminNombre] = useState('');
  const [adminUsuario, setAdminUsuario] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validarRUC = (text) => {
    // Solo números y máximo 11 dígitos
    const cleaned = text.replace(/[^0-9]/g, '');
    return cleaned.substring(0, 11);
  };

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
const handleGuardar = async () => {
    // Validaciones
    if (!ruc.trim()) {
      Alert.alert('Error', 'El RUC es obligatorio');
      return;
    }
 
    if (ruc.length !== 11) {
      Alert.alert('Error', 'El RUC debe tener 11 dígitos');
      return;
    }
 
    if (!razonSocial.trim()) {
      Alert.alert('Error', 'La Razón Social es obligatoria');
      return;
    }
 
    if (!adminNombre.trim()) {
      Alert.alert('Error', 'El Nombre del Admin es obligatorio');
      return;
    }
 
    if (!adminUsuario.trim()) {
      Alert.alert('Error', 'El Usuario del Admin es obligatorio');
      return;
    }
 
    if (!adminPassword.trim()) {
      Alert.alert('Error', 'La Contraseña es obligatoria');
      return;
    }
 
    if (adminPassword.length < 6) {
      Alert.alert('Error', 'La Contraseña debe tener al menos 6 caracteres');
      return;
    }
 
    // Crear empresa con admin en Supabase
    setLoading(true);
    try {
      const resultado = await crearEmpresaConAdmin({
        ruc: ruc.trim(),
        razonSocial: razonSocial.trim(),
        adminNombre: adminNombre.trim(),
        adminUsuario: adminUsuario.trim().toLowerCase(),
        adminPassword: adminPassword
      });
 
      setLoading(false);
 
      if (resultado.success) {
        Alert.alert(
          'Éxito',
         `Empresa creada correctamente en Supabase\n\nEmpresa: ${resultado.empresa.nombre}\nRUC: ${resultado.empresa.ruc}\n\nUsuario: ${adminUsuario}\nPassword: ${adminPassword}`,
         [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', resultado.error || 'No se pudo crear la empresa');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error en handleGuardar:', error);
      Alert.alert('Error', 'Ocurrió un error al crear la empresa');
    }

  };

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
        <Text style={styles.headerTitle}>NUEVA EMPRESA</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.accent} />
          <Text style={styles.infoText}>
            Al crear la empresa, se generará automáticamente un usuario Admin inicial
          </Text>
        </View>

        {/* Sección: Datos de la Empresa */}
        <Text style={styles.sectionTitle}>DATOS DE LA EMPRESA</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>RUC *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="document-text" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ingresa el RUC (11 dígitos)"
              placeholderTextColor={COLORS.textMuted}
              value={ruc}
              onChangeText={(text) => setRuc(validarRUC(text))}
              keyboardType="numeric"
              maxLength={11}
            />
          </View>
          <Text style={styles.helperText}>Debe ser único y tener 11 dígitos</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>RAZÓN SOCIAL *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="business" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: Transportes ABC SAC"
              placeholderTextColor={COLORS.textMuted}
              value={razonSocial}
              onChangeText={setRazonSocial}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Sección: Admin Inicial */}
        <Text style={styles.sectionTitle}>ADMINISTRADOR INICIAL</Text>

        <View style={styles.inputGroup}>
                  <Text style={styles.label}>NOMBRE COMPLETO *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="person-circle" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: Juan Pérez"
              placeholderTextColor={COLORS.textMuted}
              value={adminNombre}
              onChangeText={setAdminNombre}
              autoCapitalize="words"
            />
          </View>
          <Text style={styles.helperText}>Nombre completo del administrador</Text>
        </View>
 
        <View style={styles.inputGroup}>
  <Text style={styles.label}>USUARIO DEL ADMIN *</Text>
  <View style={styles.inputContainer}>
    <View style={styles.inputIconBox}>
      <Ionicons name="person" size={20} color={COLORS.text} />
    </View>
    <TextInput
      style={styles.input}
      placeholder="Ej: ntejeda, jvasquez"
      placeholderTextColor={COLORS.textMuted}
      value={adminUsuario}
      onChangeText={(text) => setAdminUsuario(text.toLowerCase().replace(/\s/g, ''))}
      autoCapitalize="none"
      autoCorrect={false}
    />
  </View>
  <Text style={styles.helperText}>Solo letras minúsculas, sin espacios</Text>
</View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CONTRASEÑA TEMPORAL *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="key" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={COLORS.textMuted}
              value={adminPassword}
              onChangeText={setAdminPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye' : 'eye-off'}
                size={20}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            El admin deberá cambiarla en su primer acceso
          </Text>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[styles.guardarButton, loading && styles.guardarButtonDisabled]}
          onPress={handleGuardar}
          disabled={loading}
        >
          <Ionicons
            name={loading ? 'hourglass' : 'checkmark-circle'}
            size={24}
            color={COLORS.text}
          />
          <Text style={styles.guardarButtonText}>
            {loading ? 'CREANDO EMPRESA...' : 'CREAR EMPRESA'}
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    gap: 10,
    marginBottom: 25,
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    marginTop: 10,
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
  eyeButton: {
    paddingHorizontal: 15,
    height: 50,
    justifyContent: 'center',
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 5,
    marginLeft: 5,
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
});