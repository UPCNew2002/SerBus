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
import useAuthStore from '../../store/authStore';
import { actualizarTemaEmpresa } from '../../lib/empresas';

export default function ConfigurarColoresScreen({ navigation }) {
  // ✅ CRITICAL: Usar selectores específicos para evitar loops infinitos
  const colores = useTemaStore((state) => state.colores);
  const cargarTema = useTemaStore((state) => state.cargarTema);
  const empresaId = useAuthStore((state) => state.empresa?.id);

  // Estados para cada color
  const [primary, setPrimary] = useState(colores.primary);
  const [secondary, setSecondary] = useState(colores.secondary);
  const [accent, setAccent] = useState(colores.accent);
  const [background, setBackground] = useState(colores.background);
  const [backgroundLight, setBackgroundLight] = useState(colores.backgroundLight);
  const [card, setCard] = useState(colores.card);
  const [text, setText] = useState(colores.text);
  const [textLight, setTextLight] = useState(colores.textLight);
  const [textMuted, setTextMuted] = useState(colores.textMuted);
  const [border, setBorder] = useState(colores.border);

  const [loading, setLoading] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [modoOscuro, setModoOscuro] = useState(true);

  // HSL Controls
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(70);
  const [lightness, setLightness] = useState(50);

  // ════════════════════════════════════════════════════════
  // 24 TEMAS PROFESIONALES - 5 CATEGORÍAS
  // ════════════════════════════════════════════════════════

  const temasPresets = [
    // ─────────────────────────────────────────────────────
    // CATEGORÍA: INDUSTRIAL (5 temas)
    // ─────────────────────────────────────────────────────
    {
      nombre: 'Industrial Rojo',
      categoria: 'Industrial',
      colores: {
        primary: '#dc2626',
        secondary: '#0a0a0a',
        accent: '#fbbf24',
        background: '#0f0f0f',
        backgroundLight: '#1e1e1e',
        card: '#1a1a1a',
        text: '#ffffff',
        textLight: '#e5e5e5',
        textMuted: '#888888',
        border: '#333333',
      },
    },
    {
      nombre: 'Hierro Forjado',
      categoria: 'Industrial',
      colores: {
        primary: '#78716c',
        secondary: '#292524',
        accent: '#e7e5e4',
        background: '#1c1917',
        backgroundLight: '#292524',
        card: '#262626',
        text: '#fafaf9',
        textLight: '#e7e5e4',
        textMuted: '#a8a29e',
        border: '#44403c',
      },
    },
    {
      nombre: 'Acero Inoxidable',
      categoria: 'Industrial',
      colores: {
        primary: '#64748b',
        secondary: '#1e293b',
        accent: '#38bdf8',
        background: '#0f172a',
        backgroundLight: '#1e293b',
        card: '#1e293b',
        text: '#f1f5f9',
        textLight: '#cbd5e1',
        textMuted: '#94a3b8',
        border: '#334155',
      },
    },
    {
      nombre: 'Cobre Oxidado',
      categoria: 'Industrial',
      colores: {
        primary: '#b45309',
        secondary: '#451a03',
        accent: '#f59e0b',
        background: '#1c0f05',
        backgroundLight: '#292012',
        card: '#292012',
        text: '#fef3c7',
        textLight: '#fde68a',
        textMuted: '#ca8a04',
        border: '#78350f',
      },
    },
    {
      nombre: 'Titanio',
      categoria: 'Industrial',
      colores: {
        primary: '#71717a',
        secondary: '#18181b',
        accent: '#d4d4d8',
        background: '#09090b',
        backgroundLight: '#18181b',
        card: '#27272a',
        text: '#fafafa',
        textLight: '#e4e4e7',
        textMuted: '#a1a1aa',
        border: '#3f3f46',
      },
    },

    // ─────────────────────────────────────────────────────
    // CATEGORÍA: MODERNO (5 temas)
    // ─────────────────────────────────────────────────────
    {
      nombre: 'Azul Moderno',
      categoria: 'Moderno',
      colores: {
        primary: '#2563eb',
        secondary: '#1e3a8a',
        accent: '#60a5fa',
        background: '#0c1e3a',
        backgroundLight: '#1e293b',
        card: '#1e293b',
        text: '#f1f5f9',
        textLight: '#cbd5e1',
        textMuted: '#94a3b8',
        border: '#334155',
      },
    },
    {
      nombre: 'Cian Tech',
      categoria: 'Moderno',
      colores: {
        primary: '#06b6d4',
        secondary: '#164e63',
        accent: '#22d3ee',
        background: '#083344',
        backgroundLight: '#0e4a5f',
        card: '#155e75',
        text: '#ecfeff',
        textLight: '#cffafe',
        textMuted: '#67e8f9',
        border: '#0891b2',
      },
    },
    {
      nombre: 'Morado Futurista',
      categoria: 'Moderno',
      colores: {
        primary: '#8b5cf6',
        secondary: '#5b21b6',
        accent: '#a78bfa',
        background: '#1e1b4b',
        backgroundLight: '#312e81',
        card: '#312e81',
        text: '#f5f3ff',
        textLight: '#ede9fe',
        textMuted: '#c4b5fd',
        border: '#6d28d9',
      },
    },
    {
      nombre: 'Índigo Digital',
      categoria: 'Moderno',
      colores: {
        primary: '#4f46e5',
        secondary: '#3730a3',
        accent: '#818cf8',
        background: '#1e1b4b',
        backgroundLight: '#312e81',
        card: '#312e81',
        text: '#eef2ff',
        textLight: '#e0e7ff',
        textMuted: '#a5b4fc',
        border: '#4338ca',
      },
    },
    {
      nombre: 'Magenta Tech',
      categoria: 'Moderno',
      colores: {
        primary: '#d946ef',
        secondary: '#86198f',
        accent: '#e879f9',
        background: '#3b0764',
        backgroundLight: '#581c87',
        card: '#701a75',
        text: '#fdf4ff',
        textLight: '#fae8ff',
        textMuted: '#f0abfc',
        border: '#a21caf',
      },
    },

    // ─────────────────────────────────────────────────────
    // CATEGORÍA: ELEGANTE (5 temas)
    // ─────────────────────────────────────────────────────
    {
      nombre: 'Oro Negro',
      categoria: 'Elegante',
      colores: {
        primary: '#eab308',
        secondary: '#713f12',
        accent: '#fde047',
        background: '#1c1917',
        backgroundLight: '#292524',
        card: '#292524',
        text: '#fef9c3',
        textLight: '#fef08a',
        textMuted: '#facc15',
        border: '#a16207',
      },
    },
    {
      nombre: 'Plata Premium',
      categoria: 'Elegante',
      colores: {
        primary: '#e5e7eb',
        secondary: '#1f2937',
        accent: '#f9fafb',
        background: '#111827',
        backgroundLight: '#1f2937',
        card: '#374151',
        text: '#f9fafb',
        textLight: '#f3f4f6',
        textMuted: '#d1d5db',
        border: '#6b7280',
      },
    },
    {
      nombre: 'Bronce Clásico',
      categoria: 'Elegante',
      colores: {
        primary: '#ca8a04',
        secondary: '#78350f',
        accent: '#fbbf24',
        background: '#292012',
        backgroundLight: '#3a2c1a',
        card: '#44403c',
        text: '#fef3c7',
        textLight: '#fde68a',
        textMuted: '#fcd34d',
        border: '#92400e',
      },
    },
    {
      nombre: 'Platino',
      categoria: 'Elegante',
      colores: {
        primary: '#cbd5e1',
        secondary: '#0f172a',
        accent: '#f1f5f9',
        background: '#020617',
        backgroundLight: '#0f172a',
        card: '#1e293b',
        text: '#f8fafc',
        textLight: '#f1f5f9',
        textMuted: '#cbd5e1',
        border: '#475569',
      },
    },
    {
      nombre: 'Champagne',
      categoria: 'Elegante',
      colores: {
        primary: '#f59e0b',
        secondary: '#78350f',
        accent: '#fbbf24',
        background: '#1c1410',
        backgroundLight: '#292116',
        card: '#3a2e1c',
        text: '#fffbeb',
        textLight: '#fef3c7',
        textMuted: '#fde68a',
        border: '#92400e',
      },
    },

    // ─────────────────────────────────────────────────────
    // CATEGORÍA: VIBRANTE (5 temas)
    // ─────────────────────────────────────────────────────
    {
      nombre: 'Verde Neón',
      categoria: 'Vibrante',
      colores: {
        primary: '#22c55e',
        secondary: '#14532d',
        accent: '#4ade80',
        background: '#052e16',
        backgroundLight: '#14532d',
        card: '#166534',
        text: '#f0fdf4',
        textLight: '#dcfce7',
        textMuted: '#86efac',
        border: '#15803d',
      },
    },
    {
      nombre: 'Naranja Energía',
      categoria: 'Vibrante',
      colores: {
        primary: '#f97316',
        secondary: '#7c2d12',
        accent: '#fb923c',
        background: '#1c0f0a',
        backgroundLight: '#2e1a12',
        card: '#431407',
        text: '#fff7ed',
        textLight: '#ffedd5',
        textMuted: '#fdba74',
        border: '#c2410c',
      },
    },
    {
      nombre: 'Rosa Eléctrico',
      categoria: 'Vibrante',
      colores: {
        primary: '#ec4899',
        secondary: '#831843',
        accent: '#f472b6',
        background: '#500724',
        backgroundLight: '#831843',
        card: '#9f1239',
        text: '#fdf2f8',
        textLight: '#fce7f3',
        textMuted: '#f9a8d4',
        border: '#be123c',
      },
    },
    {
      nombre: 'Amarillo Solar',
      categoria: 'Vibrante',
      colores: {
        primary: '#facc15',
        secondary: '#713f12',
        accent: '#fde047',
        background: '#1a1205',
        backgroundLight: '#2e1f0a',
        card: '#422d0f',
        text: '#fefce8',
        textLight: '#fef9c3',
        textMuted: '#fef08a',
        border: '#a16207',
      },
    },
    {
      nombre: 'Rojo Intenso',
      categoria: 'Vibrante',
      colores: {
        primary: '#ef4444',
        secondary: '#7f1d1d',
        accent: '#f87171',
        background: '#1c0a0a',
        backgroundLight: '#2e1212',
        card: '#450a0a',
        text: '#fef2f2',
        textLight: '#fee2e2',
        textMuted: '#fca5a5',
        border: '#b91c1c',
      },
    },

    // ─────────────────────────────────────────────────────
    // CATEGORÍA: NATURAL (4 temas)
    // ─────────────────────────────────────────────────────
    {
      nombre: 'Bosque Oscuro',
      categoria: 'Natural',
      colores: {
        primary: '#16a34a',
        secondary: '#14532d',
        accent: '#4ade80',
        background: '#0a1f0a',
        backgroundLight: '#14532d',
        card: '#166534',
        text: '#f0fdf4',
        textLight: '#dcfce7',
        textMuted: '#86efac',
        border: '#15803d',
      },
    },
    {
      nombre: 'Tierra Profunda',
      categoria: 'Natural',
      colores: {
        primary: '#92400e',
        secondary: '#451a03',
        accent: '#d97706',
        background: '#1c0f05',
        backgroundLight: '#292012',
        card: '#451a03',
        text: '#fffbeb',
        textLight: '#fef3c7',
        textMuted: '#fde68a',
        border: '#78350f',
      },
    },
    {
      nombre: 'Océano Profundo',
      categoria: 'Natural',
      colores: {
        primary: '#0891b2',
        secondary: '#164e63',
        accent: '#22d3ee',
        background: '#083344',
        backgroundLight: '#0e4a5f',
        card: '#155e75',
        text: '#ecfeff',
        textLight: '#cffafe',
        textMuted: '#67e8f9',
        border: '#0e7490',
      },
    },
    {
      nombre: 'Cielo Nocturno',
      categoria: 'Natural',
      colores: {
        primary: '#3b82f6',
        secondary: '#1e3a8a',
        accent: '#60a5fa',
        background: '#0c1e3a',
        backgroundLight: '#1e293b',
        card: '#1e40af',
        text: '#eff6ff',
        textLight: '#dbeafe',
        textMuted: '#93c5fd',
        border: '#1d4ed8',
      },
    },
  ];

  const categorias = ['Todos', 'Industrial', 'Moderno', 'Elegante', 'Vibrante', 'Natural'];

  const temasFiltrados =
    categoriaSeleccionada === 'Todos'
      ? temasPresets
      : temasPresets.filter((t) => t.categoria === categoriaSeleccionada);

  // ════════════════════════════════════════════════════════
  // FUNCIONES DE COLOR
  // ════════════════════════════════════════════════════════

  const hexToHSL = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const hslToHex = (h, s, l) => {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (300 <= h && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    const toHex = (n) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // ════════════════════════════════════════════════════════
  // GENERADORES DE PALETAS
  // ════════════════════════════════════════════════════════

  const generarPaletaComplementaria = () => {
    const hsl = hexToHSL(primary);
    const complementHue = (hsl.h + 180) % 360;
    const newAccent = hslToHex(complementHue, hsl.s, hsl.l);
    setAccent(newAccent);
  };

  const generarPaletaAnaloga = () => {
    const hsl = hexToHSL(primary);
    const analogHue1 = (hsl.h + 30) % 360;
    const analogHue2 = (hsl.h - 30 + 360) % 360;
    setAccent(hslToHex(analogHue1, hsl.s, hsl.l));
    setSecondary(hslToHex(analogHue2, hsl.s - 20, hsl.l - 30));
  };

  const generarPaletaTriadica = () => {
    const hsl = hexToHSL(primary);
    const triadHue1 = (hsl.h + 120) % 360;
    const triadHue2 = (hsl.h + 240) % 360;
    setAccent(hslToHex(triadHue1, hsl.s, hsl.l));
    setSecondary(hslToHex(triadHue2, hsl.s - 20, hsl.l - 30));
  };

  const aplicarHSL = () => {
    const newPrimary = hslToHex(hue, saturation, lightness);
    setPrimary(newPrimary);
  };

  const aplicarPreset = (preset) => {
    setPrimary(preset.colores.primary);
    setSecondary(preset.colores.secondary);
    setAccent(preset.colores.accent);
    setBackground(preset.colores.background);
    setBackgroundLight(preset.colores.backgroundLight);
    setCard(preset.colores.card);
    setText(preset.colores.text);
    setTextLight(preset.colores.textLight);
    setTextMuted(preset.colores.textMuted);
    setBorder(preset.colores.border);
  };

  const handleGuardar = async () => {
    if (!empresaId) {
      Alert.alert('Error', 'No se pudo identificar tu empresa');
      return;
    }

    const nuevoTema = {
      primary,
      secondary,
      accent,
      background,
      backgroundLight,
      card,
      text,
      textLight,
      textMuted,
      border,
    };

    setLoading(true);
    try {
      // Guardar en Supabase
      const success = await actualizarTemaEmpresa(empresaId, nuevoTema);

      if (success) {
        // Aplicar inmediatamente en el store
        cargarTema(nuevoTema);

        Alert.alert(
          '✅ Tema Guardado',
          'Los nuevos colores se aplicaron correctamente.\n\nTodos los trabajadores de tu empresa verán estos colores.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', 'No se pudo guardar el tema. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error guardando tema:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar el tema.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: card, borderBottomColor: primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>PERSONALIZAR DISEÑO</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: card, borderLeftColor: accent }]}>
          <Ionicons name="information-circle" size={20} color={accent} />
          <Text style={[styles.infoText, { color: text }]}>
            Personaliza completamente el diseño de tu empresa. 24 temas profesionales + editor avanzado HSL.
          </Text>
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: card, borderColor: border }]}
            onPress={() => setModoOscuro(!modoOscuro)}
          >
            <Ionicons name={modoOscuro ? 'moon' : 'sunny'} size={18} color={accent} />
            <Text style={[styles.quickButtonText, { color: text }]}>
              {modoOscuro ? 'Oscuro' : 'Claro'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vista Previa Mejorada */}
        <Text style={[styles.sectionTitle, { color: primary }]}>VISTA PREVIA EN VIVO</Text>

        <View style={[styles.previewCard, { backgroundColor: card, borderColor: border }]}>
          <View style={[styles.previewHeader, { borderBottomColor: primary }]}>
            <View style={[styles.previewIconBox, { backgroundColor: primary }]}>
              <Ionicons name="construct" size={24} color={text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.previewTitle, { color: text }]}>Bus ABC-123</Text>
              <Text style={[styles.previewSubtitle, { color: accent }]}>Orden de Trabajo #1234</Text>
            </View>
          </View>

          <View style={styles.previewStats}>
            <View style={[styles.previewStat, { backgroundColor: backgroundLight, borderColor: border }]}>
              <Text style={[styles.previewStatNumber, { color: primary }]}>24</Text>
              <Text style={[styles.previewStatLabel, { color: textMuted }]}>Pendientes</Text>
            </View>
            <View style={[styles.previewStat, { backgroundColor: backgroundLight, borderColor: border }]}>
              <Text style={[styles.previewStatNumber, { color: accent }]}>12</Text>
              <Text style={[styles.previewStatLabel, { color: textMuted }]}>En Proceso</Text>
            </View>
          </View>

          <View style={[styles.previewButton, { backgroundColor: primary }]}>
            <Text style={[styles.previewButtonText, { color: text }]}>Botón de Acción</Text>
          </View>

          <View style={[styles.previewAlert, { backgroundColor: backgroundLight, borderLeftColor: accent }]}>
            <Ionicons name="warning" size={16} color={accent} />
            <Text style={[styles.previewAlertText, { color: textLight }]}>Mensaje de alerta</Text>
          </View>
        </View>

        {/* Filtros de Categoría */}
        <Text style={[styles.sectionTitle, { color: primary }]}>CATEGORÍAS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                { backgroundColor: categoriaSeleccionada === cat ? primary : card, borderColor: border },
              ]}
              onPress={() => setCategoriaSeleccionada(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: categoriaSeleccionada === cat ? text : textMuted },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Temas Predefinidos (24) */}
        <Text style={[styles.sectionTitle, { color: primary }]}>
          TEMAS PROFESIONALES ({temasFiltrados.length})
        </Text>

        <View style={styles.presetsContainer}>
          {temasFiltrados.map((preset, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.presetCard, { backgroundColor: card, borderColor: border }]}
              onPress={() => aplicarPreset(preset)}
            >
              <View style={styles.presetColors}>
                <View style={[styles.presetColor, { backgroundColor: preset.colores.primary }]} />
                <View style={[styles.presetColor, { backgroundColor: preset.colores.accent }]} />
                <View style={[styles.presetColor, { backgroundColor: preset.colores.card }]} />
              </View>
              <Text style={[styles.presetName, { color: text }]}>{preset.nombre}</Text>
              <Text style={[styles.presetCategory, { color: textMuted }]}>{preset.categoria}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Editor HSL Avanzado */}
        <Text style={[styles.sectionTitle, { color: primary }]}>EDITOR HSL AVANZADO</Text>

        <View style={[styles.hslEditor, { backgroundColor: card, borderColor: border }]}>
          <Text style={[styles.hslTitle, { color: text }]}>Crea tu color desde cero</Text>

          {/* Hue Control */}
          <View style={styles.controlGroup}>
            <Text style={[styles.controlLabel, { color: textMuted }]}>Tono (Hue)</Text>
            <View style={styles.controlRow}>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: backgroundLight, borderColor: border }]}
                onPress={() => setHue(Math.max(0, hue - 10))}
              >
                <Ionicons name="remove" size={20} color={text} />
              </TouchableOpacity>
              <View style={[styles.valueBar, { backgroundColor: backgroundLight, borderColor: border }]}>
                <Text style={[styles.valueText, { color: text }]}>{hue}°</Text>
              </View>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: backgroundLight, borderColor: border }]}
                onPress={() => setHue(Math.min(360, hue + 10))}
              >
                <Ionicons name="add" size={20} color={text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Saturation Control */}
          <View style={styles.controlGroup}>
            <Text style={[styles.controlLabel, { color: textMuted }]}>Saturación</Text>
            <View style={styles.controlRow}>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: backgroundLight, borderColor: border }]}
                onPress={() => setSaturation(Math.max(0, saturation - 10))}
              >
                <Ionicons name="remove" size={20} color={text} />
              </TouchableOpacity>
              <View style={[styles.valueBar, { backgroundColor: backgroundLight, borderColor: border }]}>
                <Text style={[styles.valueText, { color: text }]}>{saturation}%</Text>
              </View>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: backgroundLight, borderColor: border }]}
                onPress={() => setSaturation(Math.min(100, saturation + 10))}
              >
                <Ionicons name="add" size={20} color={text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Lightness Control */}
          <View style={styles.controlGroup}>
            <Text style={[styles.controlLabel, { color: textMuted }]}>Luminosidad</Text>
            <View style={styles.controlRow}>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: backgroundLight, borderColor: border }]}
                onPress={() => setLightness(Math.max(0, lightness - 10))}
              >
                <Ionicons name="remove" size={20} color={text} />
              </TouchableOpacity>
              <View style={[styles.valueBar, { backgroundColor: backgroundLight, borderColor: border }]}>
                <Text style={[styles.valueText, { color: text }]}>{lightness}%</Text>
              </View>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: backgroundLight, borderColor: border }]}
                onPress={() => setLightness(Math.min(100, lightness + 10))}
              >
                <Ionicons name="add" size={20} color={text} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.applyHslButton, { backgroundColor: primary }]}
            onPress={aplicarHSL}
          >
            <Ionicons name="color-palette" size={18} color={text} />
            <Text style={[styles.applyHslText, { color: text }]}>Aplicar Color HSL</Text>
          </TouchableOpacity>
        </View>

        {/* Generadores de Paletas */}
        <Text style={[styles.sectionTitle, { color: primary }]}>GENERADORES DE PALETAS</Text>

        <View style={styles.generatorsRow}>
          <TouchableOpacity
            style={[styles.generatorButton, { backgroundColor: card, borderColor: border }]}
            onPress={generarPaletaComplementaria}
          >
            <Ionicons name="git-compare" size={18} color={accent} />
            <Text style={[styles.generatorText, { color: text }]}>Complementaria</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.generatorButton, { backgroundColor: card, borderColor: border }]}
            onPress={generarPaletaAnaloga}
          >
            <Ionicons name="analytics" size={18} color={accent} />
            <Text style={[styles.generatorText, { color: text }]}>Análoga</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.generatorButton, { backgroundColor: card, borderColor: border }]}
            onPress={generarPaletaTriadica}
          >
            <Ionicons name="triangle" size={18} color={accent} />
            <Text style={[styles.generatorText, { color: text }]}>Triádica</Text>
          </TouchableOpacity>
        </View>

        {/* Colores Personalizados */}
        <Text style={[styles.sectionTitle, { color: primary }]}>COLORES PERSONALIZADOS</Text>

        <View style={styles.coloresGrid}>
          {[
            { label: 'PRIMARIO', value: primary, setter: setPrimary },
            { label: 'SECUNDARIO', value: secondary, setter: setSecondary },
            { label: 'ACENTO', value: accent, setter: setAccent },
            { label: 'FONDO', value: background, setter: setBackground },
            { label: 'FONDO CLARO', value: backgroundLight, setter: setBackgroundLight },
            { label: 'CARDS', value: card, setter: setCard },
            { label: 'TEXTO', value: text, setter: setText },
            { label: 'TEXTO CLARO', value: textLight, setter: setTextLight },
            { label: 'TEXTO MUTED', value: textMuted, setter: setTextMuted },
            { label: 'BORDES', value: border, setter: setBorder },
          ].map((color, idx) => (
            <View key={idx} style={styles.colorItem}>
              <Text style={[styles.colorLabel, { color: text }]}>{color.label}</Text>
              <View style={styles.colorInputContainer}>
                <View style={[styles.colorPreview, { backgroundColor: color.value, borderColor: border }]} />
                <TextInput
                  style={[styles.colorInput, { backgroundColor: card, color: text, borderColor: border }]}
                  value={color.value}
                  onChangeText={color.setter}
                  placeholder="#000000"
                  placeholderTextColor={textMuted}
                  maxLength={7}
                  autoCapitalize="none"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[styles.guardarButton, { backgroundColor: primary, borderColor: primary }, loading && styles.guardarButtonDisabled]}
          onPress={handleGuardar}
          disabled={loading}
        >
          <Ionicons name={loading ? 'hourglass' : 'checkmark-circle'} size={24} color={text} />
          <Text style={[styles.guardarButtonText, { color: text }]}>
            {loading ? 'GUARDANDO...' : 'GUARDAR DISEÑO'}
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
  headerTitle: { fontSize: 16, fontWeight: 'bold', letterSpacing: 1.5 },
  scrollContent: { flex: 1 },
  content: { padding: 20 },
  infoBox: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickButtonText: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 15, marginTop: 10, letterSpacing: 1.5 },
  previewCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
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
  previewStats: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  previewStat: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  previewStatNumber: { fontSize: 24, fontWeight: 'bold' },
  previewStatLabel: { fontSize: 10, marginTop: 3 },
  previewButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  previewButtonText: { fontSize: 14, fontWeight: 'bold' },
  previewAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  previewAlertText: { fontSize: 12 },
  categoriesScroll: { marginBottom: 20 },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryChipText: { fontSize: 12, fontWeight: '600' },
  presetsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  presetCard: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  presetColors: { flexDirection: 'row', gap: 5, marginBottom: 10 },
  presetColor: { flex: 1, height: 30, borderRadius: 6 },
  presetName: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginBottom: 2 },
  presetCategory: { fontSize: 9, textAlign: 'center' },
  hslEditor: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  hslTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 15 },
  controlGroup: { marginBottom: 15 },
  controlLabel: { fontSize: 11, fontWeight: '600', marginBottom: 8 },
  controlRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  controlButton: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  valueBar: {
    flex: 1,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  valueText: { fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace' },
  applyHslButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },
  applyHslText: { fontSize: 13, fontWeight: 'bold' },
  generatorsRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  generatorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  generatorText: { fontSize: 11, fontWeight: '600' },
  coloresGrid: { gap: 15, marginBottom: 20 },
  colorItem: {},
  colorLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  colorInputContainer: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  colorPreview: { width: 50, height: 50, borderRadius: 10, borderWidth: 2 },
  colorInput: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    fontFamily: 'monospace',
    borderWidth: 1,
  },
  guardarButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 2,
  },
  guardarButtonDisabled: { opacity: 0.6 },
  guardarButtonText: { fontSize: 16, fontWeight: 'bold', letterSpacing: 1.5 },
});
