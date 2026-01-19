# 🔐 GUÍA PASO A PASO: CONFIGURAR AUTENTICACIÓN

## 🎯 OBJETIVO
Configurar el sistema de login/logout con Supabase Auth y crear usuarios de prueba.

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

### PASO 3: Verificar Email Provider

Vas a ver una lista de proveedores:

```
┌─────────────────────────────────────────────┐
│  Auth Providers                             │
│                                             │
│  📧 Email                    [✅ Enabled]   │ ← Ya está habilitado
│  📱 Phone                    [  Disabled]   │
│  🔑 Google                   [  Disabled]   │
│  🔑 GitHub                   [  Disabled]   │
│  ...                                        │
└─────────────────────────────────────────────┘
```

**IMPORTANTE:** Por defecto, **Email ya está habilitado** ✅

### PASO 4 (OPCIONAL): Configurar confirmación de email

**HAZ CLIC** en **"Email"** para ver las opciones:

```
┌─────────────────────────────────────────────┐
│  Email Auth                                 │
│                                             │
│  ✅ Enable Email provider                   │
│  ✅ Confirm email                           │ ← Recomendado
│  ⬜ Secure email change                     │
│                                             │
│  Minimum password length: 6                 │
└─────────────────────────────────────────────┘
```

**Recomendación:**
- ✅ **"Confirm email"** HABILITADO (para producción)
  - Los usuarios deben confirmar su email antes de poder iniciar sesión
  - Más seguro

- ⬜ **"Confirm email"** DESHABILITADO (para desarrollo)
  - Los usuarios pueden iniciar sesión inmediatamente
  - Más rápido para probar

**Para esta fase de aprendizaje:**
- **DESHABILITA** "Confirm email" (quita el check ✅)
- Así puedes probar rápidamente sin ir al correo

**HAZ CLIC** en **"Save"** si hiciste cambios.

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
┌──────────────────────────────────────────────┐
│  perfiles                                    │
│  ┌────┬────────┬──────┬────────────┬───────┐│
│  │ id │ nombre │ rol  │ empresa_id │ activo││
│  └────┴────────┴──────┴────────────┴───────┘│
│                                              │
│  No rows found (aún sin usuarios)            │
└──────────────────────────────────────────────┘
```

**✅ Si ves esto, perfecto!**

---

## 📋 PARTE C: CREAR PRIMER EMPRESA (Si no lo hiciste)

Antes de crear usuarios, necesitas tener al menos 1 empresa.

### OPCIÓN 1: Si ejecutaste los datos de prueba en FASE 3

Ya tienes la empresa "Transportes ABC S.A.C." con `id=1`. **Salta a PARTE D**.

### OPCIÓN 2: Crear empresa manualmente

1. Ve a **Table Editor** → **`empresas`**
2. Click en **"Insert row"** o **"+ Insert"**
3. Llena los campos:

```
┌─────────────────────────────────────────────┐
│  Insert row into empresas                   │
│                                             │
│  id: [auto]                                 │ ← Dejar vacío (auto-incrementa)
│  ruc: 20123456789                           │
│  razon_social: Transportes ABC S.A.C.       │
│  telefono: 987654321                        │
│  direccion: Av. Principal 123, Lima         │
│  activo: ✅                                  │
│  tema: [default]                            │ ← Dejar vacío (usa default)
│  created_at: [auto]                         │
│  updated_at: [auto]                         │
└─────────────────────────────────────────────┘
```

4. Click en **"Save"**

**Resultado:**
```
empresas:
id=1 | ruc=20123456789 | razon_social=Transportes ABC S.A.C.
```

---

## 📋 PARTE D: CREAR USUARIOS (3 TIPOS)

Vamos a crear 3 usuarios de prueba:
1. **Super Admin** (acceso total, sin empresa)
2. **Admin** (gestiona Transportes ABC)
3. **Trabajador** (solo lectura, Transportes ABC)

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
│  │ superadmin@serbus.com               │   │ ← Email del super admin
│  └─────────────────────────────────────┘   │
│                                             │
│  Password *                                 │
│  ┌─────────────────────────────────────┐   │
│  │ SuperAdmin123!                      │   │ ← Contraseña fuerte
│  └─────────────────────────────────────┘   │
│                                             │
│  ✅ Auto Confirm User                       │ ← Dejar marcado
│                                             │
│  User Metadata (JSON)                       │
│  ┌─────────────────────────────────────┐   │
│  │ {                                   │   │
│  │   "nombre": "Super Administrador",  │   │
│  │   "rol": "super_admin"              │   │
│  │ }                                   │   │ ← IMPORTANTE
│  └─────────────────────────────────────┘   │
│                                             │
│     [Cancel]  [Create user]                 │
└─────────────────────────────────────────────┘
```

