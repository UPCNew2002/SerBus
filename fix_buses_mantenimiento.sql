-- ═══════════════════════════════════════════════════════
-- FIX: Recrear función buses_necesitan_mantenimiento
-- ═══════════════════════════════════════════════════════

-- Eliminar todas las versiones de la función
DROP FUNCTION IF EXISTS buses_necesitan_mantenimiento(INTEGER);
DROP FUNCTION IF EXISTS buses_necesitan_mantenimiento;

-- Crear función con estructura correcta
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
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
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
$$;
