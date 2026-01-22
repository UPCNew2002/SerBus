-- ═══════════════════════════════════════════════════════
-- MIGRACIÓN: Agregar columna kilometraje a tabla ots
-- ═══════════════════════════════════════════════════════
--
-- INSTRUCCIONES:
-- 1. Abre el Dashboard de Supabase: https://supabase.com/dashboard
-- 2. Ve a tu proyecto
-- 3. Abre el SQL Editor
-- 4. Copia y pega este SQL
-- 5. Ejecuta la query
--
-- ═══════════════════════════════════════════════════════

-- Agregar columna kilometraje a la tabla ots
ALTER TABLE ots ADD COLUMN IF NOT EXISTS kilometraje INTEGER;

-- Comentario para documentar la columna
COMMENT ON COLUMN ots.kilometraje IS 'Kilometraje del bus al momento del mantenimiento';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ots' AND column_name = 'kilometraje';