**IMPORTANTE:** En **User Metadata**, pega EXACTAMENTE:

```json
{
  "nombre": "Super Administrador",
  "rol": "super_admin"
}
```

**NO pongas `empresa_id`** porque el super admin no pertenece a ninguna empresa.

#### PASO 3: Crear

Click en **"Create user"**

#### PASO 4: Verificar en perfiles

1. Ve a **Table Editor** → **`perfiles`**
2. Deberías ver:

```
┌────────────────────────────────────────────────────────┐
│ id (UUID)                  │ nombre              │ rol │
├────────────────────────────┼─────────────────────┼─────┤
│ 550e8400-e29b-41d4-a716... │ Super Administrador │ super_admin │
└────────────────────────────────────────────────────────┘
```

**✅ Si aparece, ¡perfecto!** El trigger automático creó el perfil.

---

### 👨‍💼 USUARIO 2: ADMIN DE TRANSPORTES ABC

#### PASO 1: Add user

1. **Authentication** → **Users** → **"Add user"**

#### PASO 2: Llenar formulario

```
Email: admin@transportesabc.com
Password: Admin123!

User Metadata:
{
  "nombre": "Juan Pérez",
  "rol": "admin",
  "empresa_id": "1"
}
```

**IMPORTANTE:**
- `empresa_id` debe ser `"1"` (entre comillas, como string en JSON)
- Este usuario pertenece a la empresa con `id=1` (Transportes ABC)

#### PASO 3: Crear y verificar

**Authentication → Users:**
```
📧 admin@transportesabc.com | Last Sign In: Never
```

**Table Editor → perfiles:**
```
┌──────────────────────────────────────────────────────────┐
│ nombre     │ rol   │ empresa_id │ activo │
├────────────┼───────┼────────────┼────────┤
│ Juan Pérez │ admin │ 1          │ true   │
└──────────────────────────────────────────────────────────┘
```

---

### 👷 USUARIO 3: TRABAJADOR DE TRANSPORTES ABC

#### PASO 1: Add user

1. **Authentication** → **Users** → **"Add user"**

#### PASO 2: Llenar formulario

```
Email: trabajador@transportesabc.com
Password: Trabajador123!

User Metadata:
{
  "nombre": "María García",
  "rol": "trabajador",
  "empresa_id": "1"
}
```

#### PASO 3: Crear y verificar

**Authentication → Users:**
```
📧 trabajador@transportesabc.com | Last Sign In: Never
```

**Table Editor → perfiles:**
```
┌──────────────────────────────────────────────────────────┐
│ nombre        │ rol         │ empresa_id │ activo │
├───────────────┼─────────────┼────────────┼────────┤
│ María García  │ trabajador  │ 1          │ true   │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 RESUMEN: 3 USUARIOS CREADOS

```
┌────────────────────────────────────────────────────────────────┐
│  Authentication → Users                                        │
├────────────────────────────────────────────────────────────────┤
│  📧 superadmin@serbus.com           | Never signed in         │
│  📧 admin@transportesabc.com        | Never signed in         │
│  📧 trabajador@transportesabc.com   | Never signed in         │
└────────────────────────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────────────────────────┐
│  Table Editor → perfiles                                       │
├──────────────────────┬─────────────┬────────────┬──────────────┤
│ nombre               │ rol         │ empresa_id │ activo       │
├──────────────────────┼─────────────┼────────────┼──────────────┤
│ Super Administrador  │ super_admin │ NULL       │ true         │
│ Juan Pérez           │ admin       │ 1          │ true         │
│ María García         │ trabajador  │ 1          │ true         │
└──────────────────────┴─────────────┴────────────┴──────────────┘
```

---

## 🧪 PARTE E: PROBAR LOGIN (Desde el panel)

Ahora vamos a probar que el login funciona.

### PASO 1: Ir a SQL Editor

1. **SQL Editor** → **"+ New query"**

### PASO 2: Ejecutar query de prueba

Pega y ejecuta:

```sql
-- Ver todos los usuarios con sus perfiles
SELECT
  au.email,
  p.nombre,
  p.rol,
  p.empresa_id,
  e.razon_social as empresa
