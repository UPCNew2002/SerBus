// Edge Function: reset-admin-password
// Resetea la contraseña de un admin y genera una contraseña temporal

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Crear cliente Supabase con Admin API
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Crear cliente regular para verificar autorización
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verificar que el usuario logueado sea super_admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener perfil del usuario logueado
    const { data: perfilLogueado, error: perfilError } = await supabaseClient
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (perfilError || perfilLogueado?.rol !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: 'Solo super_admin puede resetear contraseñas' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener datos del request
    const { adminId } = await req.json()

    if (!adminId) {
      return new Response(
        JSON.stringify({ error: 'Se requiere adminId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar que el usuario a resetear sea admin
    const { data: adminPerfil, error: adminPerfilError } = await supabaseAdmin
      .from('perfiles')
      .select('rol, username')
      .eq('id', adminId)
      .single()

    if (adminPerfilError || !adminPerfil) {
      return new Response(
        JSON.stringify({ error: 'Admin no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (adminPerfil.rol !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Solo se puede resetear contraseña de admins' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generar contraseña temporal (8 caracteres: letras y números)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let passwordTemporal = ''
    for (let i = 0; i < 8; i++) {
      passwordTemporal += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    // Actualizar contraseña usando Admin API
    const { error: updatePasswordError } = await supabaseAdmin.auth.admin.updateUserById(
      adminId,
      { password: passwordTemporal }
    )

    if (updatePasswordError) {
      console.error('Error actualizando contraseña:', updatePasswordError)
      return new Response(
        JSON.stringify({ error: 'Error actualizando contraseña: ' + updatePasswordError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Marcar password_temporal = true en perfiles
    const { error: updatePerfilError } = await supabaseAdmin
      .from('perfiles')
      .update({ password_temporal: true })
      .eq('id', adminId)

    if (updatePerfilError) {
      console.error('Error actualizando perfil:', updatePerfilError)
      return new Response(
        JSON.stringify({ error: 'Error actualizando perfil: ' + updatePerfilError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ Contraseña reseteada para admin: ${adminPerfil.username}`)

    return new Response(
      JSON.stringify({
        success: true,
        passwordTemporal,
        username: adminPerfil.username
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error en reset-admin-password:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
