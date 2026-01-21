# INTEGRACIÓN SUPABASE - SERBUS

## ✅ COMPLETADO

### Fase 0-6: Base de datos y autenticación
- ✅ Proyecto Supabase creado
- ✅ Esquema SQL completo ejecutado
- ✅ RLS configurado
- ✅ 3 usuarios creados (jperez, mgarcia, superadmin)
- ✅ Login funcionando con Gmail emails

### Fase 7: Funciones PostgreSQL
- ✅ 6 funciones RPC creadas en `funciones_cronograma.sql`
- ✅ Wrappers TypeScript en `src/lib/cronograma.ts`
- ✅ Funciones:
  - `generar_numero_ot()` - Auto-genera OT-2026-0001
  - `estadisticas_ots()` - Contadores de OTs
  - `buses_necesitan_mantenimiento()` - Alertas urgentes
  - `calcular_proximo_mantenimiento()` - Próximo mantenimiento
  - `detalle_ot()` - Detalle completo de OT
  - `historial_mantenimiento_bus()` - Historial por bus

### Fase 8: Datos de prueba e interfaz
- ✅ Script `datos_prueba.sql` con 10 trabajos, 10 buses, 3 OTs
- ✅ Dashboard muestra estadísticas reales desde Supabase
- ✅ Alertas de buses urgentes funcionando (ABC-101, ABC-102, ABC-104)
- ✅ Auto-generación de números OT
- ✅ Selector de buses en Registrar OT con modal
- ✅ Pantalla Lista de Buses con búsqueda
- ✅ Indicadores de urgencia (URGENTE/PRÓXIMO/NORMAL)

### Fase 9: Integración completa
- ✅ Pantalla OTs carga desde Supabase (3 OTs visibles)
- ✅ Registrar OT guarda en Supabase usando `crearOT()`
- ✅ Actualización de kilometraje al registrar OT
- ✅ Trabajos cargados desde Supabase (10 trabajos)
- ✅ Datos adicionales (productos, precios, evidencia) en JSON
- ✅ Validaciones y manejo de errores
- ✅ Pantalla DetalleOTScreen completa con trabajos, productos, precios
- ✅ Pantalla CronogramaScreen con alertas y filtros
- ✅ Trabajos mostrados en tarjetas de lista de OTs

### Fase 10: Optimización para producción
- ✅ Índices en tablas principales para performance
- ✅ Optimización de funciones RPC existentes
- ✅ Nuevas funciones: paginación, búsqueda rápida
- ✅ Queries optimizadas con CTE y parallel workers

## 📂 ARCHIVOS CREADOS/MODIFICADOS

### SQL
- `funciones_cronograma.sql` - Funciones PostgreSQL (6 funciones RPC)
- `datos_prueba.sql` - Datos de prueba (10 trabajos, 10 buses, 3 OTs)
- `indices_performance.sql` - Índices para optimización de performance
- `optimizaciones_queries.sql` - Queries optimizadas y nuevas funciones

### TypeScript/JavaScript
- `src/lib/supabase.ts` - Cliente Supabase con mapeo Gmail
- `src/lib/cronograma.ts` - Funciones: `crearOT()`, `actualizarKilometraje()`, `obtenerBusesEmpresa()`, `obtenerOTsEmpresa()`, `obtenerOTCompleta()`, `obtenerTrabajos()`
- `src/screens/admin/AdminHomeScreen.js` - Dashboard con estadísticas
- `src/screens/admin/RegistrarOTScreen.js` - Registrar OT con guardado a Supabase
- `src/screens/admin/OTsListScreen.js` - Lista de OTs desde Supabase con trabajos
- `src/screens/admin/DetalleOTScreen.js` - Detalle completo de OT (bus, trabajos, productos, precios, evidencia)
- `src/screens/admin/CronogramaScreen.js` - Cronograma de mantenimiento con alertas y filtros
- `src/screens/admin/ListaBusesScreen.js` - Lista completa de buses con búsqueda
- `src/navigation/AppNavigator.js` - Rutas agregadas

## 🔑 CREDENCIALES

### Usuarios de prueba
- **Admin**: jperez / password123
- **Trabajador**: mgarcia / password123
- **Super Admin**: superadmin / admin123

### Supabase
Ver `src/lib/supabase.ts` para URL y anon key

## 🚀 USO

### Cargar datos de prueba
```sql
-- En Supabase SQL Editor
-- Ejecutar datos_prueba.sql
```

