// src/screens/admin/CrearTrabajoScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import useAuthStore from '../../store/authStore';
import { crearTrabajo } from '../../lib/cronograma';
 
export default function CrearTrabajoScreen({ navigation }) {
  const { empresa } = useAuthStore();
  const [nombre, setNombre] = useState('');
  const [entraCronograma, setEntraCronograma] = useState(false);
  const [intervaloDias, setIntervaloDias] = useState('');
  const [intervaloKm, setIntervaloKm] = useState('');
  const [loading, setLoading] = useState(false);

const handleGuardar = async () => {
    // Validaciones
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre del trabajo es obligatorio');
      return;
    }
 
    if (!empresa?.id) {
      Alert.alert('Error', 'No se pudo identificar tu empresa');
      return;
    }
 
    // Si entra a cronograma, validar intervalo de días (km es opcional)
    if (entraCronograma) {
      if (!intervaloDias || intervaloDias === '0') {
        Alert.alert('Error', 'El intervalo en días es obligatorio y debe ser mayor a 0');
        return;
      }
    }
 
    // Guardar en Supabase
    setLoading(true);
    try {
      const trabajo = await crearTrabajo({
        empresa_id: empresa.id,
        nombre: nombre.trim(),
        categoria: entraCronograma ? 'cronograma' : 'historial',
      });
 
      if (!trabajo) {
        Alert.alert('Error', 'No se pudo crear el trabajo. Intenta nuevamente.');
        setLoading(false);
        return;
      }
 
      setLoading(false);
      Alert.alert(
        '✅ Trabajo Creado',
        `Trabajo "${nombre}" registrado correctamente en tu empresa.\n\n` +
        `${entraCronograma ? `📅 Intervalo: ${intervaloDias} días` : '📋 Solo historial'}\n` +
        `${intervaloKm ? `🚗 Intervalo: ${intervaloKm} km (opcional)` : ''}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error guardando trabajo:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar el trabajo');
      setLoading(false);
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
        <Text style={styles.headerTitle}>NUEVO TRABAJO</Text>
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
            Los trabajos que entran a cronograma actualizan automáticamente los mantenimientos preventivos
          </Text>
        </View>

        {/* Nombre del trabajo */}
        <Text style={styles.sectionTitle}>INFORMACIÓN BÁSICA</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>NOMBRE DEL TRABAJO *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="construct" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: Cambio de Arrancador"
              placeholderTextColor={COLORS.textMuted}
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          </View>
          <Text style={styles.helperText}>Debe ser único y descriptivo</Text>
        </View>

        {/* Toggle Cronograma */}
        <Text style={styles.sectionTitle}>CONFIGURACIÓN DE CRONOGRAMA</Text>

        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Ionicons 
              name={entraCronograma ? "calendar" : "calendar-outline"} 
              size={24} 
              color={entraCronograma ? COLORS.primary : COLORS.textMuted} 
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>¿Entra a Cronograma?</Text>
              <Text style={styles.toggleSubtitle}>
                {entraCronograma 
                  ? 'Este trabajo generará alertas preventivas' 
                  : 'Solo se registrará en el historial'}
              </Text>
            </View>
          </View>
          <Switch
            value={entraCronograma}
            onValueChange={setEntraCronograma}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={entraCronograma ? COLORS.text : COLORS.textMuted}
          />
        </View>

        {/* Intervalos (solo si entra a cronograma) */}
        {entraCronograma && (
          <View style={styles.intervalosSection}>
            <View style={styles.warningBox}>
              <Ionicons name="alert-circle" size={18} color={COLORS.statusWarning} />
              <Text style={styles.warningText}>
                El intervalo en días es obligatorio. El kilometraje es opcional.
              </Text>
            </View>

            {/* Intervalo Días */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>INTERVALO EN DÍAS *</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Ionicons name="time" size={20} color={COLORS.text} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 90, 180, 365"
                  placeholderTextColor={COLORS.textMuted}
                  value={intervaloDias}
                  onChangeText={(text) => setIntervaloDias(text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.helperText}>
                Cada cuántos días debe hacerse este trabajo
              </Text>
            </View>

             {/* Intervalo Km - OPCIONAL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>INTERVALO EN KM (Opcional)</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Ionicons name="speedometer" size={20} color={COLORS.text} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 10000, 15000, 30000 (opcional)"
                  placeholderTextColor={COLORS.textMuted}
                  value={intervaloKm}
                  onChangeText={(text) => setIntervaloKm(text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.helperText}>
                Opcional: Cada cuántos km debe hacerse este trabajo
              </Text>
            </View>

            {/* Preview */}
            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Vista Previa:</Text>
              <Text style={styles.previewText}>
                📅 Se hará cada <Text style={styles.previewHighlight}>{intervaloDias || '___'} días</Text>
              </Text>
              <Text style={styles.previewText}>
                🚗 O cada <Text style={styles.previewHighlight}>{intervaloKm ? parseInt(intervaloKm).toLocaleString() : '___'} km</Text>
              </Text>
              <Text style={styles.previewNote}>
                (Lo que ocurra primero)
              </Text>
            </View>
          </View>
        )}

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
            {loading ? 'CREANDO...' : 'CREAR TRABAJO'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
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
  scrollContent: {
    flex: 1,
  },
  content: {
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
  helperText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 5,
    marginLeft: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 3,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  intervalosSection: {
    marginBottom: 20,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.statusWarning,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  warningText: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 12,
  },
  previewBox: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  previewHighlight: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  previewNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 5,
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