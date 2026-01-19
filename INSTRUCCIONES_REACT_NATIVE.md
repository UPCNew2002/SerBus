# 📱 INSTRUCCIONES DETALLADAS: React Native + Supabase Storage

Esta guía te explica **paso a paso** dónde colocar cada archivo y cómo integrar Supabase Storage en tu app React Native.

---

## 📂 PASO 1: Crear Estructura de Carpetas

Primero, asegúrate de tener esta estructura en tu proyecto:

```
SerBus/
├── src/
│   ├── lib/              ← Si no existe, créala
│   ├── components/       ← Si no existe, créala
│   └── screens/          ← Si no existe, créala
└── package.json
```

### ¿Cómo crear carpetas?

**En tu terminal (en la raíz del proyecto):**

```bash
# Si no existen, crear carpetas
mkdir -p src/lib
mkdir -p src/components
mkdir -p src/screens
```

---

## 📦 PASO 2: Instalar Dependencias

**En tu terminal:**

```bash
npm install @supabase/supabase-js
npm install @react-native-async-storage/async-storage
npm install expo-image-picker
```

**¿Qué hacen estas librerías?**

- `@supabase/supabase-js`: Cliente oficial de Supabase
- `@react-native-async-storage/async-storage`: Guardar sesión del usuario
- `expo-image-picker`: Tomar/seleccionar fotos

---

## 📄 PASO 3: Copiar Archivos

Ahora vamos a copiar los archivos que creé. Te explico **exactamente dónde** va cada uno.

### 3.1. Cliente de Supabase

**ARCHIVO:** `src/lib/supabase.ts`

**¿QUÉ HACE?**
- Inicializa la conexión con Supabase
- Funciones de login/logout
- Obtener perfil del usuario

**IMPORTANTE:** Abre el archivo y **reemplaza estas líneas**:

```typescript
// LÍNEA 18-19
const SUPABASE_URL = 'https://TU_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';
```

**¿Dónde encuentro estos valores?**

1. Abre el archivo `SUPABASE_CREDENTIALS.txt` en tu proyecto
2. Copia el **Project URL** → Pégalo en `SUPABASE_URL`
3. Copia el **Anon Key** → Pégalo en `SUPABASE_ANON_KEY`

**EJEMPLO:**

```typescript
const SUPABASE_URL = 'https://abcdefgh12345678.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 3.2. Funciones de Storage

**ARCHIVO:** `src/lib/supabase-storage.ts`

**¿QUÉ HACE?**
- `subirFotoOT()`: Subir una foto
- `obtenerFotosOT()`: Listar todas las fotos de una OT
- `eliminarFotoOT()`: Eliminar una foto
- Y más funciones útiles

**NO NECESITAS MODIFICAR NADA EN ESTE ARCHIVO**, funciona tal cual.

### 3.3. Componente SubirFotoOT

**ARCHIVO:** `src/components/SubirFotoOT.tsx`

**¿QUÉ HACE?**
- Permite tomar foto con cámara o seleccionar de galería
- Sube la foto a Supabase Storage
- Muestra preview antes de subir

**NO NECESITAS MODIFICAR NADA**, este componente está listo para usar.

### 3.4. Componente ListaFotosOT

**ARCHIVO:** `src/components/ListaFotosOT.tsx`

**¿QUÉ HACE?**
- Muestra todas las fotos de una OT en grid de 3 columnas
- Permite eliminar fotos (si el usuario tiene permisos)
- Botón para recargar la lista

**NO NECESITAS MODIFICAR NADA**, este componente está listo para usar.

### 3.5. Pantalla de Ejemplo

**ARCHIVO:** `src/screens/DetalleOTScreen.tsx`

**¿QUÉ HACE?**
- Ejemplo completo de cómo usar los componentes anteriores
- Muestra cómo integrarlos en una pantalla real

**ESTE ES UN EJEMPLO**, debes adaptarlo a tu estructura existente.

---

## 🔧 PASO 4: Integrar en tu App

Ahora vamos a usar estos componentes en tu app.

### 4.1. Iniciar Sesión

**En tu pantalla de login** (por ejemplo, `LoginScreen.tsx`):

```typescript
import { signIn, getPerfilUsuario } from './lib/supabase';

