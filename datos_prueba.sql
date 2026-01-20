-- ═══════════════════════════════════════════════════════
-- DATOS DE PRUEBA PARA SERBUS
-- ═══════════════════════════════════════════════════════
-- Este script inserta datos de ejemplo para poder probar
-- todas las funcionalidades de la aplicación
-- ═══════════════════════════════════════════════════════

-- Limpiar datos anteriores
DELETE FROM ots_trabajos;
DELETE FROM ots;
DELETE FROM buses WHERE empresa_id = 1;
DELETE FROM trabajos;

-- ───────────────────────────────────────────────────────
-- 1. TRABAJOS (CATÁLOGO)
-- ───────────────────────────────────────────────────────

INSERT INTO trabajos (nombre, descripcion, categoria)
VALUES
  ('Cambio de aceite', 'Cambio de aceite de motor y filtro', 'Mantenimiento'),
  ('Cambio de filtros', 'Cambio de filtros de aire, aceite y combustible', 'Mantenimiento'),
  ('Revisión de frenos', 'Inspección y ajuste del sistema de frenos', 'Seguridad'),
  ('Alineación y balanceo', 'Alineación de dirección y balanceo de neumáticos', 'Mantenimiento'),
  ('Cambio de batería', 'Reemplazo de batería', 'Eléctrico'),
  ('Reparación de motor', 'Reparación general de motor', 'Reparación'),
  ('Cambio de neumáticos', 'Reemplazo de neumáticos gastados', 'Mantenimiento'),
  ('Revisión eléctrica', 'Diagnóstico del sistema eléctrico', 'Eléctrico'),
  ('Limpieza profunda', 'Limpieza interior y exterior completa', 'Limpieza'),
  ('Revisión de suspensión', 'Inspección de amortiguadores y suspensión', 'Seguridad');

-- ───────────────────────────────────────────────────────
-- 2. BUSES DE TRANSPORTES ABC (empresa_id = 1)
-- ───────────────────────────────────────────────────────

INSERT INTO buses (placa, marca, modelo, anio, kilometraje_actual, empresa_id)
VALUES
  -- Buses URGENTES (menos de 500 km para mantenimiento)
  ('ABC-101', 'Mercedes-Benz', 'OF-1721', 2018, 49700, 1),  -- Faltan 300 km
  ('ABC-102', 'Volvo', 'B7R', 2019, 59800, 1),              -- Faltan 200 km

  -- Buses PRÓXIMOS (500-1000 km para mantenimiento)
  ('ABC-103', 'Scania', 'K380', 2020, 49200, 1),            -- Faltan 800 km
  ('ABC-104', 'Mercedes-Benz', 'LO-916', 2017, 39500, 1),   -- Faltan 500 km

  -- Buses NORMALES (más de 1000 km)
  ('ABC-105', 'Volvo', 'B9R', 2021, 25000, 1),              -- Faltan 5000 km
  ('ABC-106', 'Scania', 'K124', 2016, 42000, 1),            -- Faltan 8000 km
  ('ABC-107', 'Mercedes-Benz', 'OF-1724', 2019, 15000, 1),  -- Faltan 5000 km
  ('ABC-108', 'Volvo', 'B12R', 2022, 8000, 1),              -- Faltan 2000 km

  -- Buses recién mantenidos
  ('ABC-109', 'Scania', 'K410', 2023, 1500, 1),             -- Faltan 8500 km
  ('ABC-110', 'Mercedes-Benz', 'OF-1726', 2023, 500, 1);    -- Faltan 9500 km

-- ───────────────────────────────────────────────────────
-- 3. OTs DE EJEMPLO
-- ───────────────────────────────────────────────────────

-- OT completada (para estadísticas)
INSERT INTO ots (numero_ot, empresa_id, bus_id, trabajador_id, fecha_inicio, fecha_fin, estado, observaciones)
SELECT
  'OT-2026-0001',
  1,
  b.id,
  p.id,
  '2026-01-15',
  '2026-01-16',
  'completado',
  'Mantenimiento preventivo de 10,000 km completado exitosamente'
FROM buses b
CROSS JOIN perfiles p
WHERE b.placa = 'ABC-110'
  AND p.username = 'mgarcia'
LIMIT 1;

-- Agregar trabajos a la OT completada
INSERT INTO ots_trabajos (ot_id, trabajo_id, estado, notas)
SELECT
  o.id,
  t.id,
  'completado',
  'Trabajo realizado correctamente'
FROM ots o
CROSS JOIN trabajos t
WHERE o.numero_ot = 'OT-2026-0001'
  AND t.nombre IN ('Cambio de aceite', 'Cambio de filtros', 'Revisión de frenos');

-- OT en proceso (para estadísticas)
INSERT INTO ots (numero_ot, empresa_id, bus_id, trabajador_id, fecha_inicio, estado, observaciones)
SELECT
  'OT-2026-0002',
  1,
  b.id,
  p.id,
  '2026-01-20',
  'en_proceso',
  'Revisión general en progreso'
FROM buses b
CROSS JOIN perfiles p
WHERE b.placa = 'ABC-109'
  AND p.username = 'mgarcia'
LIMIT 1;

-- Agregar trabajos a la OT en proceso
INSERT INTO ots_trabajos (ot_id, trabajo_id, estado, notas)
SELECT
  o.id,
  t.id,
  'pendiente',
  'En ejecución'
FROM ots o
CROSS JOIN trabajos t
WHERE o.numero_ot = 'OT-2026-0002'
  AND t.nombre IN ('Alineación y balanceo', 'Revisión de suspensión');

-- OT pendiente (para estadísticas)
INSERT INTO ots (numero_ot, empresa_id, bus_id, trabajador_id, fecha_inicio, estado, observaciones)
SELECT
  'OT-2026-0003',
  1,
  b.id,
  p.id,
  '2026-01-21',
  'pendiente',
  'Mantenimiento programado'
FROM buses b
CROSS JOIN perfiles p
WHERE b.placa = 'ABC-101'
  AND p.username = 'jperez'
LIMIT 1;

-- Agregar trabajos a la OT pendiente
INSERT INTO ots_trabajos (ot_id, trabajo_id, estado, notas)
SELECT
  o.id,
  t.id,
  'pendiente',
  'Programado'
FROM ots o
CROSS JOIN trabajos t
WHERE o.numero_ot = 'OT-2026-0003'
  AND t.nombre IN ('Cambio de aceite', 'Cambio de filtros');

-- ═══════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ═══════════════════════════════════════════════════════

SELECT '✅ Datos de prueba creados correctamente' as resultado;

-- Mostrar resumen
SELECT
  'RESUMEN DE DATOS CREADOS' as titulo,
  (SELECT COUNT(*) FROM trabajos) as trabajos_catalogo,
  (SELECT COUNT(*) FROM buses WHERE empresa_id = 1) as buses_transportes_abc,
  (SELECT COUNT(*) FROM ots WHERE empresa_id = 1) as ots_creadas;

-- Mostrar buses urgentes
SELECT
  '🚨 BUSES CON MANTENIMIENTO URGENTE' as titulo,
  placa,
  marca,
  modelo,
  kilometraje_actual,
  (10000 - (kilometraje_actual % 10000)) as km_restantes
FROM buses
WHERE empresa_id = 1
  AND (10000 - (kilometraje_actual % 10000)) <= 1000
ORDER BY km_restantes;
