-- ═══════════════════════════════════════════════════════
-- MIGRATION: Agregar empresa_id a la tabla trabajos
-- ═══════════════════════════════════════════════════════
--
-- Descripción:
-- Los trabajos deben ser específicos de cada empresa, no globales.
-- Esta migración agrega el campo empresa_id y crea la relación con empresas.
--
-- Autor: Claude
-- Fecha: 2026-01-26
-- ═══════════════════════════════════════════════════════

-- 1. Agregar columna empresa_id (permitir NULL temporalmente)
ALTER TABLE trabajos
ADD COLUMN IF NOT EXISTS empresa_id INTEGER;

-- 2. Agregar comentario
COMMENT ON COLUMN trabajos.empresa_id IS 'ID de la empresa a la que pertenece este trabajo';

-- 3. Crear foreign key hacia empresas
ALTER TABLE trabajos
ADD CONSTRAINT trabajos_empresa_id_fkey
FOREIGN KEY (empresa_id)
REFERENCES empresas(id)
ON DELETE CASCADE;

-- 4. Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_trabajos_empresa_id ON trabajos(empresa_id);

-- ═══════════════════════════════════════════════════════
-- NOTA IMPORTANTE:
-- ═══════════════════════════════════════════════════════
-- Los trabajos existentes tendrán empresa_id = NULL.
-- Se recomienda asignarlos a una empresa o eliminarlos.
--
-- Para asignar todos los trabajos existentes a una empresa específica:
-- UPDATE trabajos SET empresa_id = 1 WHERE empresa_id IS NULL;
--
-- Para eliminar trabajos huérfanos:
-- DELETE FROM trabajos WHERE empresa_id IS NULL;
-- ═══════════════════════════════════════════════════════
