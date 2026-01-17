// src/screens/admin/ConfigurarColoresScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useTemaStore from '../../store/temaStore';
import useEmpresasStore from '../../store/empresasStore';
import useAuthStore from '../../store/authStore';

export default function ConfigurarColoresScreen({ navigation }) {
  const { colores, cargarTema } = useTemaStore();
  const { actualizarTema } = useEmpresasStore();
  const { empresa } = useAuthStore();

  // Estados para cada color
  const [primary, setPrimary] = useState(colores.primary);
  const [accent, setAccent] = useState(colores.accent);
  const [background, setBackground] = useState(colores.background);
  const [card, setCard] = useState(colores.card);
  const [text, setText] = useState(colores.text);

  const [loading, setLoading] = useState(false);

  // Temas predefinidos
  const temasPresets = [
    {
      nombre: 'Industrial (Default)',
      colores: {
        primary: '#dc2626',
        accent: '#fbbf24',
        background: '#0f0f0f',
        card: '#1a1a1a',
        text: '#ffffff',
      },
    },
    {
      nombre: 'Azul Marino',
      colores: {
        primary: '#1e3a8a',
        accent: '#60a5fa',
        background: '#0c1e3a',
        card: '#1e293b',
        text: '#f1f5f9',
      },
    },
    {
      nombre: 'Verde Esmeralda',
      colores: {
        primary: '#065f46',
        accent: '#34d399',
        background: '#0a1f1a',
        card: '#1a2e26',
        text: '#ecfdf5',
      },
    },
    {
      nombre: 'Morado Oscuro',
      colores: {
        primary: '#6b21a8',
        accent: '#c084fc',
        background: '#1a0a2e',
        card: '#2e1a47',
        text: '#faf5ff',
      },
    },
    {
      nombre: 'Naranja Cálido',
      colores: {
        primary: '#c2410c',
        accent: '#fb923c',
        background: '#1c0f0a',
        card: '#2e1a12',
        text: '#fff7ed',
      },
    },
  ];

  const aplicarPreset = (preset) => {
    setPrimary(preset.colores.primary);
    setAccent(preset.colores.accent);
    setBackground(preset.colores.background);
    setCard(preset.colores.card);
    setText(preset.colores.text);
  };

  const handleGuardar = () => {
    const nuevoTema = {
      primary,
      accent,
      background,
      card,
      text,
    };

    setLoading(true);
    setTimeout(() => {
      // Actualizar en el store de empresas
      actualizarTema(empresa.id, nuevoTema);

      // Aplicar inmediatamente
      cargarTema(nuevoTema);

      setLoading(false);
      Alert.alert(
        '✅ Colores Actualizados',
        'Los nuevos colores se aplicaron correctamente.\n\nTodos los trabajadores de tu empresa verán estos colores.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: card, borderBottomColor: primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>PERSONALIZAR COLORES</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: card, borderLeftColor: accent }]}>
          <Ionicons name="information-circle" size={20} color={accent} />
          <Text style={[styles.infoText, { color: text }]}>
            Los colores se aplicarán a toda tu empresa. Todos los trabajadores verán estos cambios.
          </Text>
        </View>

        {/* Vista Previa */}
        <Text style={[styles.sectionTitle, { color: primary }]}>VISTA PREVIA</Text>

        <View style={[styles.previewCard, { backgroundColor: card }]}>
          <View style={[styles.previewHeader, { borderBottomColor: primary }]}>
            <View style={[styles.previewIconBox, { backgroundColor: primary }]}>
              <Ionicons name="construct" size={24} color={text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.previewTitle, { color: text }]}>Ejemplo de Card</Text>
              <Text style={[styles.previewSubtitle, { color: accent }]}>
                Con colores personalizados
              </Text>
            </View>
          </View>
          <View style={[styles.previewButton, { backgroundColor: primary }]}>
            <Text style={[styles.previewButtonText, { color: text }]}>Botón de Acción</Text>
          </View>
        </View>

        {/* Temas Predefinidos */}
        <Text style={[styles.sectionTitle, { color: primary }]}>TEMAS PREDEFINIDOS</Text>

        <View style={styles.presetsContainer}>
          {temasPresets.map((preset, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.presetCard, { backgroundColor: card }]}
              onPress={() => aplicarPreset(preset)}
            >
              <View style={styles.presetColors}>
                <View style={[styles.presetColor, { backgroundColor: preset.colores.primary }]} />
                <View style={[styles.presetColor, { backgroundColor: preset.colores.accent }]} />
                <View style={[styles.presetColor, { backgroundColor: preset.colores.card }]} />
              </View>
              <Text style={[styles.presetName, { color: text }]}>{preset.nombre}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Colores Personalizados */}
        <Text style={[styles.sectionTitle, { color: primary }]}>COLORES PERSONALIZADOS</Text>

        <View style={styles.coloresGrid}>
          {/* Color Primario */}
          <View style={styles.colorItem}>
            <Text style={[styles.colorLabel, { color: text }]}>COLOR PRIMARIO</Text>
            <View style={styles.colorInputContainer}>
              <View style={[styles.colorPreview, { backgroundColor: primary }]} />
              <TextInput
                style={[styles.colorInput, { backgroundColor: card, color: text }]}
                value={primary}
                onChangeText={setPrimary}
                placeholder="#dc2626"
                placeholderTextColor="#888888"
                maxLength={7}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Color Acento */}
          <View style={styles.colorItem}>
            <Text style={[styles.colorLabel, { color: text }]}>COLOR ACENTO</Text>
            <View style={styles.colorInputContainer}>
              <View style={[styles.colorPreview, { backgroundColor: accent }]} />
              <TextInput
                style={[styles.colorInput, { backgroundColor: card, color: text }]}
                value={accent}
                onChangeText={setAccent}
                placeholder="#fbbf24"
                placeholderTextColor="#888888"
                maxLength={7}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Color Fondo */}
          <View style={styles.colorItem}>
            <Text style={[styles.colorLabel, { color: text }]}>COLOR FONDO</Text>
            <View style={styles.colorInputContainer}>
              <View style={[styles.colorPreview, { backgroundColor: background }]} />
              <TextInput
                style={[styles.colorInput, { backgroundColor: card, color: text }]}
                value={background}
                onChangeText={setBackground}
                placeholder="#0f0f0f"
                placeholderTextColor="#888888"
                maxLength={7}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Color Card */}
          <View style={styles.colorItem}>
            <Text style={[styles.colorLabel, { color: text }]}>COLOR CARDS</Text>
            <View style={styles.colorInputContainer}>
              <View style={[styles.colorPreview, { backgroundColor: card }]} />
              <TextInput
                style={[styles.colorInput, { backgroundColor: card, color: text }]}
                value={card}
                onChangeText={setCard}
                placeholder="#1a1a1a"
                placeholderTextColor="#888888"
                maxLength={7}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Color Texto */}
          <View style={styles.colorItem}>
            <Text style={[styles.colorLabel, { color: text }]}>COLOR TEXTO</Text>
            <View style={styles.colorInputContainer}>
              <View style={[styles.colorPreview, { backgroundColor: text }]} />
              <TextInput
                style={[styles.colorInput, { backgroundColor: card, color: text }]}
                value={text}
                onChangeText={setText}
                placeholder="#ffffff"
                placeholderTextColor="#888888"
                maxLength={7}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <View style={[styles.helperBox, { backgroundColor: card }]}>
          <Ionicons name="bulb" size={18} color={accent} />
          <Text style={[styles.helperText, { color: text }]}>
            💡 Los colores deben estar en formato hexadecimal (Ej: #dc2626)
          </Text>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[styles.guardarButton, { backgroundColor: primary }, loading && styles.guardarButtonDisabled]}
          onPress={handleGuardar}
          disabled={loading}
        >
          <Ionicons name={loading ? 'hourglass' : 'checkmark-circle'} size={24} color={text} />
          <Text style={[styles.guardarButtonText, { color: text }]}>
            {loading ? 'GUARDANDO...' : 'GUARDAR COLORES'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 2,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', letterSpacing: 1.5 },
  scrollContent: { flex: 1 },
  content: { padding: 20 },
  infoBox: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    gap: 10,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 15, marginTop: 10, letterSpacing: 1.5 },
  previewCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#333333',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 2,
    gap: 12,
  },
  previewIconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 3 },
  previewSubtitle: { fontSize: 12 },
  previewButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  previewButtonText: { fontSize: 14, fontWeight: 'bold' },
  presetsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  presetCard: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  presetColors: { flexDirection: 'row', gap: 5, marginBottom: 10 },
  presetColor: { flex: 1, height: 30, borderRadius: 6 },
  presetName: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  coloresGrid: { gap: 15, marginBottom: 20 },
  colorItem: {},
  colorLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  colorInputContainer: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  colorPreview: { width: 50, height: 50, borderRadius: 10, borderWidth: 2, borderColor: '#333333' },
  colorInput: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    fontFamily: 'monospace',
    borderWidth: 1,
    borderColor: '#333333',
  },
  helperBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  helperText: { flex: 1, fontSize: 12 },
  guardarButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: '#991b1b',
  },
  guardarButtonDisabled: { opacity: 0.6 },
  guardarButtonText: { fontSize: 16, fontWeight: 'bold', letterSpacing: 1.5 },
});