-- ═══════════════════════════════════════════════════════
-- AGREGAR CAMPO TEMA A TABLA EMPRESAS
-- ═══════════════════════════════════════════════════════
--
-- Este script agrega un campo JSONB para almacenar el tema
-- visual personalizado de cada empresa.
--
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- Agregar columna tema (JSONB)
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS tema JSONB DEFAULT NULL;

-- Comentario explicativo
COMMENT ON COLUMN empresas.tema IS 'Tema visual personalizado de la empresa (primary, accent, background, card, text)';

-- Verificar
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'empresas'
  AND column_name = 'tema';
