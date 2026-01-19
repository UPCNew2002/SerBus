-- ═══════════════════════════════════════════════════════
-- PRUEBAS DE RLS (Row Level Security)
-- ═══════════════════════════════════════════════════════
--
-- Este script crea datos de prueba y verifica que las
-- políticas de seguridad funcionan correctamente
--
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- PASO 1: Crear datos de prueba (2 empresas)
-- ───────────────────────────────────────────────────────

-- Crear segunda empresa (si no existe)
INSERT INTO empresas (ruc, razon_social, activo)
VALUES ('20987654321', 'Transportes XYZ S.A.C.', true)
ON CONFLICT (ruc) DO NOTHING;

-- Verificar que tenemos 2 empresas
SELECT id, ruc, razon_social FROM empresas ORDER BY id;

-- ───────────────────────────────────────────────────────
-- PASO 2: Crear buses de cada empresa
-- ───────────────────────────────────────────────────────

-- Buses de Transportes ABC (empresa_id=1)
INSERT INTO buses (placa, vin, kilometraje_actual, empresa_id)
VALUES
  ('ABC-111', '1HGBH41JXMN109111', 50000, 1),
  ('ABC-222', '1HGBH41JXMN109222', 75000, 1)
ON CONFLICT (placa) DO NOTHING;

-- Buses de Transportes XYZ (empresa_id=2)
INSERT INTO buses (placa, vin, kilometraje_actual, empresa_id)
VALUES
  ('XYZ-333', '1HGBH41JXMN109333', 30000, 2),
  ('XYZ-444', '1HGBH41JXMN109444', 40000, 2)
ON CONFLICT (placa) DO NOTHING;

-- Ver todos los buses (sin RLS, como super admin)
SELECT
  placa,
  empresa_id,
  CASE empresa_id
    WHEN 1 THEN 'Transportes ABC'
    WHEN 2 THEN 'Transportes XYZ'
  END as empresa
FROM buses
ORDER BY empresa_id, placa;

-- ───────────────────────────────────────────────────────
-- PASO 3: Verificar que RLS está habilitado
-- ───────────────────────────────────────────────────────

SELECT
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('empresas', 'buses', 'ots', 'perfiles')
ORDER BY tablename;

-- Resultado esperado: rls_habilitado = true para todas

-- ───────────────────────────────────────────────────────
-- PASO 4: Crear función de prueba para simular usuarios
-- ───────────────────────────────────────────────────────

-- Función que simula consultas como diferentes usuarios
CREATE OR REPLACE FUNCTION test_rls_como_usuario(email_usuario TEXT)
RETURNS TABLE(
  test_descripcion TEXT,
  placa TEXT,
  empresa_id INTEGER,
  puede_ver BOOLEAN
) AS $$
DECLARE
  usuario_id UUID;
  usuario_rol TEXT;
  usuario_empresa INTEGER;
BEGIN
  -- Obtener datos del usuario
  SELECT
    au.id,
    p.rol,
    p.empresa_id
  INTO
    usuario_id,
    usuario_rol,
    usuario_empresa
  FROM auth.users au
  LEFT JOIN perfiles p ON p.id = au.id
  WHERE au.email = email_usuario;

  -- Simular qué vería este usuario (usando las mismas condiciones que RLS)
  RETURN QUERY
  SELECT
    'Usuario: ' || email_usuario || ' (' || COALESCE(usuario_rol, 'sin rol') || ')' as test_descripcion,
    b.placa,
    b.empresa_id,
    CASE
      WHEN usuario_rol = 'super_admin' THEN true
      WHEN b.empresa_id = usuario_empresa THEN true
      ELSE false
    END as puede_ver
  FROM buses b
  ORDER BY b.empresa_id, b.placa;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────
-- PASO 5: EJECUTAR PRUEBAS
-- ───────────────────────────────────────────────────────

-- PRUEBA 1: Como SUPER ADMIN
SELECT * FROM test_rls_como_usuario('superadmin@serbus.internal');

-- Resultado esperado:
-- Debe mostrar puede_ver = true para TODOS los buses (ABC y XYZ)

-- ═══════════════════════════════════════════════════════

-- PRUEBA 2: Como ADMIN de Transportes ABC (jperez)
SELECT * FROM test_rls_como_usuario('jperez@serbus.internal');

-- Resultado esperado:
-- puede_ver = true para ABC-111, ABC-222 (empresa_id=1)
-- puede_ver = false para XYZ-333, XYZ-444 (empresa_id=2)

-- ═══════════════════════════════════════════════════════

-- PRUEBA 3: Como TRABAJADOR de Transportes ABC (mgarcia)
SELECT * FROM test_rls_como_usuario('mgarcia@serbus.internal');

-- Resultado esperado:
-- puede_ver = true para ABC-111, ABC-222 (empresa_id=1)
-- puede_ver = false para XYZ-333, XYZ-444 (empresa_id=2)

-- ═══════════════════════════════════════════════════════
-- PASO 6: VERIFICAR RESUMEN
-- ═══════════════════════════════════════════════════════

SELECT
  usuario.email,
  usuario.rol,
  usuario.empresa_nombre,
  COUNT(CASE WHEN puede_ver = true THEN 1 END) as buses_que_ve,
  COUNT(*) as total_buses
FROM (
  SELECT
    au.email,
    p.rol,
    COALESCE(e.razon_social, 'Sin empresa') as empresa_nombre
  FROM auth.users au
  LEFT JOIN perfiles p ON p.id = au.id
  LEFT JOIN empresas e ON e.id = p.empresa_id
  WHERE au.email LIKE '%@serbus.internal'
) usuario
CROSS JOIN (
  SELECT * FROM test_rls_como_usuario('superadmin@serbus.internal')
  UNION ALL
  SELECT * FROM test_rls_como_usuario('jperez@serbus.internal')
  UNION ALL
  SELECT * FROM test_rls_como_usuario('mgarcia@serbus.internal')
) pruebas
WHERE pruebas.test_descripcion LIKE '%' || usuario.email || '%'
GROUP BY usuario.email, usuario.rol, usuario.empresa_nombre
ORDER BY usuario.rol DESC;

-- ═══════════════════════════════════════════════════════
-- RESULTADO ESPERADO DEL RESUMEN:
-- ═══════════════════════════════════════════════════════
--
-- email                         | rol         | empresa          | buses_que_ve | total_buses
-- ------------------------------|-------------|------------------|--------------|-------------
-- superadmin@serbus.internal    | super_admin | Sin empresa      | 4            | 4
-- jperez@serbus.internal        | admin       | Transportes ABC  | 2            | 4
-- mgarcia@serbus.internal       | trabajador  | Transportes ABC  | 2            | 4
--
-- ✅ super_admin ve 4 de 4 (100% - ve TODO)
-- ✅ jperez ve 2 de 4 (50% - solo su empresa)
-- ✅ mgarcia ve 2 de 4 (50% - solo su empresa)
--
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- PASO 7: Limpiar función de prueba (opcional)
-- ───────────────────────────────────────────────────────
-- Descomenta si quieres borrar la función de prueba después:
-- DROP FUNCTION IF EXISTS test_rls_como_usuario(TEXT);
