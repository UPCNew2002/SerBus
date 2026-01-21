-- ═══════════════════════════════════════════════════════
-- OPTIMIZACIONES DE QUERIES EXISTENTES
-- ═══════════════════════════════════════════════════════
-- Mejoras a las funciones RPC existentes para mejor performance
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- 1. OPTIMIZACIÓN: estadisticas_ots
-- ───────────────────────────────────────────────────────
-- Mejora: Usar CTE y evitar múltiples COUNT FILTER
CREATE OR REPLACE FUNCTION estadisticas_ots(p_empresa_id INTEGER)
RETURNS TABLE(
  total_ots BIGINT,
  ots_pendientes BIGINT,
  ots_en_proceso BIGINT,
  ots_completadas BIGINT,
  ots_canceladas BIGINT,
  tiempo_promedio_dias NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH ot_stats AS (
    SELECT
      estado,
      CASE
        WHEN fecha_fin IS NOT NULL
        THEN EXTRACT(DAY FROM (fecha_fin::TIMESTAMP - fecha_inicio::TIMESTAMP))
        ELSE EXTRACT(DAY FROM (CURRENT_DATE::TIMESTAMP - fecha_inicio::TIMESTAMP))
      END AS duracion_dias
    FROM ots
    WHERE empresa_id = p_empresa_id
  )
  SELECT
    COUNT(*)::BIGINT AS total,
    COUNT(*) FILTER (WHERE estado = 'pendiente')::BIGINT AS pendientes,
    COUNT(*) FILTER (WHERE estado = 'en_proceso')::BIGINT AS en_proceso,
    COUNT(*) FILTER (WHERE estado = 'completado')::BIGINT AS completadas,
    COUNT(*) FILTER (WHERE estado = 'cancelado')::BIGINT AS canceladas,
    COALESCE(AVG(duracion_dias), 0)::NUMERIC AS promedio_dias
  FROM ot_stats;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ───────────────────────────────────────────────────────
-- 2. OPTIMIZACIÓN: buses_necesitan_mantenimiento
-- ───────────────────────────────────────────────────────
-- Mejora: Calcular urgencia en SQL en lugar de repetir lógica
CREATE OR REPLACE FUNCTION buses_necesitan_mantenimiento(p_empresa_id INTEGER)
RETURNS TABLE(
  id INTEGER,
  placa VARCHAR,
  vin VARCHAR,
  marca VARCHAR,
  modelo VARCHAR,
  anio INTEGER,
  kilometraje_actual INTEGER,
  proximo_kilometraje INTEGER,
  km_restantes INTEGER,
  urgencia VARCHAR,
  proximo_trabajo VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.placa,
    b.vin,
    b.marca,
    b.modelo,
    b.anio,
    b.kilometraje_actual,
    ((b.kilometraje_actual / 10000 + 1) * 10000)::INTEGER AS proximo_kilometraje,
    (((b.kilometraje_actual / 10000 + 1) * 10000) - b.kilometraje_actual)::INTEGER AS km_restantes,
    CASE
      WHEN (((b.kilometraje_actual / 10000 + 1) * 10000) - b.kilometraje_actual) <= 500 THEN 'URGENTE'
      WHEN (((b.kilometraje_actual / 10000 + 1) * 10000) - b.kilometraje_actual) <= 1000 THEN 'PRÓXIMO'
      ELSE 'NORMAL'
    END AS urgencia,
    'Mantenimiento preventivo 10,000 km'::VARCHAR AS proximo_trabajo
  FROM buses b
  WHERE b.empresa_id = p_empresa_id
    AND b.activo = true
    AND (((b.kilometraje_actual / 10000 + 1) * 10000) - b.kilometraje_actual) <= 2000
  ORDER BY km_restantes ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ───────────────────────────────────────────────────────
-- 3. NUEVA FUNCIÓN: Obtener OTs con paginación
-- ───────────────────────────────────────────────────────
-- Para cargas grandes, usar paginación
CREATE OR REPLACE FUNCTION obtener_ots_paginadas(
  p_empresa_id INTEGER,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id INTEGER,
  numero_ot VARCHAR,
  fecha_inicio DATE,
  fecha_fin DATE,
  estado VARCHAR,
  observaciones TEXT,
  kilometraje INTEGER,
  bus_placa VARCHAR,
  bus_vin VARCHAR,
  trabajador_nombre VARCHAR,
  total_trabajos BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.numero_ot,
    o.fecha_inicio,
    o.fecha_fin,
    o.estado,
    o.observaciones,
    o.kilometraje,
    b.placa AS bus_placa,
    b.vin AS bus_vin,
    p.nombre AS trabajador_nombre,
    COUNT(ot.id)::BIGINT AS total_trabajos
  FROM ots o
  LEFT JOIN buses b ON o.bus_id = b.id
  LEFT JOIN perfiles p ON o.trabajador_id = p.id
  LEFT JOIN ots_trabajos ot ON o.id = ot.ot_id
  WHERE o.empresa_id = p_empresa_id
  GROUP BY o.id, b.placa, b.vin, p.nombre
  ORDER BY o.fecha_inicio DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ───────────────────────────────────────────────────────
-- 4. NUEVA FUNCIÓN: Búsqueda rápida de buses
-- ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION buscar_buses(
  p_empresa_id INTEGER,
  p_query VARCHAR
)
RETURNS TABLE(
  id INTEGER,
  placa VARCHAR,
  vin VARCHAR,
  marca VARCHAR,
  modelo VARCHAR,
  anio INTEGER,
  kilometraje_actual INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.placa,
    b.vin,
    b.marca,
    b.modelo,
    b.anio,
    b.kilometraje_actual
  FROM buses b
  WHERE b.empresa_id = p_empresa_id
    AND b.activo = true
    AND (
      LOWER(b.placa) LIKE LOWER('%' || p_query || '%')
      OR LOWER(b.marca) LIKE LOWER('%' || p_query || '%')
      OR LOWER(b.modelo) LIKE LOWER('%' || p_query || '%')
      OR LOWER(b.vin) LIKE LOWER('%' || p_query || '%')
    )
  ORDER BY b.placa
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ───────────────────────────────────────────────────────
-- 5. CONFIGURACIÓN DE PERFORMANCE
-- ───────────────────────────────────────────────────────

-- Aumentar trabajo de memoria para queries complejas
-- (Solo si tienes permisos de superusuario)
-- ALTER DATABASE postgres SET work_mem = '16MB';

-- Habilitar parallel query para tablas grandes
-- ALTER TABLE ots SET (parallel_workers = 4);
-- ALTER TABLE buses SET (parallel_workers = 2);

-- ═══════════════════════════════════════════════════════
-- VERIFICAR PERFORMANCE DE QUERIES
-- ═══════════════════════════════════════════════════════
-- Para analizar el plan de ejecución de una query:
-- EXPLAIN ANALYZE SELECT * FROM estadisticas_ots(1);
--
-- Para ver queries lentas:
-- SELECT query, mean_exec_time, calls
-- FROM pg_stat_statements
-- WHERE mean_exec_time > 100
-- ORDER BY mean_exec_time DESC
-- LIMIT 20;
