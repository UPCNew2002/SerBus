-- ═══════════════════════════════════════════════════════
-- ELIMINAR USUARIOS HUÉRFANOS (sin perfil)
-- ═══════════════════════════════════════════════════════
--
-- Ejecutar en: Supabase Dashboard > SQL Editor
--
-- Estos son los usuarios que existen en auth.users pero fueron
-- eliminados de la tabla perfiles, causando que no puedas reutilizar
-- sus emails/usernames
-- ═══════════════════════════════════════════════════════

-- 1. Ver usuarios huérfanos antes de eliminar
SELECT
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN perfiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- Resultado esperado: Los que tienen username NULL en tu tabla
-- - ctejeda@gmail.com
-- - atejeda@gmail.com
-- - agon@gmail.com
-- - jmartin@gmail.com
-- - jtejeda@gmail.com

-- 2. Eliminar usuarios huérfanos de auth.users
DELETE FROM auth.users
WHERE id IN (
  SELECT u.id
  FROM auth.users u
  LEFT JOIN perfiles p ON u.id = p.id
  WHERE p.id IS NULL
);

-- 3. Verificar que se eliminaron correctamente
SELECT
  u.id,
  u.email,
  p.username,
  p.nombre,
  p.rol
FROM auth.users u
LEFT JOIN perfiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Ahora deberías ver solo:
-- - abtejeda@gmail.com (Abigail Tejeda)
-- - htejeda@gmail.com (Hugo Tejeda)
-- - superadmin@gmail.com (Super Administrador)
-- - mgarcia@gmail.com (María García)
-- - jperez@gmail.com (Juan Pérez)

-- ═══════════════════════════════════════════════════════
-- DESPUÉS DE ESTO
-- ═══════════════════════════════════════════════════════

-- Ya podrás crear nuevos usuarios con esos emails:
-- - ctejeda@gmail.com
-- - atejeda@gmail.com
-- - agon@gmail.com
-- - jmartin@gmail.com
-- - jtejeda@gmail.com
