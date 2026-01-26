// src/screens/admin/ConfigurarColoresScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Switch,
  Dimensions,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useTemaStore from '../../store/temaStore';
import useAuthStore from '../../store/authStore';
import { actualizarTemaEmpresa } from '../../lib/empresas';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

export default function ConfigurarColoresScreen({ navigation }) {
  const { colores, cargarTema } = useTemaStore();
  const { empresa } = useAuthStore();

  // Estados para cada color
  const [primary, setPrimary] = useState(colores.primary);
  const [accent, setAccent] = useState(colores.accent);
  const [background, setBackground] = useState(colores.background);
  const [card, setCard] = useState(colores.card);
  const [text, setText] = useState(colores.text);

  const [modoOscuro, setModoOscuro] = useState(true);
  const [colorActivo, setColorActivo] = useState('primary'); // primary, accent, background, card, text
  const [loading, setLoading] = useState(false);
  const [mostrarPicker, setMostrarPicker] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');

  // HSL states para el color activo
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);

  // Convertir HEX a HSL
  const hexToHSL = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Convertir HSL a HEX
  const hslToHex = (h, s, l) => {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Actualizar HSL cuando cambia el color activo
  useEffect(() => {
    let colorValue;
    switch (colorActivo) {
      case 'primary': colorValue = primary; break;
      case 'accent': colorValue = accent; break;
      case 'background': colorValue = background; break;
      case 'card': colorValue = card; break;
      case 'text': colorValue = text; break;
      default: colorValue = primary;
    }

    const hsl = hexToHSL(colorValue);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
  }, [colorActivo, primary, accent, background, card, text]);

  // Actualizar color cuando cambian los sliders
  useEffect(() => {
    const newColor = hslToHex(hue, saturation, lightness);
    switch (colorActivo) {
      case 'primary': setPrimary(newColor); break;
      case 'accent': setAccent(newColor); break;
      case 'background': setBackground(newColor); break;
      case 'card': setCard(newColor); break;
      case 'text': setText(newColor); break;
    }
  }, [hue, saturation, lightness]);

  // TEMAS PREDEFINIDOS ÉPICOS (15 categorías)
  const temasPresets = [
    // INDUSTRIAL
    {
      nombre: 'Industrial Rojo',
      categoria: 'Industrial',
      colores: { primary: '#dc2626', accent: '#fbbf24', background: '#0f0f0f', card: '#1a1a1a', text: '#ffffff' },
    },
    {
      nombre: 'Hierro Forjado',
      categoria: 'Industrial',
      colores: { primary: '#6b7280', accent: '#f59e0b', background: '#111827', card: '#1f2937', text: '#f3f4f6' },
    },
    {
      nombre: 'Acero Inoxidable',
      categoria: 'Industrial',
      colores: { primary: '#475569', accent: '#94a3b8', background: '#0f172a', card: '#1e293b', text: '#f1f5f9' },
    },

    // MODERNO
    {
      nombre: 'Azul Moderno',
      categoria: 'Moderno',
      colores: { primary: '#3b82f6', accent: '#60a5fa', background: '#0c1e3a', card: '#1e293b', text: '#f1f5f9' },
    },
    {
      nombre: 'Cian Tech',
      categoria: 'Moderno',
      colores: { primary: '#06b6d4', accent: '#22d3ee', background: '#0a1929', card: '#1a2332', text: '#e0f2fe' },
    },
    {
      nombre: 'Morado Futurista',
      categoria: 'Moderno',
      colores: { primary: '#8b5cf6', accent: '#a78bfa', background: '#1a0f2e', card: '#2e1a47', text: '#f5f3ff' },
    },

    // ELEGANTE
    {
      nombre: 'Oro Negro',
      categoria: 'Elegante',
      colores: { primary: '#d4af37', accent: '#ffd700', background: '#0a0a0a', card: '#1a1a1a', text: '#faf8f3' },
    },
    {
      nombre: 'Plata Premium',
      categoria: 'Elegante',
      colores: { primary: '#94a3b8', accent: '#cbd5e1', background: '#0f0f0f', card: '#1e1e1e', text: '#f8fafc' },
    },
    {
      nombre: 'Bronce Clásico',
      categoria: 'Elegante',
      colores: { primary: '#b8860b', accent: '#daa520', background: '#1a1410', card: '#2a241e', text: '#fef3c7' },
    },

    // VIBRANTE
    {
      nombre: 'Verde Neón',
      categoria: 'Vibrante',
      colores: { primary: '#10b981', accent: '#34d399', background: '#0a1f1a', card: '#1a2e26', text: '#ecfdf5' },
    },
    {
      nombre: 'Naranja Energía',
      categoria: 'Vibrante',
      colores: { primary: '#f97316', accent: '#fb923c', background: '#1c0f0a', card: '#2e1a12', text: '#fff7ed' },
    },
    {
      nombre: 'Rosa Eléctrico',
      categoria: 'Vibrante',
      colores: { primary: '#ec4899', accent: '#f472b6', background: '#1f0a1a', card: '#2e1a26', text: '#fdf2f8' },
    },

    // NATURAL
    {
      nombre: 'Bosque Oscuro',
      categoria: 'Natural',
      colores: { primary: '#065f46', accent: '#34d399', background: '#0a1f1a', card: '#1a2e26', text: '#ecfdf5' },
    },
    {
      nombre: 'Tierra Profunda',
      categoria: 'Natural',
      colores: { primary: '#92400e', accent: '#d97706', background: '#1c1410', card: '#2c2218', text: '#fef3c7' },
    },
    {
      nombre: 'Océano Profundo',
      categoria: 'Natural',
      colores: { primary: '#0e7490', accent: '#22d3ee', background: '#0a1929', card: '#1a2e3e', text: '#cffafe' },
    },
  ];

  const categorias = ['Todos', 'Industrial', 'Moderno', 'Elegante', 'Vibrante', 'Natural'];

  const temasFiltrados = categoriaActiva === 'Todos'
    ? temasPresets
    : temasPresets.filter(t => t.categoria === categoriaActiva);

  const aplicarPreset = (preset) => {
    setPrimary(preset.colores.primary);
    setAccent(preset.colores.accent);
    setBackground(preset.colores.background);
    setCard(preset.colores.card);
    setText(preset.colores.text);
    Alert.alert('✨ Tema Aplicado', `Se aplicó el tema "${preset.nombre}"`);
  };

  const generarPaletaComplementaria = () => {
    const hsl = hexToHSL(primary);
    const complementHue = (hsl.h + 180) % 360;
    const newAccent = hslToHex(complementHue, hsl.s, hsl.l);
    setAccent(newAccent);
    Alert.alert('🎨 Paleta Generada', 'Color complementario aplicado al acento');
  };

  const generarPaletaAnaloga = () => {
    const hsl = hexToHSL(primary);
    const analogHue = (hsl.h + 30) % 360;
    const newAccent = hslToHex(analogHue, hsl.s, hsl.l);
    setAccent(newAccent);
    Alert.alert('🎨 Paleta Generada', 'Color análogo aplicado al acento');
  };

  const generarPaletaTriadica = () => {
    const hsl = hexToHSL(primary);
    const triad1Hue = (hsl.h + 120) % 360;
    const newAccent = hslToHex(triad1Hue, hsl.s, hsl.l);
    setAccent(newAccent);
    Alert.alert('🎨 Paleta Generada', 'Color triádico aplicado al acento');
  };

  const toggleModoOscuro = () => {
    if (modoOscuro) {
      // Cambiar a modo claro
      setBackground('#f8fafc');
      setCard('#ffffff');
      setText('#0f172a');
      setModoOscuro(false);
    } else {
      // Cambiar a modo oscuro
      setBackground('#0f0f0f');
      setCard('#1a1a1a');
      setText('#ffffff');
      setModoOscuro(true);
    }
  };

  const copiarCodigoPaleta = () => {
    const codigo = `primary: '${primary}',\naccent: '${accent}',\nbackground: '${background}',\ncard: '${card}',\ntext: '${text}'`;
    Clipboard.setString(codigo);
    Alert.alert('📋 Copiado', 'Código de paleta copiado al portapapeles');
  };

  const handleGuardar = async () => {
    const nuevoTema = { primary, accent, background, card, text };

    setLoading(true);

    // Guardar en Supabase
    const exito = await actualizarTemaEmpresa(empresa.id, nuevoTema);

    setLoading(false);

    if (exito) {
      cargarTema(nuevoTema);
      Alert.alert(
        '✅ ¡Colores Guardados!',
        'Los nuevos colores se aplicaron correctamente.\n\nTodos los usuarios de tu empresa verán estos cambios.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('❌ Error', 'No se pudo guardar el tema. Intenta nuevamente.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: card, borderBottomColor: primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>🎨 PERSONALIZACIÓN TOTAL</Text>
        <TouchableOpacity onPress={copiarCodigoPaleta}>
          <Ionicons name="copy" size={24} color={accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: card, borderColor: primary }]}
            onPress={toggleModoOscuro}
          >
            <Ionicons name={modoOscuro ? 'sunny' : 'moon'} size={20} color={accent} />
            <Text style={[styles.quickButtonText, { color: text }]}>
              {modoOscuro ? 'Modo Claro' : 'Modo Oscuro'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: card, borderColor: primary }]}
            onPress={() => setMostrarPicker(!mostrarPicker)}
          >
            <Ionicons name="color-palette" size={20} color={accent} />
            <Text style={[styles.quickButtonText, { color: text }]}>
              {mostrarPicker ? 'Ocultar Picker' : 'Mostrar Picker'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vista Previa Mejorada */}
        <Text style={[styles.sectionTitle, { color: primary }]}>👁️ VISTA PREVIA EN VIVO</Text>

        <View style={[styles.previewCard, { backgroundColor: card }]}>
          {/* Header Preview */}
          <View style={[styles.previewHeader, { borderBottomColor: primary }]}>
            <View style={[styles.previewIconBox, { backgroundColor: primary }]}>
              <Ionicons name="construct" size={24} color={text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.previewTitle, { color: text }]}>Orden de Trabajo #1234</Text>
              <Text style={[styles.previewSubtitle, { color: accent }]}>Bus ABC-123 • Preventivo</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: primary }]}>
              <Text style={[styles.badgeText, { color: text }]}>URGENTE</Text>
            </View>
          </View>

          {/* Buttons Preview */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={[styles.previewButton, { backgroundColor: primary }]}>
              <Ionicons name="checkmark-circle" size={18} color={text} />
              <Text style={[styles.previewButtonText, { color: text }]}>Aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.previewButtonSecondary, { borderColor: accent }]}>
              <Ionicons name="eye" size={18} color={accent} />
              <Text style={[styles.previewButtonSecondaryText, { color: accent }]}>Ver Detalles</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Preview */}
          <View style={styles.statsRow}>
            <View style={[styles.statItem, { backgroundColor: background }]}>
              <Text style={[styles.statNumber, { color: primary }]}>24</Text>
              <Text style={[styles.statLabel, { color: text }]}>Completadas</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: background }]}>
              <Text style={[styles.statNumber, { color: accent }]}>8</Text>
              <Text style={[styles.statLabel, { color: text }]}>Pendientes</Text>
            </View>
          </View>
        </View>

        {/* Selector de Color Activo */}
        <Text style={[styles.sectionTitle, { color: primary }]}>🎯 SELECCIONA COLOR A EDITAR</Text>

        <View style={styles.colorSelector}>
          {[
            { key: 'primary', label: 'Primario', icon: 'radio-button-on' },
            { key: 'accent', label: 'Acento', icon: 'star' },
            { key: 'background', label: 'Fondo', icon: 'square' },
            { key: 'card', label: 'Cards', icon: 'document' },
            { key: 'text', label: 'Texto', icon: 'text' },
          ].map((item) => {
            const isActive = colorActivo === item.key;
            let colorValue;
            switch (item.key) {
              case 'primary': colorValue = primary; break;
              case 'accent': colorValue = accent; break;
              case 'background': colorValue = background; break;
              case 'card': colorValue = card; break;
              case 'text': colorValue = text; break;
            }

            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.colorSelectorItem,
                  { backgroundColor: card, borderColor: isActive ? accent : '#333' },
                  isActive && { borderWidth: 3 }
                ]}
                onPress={() => setColorActivo(item.key)}
              >
                <View style={[styles.colorSelectorPreview, { backgroundColor: colorValue }]}>
                  <Ionicons name={item.icon} size={20} color={item.key === 'background' || item.key === 'card' ? text : card} />
                </View>
                <Text style={[styles.colorSelectorLabel, { color: text }]}>{item.label}</Text>
                {isActive && <Ionicons name="checkmark-circle" size={16} color={accent} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Color Picker Visual */}
        {mostrarPicker && (
          <>
            <Text style={[styles.sectionTitle, { color: primary }]}>
              🎨 EDITOR DE COLOR ({colorActivo.toUpperCase()})
            </Text>

            <View style={[styles.pickerCard, { backgroundColor: card }]}>
              {/* Preview Grande */}
              <View style={styles.colorPreviewLarge}>
                <View
                  style={[
                    styles.colorPreviewBig,
                    {
                      backgroundColor: hslToHex(hue, saturation, lightness),
                    }
                  ]}
                />
                <View style={styles.colorInfo}>
                  <Text style={[styles.colorInfoLabel, { color: text }]}>HEX</Text>
                  <Text style={[styles.colorInfoValue, { color: accent }]}>
                    {hslToHex(hue, saturation, lightness).toUpperCase()}
                  </Text>
                  <Text style={[styles.colorInfoLabel, { color: text }]}>HSL</Text>
                  <Text style={[styles.colorInfoValue, { color: accent }]}>
                    {hue}°, {saturation}%, {lightness}%
                  </Text>
                </View>
              </View>

              {/* Hue Slider */}
              <View style={styles.sliderContainer}>
                <Text style={[styles.sliderLabel, { color: text }]}>
                  <Ionicons name="color-palette" size={14} /> Matiz (Hue): {hue}°
                </Text>
                <View style={styles.hueGradient}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={360}
                    value={hue}
                    onValueChange={setHue}
                    minimumTrackTintColor="transparent"
                    maximumTrackTintColor="transparent"
                    thumbTintColor={hslToHex(hue, 100, 50)}
                  />
                </View>
              </View>

              {/* Saturation Slider */}
              <View style={styles.sliderContainer}>
                <Text style={[styles.sliderLabel, { color: text }]}>
                  <Ionicons name="contrast" size={14} /> Saturación: {saturation}%
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={saturation}
                  onValueChange={setSaturation}
                  minimumTrackTintColor={hslToHex(hue, saturation, lightness)}
                  maximumTrackTintColor="#444"
                  thumbTintColor={hslToHex(hue, saturation, lightness)}
                />
              </View>

              {/* Lightness Slider */}
              <View style={styles.sliderContainer}>
                <Text style={[styles.sliderLabel, { color: text }]}>
                  <Ionicons name="sunny" size={14} /> Luminosidad: {lightness}%
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={lightness}
                  onValueChange={setLightness}
                  minimumTrackTintColor={hslToHex(hue, saturation, lightness)}
                  maximumTrackTintColor="#444"
                  thumbTintColor={hslToHex(hue, saturation, lightness)}
                />
              </View>

              {/* Manual HEX Input */}
              <View style={styles.hexInputContainer}>
                <Text style={[styles.sliderLabel, { color: text }]}>Código Hexadecimal</Text>
                <TextInput
                  style={[styles.hexInput, { backgroundColor: background, color: text, borderColor: accent }]}
                  value={(() => {
                    switch (colorActivo) {
                      case 'primary': return primary;
                      case 'accent': return accent;
                      case 'background': return background;
                      case 'card': return card;
                      case 'text': return text;
                      default: return primary;
                    }
                  })()}
                  onChangeText={(value) => {
                    switch (colorActivo) {
                      case 'primary': setPrimary(value); break;
                      case 'accent': setAccent(value); break;
                      case 'background': setBackground(value); break;
                      case 'card': setCard(value); break;
                      case 'text': setText(value); break;
                    }
                  }}
                  placeholder="#000000"
                  placeholderTextColor="#888"
                  maxLength={7}
                  autoCapitalize="none"
                />
              </View>
            </View>
          </>
        )}

        {/* Generadores de Paletas */}
        <Text style={[styles.sectionTitle, { color: primary }]}>🪄 GENERADORES AUTOMÁTICOS</Text>

        <View style={styles.generadoresGrid}>
          <TouchableOpacity
            style={[styles.generadorButton, { backgroundColor: card, borderColor: accent }]}
            onPress={generarPaletaComplementaria}
          >
            <Ionicons name="swap-horizontal" size={24} color={accent} />
            <Text style={[styles.generadorText, { color: text }]}>Complementaria</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.generadorButton, { backgroundColor: card, borderColor: accent }]}
            onPress={generarPaletaAnaloga}
          >
            <Ionicons name="git-branch" size={24} color={accent} />
            <Text style={[styles.generadorText, { color: text }]}>Análoga</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.generadorButton, { backgroundColor: card, borderColor: accent }]}
            onPress={generarPaletaTriadica}
          >
            <Ionicons name="triangle" size={24} color={accent} />
            <Text style={[styles.generadorText, { color: text }]}>Triádica</Text>
          </TouchableOpacity>
        </View>

        {/* Categorías de Temas */}
        <Text style={[styles.sectionTitle, { color: primary }]}>✨ TEMAS PROFESIONALES</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasScroll}>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoriaChip,
                { backgroundColor: categoriaActiva === cat ? primary : card, borderColor: primary }
              ]}
              onPress={() => setCategoriaActiva(cat)}
            >
              <Text style={[styles.categoriaText, { color: categoriaActiva === cat ? card : text }]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Temas Grid */}
        <View style={styles.temasGrid}>
          {temasFiltrados.map((preset, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.temaCard, { backgroundColor: card, borderColor: '#333' }]}
              onPress={() => aplicarPreset(preset)}
            >
              <View style={styles.temaColors}>
                <View style={[styles.temaColorDot, { backgroundColor: preset.colores.primary }]} />
                <View style={[styles.temaColorDot, { backgroundColor: preset.colores.accent }]} />
                <View style={[styles.temaColorDot, { backgroundColor: preset.colores.background }]} />
                <View style={[styles.temaColorDot, { backgroundColor: preset.colores.card }]} />
              </View>
              <Text style={[styles.temaNombre, { color: text }]}>{preset.nombre}</Text>
              <Text style={[styles.temaCategoria, { color: accent }]}>{preset.categoria}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[styles.guardarButton, { backgroundColor: primary }, loading && styles.guardarButtonDisabled]}
          onPress={handleGuardar}
          disabled={loading}
        >
          <Ionicons name={loading ? 'hourglass' : 'save'} size={24} color={text} />
          <Text style={[styles.guardarButtonText, { color: text }]}>
            {loading ? 'GUARDANDO EN SUPABASE...' : '💾 GUARDAR COLORES'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    borderBottomWidth: 3,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  scrollContent: { flex: 1 },
  content: { padding: 20 },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
  },
  quickButtonText: { fontSize: 12, fontWeight: '600' },

  // Secciones
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 15,
    letterSpacing: 1.5,
  },

  // Vista Previa
  previewCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#333',
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  previewSubtitle: { fontSize: 12, fontWeight: '600' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  previewButtonText: { fontSize: 13, fontWeight: 'bold' },
  previewButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 6,
    borderWidth: 2,
  },
  previewButtonSecondaryText: { fontSize: 13, fontWeight: 'bold' },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statItem: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 11, marginTop: 4 },

  // Selector de Color
  colorSelector: {
    gap: 10,
    marginBottom: 20,
  },
  colorSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
  },
  colorSelectorPreview: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#444',
  },
  colorSelectorLabel: { flex: 1, fontSize: 14, fontWeight: '600' },

  // Picker Card
  pickerCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#333',
  },
  colorPreviewLarge: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  colorPreviewBig: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#444',
  },
  colorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  colorInfoLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  colorInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  hueGradient: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  hexInputContainer: {
    marginTop: 5,
  },
  hexInput: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    borderWidth: 2,
  },

  // Generadores
  generadoresGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  generadorButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
  },
  generadorText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Categorías
  categoriasScroll: {
    marginBottom: 15,
  },
  categoriaChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
  },
  categoriaText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Temas Grid
  temasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  temaCard: {
    width: (width - 52) / 2,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  temaColors: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  temaColorDot: {
    flex: 1,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  temaNombre: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  temaCategoria: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Botón Guardar
  guardarButton: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 3,
    borderColor: '#991b1b',
    marginTop: 10,
  },
  guardarButtonDisabled: { opacity: 0.6 },
  guardarButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});
