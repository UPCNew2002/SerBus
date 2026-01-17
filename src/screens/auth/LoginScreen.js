// src/screens/auth/LoginScreen.js
// DISEÑO PROFESIONAL TALLER MECÁNICO

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import useUsuariosStore from '../../store/usuariosStore';
import { useColores } from '../../hooks/useColores';
import useEmpresasStore from '../../store/empresasStore';

export default function LoginScreen() {
  const COLORS = useColores();
  
  // 👇 FIX: Variables para LinearGradient
  const gradientBg = [COLORS.background, COLORS.secondary || COLORS.background, COLORS.background];
  const gradientLogo = [COLORS.primary, COLORS.primaryDark];
  const gradientButton = [COLORS.primary, COLORS.primaryDark];
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { usuarios } = useUsuariosStore();
  const { empresas } = useEmpresasStore();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      alert('Completa todos los campos');
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      
      let userData;
      
      if (email.toLowerCase() === 'superadmin' || email.toLowerCase() === 'super') {
        userData = {
          user: { id: 1, nombre: 'Super Admin', rol: 'super_admin' },
          empresa: null,
          token: 'token_super_admin_demo',
        };
      } else if (email.toLowerCase() === 'admin') {
        // Obtener empresa completa con tema
        const empresaCompleta = empresas.find((e) => e.id === 1);
        
        userData = {
          user: { id: 2, nombre: 'Admin Taller', rol: 'admin' },
          empresa: empresaCompleta || { id: 1, nombre: 'Transportes ABC' },
          token: 'token_admin_demo',
        };
      } else {
        const usuarioEncontrado = usuarios.find(
          (u) => u.usuario.toLowerCase() === email.toLowerCase() && 
                 u.password === password &&
                 u.activo
        );

        if (usuarioEncontrado) {
          // Obtener empresa completa con tema
          const empresaCompleta = empresas.find((e) => e.id === usuarioEncontrado.empresaId);
          
          userData = {
            user: { 
              id: usuarioEncontrado.id, 
              nombre: usuarioEncontrado.nombre, 
              rol: usuarioEncontrado.rol 
            },
            empresa: empresaCompleta || { id: usuarioEncontrado.empresaId, nombre: 'Transportes ABC' },
            token: `token_${usuarioEncontrado.usuario}_demo`,
          };
        } else {
          alert('Usuario o contraseña incorrectos\n\nPrueba:\n• superadmin\n• admin\n• O un trabajador creado');
          return;
        }
      }
      
      login(userData);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Background industrial */}
      <LinearGradient
        colors={gradientBg}
        style={styles.background}
      >
        {/* Header con logo industrial */}
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
          
          {/* Línea roja característica */}
          <View style={[styles.redLine, { backgroundColor: COLORS.primary }]} />
        </View>

        {/* Form Card Industrial */}
        <View style={[styles.formCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="log-in-outline" size={24} color={COLORS.primary} />
            <Text style={[styles.cardTitle, { color: COLORS.text }]}>ACCESO AL SISTEMA</Text>
          </View>

          {/* Input Usuario */}
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
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Input Contraseña */}
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

          {/* Botón Login */}
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

          {/* Features del sistema */}
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
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={[styles.footerDivider, { backgroundColor: COLORS.primary }]} />
          <Text style={[styles.footerText, { color: COLORS.textMuted }]}>
            Sistema Profesional de Control de Taller
          </Text>
          <Text style={[styles.version, { color: COLORS.textMuted }]}>
            v1.0.0 • Build 2026
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