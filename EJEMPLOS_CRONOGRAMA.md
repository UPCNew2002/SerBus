# EJEMPLOS DE USO - CRONOGRAMA DE MANTENIMIENTO

Este documento muestra cómo usar las funciones de cronograma en tus pantallas de React Native.

## 1. EJECUTAR SQL EN SUPABASE

Primero, ejecuta el archivo `funciones_cronograma.sql` en el SQL Editor de Supabase:

1. Abre Supabase Dashboard
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `funciones_cronograma.sql`
4. Clic en **Run**

## 2. IMPORTAR FUNCIONES EN TUS PANTALLAS

```typescript
import {
  generarNumeroOT,
  calcularProximoMantenimiento,
  busesNecesitanMantenimiento,
  obtenerEstadisticasOTs,
  obtenerDetalleOT,
  obtenerHistorialMantenimiento,
  crearOT,
  actualizarEstadoOT,
  actualizarKilometraje,
} from './src/lib/cronograma';
```

## 3. EJEMPLOS DE USO

### Pantalla de Dashboard (HomeScreen)

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { busesNecesitanMantenimiento, obtenerEstadisticasOTs } from '../lib/cronograma';

export default function HomeScreen({ user }) {
  const [busesUrgentes, setBusesUrgentes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    // Obtener buses que necesitan mantenimiento
    const buses = await busesNecesitanMantenimiento(user.empresa.id);
    setBusesUrgentes(buses.filter(b => b.urgencia === 'URGENTE'));

    // Obtener estadísticas
    const stats = await obtenerEstadisticasOTs(user.empresa.id);
    setEstadisticas(stats);
  }

  return (
    <View>
      <Text>Dashboard - {user.empresa.nombre}</Text>

      {/* Estadísticas */}
      {estadisticas && (
        <View>
          <Text>OTs Pendientes: {estadisticas.ots_pendientes}</Text>
          <Text>OTs en Proceso: {estadisticas.ots_en_proceso}</Text>
          <Text>OTs Completadas: {estadisticas.ots_completadas}</Text>
          <Text>Tiempo promedio: {estadisticas.tiempo_promedio_dias.toFixed(1)} días</Text>
        </View>
      )}

      {/* Buses urgentes */}
      <Text>Buses que necesitan mantenimiento URGENTE:</Text>
      <FlatList
        data={busesUrgentes}
        keyExtractor={(item) => item.bus_id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.placa} - {item.marca} {item.modelo}</Text>
            <Text>Faltan {item.km_restantes} km</Text>
          </View>
        )}
      />
    </View>
  );
}
```

### Pantalla de Crear OT

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { generarNumeroOT, crearOT } from '../lib/cronograma';

export default function CrearOTScreen({ user, busSeleccionado }) {
  const [numeroOT, setNumeroOT] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    // Generar número de OT automáticamente
    generarNumero();
  }, []);

  async function generarNumero() {
    const numero = await generarNumeroOT(user.empresa.id);
    if (numero) {
      setNumeroOT(numero);
    }
  }

  async function handleCrearOT() {
    const fechaHoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

    const ot = await crearOT({
      empresa_id: user.empresa.id,
      bus_id: busSeleccionado.id,
      trabajador_id: user.id,
      numero_ot: numeroOT,
      fecha_inicio: fechaHoy,
      observaciones: observaciones,
      trabajos_ids: [1, 2, 3], // IDs de trabajos seleccionados
    });

    if (ot) {
      alert('OT creada exitosamente: ' + ot.numero_ot);
      // Navegar a pantalla de detalle
    }
  }

  return (
    <View>
      <Text>Crear Nueva OT</Text>
      <Text>Número: {numeroOT}</Text>
      <Text>Bus: {busSeleccionado.placa}</Text>

      <TextInput
        placeholder="Observaciones"
        value={observaciones}
        onChangeText={setObservaciones}
        multiline
      />

      <Button title="Crear OT" onPress={handleCrearOT} />
    </View>
  );
}
```

### Pantalla de Detalle de Bus

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import {
  calcularProximoMantenimiento,
  obtenerHistorialMantenimiento,
  actualizarKilometraje
} from '../lib/cronograma';

