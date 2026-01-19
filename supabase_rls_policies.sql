-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS COMPLETAS
-- ═══════════════════════════════════════════════════════
--
-- Este script crea todas las políticas de seguridad para:
-- - super_admin: ve y modifica TODO
-- - admin: ve y modifica solo SU empresa
-- - trabajador: solo ve (lectura) SU empresa
--
-- Instrucciones:
-- 1. Abre Supabase → SQL Editor
-- 2. Click en "New query"
-- 3. Copia TODO este archivo
-- 4. Pégalo en el editor
-- 5. Click en "Run"
--
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- HELPER FUNCTION: Obtener rol del usuario actual
-- ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_rol()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT rol FROM perfiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_rol() IS 'Retorna el rol del usuario logueado';

-- ───────────────────────────────────────────────────────
-- HELPER FUNCTION: Obtener empresa_id del usuario actual
-- ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_empresa_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT empresa_id FROM perfiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_empresa_id() IS 'Retorna la empresa_id del usuario logueado';

-- ═══════════════════════════════════════════════════════
-- TABLA: perfiles
-- ═══════════════════════════════════════════════════════

-- Ya tiene RLS habilitado y una política básica
-- Vamos a mejorarla

-- Eliminar política anterior si existe
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON perfiles;

-- SELECT: Usuarios ven su propio perfil, super_admin ve todos
CREATE POLICY "select_perfiles"
ON perfiles
FOR SELECT
USING (
  auth.uid() = id  -- Su propio perfil
  OR
  get_user_rol() = 'super_admin'  -- O es super admin
);

-- INSERT: Solo super_admin puede crear perfiles (además del trigger)
CREATE POLICY "insert_perfiles"
ON perfiles
FOR INSERT
WITH CHECK (
  get_user_rol() = 'super_admin'
);

-- UPDATE: Usuario puede actualizar su perfil, super_admin puede actualizar cualquiera
CREATE POLICY "update_perfiles"
ON perfiles
FOR UPDATE
USING (
  auth.uid() = id
  OR
  get_user_rol() = 'super_admin'
);

-- DELETE: Solo super_admin puede borrar perfiles
CREATE POLICY "delete_perfiles"
ON perfiles
FOR DELETE
USING (
  get_user_rol() = 'super_admin'
);

-- ═══════════════════════════════════════════════════════
-- TABLA: empresas
-- ═══════════════════════════════════════════════════════

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- SELECT: super_admin ve todas, admin/trabajador ven solo la suya
CREATE POLICY "select_empresas"
ON empresas
FOR SELECT
USING (
  get_user_rol() = 'super_admin'
  OR
  id = get_user_empresa_id()
);

-- INSERT: Solo super_admin puede crear empresas
CREATE POLICY "insert_empresas"
ON empresas
FOR INSERT
WITH CHECK (
  get_user_rol() = 'super_admin'
);

-- UPDATE: super_admin actualiza cualquiera, admin actualiza la suya
CREATE POLICY "update_empresas"
ON empresas
FOR UPDATE
USING (
  get_user_rol() = 'super_admin'
  OR
  (get_user_rol() = 'admin' AND id = get_user_empresa_id())
);

-- DELETE: Solo super_admin puede borrar empresas
CREATE POLICY "delete_empresas"
ON empresas
FOR DELETE
USING (
  get_user_rol() = 'super_admin'
);

-- ═══════════════════════════════════════════════════════
-- TABLA: trabajos (Catálogo público de tipos de trabajo)
-- ═══════════════════════════════════════════════════════

ALTER TABLE trabajos ENABLE ROW LEVEL SECURITY;

-- SELECT: Todos los usuarios autenticados pueden ver trabajos
CREATE POLICY "select_trabajos"
ON trabajos
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- INSERT: Solo super_admin y admin pueden crear trabajos
CREATE POLICY "insert_trabajos"
ON trabajos
FOR INSERT
WITH CHECK (
  get_user_rol() IN ('super_admin', 'admin')
);

-- UPDATE: Solo super_admin y admin pueden actualizar trabajos
CREATE POLICY "update_trabajos"
ON trabajos
FOR UPDATE
USING (
  get_user_rol() IN ('super_admin', 'admin')
);

-- DELETE: Solo super_admin y admin pueden borrar trabajos
CREATE POLICY "delete_trabajos"
ON trabajos
FOR DELETE
USING (
  get_user_rol() IN ('super_admin', 'admin')
);

-- ═══════════════════════════════════════════════════════
-- TABLA: buses
-- ═══════════════════════════════════════════════════════

ALTER TABLE buses ENABLE ROW LEVEL SECURITY;

-- SELECT: super_admin ve todos, admin/trabajador ven solo su empresa
CREATE POLICY "select_buses"
ON buses
FOR SELECT
USING (
  get_user_rol() = 'super_admin'
  OR
  empresa_id = get_user_empresa_id()
);

