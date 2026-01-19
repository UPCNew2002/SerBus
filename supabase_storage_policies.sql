-- ═══════════════════════════════════════════════════════
-- POLÍTICAS DE STORAGE PARA BUCKET: ots-evidencias
-- ═══════════════════════════════════════════════════════
--
-- Este archivo configura las políticas de seguridad (RLS)
-- para el bucket de imágenes de OTs
--
-- ESTRUCTURA DE PATHS:
--   ots-evidencias/empresa-{id}/ot-{numero}/foto.jpg
--
-- EJEMPLO:
--   ots-evidencias/empresa-1/ot-OT-2024-001/antes-01.jpg
--
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- POLÍTICA 1: SELECT (Ver/Descargar archivos)
-- ───────────────────────────────────────────────────────

CREATE POLICY "select_ots_evidencias"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ots-evidencias'
  AND (
    -- Super admin ve TODO
    get_user_rol() = 'super_admin'
    -- Admin/Trabajador ven solo archivos de SU empresa
    OR (
      split_part(name, '/', 1) = 'empresa-' || get_user_empresa_id()::TEXT
    )
  )
);

-- ───────────────────────────────────────────────────────
-- POLÍTICA 2: INSERT (Subir archivos nuevos)
-- ───────────────────────────────────────────────────────

CREATE POLICY "insert_ots_evidencias"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ots-evidencias'
  AND (
    -- Super admin puede subir TODO
    get_user_rol() = 'super_admin'
    -- Admin/Trabajador pueden subir en carpeta de SU empresa
    OR (
      (get_user_rol() = 'admin' OR get_user_rol() = 'trabajador')
      AND split_part(name, '/', 1) = 'empresa-' || get_user_empresa_id()::TEXT
    )
  )
);

-- ───────────────────────────────────────────────────────
-- POLÍTICA 3: UPDATE (Actualizar/Reemplazar archivos)
-- ───────────────────────────────────────────────────────

CREATE POLICY "update_ots_evidencias"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ots-evidencias'
  AND (
    -- Super admin puede actualizar TODO
    get_user_rol() = 'super_admin'
    -- Solo Admin puede actualizar archivos de SU empresa
    OR (
      get_user_rol() = 'admin'
      AND split_part(name, '/', 1) = 'empresa-' || get_user_empresa_id()::TEXT
    )
  )
);

-- ───────────────────────────────────────────────────────
-- POLÍTICA 4: DELETE (Eliminar archivos)
-- ───────────────────────────────────────────────────────

CREATE POLICY "delete_ots_evidencias"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ots-evidencias'
  AND (
    -- Super admin puede eliminar TODO
    get_user_rol() = 'super_admin'
    -- Solo Admin puede eliminar archivos de SU empresa
    OR (
      get_user_rol() = 'admin'
      AND split_part(name, '/', 1) = 'empresa-' || get_user_empresa_id()::TEXT
    )
  )
);

-- ═══════════════════════════════════════════════════════
-- RESUMEN DE PERMISOS
-- ═══════════════════════════════════════════════════════
--
-- | ROL         | VER | SUBIR | ACTUALIZAR | ELIMINAR |
-- |-------------|-----|-------|------------|----------|
-- | super_admin | ✅  | ✅    | ✅         | ✅       |
-- | admin       | ✅* | ✅*   | ✅*        | ✅*      |
-- | trabajador  | ✅* | ✅*   | ❌         | ❌       |
--
-- * Solo para archivos de SU empresa
--
-- ═══════════════════════════════════════════════════════
--
-- EXPLICACIÓN DE split_part():
--
-- Si el path es: empresa-1/ot-001/foto.jpg
-- split_part(name, '/', 1) devuelve: 'empresa-1'
-- split_part(name, '/', 2) devuelve: 'ot-001'
-- split_part(name, '/', 3) devuelve: 'foto.jpg'
--
-- Entonces comparamos:
--   split_part(name, '/', 1) = 'empresa-' || get_user_empresa_id()::TEXT
--
-- Si el usuario tiene empresa_id = 1, entonces:
--   'empresa-1' = 'empresa-1' ✅ (acceso permitido)
--
-- ═══════════════════════════════════════════════════════
