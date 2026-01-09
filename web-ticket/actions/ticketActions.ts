'use server'

import { createClient } from '@/utils/supabase/server'
import { Ticket } from '@/types/ticket'
import { revalidatePath } from 'next/cache'
import nodemailer from 'nodemailer';

// --- 1. FUNCIÓN AUXILIAR PARA ENVIAR CORREOS ---
async function enviarAlertaCorreo(titulo: string, descripcion: string, autor: string, destinatarios: string[]) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS  
      }
    });

    const mailOptions = {
      from: `"Soporte WebTicket" <${process.env.SMTP_USER}>`,
      to: destinatarios, 
      subject: `🔥 ALERTA CRÍTICA: Ticket de ${autor}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6;">
          <div style="background-color: white; padding: 20px; border-radius: 10px; border-left: 5px solid #dc2626; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #dc2626; margin-top: 0;">⚠️ Nueva Incidencia de Alta Prioridad</h2>
            <p style="font-size: 16px;">El usuario <strong>${autor}</strong> ha reportado un problema crítico que requiere atención inmediata.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <h3 style="color: #111827;">${titulo}</h3>
            <p style="color: #4b5563; line-height: 1.5;">${descripcion}</p>
            <br>
            <div style="text-align: center;">
              <a href="https://ticket-soporte.vercel.app/dashboard" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Ver Ticket en Dashboard
              </a>
            </div>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 20px; text-align: center;">Sistema de Notificaciones Automáticas - WebTicket</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Correos de alerta enviados a:", destinatarios);
  } catch (error) {
    console.error("❌ Error enviando correo con Nodemailer:", error);
  }
}

export async function getDestinatariosAction(categoriaTicket: string) {
  const supabase = await createClient()
    const mapaRoles: Record<string, string> = {
    'soporte': 'soporte',           
    'desarrollo': 'desarrollo',    
    'rrhh': 'Recursos Humanos'     
  };

  const rolObjetivo = mapaRoles[categoriaTicket] || categoriaTicket;

  console.log(`🔍 Buscando correos para categoría: "${categoriaTicket}" -> Rol DB: "${rolObjetivo}"`);
  const rolesBuscados = ['gerente', rolObjetivo]; 

  const { data, error } = await supabase
    .from('profiles')
    .select('email, full_name, role') 
    .overlaps('role', rolesBuscados)

  if (error || !data) {
    console.error("Error buscando destinatarios:", error)
    return []
  }

  return data.map(usuario => usuario.email)
    .filter(email => email !== null) as string[]
}

export async function createTicketAction(ticket: Ticket) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  const nombreReal = profile?.full_name || profile?.email?.split('@')[0] || "Usuario Registrado"

  const historialConNombre = (ticket.historial ?? []).map(h => ({
    ...h,
    usuario: nombreReal
  }))

  const { error } = await supabase.from('tickets').insert({
    title: ticket.titulo,
    description: ticket.descripcion,
    status: ticket.estado,
    priority: ticket.prioridad,
    creator_name: nombreReal, 
    history: historialConNombre, 
    comments: ticket.comentarios,
    user_id: user.id,
    image_url: ticket.imageUrl,
    category: ticket.category || 'soporte'
  })

  if (error) {
    console.error("Error al crear ticket en DB:", error.message)
    throw new Error(error.message)
  }

  // --- LÓGICA DE ALERTA ---
  if (ticket.prioridad === 'alta') {
    const categoria = ticket.category || 'soporte';
    const listaCorreos = await getDestinatariosAction(categoria);
    
    // B. Enviamos el correo
    if (listaCorreos.length > 0) {
      console.log(`📧 Enviando alerta de departamento [${categoria}] a:`, listaCorreos);
      enviarAlertaCorreo(ticket.titulo, ticket.descripcion, nombreReal, listaCorreos);
    }
  }
  
  revalidatePath('/ticket')
  revalidatePath('/dashboard')
}


export async function getTicketsAction(): Promise<Ticket[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false })
  if (error) return []
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

export async function getPaginatedTicketsAction(page: number, pageSize: number): Promise<Ticket[]> {
  const supabase = await createClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false }).range(from, to)
  if (error) return []
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

export async function getTicketStatsAction() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('tickets').select('status, priority')
  if (error || !data) return { total: 0, pendientes: 0, enProgreso: 0, resueltos: 0, criticos: 0 }
  return {
    total: data.length,
    pendientes: data.filter((t: any) => t.status === 'pendiente').length,
    enProgreso: data.filter((t: any) => t.status === 'en_progreso').length,
    resueltos: data.filter((t: any) => t.status === 'resuelto').length,
    criticos: data.filter((t: any) => t.priority === 'alta' && t.status !== 'resuelto').length
  }
}

export async function updateTicketAction(ticket: Ticket) {
  const supabase = await createClient()
  const { error } = await supabase.from('tickets').update({
      status: ticket.estado,
      history: ticket.historial,
      comments: ticket.comentarios,
      category: ticket.category
  }).eq('id', ticket.id)
  if (error) throw new Error(error.message)
  revalidatePath('/ticket')
  revalidatePath('/dashboard')
}

export async function deleteTicketAction(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('tickets').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/ticket')
  revalidatePath('/dashboard')
}

export async function addCommentAction(ticketId: number, comment: { usuario: string, mensaje: string, fecha: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")
  const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).single()
  const nombreReal = profile?.full_name || profile?.email?.split('@')[0] || "Usuario Registrado"
  const comentarioReal = { usuario: nombreReal, mensaje: comment.mensaje, fecha: new Date().toLocaleString() }
  const { data: ticketActual, error: fetchError } = await supabase.from('tickets').select('comments').eq('id', ticketId).single()
  if (fetchError) throw new Error("Error buscando ticket")
  const nuevosComentarios = [...(ticketActual.comments || []), comentarioReal]
  const { error: updateError } = await supabase.from('tickets').update({ comments: nuevosComentarios }).eq('id', ticketId)
  if (updateError) throw new Error("Error guardando comentario")
  revalidatePath('/ticket')
  return true
}