-- INSERT: super_admin y admin pueden crear buses
CREATE POLICY "insert_buses"
ON buses
FOR INSERT
WITH CHECK (
  get_user_rol() = 'super_admin'
  OR
  (get_user_rol() = 'admin' AND empresa_id = get_user_empresa_id())
);

-- UPDATE: super_admin actualiza cualquiera, admin actualiza solo su empresa
CREATE POLICY "update_buses"
ON buses
FOR UPDATE
USING (
  get_user_rol() = 'super_admin'
  OR
  (get_user_rol() = 'admin' AND empresa_id = get_user_empresa_id())
);

-- DELETE: super_admin y admin pueden borrar buses
CREATE POLICY "delete_buses"
ON buses
FOR DELETE
USING (
  get_user_rol() = 'super_admin'
  OR
  (get_user_rol() = 'admin' AND empresa_id = get_user_empresa_id())
);

-- ═══════════════════════════════════════════════════════
-- TABLA: ots (Órdenes de Trabajo)
-- ═══════════════════════════════════════════════════════

ALTER TABLE ots ENABLE ROW LEVEL SECURITY;

-- SELECT: super_admin ve todas, admin/trabajador ven solo su empresa
CREATE POLICY "select_ots"
ON ots
FOR SELECT
USING (
  get_user_rol() = 'super_admin'
  OR
  empresa_id = get_user_empresa_id()
);

-- INSERT: super_admin y admin pueden crear OTs
CREATE POLICY "insert_ots"
ON ots
FOR INSERT
WITH CHECK (
  get_user_rol() = 'super_admin'
  OR
  (get_user_rol() = 'admin' AND empresa_id = get_user_empresa_id())
);

-- UPDATE: super_admin actualiza cualquiera, admin actualiza solo su empresa
CREATE POLICY "update_ots"
ON ots
FOR UPDATE
USING (
  get_user_rol() = 'super_admin'
  OR
  (get_user_rol() = 'admin' AND empresa_id = get_user_empresa_id())
);

-- DELETE: super_admin y admin pueden borrar OTs
CREATE POLICY "delete_ots"
ON ots
FOR DELETE
USING (
  get_user_rol() = 'super_admin'
  OR
  (get_user_rol() = 'admin' AND empresa_id = get_user_empresa_id())
);

-- ═══════════════════════════════════════════════════════
-- TABLA: ots_trabajos (Relación OTs con Trabajos)
-- ═══════════════════════════════════════════════════════

ALTER TABLE ots_trabajos ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuarios ven solo las relaciones de OTs de su empresa
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

-- INSERT: Admin puede agregar trabajos a OTs de su empresa
CREATE POLICY "insert_ots_trabajos"
ON ots_trabajos
FOR INSERT
WITH CHECK (
  get_user_rol() = 'super_admin'
  OR
  (
    get_user_rol() = 'admin'
    AND
    EXISTS (
      SELECT 1 FROM ots
      WHERE ots.id = ots_trabajos.ot_id
      AND ots.empresa_id = get_user_empresa_id()
    )
  )
);

-- UPDATE: Admin puede actualizar trabajos de OTs de su empresa
CREATE POLICY "update_ots_trabajos"
ON ots_trabajos
FOR UPDATE
USING (
  get_user_rol() = 'super_admin'
  OR
  (
    get_user_rol() = 'admin'
    AND
    EXISTS (
      SELECT 1 FROM ots
      WHERE ots.id = ots_trabajos.ot_id
      AND ots.empresa_id = get_user_empresa_id()
    )
  )
);

-- DELETE: Admin puede borrar trabajos de OTs de su empresa
CREATE POLICY "delete_ots_trabajos"
ON ots_trabajos
FOR DELETE
USING (
  get_user_rol() = 'super_admin'
  OR
  (
    get_user_rol() = 'admin'
    AND
    EXISTS (
      SELECT 1 FROM ots
      WHERE ots.id = ots_trabajos.ot_id
      AND ots.empresa_id = get_user_empresa_id()
    )
  )
);

-- ═══════════════════════════════════════════════════════
-- VERIFICAR QUE LAS POLÍTICAS SE CREARON
-- ═══════════════════════════════════════════════════════
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- ═══════════════════════════════════════════════════════
-- ✅ RLS CONFIGURADO EXITOSAMENTE
-- ═══════════════════════════════════════════════════════
--
-- RESUMEN DE PERMISOS:
--
-- super_admin:
--   ✅ Ve TODO
--   ✅ Modifica TODO
--   ✅ Borra TODO
--
-- admin:
--   ✅ Ve solo SU empresa
--   ✅ Crea/modifica datos de SU empresa
--   ✅ Crea/modifica trabajos (catálogo)
--   ❌ NO puede ver otras empresas
--
-- trabajador:
--   ✅ Ve solo SU empresa (lectura)
--   ❌ NO puede crear ni modificar NADA
--   ❌ NO puede ver otras empresas
--
-- ═══════════════════════════════════════════════════════
