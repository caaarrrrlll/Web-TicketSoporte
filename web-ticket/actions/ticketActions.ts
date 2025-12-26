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
    leido: true 
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
    image_url: ticket.imageUrl 
  })
  if (error) throw new Error(error.message)
  
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