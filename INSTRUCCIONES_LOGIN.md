# 🔐 INSTRUCCIONES: Actualizar LoginScreen con Supabase

Esta guía te explica cómo reemplazar tu LoginScreen actual para que use Supabase en lugar de datos mock.

---

## 📋 ¿Qué Cambia?

### ❌ ANTES (Mock)
```javascript
// Lógica simulada con setTimeout
setTimeout(() => {
  const userData = {
    user: { id: 1, nombre: 'Super Admin', rol: 'super_admin' },
    empresa: null,
    token: 'token_demo',
  };
  login(userData);
}, 1000);
```

### ✅ DESPUÉS (Supabase Real)
```javascript
// Conexión real con Supabase
const session = await signIn(username, password);
const perfil = await getPerfilUsuario();
login(userData); // Con datos reales
```

---

## 🔧 PASO 1: Backup del Archivo Actual

**Antes de hacer cambios, guarda una copia por si acaso:**

```bash
# En la carpeta src/screens/
cp LoginScreen.js LoginScreen_BACKUP.js
```

---

## 🔄 PASO 2: Reemplazar el Archivo

Tienes 2 opciones:

### Opción A: Reemplazar Completo (RECOMENDADO)

1. **Abre** tu archivo actual: `src/screens/LoginScreen.js`
2. **Borra TODO** el contenido
3. **Abre** el nuevo archivo: `src/screens/LoginScreen_SUPABASE.js`
4. **Copia TODO** el contenido
5. **Pega** en `LoginScreen.js`
6. **Guarda** el archivo

### Opción B: Modificar Solo la Función handleLogin

Si prefieres mantener tu archivo y solo cambiar la lógica:

1. **Abre** `src/screens/LoginScreen.js`

2. **Cambia el import** (línea ~15):
```javascript
// ❌ ANTES
import { signIn, getPerfilUsuario } from './lib/supabase';

// ✅ DESPUÉS
import { signIn, getPerfilUsuario, supabase } from '../../lib/supabase';
```

3. **Cambia la variable** (línea ~23):
```javascript
// ❌ ANTES
const [email, setEmail] = useState('');

// ✅ DESPUÉS
const [username, setUsername] = useState('');
```

4. **Reemplaza toda la función handleLogin** (líneas ~30-75):
```javascript
const handleLogin = async () => {
  // Validar campos
  if (!username.trim() || !password.trim()) {
    Alert.alert('Error', 'Completa todos los campos');
    return;
  }

  setLoading(true);

  try {
    // 1. Iniciar sesión con Supabase
    const session = await signIn(username.trim(), password);

    if (!session) {
      Alert.alert(
        'Error de Autenticación',
        'Usuario o contraseña incorrectos.\n\nUsuarios disponibles:\n• superadmin\n• jperez\n• mgarcia'
      );
      setLoading(false);
      return;
    }

    // 2. Obtener perfil completo del usuario
    const perfil = await getPerfilUsuario();

    if (!perfil) {
      Alert.alert('Error', 'No se pudo obtener el perfil del usuario');
      setLoading(false);
      return;
    }

    // 3. Obtener datos de la empresa si tiene una
    let empresaData = null;
    if (perfil.empresa_id) {
      const { data: empresas, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', perfil.empresa_id)
        .single();

      if (!error && empresas) {
        empresaData = empresas;
      } else {
        // Fallback con datos básicos
        empresaData = {
          id: perfil.empresa_id,
          nombre: 'Transportes ABC',
          ruc: '20123456789',
        };
      }
    }

    // 4. Construir userData compatible con authStore
    const userData = {
      user: {
        id: perfil.id,
        nombre: perfil.nombre,
        rol: perfil.rol,
        username: perfil.username,
        activo: perfil.activo,
      },
      empresa: empresaData,
      token: session.access_token,
    };

    // 5. Guardar en authStore
    login(userData);

    console.log('✅ Login exitoso:', userData);
  } catch (error) {
    console.error('❌ Error en login:', error);
    Alert.alert('Error', 'Ocurrió un error al iniciar sesión. Intenta nuevamente.');
  } finally {
    setLoading(false);
  }
};
```

5. **Cambia todas las referencias de `email` a `username`** en el JSX:
```javascript
// Busca y reemplaza:
value={email}        → value={username}
onChangeText={setEmail} → onChangeText={setUsername}
```

6. **Agrega Alert en los imports**:
```javascript
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Alert, // ← Agregar esto
} from 'react-native';
```

7. **Elimina imports no usados**:
```javascript
// ❌ Ya no necesitas estos:
import useUsuariosStore from '../../store/usuariosStore';
import useEmpresasStore from '../../store/empresasStore';

// Y elimina estas líneas:
const { usuarios } = useUsuariosStore();
const { empresas } = useEmpresasStore();
```

---

## ✅ PASO 3: Verificar que Funcione

