-- ═══════════════════════════════════════════════════════
-- CÓMO ELIMINAR USUARIOS CORRECTAMENTE
-- ═══════════════════════════════════════════════════════
--
-- PROBLEMA:
-- Cuando eliminas usuarios de la tabla "perfiles", los usuarios
-- todavía existen en "auth.users", por lo que no puedes reutilizar
-- los mismos usernames/emails.
--
-- SOLUCIÓN:
-- Debes eliminar usuarios de AMBAS tablas: auth.users Y perfiles
--
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- OPCIÓN 1: Eliminar un usuario específico
-- ───────────────────────────────────────────────────────

-- Paso 1: Encontrar el ID del usuario
SELECT id, email, raw_user_meta_data->>'username' as username
FROM auth.users
WHERE raw_user_meta_data->>'username' = 'stejeda';  -- Reemplaza con el username

-- Paso 2: Eliminar de perfiles (copia el ID del paso 1)
DELETE FROM perfiles WHERE id = '5ccd9d58-34e9-42e9-b23b-87db4b75aaf2';

-- Paso 3: Eliminar de auth.users (usa el mismo ID)
DELETE FROM auth.users WHERE id = '5ccd9d58-34e9-42e9-b23b-87db4b75aaf2';

-- ───────────────────────────────────────────────────────
-- OPCIÓN 2: Eliminar TODOS los usuarios de prueba
-- ───────────────────────────────────────────────────────

-- Ver todos los usuarios de prueba (emails que terminan en @gmail.com)
SELECT
  u.id,
  u.email,
  u.created_at,
  p.username,
  p.nombre,
  p.rol
FROM auth.users u
LEFT JOIN perfiles p ON u.id = p.id
WHERE u.email LIKE '%@gmail.com'
ORDER BY u.created_at DESC;

-- CUIDADO: Esto eliminará TODOS los usuarios con emails @gmail.com
-- Ejecuta solo si estás seguro

-- Eliminar de perfiles primero
DELETE FROM perfiles
WHERE id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@gmail.com'
);

-- Luego eliminar de auth.users
DELETE FROM auth.users WHERE email LIKE '%@gmail.com';

-- ───────────────────────────────────────────────────────
-- OPCIÓN 3: Crear función para eliminar usuario
-- (Recomendado para producción)
-- ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION eliminar_usuario_completo(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Eliminar de perfiles
  DELETE FROM perfiles WHERE id = user_id;

  -- Eliminar de auth.users
  DELETE FROM auth.users WHERE id = user_id;

  RAISE NOTICE 'Usuario % eliminado correctamente', user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Uso:
-- SELECT eliminar_usuario_completo('5ccd9d58-34e9-42e9-b23b-87db4b75aaf2');

-- ═══════════════════════════════════════════════════════
-- IMPORTANTE: MANTENER LIMPIEZA
-- ═══════════════════════════════════════════════════════

-- Si quieres mantener solo los usuarios válidos (superadmin y usuarios de empresas reales):
-- 1. Conservar superadmin
-- 2. Conservar usuarios con empresa_id válido
-- 3. Eliminar el resto

-- Ver usuarios huérfanos (sin empresa válida, excepto superadmin)
SELECT
  p.id,
  p.username,
  p.nombre,
  p.rol,
  p.empresa_id,
  u.email
FROM perfiles p
JOIN auth.users u ON p.id = u.id
WHERE p.empresa_id IS NULL
  AND p.rol != 'super_admin'
  OR (p.empresa_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM empresas e WHERE e.id = p.empresa_id
  ));

-- Eliminar usuarios huérfanos
DELETE FROM perfiles
WHERE id IN (
  SELECT p.id
  FROM perfiles p
  WHERE p.empresa_id IS NULL AND p.rol != 'super_admin'
     OR (p.empresa_id IS NOT NULL AND NOT EXISTS (
       SELECT 1 FROM empresas e WHERE e.id = p.empresa_id
     ))
);

DELETE FROM auth.users
WHERE id IN (
  SELECT u.id
  FROM auth.users u
  LEFT JOIN perfiles p ON u.id = p.id
  WHERE p.id IS NULL
);
