-- ═══════════════════════════════════════════════════════
-- FUNCIONES PARA CRONOGRAMA DE MANTENIMIENTO
-- ═══════════════════════════════════════════════════════
--
-- Estas funciones se llaman desde React Native usando:
-- const { data } = await supabase.rpc('nombre_funcion', { parametros })
--
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- 1. GENERAR NÚMERO DE OT AUTOMÁTICO
-- ───────────────────────────────────────────────────────
-- Genera un número de OT único basado en año y secuencia
-- Ejemplo: OT-2026-0001, OT-2026-0002, etc.

CREATE OR REPLACE FUNCTION generar_numero_ot(p_empresa_id INTEGER)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_count INTEGER;
  v_numero_ot TEXT;
BEGIN
  -- Obtener año actual
  v_year := EXTRACT(YEAR FROM NOW())::TEXT;

  -- Contar OTs de este año para esta empresa
  SELECT COUNT(*) + 1
  INTO v_count
  FROM ots
  WHERE empresa_id = p_empresa_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

  -- Generar número con formato OT-YYYY-NNNN
  v_numero_ot := 'OT-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');

  RETURN v_numero_ot;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────
-- 2. CALCULAR PRÓXIMO MANTENIMIENTO
-- ───────────────────────────────────────────────────────
-- Calcula cuántos km faltan para el próximo mantenimiento
-- Asume mantenimiento cada 10,000 km

CREATE OR REPLACE FUNCTION calcular_proximo_mantenimiento(p_bus_id INTEGER)
RETURNS TABLE(
  bus_id INTEGER,
  placa VARCHAR,
  kilometraje_actual INTEGER,
  kilometraje_proximo_mantenimiento INTEGER,
  km_restantes INTEGER,
  necesita_mantenimiento BOOLEAN
) AS $$
DECLARE
  v_intervalo_km INTEGER := 10000; -- Mantenimiento cada 10,000 km
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.placa,
    b.kilometraje_actual,
    (CEIL(b.kilometraje_actual::FLOAT / v_intervalo_km) * v_intervalo_km)::INTEGER AS km_proximo,
    (CEIL(b.kilometraje_actual::FLOAT / v_intervalo_km) * v_intervalo_km - b.kilometraje_actual)::INTEGER AS km_faltantes,
    (b.kilometraje_actual % v_intervalo_km >= v_intervalo_km - 1000) AS necesita_mant
  FROM buses b
  WHERE b.id = p_bus_id AND b.activo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────
-- 3. LISTAR BUSES QUE NECESITAN MANTENIMIENTO
-- ───────────────────────────────────────────────────────
-- Devuelve buses que están a menos de 1000 km del próximo mantenimiento

CREATE OR REPLACE FUNCTION buses_necesitan_mantenimiento(p_empresa_id INTEGER)
RETURNS TABLE(
  bus_id INTEGER,
  placa VARCHAR,
  marca VARCHAR,
  modelo VARCHAR,
  kilometraje_actual INTEGER,
  km_proximo_mantenimiento INTEGER,
  km_restantes INTEGER,
  urgencia VARCHAR
) AS $$
DECLARE
  v_intervalo_km INTEGER := 10000;
  v_umbral_urgente INTEGER := 500;
  v_umbral_pronto INTEGER := 1000;
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.placa,
    b.marca,
    b.modelo,
    b.kilometraje_actual,
    (CEIL(b.kilometraje_actual::FLOAT / v_intervalo_km) * v_intervalo_km)::INTEGER AS km_proximo,
    (CEIL(b.kilometraje_actual::FLOAT / v_intervalo_km) * v_intervalo_km - b.kilometraje_actual)::INTEGER AS km_faltantes,
    CASE
      WHEN (CEIL(b.kilometraje_actual::FLOAT / v_intervalo_km) * v_intervalo_km - b.kilometraje_actual) <= v_umbral_urgente THEN 'URGENTE'
      WHEN (CEIL(b.kilometraje_actual::FLOAT / v_intervalo_km) * v_intervalo_km - b.kilometraje_actual) <= v_umbral_pronto THEN 'PRONTO'
      ELSE 'NORMAL'
    END AS urgencia
  FROM buses b
  WHERE b.empresa_id = p_empresa_id
    AND b.activo = true
    AND (CEIL(b.kilometraje_actual::FLOAT / v_intervalo_km) * v_intervalo_km - b.kilometraje_actual) <= v_umbral_pronto
  ORDER BY km_faltantes ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────
