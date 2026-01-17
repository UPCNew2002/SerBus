# 📘 GUÍA PASO A PASO: CREAR TABLAS EN SUPABASE

## 🎯 OBJETIVO
Ejecutar el archivo `supabase_schema.sql` para crear todas las tablas del sistema SerBus.

---

## 📋 PASO 1: ABRIR SUPABASE

1. Abre tu navegador
2. Ve a: https://supabase.com
3. Haz clic en **"Sign In"**
4. Inicia sesión (GitHub o Email)
5. Selecciona el proyecto **"SerBus"**

---

## 📋 PASO 2: IR AL SQL EDITOR

Una vez dentro del proyecto SerBus:

1. En el menú lateral **IZQUIERDO**, busca el ícono 🔧 **"SQL Editor"**
2. **HAZ CLIC** en "SQL Editor"

Vas a ver una pantalla así:

```
┌─────────────────────────────────────────────┐
│  SQL Editor                                 │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  + New query                          │ │ ← HAZ CLIC AQUÍ
│  └───────────────────────────────────────┘ │
│                                             │
│  📁 Saved queries                           │
│     (ninguna aún)                           │
│                                             │
│  📚 Templates                               │
│     • Create a table                        │
│     • Create RLS policies                   │
│     • ...                                   │
└─────────────────────────────────────────────┘
```

3. **HAZ CLIC** en **"+ New query"**

---

## 📋 PASO 3: ABRIR EL ARCHIVO SQL

Ahora necesitas copiar el contenido del archivo `supabase_schema.sql`:

### Opción A: Copiar desde VS Code / Editor

1. Abre el archivo: `/home/user/SerBus/supabase_schema.sql`
2. Selecciona TODO el contenido (Ctrl+A o Cmd+A)
3. Copia (Ctrl+C o Cmd+C)

### Opción B: Copiar desde terminal

```bash
cat supabase_schema.sql
```

Luego selecciona y copia todo el output.

---

## 📋 PASO 4: PEGAR EN SUPABASE

Ahora vas a ver el editor SQL:

```
┌─────────────────────────────────────────────┐
│  Untitled Query                             │
│  ┌───────────────────────────────────────┐  │
│  │  -- Escribe tu SQL aquí               │  │ ← PEGA AQUÍ
│  │                                       │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  [ Save ]  [ Run ]  [ Format ]              │
└─────────────────────────────────────────────┘
```

1. **HAZ CLIC** dentro del editor (donde dice "Escribe tu SQL aquí")
2. **BORRA** cualquier texto que haya
3. **PEGA** todo el contenido del archivo `supabase_schema.sql` (Ctrl+V o Cmd+V)

Deberías ver algo así:

```sql
-- ═══════════════════════════════════════════════════════
-- SCHEMA DE BASE DE DATOS - SERBUS
-- ═══════════════════════════════════════════════════════
...
CREATE TABLE empresas (
  id SERIAL PRIMARY KEY,
  ...
```

---

## 📋 PASO 5: EJECUTAR EL SQL

Ahora que pegaste el SQL completo:

1. **REVISA** que se pegó completo (scroll hacia abajo para verificar)
2. Busca el botón **"RUN"** (generalmente arriba a la derecha, color verde)
3. **HAZ CLIC** en **"RUN"**

```
┌─────────────────────────────────────────────┐
│  [ Save ]  [ 🟢 RUN ]  [ Format ]           │ ← HAZ CLIC EN RUN
└─────────────────────────────────────────────┘
```

---

## ⏳ PASO 6: ESPERAR RESULTADO

El SQL va a ejecutarse (tarda 2-5 segundos).

### ✅ SI SALE BIEN:

Vas a ver un mensaje abajo:

```
✅ Success. No rows returned

Rows returned: 0
Time: 2.5s
```

Esto es **NORMAL**. El script crea tablas, NO devuelve filas.

### ❌ SI HAY ERROR:

Vas a ver algo como:

```
❌ Error

ERROR: relation "empresas" already exists
```

**Esto significa:** La tabla ya existe.

**Solución:** Si quieres empezar de cero:
1. Ve al inicio del archivo `supabase_schema.sql`
2. **DESCOMENTA** estas líneas (quita los `--`):

```sql
-- DROP TABLE IF EXISTS ots_trabajos CASCADE;
-- DROP TABLE IF EXISTS ots CASCADE;
-- DROP TABLE IF EXISTS buses CASCADE;
-- DROP TABLE IF EXISTS trabajos CASCADE;
-- DROP TABLE IF EXISTS empresas CASCADE;
```

