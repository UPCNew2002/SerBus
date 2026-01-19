-- ═══════════════════════════════════════════════════════
-- CREAR USUARIOS Y PERFILES CON SQL (SIN ON CONFLICT)
-- ═══════════════════════════════════════════════════════
--
-- Este script crea los usuarios directamente en auth.users
-- y luego el trigger automático crea los perfiles
--
-- ═══════════════════════════════════════════════════════

-- Habilitar extensión para encriptación de passwords
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ───────────────────────────────────────────────────────
-- 1. CREAR USUARIO: superadmin
-- ───────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'superadmin@serbus.internal') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'superadmin@serbus.internal',
      crypt('SuperAdmin123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"superadmin","nombre":"Super Administrador","rol":"super_admin"}',
      NOW(),
      NOW(),
      '',
      ''
    );
    RAISE NOTICE '✅ Usuario superadmin creado';
  ELSE
    RAISE NOTICE '⚠️ Usuario superadmin ya existe';
  END IF;
END $$;

-- ───────────────────────────────────────────────────────
-- 2. CREAR USUARIO: jperez
-- ───────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jperez@serbus.internal') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'jperez@serbus.internal',
      crypt('Admin123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"jperez","nombre":"Juan Pérez","rol":"admin","empresa_id":"1"}',
      NOW(),
      NOW(),
      '',
      ''
    );
    RAISE NOTICE '✅ Usuario jperez creado';
  ELSE
    RAISE NOTICE '⚠️ Usuario jperez ya existe';
  END IF;
END $$;

-- ───────────────────────────────────────────────────────
-- 3. CREAR USUARIO: mgarcia
-- ───────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mgarcia@serbus.internal') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'mgarcia@serbus.internal',
      crypt('Trabajador123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"mgarcia","nombre":"María García","rol":"trabajador","empresa_id":"1"}',
      NOW(),
      NOW(),
      '',
      ''
    );
    RAISE NOTICE '✅ Usuario mgarcia creado';
  ELSE
    RAISE NOTICE '⚠️ Usuario mgarcia ya existe';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════
-- VERIFICAR QUE LOS USUARIOS SE CREARON
-- ═══════════════════════════════════════════════════════
SELECT
  id,
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data->>'username' as username,
  raw_user_meta_data->>'rol' as rol
FROM auth.users
WHERE email LIKE '%@serbus.internal'
ORDER BY created_at DESC;

-- ═══════════════════════════════════════════════════════
-- VERIFICAR QUE LOS PERFILES SE CREARON (por trigger)
-- ═══════════════════════════════════════════════════════
SELECT
  p.username,
  p.nombre,
  p.rol,
  p.empresa_id,
  au.email
FROM perfiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email LIKE '%@serbus.internal'
ORDER BY p.rol;
