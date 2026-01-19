# 📘 RESUMEN: SISTEMA DE USERNAME (Email Interno)

## 🎯 LO QUE IMPLEMENTAMOS

Configuramos Supabase Auth para que funcione con **USERNAME** (como `ntejeda`, `jperez`) en lugar de emails visibles, manteniendo la experiencia de usuario que YA TIENES en tu código.

---

## 🔄 ¿CÓMO FUNCIONA?

### TU CÓDIGO ACTUAL (LoginScreen.js):
```javascript
// El usuario escribe:
Usuario: jperez
Password: ****
```

### LO QUE HACE LA APP (con helpers):
```javascript
const username = "jperez";  // Lo que el usuario escribe
const email = usernameToEmail(username);  // jperez@serbus.internal

// Login en Supabase
await supabase.auth.signInWithPassword({
  email: "jperez@serbus.internal",  // ← Convertido automáticamente
  password: password
});
```

### LO QUE VE SUPABASE:
```
Email: jperez@serbus.internal
Password: (hasheado con bcrypt)
```

### LO QUE VE EL USUARIO:
```
✅ Usuario: jperez
❌ Email: jperez@serbus.internal  ← NUNCA lo ve
```

---

## 📊 ESTRUCTURA DE DATOS

### auth.users (Tabla interna de Supabase)
```
┌────────────────────────────────────┬────────────────────────────┐
│ email                              │ encrypted_password         │
├────────────────────────────────────┼────────────────────────────┤
│ superadmin@serbus.internal         │ $2a$10$... (bcrypt)       │
│ jperez@serbus.internal             │ $2a$10$... (bcrypt)       │
│ mgarcia@serbus.internal            │ $2a$10$... (bcrypt)       │
└────────────────────────────────────┴────────────────────────────┘
```

### public.perfiles (Tu tabla)
```
┌────────────┬─────────────────────┬─────────────┬────────────┐
│ username   │ nombre              │ rol         │ empresa_id │
├────────────┼─────────────────────┼─────────────┼────────────┤
│ superadmin │ Super Administrador │ super_admin │ NULL       │
│ jperez     │ Juan Pérez          │ admin       │ 1          │
│ mgarcia    │ María García        │ trabajador  │ 1          │
└────────────┴─────────────────────┴─────────────┴────────────┘
```

---

## ✅ VENTAJAS DE ESTE SISTEMA

### 1. Mantiene tu UX actual
```javascript
// Tu código LoginScreen.js NO cambia:
<TextInput placeholder="Usuario" />  // ← Sigue diciendo "Usuario"
<TextInput placeholder="Contraseña" />

// Usuario escribe "jperez", no "jperez@serbus.internal"
```

### 2. Aprovecha Supabase Auth
- ✅ Contraseñas hasheadas automáticamente (bcrypt)
- ✅ JWT real generado automáticamente
- ✅ Expiración de sesión (1 hora)
- ✅ Refresh token para renovar sesión
- ✅ RLS (Row Level Security) funciona perfecto
- ✅ No programas NADA de seguridad manualmente

### 3. Username único garantizado
```sql
-- Constraint en la tabla perfiles
username TEXT UNIQUE NOT NULL CHECK (username ~ '^[a-z0-9_]{3,20}$')
```

**Reglas:**
- ✅ 3-20 caracteres
- ✅ Solo minúsculas, números y guión bajo (`_`)
- ✅ Único (no puede haber 2 usuarios `jperez`)

**Ejemplos válidos:**
- ✅ `jperez`, `mgarcia`, `ntejeda`, `admin123`, `trabajador_01`

**Ejemplos NO válidos:**
- ❌ `JPerez` (mayúsculas)
- ❌ `j.perez` (punto)
- ❌ `jp` (muy corto, mínimo 3)
- ❌ `este_username_es_demasiado_largo` (máximo 20)

---

## 🔧 FUNCIONES HELPER (JavaScript)

Crea este archivo en FASE 8:

```javascript
// src/utils/authHelpers.js

/**
 * Convierte username a email interno
 */
export const usernameToEmail = (username) => {
  return `${username.toLowerCase().trim()}@serbus.internal`;
};

/**
 * Extrae username del email interno
 */
export const emailToUsername = (email) => {
  return email.split('@')[0];
};

/**
 * Valida formato de username
 */
export const isValidUsername = (username) => {
  const regex = /^[a-z0-9_]{3,20}$/;
  return regex.test(username);
};
```

