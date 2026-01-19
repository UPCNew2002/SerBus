-- ═══════════════════════════════════════════════════════
-- FIX COMPLETO: Eliminar Loops Circulares en RLS
-- ═══════════════════════════════════════════════════════
--
-- PROBLEMA:
-- Las funciones get_user_rol() y get_user_empresa_id() leen
-- la tabla perfiles, pero las políticas de todas las tablas
-- usan estas funciones, creando loops circulares.
--
-- SOLUCIÓN:
-- Reemplazar todas las políticas para que usen queries inline
-- en lugar de funciones helper.
--
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- PASO 1: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- ───────────────────────────────────────────────────────

-- Políticas de perfiles
DROP POLICY IF EXISTS "select_perfiles" ON perfiles;
DROP POLICY IF EXISTS "insert_perfiles" ON perfiles;
DROP POLICY IF EXISTS "update_perfiles" ON perfiles;
DROP POLICY IF EXISTS "delete_perfiles" ON perfiles;

-- Políticas de empresas
DROP POLICY IF EXISTS "select_empresas" ON empresas;
DROP POLICY IF EXISTS "insert_empresas" ON empresas;
DROP POLICY IF EXISTS "update_empresas" ON empresas;
DROP POLICY IF EXISTS "delete_empresas" ON empresas;

-- Políticas de trabajos
DROP POLICY IF EXISTS "select_trabajos" ON trabajos;
DROP POLICY IF EXISTS "insert_trabajos" ON trabajos;
DROP POLICY IF EXISTS "update_trabajos" ON trabajos;
DROP POLICY IF EXISTS "delete_trabajos" ON trabajos;

-- Políticas de buses
DROP POLICY IF EXISTS "select_buses" ON buses;
DROP POLICY IF EXISTS "insert_buses" ON buses;
DROP POLICY IF EXISTS "update_buses" ON buses;
DROP POLICY IF EXISTS "delete_buses" ON buses;

-- Políticas de ots
DROP POLICY IF EXISTS "select_ots" ON ots;
DROP POLICY IF EXISTS "insert_ots" ON ots;
DROP POLICY IF EXISTS "update_ots" ON ots;
DROP POLICY IF EXISTS "delete_ots" ON ots;

-- Políticas de ots_trabajos
DROP POLICY IF EXISTS "select_ots_trabajos" ON ots_trabajos;
DROP POLICY IF EXISTS "insert_ots_trabajos" ON ots_trabajos;
DROP POLICY IF EXISTS "update_ots_trabajos" ON ots_trabajos;
DROP POLICY IF EXISTS "delete_ots_trabajos" ON ots_trabajos;

-- Políticas de storage
DROP POLICY IF EXISTS "select_ots_evidencias" ON storage.objects;
DROP POLICY IF EXISTS "insert_ots_evidencias" ON storage.objects;
DROP POLICY IF EXISTS "update_ots_evidencias" ON storage.objects;
DROP POLICY IF EXISTS "delete_ots_evidencias" ON storage.objects;

-- ───────────────────────────────────────────────────────
-- PASO 2: CREAR NUEVAS POLÍTICAS SIN LOOPS
-- ───────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════
-- TABLA: perfiles
-- ═══════════════════════════════════════════════════════

-- SELECT: Cualquier usuario autenticado puede leer perfiles
CREATE POLICY "select_perfiles"
ON perfiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- INSERT: Bloqueado (solo trigger)
CREATE POLICY "insert_perfiles"
ON perfiles FOR INSERT
WITH CHECK (false);

-- UPDATE: Propio perfil o super_admin
CREATE POLICY "update_perfiles"
ON perfiles FOR UPDATE
USING (
  id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid() AND p.rol = 'super_admin'
  )
);

-- DELETE: Solo super_admin
CREATE POLICY "delete_perfiles"
ON perfiles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid() AND p.rol = 'super_admin'
  )
);

-- ═══════════════════════════════════════════════════════
-- TABLA: empresas
-- ═══════════════════════════════════════════════════════

-- SELECT: Super admin ve todo, otros ven su empresa
CREATE POLICY "select_empresas"
ON empresas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR p.empresa_id = empresas.id
    )
  )
);

-- INSERT: Solo super_admin
CREATE POLICY "insert_empresas"
ON empresas FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid() AND p.rol = 'super_admin'
  )
);

-- UPDATE: Super admin o admin de la empresa
CREATE POLICY "update_empresas"
ON empresas FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (p.rol = 'admin' AND p.empresa_id = empresas.id)
    )
  )
);

-- DELETE: Solo super_admin
CREATE POLICY "delete_empresas"
ON empresas FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid() AND p.rol = 'super_admin'
  )
);

-- ═══════════════════════════════════════════════════════
-- TABLA: trabajos
-- ═══════════════════════════════════════════════════════

-- SELECT: Super admin ve todo, otros ven su empresa
CREATE POLICY "select_trabajos"
ON trabajos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR p.empresa_id = trabajos.empresa_id
    )
  )
);

-- INSERT: Super admin o admin
CREATE POLICY "insert_trabajos"
ON trabajos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (p.rol = 'admin' AND p.empresa_id = trabajos.empresa_id)
    )
  )
);

-- UPDATE: Super admin o admin
CREATE POLICY "update_trabajos"
ON trabajos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (p.rol = 'admin' AND p.empresa_id = trabajos.empresa_id)
    )
  )
);

-- DELETE: Super admin o admin
CREATE POLICY "delete_trabajos"
ON trabajos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (p.rol = 'admin' AND p.empresa_id = trabajos.empresa_id)
    )
  )
);

