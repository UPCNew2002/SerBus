#!/usr/bin/env ts-node
/**
 * Script para agregar la columna kilometraje a la tabla ots
 *
 * Uso: npx ts-node scripts/add-kilometraje-column.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njgsbwzqnnhhllbmswwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3Nid3pxbm5oaGxsYm1zd3dkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzM5NzQwMywiZXhwIjoyMDUyOTczNDAzfQ.G7TsmQc-FIaG97bEJ-UcqAGMlVHwgFMJB1FLLXfjGaY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addKilometrajeColumn() {
  console.log('🔧 Agregando columna kilometraje a la tabla ots...');

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        -- Agregar columna kilometraje a la tabla ots
        ALTER TABLE ots ADD COLUMN IF NOT EXISTS kilometraje INTEGER;

        -- Comentario para documentar la columna
        COMMENT ON COLUMN ots.kilometraje IS 'Kilometraje del bus al momento del mantenimiento';
      `
    });

    if (error) {
      console.error('❌ Error ejecutando migración:', error);
      process.exit(1);
    }

    console.log('✅ Columna kilometraje agregada exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

addKilometrajeColumn();
