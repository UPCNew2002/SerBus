# 🔐 GUÍA PASO A PASO: CONFIGURAR AUTENTICACIÓN (CON USERNAME)

## 🎯 OBJETIVO
Configurar el sistema de login/logout usando **USERNAME** (como `ntejeda`, `jperez`) en lugar de emails visibles.

## 💡 ¿CÓMO FUNCIONA?

```
┌─────────────────────────────────────────────────────────┐
│  LO QUE EL USUARIO VE:                                  │
│  ┌────────────────────────────────────────────────┐    │
│  │  Usuario: ntejeda                              │    │
│  │  Password: ****                                │    │
│  │          [Iniciar Sesión]                      │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         ↓ (La app convierte automáticamente)
┌─────────────────────────────────────────────────────────┐
│  LO QUE SUPABASE RECIBE:                                │
│  Email: ntejeda@serbus.internal                         │
│  Password: ****                                         │
└─────────────────────────────────────────────────────────┘
```

**IMPORTANTE:**
- ✅ Usuario escribe: `ntejeda` (sin @serbus.internal)
- ✅ App agrega automáticamente: `@serbus.internal`
- ✅ Supabase Auth funciona normalmente
- ✅ Usuario NUNCA ve el email completo

---

## 📋 PARTE A: HABILITAR AUTENTICACIÓN POR EMAIL

### PASO 1: Ir a Authentication

1. Abre tu proyecto **SerBus** en Supabase
2. En el menú lateral **IZQUIERDO**, busca 🔐 **"Authentication"**
3. **HAZ CLIC** en "Authentication"

### PASO 2: Ir a Providers

Vas a ver varias pestañas en la parte superior:

```
┌─────────────────────────────────────────────┐
│  Users | Policies | Providers | Templates   │ ← Haz clic en "Providers"
└─────────────────────────────────────────────┘
```

**HAZ CLIC** en **"Providers"**

### PASO 3: Configurar Email Provider

Vas a ver una lista de proveedores:

```
┌─────────────────────────────────────────────┐
│  Auth Providers                             │
│                                             │
│  📧 Email                    [✅ Enabled]   │ ← Haz clic aquí
│  📱 Phone                    [  Disabled]   │
│  🔑 Google                   [  Disabled]   │
│  🔑 GitHub                   [  Disabled]   │
└─────────────────────────────────────────────┘
```

**HAZ CLIC** en **"Email"** para abrir configuración:

### PASO 4: DESHABILITAR confirmación de email

```
┌─────────────────────────────────────────────┐
│  Email Auth                                 │
│                                             │
│  ✅ Enable Email provider                   │ ← Dejar marcado
│  ⬜ Confirm email                           │ ← DESMARCAR
│  ⬜ Secure email change                     │
│                                             │
│  Minimum password length: 6                 │
└─────────────────────────────────────────────┘
```

**IMPORTANTE:** **DESMARCA** la opción **"Confirm email"**

**¿Por qué?**
- Los emails son internos (`@serbus.internal`)
- No existen buzones reales
- No se pueden confirmar
- Queremos que los usuarios inicien sesión inmediatamente

**HAZ CLIC** en **"Save"**

---

## 📋 PARTE B: CREAR TABLA PERFILES

### PASO 1: Ejecutar SQL

1. Ve a **SQL Editor** (🔧 en el menú lateral)
2. Click en **"+ New query"**
3. Abre el archivo: `supabase_auth_perfiles.sql`
4. **COPIA TODO** el contenido
5. **PEGA** en Supabase SQL Editor
6. Click en **"RUN"** (botón verde)

### PASO 2: Verificar

1. Ve a **Table Editor** (📊)
2. Deberías ver una nueva tabla: **`perfiles`**

```
┌─────────────────────────────┐
│  public                     │
│    ├── 📋 buses             │
│    ├── 📋 empresas          │
│    ├── 📋 ots               │
│    ├── 📋 ots_trabajos      │
│    ├── 📋 perfiles          │ ← ¡Nueva tabla!
│    └── 📋 trabajos          │
└─────────────────────────────┘
```

3. **HAZ CLIC** en **`perfiles`** para ver su estructura:

```
┌─────────────────────────────────────────────────────────┐
│  perfiles                                               │
│  ┌────┬──────────┬────────┬──────┬────────────┬───────┐│
│  │ id │ username │ nombre │ rol  │ empresa_id │ activo││
│  └────┴──────────┴────────┴──────┴────────────┴───────┘│
│                                                         │
│  No rows found (aún sin usuarios)                       │
└─────────────────────────────────────────────────────────┘
```

**✅ Si ves la columna `username`, perfecto!**

---

## 📋 PARTE C: CREAR PRIMERA EMPRESA (Si no lo hiciste)

