-- ═══════════════════════════════════════════════════════
-- MIGRATION: Agregar columna 'tema' a la tabla empresas
-- ═══════════════════════════════════════════════════════
--
-- Descripción:
-- Agrega una columna JSONB para almacenar el tema personalizado
-- de cada empresa (colores, diseño, etc.)
--
-- Autor: Claude
-- Fecha: 2026-01-26
-- ═══════════════════════════════════════════════════════

-- Agregar columna tema (JSONB permite almacenar objetos JSON)
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS tema JSONB DEFAULT NULL;

-- Agregar comentario descriptivo
COMMENT ON COLUMN empresas.tema IS 'Tema visual personalizado de la empresa (colores y diseño)';

-- ═══════════════════════════════════════════════════════
-- ESTRUCTURA ESPERADA DEL CAMPO tema:
-- ═══════════════════════════════════════════════════════
--
-- {
--   "primary": "#dc2626",
--   "secondary": "#0a0a0a",
--   "accent": "#fbbf24",
--   "background": "#0f0f0f",
--   "backgroundLight": "#1e1e1e",
--   "card": "#1a1a1a",
--   "text": "#ffffff",
--   "textLight": "#e5e5e5",
--   "textMuted": "#888888",
--   "border": "#333333"
-- }
--
-- ═══════════════════════════════════════════════════════
