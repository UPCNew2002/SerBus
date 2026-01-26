// src/screens/admin/EditarUsuarioScreen.js

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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import {
  obtenerUsuarioPorId,
  actualizarUsuario,
  verificarUsernameExiste,
} from '../../lib/usuarios';
 
export default function EditarUsuarioScreen({ route, navigation }) {
  const { usuarioId } = route.params;
 
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState('');
  const [usuarioNombre, setUsuarioNombre] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
 
  // Cargar usuario desde Supabase
  useEffect(() => {
    const cargarUsuario = async () => {
      setCargando(true);
      const data = await obtenerUsuarioPorId(usuarioId);
      if (data) {
        setUsuario(data);
        setNombre(data.nombre);
        setUsuarioNombre(data.username);
      }
      setCargando(false);
    };
 
    cargarUsuario();
  }, [usuarioId]);

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre completo es obligatorio');
      return;
    }
 
    if (!usuarioNombre.trim()) {
      Alert.alert('Error', 'El nombre de usuario es obligatorio');
      return;
    }
 
    // Verificar si el username ya existe (excluyendo el usuario actual)
    if (usuarioNombre.toLowerCase() !== usuario.username.toLowerCase()) {
      const existe = await verificarUsernameExiste(usuarioNombre);
      if (existe) {
        Alert.alert('Error', 'Ya existe otro usuario con ese nombre');
        return;
      }
    }
 
    setLoading(true);
 
    const datosActualizar = {
      nombre: nombre.trim(),
      username: usuarioNombre.trim().toLowerCase(),
    };
 
    const exito = await actualizarUsuario(usuarioId, datosActualizar);
 
    setLoading(false);
 
    if (exito) {
      Alert.alert('Éxito', 'Usuario actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', 'No se pudo actualizar el usuario');
    }
  };
  if (cargando) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando usuario...</Text>
      </View>
    );
  }
  if (!usuario) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Usuario no encontrado</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EDITAR TRABAJADOR</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.warningBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.accent} />
          <Text style={styles.warningText}>
            Solo puedes editar el nombre y usuario. Para cambiar contraseñas, el usuario debe hacerlo desde su perfil.
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
              placeholder="Nombre completo"
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
              placeholder="Usuario"
              placeholderTextColor={COLORS.textMuted}
              value={usuarioNombre}
              onChangeText={(text) => setUsuarioNombre(text.toLowerCase().replace(/\s/g, ''))}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.guardarButton, loading && styles.guardarButtonDisabled]}
          onPress={handleGuardar}
          disabled={loading}
        >
          <Ionicons name={loading ? 'hourglass' : 'save'} size={24} color={COLORS.text} />
          <Text style={styles.guardarButtonText}>
            {loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 14, color: COLORS.textMuted },
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
  warningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  warningText: { flex: 1, color: COLORS.textLight, fontSize: 13, lineHeight: 18 },
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
  errorText: { color: COLORS.statusDanger, textAlign: 'center', marginTop: 50 },
});