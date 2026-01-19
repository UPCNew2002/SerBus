-- ═══════════════════════════════════════════════════════
-- DIAGNÓSTICO COMPLETO: Encontrar el problema real
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- 1. VER ESTADO DE RLS EN TODAS LAS TABLAS
-- ───────────────────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename;

-- ───────────────────────────────────────────────────────
-- 2. VER TODAS LAS POLÍTICAS ACTUALES (DEBE ESTAR LIMPIO)
-- ───────────────────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operacion
FROM pg_policies
WHERE schemaname IN ('public', 'storage', 'auth')
ORDER BY schemaname, tablename, policyname;

-- ───────────────────────────────────────────────────────
-- 3. VER SI EXISTEN FUNCIONES PROBLEMÁTICAS
-- ───────────────────────────────────────────────────────
SELECT
  n.nspname as schema,
  p.proname as nombre_funcion,
  pg_get_functiondef(p.oid) as definicion
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'auth')
  AND (
    p.proname LIKE '%user%'
    OR p.proname LIKE '%perfil%'
    OR p.proname LIKE '%handle%'
  )
ORDER BY n.nspname, p.proname;

-- ───────────────────────────────────────────────────────
-- 4. VER TRIGGERS ACTIVOS (especialmente handle_new_user)
-- ───────────────────────────────────────────────────────
SELECT
  t.tgname as trigger_name,
  c.relname as tabla,
  n.nspname as schema,
  p.proname as funcion,
  pg_get_functiondef(p.oid) as codigo_funcion
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname IN ('auth', 'public')
  AND NOT t.tgisinternal
ORDER BY n.nspname, c.relname, t.tgname;

-- ───────────────────────────────────────────────────────
-- 5. VER USUARIOS EN auth.users
-- ───────────────────────────────────────────────────────
SELECT
  id,
  email,
  email_confirmed_at,
  encrypted_password IS NOT NULL as tiene_password,
  created_at
FROM auth.users
WHERE email LIKE '%serbus.internal%'
ORDER BY email;

-- ───────────────────────────────────────────────────────
-- 6. VER PERFILES EXISTENTES
-- ───────────────────────────────────────────────────────
SELECT
  id,
  username,
  nombre,
  rol,
  empresa_id,
  activo
FROM perfiles
ORDER BY username;

-- ───────────────────────────────────────────────────────
-- 7. VERIFICAR RELACIÓN ENTRE auth.users Y perfiles
-- ───────────────────────────────────────────────────────
SELECT
  u.email,
  p.username,
  p.nombre,
  p.rol,
  CASE
    WHEN u.id = p.id THEN '✅ MATCH'
    ELSE '❌ NO MATCH'
  END as estado_id
FROM auth.users u
FULL OUTER JOIN perfiles p ON u.id = p.id
WHERE u.email LIKE '%serbus.internal%' OR p.username IS NOT NULL
ORDER BY u.email, p.username;

-- ───────────────────────────────────────────────────────
-- 8. PROBAR ACCESO DIRECTO A PERFILES (sin RLS)
-- ───────────────────────────────────────────────────────
-- Esto debería funcionar porque RLS está desactivado
SELECT 'PRUEBA DIRECTA' as tipo, COUNT(*) as total_perfiles
FROM perfiles;

-- ═══════════════════════════════════════════════════════
-- QUÉ BUSCAR EN LOS RESULTADOS:
-- ═══════════════════════════════════════════════════════
--
-- 1. perfiles.rowsecurity debe ser FALSE
-- 2. trabajos.rowsecurity debe ser FALSE
-- 3. NO debe haber políticas en perfiles
-- 4. NO deben existir get_user_rol() ni get_user_empresa_id()
-- 5. Debe existir handle_new_user() trigger
-- 6. Debe haber usuarios en auth.users
-- 7. Debe haber perfiles con los mismos IDs
-- 8. La prueba directa debe retornar el conteo
--
-- ═══════════════════════════════════════════════════════