Antes de crear usuarios, necesitas tener al menos 1 empresa.

### OPCIÓN 1: Si ejecutaste los datos de prueba en FASE 3

Ya tienes la empresa "Transportes ABC S.A.C." con `id=1`. **Salta a PARTE D**.

### OPCIÓN 2: Crear empresa manualmente

1. Ve a **Table Editor** → **`empresas`**
2. Click en **"Insert row"** o **"+ Insert"**
3. Llena los campos:

```
ruc: 20123456789
razon_social: Transportes ABC S.A.C.
telefono: 987654321
direccion: Av. Principal 123, Lima
activo: ✅
(Deja el resto en default)
```

4. Click en **"Save"**

---

## 📋 PARTE D: CREAR USUARIOS (3 TIPOS)

Vamos a crear 3 usuarios de prueba:
1. **Super Admin** (acceso total, username: `superadmin`)
2. **Admin** (gestiona Transportes ABC, username: `jperez`)
3. **Trabajador** (solo lectura, username: `mgarcia`)

---

### 👑 USUARIO 1: SUPER ADMIN

#### PASO 1: Ir a Authentication → Users

1. En el menú lateral, click en **🔐 Authentication**
2. Click en la pestaña **"Users"**
3. Click en **"Add user"** o **"+ Add user"** (botón verde)

#### PASO 2: Llenar el formulario

```
┌─────────────────────────────────────────────┐
│  Create new user                            │
│                                             │
│  Email *                                    │
│  ┌─────────────────────────────────────┐   │
│  │ superadmin@serbus.internal          │   │ ← EMAIL INTERNO
│  └─────────────────────────────────────┘   │
│                                             │
│  Password *                                 │
│  ┌─────────────────────────────────────┐   │
│  │ SuperAdmin123!                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ✅ Auto Confirm User                       │ ← Dejar marcado
│                                             │
│  User Metadata (JSON)                       │
│  ┌─────────────────────────────────────┐   │
│  │ {                                   │   │
│  │   "username": "superadmin",         │   │ ← IMPORTANTE
│  │   "nombre": "Super Administrador",  │   │
│  │   "rol": "super_admin"              │   │
│  │ }                                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│     [Cancel]  [Create user]                 │
└─────────────────────────────────────────────┘
```

**COPIA Y PEGA EXACTAMENTE:**

```
Email: superadmin@serbus.internal
Password: SuperAdmin123!

User Metadata:
{
  "username": "superadmin",
  "nombre": "Super Administrador",
  "rol": "super_admin"
}
```

**NOTAS:**
- ✅ Email termina en `@serbus.internal`
- ✅ `username` en metadata (sin el @serbus.internal)
- ❌ NO pongas `empresa_id` (super admin no tiene empresa)
- ✅ Auto Confirm User MARCADO

#### PASO 3: Crear

Click en **"Create user"**

#### PASO 4: Verificar en perfiles

1. Ve a **Table Editor** → **`perfiles`**
2. Deberías ver:

```
┌────────────────────────────────────────────────────────────────┐
│ username   │ nombre              │ rol         │ empresa_id   │
├────────────┼─────────────────────┼─────────────┼──────────────┤
│ superadmin │ Super Administrador │ super_admin │ NULL         │
└────────────────────────────────────────────────────────────────┘
```

**✅ Si aparece, ¡perfecto!** El trigger automático creó el perfil y extrajo el username.

---

### 👨‍💼 USUARIO 2: ADMIN (Juan Pérez)

#### PASO 1: Add user

1. **Authentication** → **Users** → **"Add user"**

#### PASO 2: Llenar formulario

**COPIA Y PEGA:**

```
Email: jperez@serbus.internal
Password: Admin123!

User Metadata:
{
  "username": "jperez",
  "nombre": "Juan Pérez",
  "rol": "admin",
  "empresa_id": "1"
}
```

**IMPORTANTE:**
- ✅ Username: `jperez` (en metadata)
- ✅ Email: `jperez@serbus.internal`
- ✅ `empresa_id: "1"` (entre comillas, como string)

#### PASO 3: Crear y verificar

**Authentication → Users:**
```
📧 jperez@serbus.internal | Last Sign In: Never
```

**Table Editor → perfiles:**
```
┌───────────────────────────────────────────────────────┐
│ username │ nombre     │ rol   │ empresa_id │ activo  │
├──────────┼────────────┼───────┼────────────┼─────────┤
│ jperez   │ Juan Pérez │ admin │ 1          │ true    │
└───────────────────────────────────────────────────────┘
```

---

### 👷 USUARIO 3: TRABAJADOR (María García)

#### PASO 1: Add user

1. **Authentication** → **Users** → **"Add user"**

#### PASO 2: Llenar formulario

**COPIA Y PEGA:**

