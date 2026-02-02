# Instrucciones para Desplegar la Edge Function

## ✅ Pasos Completados

Ya se completaron los siguientes pasos en el código:

1. ✅ Columna `password_temporal` agregada a tabla `perfiles`
2. ✅ Edge Function creada en `supabase/functions/reset-admin-password/`
3. ✅ Función `resetearPasswordAdmin()` creada en `src/lib/usuarios.ts`
4. ✅ `GestionarAdminsScreen.js` actualizado para mostrar contraseña temporal
5. ✅ `LoginScreen.js` actualizado para detectar `password_temporal`
6. ✅ `CambiarPasswordScreen.js` actualizado para manejar ambos casos

## 📋 Pasos Pendientes (Tu Responsabilidad)

### 1. Instalar Supabase CLI (si no lo tienes)

```bash
# En Windows con PowerShell como administrador
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# O descarga desde:
# https://github.com/supabase/cli/releases
```

### 2. Login en Supabase CLI

```bash
npx supabase login
```

Esto abrirá tu navegador para que autorices el CLI.

### 3. Link tu Proyecto

```bash
# Primero, obtén tu Project Reference ID desde:
# Supabase Dashboard > Settings > General > Reference ID

npx supabase link --project-ref TU_PROJECT_REF_ID
```

### 4. Deploy de la Edge Function

```bash
npx supabase functions deploy reset-admin-password
```

### 5. Verificar el Deploy

Puedes verificar que la función se deployó correctamente en:
- Supabase Dashboard > Edge Functions
- Deberías ver "reset-admin-password" en la lista

### 6. Probar la Funcionalidad

1. Inicia sesión como **superadmin**
2. Ve a **"Gestionar Admins"**
3. Selecciona un admin y presiona **"Resetear Clave"**
4. Confirma la acción
5. Deberías ver un Alert con la **contraseña temporal** generada
6. Presiona **"📋 Copiar"** para copiar la contraseña
7. Pásale la contraseña al administrador

8. El admin debe:
   - Iniciar sesión con la contraseña temporal
   - Será redirigido automáticamente a cambiar su contraseña
   - No podrá acceder al sistema hasta que cambie la contraseña

## 🔍 Solución de Problemas

### Error: "Failed to deploy function"

**Causa**: No tienes permisos o el proyecto no está vinculado correctamente.

**Solución**:
```bash
npx supabase link --project-ref TU_PROJECT_REF_ID
npx supabase functions deploy reset-admin-password
```

### Error: "User not authorized" al resetear contraseña

**Causa**: El usuario logueado no es super_admin.

**Solución**: Verifica que el perfil del usuario tenga `rol = 'super_admin'` en la tabla `perfiles`.

### Error: "Admin not found"

**Causa**: El adminId no existe o no tiene rol de admin.

**Solución**: Verifica que el admin existe en la tabla `perfiles` y tiene `rol = 'admin'`.

### La contraseña temporal no funciona

**Causa**: Puede ser un problema de sincronización o la función no actualizó correctamente.

**Solución**:
1. Revisa los logs de la Edge Function en Supabase Dashboard
2. Verifica que `password_temporal = true` en la tabla `perfiles`
3. Intenta resetear nuevamente

## 📊 Verificar en Base de Datos

Para ver si un admin tiene contraseña temporal:

```sql
SELECT id, nombre, username, password_temporal
FROM perfiles
WHERE rol = 'admin';
```

Para resetear manualmente el flag (solo para debugging):

```sql
UPDATE perfiles
SET password_temporal = false
WHERE id = 'uuid-del-admin';
```

## 🎯 Flujo Completo

```
SUPERADMIN
    ↓
Presiona "Resetear Clave"
    ↓
Edge Function genera password temporal (8 caracteres)
    ↓
Actualiza password en auth.users (Admin API)
    ↓
Marca password_temporal = true en perfiles
    ↓
Muestra contraseña temporal en Alert
    ↓
Superadmin copia y pasa la contraseña al admin
    ↓
ADMIN
    ↓
Inicia sesión con password temporal
    ↓
LoginScreen detecta password_temporal = true
    ↓
Redirige a CambiarPasswordScreen
    ↓
Admin cambia su contraseña
    ↓
Sistema marca password_temporal = false
    ↓
Admin puede usar el sistema normalmente
```

## ✨ Comandos Útiles

```bash
# Ver logs de la Edge Function
npx supabase functions logs reset-admin-password

# Eliminar la función (si quieres empezar de cero)
npx supabase functions delete reset-admin-password

# Listar todas las Edge Functions
npx supabase functions list
```

## 📝 Notas Importantes

1. **La contraseña temporal se genera automáticamente** y tiene 8 caracteres (letras y números).
2. **Solo se muestra UNA VEZ** cuando se resetea. No se puede recuperar después.
3. **El admin NO puede usar el sistema** hasta que cambie la contraseña temporal.
4. **La contraseña temporal es diferente** a la contraseña de primer login (`debe_cambiar_password`).
5. **Backup recomendado**: Antes de probar en producción, haz backup de tu base de datos.

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas con el deploy:

1. Revisa los logs: `npx supabase functions logs reset-admin-password --tail`
2. Verifica que tu proyecto está linkeado: `npx supabase projects list`
3. Asegúrate de tener la última versión del CLI: `npx supabase --version`

---

**¡Listo!** Una vez que hayas deployado la Edge Function, la funcionalidad de reseteo de contraseñas estará completamente operativa.
