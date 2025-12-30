'use server'

import { createClient } from '@/utils/supabase/server'
import { Ticket } from '@/types/ticket'
import { revalidatePath } from 'next/cache'

export async function getTicketsAction(): Promise<Ticket[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tickets:', error)
    return []
  }

  return data.map((t: any) => ({
    id: t.id,
    titulo: t.title,              
    descripcion: t.description,    
    estado: t.status,              
    prioridad: t.priority,           
    creadoPor: t.creator_name,       
    fechaCreacion: new Date(t.created_at).toLocaleString(), 
    historial: t.history || [],
    comentarios: t.comments || [],
    imageUrl: t.image_url,           
    leido: true,
    category: t.category || 'soporte' 
  }))
}

export async function createTicketAction(ticket: Ticket) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { error } = await supabase.from('tickets').insert({
    title: ticket.titulo,           
    description: ticket.descripcion,
    status: ticket.estado,
    priority: ticket.prioridad,
    creator_name: ticket.creadoPor,
    history: ticket.historial,
    comments: ticket.comentarios,
    user_id: user.id,
    image_url: ticket.imageUrl,
    category: ticket.category || 'soporte' 
  })

  if (error) {
    console.error("Error al crear ticket en DB:", error.message)
    throw new Error(error.message)
  }
  
  revalidatePath('/ticket')
  revalidatePath('/dashboard')
}

export async function updateTicketAction(ticket: Ticket) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tickets')
    .update({
      status: ticket.estado,
      history: ticket.historial,
      comments: ticket.comentarios,
      category: ticket.category 
    })
    .eq('id', ticket.id)

  if (error) throw new Error(error.message)

  revalidatePath('/ticket')
  revalidatePath('/dashboard')
}

export async function deleteTicketAction(id: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/ticket')
  revalidatePath('/dashboard')
}

export async function getDestinatariosAction() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .overlaps('role', ['gerente', 'soporte', 'rrhh', 'desarrollo']) 

  if (error || !data) {
    console.error("Error buscando destinatarios:", error)
    return []
  }

  return data
    .map(usuario => usuario.email)
    .filter(email => email !== null) as string[]
}

export async function addCommentAction(ticketId: number, comment: { usuario: string, mensaje: string, fecha: string }) {
  const supabase = await createClient()

  const { data: ticketActual, error: fetchError } = await supabase
    .from('tickets')
    .select('comments') 
    .eq('id', ticketId)
    .single()

  if (fetchError) throw new Error("Error buscando ticket")

  const comentariosPrevios = ticketActual.comments || []
  const nuevosComentarios = [...comentariosPrevios, comment]

  const { error: updateError } = await supabase
    .from('tickets')
    .update({ comments: nuevosComentarios })
    .eq('id', ticketId)

  if (updateError) throw new Error("Error guardando comentario")
  
  revalidatePath('/ticket') 
  return true
}