```
Email: mgarcia@serbus.internal
Password: Trabajador123!

User Metadata:
{
  "username": "mgarcia",
  "nombre": "María García",
  "rol": "trabajador",
  "empresa_id": "1"
}
```

#### PASO 3: Crear y verificar

**Authentication → Users:**
```
📧 mgarcia@serbus.internal | Last Sign In: Never
```

**Table Editor → perfiles:**
```
┌───────────────────────────────────────────────────────┐
│ username │ nombre        │ rol         │ empresa_id  │
├──────────┼───────────────┼─────────────┼─────────────┤
│ mgarcia  │ María García  │ trabajador  │ 1           │
└───────────────────────────────────────────────────────┘
```

---

## 📊 RESUMEN: 3 USUARIOS CREADOS

```
┌────────────────────────────────────────────────────────────────┐
│  Authentication → Users (EMAIL INTERNO)                        │
├────────────────────────────────────────────────────────────────┤
│  📧 superadmin@serbus.internal      | Never signed in         │
│  📧 jperez@serbus.internal          | Never signed in         │
│  📧 mgarcia@serbus.internal         | Never signed in         │
└────────────────────────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────────────────────────┐
│  Table Editor → perfiles (USERNAME VISIBLE)                    │
├────────────┬─────────────────────┬─────────────┬───────────────┤
│ username   │ nombre              │ rol         │ empresa_id    │
├────────────┼─────────────────────┼─────────────┼───────────────┤
│ superadmin │ Super Administrador │ super_admin │ NULL          │
│ jperez     │ Juan Pérez          │ admin       │ 1             │
│ mgarcia    │ María García        │ trabajador  │ 1             │
└────────────┴─────────────────────┴─────────────┴───────────────┘
```

---

## 🧪 PARTE E: PROBAR LOGIN (Desde el panel)

### PASO 1: Verificar con SQL

**SQL Editor** → **"+ New query"** → Pega y ejecuta:

```sql
-- Ver todos los usuarios con username
SELECT
  SPLIT_PART(au.email, '@', 1) as username_en_email,
  p.username,
  p.nombre,
  p.rol,
  p.empresa_id,
  e.razon_social as empresa
FROM auth.users au
LEFT JOIN perfiles p ON au.id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
ORDER BY p.rol;
```

### PASO 2: Resultado esperado

```
┌───────────────────┬────────────┬─────────────────────┬─────────────┬────────────┬───────────────────────┐
│ username_en_email │ username   │ nombre              │ rol         │ empresa_id │ empresa               │
├───────────────────┼────────────┼─────────────────────┼─────────────┼────────────┼───────────────────────┤
│ jperez            │ jperez     │ Juan Pérez          │ admin       │ 1          │ Transportes ABC S.A.C.│
│ superadmin        │ superadmin │ Super Administrador │ super_admin │ NULL       │ NULL                  │
│ mgarcia           │ mgarcia    │ María García        │ trabajador  │ 1          │ Transportes ABC S.A.C.│
└───────────────────┴────────────┴─────────────────────┴─────────────┴────────────┴───────────────────────┘
```

**✅ Verifica que:**
- `username_en_email` (antes del @) = `username` (en perfiles)
- Los 3 usuarios aparecen correctamente

---

## 📝 CREDENCIALES DE PRUEBA (Guárdalas)

**IMPORTANTE:** El usuario SOLO escribe el username, NO el email completo.

```
═══════════════════════════════════════════════════════
USUARIOS DE PRUEBA - SERBUS (CON USERNAME)
═══════════════════════════════════════════════════════

1. SUPER ADMIN
   Usuario: superadmin
   Password: SuperAdmin123!
   Rol: super_admin
   Empresa: Ninguna

2. ADMIN (Transportes ABC)
   Usuario: jperez
   Password: Admin123!
   Rol: admin
   Empresa: Transportes ABC S.A.C. (id=1)

3. TRABAJADOR (Transportes ABC)
   Usuario: mgarcia
   Password: Trabajador123!
   Rol: trabajador
   Empresa: Transportes ABC S.A.C. (id=1)

═══════════════════════════════════════════════════════
NOTA: Los emails reales son:
- superadmin@serbus.internal
- jperez@serbus.internal
- mgarcia@serbus.internal

Pero el USUARIO NUNCA los ve ni los escribe.
═══════════════════════════════════════════════════════
```

---

## 💻 PARTE F: CÓMO USARLO EN REACT NATIVE

### Helpers (Funciones de conversión)

Crea este archivo más adelante (FASE 8):