Debe quedar así:

```sql
DROP TABLE IF EXISTS ots_trabajos CASCADE;
DROP TABLE IF EXISTS ots CASCADE;
DROP TABLE IF EXISTS buses CASCADE;
DROP TABLE IF EXISTS trabajos CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;
```

3. Vuelve a pegar y ejecutar en Supabase.

---

## 📋 PASO 7: VERIFICAR QUE SE CREARON LAS TABLAS

Ahora vamos a verificar que las 5 tablas se crearon:

1. En el menú lateral **IZQUIERDO**, haz clic en **"Table Editor"** (📊)
2. Deberías ver en el panel izquierdo:

```
┌─────────────────────────────┐
│  public                     │
│    ├── 📋 buses             │
│    ├── 📋 empresas          │
│    ├── 📋 ots               │
│    ├── 📋 ots_trabajos      │
│    └── 📋 trabajos          │
└─────────────────────────────┘
```

3. **HAZ CLIC** en cada tabla para ver su estructura:

### Tabla: empresas

```
┌─────────────────────────────────────────────┐
│  empresas                                   │
│  ┌────┬─────┬──────────────┬──────────┬───┐│
│  │ id │ ruc │ razon_social │ telefono │...││
│  └────┴─────┴──────────────┴──────────┴───┘│
│                                             │
│  No rows found (aún sin datos)              │
└─────────────────────────────────────────────┘
```

**✅ Si ves esto, ¡PERFECTO!**

---

## 📋 PASO 8 (OPCIONAL): INSERTAR DATOS DE PRUEBA

Si quieres tener datos de ejemplo para probar:

1. Ve al final del archivo `supabase_schema.sql`
2. Busca la sección:

```sql
-- DATOS DE PRUEBA (Opcional - para empezar a probar)
-- Descomenta si quieres datos de ejemplo

/*
-- Empresa de prueba
INSERT INTO empresas (ruc, razon_social, telefono, direccion) VALUES
('20123456789', 'Transportes ABC S.A.C.', '987654321', 'Av. Principal 123, Lima');
...
*/
```

3. **DESCOMENTA** todo (quita `/*` y `*/`):

```sql
-- Empresa de prueba
INSERT INTO empresas (ruc, razon_social, telefono, direccion) VALUES
('20123456789', 'Transportes ABC S.A.C.', '987654321', 'Av. Principal 123, Lima');

-- Trabajos de prueba
INSERT INTO trabajos (nombre, entra_cronograma, intervalo_dias, intervalo_km) VALUES
...
```

4. Copia SOLO esa parte
5. Pégala en SQL Editor
6. Haz clic en **RUN**

Ahora vas a tener:
- 1 empresa (Transportes ABC S.A.C.)
- 5 trabajos (Cambio de Aceite, etc.)
- 3 buses (ABC-123, ABC-456, ABC-789)
- 1 OT de ejemplo

---

## 🎯 CHECKLIST FINAL

Verifica que completaste:

- [ ] Abriste Supabase → Proyecto SerBus
- [ ] Fuiste a SQL Editor → New query
- [ ] Copiaste y pegaste el archivo `supabase_schema.sql`
- [ ] Ejecutaste con el botón RUN
- [ ] Viste el mensaje "Success. No rows returned"
- [ ] Verificaste en Table Editor que aparecen 5 tablas
- [ ] (Opcional) Insertaste datos de prueba

---

## ❓ ERRORES COMUNES

### Error: "relation already exists"

**Causa:** Ya creaste las tablas antes.

**Solución:** Descomenta las líneas `DROP TABLE` al inicio del SQL.

---

### Error: "permission denied"

**Causa:** No tienes permisos (raro).

**Solución:** Verifica que iniciaste sesión con la cuenta correcta.

---

### Error: "syntax error"

**Causa:** No se copió bien el SQL.

**Solución:**
1. Borra todo del editor
2. Vuelve a copiar el archivo completo
3. Asegúrate de copiar desde la primera línea hasta la última

---

## ✅ SIGUIENTE PASO

Una vez que veas las 5 tablas en Table Editor:

**Continúa con la FASE 4: Configurar autenticación con Supabase Auth**

---

## 🆘 SI ALGO SALE MAL

Contacta con la persona que te está guiando y envía:
1. Screenshot del error
2. En qué paso te atoraste
3. Qué mensaje de error viste