-- 4. OBTENER ESTADÍSTICAS DE OTs POR EMPRESA
-- ───────────────────────────────────────────────────────

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
  SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE estado = 'pendiente') AS pendientes,
    COUNT(*) FILTER (WHERE estado = 'en_proceso') AS en_proceso,
    COUNT(*) FILTER (WHERE estado = 'completado') AS completadas,
    COUNT(*) FILTER (WHERE estado = 'cancelado') AS canceladas,
    AVG(EXTRACT(DAY FROM (COALESCE(fecha_fin, CURRENT_DATE) - fecha_inicio))) AS promedio_dias
  FROM ots
  WHERE empresa_id = p_empresa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────
-- 5. OBTENER DETALLE COMPLETO DE UNA OT
-- ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION detalle_ot(p_ot_id INTEGER)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'ot', json_build_object(
      'id', o.id,
      'numero_ot', o.numero_ot,
      'fecha_inicio', o.fecha_inicio,
      'fecha_fin', o.fecha_fin,
      'estado', o.estado,
      'observaciones', o.observaciones
    ),
    'bus', json_build_object(
      'id', b.id,
      'placa', b.placa,
      'marca', b.marca,
      'modelo', b.modelo,
      'anio', b.anio,
      'kilometraje_actual', b.kilometraje_actual
    ),
    'trabajador', json_build_object(
      'id', p.id,
      'username', p.username,
      'nombre', p.nombre
    ),
    'trabajos', (
      SELECT json_agg(json_build_object(
        'id', t.id,
        'nombre', t.nombre,
        'descripcion', t.descripcion,
        'categoria', t.categoria,
        'estado', ot.estado,
        'notas', ot.notas
      ))
      FROM ots_trabajos ot
      JOIN trabajos t ON ot.trabajo_id = t.id
      WHERE ot.ot_id = o.id
    )
  )
  INTO v_result
  FROM ots o
  JOIN buses b ON o.bus_id = b.id
  LEFT JOIN perfiles p ON o.trabajador_id = p.id
  WHERE o.id = p_ot_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────
-- 6. HISTORIAL DE MANTENIMIENTO DE UN BUS
-- ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION historial_mantenimiento_bus(p_bus_id INTEGER)
RETURNS TABLE(
  ot_id INTEGER,
  numero_ot VARCHAR,
  fecha_inicio DATE,
  fecha_fin DATE,
  estado VARCHAR,
  trabajador_nombre VARCHAR,
  cantidad_trabajos BIGINT,
  dias_duracion INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.numero_ot,
    o.fecha_inicio,
    o.fecha_fin,
    o.estado,
    p.nombre,
    (SELECT COUNT(*) FROM ots_trabajos WHERE ot_id = o.id),
    EXTRACT(DAY FROM (COALESCE(o.fecha_fin, CURRENT_DATE) - o.fecha_inicio))::INTEGER
  FROM ots o
  LEFT JOIN perfiles p ON o.trabajador_id = p.id
  WHERE o.bus_id = p_bus_id
  ORDER BY o.fecha_inicio DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════
-- ✅ FUNCIONES CREADAS
-- ═══════════════════════════════════════════════════════

SELECT '✅ Funciones de cronograma creadas correctamente' as resultado;
SELECT 'Usa: supabase.rpc(''nombre_funcion'', { parametros })' as uso;
