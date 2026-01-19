-- ═══════════════════════════════════════════════════════
-- AUTENTICACIÓN: TABLA PERFILES (CON USERNAME)
-- ═══════════════════════════════════════════════════════
--
-- Esta tabla guarda información adicional de cada usuario
-- Se relaciona con auth.users (la tabla interna de Supabase)
--
-- IMPORTANTE: Usa sistema de USERNAME (no email visible)
-- - Email en Supabase: username@serbus.internal (ej: ntejeda@serbus.internal)
-- - Usuario ve solo: ntejeda
-- - La app convierte automáticamente entre username ↔ email
--
-- Instrucciones:
-- 1. Abre Supabase → SQL Editor
-- 2. Click en "New query"
-- 3. Copia TODO este archivo
-- 4. Pégalo en el editor
-- 5. Click en "Run"
--
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- TABLA: perfiles
-- ───────────────────────────────────────────────────────
CREATE TABLE perfiles (
  -- ID del usuario (UUID de auth.users)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Username para login (visible en UI)
  username TEXT UNIQUE NOT NULL,

  -- Datos personales
  nombre TEXT NOT NULL,

  -- Rol del usuario
  rol TEXT NOT NULL CHECK (rol IN ('super_admin', 'admin', 'trabajador')),

  -- Empresa a la que pertenece (NULL para super_admin)
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,

  -- Estado activo/inactivo
  activo BOOLEAN DEFAULT true,

  -- Metadatos adicionales (opcional)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Fechas
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE perfiles IS 'Información adicional de usuarios autenticados';
COMMENT ON COLUMN perfiles.id IS 'Mismo UUID que auth.users.id';
COMMENT ON COLUMN perfiles.username IS 'Username para login (ej: ntejeda). Email real es username@serbus.internal';
COMMENT ON COLUMN perfiles.nombre IS 'Nombre completo del usuario (ej: Nilton Tejeda)';
COMMENT ON COLUMN perfiles.rol IS 'super_admin: acceso total | admin: gestiona empresa | trabajador: solo lectura';
COMMENT ON COLUMN perfiles.empresa_id IS 'NULL para super_admin, obligatorio para admin/trabajador';

-- ───────────────────────────────────────────────────────
-- CONSTRAINT: Validar que admin/trabajador tenga empresa
-- ───────────────────────────────────────────────────────
ALTER TABLE perfiles ADD CONSTRAINT check_empresa_id
  CHECK (
    (rol = 'super_admin' AND empresa_id IS NULL) OR
    (rol IN ('admin', 'trabajador') AND empresa_id IS NOT NULL)
  );

COMMENT ON CONSTRAINT check_empresa_id ON perfiles IS 'super_admin no tiene empresa, admin/trabajador sí';

-- ───────────────────────────────────────────────────────
-- CONSTRAINT: Validar formato de username
-- ───────────────────────────────────────────────────────
ALTER TABLE perfiles ADD CONSTRAINT check_username_format
  CHECK (username ~ '^[a-z0-9_]{3,20}$');

COMMENT ON CONSTRAINT check_username_format ON perfiles IS 'Username: 3-20 caracteres, solo minúsculas, números y guión bajo';

-- ───────────────────────────────────────────────────────
-- ÍNDICES
-- ───────────────────────────────────────────────────────
CREATE INDEX idx_perfiles_empresa ON perfiles(empresa_id);
CREATE INDEX idx_perfiles_rol ON perfiles(rol);
CREATE INDEX idx_perfiles_username ON perfiles(username);

-- ───────────────────────────────────────────────────────
-- TRIGGER: Actualizar updated_at
-- ───────────────────────────────────────────────────────
CREATE TRIGGER update_perfiles_updated_at
  BEFORE UPDATE ON perfiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ───────────────────────────────────────────────────────
-- FUNCIÓN: Crear perfil automáticamente al registrarse
-- ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear perfil con datos del user_metadata
  INSERT INTO public.perfiles (id, username, nombre, rol, empresa_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'trabajador'),
    (NEW.raw_user_meta_data->>'empresa_id')::INTEGER
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user() IS 'Crea automáticamente un perfil cuando se registra un usuario. Extrae username del email (antes del @)';

-- Trigger: Ejecutar al crear usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ───────────────────────────────────────────────────────
-- FUNCIÓN HELPER: Convertir username a email
-- ───────────────────────────────────────────────────────
-- Esta función NO se usa en PostgreSQL, es para documentación
-- Úsala en tu código JavaScript:
--
-- const usernameToEmail = (username) => `${username.toLowerCase()}@serbus.internal`;
-- const emailToUsername = (email) => email.split('@')[0];

-- ═══════════════════════════════════════════════════════
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════
-- Esto lo configuraremos en detalle en la FASE 5
-- Por ahora solo lo habilitamos

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Política temporal: Los usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON perfiles
  FOR SELECT
  USING (auth.uid() = id);

-- ═══════════════════════════════════════════════════════
-- ✅ TABLA PERFILES CREADA CON SOPORTE PARA USERNAME
-- ═══════════════════════════════════════════════════════
--
-- Sistema implementado:
-- - Email en auth.users: username@serbus.internal
-- - Username visible: ntejeda, jperez, mgarcia, etc.
-- - UI muestra solo el username
-- - Backend maneja la conversión automáticamente
--
-- Siguiente paso:
-- 1. Verifica en Table Editor → perfiles
-- 2. Continúa con crear usuarios de prueba
--
-- ═══════════════════════════════════════════════════════
