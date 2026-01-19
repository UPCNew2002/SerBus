-- ═══════════════════════════════════════════════════════
-- FIX AGRESIVO: Limpiar completamente y recrear RLS
-- ═══════════════════════════════════════════════════════
--
-- Este script hace una limpieza completa:
-- 1. Elimina las funciones helper problemáticas
-- 2. Desactiva RLS temporalmente
-- 3. Elimina TODAS las políticas
-- 4. Reactiva RLS
-- 5. Crea políticas nuevas sin loops
--
-- ⚠️ IMPORTANTE: Ejecuta TODO el script de una vez
--
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- PASO 1: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES PRIMERO
-- ───────────────────────────────────────────────────────
-- (Necesitamos eliminar políticas antes de funciones porque dependen de ellas)
-- ───────────────────────────────────────────────────────

-- Perfiles
DROP POLICY IF EXISTS "select_perfiles" ON perfiles;
DROP POLICY IF EXISTS "insert_perfiles" ON perfiles;
DROP POLICY IF EXISTS "update_perfiles" ON perfiles;
DROP POLICY IF EXISTS "delete_perfiles" ON perfiles;

-- Empresas
DROP POLICY IF EXISTS "select_empresas" ON empresas;
DROP POLICY IF EXISTS "insert_empresas" ON empresas;
DROP POLICY IF EXISTS "update_empresas" ON empresas;
DROP POLICY IF EXISTS "delete_empresas" ON empresas;

-- Trabajos
DROP POLICY IF EXISTS "select_trabajos" ON trabajos;
DROP POLICY IF EXISTS "insert_trabajos" ON trabajos;
DROP POLICY IF EXISTS "update_trabajos" ON trabajos;
DROP POLICY IF EXISTS "delete_trabajos" ON trabajos;

-- Buses
DROP POLICY IF EXISTS "select_buses" ON buses;
DROP POLICY IF EXISTS "insert_buses" ON buses;
DROP POLICY IF EXISTS "update_buses" ON buses;
DROP POLICY IF EXISTS "delete_buses" ON buses;

-- OTs
DROP POLICY IF EXISTS "select_ots" ON ots;
DROP POLICY IF EXISTS "insert_ots" ON ots;
DROP POLICY IF EXISTS "update_ots" ON ots;
DROP POLICY IF EXISTS "delete_ots" ON ots;

-- OTs Trabajos
DROP POLICY IF EXISTS "select_ots_trabajos" ON ots_trabajos;
DROP POLICY IF EXISTS "insert_ots_trabajos" ON ots_trabajos;
DROP POLICY IF EXISTS "update_ots_trabajos" ON ots_trabajos;
DROP POLICY IF EXISTS "delete_ots_trabajos" ON ots_trabajos;

-- Storage
DROP POLICY IF EXISTS "select_ots_evidencias" ON storage.objects;
DROP POLICY IF EXISTS "insert_ots_evidencias" ON storage.objects;
DROP POLICY IF EXISTS "update_ots_evidencias" ON storage.objects;
DROP POLICY IF EXISTS "delete_ots_evidencias" ON storage.objects;

-- ───────────────────────────────────────────────────────
-- PASO 2: AHORA SÍ ELIMINAR FUNCIONES HELPER (después de políticas)
-- ───────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS get_user_rol() CASCADE;
DROP FUNCTION IF EXISTS get_user_empresa_id() CASCADE;

-- ───────────────────────────────────────────────────────
-- PASO 3: ASEGURAR QUE RLS ESTÁ HABILITADO
-- ───────────────────────────────────────────────────────

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajos ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ots_trabajos ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────
-- PASO 4: CREAR POLÍTICAS NUEVAS (SIN LOOPS)
-- ───────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════
-- TABLA: perfiles
-- ═══════════════════════════════════════════════════════

CREATE POLICY "perfiles_select_policy"
ON perfiles FOR SELECT
USING (true);  -- Permitir a todos leer perfiles (es seguro, no hay datos sensibles)

CREATE POLICY "perfiles_insert_policy"
ON perfiles FOR INSERT
WITH CHECK (false);  -- Solo trigger puede insertar

CREATE POLICY "perfiles_update_policy"
ON perfiles FOR UPDATE
USING (id = auth.uid());  -- Solo actualizar tu propio perfil

CREATE POLICY "perfiles_delete_policy"
ON perfiles FOR DELETE
USING (false);  -- Nadie puede eliminar perfiles directamente

-- ═══════════════════════════════════════════════════════
-- TABLA: empresas
-- ═══════════════════════════════════════════════════════

CREATE POLICY "empresas_select_policy"
ON empresas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR p.empresa_id = empresas.id)
  )
);

CREATE POLICY "empresas_insert_policy"
ON empresas FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid() AND p.rol = 'super_admin'
  )
);

CREATE POLICY "empresas_update_policy"
ON empresas FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR (p.rol = 'admin' AND p.empresa_id = empresas.id))
  )
);

CREATE POLICY "empresas_delete_policy"
ON empresas FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid() AND p.rol = 'super_admin'
  )
);

