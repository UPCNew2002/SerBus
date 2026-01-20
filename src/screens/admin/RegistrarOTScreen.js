// src/screens/admin/RegistrarOTScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/colors';
import useOTsStore from '../../store/otsStore';
import useTrabajosStore from '../../store/trabajosStore';
import useAuthStore from '../../store/authStore';
import { generarNumeroOT, obtenerBusesEmpresa } from '../../lib/cronograma';

export default function RegistrarOTScreen({ navigation }) {
  // Estados del formulario
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [numeroOT, setNumeroOT] = useState('');
  const [busSeleccionado, setBusSeleccionado] = useState(null);
  const [placa, setPlaca] = useState('');
  const [vin, setVin] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [trabajosSeleccionados, setTrabajosSeleccionados] = useState([]);
  const [servicios, setServicios] = useState('');
  const [precioServicios, setPrecioServicios] = useState('');
  const [evidencia, setEvidencia] = useState(null);
  const [productos, setProductos] = useState([]);
  const [showAddProducto, setShowAddProducto] = useState(false);
  const [productoNombre, setProductoNombre] = useState('');
  const [productoCantidad, setProductoCantidad] = useState('');
  const [productoPrecio, setProductoPrecio] = useState('');
  const [loading, setLoading] = useState(false);
  const [generandoNumeroOT, setGenerandoNumeroOT] = useState(false);

  // Estados para selector de buses
  const [buses, setBuses] = useState([]);
  const [showBusSelector, setShowBusSelector] = useState(false);
  const [loadingBuses, setLoadingBuses] = useState(false);

  const { agregarOT, existeNumeroOT } = useOTsStore();
  const { trabajos } = useTrabajosStore();
  const { empresa } = useAuthStore();

  // Generar número de OT automáticamente al cargar
  useEffect(() => {
    if (empresa?.id) {
      generarNumeroOTAutomatico();
      cargarBuses();
    }
  }, [empresa]);

  // Cargar lista de buses
  async function cargarBuses() {
    setLoadingBuses(true);
    try {
      const busesData = await obtenerBusesEmpresa(empresa.id);
      setBuses(busesData || []);
    } catch (error) {
      console.error('Error cargando buses:', error);
      Alert.alert('Error', 'No se pudieron cargar los buses');
    } finally {
      setLoadingBuses(false);
    }
  }

  // Seleccionar un bus
  function seleccionarBus(bus) {
    setBusSeleccionado(bus);
    setPlaca(bus.placa);
    setVin(bus.vin);
    setKilometraje(bus.kilometraje_actual.toString());
    setShowBusSelector(false);
  }

  async function generarNumeroOTAutomatico() {
    setGenerandoNumeroOT(true);
    try {
      const numero = await generarNumeroOT(empresa.id);
      if (numero) {
        setNumeroOT(numero);
      }
    } catch (error) {
      console.error('Error generando número de OT:', error);
      Alert.alert('Error', 'No se pudo generar el número de OT automáticamente');
    } finally {
      setGenerandoNumeroOT(false);
    }
  }

  // Toggle trabajo seleccionado
  const toggleTrabajo = (trabajo) => {
    if (trabajosSeleccionados.find((t) => t.id === trabajo.id)) {
      setTrabajosSeleccionados(
        trabajosSeleccionados.filter((t) => t.id !== trabajo.id)
      );
    } else {
      setTrabajosSeleccionados([...trabajosSeleccionados, trabajo]);
    }
  };

  // Agregar producto
  const agregarProducto = () => {
    if (!productoNombre.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return;
    }
    if (!productoCantidad || parseInt(productoCantidad) <= 0) {
      Alert.alert('Error', 'La cantidad debe ser mayor a 0');
      return;
    }
    if (!productoPrecio || parseFloat(productoPrecio) <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return;
    }

    const nuevoProducto = {
      id: Date.now(),
      nombre: productoNombre.trim(),
      cantidad: parseInt(productoCantidad),
      precio: parseFloat(productoPrecio),
    };

    setProductos([...productos, nuevoProducto]);
    setProductoNombre('');
    setProductoCantidad('');
    setProductoPrecio('');
    setShowAddProducto(false);
  };

  // Eliminar producto
  const eliminarProducto = (id) => {
    setProductos(productos.filter((p) => p.id !== id));
  };

  // Calcular total de productos
  const calcularTotalProductos = () => {
    return productos.reduce((total, p) => total + p.cantidad * p.precio, 0);
  };

  // Seleccionar imagen
  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setEvidencia(result.assets[0]);
    }
  };

  // Tomar foto
  const tomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setEvidencia(result.assets[0]);
    }
  };

  // Validar y guardar
  const handleGuardar = () => {
    // Validaciones
    if (!numeroOT.trim()) {
      Alert.alert('Error', 'El número de OT es obligatorio');
      return;
    }

    if (existeNumeroOT(numeroOT)) {
      Alert.alert('Error', 'Ya existe una OT con ese número');
      return;
    }

    if (!placa.trim()) {
      Alert.alert('Error', 'La placa es obligatoria');
      return;
    }

    if (!vin.trim()) {
      Alert.alert('Error', 'El VIN es obligatorio');
      return;
    }

    if (vin.length !== 17) {
      Alert.alert('Error', 'El VIN debe tener exactamente 17 caracteres');
      return;
    }

    if (trabajosSeleccionados.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un trabajo realizado');
      return;
    }

    if (!servicios.trim()) {
      Alert.alert('Error', 'La descripción de servicios es obligatoria');
      return;
    }

    if (!precioServicios || parseFloat(precioServicios) <= 0) {
      Alert.alert('Error', 'El precio de servicios debe ser mayor a 0');
      return;
    }

    if (!evidencia) {
      Alert.alert('Error', 'La foto de evidencia es obligatoria');
      return;
    }

    // Guardar
    setLoading(true);
    setTimeout(() => {
      const totalProductos = calcularTotalProductos();
      const totalServicios = parseFloat(precioServicios);
      const precioTotal = totalProductos + totalServicios;

      agregarOT({
        numeroOT: numeroOT.toUpperCase(),
        fecha,
        placa: placa.toUpperCase(),
        vin: vin.toUpperCase(),
        kilometraje: kilometraje ? parseInt(kilometraje) : null,
        trabajos: trabajosSeleccionados,
        servicios: servicios.trim(),
        productos: productos,
        precioProductos: totalProductos,
        precioServicios: totalServicios,
        precioTotal: precioTotal,
        evidencia: evidencia.uri,
        empresaId: empresa?.id || 1,
      });

      Alert.alert(
        '✅ OT Registrada',
        `OT ${numeroOT} registrada correctamente\n\nProductos: S/ ${totalProductos.toFixed(2)}\nServicios: S/ ${totalServicios.toFixed(2)}\nTotal: S/ ${precioTotal.toFixed(2)}\n\n${
          kilometraje && trabajosSeleccionados.some((t) => t.entraCronograma)
            ? '📅 El cronograma se actualizará automáticamente'
            : '📋 Registrado solo en historial'
        }`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      setLoading(false);
    }, 1500);
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
        <Text style={styles.headerTitle}>REGISTRAR OT</Text>
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
            Todos los campos son obligatorios excepto el kilometraje
          </Text>
        </View>

        {/* SECCIÓN: DATOS BÁSICOS */}
        <Text style={styles.sectionTitle}>DATOS BÁSICOS</Text>

        {/* Fecha */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>FECHA *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="calendar" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              value={fecha}
              editable={false}
            />
          </View>
        </View>

        {/* Número OT */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>NÚMERO DE OT *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="document-text" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder={generandoNumeroOT ? "Generando..." : "OT-2026-0001"}
              placeholderTextColor={COLORS.textMuted}
              value={numeroOT}
              onChangeText={(text) => setNumeroOT(text.toUpperCase())}
              autoCapitalize="characters"
              editable={!generandoNumeroOT}
            />
            <TouchableOpacity
              style={styles.regenerateButton}
              onPress={generarNumeroOTAutomatico}
              disabled={generandoNumeroOT}
            >
              <Ionicons
                name={generandoNumeroOT ? "hourglass" : "refresh"}
                size={20}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            {generandoNumeroOT ? "Generando número automático..." : "Generado automáticamente - Puedes editarlo"}
          </Text>
        </View>

        {/* SECCIÓN: VEHÍCULO */}
        <Text style={styles.sectionTitle}>INFORMACIÓN DEL VEHÍCULO</Text>

        {/* Selector de Bus */}
        <TouchableOpacity
          style={styles.busSelector}
          onPress={() => setShowBusSelector(true)}
        >
          <View style={styles.busSelectorIcon}>
            <Ionicons name="bus" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.busSelectorContent}>
            {busSeleccionado ? (
              <>
                <Text style={styles.busSelectorLabel}>Bus Seleccionado</Text>
                <Text style={styles.busSelectorValue}>
                  {busSeleccionado.placa} - {busSeleccionado.marca} {busSeleccionado.modelo}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.busSelectorLabel}>Seleccionar Bus</Text>
                <Text style={styles.busSelectorPlaceholder}>
                  Toca aquí para elegir un bus de la flota
                </Text>
              </>
            )}
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Placa */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>PLACA *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="car" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: ABC-123"
              placeholderTextColor={COLORS.textMuted}
              value={placa}
              onChangeText={(text) => setPlaca(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
              editable={!busSeleccionado}
            />
          </View>
          {busSeleccionado && (
            <Text style={styles.helperText}>Auto-completado desde bus seleccionado</Text>
          )}
        </View>

        {/* VIN */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>VIN (Número de Identificación del Vehículo) *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="barcode" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="17 caracteres"
              placeholderTextColor={COLORS.textMuted}
              value={vin}
              onChangeText={(text) => setVin(text.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              autoCapitalize="characters"
              maxLength={17}
              editable={!busSeleccionado}
            />
          </View>
          <Text style={styles.helperText}>
            {busSeleccionado ? 'Auto-completado desde bus seleccionado' : `${vin.length}/17 caracteres`}
          </Text>
        </View>

        {/* Kilometraje */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>KILOMETRAJE {busSeleccionado ? '(Puedes actualizarlo)' : '(Opcional)'}</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="speedometer" size={20} color={COLORS.text} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej: 65000"
              placeholderTextColor={COLORS.textMuted}
              value={kilometraje}
              onChangeText={(text) => setKilometraje(text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
            />
          </View>
          {busSeleccionado ? (
            <Text style={styles.helperText}>
              Kilometraje actual: {busSeleccionado.kilometraje_actual} km - Puedes actualizarlo
            </Text>
          ) : (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={16} color={COLORS.statusWarning} />
              <Text style={styles.warningText}>
                Sin kilometraje, no se actualizará el cronograma
              </Text>
            </View>
          )}
        </View>

        {/* SECCIÓN: TRABAJOS REALIZADOS */}
        <Text style={styles.sectionTitle}>TRABAJOS REALIZADOS *</Text>

        <View style={styles.trabajosContainer}>
          {trabajos.map((trabajo) => {
            const isSelected = trabajosSeleccionados.find((t) => t.id === trabajo.id);
            return (
              <TouchableOpacity
                key={trabajo.id}
                style={[
                  styles.trabajoCheckbox,
                  isSelected && styles.trabajoCheckboxSelected,
                ]}
                onPress={() => toggleTrabajo(trabajo)}
              >
                <Ionicons
                  name={isSelected ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={isSelected ? COLORS.primary : COLORS.textMuted}
                />
                <View style={styles.trabajoInfo}>
                  <Text style={styles.trabajoNombre}>{trabajo.nombre}</Text>
                  {trabajo.entraCronograma && (
                    <Text style={styles.trabajoBadge}>📅 Cronograma</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SECCIÓN: SERVICIOS */}
        <Text style={styles.sectionTitle}>DESCRIPCIÓN DE SERVICIOS *</Text>

        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Describe detalladamente los servicios realizados..."
            placeholderTextColor={COLORS.textMuted}
            value={servicios}
            onChangeText={setServicios}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* SECCIÓN: PRODUCTOS */}
        <Text style={styles.sectionTitle}>PRODUCTOS UTILIZADOS (Opcional)</Text>

        {/* Lista de productos */}
        {productos.length > 0 && (
          <View style={styles.productosLista}>
            {productos.map((producto) => (
              <View key={producto.id} style={styles.productoCard}>
                <View style={styles.productoInfo}>
                  <Text style={styles.productoNombre}>{producto.nombre}</Text>
                  <Text style={styles.productoDetalle}>
                    Cantidad: {producto.cantidad} • S/ {producto.precio.toFixed(2)} c/u
                  </Text>
                  <Text style={styles.productoTotal}>
                    Total: S/ {(producto.cantidad * producto.precio).toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.productoDelete}
                  onPress={() => eliminarProducto(producto.id)}
                >
                  <Ionicons name="trash" size={20} color={COLORS.statusDanger} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Total de productos */}
            <View style={styles.productosTotalBox}>
              <Text style={styles.productosTotalLabel}>Total Productos:</Text>
              <Text style={styles.productosTotalValue}>
                S/ {calcularTotalProductos().toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Botón agregar producto */}
        {!showAddProducto ? (
          <TouchableOpacity
            style={styles.addProductoButton}
            onPress={() => setShowAddProducto(true)}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.accent} />
            <Text style={styles.addProductoButtonText}>Agregar Producto</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addProductoForm}>
            {/* Nombre producto */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NOMBRE DEL PRODUCTO *</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Ionicons name="cube" size={20} color={COLORS.text} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Aceite 15W40, Filtro de aire"
                  placeholderTextColor={COLORS.textMuted}
                  value={productoNombre}
                  onChangeText={setProductoNombre}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Cantidad y Precio */}
            <View style={styles.productoRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>CANTIDAD *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={COLORS.textMuted}
                    value={productoCantidad}
                    onChangeText={(text) => setProductoCantidad(text.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>PRECIO UNIT. *</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencySymbolSmall}>S/</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textMuted}
                    value={productoPrecio}
                    onChangeText={setProductoPrecio}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {/* Botones */}
            <View style={styles.productoFormButtons}>
              <TouchableOpacity
                style={styles.cancelProductoButton}
                onPress={() => {
                  setShowAddProducto(false);
                  setProductoNombre('');
                  setProductoCantidad('');
                  setProductoPrecio('');
                }}
              >
                <Text style={styles.cancelProductoButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveProductoButton} onPress={agregarProducto}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.text} />
                <Text style={styles.saveProductoButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SECCIÓN: PRECIOS */}
        <Text style={styles.sectionTitle}>PRECIOS</Text>

        {/* Resumen de productos */}
        <View style={styles.precioResumenBox}>
          <View style={styles.precioResumenRow}>
            <Ionicons name="cube" size={18} color={COLORS.textMuted} />
            <Text style={styles.precioResumenLabel}>Productos:</Text>
            <Text style={styles.precioResumenValue}>
              S/ {calcularTotalProductos().toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Precio de servicios */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>PRECIO DE SERVICIOS (Mano de Obra) *</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconBox}>
              <Ionicons name="build" size={20} color={COLORS.text} />
            </View>
            <Text style={styles.currencySymbol}>S/</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
              value={precioServicios}
              onChangeText={setPrecioServicios}
              keyboardType="decimal-pad"
            />
          </View>
          <Text style={styles.helperText}>Solo mano de obra, sin productos</Text>
        </View>

        {/* Total General */}
        <View style={styles.totalGeneralBox}>
          <View style={styles.totalGeneralRow}>
            <Ionicons name="calculator" size={24} color={COLORS.primary} />
            <View style={styles.totalGeneralInfo}>
              <Text style={styles.totalGeneralLabel}>TOTAL GENERAL</Text>
              <Text style={styles.totalGeneralSubtext}>Productos + Servicios</Text>
            </View>
            <Text style={styles.totalGeneralValue}>
              S/ {(calcularTotalProductos() + (parseFloat(precioServicios) || 0)).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* SECCIÓN: EVIDENCIA */}
        <Text style={styles.sectionTitle}>EVIDENCIA FOTOGRÁFICA *</Text>

        {evidencia ? (
          <View style={styles.evidenciaPreview}>
            <Image source={{ uri: evidencia.uri }} style={styles.evidenciaImage} />
            <TouchableOpacity
              style={styles.evidenciaRemove}
              onPress={() => setEvidencia(null)}
            >
              <Ionicons name="close-circle" size={32} color={COLORS.statusDanger} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.evidenciaButtons}>
            <TouchableOpacity style={styles.evidenciaButton} onPress={tomarFoto}>
              <Ionicons name="camera" size={28} color={COLORS.primary} />
              <Text style={styles.evidenciaButtonText}>Tomar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.evidenciaButton} onPress={seleccionarImagen}>
              <Ionicons name="images" size={28} color={COLORS.accent} />
              <Text style={styles.evidenciaButtonText}>Galería</Text>
            </TouchableOpacity>
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
            {loading ? 'GUARDANDO...' : 'REGISTRAR OT'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Modal Selector de Buses */}
      <Modal
        visible={showBusSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBusSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header del Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Bus</Text>
              <TouchableOpacity onPress={() => setShowBusSelector(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Lista de Buses */}
            {loadingBuses ? (
              <View style={styles.modalLoading}>
                <Text style={styles.modalLoadingText}>Cargando buses...</Text>
              </View>
            ) : buses.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Ionicons name="bus-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.modalEmptyText}>No hay buses disponibles</Text>
              </View>
            ) : (
              <FlatList
                data={buses}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.busesLista}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.busItem,
                      busSeleccionado?.id === item.id && styles.busItemSelected,
                    ]}
                    onPress={() => seleccionarBus(item)}
                  >
                    <View style={styles.busItemIcon}>
                      <Ionicons
                        name="bus"
                        size={28}
                        color={busSeleccionado?.id === item.id ? COLORS.primary : COLORS.textMuted}
                      />
                    </View>
                    <View style={styles.busItemInfo}>
                      <Text style={styles.busItemPlaca}>{item.placa}</Text>
                      <Text style={styles.busItemMarca}>
                        {item.marca} {item.modelo} ({item.anio})
                      </Text>
                      <Text style={styles.busItemKm}>
                        {item.kilometraje_actual.toLocaleString()} km
                      </Text>
                    </View>
                    {busSeleccionado?.id === item.id && (
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
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
  regenerateButton: { width: 45, height: 50, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: COLORS.border },
  helperText: { fontSize: 11, color: COLORS.textMuted, marginTop: 5, marginLeft: 5 },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 5,
  },
  warningText: { flex: 1, fontSize: 11, color: COLORS.statusWarning, fontStyle: 'italic' },
  currencySymbol: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginLeft: 15 },
  trabajosContainer: { gap: 10, marginBottom: 20 },
  trabajoCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 12,
  },
  trabajoCheckboxSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.backgroundLight },
  trabajoInfo: { flex: 1 },
  trabajoNombre: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  trabajoBadge: { fontSize: 11, color: COLORS.accent, marginTop: 3 },
  textAreaContainer: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 20,
  },
  textArea: { fontSize: 15, color: COLORS.text, minHeight: 100 },
  evidenciaButtons: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  evidenciaButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 10,
  },
  evidenciaButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.textLight },
  evidenciaPreview: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  evidenciaImage: { width: '100%', height: 250, borderRadius: 12 },
  evidenciaRemove: { position: 'absolute', top: 10, right: 10, backgroundColor: COLORS.card, borderRadius: 16 },
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
  productosLista: { marginBottom: 20 },
  productoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productoInfo: { flex: 1 },
  productoNombre: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 5 },
  productoDetalle: { fontSize: 12, color: COLORS.textLight, marginBottom: 3 },
  productoTotal: { fontSize: 13, fontWeight: 'bold', color: COLORS.accent },
  productoDelete: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
  },
  productosTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginTop: 10,
  },
  productosTotalLabel: { fontSize: 15, fontWeight: 'bold', color: COLORS.textLight },
  productosTotalValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  addProductoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  addProductoButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.textLight },
  addProductoForm: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  productoRow: { flexDirection: 'row', gap: 10 },
  currencySymbolSmall: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginLeft: 10 },
  productoFormButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelProductoButton: {
    flex: 1,
    backgroundColor: COLORS.metal,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelProductoButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  saveProductoButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveProductoButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  precioResumenBox: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  precioResumenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  precioResumenLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  precioResumenValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  totalGeneralBox: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  totalGeneralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  totalGeneralInfo: {
    flex: 1,
  },
  totalGeneralLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
    marginBottom: 3,
  },
  totalGeneralSubtext: {
    fontSize: 11,
    color: COLORS.text,
    opacity: 0.8,
  },
  totalGeneralValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
  busSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 20,
    gap: 12,
  },
  busSelectorIcon: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  busSelectorContent: {
    flex: 1,
  },
  busSelectorLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 3,
    letterSpacing: 1.2,
  },
  busSelectorValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  busSelectorPlaceholder: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalLoading: {
    padding: 40,
    alignItems: 'center',
  },
  modalLoadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 10,
  },
  modalEmpty: {
    padding: 40,
    alignItems: 'center',
    gap: 15,
  },
  modalEmptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  busesLista: {
    padding: 15,
    gap: 10,
  },
  busItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 12,
  },
  busItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundLight,
  },
  busItemIcon: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  busItemInfo: {
    flex: 1,
  },
  busItemPlaca: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 3,
  },
  busItemMarca: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  busItemKm: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
