// src/screens/auth/CambiarPasswordScreen.js
 
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColores } from '../../hooks/useColores';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
 
export default function CambiarPasswordScreen({ navigation, route }) {
  const COLORS = useColores();
  const { user, logout } = useAuthStore();
  const { primerLogin = false } = route.params || {};
 
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showPasswordNueva, setShowPasswordNueva] = useState(false);
  const [showPasswordConfirmar, setShowPasswordConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
 
  const validarPassword = (password) => {
    if (password.length < 6) {
      return { valido: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
    }
    return { valido: true };
  };
 
  const handleCambiarPassword = async () => {
    // Validaciones
    if (!passwordActual.trim()) {
      Alert.alert('Error', 'Ingresa tu contraseña actual');
      return;
    }
 
    if (!passwordNueva.trim()) {
      Alert.alert('Error', 'Ingresa tu nueva contraseña');
      return;
    }
 
    if (!passwordConfirmar.trim()) {
      Alert.alert('Error', 'Confirma tu nueva contraseña');
      return;
    }
 
    // Validar longitud de nueva contraseña
    const validacion = validarPassword(passwordNueva);
    if (!validacion.valido) {
      Alert.alert('Error', validacion.mensaje);
      return;
    }
 
    // Validar que las contraseñas coincidan
    if (passwordNueva !== passwordConfirmar) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }
 
    // Validar que la nueva contraseña sea diferente a la actual
    if (passwordActual === passwordNueva) {
      Alert.alert('Error', 'La nueva contraseña debe ser diferente a la actual');
      return;
    }
 
    setLoading(true);
 
    try {
      console.log('🔐 Cambiando contraseña...');
 
      // Verificar la contraseña actual intentando hacer login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email || `${user.username}@gmail.com`,
        password: passwordActual,
      });
 
      if (authError) {
        console.error('❌ Error verificando contraseña actual:', authError.message);
        Alert.alert('Error', 'La contraseña actual es incorrecta');
        setLoading(false);
        return;
      }
 
      // Actualizar la contraseña en Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordNueva,
      });
 
      if (updateError) {
        console.error('❌ Error actualizando contraseña:', updateError.message);
        Alert.alert('Error', 'No se pudo actualizar la contraseña. Intenta nuevamente.');
        setLoading(false);
        return;
      }
 
      // Marcar que ya no debe cambiar contraseña
      const { error: perfilError } = await supabase
        .from('perfiles')
        .update({ debe_cambiar_password: false })
        .eq('id', user.id);
 
      if (perfilError) {
        console.error('❌ Error actualizando perfil:', perfilError.message);
      }
 
      console.log('✅ Contraseña actualizada correctamente');
 
      if (primerLogin) {
        // Si es primer login, cerrar sesión ANTES de mostrar el alert
        console.log('🚪 Cerrando sesión...');
 
        // Cerrar sesión de Supabase primero
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          console.error('❌ Error en signOut:', signOutError);
        }
        console.log('✅ SignOut de Supabase completado');
 
        // Luego cerrar sesión local
        logout();
        console.log('✅ Logout local completado - isAuthenticated debería ser false ahora');
 
        setLoading(false);
 
        // Forzar reset de navegación al LoginScreen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
 
        // Mostrar mensaje después de resetear navegación
        setTimeout(() => {
          Alert.alert(
            '✅ Contraseña Actualizada',
            'Tu contraseña ha sido cambiada exitosamente. Por favor, vuelve a iniciar sesión con tu nueva contraseña.'
          );
        }, 500);
      } else {
        setLoading(false);
        // Si es cambio manual, mostrar mensaje y volver
        Alert.alert(
          '✅ Contraseña Actualizada',
          'Tu contraseña ha sido cambiada exitosamente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error en cambio de contraseña:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta nuevamente.');
      setLoading(false);
    }
  };
 
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.gradient}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            {!primerLogin && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
            )}
            <Ionicons name="key" size={50} color={COLORS.text} />
            <Text style={[styles.title, { color: COLORS.text }]}>
              {primerLogin ? 'CAMBIAR CONTRASEÑA' : 'ACTUALIZAR CONTRASEÑA'}
            </Text>
            {primerLogin && (
              <Text style={[styles.subtitle, { color: COLORS.textLight }]}>
                Por seguridad, debes cambiar tu contraseña
              </Text>
            )}
          </View>
 
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Info Box */}
            {primerLogin && (
              <View style={[styles.infoBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
                <Ionicons name="information-circle" size={24} color={COLORS.statusWarning} />
                <Text style={[styles.infoText, { color: COLORS.textLight }]}>
                  Esta es tu primera vez iniciando sesión. Por favor, cambia tu contraseña temporal por una segura.
                </Text>
              </View>
            )}
 
            {/* Usuario */}
            <View style={[styles.userBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
              <Ionicons name="person" size={20} color={COLORS.accent} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.userLabel, { color: COLORS.textMuted }]}>USUARIO</Text>
                <Text style={[styles.userName, { color: COLORS.text }]}>
                  {user?.nombre || 'Usuario'}
                </Text>
                <Text style={[styles.userUsername, { color: COLORS.textLight }]}>
                  @{user?.username}
                </Text>
              </View>
            </View>
 
            {/* Contraseña Actual */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: COLORS.textLight }]}>CONTRASEÑA ACTUAL *</Text>
              <View style={[styles.inputContainer, { backgroundColor: COLORS.backgroundLight, borderColor: COLORS.border }]}>
                <View style={[styles.inputIconBox, { backgroundColor: COLORS.metal }]}>
                  <Ionicons name="lock-closed" size={20} color={COLORS.text} />
                </View>
                <TextInput
                  style={[styles.input, { color: COLORS.text }]}
                  placeholder="Tu contraseña actual"
                  placeholderTextColor={COLORS.textMuted}
                  value={passwordActual}
                  onChangeText={setPasswordActual}
                  secureTextEntry={!showPasswordActual}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPasswordActual(!showPasswordActual)}
                >
                  <Ionicons
                    name={showPasswordActual ? 'eye-off' : 'eye'}
                    size={22}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>
 
            {/* Nueva Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: COLORS.textLight }]}>NUEVA CONTRASEÑA *</Text>
              <View style={[styles.inputContainer, { backgroundColor: COLORS.backgroundLight, borderColor: COLORS.border }]}>
                <View style={[styles.inputIconBox, { backgroundColor: COLORS.metal }]}>
                  <Ionicons name="lock-closed" size={20} color={COLORS.text} />
                </View>
                <TextInput
                  style={[styles.input, { color: COLORS.text }]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={COLORS.textMuted}
                  value={passwordNueva}
                  onChangeText={setPasswordNueva}
                  secureTextEntry={!showPasswordNueva}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPasswordNueva(!showPasswordNueva)}
                >
                  <Ionicons
                    name={showPasswordNueva ? 'eye-off' : 'eye'}
                    size={22}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>
 
            {/* Confirmar Nueva Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: COLORS.textLight }]}>CONFIRMAR NUEVA CONTRASEÑA *</Text>
              <View style={[styles.inputContainer, { backgroundColor: COLORS.backgroundLight, borderColor: COLORS.border }]}>
                <View style={[styles.inputIconBox, { backgroundColor: COLORS.metal }]}>
                  <Ionicons name="lock-closed" size={20} color={COLORS.text} />
                </View>
                <TextInput
                  style={[styles.input, { color: COLORS.text }]}
                  placeholder="Repite la nueva contraseña"
                  placeholderTextColor={COLORS.textMuted}
                  value={passwordConfirmar}
                  onChangeText={setPasswordConfirmar}
                  secureTextEntry={!showPasswordConfirmar}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPasswordConfirmar(!showPasswordConfirmar)}
                >
                  <Ionicons
                    name={showPasswordConfirmar ? 'eye-off' : 'eye'}
                    size={22}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>
 
            {/* Requisitos */}
            <View style={[styles.requirementsBox, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
              <Text style={[styles.requirementsTitle, { color: COLORS.textLight }]}>
                REQUISITOS DE CONTRASEÑA:
              </Text>
              <View style={styles.requirementRow}>
                <Ionicons
                  name={passwordNueva.length >= 6 ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={passwordNueva.length >= 6 ? COLORS.statusOk : COLORS.textMuted}
                />
                <Text style={[styles.requirementText, { color: COLORS.textLight }]}>
                  Mínimo 6 caracteres
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <Ionicons
                  name={passwordNueva === passwordConfirmar && passwordNueva.length > 0 ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={passwordNueva === passwordConfirmar && passwordNueva.length > 0 ? COLORS.statusOk : COLORS.textMuted}
                />
                <Text style={[styles.requirementText, { color: COLORS.textLight }]}>
                  Las contraseñas coinciden
                </Text>
              </View>
            </View>
 
            {/* Botón */}
            <TouchableOpacity
              style={[
                styles.cambiarButton,
                { backgroundColor: COLORS.accent },
                loading && styles.cambiarButtonDisabled,
              ]}
              onPress={handleCambiarPassword}
              disabled={loading}
            >
              <Ionicons
                name={loading ? 'hourglass' : 'checkmark-circle'}
                size={24}
                color={COLORS.text}
              />
              <Text style={[styles.cambiarButtonText, { color: COLORS.text }]}>
                {loading ? 'CAMBIANDO...' : 'CAMBIAR CONTRASEÑA'}
              </Text>
            </TouchableOpacity>
 
            <View style={{ height: 30 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
 
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA000',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  userBox: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    gap: 12,
    marginBottom: 25,
    borderWidth: 1,
    alignItems: 'center',
  },
  userLabel: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 3,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  inputIconBox: {
    width: 45,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 15,
  },
  eyeButton: {
    width: 45,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementsBox: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
  },
  requirementsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
  },
  cambiarButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  cambiarButtonDisabled: {
    opacity: 0.6,
  },
  cambiarButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});