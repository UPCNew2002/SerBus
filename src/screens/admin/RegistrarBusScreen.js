// src/screens/admin/RegistrarBusScreen.js

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
import useAuthStore from '../../store/authStore';
import { crearBus } from '../../lib/cronograma';

export default function RegistrarBusScreen({ navigation }) {
  const { empresa } = useAuthStore();

  // Estados del formulario
  const [placa, setPlaca] = useState('');
  const [vin, setVin] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [color, setColor] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [loading, setLoading] = useState(false);

  // Validar y guardar
  const handleGuardar = async () => {
    // Validaciones
    if (!placa.trim()) {
      Alert.alert('Error', 'La placa es obligatoria');
      return;
    }

    // Validar formato de placa (puede ser ABC-123 o ABC1234)
    if (placa.trim().length < 6) {
      Alert.alert('Error', 'La placa debe tener al menos 6 caracteres');
      return;
    }

    // Año debe ser válido si se proporciona
    if (anio && (parseInt(anio) < 1900 || parseInt(anio) > new Date().getFullYear() + 1)) {
      Alert.alert('Error', 'El año debe estar entre 1900 y ' + (new Date().getFullYear() + 1));
      return;
    }

    // Confirmar guardado
    Alert.alert(
      'Confirmar Registro',
      `¿Deseas registrar el bus ${placa}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Registrar',
          onPress: () => guardarBus()
        }
      ]
    );
  };

  const guardarBus = async () => {
    setLoading(true);
    try {
      const bus = await crearBus({
        empresa_id: empresa.id,
        placa: placa.trim().toUpperCase(),
        vin: vin.trim() || null, // VIN es opcional
        marca: marca.trim() || null,
        modelo: modelo.trim() || null,
        anio: anio ? parseInt(anio) : null,
        color: color.trim() || null,
        kilometraje_actual: kilometraje ? parseInt(kilometraje) : 0,
      });

      if (!bus) {
        Alert.alert('Error', 'No se pudo registrar el bus. Intenta nuevamente.');
        setLoading(false);
        return;
      }

      // Mostrar éxito
      Alert.alert(
        '✅ Bus Registrado',
        `Bus ${placa} registrado correctamente en la flota\n\n` +
        `${marca ? `Marca: ${marca}\n` : ''}` +
        `${modelo ? `Modelo: ${modelo}\n` : ''}` +
        `${anio ? `Año: ${anio}\n` : ''}` +
        `${kilometraje ? `Kilometraje: ${parseInt(kilometraje).toLocaleString()} km` : 'Kilometraje inicial: 0 km'}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error guardando bus:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar el bus. Revisa la consola.');
    } finally {
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
        <Text style={styles.headerTitle}>REGISTRAR BUS</Text>
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
            Solo la placa es obligatoria. Los demás campos son opcionales.
          </Text>
        </View>

        {/* SECCIÓN: DATOS DEL VEHÍCULO */}
        <Text style={styles.sectionTitle}>DATOS DEL VEHÍCULO</Text>

        {/* Placa */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>PLACA *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="car" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: ABC-123 o ABC1234"
              placeholderTextColor={COLORS.textMuted}
              value={placa}
              onChangeText={(text) => setPlaca(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
            />
          </View>
          <Text style={styles.helperText}>
            Ingresa la placa del bus
          </Text>
        </View>

        {/* VIN */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>VIN (Opcional)</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="barcode" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Número de Identificación del Vehículo"
              placeholderTextColor={COLORS.textMuted}
              value={vin}
              onChangeText={(text) => setVin(text.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              autoCapitalize="characters"
              maxLength={17}
            />
          </View>
          <Text style={styles.helperText}>
            {vin.length > 0 ? `${vin.length}/17 caracteres` : 'VIN de 17 caracteres (opcional)'}
          </Text>
        </View>

        {/* Marca */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>MARCA (Opcional)</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="business" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: Mercedes-Benz, Volvo, Scania"
              placeholderTextColor={COLORS.textMuted}
              value={marca}
              onChangeText={setMarca}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Modelo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>MODELO (Opcional)</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="construct" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: OF-1721, B9R, K360"
              placeholderTextColor={COLORS.textMuted}
              value={modelo}
              onChangeText={setModelo}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Año */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>AÑO (Opcional)</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="calendar" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: 2020"
              placeholderTextColor={COLORS.textMuted}
              value={anio}
              onChangeText={(text) => setAnio(text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
          <Text style={styles.helperText}>
            Año de fabricación del bus
          </Text>
        </View>

        {/* Color */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>COLOR (Opcional)</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="color-palette" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: Blanco, Rojo, Azul"
              placeholderTextColor={COLORS.textMuted}
              value={color}
              onChangeText={setColor}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Kilometraje */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>KILOMETRAJE ACTUAL (Opcional)</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="speedometer" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: 50000"
              placeholderTextColor={COLORS.textMuted}
              value={kilometraje}
              onChangeText={(text) => setKilometraje(text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.helperText}>
            {kilometraje ? `${parseInt(kilometraje).toLocaleString()} km` : 'Si no se ingresa, se iniciará en 0 km'}
          </Text>
        </View>

        {/* Vista Previa */}
        <Text style={styles.sectionTitle}>VISTA PREVIA</Text>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={styles.previewIconBox}>
              <Ionicons name="bus" size={28} color={COLORS.primary} />
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewPlaca}>
                {placa || 'Sin placa'}
              </Text>
              <Text style={styles.previewDetalle}>
                {marca || 'Sin marca'} {modelo || 'Sin modelo'} {anio ? `(${anio})` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.previewBody}>
            <View style={styles.previewRow}>
              <Ionicons name="barcode-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.previewLabel}>VIN:</Text>
              <Text style={styles.previewValue}>{vin || '(Sin VIN)'}</Text>
            </View>
            <View style={styles.previewRow}>
              <Ionicons name="color-palette-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.previewLabel}>Color:</Text>
              <Text style={styles.previewValue}>{color || 'No especificado'}</Text>
            </View>
            <View style={styles.previewRow}>
              <Ionicons name="speedometer-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.previewLabel}>Kilometraje:</Text>
              <Text style={styles.previewValue}>
                {kilometraje ? parseInt(kilometraje).toLocaleString() : '0'} km
              </Text>
            </View>
          </View>
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
            {loading ? 'REGISTRANDO...' : 'REGISTRAR BUS'}
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
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary, marginBottom: 15, marginTop: 10, letterSpacing: 1.5 },
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
  helperText: { fontSize: 11, color: COLORS.textMuted, marginTop: 5, marginLeft: 5 },
  previewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  previewIconBox: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInfo: { flex: 1 },
  previewPlaca: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 3 },
  previewDetalle: { fontSize: 13, color: COLORS.textLight },
  previewBody: { padding: 15, gap: 10 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewLabel: { fontSize: 13, color: COLORS.textMuted, marginRight: 5 },
  previewValue: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  guardarButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
  },
  guardarButtonDisabled: { opacity: 0.6 },
  guardarButtonText: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', letterSpacing: 1.5 },
});
