-- ═══════════════════════════════════════════════════════
-- SETUP COMPLETO SERBUS V2 - EJECUTAR TODO DE UNA VEZ
-- ═══════════════════════════════════════════════════════
--
-- Este script configura TODA la base de datos en una sola ejecución:
-- 1. Crear tablas
-- 2. Crear trigger para perfiles
-- 3. Crear usuarios de prueba
-- 4. Configurar RLS (SIN tocar auth.users)
-- 5. Crear bucket de storage
--
-- ═══════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────
-- PASO 1: CREAR TABLAS
-- ───────────────────────────────────────────────────────

-- Tabla empresas
CREATE TABLE empresas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  ruc VARCHAR(11) UNIQUE NOT NULL,
  direccion TEXT,
  telefono VARCHAR(15),
  email VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla perfiles
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('super_admin', 'admin', 'trabajador')),
  empresa_id INTEGER REFERENCES empresas(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla trabajos (catálogo global)
CREATE TABLE trabajos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla buses
CREATE TABLE buses (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  placa VARCHAR(7) UNIQUE NOT NULL,
  vin VARCHAR(17) UNIQUE NOT NULL,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  anio INTEGER,
  color VARCHAR(50),
  kilometraje_actual INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla ots (órdenes de trabajo)
CREATE TABLE ots (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  bus_id INTEGER NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  trabajador_id UUID REFERENCES perfiles(id),
  numero_ot VARCHAR(20) UNIQUE NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado', 'cancelado')),
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla ots_trabajos (relación muchos a muchos)
CREATE TABLE ots_trabajos (
  id SERIAL PRIMARY KEY,
  ot_id INTEGER NOT NULL REFERENCES ots(id) ON DELETE CASCADE,
  trabajo_id INTEGER NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ot_id, trabajo_id)
);

-- ───────────────────────────────────────────────────────
-- PASO 2: CREAR TRIGGER PARA AUTO-CREAR PERFILES
-- ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ───────────────────────────────────────────────────────
-- PASO 3: CREAR EMPRESA Y USUARIOS DE PRUEBA
-- ───────────────────────────────────────────────────────

-- Crear empresa de prueba
INSERT INTO empresas (nombre, ruc, direccion, telefono, email)
VALUES ('Transportes ABC', '20123456789', 'Av. Los Transportes 123, Lima', '987654321', 'contacto@transportesabc.com');

-- Crear usuarios (esto también creará perfiles por el trigger)
-- Super Admin (sin empresa)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  'ddd54e49-6b49-453f-b7b9-91817334271c'::UUID,
  'superadmin@serbus.internal',
  crypt('Super123!', gen_salt('bf')),
  NOW(),
  jsonb_build_object('username', 'superadmin', 'nombre', 'Super Administrador', 'rol', 'super_admin'),
  NOW(),
  NOW()
);

-- Admin de empresa 1
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '7c153740-6000-495f-a93e-994adbcd022a'::UUID,
  'jperez@serbus.internal',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  jsonb_build_object('username', 'jperez', 'nombre', 'Juan Pérez', 'rol', 'admin', 'empresa_id', 1),
  NOW(),
  NOW()
);

-- Trabajador de empresa 1
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  'c0ab9a3e-bed6-437f-ac4e-81ad85c115dd'::UUID,
  'mgarcia@serbus.internal',
  crypt('Trabajo123!', gen_salt('bf')),
  NOW(),
  jsonb_build_object('username', 'mgarcia', 'nombre', 'María García', 'rol', 'trabajador', 'empresa_id', 1),
  NOW(),
  NOW()
);

-- ───────────────────────────────────────────────────────
-- PASO 4: INSERTAR DATOS DE PRUEBA
-- ───────────────────────────────────────────────────────

-- Trabajos comunes
INSERT INTO trabajos (nombre, descripcion, categoria) VALUES
('Cambio de aceite', 'Cambio de aceite de motor', 'Mantenimiento'),
('Revisión de frenos', 'Inspección y ajuste del sistema de frenos', 'Mantenimiento'),
('Alineación y balanceo', 'Alineación de ruedas y balanceo de neumáticos', 'Mantenimiento'),
('Revisión de suspensión', 'Inspección del sistema de suspensión', 'Mantenimiento'),
('Cambio de filtros', 'Reemplazo de filtros de aire, aceite y combustible', 'Mantenimiento');

-- Buses de prueba
INSERT INTO buses (empresa_id, placa, vin, marca, modelo, anio, color, kilometraje_actual) VALUES
(1, 'ABC-123', '1HGBH41JXMN109186', 'Mercedes-Benz', 'OF-1721', 2020, 'Blanco', 45000),
(1, 'DEF-456', '2HGBH41JXMN109187', 'Volvo', 'B270F', 2019, 'Azul', 67000);

-- ───────────────────────────────────────────────────────
-- PASO 5: CONFIGURAR RLS (ROW LEVEL SECURITY)
-- ───────────────────────────────────────────────────────

-- ⚠️ IMPORTANTE: NO TOCAMOS auth.users (debe estar sin RLS)

-- RLS para empresas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresas_all_can_read"
ON empresas FOR SELECT
USING (true);

CREATE POLICY "empresas_auth_can_modify"
ON empresas FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS para buses
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "buses_all_can_read"
ON buses FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "buses_auth_can_modify"
ON buses FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS para ots
ALTER TABLE ots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ots_all_can_read"
ON ots FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "ots_auth_can_modify"
ON ots FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS para ots_trabajos
ALTER TABLE ots_trabajos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ots_trabajos_all_can_read"
ON ots_trabajos FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "ots_trabajos_auth_can_modify"
ON ots_trabajos FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- ⚠️ DEJAMOS perfiles y trabajos SIN RLS (acceso libre para usuarios autenticados)

-- ───────────────────────────────────────────────────────
-- PASO 6: CREAR BUCKET DE STORAGE
-- ───────────────────────────────────────────────────────

-- Crear bucket para fotos de OTs
INSERT INTO storage.buckets (id, name, public)
VALUES ('ot-fotos', 'ot-fotos', false);

-- Políticas para el bucket
CREATE POLICY "storage_all_can_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'ot-fotos' AND auth.uid() IS NOT NULL);

CREATE POLICY "storage_auth_can_upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ot-fotos' AND auth.uid() IS NOT NULL);

CREATE POLICY "storage_auth_can_modify"
ON storage.objects FOR ALL
USING (bucket_id = 'ot-fotos' AND auth.uid() IS NOT NULL)
WITH CHECK (bucket_id = 'ot-fotos' AND auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════
-- ✅ SETUP COMPLETADO
-- ═══════════════════════════════════════════════════════

SELECT '✅ Base de datos configurada correctamente' as resultado;
SELECT 'Usuarios creados: superadmin, jperez, mgarcia' as usuarios;
SELECT 'Empresa creada: Transportes ABC' as empresa;
SELECT 'Buses de prueba: 2' as buses;
SELECT 'Trabajos de prueba: 5' as trabajos;
