import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../../store/authStore';
import { useColores } from '../../hooks/useColores';
import { signIn, getPerfilUsuario } from '../../lib/supabase';
import { obtenerEmpresaPorId } from '../../lib/empresas';
 
export default function LoginScreen() {
  const COLORS = useColores();
  const navigation = useNavigation();
  const gradientBg = [COLORS.background, COLORS.secondary || COLORS.background, COLORS.background];
  const gradientLogo = [COLORS.primary, COLORS.primaryDark];
  const gradientButton = [COLORS.primary, COLORS.primaryDark];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Intentando login con:', username);
      const session = await signIn(username.trim(), password);

      if (!session) {
        Alert.alert(
          'Error de Autenticación',
          'Usuario o contraseña incorrectos.\n\nUsuarios disponibles:\n• jperez / Admin123!\n• mgarcia / Trabajo123!'
        );
        setLoading(false);
        return;
      }

      console.log('✅ Sesión obtenida:', session.user.email);

      console.log('👤 Obteniendo perfil...');
      const perfil = await getPerfilUsuario();

      if (!perfil) {
        Alert.alert('Error', 'No se pudo obtener el perfil del usuario');
        setLoading(false);
        return;
      }

      console.log('✅ Perfil obtenido:', perfil);

            // Verificar si debe cambiar contraseña
      if (perfil.debe_cambiar_password) {
        console.log('🔐 Usuario debe cambiar contraseña - redirigiendo...');
 
        // Guardar datos temporales para la pantalla de cambio de contraseña
        const userData = {
          user: {
            id: perfil.id,
            nombre: perfil.nombre,
            rol: perfil.rol,
            username: perfil.username,
            activo: perfil.activo,
            email: session.user.email,
          },
          empresa: null,
          token: session.access_token,
        };
 
        // Hacer login temporal
        login(userData);
 
        // Navegar a cambiar contraseña
        setLoading(false);
        navigation.navigate('CambiarPassword', { primerLogin: true });
        return;
      }
 
      // Obtener empresa desde Supabase
      let empresaData = null;
      if (perfil.empresa_id) {
        console.log('🏢 Obteniendo empresa desde Supabase...');
        const empresa = await obtenerEmpresaPorId(perfil.empresa_id);
 
        if (empresa) {
          empresaData = {
            id: empresa.id,
            nombre: empresa.nombre,
            ruc: empresa.ruc,
          };
          console.log('✅ Empresa obtenida:', empresaData);
        } else {
          console.warn('⚠️ No se pudo obtener la empresa');
        }
      }
 
      const userData = {
        user: {
          id: perfil.id,
          nombre: perfil.nombre,
          rol: perfil.rol,
          username: perfil.username,
          activo: perfil.activo,
          email: session.user.email,

        },
        empresa: empresaData,
        token: session.access_token,
      };

      login(userData);

      console.log('✅ Login exitoso:', userData);
    } catch (error) {
      console.error('❌ Error completo en login:', error);
      console.error('❌ Error stack:', error.stack);
      Alert.alert('Error', 'Ocurrió un error al iniciar sesión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <LinearGradient
        colors={gradientBg}
        style={styles.background}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={gradientLogo}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="construct" size={45} color={COLORS.text} />
            </LinearGradient>
          </View>

          <Text style={[styles.brandName, { color: COLORS.text, textShadowColor: COLORS.primary }]}>
            SERBUS
          </Text>
          <Text style={[styles.brandTagline, { color: COLORS.textLight }]}>
            SISTEMA DE GESTIÓN VEHICULAR
          </Text>

          <View style={[styles.redLine, { backgroundColor: COLORS.primary }]} />
        </View>

        <View style={[styles.formCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="log-in-outline" size={24} color={COLORS.primary} />
            <Text style={[styles.cardTitle, { color: COLORS.text }]}>ACCESO AL SISTEMA</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.textLight }]}>USUARIO</Text>
            <View style={[styles.inputContainer, { backgroundColor: COLORS.backgroundLight, borderColor: COLORS.border }]}>
              <View style={[styles.inputIconBox, { backgroundColor: COLORS.metal }]}>
                <Ionicons name="person" size={20} color={COLORS.text} />
              </View>
              <TextInput
                style={[styles.input, { color: COLORS.text }]}
                placeholder="Ingresa tu usuario"
                placeholderTextColor={COLORS.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.textLight }]}>CONTRASEÑA</Text>
            <View style={[styles.inputContainer, { backgroundColor: COLORS.backgroundLight, borderColor: COLORS.border }]}>
              <View style={[styles.inputIconBox, { backgroundColor: COLORS.metal }]}>
                <Ionicons name="lock-closed" size={20} color={COLORS.text} />
              </View>
              <TextInput
                style={[styles.input, { color: COLORS.text }]}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { borderColor: COLORS.primary }, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={gradientButton}
              style={styles.loginButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.loginButtonText, { color: COLORS.text }]}>
                {loading ? 'INGRESANDO...' : 'INGRESAR'}
              </Text>
              {!loading && (
                <Ionicons name="arrow-forward" size={22} color={COLORS.text} />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.featuresContainer}>
            <View style={[styles.featureDivider, { backgroundColor: COLORS.border }]} />
            <View style={styles.featuresRow}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="business" size={14} color={COLORS.accent} />
                </View>
                <Text style={[styles.featureText, { color: COLORS.textMuted }]}>Multi-empresa</Text>
              </View>

              <View style={[styles.featureDot, { backgroundColor: COLORS.primary }]} />

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="shield-checkmark" size={14} color={COLORS.statusOk} />
                </View>
                <Text style={[styles.featureText, { color: COLORS.textMuted }]}>Seguro</Text>
              </View>

              <View style={[styles.featureDot, { backgroundColor: COLORS.primary }]} />

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="speedometer" size={14} color={COLORS.primary} />
                </View>
                <Text style={[styles.featureText, { color: COLORS.textMuted }]}>Rápido</Text>
              </View>
            </View>
          </View>

          <View style={styles.testUsersContainer}>
            <Text style={[styles.testUsersTitle, { color: COLORS.textMuted }]}>
              Usuarios de prueba:
            </Text>
            <Text style={[styles.testUserItem, { color: COLORS.textLight }]}>
              • jperez / Admin123! (admin)
            </Text>
            <Text style={[styles.testUserItem, { color: COLORS.textLight }]}>
              • mgarcia / Trabajo123! (trabajador)
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={[styles.footerDivider, { backgroundColor: COLORS.primary }]} />
          <Text style={[styles.footerText, { color: COLORS.textMuted }]}>
            Sistema Profesional de Control de Taller
          </Text>
          <Text style={[styles.version, { color: COLORS.textMuted }]}>
            v1.0.0 • Build 2026 • Powered by Supabase
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 90,
    height: 90,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  brandName: {
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 6,
    marginBottom: 5,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  brandTagline: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
  },
  redLine: {
    width: 80,
    height: 4,
    marginTop: 15,
    borderRadius: 2,
  },
  formCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  inputGroup: {
    marginBottom: 18,
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
    paddingHorizontal: 15,
    height: 50,
    justifyContent: 'center',
  },
  loginButton: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  featuresContainer: {
    marginTop: 25,
  },
  featureDivider: {
    height: 1,
    marginBottom: 15,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featureIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
  },
  featureDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  testUsersContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  testUsersTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  testUserItem: {
    fontSize: 9,
    marginBottom: 3,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerDivider: {
    width: 100,
    height: 2,
    marginBottom: 10,
    borderRadius: 1,
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  version: {
    fontSize: 10,
    fontWeight: '600',
  },
});