FROM auth.users au
LEFT JOIN perfiles p ON au.id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
ORDER BY p.rol;
```

### PASO 3: Resultado esperado

Deberías ver:

```
┌────────────────────────────────┬─────────────────────┬─────────────┬────────────┬───────────────────────┐
│ email                          │ nombre              │ rol         │ empresa_id │ empresa               │
├────────────────────────────────┼─────────────────────┼─────────────┼────────────┼───────────────────────┤
│ admin@transportesabc.com       │ Juan Pérez          │ admin       │ 1          │ Transportes ABC S.A.C.│
│ superadmin@serbus.com          │ Super Administrador │ super_admin │ NULL       │ NULL                  │
│ trabajador@transportesabc.com  │ María García        │ trabajador  │ 1          │ Transportes ABC S.A.C.│
└────────────────────────────────┴─────────────────────┴─────────────┴────────────┴───────────────────────┘
```

**✅ Si ves esto, ¡PERFECTO!**

---

## 🔍 ENTENDIENDO EL SISTEMA

### ¿Cómo funciona el login ahora?

```
1. Usuario ingresa email + password en la app
   ↓
2. App llama: supabase.auth.signInWithPassword({ email, password })
   ↓
3. Supabase verifica:
   - ¿Email existe en auth.users?
   - ¿Password es correcta? (bcrypt)
   ↓
4. Si es correcto, Supabase devuelve:
   - JWT (access_token) ← Token REAL firmado
   - User (id, email, user_metadata)
   - Session (expires_at, refresh_token)
   ↓
5. App guarda el JWT y hace requests con él
   ↓
6. Supabase verifica JWT en cada request
   - ¿Es válido?
   - ¿No expiró?
   - ¿Tiene los permisos correctos? (RLS - FASE 5)
```

---

## 📝 CREDENCIALES DE PRUEBA (Guárdalas)

Anota estas credenciales en un archivo seguro:

```
═══════════════════════════════════════════════════════
USUARIOS DE PRUEBA - SERBUS
═══════════════════════════════════════════════════════

1. SUPER ADMIN (Acceso total)
   Email: superadmin@serbus.com
   Password: SuperAdmin123!
   Rol: super_admin
   Empresa: Ninguna

2. ADMIN (Gestiona Transportes ABC)
   Email: admin@transportesabc.com
   Password: Admin123!
   Rol: admin
   Empresa: Transportes ABC S.A.C. (id=1)

3. TRABAJADOR (Solo lectura)
   Email: trabajador@transportesabc.com
   Password: Trabajador123!
   Rol: trabajador
   Empresa: Transportes ABC S.A.C. (id=1)

═══════════════════════════════════════════════════════
```

---

## ✅ CHECKLIST FINAL

Verifica que completaste:

- [ ] Email Auth está habilitado (Providers)
- [ ] Ejecutaste `supabase_auth_perfiles.sql`
- [ ] Tabla `perfiles` existe en Table Editor
- [ ] Creaste 1 empresa (Transportes ABC)
- [ ] Creaste usuario super_admin
- [ ] Creaste usuario admin
- [ ] Creaste usuario trabajador
- [ ] Verificaste con la query SQL que los 3 usuarios aparecen
- [ ] Guardaste las credenciales de prueba

---

## ❓ ERRORES COMUNES

### Error: "relation auth.users does not exist"

**Causa:** Typo en el SQL.

**Solución:** Asegúrate de escribir `auth.users` (no `public.users`).

---

### Error: "insert or update on table perfiles violates foreign key constraint"

**Causa:** Intentaste crear un usuario con `empresa_id=1` pero esa empresa no existe.

**Solución:** Primero crea la empresa en Table Editor → `empresas`.

---

### Error: "new row for relation perfiles violates check constraint check_empresa_id"

**Causa:**
- Creaste un `super_admin` CON `empresa_id` (no debe tenerlo)
- O creaste un `admin`/`trabajador` SIN `empresa_id` (debe tenerlo)

**Solución:** Verifica el User Metadata:
- Super admin: NO incluir `empresa_id`
- Admin/Trabajador: SÍ incluir `empresa_id`

---

## 🚀 SIGUIENTE PASO

Una vez que veas los 3 usuarios en **Authentication → Users** y en **Table Editor → perfiles**:

**Continúa con la FASE 5: Row Level Security (RLS)**

Ahí configuraremos las políticas de seguridad para que:
- Super admin vea TODO
- Admin solo vea su empresa
- Trabajador solo vea (no edite) su empresa

---

## 🆘 SI ALGO SALE MAL

Contacta con la persona que te está guiando y envía:
1. Screenshot de Authentication → Users
2. Screenshot de Table Editor → perfiles
3. El error exacto que te salió