export default function DetalleBusScreen({ busId }) {
  const [proximoMant, setProximoMant] = useState(null);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    // Calcular próximo mantenimiento
    const proximo = await calcularProximoMantenimiento(busId);
    setProximoMant(proximo);

    // Obtener historial
    const hist = await obtenerHistorialMantenimiento(busId);
    setHistorial(hist);
  }

  async function handleActualizarKm(nuevoKm) {
    const success = await actualizarKilometraje(busId, nuevoKm);
    if (success) {
      // Recargar datos
      cargarDatos();
    }
  }

  return (
    <View>
      {proximoMant && (
        <View>
          <Text>Placa: {proximoMant.placa}</Text>
          <Text>Kilometraje actual: {proximoMant.kilometraje_actual} km</Text>
          <Text>Próximo mantenimiento: {proximoMant.kilometraje_proximo_mantenimiento} km</Text>
          <Text>Faltan: {proximoMant.km_restantes} km</Text>
          {proximoMant.necesita_mantenimiento && (
            <Text style={{ color: 'red' }}>⚠️ NECESITA MANTENIMIENTO</Text>
          )}
        </View>
      )}

      <Text>Historial de Mantenimiento:</Text>
      <FlatList
        data={historial}
        keyExtractor={(item) => item.ot_id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.numero_ot} - {item.estado}</Text>
            <Text>Fecha: {item.fecha_inicio}</Text>
            <Text>Trabajos: {item.cantidad_trabajos}</Text>
            <Text>Duración: {item.dias_duracion} días</Text>
          </View>
        )}
      />

      <Button title="Actualizar Kilometraje" onPress={() => {
        // Mostrar modal para ingresar nuevo kilometraje
      }} />
    </View>
  );
}
```

### Pantalla de Detalle de OT

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { obtenerDetalleOT, actualizarEstadoOT } from '../lib/cronograma';

export default function DetalleOTScreen({ otId }) {
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    cargarDetalle();
  }, []);

  async function cargarDetalle() {
    const det = await obtenerDetalleOT(otId);
    setDetalle(det);
  }

  async function handleCambiarEstado(nuevoEstado) {
    const fechaFin = nuevoEstado === 'completado'
      ? new Date().toISOString().split('T')[0]
      : undefined;

    const success = await actualizarEstadoOT(otId, nuevoEstado, fechaFin);
    if (success) {
      cargarDetalle();
    }
  }

  if (!detalle) return <Text>Cargando...</Text>;

  return (
    <View>
      <Text>OT: {detalle.ot.numero_ot}</Text>
      <Text>Estado: {detalle.ot.estado}</Text>
      <Text>Fecha inicio: {detalle.ot.fecha_inicio}</Text>

      <Text>Bus: {detalle.bus.placa} - {detalle.bus.marca} {detalle.bus.modelo}</Text>
      <Text>Kilometraje: {detalle.bus.kilometraje_actual} km</Text>

      {detalle.trabajador && (
        <Text>Trabajador: {detalle.trabajador.nombre}</Text>
      )}

      <Text>Trabajos:</Text>
      <FlatList
        data={detalle.trabajos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.nombre} - {item.estado}</Text>
            <Text>{item.descripcion}</Text>
            {item.notas && <Text>Notas: {item.notas}</Text>}
          </View>
        )}
      />

      {detalle.ot.estado === 'pendiente' && (
        <Button
          title="Iniciar Trabajo"
          onPress={() => handleCambiarEstado('en_proceso')}
        />
      )}

      {detalle.ot.estado === 'en_proceso' && (
        <Button
          title="Completar OT"
          onPress={() => handleCambiarEstado('completado')}
        />
      )}
    </View>
  );
}
```

### Pantalla de Lista de Buses (con alertas)

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import { calcularProximoMantenimiento } from '../lib/cronograma';

export default function ListaBusesScreen({ empresaId, navigation }) {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    cargarBuses();
  }, []);

  async function cargarBuses() {
    // Obtener todos los buses
    const { data: busesData } = await supabase
      .from('buses')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('activo', true);

    // Para cada bus, calcular próximo mantenimiento
    const busesConMantenimiento = await Promise.all(
      busesData.map(async (bus) => {
        const proximo = await calcularProximoMantenimiento(bus.id);
        return {
          ...bus,
          proximo_mantenimiento: proximo,
        };
      })
    );

    setBuses(busesConMantenimiento);
  }

  return (
    <FlatList
      data={buses}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => {
        const necesitaMant = item.proximo_mantenimiento?.necesita_mantenimiento;
        const kmRestantes = item.proximo_mantenimiento?.km_restantes;

        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('DetalleBus', { busId: item.id })}
          >
            <View style={{
              backgroundColor: necesitaMant ? '#ffebee' : 'white',
              padding: 10,
              margin: 5,
              borderRadius: 5,
            }}>
              <Text style={{ fontWeight: 'bold' }}>{item.placa}</Text>
              <Text>{item.marca} {item.modelo} ({item.anio})</Text>
              <Text>Kilometraje: {item.kilometraje_actual} km</Text>

              {necesitaMant && (
                <Text style={{ color: 'red', marginTop: 5 }}>
                  ⚠️ Mantenimiento en {kmRestantes} km
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}
```

## 4. TESTING RÁPIDO

Puedes probar estas funciones directamente desde el SQL Editor de Supabase:

```sql
-- Generar número de OT
SELECT generar_numero_ot(1);

-- Calcular próximo mantenimiento del bus ABC-123
SELECT * FROM calcular_proximo_mantenimiento(1);

-- Ver buses que necesitan mantenimiento
SELECT * FROM buses_necesitan_mantenimiento(1);

-- Ver estadísticas de OTs
SELECT * FROM estadisticas_ots(1);

-- Ver historial de un bus
SELECT * FROM historial_mantenimiento_bus(1);

-- Ver detalle de una OT
SELECT detalle_ot(1);
```

## 5. PRÓXIMOS PASOS

1. Ejecutar `funciones_cronograma.sql` en Supabase
2. Importar las funciones en tus pantallas
3. Adaptar los ejemplos a tu estructura de navegación
4. Probar las funciones con datos reales
