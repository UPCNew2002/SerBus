// src/screens/admin/CrearUsuarioScreen.js

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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { crearTrabajador } from '../../lib/usuarios';
import useAuthStore from '../../store/authStore';
 
export default function CrearUsuarioScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { empresa } = useAuthStore();

 const handleGuardar = async () => {
    // Validaciones
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre completo es obligatorio');
      return;
    }
 
    if (!usuario.trim()) {
      Alert.alert('Error', 'El nombre de usuario es obligatorio');
      return;
    }
 
    if (!password.trim()) {
      Alert.alert('Error', 'La contraseña es obligatoria');
      return;
    }
 
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
 
    if (!empresa?.id) {
      Alert.alert('Error', 'No se pudo identificar la empresa');
      return;
    }
 
    // Crear trabajador en Supabase
    setLoading(true);
    try {
      const resultado = await crearTrabajador({
        nombre: nombre.trim(),
        username: usuario.trim().toLowerCase(),
        password: password,
        empresaId: empresa.id
      });
 
      setLoading(false);
 
      if (resultado.success) {
        Alert.alert(
          'Éxito',
          `Trabajador creado correctamente en Supabase\n\nNombre: ${resultado.usuario.nombre}\nUsuario: ${usuario}\nContraseña: ${password}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', resultado.error || 'No se pudo crear el trabajador');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error en handleGuardar:', error);
      Alert.alert('Error', 'Ocurrió un error al crear el trabajador');
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
        <Text style={styles.headerTitle}>NUEVO TRABAJADOR</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.accent} />
          <Text style={styles.infoText}>
            El trabajador podrá consultar OTs y cronogramas (solo lectura)
          </Text>
        </View>

        <Text style={styles.sectionTitle}>DATOS DEL TRABAJADOR</Text>

        {/* Nombre completo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>NOMBRE COMPLETO *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="person" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: Juan Pérez García"
              placeholderTextColor={COLORS.textMuted}
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Usuario */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>NOMBRE DE USUARIO *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="at" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: jperez, mgarcia"
              placeholderTextColor={COLORS.textMuted}
              value={usuario}
              onChangeText={(text) => setUsuario(text.toLowerCase().replace(/\s/g, ''))}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Text style={styles.helperText}>
            Solo letras minúsculas, sin espacios. Debe ser único.
          </Text>
        </View>

        {/* Contraseña */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>CONTRASEÑA *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="key" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
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
            El trabajador deberá cambiarla en su primer acceso
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
            {loading ? 'CREANDO...' : 'CREAR TRABAJADOR'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, letterSpacing: 1.5 },
  scrollContent: { flex: 1 },
  content: { padding: 20 },
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
  infoText: { flex: 1, color: COLORS.textLight, fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary, marginBottom: 15, letterSpacing: 1.5 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: 'bold', color: COLORS.textLight, marginBottom: 8, letterSpacing: 1.2 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  inputIconBox: { width: 45, height: 50, backgroundColor: COLORS.metal, justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, height: 50, paddingHorizontal: 15, fontSize: 15, color: COLORS.text },
  eyeButton: { paddingHorizontal: 15, height: 50, justifyContent: 'center' },
  helperText: { fontSize: 11, color: COLORS.textMuted, marginTop: 5, marginLeft: 5 },
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
  guardarButtonDisabled: { opacity: 0.6 },
  guardarButtonText: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', letterSpacing: 1.5 },
});