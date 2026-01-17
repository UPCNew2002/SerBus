-- ═══════════════════════════════════════════════════════
-- SCHEMA DE BASE DE DATOS - SERBUS
-- ═══════════════════════════════════════════════════════
--
-- Instrucciones:
-- 1. Abre Supabase → SQL Editor
-- 2. Click en "New query"
-- 3. Copia TODO este archivo
-- 4. Pégalo en el editor
-- 5. Click en "Run" (botón verde)
--
-- ═══════════════════════════════════════════════════════

-- Limpiar tablas existentes (solo si estás re-creando)
-- ⚠️ CUIDADO: Esto borra TODOS los datos
-- Descomenta solo si quieres empezar de cero

-- DROP TABLE IF EXISTS ots_trabajos CASCADE;
-- DROP TABLE IF EXISTS ots CASCADE;
-- DROP TABLE IF EXISTS buses CASCADE;
-- DROP TABLE IF EXISTS trabajos CASCADE;
-- DROP TABLE IF EXISTS empresas CASCADE;

-- ═══════════════════════════════════════════════════════
-- TABLA 1: EMPRESAS (Multi-tenant)
-- ═══════════════════════════════════════════════════════
CREATE TABLE empresas (
  id SERIAL PRIMARY KEY,
  ruc VARCHAR(11) NOT NULL UNIQUE,
  razon_social TEXT NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  activo BOOLEAN DEFAULT true,

  -- Tema personalizado (colores de la app)
  tema JSONB DEFAULT '{
    "primary": "#dc2626",
    "secondary": "#1e3a8a",
    "accent": "#f59e0b",
    "background": "#f3f4f6",
    "card": "#ffffff",
    "text": "#111827",
    "textLight": "#6b7280",
    "textMuted": "#9ca3af",
    "border": "#e5e7eb",
    "metal": "#71717a",
    "statusOk": "#22c55e",
    "statusWarning": "#f59e0b",
    "statusDanger": "#dc2626",
    "primaryDark": "#991b1b",
    "backgroundLight": "#fafafa"
  }'::jsonb,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE empresas IS 'Empresas de transporte (multi-tenant)';
COMMENT ON COLUMN empresas.tema IS 'Colores personalizados de la app por empresa';

-- ═══════════════════════════════════════════════════════
-- TABLA 2: TRABAJOS (Tipos de mantenimiento)
-- ═══════════════════════════════════════════════════════
CREATE TABLE trabajos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  entra_cronograma BOOLEAN DEFAULT false,
  intervalo_dias INTEGER,
  intervalo_km INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE trabajos IS 'Tipos de trabajos de mantenimiento';
COMMENT ON COLUMN trabajos.entra_cronograma IS 'Si true, este trabajo tiene mantenimiento programado';
COMMENT ON COLUMN trabajos.intervalo_dias IS 'Cada cuántos días se repite (NULL si no aplica)';
COMMENT ON COLUMN trabajos.intervalo_km IS 'Cada cuántos km se repite (NULL si no aplica)';

