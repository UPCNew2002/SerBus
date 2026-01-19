-- ═══════════════════════════════════════════════════════
-- FIX NUCLEAR: Solución definitiva para loops RLS
-- ═══════════════════════════════════════════════════════
--
-- Este script elimina TODO y crea políticas ULTRA SIMPLES
-- sin posibilidad de loops circulares
--
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- PASO 1: DESACTIVAR RLS EN TODAS LAS TABLAS
-- ───────────────────────────────────────────────────────

ALTER TABLE perfiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE trabajos DISABLE ROW LEVEL SECURITY;
ALTER TABLE buses DISABLE ROW LEVEL SECURITY;
ALTER TABLE ots DISABLE ROW LEVEL SECURITY;
ALTER TABLE ots_trabajos DISABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────
-- PASO 2: ELIMINAR TODAS LAS POLÍTICAS
-- ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS "perfiles_select_policy" ON perfiles;
DROP POLICY IF EXISTS "perfiles_insert_policy" ON perfiles;
DROP POLICY IF EXISTS "perfiles_update_policy" ON perfiles;
DROP POLICY IF EXISTS "perfiles_delete_policy" ON perfiles;

DROP POLICY IF EXISTS "empresas_select_policy" ON empresas;
DROP POLICY IF EXISTS "empresas_insert_policy" ON empresas;
DROP POLICY IF EXISTS "empresas_update_policy" ON empresas;
DROP POLICY IF EXISTS "empresas_delete_policy" ON empresas;

DROP POLICY IF EXISTS "trabajos_select_policy" ON trabajos;
DROP POLICY IF EXISTS "trabajos_insert_policy" ON trabajos;
DROP POLICY IF EXISTS "trabajos_update_policy" ON trabajos;
DROP POLICY IF EXISTS "trabajos_delete_policy" ON trabajos;

DROP POLICY IF EXISTS "buses_select_policy" ON buses;
DROP POLICY IF EXISTS "buses_insert_policy" ON buses;
DROP POLICY IF EXISTS "buses_update_policy" ON buses;
DROP POLICY IF EXISTS "buses_delete_policy" ON buses;

DROP POLICY IF EXISTS "ots_select_policy" ON ots;
DROP POLICY IF EXISTS "ots_insert_policy" ON ots;
DROP POLICY IF EXISTS "ots_update_policy" ON ots;
DROP POLICY IF EXISTS "ots_delete_policy" ON ots;

DROP POLICY IF EXISTS "ots_trabajos_select_policy" ON ots_trabajos;
DROP POLICY IF EXISTS "ots_trabajos_insert_policy" ON ots_trabajos;
DROP POLICY IF EXISTS "ots_trabajos_update_policy" ON ots_trabajos;
DROP POLICY IF EXISTS "ots_trabajos_delete_policy" ON ots_trabajos;

DROP POLICY IF EXISTS "storage_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_policy" ON storage.objects;

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "select_perfiles" ON perfiles;
DROP POLICY IF EXISTS "insert_perfiles" ON perfiles;
DROP POLICY IF EXISTS "update_perfiles" ON perfiles;
DROP POLICY IF EXISTS "delete_perfiles" ON perfiles;

DROP POLICY IF EXISTS "select_empresas" ON empresas;
DROP POLICY IF EXISTS "insert_empresas" ON empresas;
DROP POLICY IF EXISTS "update_empresas" ON empresas;
DROP POLICY IF EXISTS "delete_empresas" ON empresas;

DROP POLICY IF EXISTS "select_trabajos" ON trabajos;
DROP POLICY IF EXISTS "insert_trabajos" ON trabajos;
DROP POLICY IF EXISTS "update_trabajos" ON trabajos;
DROP POLICY IF EXISTS "delete_trabajos" ON trabajos;

DROP POLICY IF EXISTS "select_buses" ON buses;
DROP POLICY IF EXISTS "insert_buses" ON buses;
DROP POLICY IF EXISTS "update_buses" ON buses;
DROP POLICY IF EXISTS "delete_buses" ON buses;

DROP POLICY IF EXISTS "select_ots" ON ots;
DROP POLICY IF EXISTS "insert_ots" ON ots;
DROP POLICY IF EXISTS "update_ots" ON ots;
DROP POLICY IF EXISTS "delete_ots" ON ots;

DROP POLICY IF EXISTS "select_ots_trabajos" ON ots_trabajos;
DROP POLICY IF EXISTS "insert_ots_trabajos" ON ots_trabajos;
DROP POLICY IF EXISTS "update_ots_trabajos" ON ots_trabajos;
DROP POLICY IF EXISTS "delete_ots_trabajos" ON ots_trabajos;

DROP POLICY IF EXISTS "select_ots_evidencias" ON storage.objects;
DROP POLICY IF EXISTS "insert_ots_evidencias" ON storage.objects;
DROP POLICY IF EXISTS "update_ots_evidencias" ON storage.objects;
DROP POLICY IF EXISTS "delete_ots_evidencias" ON storage.objects;

