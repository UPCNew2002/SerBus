-- ═══════════════════════════════════════════════════════
-- FIX: Políticas RLS de tabla trabajos
-- ═══════════════════════════════════════════════════════
--
-- PROBLEMA:
-- La tabla trabajos NO tiene empresa_id (es catálogo global)
-- Las políticas anteriores intentaban usar trabajos.empresa_id
--
-- SOLUCIÓN:
-- Permitir que todos vean trabajos (catálogo común)
-- Solo admin/super_admin pueden modificar
--
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- ELIMINAR POLÍTICAS INCORRECTAS
-- ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS "select_trabajos" ON trabajos;
DROP POLICY IF EXISTS "insert_trabajos" ON trabajos;
DROP POLICY IF EXISTS "update_trabajos" ON trabajos;
DROP POLICY IF EXISTS "delete_trabajos" ON trabajos;

-- ───────────────────────────────────────────────────────
-- CREAR POLÍTICAS CORRECTAS
-- ───────────────────────────────────────────────────────

-- SELECT: Cualquier usuario autenticado puede ver trabajos (catálogo común)
CREATE POLICY "select_trabajos"
ON trabajos FOR SELECT
USING (auth.uid() IS NOT NULL);

-- INSERT: Solo super_admin o admin
CREATE POLICY "insert_trabajos"
ON trabajos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR p.rol = 'admin')
  )
);

-- UPDATE: Solo super_admin o admin
CREATE POLICY "update_trabajos"
ON trabajos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR p.rol = 'admin')
  )
);

-- DELETE: Solo super_admin o admin
CREATE POLICY "delete_trabajos"
ON trabajos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.id = auth.uid()
    AND (p.rol = 'super_admin' OR p.rol = 'admin')
  )
);

-- ═══════════════════════════════════════════════════════
-- VERIFICAR
-- ═══════════════════════════════════════════════════════

SELECT
  tablename,
  policyname,
  cmd as operacion
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'trabajos'
ORDER BY policyname;

-- Deberías ver 4 políticas:
-- delete_trabajos | DELETE
-- insert_trabajos | INSERT
-- select_trabajos | SELECT
-- update_trabajos | UPDATE
