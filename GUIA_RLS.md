# 🔒 GUÍA PASO A PASO: ROW LEVEL SECURITY (RLS)

## 🎯 OBJETIVO
Implementar seguridad a nivel de base de datos para que cada usuario solo vea y modifique los datos que le corresponden.

---

## 📋 PASO 1: EJECUTAR EL SQL DE POLÍTICAS

### 1.1 Abrir SQL Editor

1. Ve a tu proyecto **SerBus** en Supabase
2. Menú lateral → **🔧 SQL Editor**
3. Click en **"+ New query"**

### 1.2 Copiar el SQL

1. Abre el archivo: `supabase_rls_policies.sql`
2. **COPIA TODO** el contenido (desde la primera línea hasta la última)
3. **PEGA** en el editor de Supabase

### 1.3 Ejecutar

1. Click en **"RUN"** (botón verde)
2. Espera 5-10 segundos

### 1.4 Resultado esperado

Deberías ver al final una tabla con las políticas creadas:

```
┌────────────┬──────────────┬────────────────────────┬────────────┬───────┬────────┐
│ schemaname │ tablename    │ policyname             │ permissive │ roles │ cmd    │
├────────────┼──────────────┼────────────────────────┼────────────┼───────┼────────┤
│ public     │ buses        │ delete_buses           │ PERMISSIVE │ {}    │ DELETE │
│ public     │ buses        │ insert_buses           │ PERMISSIVE │ {}    │ INSERT │
│ public     │ buses        │ select_buses           │ PERMISSIVE │ {}    │ SELECT │
│ public     │ buses        │ update_buses           │ PERMISSIVE │ {}    │ UPDATE │
│ public     │ empresas     │ delete_empresas        │ PERMISSIVE │ {}    │ DELETE │
│ public     │ empresas     │ insert_empresas        │ PERMISSIVE │ {}    │ INSERT │
│ public     │ empresas     │ select_empresas        │ PERMISSIVE │ {}    │ SELECT │
│ public     │ empresas     │ update_empresas        │ PERMISSIVE │ {}    │ UPDATE │
│ ...        │ ...          │ ...                    │ ...        │ ...   │ ...    │
└────────────┴──────────────┴────────────────────────┴────────────┴───────┴────────┘

Success. X rows returned.
```

✅ **Si ves políticas para todas las tablas, ¡perfecto!**

---

## 📋 PASO 2: ENTENDER QUÉ SE CREÓ

### 2.1 Funciones Helper

Se crearon 2 funciones que facilitan las políticas:

**`get_user_rol()`**
- Retorna el rol del usuario logueado
- Ejemplo: `'super_admin'`, `'admin'`, `'trabajador'`

**`get_user_empresa_id()`**
- Retorna la empresa_id del usuario logueado
- Ejemplo: `1` (para jperez y mgarcia)

### 2.2 Políticas por tabla

Para cada tabla se crearon políticas para:
- **SELECT** (leer)
- **INSERT** (crear)
- **UPDATE** (modificar)
- **DELETE** (borrar)

---

## 📊 PASO 3: VER LAS POLÍTICAS EN LA UI

### 3.1 Ir a Authentication → Policies

1. Menú lateral → **🔐 Authentication**
2. Pestaña superior → **Policies**

### 3.2 Seleccionar tabla

En el dropdown, selecciona una tabla (ejemplo: `buses`)

### 3.3 Ver políticas

Deberías ver algo como:

```
┌─────────────────────────────────────────────────────┐
│  Policies for: buses                                │
│                                                     │
│  ✅ select_buses                                    │
│     FOR SELECT                                      │
│     USING: (get_user_rol() = 'super_admin')         │
│            OR (empresa_id = get_user_empresa_id())  │
│                                                     │
│  ✅ insert_buses                                    │
│     FOR INSERT                                      │
│     WITH CHECK: (get_user_rol() = 'super_admin')    │
│                 OR ...                              │
│                                                     │
│  ✅ update_buses                                    │
│  ✅ delete_buses                                    │
└─────────────────────────────────────────────────────┘
```

---

## 🧪 PASO 4: PROBAR QUE FUNCIONA

Vamos a probar que las políticas realmente funcionan.

### 4.1 Crear datos de prueba (si no los tienes)

**SQL Editor → New query:**