### Dashboard Admin
1. Login con jperez
2. Ver estadísticas: 3 OTs (1 pendiente, 1 en proceso, 1 completada)
3. Ver alertas: 3 buses urgentes
4. Opciones: Registrar OT, Cronograma, Flota de Buses

### Registrar OT
1. Auto-genera número OT-2026-0004
2. Toca "Seleccionar Bus"
3. Elige un bus → auto-completa placa, VIN, km
4. Selecciona trabajos
5. Completa formulario

### Flota de Buses
1. Dashboard → "Flota de Buses"
2. Buscar por placa/marca/modelo/VIN
3. Ver urgencias: URGENTE (rojo), PRÓXIMO (amarillo), NORMAL (verde)

## 📊 DATOS DE PRUEBA

### Buses urgentes
- ABC-102 (Volvo B7R): 200 km restantes - URGENTE
- ABC-101 (Mercedes-Benz OF-1721): 300 km restantes - URGENTE
- ABC-104 (Mercedes-Benz LO-916): 500 km restantes - PRÓXIMO
- ABC-103 (Scania K380): 800 km restantes - PRÓXIMO

### OTs de ejemplo
- OT-2026-0001: Completada (ABC-110)
- OT-2026-0002: En proceso (ABC-109)
- OT-2026-0003: Pendiente (ABC-101)

### Trabajos disponibles
1. Cambio de aceite
2. Cambio de filtros
3. Revisión de frenos
4. Alineación y balanceo
5. Cambio de batería
6. Reparación de motor
7. Cambio de neumáticos
8. Revisión eléctrica
9. Limpieza profunda
10. Revisión de suspensión

## 🐛 PROBLEMAS RESUELTOS

1. ✅ Login con Gmail emails (username → email mapping)
2. ✅ Funciones SQL con EXTRACT() type casting
3. ✅ Dashboard sin errores de funciones
4. ✅ CHECK constraints en ots_trabajos
5. ✅ VIN obligatorio en buses
6. ✅ Selector de buses en Registrar OT
7. ✅ Trabajos hardcodeados → Cargados desde Supabase
8. ✅ Rendering errors en OTsListScreen (campos faltantes)
9. ✅ Columna `apellido` inexistente en perfiles

## 🔄 FLUJO DE DATOS

### Registrar OT
1. Usuario selecciona bus → Auto-completa placa, VIN, km
2. Selecciona trabajos desde Supabase (10 disponibles)
3. Completa descripción, productos, precios, evidencia
4. Click "REGISTRAR OT":
   - Llama `crearOT()` → Inserta en tabla `ots`
   - Inserta trabajos en `ots_trabajos`
   - Llama `actualizarKilometraje()` si cambió
   - Datos extra (productos, precios, evidencia) en `observaciones` como JSON

### Ver OTs
1. Pantalla carga con `obtenerOTsEmpresa()`
2. Query con JOIN a `buses`, `perfiles` y `ots_trabajos`
3. Muestra 3 OTs de prueba + OTs nuevas
4. Datos extra parseados desde `observaciones`

## ⚡ PERFORMANCE Y OPTIMIZACIÓN

### Índices creados (indices_performance.sql):
- **ots**: empresa_id, bus_id, trabajador_id, estado, fecha_inicio
- **buses**: empresa_id, placa, activo
- **ots_trabajos**: ot_id, trabajo_id
- **perfiles**: username, email, empresa_id, rol
- **trabajos**: nombre
- Índices compuestos para queries frecuentes
- Índices case-insensitive para búsquedas

### Optimizaciones implementadas:
1. **estadisticas_ots**: CTE para evitar múltiples scans
2. **buses_necesitan_mantenimiento**: Cálculo de urgencia en SQL
3. **obtener_ots_paginadas**: Nueva función con paginación
4. **buscar_buses**: Búsqueda rápida con índices optimizados

### Recomendaciones de uso:
- Ejecutar `ANALYZE` después de insertar muchos datos
- Monitorear queries lentas con `pg_stat_statements`
- Usar paginación para listas grandes (>100 items)
- Índices GIN disponibles para búsqueda full-text

## 📝 PENDIENTES (FUTURO)

- ✅ Optimizar queries para producción
- ✅ Índices en tablas para performance
- [ ] Logs de errores en Sentry/similar
- [ ] Migrar productos a tabla separada (opcional)
- [ ] Upload real de imágenes a Supabase Storage
- [ ] Notificaciones push para alertas de mantenimiento
- [ ] Exportar reportes a PDF/Excel
- [ ] Dashboard de métricas en tiempo real
