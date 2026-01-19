-- ═══════════════════════════════════════════════════════
-- CREAR PERFILES MANUALMENTE (VERSIÓN SIMPLE)
-- ═══════════════════════════════════════════════════════
--
-- IMPORTANTE: Primero crea los 3 usuarios en Authentication:
-- - superadmin@serbus.internal
-- - jperez@serbus.internal
-- - mgarcia@serbus.internal
--
-- DESPUÉS ejecuta este SQL
-- ═══════════════════════════════════════════════════════

-- 1. Perfil para superadmin
INSERT INTO perfiles (id, username, nombre, rol, empresa_id, activo)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'superadmin@serbus.internal'),
  'superadmin',
  'Super Administrador',
  'super_admin',
  NULL,
  true
);

-- 2. Perfil para jperez (admin)
INSERT INTO perfiles (id, username, nombre, rol, empresa_id, activo)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'jperez@serbus.internal'),
  'jperez',
  'Juan Pérez',
  'admin',
  1,
  true
);

-- 3. Perfil para mgarcia (trabajador)
INSERT INTO perfiles (id, username, nombre, rol, empresa_id, activo)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'mgarcia@serbus.internal'),
  'mgarcia',
  'María García',
  'trabajador',
  1,
  true
);

-- ═══════════════════════════════════════════════════════
-- VERIFICAR QUE SE CREARON CORRECTAMENTE
-- ═══════════════════════════════════════════════════════
SELECT
  au.email,
  p.username,
  p.nombre,
  p.rol,
  p.empresa_id,
  COALESCE(e.razon_social, 'Sin empresa') as empresa
FROM auth.users au
LEFT JOIN perfiles p ON au.id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE au.email LIKE '%@serbus.internal'
ORDER BY p.rol;