```sql
-- Crear segunda empresa (para probar aislamiento)
INSERT INTO empresas (ruc, razon_social, activo)
VALUES ('20987654321', 'Transportes XYZ S.A.C.', true);

-- Crear buses de la empresa 1 (Transportes ABC)
INSERT INTO buses (placa, vin, kilometraje_actual, empresa_id)
VALUES
  ('ABC-111', '1HGBH41JXMN109111', 50000, 1),
  ('ABC-222', '1HGBH41JXMN109222', 75000, 1);

-- Crear buses de la empresa 2 (Transportes XYZ)
INSERT INTO buses (placa, vin, kilometraje_actual, empresa_id)
VALUES
  ('XYZ-333', '1HGBH41JXMN109333', 30000, 2),
  ('XYZ-444', '1HGBH41JXMN109444', 40000, 2);
```

Ahora tienes:
- 2 buses de empresa 1 (ABC-111, ABC-222)
- 2 buses de empresa 2 (XYZ-333, XYZ-444)

### 4.2 Probar como SUPER ADMIN

**SQL Editor → New query:**

```sql
-- Simular que estás logueado como superadmin
SET request.jwt.claims.sub TO (
  SELECT id::text FROM auth.users WHERE email = 'superadmin@serbus.internal'
);

-- Ver buses
SELECT placa, empresa_id FROM buses;
```

**Resultado esperado:**
```
┌─────────┬────────────┐
│ placa   │ empresa_id │
├─────────┼────────────┤
│ ABC-111 │ 1          │
│ ABC-222 │ 1          │
│ XYZ-333 │ 2          │ ← Ve TODAS las empresas ✅
│ XYZ-444 │ 2          │
└─────────┴────────────┘
```

✅ **Super admin ve TODO**

### 4.3 Probar como ADMIN (jperez, empresa_id=1)

**SQL Editor → New query:**

```sql
-- Simular que estás logueado como jperez
SET request.jwt.claims.sub TO (
  SELECT id::text FROM auth.users WHERE email = 'jperez@serbus.internal'
);

-- Ver buses
SELECT placa, empresa_id FROM buses;
```

**Resultado esperado:**
```
┌─────────┬────────────┐
│ placa   │ empresa_id │
├─────────┼────────────┤
│ ABC-111 │ 1          │
│ ABC-222 │ 1          │ ← Solo ve SU empresa ✅
└─────────┴────────────┘
```

✅ **Admin solo ve su empresa (NO ve XYZ-333 ni XYZ-444)**

### 4.4 Probar como TRABAJADOR (mgarcia, empresa_id=1)

**SQL Editor → New query:**

```sql
-- Simular que estás logueado como mgarcia
SET request.jwt.claims.sub TO (
  SELECT id::text FROM auth.users WHERE email = 'mgarcia@serbus.internal'
);

-- Ver buses (puede leer)
SELECT placa, empresa_id FROM buses;
```

**Resultado esperado:**
```
┌─────────┬────────────┐
│ placa   │ empresa_id │
├─────────┼────────────┤
│ ABC-111 │ 1          │
│ ABC-222 │ 1          │ ← Solo ve SU empresa ✅
└─────────┴────────────┘
```

✅ **Trabajador ve solo su empresa (igual que admin)**

**Ahora intenta INSERTAR:**

```sql
-- Simular que estás logueado como mgarcia
SET request.jwt.claims.sub TO (
  SELECT id::text FROM auth.users WHERE email = 'mgarcia@serbus.internal'
);

-- Intentar crear bus (NO debería poder)
INSERT INTO buses (placa, vin, kilometraje_actual, empresa_id)
VALUES ('ABC-999', '1HGBH41JXMN109999', 0, 1);
```

**Resultado esperado:**
```
ERROR: new row violates row-level security policy for table "buses"
```

✅ **Trabajador NO puede insertar (solo lectura)**

---

## 📊 PASO 5: TABLA RESUMEN DE PERMISOS

```
┌──────────────┬──────────────┬────────┬────────┬────────┬────────┐
│ Usuario      │ Rol          │ SELECT │ INSERT │ UPDATE │ DELETE │
├──────────────┼──────────────┼────────┼────────┼────────┼────────┤
│ superadmin   │ super_admin  │ TODAS  │ TODAS  │ TODAS  │ TODAS  │
│ jperez       │ admin        │ Emp. 1 │ Emp. 1 │ Emp. 1 │ Emp. 1 │
│ mgarcia      │ trabajador   │ Emp. 1 │ ❌ NO  │ ❌ NO  │ ❌ NO  │
└──────────────┴──────────────┴────────┴────────┴────────┴────────┘
```