---

## 🚀 CÓMO CREAR USUARIOS

### Desde Supabase (ahora en FASE 4):

```
Authentication → Users → Add user

Email: jperez@serbus.internal        ← username + @serbus.internal
Password: Admin123!

User Metadata:
{
  "username": "jperez",              ← El username solo
  "nombre": "Juan Pérez",
  "rol": "admin",
  "empresa_id": "1"
}
```

### Desde React Native (después en FASE 8):

```javascript
import { supabase } from '../config/supabase';
import { usernameToEmail } from '../utils/authHelpers';

// Crear usuario
const crearUsuario = async () => {
  const username = "ntejeda";

  const { data, error } = await supabase.auth.signUp({
    email: usernameToEmail(username),  // ntejeda@serbus.internal
    password: "Contraseña123!",
    options: {
      data: {
        username: username,
        nombre: "Nilton Tejeda",
        rol: "admin",
        empresa_id: 1
      }
    }
  });
};
```

---

## 🔐 CÓMO HACER LOGIN

### React Native (FASE 8):

```javascript
import { supabase } from '../config/supabase';
import { usernameToEmail, isValidUsername } from '../utils/authHelpers';

const handleLogin = async (username, password) => {
  // 1. Validar username
  if (!isValidUsername(username)) {
    Alert.alert('Username inválido');
    return;
  }

  // 2. Convertir username a email
  const email = usernameToEmail(username);

  // 3. Login con Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,        // jperez@serbus.internal
    password: password
  });

  if (error) {
    Alert.alert('Error', 'Usuario o contraseña incorrectos');
    return;
  }

  // 4. Obtener perfil
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('username, nombre, rol, empresa_id')
    .eq('id', data.user.id)
    .single();

  console.log('Login exitoso:', perfil);
  // { username: "jperez", nombre: "Juan Pérez", rol: "admin", empresa_id: 1 }
};
```

---

## 📋 USUARIOS DE PRUEBA CREADOS

```
┌──────────────────────────────────────────────────────────┐
│  Usuario          Password          Rol         Empresa  │
├──────────────────────────────────────────────────────────┤
│  superadmin       SuperAdmin123!    super_admin  -       │
│  jperez           Admin123!         admin        ABC     │
│  mgarcia          Trabajador123!    trabajador   ABC     │
└──────────────────────────────────────────────────────────┘
```

**El usuario escribe:** `jperez` (NO `jperez@serbus.internal`)

---

## 🔍 VERIFICACIÓN (SQL)

Para verificar que todo está bien:

```sql
SELECT
  SPLIT_PART(au.email, '@', 1) as username_en_email,
  p.username,
  p.nombre,
  p.rol,
  e.razon_social as empresa
FROM auth.users au
LEFT JOIN perfiles p ON au.id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id;
```

**Resultado esperado:**
```
┌───────────────────┬────────────┬─────────────────────┬─────────────┬───────────────────────┐
│ username_en_email │ username   │ nombre              │ rol         │ empresa               │
├───────────────────┼────────────┼─────────────────────┼─────────────┼───────────────────────┤
│ jperez            │ jperez     │ Juan Pérez          │ admin       │ Transportes ABC S.A.C.│
│ superadmin        │ superadmin │ Super Administrador │ super_admin │ NULL                  │
│ mgarcia           │ mgarcia    │ María García        │ trabajador  │ Transportes ABC S.A.C.│
└───────────────────┴────────────┴─────────────────────┴─────────────┴───────────────────────┘
```

✅ `username_en_email` (del email) = `username` (de perfiles)

---

## ⚙️ CONFIGURACIÓN IMPORTANTE EN SUPABASE

### ⚠️ DESHABILITAR "Confirm email"

**MUY IMPORTANTE:** Tienes que deshabilitar la confirmación de email porque los emails son internos (`@serbus.internal`) y no existen buzones reales.

**Cómo:**
1. Supabase → Authentication → Providers → Email
2. **DESMARCAR** "Confirm email"
3. Save

