# 🚨 SOLUCIÓN AL ERROR "Database error querying schema"

## EL PROBLEMA

Tu app está intentando conectarse a:
```
https://TU_PROJECT_ID.supabase.co
```

Pero ese proyecto **NO EXISTE**. Por eso falla.

Tu proyecto real es:
```
https://uzkznawepjnmmbenhvbb.supabase.co
```

---

## LA SOLUCIÓN (3 PASOS)

### PASO 1: Ir a Supabase Dashboard

1. Abre tu navegador
2. Ve a: https://supabase.com/dashboard
3. Inicia sesión
4. Entra a tu proyecto **SerBus**

### PASO 2: Copiar las credenciales

1. **Clic en el ícono de Settings** (esquina superior derecha, ícono de engranaje)
2. **Clic en "API"** (en el menú lateral)
3. Vas a ver 2 cosas importantes:

#### A. Project URL
```
https://uzkznawepjnmmbenhvbb.supabase.co
```
☝️ Copia esto completo

#### B. Project API keys → anon public
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M[...]
```
☝️ Copia esto completo (es MUY largo, como 200+ caracteres)

**⚠️ NO copies el "service_role", copia el "anon public"**

### PASO 3: Pegar las credenciales aquí

Una vez que tengas los 2 valores copiados, pégalos en este chat así:

```
URL: https://uzkznawepjnmmbenhvbb.supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## QUÉ HARÉ DESPUÉS

Cuando me des esas 2 cosas, yo:
1. Actualizaré automáticamente el archivo `src/lib/supabase.ts`
2. El error desaparecerá
3. El login funcionará ✅

---

## VISUAL GUIDE

```
Supabase Dashboard
├─ [Settings ⚙️]
│   └─ API
│       ├─ 📋 Project URL: https://uzkznawepjnmmbenhvbb.supabase.co
│       └─ 🔑 Project API keys
│           ├─ anon public: eyJhbGci... ← COPIAR ESTE
│           └─ service_role: [NO COPIAR ESTE]
```

---

## ESTOY ESPERANDO QUE ME ENVÍES:

1. ✅ La URL del proyecto (ya la tengo: `https://uzkznawepjnmmbenhvbb.supabase.co`)
2. ❓ La ANON KEY (la necesito urgente)

**Envíame solo la ANON_KEY y lo arreglo todo en 10 segundos.**