---

## 🔍 PASO 6: ENTENDER LAS POLÍTICAS (Ejemplos)

### Ejemplo 1: Política de SELECT en buses

```sql
CREATE POLICY "select_buses"
ON buses
FOR SELECT
USING (
  get_user_rol() = 'super_admin'  -- Condición 1: Es super admin
  OR
  empresa_id = get_user_empresa_id()  -- Condición 2: Es de su empresa
);
```

**Traducción:**
- "En la tabla `buses`"
- "Para operación SELECT (leer)"
- "Mostrar fila SI:"
  - "El usuario es super_admin" **O**
  - "empresa_id de la fila = empresa_id del usuario"

### Ejemplo 2: Política de INSERT en buses

```sql
CREATE POLICY "insert_buses"
ON buses
FOR INSERT
WITH CHECK (
  get_user_rol() = 'super_admin'
  OR
  (get_user_rol() = 'admin' AND empresa_id = get_user_empresa_id())
);
```

**Traducción:**
- "En la tabla `buses`"
- "Para operación INSERT (crear)"
- "Permitir insertar SI:"
  - "El usuario es super_admin" **O**
  - "El usuario es admin Y está insertando en SU empresa"

### Ejemplo 3: Política de SELECT en ots_trabajos

```sql
CREATE POLICY "select_ots_trabajos"
ON ots_trabajos
FOR SELECT
USING (
  get_user_rol() = 'super_admin'
  OR
  EXISTS (
    SELECT 1 FROM ots
    WHERE ots.id = ots_trabajos.ot_id
    AND ots.empresa_id = get_user_empresa_id()
  )
);
```

**Traducción:**
- "En la tabla `ots_trabajos`"
- "Para operación SELECT"
- "Mostrar fila SI:"
  - "El usuario es super_admin" **O**
  - "La OT relacionada pertenece a la empresa del usuario"

Esto es más complejo porque `ots_trabajos` NO tiene `empresa_id` directamente, entonces busca en la tabla `ots` relacionada.

---

## ⚠️ ERRORES COMUNES

### Error: "permission denied for table X"

**Causa:** Intentaste acceder a una tabla sin estar autenticado.

**Solución:** Las políticas solo funcionan cuando hay un usuario logueado. En desarrollo (SQL Editor), usa `SET request.jwt.claims.sub` para simular login.

---

### Error: "new row violates row-level security policy"

**Causa:** Intentaste insertar/actualizar datos que no cumplen las políticas.

**Solución:** Esto es **CORRECTO**. Significa que RLS está funcionando. El trabajador NO debe poder insertar.

---

### Error: "function get_user_rol() does not exist"

**Causa:** No ejecutaste el SQL de políticas completo.

**Solución:** Ejecuta `supabase_rls_policies.sql` desde el inicio.

---

## ✅ CHECKLIST FINAL

Verifica que completaste:

- [ ] Ejecutaste `supabase_rls_policies.sql`
- [ ] Viste las políticas en Authentication → Policies
- [ ] Creaste datos de prueba (2 empresas, 4 buses)
- [ ] Probaste como super_admin (ve TODO)
- [ ] Probaste como admin (ve solo su empresa)
- [ ] Probaste como trabajador (ve pero no puede insertar)
- [ ] Entendiste cómo funcionan las políticas

---

## 🎯 RESULTADO FINAL

Ahora tu aplicación tiene:

✅ **Seguridad a nivel de PostgreSQL**
- Imposible saltarse (está en la base de datos)
- No depende de código JavaScript

✅ **Multi-tenant perfecto**
- Cada empresa ve SOLO sus datos
- Aislamiento automático

✅ **Roles bien definidos**
- super_admin: acceso total
- admin: gestiona su empresa
- trabajador: solo lectura

✅ **Sin cambios en el frontend**
- Las consultas son iguales
- PostgreSQL filtra automáticamente

---

## 🚀 SIGUIENTE PASO

Una vez que verifiques que RLS funciona:

**Continúa con FASE 6: Storage para imágenes**

Ahí configuraremos el almacenamiento de fotos de OTs con políticas de seguridad también.

---

## 🆘 SI ALGO SALE MAL

Contacta con la persona que te está guiando y envía:
1. Screenshot del error
2. En qué paso te atoraste
3. Qué consulta estabas ejecutando
