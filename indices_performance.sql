-- ═══════════════════════════════════════════════════════
-- ÍNDICES PARA OPTIMIZACIÓN DE PERFORMANCE
-- ═══════════════════════════════════════════════════════
-- Ejecutar estos índices en producción para mejorar
-- la velocidad de las queries más frecuentes
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- 1. ÍNDICES EN TABLA `ots`
-- ───────────────────────────────────────────────────────

-- Filtro por empresa (query más frecuente)
CREATE INDEX IF NOT EXISTS idx_ots_empresa_id
ON ots(empresa_id);

-- JOIN con buses
CREATE INDEX IF NOT EXISTS idx_ots_bus_id
ON ots(bus_id);

-- JOIN con trabajador
CREATE INDEX IF NOT EXISTS idx_ots_trabajador_id
ON ots(trabajador_id);

-- Filtro por estado
CREATE INDEX IF NOT EXISTS idx_ots_estado
ON ots(estado);

-- Ordenamiento por fecha (usado en lista de OTs)
CREATE INDEX IF NOT EXISTS idx_ots_fecha_inicio
ON ots(fecha_inicio DESC);

-- Índice compuesto para query común: empresa + fecha
CREATE INDEX IF NOT EXISTS idx_ots_empresa_fecha
ON ots(empresa_id, fecha_inicio DESC);

-- Índice compuesto para query común: empresa + estado
CREATE INDEX IF NOT EXISTS idx_ots_empresa_estado
ON ots(empresa_id, estado);

-- ───────────────────────────────────────────────────────
-- 2. ÍNDICES EN TABLA `buses`
-- ───────────────────────────────────────────────────────

-- Filtro por empresa
CREATE INDEX IF NOT EXISTS idx_buses_empresa_id
ON buses(empresa_id);

-- Búsqueda por placa (único y frecuente)
CREATE INDEX IF NOT EXISTS idx_buses_placa
ON buses(placa);

-- Filtro por activo
CREATE INDEX IF NOT EXISTS idx_buses_activo
ON buses(activo);

-- Índice compuesto para query común: empresa + activo
CREATE INDEX IF NOT EXISTS idx_buses_empresa_activo
ON buses(empresa_id, activo);

-- Búsqueda case-insensitive por placa (para búsquedas)
CREATE INDEX IF NOT EXISTS idx_buses_placa_lower
ON buses(LOWER(placa));

-- ───────────────────────────────────────────────────────
-- 3. ÍNDICES EN TABLA `ots_trabajos`
-- ───────────────────────────────────────────────────────

-- JOIN frecuente con ots
CREATE INDEX IF NOT EXISTS idx_ots_trabajos_ot_id
ON ots_trabajos(ot_id);

-- JOIN con trabajos
CREATE INDEX IF NOT EXISTS idx_ots_trabajos_trabajo_id
ON ots_trabajos(trabajo_id);

-- Índice compuesto para query de trabajos de una OT
CREATE INDEX IF NOT EXISTS idx_ots_trabajos_ot_trabajo
ON ots_trabajos(ot_id, trabajo_id);

-- ───────────────────────────────────────────────────────
-- 4. ÍNDICES EN TABLA `perfiles`
-- ───────────────────────────────────────────────────────

-- Búsqueda por username (login)
CREATE INDEX IF NOT EXISTS idx_perfiles_username
ON perfiles(username);

-- Búsqueda por email (login)
CREATE INDEX IF NOT EXISTS idx_perfiles_email
ON perfiles(email);

-- Filtro por empresa
CREATE INDEX IF NOT EXISTS idx_perfiles_empresa_id
ON perfiles(empresa_id);

-- Filtro por rol
CREATE INDEX IF NOT EXISTS idx_perfiles_rol
ON perfiles(rol);

-- ───────────────────────────────────────────────────────
-- 5. ÍNDICES EN TABLA `trabajos`
-- ───────────────────────────────────────────────────────

-- Ordenamiento por nombre
CREATE INDEX IF NOT EXISTS idx_trabajos_nombre
ON trabajos(nombre);

-- Búsqueda case-insensitive
CREATE INDEX IF NOT EXISTS idx_trabajos_nombre_lower
ON trabajos(LOWER(nombre));

-- ───────────────────────────────────────────────────────
-- 6. ÍNDICES PARA BÚSQUEDA FULL-TEXT (OPCIONAL)
-- ───────────────────────────────────────────────────────

-- Si necesitas búsqueda rápida en observaciones de OTs
-- (Descomenta si lo necesitas)
-- CREATE INDEX IF NOT EXISTS idx_ots_observaciones_gin
-- ON ots USING GIN (to_tsvector('spanish', observaciones));

-- ───────────────────────────────────────────────────────
-- 7. ANÁLISIS Y LIMPIEZA
-- ───────────────────────────────────────────────────────

-- Actualizar estadísticas de las tablas (ejecutar después de crear índices)
ANALYZE ots;
ANALYZE buses;
ANALYZE ots_trabajos;
ANALYZE perfiles;
ANALYZE trabajos;

-- ═══════════════════════════════════════════════════════
-- VERIFICAR ÍNDICES CREADOS
-- ═══════════════════════════════════════════════════════
-- Para ver todos los índices de una tabla:
-- SELECT * FROM pg_indexes WHERE tablename = 'ots';
--
-- Para ver el tamaño de los índices:
-- SELECT schemaname, tablename, indexname,
--        pg_size_pretty(pg_relation_size(indexrelid)) as size
-- FROM pg_stat_user_indexes
-- ORDER BY pg_relation_size(indexrelid) DESC;
