-- ═══════════════════════════════════════════════════════
-- MIGRACIÓN: Agregar campo debe_cambiar_password
-- ═══════════════════════════════════════════════════════
--
-- Este script agrega el campo debe_cambiar_password a la tabla perfiles
-- para obligar a los usuarios a cambiar su contraseña en el primer login
--
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════════

-- 1. Agregar columna debe_cambiar_password
ALTER TABLE perfiles
ADD COLUMN IF NOT EXISTS debe_cambiar_password BOOLEAN DEFAULT true;

-- 2. Comentario para documentar el campo
COMMENT ON COLUMN perfiles.debe_cambiar_password IS
'Indica si el usuario debe cambiar su contraseña en el próximo login. Se establece en true al crear el usuario.';

-- 3. Actualizar perfiles existentes (opcional)
-- Si quieres que los usuarios existentes también cambien su contraseña, descomenta la siguiente línea:
-- UPDATE perfiles SET debe_cambiar_password = true WHERE debe_cambiar_password IS NULL;

-- 4. O si prefieres que los usuarios existentes NO tengan que cambiar contraseña:
UPDATE perfiles SET debe_cambiar_password = false WHERE debe_cambiar_password IS NULL;

-- ═══════════════════════════════════════════════════════
-- FIN DE LA MIGRACIÓN
-- ═══════════════════════════════════════════════════════
