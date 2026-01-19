# 📦 GUÍA: Supabase Storage para SerBus

## 📚 Índice
1. [¿Qué es Storage?](#qué-es-storage)
2. [Crear Bucket](#paso-1-crear-bucket)
3. [Configurar Políticas RLS](#paso-2-configurar-políticas-rls)
4. [Probar Subida Manual](#paso-3-probar-subida-manual)
5. [Código React Native](#paso-4-código-react-native)
6. [Solución de Problemas](#solución-de-problemas)

---

## 📚 ¿Qué es Storage?

**Supabase Storage** es un servicio de almacenamiento de archivos similar a:
- AWS S3
- Google Cloud Storage
- Firebase Storage

Pero con ventajas:
- ✅ **RLS integrado:** Las mismas políticas de seguridad que las tablas
- ✅ **URLs firmadas:** Para acceso temporal a archivos privados
- ✅ **Transformaciones:** Redimensionar imágenes on-the-fly
- ✅ **CDN global:** Archivos servidos rápido en todo el mundo

---

## 📋 PASO 1: Crear Bucket

### 1.1 Navegar a Storage

1. Ve a tu proyecto **SerBus** en [app.supabase.com](https://app.supabase.com)
2. Menú lateral → **Storage** (icono de carpeta 📁)
3. Click en **"Create a new bucket"**

### 1.2 Configurar el Bucket

**Formulario:**

| Campo | Valor | ¿Por qué? |
|-------|-------|-----------|
| Name | `ots-evidencias` | Nombre descriptivo sin espacios |
| Public bucket | ❌ **NO** | Las fotos son privadas (solo usuarios autenticados) |
| File size limit | `10` MB | Fotos de celular pesan ~2-5 MB |
| Allowed MIME types | `image/jpeg,image/png,image/webp` | Solo imágenes |

### 1.3 Crear

Click en **"Create bucket"**

✅ **Verificar:** Deberías ver `ots-evidencias` en la lista de buckets

---

## 📋 PASO 2: Configurar Políticas RLS

### 2.1 Abrir SQL Editor

1. Menú lateral → **SQL Editor**
2. Click en **"+ New query"**

### 2.2 Ejecutar Script de Políticas

1. Abre el archivo **`supabase_storage_policies.sql`** en tu proyecto
2. **COPIA TODO** el contenido
3. **PEGA** en el SQL Editor de Supabase
4. Click en **"RUN"**

✅ **Verificar:** No deberías ver errores. Deberías ver:

```
Success. No rows returned
```

### 2.3 Verificar Políticas Creadas

Ejecuta esta query para ver las políticas:

```sql
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;
```

Deberías ver 4 políticas:
- `delete_ots_evidencias` (DELETE)
- `insert_ots_evidencias` (INSERT)
- `select_ots_evidencias` (SELECT)
- `update_ots_evidencias` (UPDATE)

---

## 📋 PASO 3: Probar Subida Manual

Vamos a probar subiendo una foto manualmente desde el panel de Supabase.

### 3.1 Preparar Estructura de Carpetas

1. Ve a **Storage** → Click en `ots-evidencias`
2. Click en **"Upload file"** → Selecciona **"Create folder"**
3. Nombre: `empresa-1` → Click **"Create"**
4. Entra a la carpeta `empresa-1`
5. Crea otra carpeta: `ot-prueba`

Tu estructura debería verse:
```
ots-evidencias/
  └── empresa-1/
      └── ot-prueba/
```

### 3.2 Subir Foto de Prueba

1. Entra a la carpeta `ot-prueba`
2. Click en **"Upload file"**
3. Selecciona cualquier imagen desde tu computadora
4. Click **"Upload"**

✅ **Verificar:** Deberías ver la foto en la lista

### 3.3 Obtener URL de la Foto

1. Click en la foto que subiste
2. En el panel derecho, verás **"URL"**
3. Copia la URL (algo como: `https://xxx.supabase.co/storage/v1/object/public/ots-evidencias/empresa-1/ot-prueba/foto.jpg`)

**IMPORTANTE:** Como el bucket es **privado**, esa URL NO funcionará directamente. Necesitas una **URL firmada** (signed URL) que genera el código.

---

## 📋 PASO 4: Código React Native

### 4.1 Instalar Cliente de Supabase

Si aún no lo tienes instalado:

```bash
npm install @supabase/supabase-js
```

### 4.2 Inicializar Cliente

**Archivo:** `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'TU_PROJECT_URL'; // De SUPABASE_CREDENTIALS.txt
const supabaseAnonKey = 'TU_ANON_KEY'; // De SUPABASE_CREDENTIALS.txt

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4.3 Subir Foto

**Función para subir una foto:**

```typescript
import { supabase } from './lib/supabase';

/**
 * Sube una foto de evidencia de una OT
 *
 * @param otNumero - Número de la OT (ej: "OT-2024-001")
 * @param empresaId - ID de la empresa
 * @param fotoUri - URI local de la foto (ej: "file:///path/to/photo.jpg")
 * @param nombreArchivo - Nombre del archivo (ej: "antes-01.jpg")
 * @returns URL pública de la foto subida
 */
export async function subirFotoOT(
  otNumero: string,
  empresaId: number,
  fotoUri: string,
  nombreArchivo: string
): Promise<string | null> {
  try {
    // 1. Leer el archivo
    const response = await fetch(fotoUri);
    const blob = await response.blob();

    // 2. Construir el path: empresa-{id}/ot-{numero}/{nombre}
    const filePath = `empresa-${empresaId}/${otNumero}/${nombreArchivo}`;

    // 3. Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('ots-evidencias')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: false, // Si ya existe, fallar (no sobreescribir)
      });

    if (error) {
      console.error('Error subiendo foto:', error);
      return null;
    }

    // 4. Generar URL firmada (válida por 1 año)
    const { data: urlData } = await supabase.storage
      .from('ots-evidencias')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 año en segundos

    return urlData?.signedUrl || null;
  } catch (error) {
    console.error('Error en subirFotoOT:', error);
    return null;
  }
}
```

### 4.4 Obtener Fotos de una OT

**Función para listar todas las fotos de una OT:**

```typescript
/**
 * Obtiene todas las fotos de una OT
 *
 * @param otNumero - Número de la OT
 * @param empresaId - ID de la empresa
 * @returns Array de URLs firmadas
 */
export async function obtenerFotosOT(
  otNumero: string,
  empresaId: number
): Promise<string[]> {
  try {
    // 1. Listar archivos en la carpeta de la OT
    const folderPath = `empresa-${empresaId}/${otNumero}`;

    const { data, error } = await supabase.storage
      .from('ots-evidencias')
      .list(folderPath);

    if (error || !data) {
      console.error('Error listando fotos:', error);
      return [];
    }

    // 2. Generar URLs firmadas para cada foto
    const urls = await Promise.all(
      data.map(async (file) => {
        const filePath = `${folderPath}/${file.name}`;
        const { data: urlData } = await supabase.storage
          .from('ots-evidencias')
          .createSignedUrl(filePath, 60 * 60); // Válida por 1 hora

        return urlData?.signedUrl || '';
      })
    );

    return urls.filter(url => url !== '');
  } catch (error) {
    console.error('Error en obtenerFotosOT:', error);
    return [];
  }
}
```

### 4.5 Eliminar Foto

**Función para eliminar una foto (solo admin):**

```typescript
/**
 * Elimina una foto de evidencia
 *
 * @param otNumero - Número de la OT
 * @param empresaId - ID de la empresa
 * @param nombreArchivo - Nombre del archivo a eliminar
 * @returns true si se eliminó correctamente
 */
export async function eliminarFotoOT(
  otNumero: string,
  empresaId: number,
  nombreArchivo: string
): Promise<boolean> {
  try {
    const filePath = `empresa-${empresaId}/${otNumero}/${nombreArchivo}`;

    const { error } = await supabase.storage
      .from('ots-evidencias')
      .remove([filePath]);

    if (error) {
      console.error('Error eliminando foto:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en eliminarFotoOT:', error);
    return false;
  }
}
```

### 4.6 Ejemplo de Uso en Componente

**Componente para tomar y subir foto:**

```typescript
import React, { useState } from 'react';
import { View, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { subirFotoOT } from './lib/supabase-storage';

export function SubirFotoOT({ otNumero, empresaId }) {
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const tomarFoto = async () => {
    // Pedir permisos
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Necesitamos permisos para acceder a la cámara');
      return;
    }

    // Tomar foto
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8, // Comprimir al 80% para reducir tamaño
      allowsEditing: true,
    });

    if (!result.canceled) {
      setFotoUri(result.assets[0].uri);
    }
  };

  const subirFoto = async () => {
    if (!fotoUri) return;

    setUploading(true);

    const timestamp = Date.now();
    const nombreArchivo = `evidencia-${timestamp}.jpg`;

    const url = await subirFotoOT(otNumero, empresaId, fotoUri, nombreArchivo);

    setUploading(false);

    if (url) {
      Alert.alert('Éxito', 'Foto subida correctamente');
      setFotoUri(null);
    } else {
      Alert.alert('Error', 'No se pudo subir la foto');
    }
  };

  return (
    <View>
      <Button title="Tomar Foto" onPress={tomarFoto} />

      {fotoUri && (
        <>
          <Image source={{ uri: fotoUri }} style={{ width: 300, height: 300 }} />
          <Button
            title={uploading ? "Subiendo..." : "Subir Foto"}
            onPress={subirFoto}
            disabled={uploading}
          />
        </>
      )}
    </View>
  );
}
```

---

## 🐛 Solución de Problemas

### Error: "new row violates row-level security policy"

**Causa:** El usuario no tiene permisos para subir en esa carpeta.

**Solución:**
1. Verifica que el path use el formato correcto: `empresa-{empresaId}/...`
2. Verifica que `get_user_empresa_id()` devuelva el ID correcto
3. Ejecuta esta query para verificar:

```sql
SELECT
  auth.uid() as user_id,
  get_user_rol() as rol,
  get_user_empresa_id() as empresa_id;
```

### Error: "The resource already exists"

**Causa:** Ya existe un archivo con ese nombre.

**Solución:**
1. Cambia `upsert: false` a `upsert: true` para sobreescribir
2. O agrega un timestamp al nombre: `foto-${Date.now()}.jpg`

### Error: "Invalid bucket"

**Causa:** El bucket no existe o el nombre está mal escrito.

**Solución:**
1. Verifica que el bucket se llame exactamente `ots-evidencias`
2. Ve a Storage en Supabase y confirma que existe

### Las imágenes no se ven

**Causa:** Estás usando la URL pública en vez de la firmada.

**Solución:**
- ✅ Usa `createSignedUrl()` para generar URLs temporales
- ❌ NO uses la URL pública directamente (el bucket es privado)

---

## 📊 Mejores Prácticas

### 1. Nombrar Archivos

**Incluir timestamp para evitar duplicados:**

```typescript
const timestamp = Date.now();
const nombreArchivo = `antes-${timestamp}.jpg`;
// Resultado: antes-1704812345678.jpg
```

### 2. Comprimir Imágenes

**Configurar calidad al tomar foto:**

```typescript
const result = await ImagePicker.launchCameraAsync({
  quality: 0.8, // 80% de calidad (reduce tamaño sin perder mucha calidad)
});
```

### 3. Manejar Errores

**Siempre mostrar feedback al usuario:**

```typescript
try {
  const url = await subirFotoOT(...);
  if (url) {
    Alert.alert('Éxito', 'Foto subida');
  } else {
    Alert.alert('Error', 'No se pudo subir');
  }
} catch (error) {
  Alert.alert('Error', 'Algo salió mal');
}
```

### 4. Limitar Tamaño

**Verificar tamaño antes de subir:**

```typescript
const response = await fetch(fotoUri);
const blob = await response.blob();

if (blob.size > 10 * 1024 * 1024) { // 10 MB
  Alert.alert('Foto muy grande', 'Máximo 10 MB');
  return;
}
```

---

## ✅ Checklist de Implementación

- [ ] Crear bucket `ots-evidencias` en Supabase
- [ ] Configurar como privado (NO public)
- [ ] Ejecutar script `supabase_storage_policies.sql`
- [ ] Verificar que las 4 políticas se crearon
- [ ] Probar subida manual desde panel
- [ ] Instalar `@supabase/supabase-js` en React Native
- [ ] Inicializar cliente de Supabase
- [ ] Implementar función `subirFotoOT()`
- [ ] Implementar función `obtenerFotosOT()`
- [ ] Implementar función `eliminarFotoOT()`
- [ ] Probar desde la app con usuario admin
- [ ] Probar desde la app con usuario trabajador
- [ ] Verificar que trabajador NO puede eliminar fotos

---

## 🎯 Próximos Pasos

Una vez que Storage esté funcionando, continuaremos con:

**FASE 7:** Edge Functions para cálculos de cronograma
**FASE 8:** Conectar toda la app React Native con Supabase
**FASE 9:** Testing y debugging
**FASE 10:** Preparar para producción

---

**¿Preguntas?** Lee esta guía completa y avísame cuando hayas completado los pasos 1 y 2.