-- ═══════════════════════════════════════════════════════
-- TABLA: buses
-- ═══════════════════════════════════════════════════════

-- SELECT: Super admin ve todo, otros ven su empresa
CREATE POLICY "select_buses"
ON buses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR p.empresa_id = buses.empresa_id
    )
  )
);

-- INSERT: Super admin o admin
CREATE POLICY "insert_buses"
ON buses FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (p.rol = 'admin' AND p.empresa_id = buses.empresa_id)
    )
  )
);

-- UPDATE: Super admin o admin
CREATE POLICY "update_buses"
ON buses FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (p.rol = 'admin' AND p.empresa_id = buses.empresa_id)
    )
  )
);

-- DELETE: Super admin o admin
CREATE POLICY "delete_buses"
ON buses FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (p.rol = 'admin' AND p.empresa_id = buses.empresa_id)
    )
  )
);

-- ═══════════════════════════════════════════════════════
-- TABLA: ots
-- ═══════════════════════════════════════════════════════

-- SELECT: Super admin ve todo, otros ven su empresa
CREATE POLICY "select_ots"
ON ots FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR p.empresa_id = ots.empresa_id
    )
  )
);

-- INSERT: Super admin o admin
CREATE POLICY "insert_ots"
ON ots FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (p.rol = 'admin' AND p.empresa_id = ots.empresa_id)
    )
  )
);

-- UPDATE: Super admin o admin
CREATE POLICY "update_ots"
ON ots FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (p.rol = 'admin' AND p.empresa_id = ots.empresa_id)
    )
  )
);

-- DELETE: Super admin o admin
CREATE POLICY "delete_ots"
ON ots FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (p.rol = 'admin' AND p.empresa_id = ots.empresa_id)
    )
  )
);

-- ═══════════════════════════════════════════════════════
-- TABLA: ots_trabajos
-- ═══════════════════════════════════════════════════════

-- SELECT: Basado en la empresa de la OT
CREATE POLICY "select_ots_trabajos"
ON ots_trabajos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    JOIN ots o ON o.id = ots_trabajos.ot_id
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR p.empresa_id = o.empresa_id
    )
  )
);

-- INSERT: Super admin o admin de la empresa de la OT
CREATE POLICY "insert_ots_trabajos"
ON ots_trabajos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfiles p
    JOIN ots o ON o.id = ots_trabajos.ot_id
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (p.rol = 'admin' AND p.empresa_id = o.empresa_id)
    )
  )
);

-- UPDATE: Super admin o admin de la empresa de la OT
CREATE POLICY "update_ots_trabajos"
ON ots_trabajos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    JOIN ots o ON o.id = ots_trabajos.ot_id
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (p.rol = 'admin' AND p.empresa_id = o.empresa_id)
    )
  )
);

-- DELETE: Super admin o admin de la empresa de la OT
CREATE POLICY "delete_ots_trabajos"
ON ots_trabajos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    JOIN ots o ON o.id = ots_trabajos.ot_id
    WHERE p.id = auth.uid()
    AND (
      p.rol = 'super_admin'
      OR (p.rol = 'admin' AND p.empresa_id = o.empresa_id)
    )
  )
);

-- ═══════════════════════════════════════════════════════
-- STORAGE: ots-evidencias
-- ═══════════════════════════════════════════════════════

-- SELECT: Super admin ve todo, otros ven archivos de su empresa
CREATE POLICY "select_ots_evidencias"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ots-evidencias'
  AND (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.id = auth.uid()
      AND (
        p.rol = 'super_admin'
        OR split_part(name, '/', 1) = 'empresa-' || p.empresa_id::TEXT
      )
    )
  )
);

-- INSERT: Super admin, admin o trabajador de la empresa
CREATE POLICY "insert_ots_evidencias"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ots-evidencias'
  AND (
    EXISTS (
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
  )
);

-- UPDATE: Super admin o admin de la empresa
CREATE POLICY "update_ots_evidencias"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ots-evidencias'
  AND (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.id = auth.uid()
      AND (
        p.rol = 'super_admin'
        OR (
          p.rol = 'admin'
          AND split_part(name, '/', 1) = 'empresa-' || p.empresa_id::TEXT
        )
      )
    )
  )
);

-- DELETE: Super admin o admin de la empresa
CREATE POLICY "delete_ots_evidencias"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ots-evidencias'
  AND (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.id = auth.uid()
      AND (
        p.rol = 'super_admin'
        OR (
          p.rol = 'admin'
          AND split_part(name, '/', 1) = 'empresa-' || p.empresa_id::TEXT
        )
      )
    )
  )
);

-- ═══════════════════════════════════════════════════════
-- VERIFICAR POLÍTICAS CREADAS
-- ═══════════════════════════════════════════════════════

SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operacion
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
  AND tablename IN ('perfiles', 'empresas', 'trabajos', 'buses', 'ots', 'ots_trabajos', 'objects')
ORDER BY tablename, policyname;

-- Deberías ver 28 políticas en total (4 por cada tabla)

-- ═══════════════════════════════════════════════════════
-- PROBAR QUE FUNCIONA
-- ═══════════════════════════════════════════════════════

-- Esta query debería funcionar
SELECT
  username,
  nombre,
  rol,
  empresa_id
FROM perfiles
ORDER BY username;

-- Resultado esperado:
-- jperez     | Juan Pérez    | admin       | 1
-- mgarcia    | María García  | trabajador  | 1
-- superadmin | Super Admin   | super_admin | null
