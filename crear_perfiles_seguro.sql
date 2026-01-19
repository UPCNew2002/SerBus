-- ═══════════════════════════════════════════════════════
-- CREAR PERFILES DE FORMA SEGURA
-- ═══════════════════════════════════════════════════════
--
-- PASO 1: Primero ejecuta esto para VER qué usuarios existen
-- ═══════════════════════════════════════════════════════

SELECT
  id,
  email,
  created_at,
  CASE
    WHEN email = 'superadmin@serbus.internal' THEN '✅ Listo para crear perfil'
    WHEN email = 'jperez@serbus.internal' THEN '✅ Listo para crear perfil'
    WHEN email = 'mgarcia@serbus.internal' THEN '✅ Listo para crear perfil'
    ELSE '⚠️ Email no esperado'
  END as estado
FROM auth.users
WHERE email LIKE '%@serbus.internal'
ORDER BY created_at DESC;

-- ═══════════════════════════════════════════════════════
-- PASO 2: Si ves los 3 usuarios arriba, ejecuta esto:
-- ═══════════════════════════════════════════════════════

-- Crear perfil para superadmin (SI EXISTE)
DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = 'superadmin@serbus.internal';

  IF user_id IS NOT NULL THEN
    INSERT INTO perfiles (id, username, nombre, rol, empresa_id, activo)
    VALUES (user_id, 'superadmin', 'Super Administrador', 'super_admin', NULL, true)
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Perfil de superadmin creado ✅';
  ELSE
    RAISE NOTICE 'Usuario superadmin@serbus.internal NO EXISTE ❌';
  END IF;
END $$;

-- Crear perfil para jperez (SI EXISTE)
DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = 'jperez@serbus.internal';

  IF user_id IS NOT NULL THEN
    INSERT INTO perfiles (id, username, nombre, rol, empresa_id, activo)
    VALUES (user_id, 'jperez', 'Juan Pérez', 'admin', 1, true)
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Perfil de jperez creado ✅';
  ELSE
    RAISE NOTICE 'Usuario jperez@serbus.internal NO EXISTE ❌';
  END IF;
END $$;

-- Crear perfil para mgarcia (SI EXISTE)
DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = 'mgarcia@serbus.internal';

  IF user_id IS NOT NULL THEN
    INSERT INTO perfiles (id, username, nombre, rol, empresa_id, activo)
    VALUES (user_id, 'mgarcia', 'María García', 'trabajador', 1, true)
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Perfil de mgarcia creado ✅';
  ELSE
    RAISE NOTICE 'Usuario mgarcia@serbus.internal NO EXISTE ❌';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════
-- PASO 3: Verificar que los perfiles se crearon
-- ═══════════════════════════════════════════════════════

SELECT
  au.email,
  p.username,
  p.nombre,
  p.rol,
  p.empresa_id,
  CASE
    WHEN p.id IS NULL THEN '❌ FALTA CREAR PERFIL'
    ELSE '✅ Perfil creado'
  END as estado
FROM auth.users au
LEFT JOIN perfiles p ON au.id = p.id
WHERE au.email LIKE '%@serbus.internal'
ORDER BY p.rol NULLS LAST;
