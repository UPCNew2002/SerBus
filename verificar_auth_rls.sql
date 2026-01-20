-- ═══════════════════════════════════════════════════════
-- VERIFICAR POLÍTICAS RLS EN SCHEMA AUTH
-- ═══════════════════════════════════════════════════════
-- El error podría estar en políticas que afectan auth.users

-- 1. Ver si auth.users tiene RLS habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'auth'
  AND tablename = 'users';

-- 2. Ver políticas en auth.users (SI existen)
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operacion,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE schemaname = 'auth';

-- 3. Ver si hay triggers en auth.users que puedan causar problemas
SELECT
  t.tgname as trigger_name,
  c.relname as tabla,
  p.proname as funcion_trigger,
  CASE t.tgtype::integer & 2
    WHEN 0 THEN 'AFTER'
    ELSE 'BEFORE'
  END as momento,
  CASE t.tgtype::integer & 66
    WHEN 2 THEN 'INSERT'
    WHEN 4 THEN 'DELETE'
    WHEN 8 THEN 'UPDATE'
    ELSE 'MULTIPLE'
  END as evento
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'auth'
  AND c.relname = 'users'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 4. Probar login directo (esto debe funcionar)
-- Esta consulta simula lo que hace signInWithPassword internamente
-- Si esto falla, el problema es de permisos

-- NOTA: No podemos ejecutar signInWithPassword desde SQL,
-- pero podemos verificar que el usuario existe
SELECT
  id,
  email,
  encrypted_password IS NOT NULL as tiene_password,
  email_confirmed_at IS NOT NULL as email_confirmado
FROM auth.users
WHERE email = 'jperez@serbus.internal';

-- ═══════════════════════════════════════════════════════
-- QUÉ BUSCAR:
-- ═══════════════════════════════════════════════════════
--
-- 1. auth.users NO debería tener RLS habilitado (es tabla del sistema)
-- 2. NO deberían existir políticas en schema auth
-- 3. El trigger handle_new_user debe estar en la lista
-- 4. El usuario jperez debe existir con password y email confirmado
--
-- Si hay políticas en auth.users, ESE es el problema
-- ═══════════════════════════════════════════════════════
