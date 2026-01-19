-- ═══════════════════════════════════════════════════════
-- DIAGNÓSTICO: Ver todas las políticas y funciones actuales
-- ═══════════════════════════════════════════════════════
--
-- Este script te muestra el estado actual de:
-- 1. Todas las políticas RLS
-- 2. Las funciones helper (get_user_rol, get_user_empresa_id)
-- 3. Si RLS está habilitado en cada tabla
--
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- 1. VER TODAS LAS POLÍTICAS ACTUALES
-- ───────────────────────────────────────────────────────

SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operacion,
  qual as condicion_using,
  with_check as condicion_with_check
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
ORDER BY tablename, policyname;

-- ───────────────────────────────────────────────────────
-- 2. VER SI LAS FUNCIONES HELPER EXISTEN
-- ───────────────────────────────────────────────────────

SELECT
  proname as nombre_funcion,
  prosrc as codigo_funcion
FROM pg_proc
WHERE proname IN ('get_user_rol', 'get_user_empresa_id')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ───────────────────────────────────────────────────────
-- 3. VER SI RLS ESTÁ HABILITADO
-- ───────────────────────────────────────────────────────

SELECT
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('perfiles', 'empresas', 'trabajos', 'buses', 'ots', 'ots_trabajos')
ORDER BY tablename;

-- ───────────────────────────────────────────────────────
-- 4. VERIFICAR USUARIOS
-- ───────────────────────────────────────────────────────

SELECT
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email LIKE '%@serbus.internal'
ORDER BY email;