-- ═══════════════════════════════════════════════════════
-- TABLA: trabajos (CATÁLOGO GLOBAL)
-- ═══════════════════════════════════════════════════════

CREATE POLICY "trabajos_select_policy"
ON trabajos FOR SELECT
USING (true);  -- Catálogo público para todos los usuarios

CREATE POLICY "trabajos_insert_policy"
ON trabajos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid() AND (p.rol = 'super_admin' OR p.rol = 'admin')
  )
);

CREATE POLICY "trabajos_update_policy"
ON trabajos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid() AND (p.rol = 'super_admin' OR p.rol = 'admin')
  )
);

CREATE POLICY "trabajos_delete_policy"
ON trabajos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid() AND (p.rol = 'super_admin' OR p.rol = 'admin')
  )
);

-- ═══════════════════════════════════════════════════════
-- TABLA: buses
-- ═══════════════════════════════════════════════════════

CREATE POLICY "buses_select_policy"
ON buses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR p.empresa_id = buses.empresa_id)
  )
);

CREATE POLICY "buses_insert_policy"
ON buses FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR (p.rol = 'admin' AND p.empresa_id = buses.empresa_id))
  )
);

CREATE POLICY "buses_update_policy"
ON buses FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR (p.rol = 'admin' AND p.empresa_id = buses.empresa_id))
  )
);

CREATE POLICY "buses_delete_policy"
ON buses FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR (p.rol = 'admin' AND p.empresa_id = buses.empresa_id))
  )
);

-- ═══════════════════════════════════════════════════════
-- TABLA: ots
-- ═══════════════════════════════════════════════════════

CREATE POLICY "ots_select_policy"
ON ots FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR p.empresa_id = ots.empresa_id)
  )
);

CREATE POLICY "ots_insert_policy"
ON ots FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR (p.rol = 'admin' AND p.empresa_id = ots.empresa_id))
  )
);

CREATE POLICY "ots_update_policy"
ON ots FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR (p.rol = 'admin' AND p.empresa_id = ots.empresa_id))
  )
);

CREATE POLICY "ots_delete_policy"
ON ots FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR (p.rol = 'admin' AND p.empresa_id = ots.empresa_id))
  )
);

-- ═══════════════════════════════════════════════════════
-- TABLA: ots_trabajos
-- ═══════════════════════════════════════════════════════

CREATE POLICY "ots_trabajos_select_policy"
ON ots_trabajos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    JOIN ots o ON o.id = ots_trabajos.ot_id
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR p.empresa_id = o.empresa_id)
  )
);

CREATE POLICY "ots_trabajos_insert_policy"
ON ots_trabajos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfiles p
    JOIN ots o ON o.id = ots_trabajos.ot_id
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR (p.rol = 'admin' AND p.empresa_id = o.empresa_id))
  )
);

CREATE POLICY "ots_trabajos_update_policy"
ON ots_trabajos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    JOIN ots o ON o.id = ots_trabajos.ot_id
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR (p.rol = 'admin' AND p.empresa_id = o.empresa_id))
  )
);

CREATE POLICY "ots_trabajos_delete_policy"
ON ots_trabajos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    JOIN ots o ON o.id = ots_trabajos.ot_id
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR (p.rol = 'admin' AND p.empresa_id = o.empresa_id))
  )
);

-- ═══════════════════════════════════════════════════════
-- STORAGE: ots-evidencias
-- ═══════════════════════════════════════════════════════

CREATE POLICY "storage_select_policy"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ots-evidencias'
  AND EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR split_part(name, '/', 1) = 'empresa-' || p.empresa_id::TEXT
    )
  )
);

CREATE POLICY "storage_insert_policy"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ots-evidencias'
  AND EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (
        (p.rol = 'admin' OR p.rol = 'trabajador')
        AND split_part(name, '/', 1) = 'empresa-' || p.empresa_id::TEXT
      )
    )
  )
);

CREATE POLICY "storage_update_policy"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ots-evidencias'
  AND EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (p.rol = 'admin' AND split_part(name, '/', 1) = 'empresa-' || p.empresa_id::TEXT)
    )
  )
);

CREATE POLICY "storage_delete_policy"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ots-evidencias'
  AND EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (p.rol = 'admin' AND split_part(name, '/', 1) = 'empresa-' || p.empresa_id::TEXT)
    )
  )
);

-- ═══════════════════════════════════════════════════════
-- VERIFICAR QUE TODO ESTÁ CORRECTO
-- ═══════════════════════════════════════════════════════

-- Ver todas las políticas creadas
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operacion
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
ORDER BY tablename, policyname;

-- Deberías ver 28 políticas en total

-- Verificar que RLS está habilitado
SELECT
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('perfiles', 'empresas', 'trabajos', 'buses', 'ots', 'ots_trabajos')
ORDER BY tablename;

-- Todas deberían tener rls_habilitado = true

-- Probar que puedes leer perfiles
SELECT username, nombre, rol, empresa_id
FROM perfiles
ORDER BY username;