### 3.1. Reiniciar la App

Si usas Expo:
```bash
# Presiona 'r' en la terminal para reload
# O cierra y abre la app nuevamente
```

### 3.2. Probar Login

**Usuarios disponibles:**

| Username | Contraseña | Rol | Empresa |
|----------|-----------|-----|---------|
| `jperez` | `Admin123!` | admin | Transportes ABC |
| `mgarcia` | `Trabajo123!` | trabajador | Transportes ABC |
| `superadmin` | *(sin contraseña aún)* | super_admin | Ninguna |

**Prueba 1: Login como Admin**
1. Username: `jperez`
2. Contraseña: `Admin123!`
3. Debería iniciar sesión correctamente

**Prueba 2: Login como Trabajador**
1. Username: `mgarcia`
2. Contraseña: `Trabajo123!`
3. Debería iniciar sesión correctamente

**Prueba 3: Login Incorrecto**
1. Username: `noexiste`
2. Contraseña: `cualquiera`
3. Debería mostrar error

---

## 🐛 PASO 4: Solución de Problemas

### Error: "Cannot find module '../../lib/supabase'"

**Causa:** La ruta al archivo supabase.ts está incorrecta.

**Solución:** Verifica que el archivo exista en `src/lib/supabase.ts`

### Error: "SUPABASE_URL is undefined"

**Causa:** No configuraste las credenciales en `src/lib/supabase.ts`

**Solución:**
1. Abre `src/lib/supabase.ts`
2. Reemplaza líneas 18-19:
```typescript
const SUPABASE_URL = 'TU_URL_AQUI';
const SUPABASE_ANON_KEY = 'TU_KEY_AQUI';
```
3. Con tus credenciales de `SUPABASE_CREDENTIALS.txt`

### Error: "Invalid login credentials"

**Causa:** El usuario no existe en Supabase o la contraseña es incorrecta.

**Solución:** Verifica que creaste los usuarios en Supabase ejecutando `crear_usuarios_completo.sql`

### Error: "Network request failed"

**Causa:** No hay conexión a internet o Supabase está caído.

**Solución:**
1. Verifica tu conexión a internet
2. Abre https://status.supabase.com/ para ver el estado del servicio

### El login funciona pero no navega

**Causa:** El authStore no está actualizando correctamente.

**Solución:**
1. Verifica que el `userData` tiene la estructura correcta
2. Agrega logs para debug:
```javascript
console.log('userData:', JSON.stringify(userData, null, 2));
```

---

## 📊 PASO 5: Verificar Logs

Cuando hagas login exitoso, deberías ver en la consola:

```
✅ Login exitoso: {
  user: {
    id: "uuid-del-usuario",
    nombre: "Juan Pérez",
    rol: "admin",
    username: "jperez",
    activo: true
  },
  empresa: {
    id: 1,
    nombre: "Transportes ABC S.A.C.",
    ruc: "20123456789",
    tema: {...}
  },
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🎯 Checklist Final

- [ ] Backup del LoginScreen original creado
- [ ] Import corregido: `from '../../lib/supabase'`
- [ ] Variable cambiada de `email` a `username`
- [ ] Función `handleLogin` reemplazada con lógica async/await
- [ ] Imports no usados eliminados (usuariosStore, empresasStore)
- [ ] Alert importado de react-native
- [ ] JSX actualizado (todas las referencias a `email` cambiadas a `username`)
- [ ] Credenciales configuradas en `src/lib/supabase.ts`
- [ ] App reiniciada
- [ ] Login probado con `jperez / Admin123!`
- [ ] Login probado con `mgarcia / Trabajo123!`
- [ ] Error probado con credenciales incorrectas
- [ ] Logs verificados en consola

---

## 🎊 ¿Qué Sigue?

Una vez que el login funcione con Supabase:

1. **FASE 7:** Edge Functions para cálculos de cronograma
2. **FASE 8:** Integrar todas las pantallas con Supabase (OTs, trabajos, buses, etc.)
3. **FASE 9:** Testing completo de la app
4. **FASE 10:** Preparar para producción

---

## 💡 Notas Importantes

### Diferencias Clave con el Login Mock

1. **Asíncrono:** Ahora es `async/await` real, no `setTimeout`
2. **Token Real:** El token viene de Supabase, no es inventado
3. **Validación Real:** Verifica username/password contra la base de datos
4. **Sesión Persistente:** La sesión se guarda en AsyncStorage automáticamente
5. **Empresa Real:** Los datos de la empresa vienen de la tabla `empresas`

### Seguridad

- ✅ Las contraseñas nunca se guardan en el código
- ✅ El token expira automáticamente (1 hora por defecto)
- ✅ Supabase refresca el token automáticamente
- ✅ La sesión se invalida al hacer logout

---

**¿Dudas?** Revisa el archivo `LoginScreen_SUPABASE.js` completo como referencia.