-- ───────────────────────────────────────────────────────
-- PASO 3: ELIMINAR FUNCIONES
-- ───────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS get_user_rol() CASCADE;
DROP FUNCTION IF EXISTS get_user_empresa_id() CASCADE;

-- ───────────────────────────────────────────────────────
-- PASO 4: HABILITAR RLS (solo en tablas que lo necesitan)
-- ───────────────────────────────────────────────────────

-- NO habilitamos RLS en perfiles y trabajos (acceso libre)
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ots_trabajos ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────
-- PASO 5: CREAR POLÍTICAS ULTRA SIMPLES
-- ───────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════
-- PERFILES: SIN RLS - Acceso libre (tabla no sensible)
-- ═══════════════════════════════════════════════════════
-- NO creamos políticas - RLS desactivado

-- ═══════════════════════════════════════════════════════
-- TRABAJOS: SIN RLS - Catálogo público
-- ═══════════════════════════════════════════════════════
-- NO creamos políticas - RLS desactivado

-- ═══════════════════════════════════════════════════════
-- EMPRESAS: RLS MUY SIMPLE
-- ═══════════════════════════════════════════════════════

-- Todos pueden leer empresas (por ahora)
CREATE POLICY "empresas_all_can_read"
ON empresas FOR SELECT
USING (true);

-- Solo usuarios autenticados pueden modificar
CREATE POLICY "empresas_auth_can_modify"
ON empresas FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════
-- BUSES: RLS MUY SIMPLE
-- ═══════════════════════════════════════════════════════

-- Todos los usuarios autenticados pueden leer buses
CREATE POLICY "buses_all_can_read"
ON buses FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Solo usuarios autenticados pueden modificar
CREATE POLICY "buses_auth_can_modify"
ON buses FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════
-- OTS: RLS MUY SIMPLE
-- ═══════════════════════════════════════════════════════

-- Todos los usuarios autenticados pueden leer OTs
CREATE POLICY "ots_all_can_read"
ON ots FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Solo usuarios autenticados pueden modificar
CREATE POLICY "ots_auth_can_modify"
ON ots FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════
-- OTS_TRABAJOS: RLS MUY SIMPLE
-- ═══════════════════════════════════════════════════════

-- Todos los usuarios autenticados pueden leer
CREATE POLICY "ots_trabajos_all_can_read"
ON ots_trabajos FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Solo usuarios autenticados pueden modificar
CREATE POLICY "ots_trabajos_auth_can_modify"
ON ots_trabajos FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════
-- STORAGE: RLS MUY SIMPLE
-- ═══════════════════════════════════════════════════════

-- Todos los usuarios autenticados pueden leer
CREATE POLICY "storage_all_can_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'ots-evidencias' AND auth.uid() IS NOT NULL);

-- Solo usuarios autenticados pueden subir
CREATE POLICY "storage_auth_can_upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ots-evidencias' AND auth.uid() IS NOT NULL);

-- Solo usuarios autenticados pueden modificar/eliminar
CREATE POLICY "storage_auth_can_modify"
ON storage.objects FOR ALL
USING (bucket_id = 'ots-evidencias' AND auth.uid() IS NOT NULL)
WITH CHECK (bucket_id = 'ots-evidencias' AND auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════
-- VERIFICAR
-- ═══════════════════════════════════════════════════════

-- Ver estado de RLS
SELECT
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('perfiles', 'empresas', 'trabajos', 'buses', 'ots', 'ots_trabajos')
ORDER BY tablename;

-- Ver políticas creadas
SELECT
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
ORDER BY tablename, policyname;

-- Probar lectura de perfiles
SELECT username, nombre, rol, empresa_id
FROM perfiles
ORDER BY username;

-- ═══════════════════════════════════════════════════════
-- RESULTADO ESPERADO
-- ═══════════════════════════════════════════════════════
--
-- RLS HABILITADO:
-- empresas      | true
-- buses         | true
-- ots           | true
-- ots_trabajos  | true
-- perfiles      | false  ← SIN RLS (acceso libre)
-- trabajos      | false  ← SIN RLS (catálogo público)
--
-- POLÍTICAS (12 total - muy simples):
-- - empresas: 2 políticas
-- - buses: 2 políticas
-- - ots: 2 políticas
-- - ots_trabajos: 2 políticas
-- - storage: 3 políticas
-- - perfiles: 0 políticas (sin RLS)
-- - trabajos: 0 políticas (sin RLS)
--
-- USUARIOS:
-- jperez     | Juan Pérez    | admin       | 1
-- mgarcia    | María García  | trabajador  | 1
-- superadmin | Super Admin   | super_admin | null
--
-- ═══════════════════════════════════════════════════════
