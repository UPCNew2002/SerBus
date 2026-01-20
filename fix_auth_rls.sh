#!/bin/bash
# ═══════════════════════════════════════════════════════
# SCRIPT PARA DESACTIVAR RLS EN auth.users
# ═══════════════════════════════════════════════════════
#
# Este script se conecta a PostgreSQL con privilegios de
# superusuario y desactiva RLS en auth.users
#
# ═══════════════════════════════════════════════════════

# Credenciales
PROJECT_ID="uzkznawepjnmmbenhvbb"
export PGPASSWORD="%Contraseña25"

# Construir host y user
PGHOST="db.${PROJECT_ID}.supabase.co"
PGPORT="5432"
PGUSER="postgres.${PROJECT_ID}"
PGDATABASE="postgres"

echo "═══════════════════════════════════════════════════════"
echo "  DESACTIVAR RLS EN auth.users"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Conectando a PostgreSQL..."
echo "Host: $PGHOST"
echo "User: $PGUSER"
echo ""

# Ejecutar SQL
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" <<EOF
-- Desactivar RLS en auth.users
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT schemaname, tablename, rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'auth' AND tablename = 'users';

-- Mostrar mensaje
SELECT '✅ RLS desactivado correctamente en auth.users' as resultado;
EOF

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  COMPLETADO"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Si viste 'rls_habilitado = false', ¡el fix funcionó!"
echo "Ahora puedes probar el login en tu app."
echo ""