// Dentro de tu función de login
async function handleLogin() {
  const username = 'jperez'; // Del input del usuario
  const password = 'Admin123!'; // Del input del usuario

  // 1. Iniciar sesión
  const session = await signIn(username, password);

  if (session) {
    // 2. Obtener perfil
    const perfil = await getPerfilUsuario();

    if (perfil) {
      console.log('Usuario logueado:', perfil.nombre);
      console.log('Rol:', perfil.rol);
      console.log('Empresa ID:', perfil.empresa_id);

      // 3. Guardar en tu estado global (Zustand, Context, Redux, etc.)
      // Por ejemplo:
      // setUser(perfil);

      // 4. Navegar a la pantalla principal
      // navigation.navigate('Home');
    }
  } else {
    Alert.alert('Error', 'Usuario o contraseña incorrectos');
  }
}
```

### 4.2. Usar en Pantalla de OT

**En tu pantalla de detalle de OT**:

```typescript
import { SubirFotoOT } from './components/SubirFotoOT';
import { ListaFotosOT } from './components/ListaFotosOT';

function DetalleOT({ otNumero, empresaId }) {
  return (
    <View>
      {/* Tu contenido de la OT */}

      {/* Componente para subir fotos */}
      <SubirFotoOT
        otNumero={otNumero}
        empresaId={empresaId}
        onFotoSubida={(url) => {
          console.log('Foto subida:', url);
          // Aquí puedes actualizar tu estado local
        }}
      />

      {/* Lista de fotos */}
      <ListaFotosOT
        otNumero={otNumero}
        empresaId={empresaId}
        puedeEliminar={true} // Solo si es admin
        onFotoPress={(foto) => {
          console.log('Foto presionada:', foto);
          // Aquí puedes abrir un modal con la foto grande
        }}
      />
    </View>
  );
}
```

---

## 🎨 PASO 5: Personalizar Estilos (Opcional)

Si quieres cambiar los colores o estilos:

### 5.1. Cambiar Color Principal

**En `SubirFotoOT.tsx`:**

Busca la línea:
```typescript
backgroundColor: '#dc2626', // Rojo
```

Cámbiala por tu color:
```typescript
backgroundColor: '#3b82f6', // Azul
```

### 5.2. Cambiar Tamaño de Fotos en Grid

**En `ListaFotosOT.tsx`:**

Busca la línea:
```typescript
const FOTO_SIZE = (width - 48) / 3; // 3 columnas
```

Cámbiala por:
```typescript
const FOTO_SIZE = (width - 48) / 2; // 2 columnas (fotos más grandes)
```

---

## ✅ PASO 6: Verificar Permisos

Los componentes piden permisos automáticamente, pero asegúrate de tener esto en **`app.json`**:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "La app necesita acceso a tus fotos para subir evidencias de OTs",
          "cameraPermission": "La app necesita acceso a la cámara para tomar fotos de evidencias"
        }
      ]
    ]
  }
}
```

---

## 🧪 PASO 7: Probar

### 7.1. Probar Login

```typescript
import { signIn } from './lib/supabase';

// Probar con usuario admin
const session = await signIn('jperez', 'Admin123!');
console.log('Session:', session);
```

### 7.2. Probar Subir Foto

1. Abre la pantalla con el componente `SubirFotoOT`
2. Click en "Agregar Foto"
3. Selecciona "Tomar Foto" o "Seleccionar de Galería"
4. Toma/selecciona una foto
5. Click en "Subir Foto"
6. Deberías ver un mensaje de éxito

### 7.3. Probar Ver Fotos

