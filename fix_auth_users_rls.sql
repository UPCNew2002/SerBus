-- ═══════════════════════════════════════════════════════
-- FIX DEFINITIVO: DESACTIVAR RLS EN auth.users
-- ═══════════════════════════════════════════════════════
--
-- PROBLEMA IDENTIFICADO:
-- La tabla auth.users tiene RLS habilitado sin políticas,
-- lo que impide que Supabase Auth pueda leer usuarios
-- durante el proceso de login.
--
-- SOLUCIÓN:
-- Desactivar RLS en auth.users (tabla del sistema)
--
-- ═══════════════════════════════════════════════════════

-- DESACTIVAR RLS EN auth.users
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════
-- VERIFICACIÓN (ejecutar después del fix)
-- ═══════════════════════════════════════════════════════

-- Debe mostrar rls_habilitado = false
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'auth' AND tablename = 'users';

-- ═══════════════════════════════════════════════════════
-- ¿POR QUÉ ESTO SOLUCIONA EL PROBLEMA?
-- ═══════════════════════════════════════════════════════
--
-- 1. auth.users es una tabla INTERNA de Supabase
-- 2. Supabase Auth la maneja automáticamente
-- 3. NO debe tener RLS (las tablas del sistema no usan RLS)
-- 4. Con RLS desactivado, Supabase Auth puede leer usuarios
-- 5. El login funcionará correctamente
--
-- ═══════════════════════════════════════════════════════
