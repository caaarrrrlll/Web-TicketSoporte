'use server'

import { supabaseAdmin } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

export async function createUserAction(formData: {
  email: string,
  password: string,
  fullName: string,
  roles: string[]
}) {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  if (!currentUser) throw new Error("No autenticado")

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (!profile?.role || !profile.role.includes('gerente')) {
    throw new Error("⛔ Acceso denegado: No tienes permisos de Gerente.")
  }

  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: { full_name: formData.fullName }
  })

  if (createError) throw new Error(createError.message)
  if (!newUser.user) throw new Error("Error creando usuario")

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: newUser.user.id,
      email: formData.email,
      full_name: formData.fullName,
      role: formData.roles 
    })

  if (profileError) {
    console.error("Error en perfil:", profileError)
    await supabaseAdmin.auth.admin.deleteUser(newUser.user.id) 
    throw new Error("Error guardando el perfil del usuario.")
  }

  return { success: true }
}