-- ═══════════════════════════════════════════════════════
-- TABLA 3: BUSES (Vehículos)
-- ═══════════════════════════════════════════════════════
CREATE TABLE buses (
  id SERIAL PRIMARY KEY,
  placa VARCHAR(10) NOT NULL UNIQUE,
  vin VARCHAR(17) NOT NULL UNIQUE,
  kilometraje_actual INTEGER DEFAULT 0,

  -- Relación con empresa
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE buses IS 'Vehículos de cada empresa';
COMMENT ON COLUMN buses.vin IS 'Vehicle Identification Number (17 caracteres)';
COMMENT ON COLUMN buses.kilometraje_actual IS 'Kilometraje actual del vehículo';

-- ═══════════════════════════════════════════════════════
-- TABLA 4: OTS (Órdenes de Trabajo)
-- ═══════════════════════════════════════════════════════
CREATE TABLE ots (
  id SERIAL PRIMARY KEY,
  numero_ot VARCHAR(50) NOT NULL UNIQUE,
  fecha DATE NOT NULL,

  -- Relación con bus
  bus_id INTEGER NOT NULL REFERENCES buses(id) ON DELETE CASCADE,

  kilometraje INTEGER,
  servicios TEXT NOT NULL,

  -- Precios
  precio_servicios DECIMAL(10,2) DEFAULT 0,
  precio_productos DECIMAL(10,2) DEFAULT 0,
  precio_total DECIMAL(10,2) GENERATED ALWAYS AS (precio_servicios + precio_productos) STORED,

  -- Productos usados (JSON)
  productos JSONB DEFAULT '[]'::jsonb,

  -- Evidencia (foto)
  evidencia_url TEXT,

  -- Relación con empresa
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,

  -- Usuario que creó la OT (se agregará después de configurar Auth)
  -- usuario_id UUID REFERENCES auth.users(id),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE ots IS 'Órdenes de trabajo del taller';
COMMENT ON COLUMN ots.numero_ot IS 'Número único de la OT (ej: OT-2024-001)';
COMMENT ON COLUMN ots.precio_total IS 'Auto-calculado (precio_servicios + precio_productos)';
COMMENT ON COLUMN ots.productos IS 'Array de productos: [{nombre, cantidad, precio}, ...]';
COMMENT ON COLUMN ots.evidencia_url IS 'URL de la foto en Supabase Storage';

-- ═══════════════════════════════════════════════════════
-- TABLA 5: OTS_TRABAJOS (Relación muchos a muchos)
-- ═══════════════════════════════════════════════════════
CREATE TABLE ots_trabajos (
  id SERIAL PRIMARY KEY,
  ot_id INTEGER NOT NULL REFERENCES ots(id) ON DELETE CASCADE,
  trabajo_id INTEGER NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),

  -- No permitir duplicados (misma OT + mismo trabajo)
  UNIQUE(ot_id, trabajo_id)
);

COMMENT ON TABLE ots_trabajos IS 'Relación entre OTs y trabajos (una OT puede tener varios trabajos)';

-- ═══════════════════════════════════════════════════════
-- ÍNDICES (Para búsquedas rápidas)
-- ═══════════════════════════════════════════════════════
CREATE INDEX idx_buses_empresa ON buses(empresa_id);
CREATE INDEX idx_buses_placa ON buses(placa);

CREATE INDEX idx_ots_empresa ON ots(empresa_id);
CREATE INDEX idx_ots_bus ON ots(bus_id);
CREATE INDEX idx_ots_fecha ON ots(fecha DESC);
CREATE INDEX idx_ots_numero ON ots(numero_ot);

CREATE INDEX idx_ots_trabajos_ot ON ots_trabajos(ot_id);
CREATE INDEX idx_ots_trabajos_trabajo ON ots_trabajos(trabajo_id);

-- ═══════════════════════════════════════════════════════
-- TRIGGER: Actualizar updated_at automáticamente
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas con updated_at
CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buses_updated_at
  BEFORE UPDATE ON buses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ots_updated_at
  BEFORE UPDATE ON ots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════
-- TRIGGER: Actualizar kilometraje del bus automáticamente
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION actualizar_kilometraje_bus()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la nueva OT tiene kilometraje, actualizar el bus
  IF NEW.kilometraje IS NOT NULL THEN
    UPDATE buses
    SET kilometraje_actual = NEW.kilometraje
    WHERE id = NEW.bus_id
      AND (kilometraje_actual IS NULL OR kilometraje_actual < NEW.kilometraje);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_kilometraje_bus
  AFTER INSERT OR UPDATE ON ots
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_kilometraje_bus();

COMMENT ON FUNCTION actualizar_kilometraje_bus() IS 'Actualiza el kilometraje del bus cuando se crea/edita una OT';

-- ═══════════════════════════════════════════════════════
-- DATOS DE PRUEBA (Opcional - para empezar a probar)
-- ═══════════════════════════════════════════════════════
-- Descomenta si quieres datos de ejemplo

/*
-- Empresa de prueba
INSERT INTO empresas (ruc, razon_social, telefono, direccion) VALUES
('20123456789', 'Transportes ABC S.A.C.', '987654321', 'Av. Principal 123, Lima');

-- Trabajos de prueba
INSERT INTO trabajos (nombre, entra_cronograma, intervalo_dias, intervalo_km) VALUES
('Cambio de Aceite', true, 90, 5000),
('Revisión de Frenos', true, 180, NULL),
('Cambio de Filtro de Aire', true, 90, NULL),
('Cambio de Arrancador', false, NULL, NULL),
('Limpieza de Inyectores', true, 180, 10000);

-- Buses de prueba (empresa_id=1)
INSERT INTO buses (placa, vin, kilometraje_actual, empresa_id) VALUES
('ABC-123', '1HGBH41JXMN109186', 50000, 1),
('ABC-456', '2HGBH41JXMN109187', 75000, 1),
('ABC-789', '3HGBH41JXMN109188', 30000, 1);

-- OT de prueba
INSERT INTO ots (
  numero_ot,
  fecha,
  bus_id,
  kilometraje,
  servicios,
  precio_servicios,
  precio_productos,
  productos,
  empresa_id
) VALUES (
  'OT-2026-001',
  '2026-01-17',
  1,
  51000,
  'Cambio de aceite completo, revisión de frenos delanteros',
  250.00,
  180.50,
  '[
    {"nombre": "Aceite 15W40", "cantidad": 5, "precio": 25.00},
    {"nombre": "Filtro de aceite", "cantidad": 1, "precio": 35.50},
    {"nombre": "Pastillas de freno", "cantidad": 4, "precio": 30.00}
  ]'::jsonb,
  1
);

-- Relacionar trabajos con la OT
INSERT INTO ots_trabajos (ot_id, trabajo_id) VALUES
(1, 1),  -- Cambio de Aceite
(1, 2);  -- Revisión de Frenos
*/

-- ═══════════════════════════════════════════════════════
-- ✅ SCHEMA CREADO EXITOSAMENTE
-- ═══════════════════════════════════════════════════════
--
-- Siguiente paso:
-- 1. Verifica que las tablas se crearon: Table Editor → public
-- 2. Deberías ver: empresas, trabajos, buses, ots, ots_trabajos
-- 3. Continúa con la FASE 4 (Configurar autenticación)
--
-- ═══════════════════════════════════════════════════════
