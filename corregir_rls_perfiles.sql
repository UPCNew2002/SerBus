-- ═══════════════════════════════════════════════════════
-- CORREGIR POLÍTICAS RLS DE TABLA PERFILES
-- ═══════════════════════════════════════════════════════
--
-- PROBLEMA:
-- Las políticas de perfiles usan get_user_rol(), pero
-- get_user_rol() lee la tabla perfiles, creando un loop
-- circular que causa "Database error querying schema"
--
-- SOLUCIÓN:
-- Permitir que usuarios autenticados lean perfiles sin
-- depender de get_user_rol()
--
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- PASO 1: Eliminar políticas actuales de perfiles
-- ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS "select_perfiles" ON perfiles;
DROP POLICY IF EXISTS "insert_perfiles" ON perfiles;
DROP POLICY IF EXISTS "update_perfiles" ON perfiles;
DROP POLICY IF EXISTS "delete_perfiles" ON perfiles;

-- ───────────────────────────────────────────────────────
-- PASO 2: Crear nuevas políticas simples (sin loop)
-- ───────────────────────────────────────────────────────

-- POLÍTICA 1: SELECT (Leer perfiles)
-- Cualquier usuario autenticado puede leer cualquier perfil
-- Esto es seguro porque los perfiles solo contienen: username, nombre, rol, empresa_id
CREATE POLICY "select_perfiles"
ON perfiles FOR SELECT
USING (
  auth.uid() IS NOT NULL  -- Solo usuarios autenticados
);

-- POLÍTICA 2: INSERT (Crear perfil)
-- Solo el sistema puede crear perfiles (vía trigger)
-- Los usuarios NO pueden crear perfiles manualmente
CREATE POLICY "insert_perfiles"
ON perfiles FOR INSERT
WITH CHECK (false);  -- Nadie puede insertar manualmente

-- POLÍTICA 3: UPDATE (Actualizar perfil)
-- Solo el propio usuario puede actualizar su perfil
-- O un super_admin puede actualizar cualquier perfil
CREATE POLICY "update_perfiles"
ON perfiles FOR UPDATE
USING (
  id = auth.uid()  -- Tu propio perfil
  OR EXISTS (
    SELECT 1 FROM perfiles
    WHERE id = auth.uid()
    AND rol = 'super_admin'
  )
);

-- POLÍTICA 4: DELETE (Eliminar perfil)
-- Solo super_admin puede eliminar perfiles
CREATE POLICY "delete_perfiles"
ON perfiles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfiles
    WHERE id = auth.uid()
    AND rol = 'super_admin'
  )
);

-- ═══════════════════════════════════════════════════════
-- VERIFICAR POLÍTICAS CREADAS
-- ═══════════════════════════════════════════════════════

SELECT
  tablename,
  policyname,
  cmd as operacion,
  CASE
    WHEN roles = '{public}' THEN 'Público'
    ELSE 'Autenticado'
  END as acceso
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'perfiles'
ORDER BY policyname;

-- Deberías ver 4 políticas:
-- delete_perfiles | DELETE
-- insert_perfiles | INSERT
-- select_perfiles | SELECT
-- update_perfiles | UPDATE

-- ═══════════════════════════════════════════════════════
-- PROBAR QUE FUNCIONA
-- ═══════════════════════════════════════════════════════

-- Esta query debería funcionar ahora (devuelve todos los perfiles)
SELECT
  username,
  nombre,
  rol,
  empresa_id,
  activo
FROM perfiles
ORDER BY username;

-- Deberías ver:
-- jperez   | Juan Pérez       | admin       | 1          | true
-- mgarcia  | María García     | trabajador  | 1          | true
-- superadmin | Super Admin    | super_admin | null       | true