1. Abre la pantalla con el componente `ListaFotosOT`
2. Deberías ver las fotos en un grid de 3 columnas
3. Si eres admin, deberías ver el botón 🗑️ en cada foto

### 7.4. Probar Eliminar Foto (Solo Admin)

1. Click en el botón 🗑️ de una foto
2. Confirma la eliminación
3. La foto desaparece de la lista

---

## 🐛 PASO 8: Solución de Problemas

### Error: "Module not found: @supabase/supabase-js"

**Solución:**
```bash
npm install @supabase/supabase-js
```

### Error: "new row violates row-level security policy"

**Causa:** El usuario no tiene permisos para subir en esa carpeta.

**Solución:**
1. Verifica que `empresaId` sea correcto
2. Verifica que el usuario esté logueado
3. Ejecuta esta query en Supabase:

```sql
SELECT
  auth.uid() as user_id,
  get_user_rol() as rol,
  get_user_empresa_id() as empresa_id;
```

### Las fotos no se ven

**Causa:** La URL firmada expiró o es inválida.

**Solución:**
- Las URLs firmadas expiran después de 1 hora
- Recarga la lista de fotos para generar nuevas URLs

### Error al tomar foto: "Camera permission not granted"

**Solución:**
1. Ve a Configuración del teléfono
2. Aplicaciones → Tu app
3. Permisos → Habilita Cámara y Almacenamiento

---

## 📊 PASO 9: Mejores Prácticas

### 9.1. Guardar URLs en la Base de Datos

Cuando subes una foto, puedes guardar la referencia en tu tabla `ots`:

```typescript
const url = await subirFotoOT(otNumero, empresaId, fotoUri, 'antes-01.jpg');

if (url) {
  // Guardar en tabla ots
  const { error } = await supabase
    .from('ots')
    .update({
      fotos: [...fotosExistentes, { nombre: 'antes-01.jpg', url }]
    })
    .eq('numero_ot', otNumero);
}
```

### 9.2. Comprimir Fotos Antes de Subir

En `expo-image-picker`, usa:

```typescript
const result = await ImagePicker.launchCameraAsync({
  quality: 0.7, // 70% de calidad (reduce tamaño)
  allowsEditing: true,
  aspect: [4, 3],
});
```

### 9.3. Mostrar Progreso de Subida

Puedes agregar un indicador de progreso:

```typescript
const [uploadProgress, setUploadProgress] = useState(0);

// En la función de subida
const { data, error } = await supabase.storage
  .from('ots-evidencias')
  .upload(filePath, blob, {
    contentType: 'image/jpeg',
    onUploadProgress: (progress) => {
      const percent = (progress.loaded / progress.total) * 100;
      setUploadProgress(percent);
    },
  });
```

---

## 🎯 RESUMEN: Checklist

- [ ] Crear carpetas `src/lib`, `src/components`, `src/screens`
- [ ] Instalar dependencias (`@supabase/supabase-js`, etc.)
- [ ] Copiar `src/lib/supabase.ts` y configurar URL y Key
- [ ] Copiar `src/lib/supabase-storage.ts`
- [ ] Copiar `src/components/SubirFotoOT.tsx`
- [ ] Copiar `src/components/ListaFotosOT.tsx`
- [ ] Revisar `src/screens/DetalleOTScreen.tsx` como ejemplo
- [ ] Integrar componentes en tu pantalla de OT
- [ ] Configurar permisos en `app.json`
- [ ] Probar login con `signIn('jperez', 'Admin123!')`
- [ ] Probar subir foto
- [ ] Probar ver fotos
- [ ] Probar eliminar foto (como admin)

---

## 🚀 Próximos Pasos

Una vez que esto funcione:

1. **FASE 7:** Edge Functions para cálculos de cronograma
2. **FASE 8:** Integrar toda la app con Supabase (OTs, trabajos, buses, etc.)
3. **FASE 9:** Testing completo
4. **FASE 10:** Preparar para producción

---

**¿Tienes dudas?** Revisa esta guía completa y los archivos de ejemplo.