```javascript
// src/utils/authHelpers.js

/**
 * Convierte username a email interno de Supabase
 * @param {string} username - ej: "jperez"
 * @returns {string} - ej: "jperez@serbus.internal"
 */
export const usernameToEmail = (username) => {
  return `${username.toLowerCase().trim()}@serbus.internal`;
};

/**
 * Extrae username del email interno
 * @param {string} email - ej: "jperez@serbus.internal"
 * @returns {string} - ej: "jperez"
 */
export const emailToUsername = (email) => {
  return email.split('@')[0];
};

/**
 * Valida formato de username
 * @param {string} username
 * @returns {boolean}
 */
export const isValidUsername = (username) => {
  // 3-20 caracteres, solo minúsculas, números y guión bajo
  const regex = /^[a-z0-9_]{3,20}$/;
  return regex.test(username);
};
```

### Login en LoginScreen.js

```javascript
import { supabase } from '../config/supabase';
import { usernameToEmail, isValidUsername } from '../utils/authHelpers';

const handleLogin = async (username, password) => {
  // Validar username
  if (!isValidUsername(username)) {
    Alert.alert(
      'Username inválido',
      'El usuario debe tener 3-20 caracteres (solo minúsculas, números y _)'
    );
    return;
  }

  setLoading(true);

  try {
    // Convertir username a email interno
    const email = usernameToEmail(username);

    // Login con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    // Obtener perfil del usuario
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('username, nombre, rol, empresa_id')
      .eq('id', data.user.id)
      .single();

    if (perfilError) throw perfilError;

    // Guardar en tu estado (o Context)
    console.log('Login exitoso:', perfil);
    // {
    //   username: "jperez",
    //   nombre: "Juan Pérez",
    //   rol: "admin",
    //   empresa_id: 1
    // }

  } catch (error) {
    Alert.alert('Error', 'Usuario o contraseña incorrectos');
    console.error('Error login:', error);
  } finally {
    setLoading(false);
  }
};
```

### UI (TextInput sigue igual)

```jsx
<TextInput
  placeholder="Usuario"           // ← NO dice "Email"
  value={username}                 // ← Variable: username
  onChangeText={setUsername}
  autoCapitalize="none"
  autoCorrect={false}
/>

<TextInput
  placeholder="Contraseña"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
/>

<Button
  title="Iniciar Sesión"
  onPress={() => handleLogin(username, password)}
/>
```

**El usuario escribe:** `jperez` (sin @serbus.internal)

---

## ✅ CHECKLIST FINAL

Verifica que completaste:

- [ ] Email Auth está habilitado (Providers)
- [ ] **"Confirm email" está DESHABILITADO**
- [ ] Ejecutaste `supabase_auth_perfiles.sql`
- [ ] Tabla `perfiles` tiene columna `username`
- [ ] Creaste 1 empresa (Transportes ABC)
- [ ] Creaste usuario `superadmin@serbus.internal`
- [ ] Creaste usuario `jperez@serbus.internal`
- [ ] Creaste usuario `mgarcia@serbus.internal`
- [ ] Verificaste con SQL que los 3 usuarios tienen username
- [ ] Guardaste las credenciales de prueba

---

## ❓ ERRORES COMUNES

### Error: "User already registered"

**Causa:** Ya creaste un usuario con ese email.

**Solución:**
1. Ve a Authentication → Users
2. Busca el usuario
3. Bórralo (ícono de basura)
4. Vuelve a crearlo

---

### Error: "new row for relation perfiles violates check constraint check_username_format"

**Causa:** El username no cumple el formato (3-20 caracteres, solo minúsculas/números/guión bajo).

**Solución:** Usa solo minúsculas, números y `_`. Ejemplos válidos:
- ✅ `jperez`, `mgarcia`, `admin123`, `trabajador_01`
- ❌ `JPerez` (mayúsculas), `j.perez` (punto), `jp` (muy corto)

---

### Error: "duplicate key value violates unique constraint perfiles_username_key"

**Causa:** Ya existe un usuario con ese username.

**Solución:** Usa otro username único.

---

### Error: Email confirmation required

**Causa:** No deshabilitaste "Confirm email" en Providers.

**Solución:**
1. Ve a Authentication → Providers → Email
2. **DESMARCA** "Confirm email"
3. Save
4. Vuelve a intentar login

---

## 🚀 SIGUIENTE PASO

Una vez que veas los 3 usuarios con username en **Table Editor → perfiles**:

**Continúa con la FASE 5: Row Level Security (RLS)**

Ahí configuraremos las políticas de seguridad para que:
- `superadmin` vea TODO
- `jperez` (admin) solo vea Transportes ABC
- `mgarcia` (trabajador) solo vea (sin editar) Transportes ABC

---

## 🆘 SI ALGO SALE MAL

Contacta con la persona que te está guiando y envía:
1. Screenshot de Authentication → Users (mostrando los emails @serbus.internal)
2. Screenshot de Table Editor → perfiles (mostrando los usernames)
3. El error exacto que te salió
