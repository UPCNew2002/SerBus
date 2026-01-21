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

## 📂 ARCHIVOS CREADOS/MODIFICADOS

### SQL
- `funciones_cronograma.sql` - Funciones PostgreSQL
- `datos_prueba.sql` - Datos de prueba

### TypeScript/JavaScript
- `src/lib/supabase.ts` - Cliente Supabase con mapeo Gmail
- `src/lib/cronograma.ts` - Wrappers de funciones + `obtenerBusesEmpresa()`
- `src/screens/admin/AdminHomeScreen.js` - Dashboard con estadísticas
- `src/screens/admin/RegistrarOTScreen.js` - Selector de buses
- `src/screens/admin/ListaBusesScreen.js` - Lista completa de buses
- `src/navigation/AppNavigator.js` - Ruta ListaBuses agregada

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

## 📝 PENDIENTES FASE 9-10

- [ ] Verificar pantalla OTs muestre las 3 OTs de prueba
- [ ] Integrar guardado real en Supabase desde Registrar OT
- [ ] Actualizar kilometraje de bus al completar OT
- [ ] Optimizar queries para producción
- [ ] Índices en tablas para performance
- [ ] Logs de errores en Sentry/similar