**Si NO haces esto:**
- Los usuarios NO podrán iniciar sesión
- Supabase pedirá confirmar email
- El email `jperez@serbus.internal` NO existe
- NO se puede confirmar

---

## 🆚 COMPARACIÓN: ANTES vs DESPUÉS

### ❌ TU CÓDIGO ACTUAL (authStore.js):
```javascript
// Sin seguridad real
{
  usuario: "jperez",
  password: "1234",  // Texto plano
  token: "token_demo"  // Token falso
}
```

### ✅ CON SUPABASE + USERNAME:
```javascript
// Email interno: jperez@serbus.internal
// Password: hasheado con bcrypt
// Token: JWT real firmado

// Perfil:
{
  username: "jperez",    // ← Lo que el usuario ve
  nombre: "Juan Pérez",
  rol: "admin",
  empresa_id: 1
}
```

---

## 🎓 CONCEPTOS CLAVE

### 1. Email Interno
- No es un email real
- Formato: `username@serbus.internal`
- Solo para que Supabase Auth funcione
- Usuario NUNCA lo ve

### 2. Username
- Lo que el usuario escribe y ve
- Guardado en tabla `perfiles`
- Único (constraint)
- Validado: 3-20 chars, lowercase, números, `_`

### 3. Conversión Automática
```javascript
usernameToEmail("jperez")    // → "jperez@serbus.internal"
emailToUsername("jperez@serbus.internal")  // → "jperez"
```

---

## 📁 ARCHIVOS ACTUALIZADOS

1. **supabase_auth_perfiles.sql**
   - Tabla `perfiles` con columna `username`
   - Constraint de formato
   - Trigger para extraer username del email
   - Índice en username

2. **GUIA_AUTENTICACION.md**
   - Instrucciones completas con username
   - Ejemplos: superadmin, jperez, mgarcia
   - Código JavaScript helpers
   - Ejemplo completo de login

---

## 🚦 SIGUIENTE PASO

Ahora debes:

1. ✅ Ir a Supabase
2. ✅ Ejecutar `supabase_auth_perfiles.sql` (si no lo hiciste)
3. ✅ Deshabilitar "Confirm email" en Providers
4. ✅ Crear los 3 usuarios de prueba:
   - `superadmin@serbus.internal`
   - `jperez@serbus.internal`
   - `mgarcia@serbus.internal`
5. ✅ Verificar en Table Editor → perfiles que aparecen con username
6. ✅ Continuar con FASE 5 (RLS)

---

## ❓ PREGUNTAS FRECUENTES

### ¿Por qué no usar solo username en Supabase Auth?

Supabase Auth **requiere email obligatoriamente**. No se puede usar solo username. Por eso usamos emails internos (`@serbus.internal`).

### ¿Puedo cambiar el dominio interno?

Sí, puedes usar otro como `@miempresa.local` o `@interno.app`. Solo cambia el helper `usernameToEmail()`.

### ¿Se pueden recuperar contraseñas?

NO con emails internos. Para eso necesitarías emails reales. Alternativas:
- Admin resetea password manualmente
- Función custom de "Olvidé mi contraseña" (FASE 7)

### ¿Puedo agregar emails reales después?

Sí, podrías agregar un campo `email_real` opcional en `perfiles` para notificaciones. Pero el login seguiría siendo con username.

---

## ✅ RESUMEN EJECUTIVO

**LO QUE LOGRAMOS:**
- ✅ Sistema de username (como tu código actual)
- ✅ Seguridad de Supabase Auth (gratis)
- ✅ Usuario escribe `jperez`, NO emails largos
- ✅ Contraseñas hasheadas automáticamente
- ✅ JWT real
- ✅ RLS funcionará perfectamente
- ✅ NO rompiste tu UX

**LO QUE EL USUARIO NUNCA VE:**
- ❌ `@serbus.internal`
- ❌ Emails internos
- ❌ UUIDs
- ❌ JWTs

**LO QUE EL USUARIO SÍ VE:**
- ✅ `jperez` (username)
- ✅ `Juan Pérez` (nombre)
- ✅ TextInput que dice "Usuario" (no "Email")

---

¡Ahora tienes lo mejor de ambos mundos! 🎉
