// src/screens/admin/EditarTrabajoScreen.js

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
import useTrabajosStore from '../../store/trabajosStore';

export default function EditarTrabajoScreen({ route, navigation }) {
  const { trabajoId } = route.params;
  const { obtenerTrabajo, editarTrabajo, existeNombre } = useTrabajosStore();
  
  const trabajo = obtenerTrabajo(trabajoId);

  const [nombre, setNombre] = useState(trabajo?.nombre || '');
  const [entraCronograma, setEntraCronograma] = useState(trabajo?.entraCronograma || false);
  const [intervaloDias, setIntervaloDias] = useState(trabajo?.intervaloDias?.toString() || '');
  const [intervaloKm, setIntervaloKm] = useState(trabajo?.intervaloKm?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleGuardar = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre del trabajo es obligatorio');
      return;
    }

    if (existeNombre(nombre, trabajoId)) {
      Alert.alert('Error', 'Ya existe otro trabajo con ese nombre');
      return;
    }

    if (entraCronograma) {
      if (!intervaloDias || intervaloDias === '0') {
        Alert.alert('Error', 'El intervalo en días es obligatorio');
        return;
      }
      if (!intervaloKm || intervaloKm === '0') {
        Alert.alert('Error', 'El intervalo en km es obligatorio');
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      editarTrabajo(trabajoId, {
        nombre: nombre.trim(),
        entraCronograma,
        intervaloDias: entraCronograma ? parseInt(intervaloDias) : null,
        intervaloKm: entraCronograma ? parseInt(intervaloKm) : null,
      });

      setLoading(false);
      Alert.alert('Éxito', 'Trabajo actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1000);
  };

  if (!trabajo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Trabajo no encontrado</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EDITAR TRABAJO</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={20} color={COLORS.statusWarning} />
          <Text style={styles.warningText}>
            Cambiar los intervalos afectará el cronograma de todos los buses
          </Text>
        </View>

        <Text style={styles.sectionTitle}>INFORMACIÓN BÁSICA</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>NOMBRE DEL TRABAJO *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="construct" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nombre del trabajo"
              placeholderTextColor={COLORS.textMuted}
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          </View>
        </View>

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
                {entraCronograma ? 'Genera alertas preventivas' : 'Solo historial'}
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

        {entraCronograma && (
          <View style={styles.intervalosSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>INTERVALO EN DÍAS *</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Ionicons name="time" size={20} color={COLORS.text} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Días"
                  placeholderTextColor={COLORS.textMuted}
                  value={intervaloDias}
                  onChangeText={(text) => setIntervaloDias(text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>INTERVALO EN KM *</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Ionicons name="speedometer" size={20} color={COLORS.text} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Kilómetros"
                  placeholderTextColor={COLORS.textMuted}
                  value={intervaloKm}
                  onChangeText={(text) => setIntervaloKm(text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        )}

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
    borderLeftColor: COLORS.statusWarning,
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
  toggleInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  toggleTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginBottom: 3 },
  toggleSubtitle: { fontSize: 12, color: COLORS.textMuted },
  intervalosSection: { marginBottom: 20 },
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