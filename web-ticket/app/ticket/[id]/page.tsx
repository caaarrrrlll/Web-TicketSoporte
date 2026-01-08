// @ts-nocheck
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; 
import { addCommentAction } from "@/actions/ticketActions"; 
import { FaUserCircle, FaCalendarAlt, FaTools, FaLaptopCode, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comentario, setComentario] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const endRef = useRef(null);

  useEffect(() => {
    async function fetchTicket() {
      if (!id) return;
      const { data: t, error } = await supabase.from('tickets').select('*').eq('id', id).single();
      if (error || !t) { router.push("/ticket"); return; }

      const ticketFormateado = {
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
      };
      setTicket(ticketFormateado);
      setLoading(false);
    }
    fetchTicket();
  }, [id, router]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [ticket?.comentarios?.length]);

  async function handleEnviarComentario() {
    if (!ticket || !comentario.trim()) return;
    setIsSending(true);
    const nuevoComentario = { usuario: "Usuario Web", mensaje: comentario, fecha: new Date().toLocaleString() };
    try {
        await addCommentAction(ticket.id, nuevoComentario);
        setTicket({ ...ticket, comentarios: [...(ticket.comentarios || []), nuevoComentario] });
        setComentario("");
    } catch (error) { alert("Error al enviar comentario"); } finally { setIsSending(false); }
  }

  const getCategoryBadge = (cat) => {
    switch(cat) {
        case 'desarrollo': return { icon: <FaLaptopCode />, label: 'Desarrollo', class: 'bg-purple-100 text-purple-700 border-purple-200' };
        case 'rrhh': return { icon: <FaUserCircle />, label: 'RRHH', class: 'bg-pink-100 text-pink-700 border-pink-200' };
        default: return { icon: <FaTools />, label: 'Soporte', class: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
  };
  
  if (loading) return <div className="p-10 text-center">Cargando ticket...</div>;
  if (!ticket) return null;

  const catBadge = getCategoryBadge(ticket.category);
  const priorityClass = ticket.prioridad === 'alta' ? 'text-red-600 bg-red-50 border-red-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <button onClick={() => router.push("/ticket")} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-6 transition-colors"><FaArrowLeft /> Volver</button>
      <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 border-b border-gray-100">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{ticket.titulo}</h1>
            <span className={`px-3 py-1 rounded-lg border font-bold text-xs uppercase ${priorityClass}`}>{ticket.prioridad}</span>
        </div>
        <div className="p-8">
             <div className="bg-slate-50 p-5 rounded-xl border border-gray-200 text-gray-800">{ticket.descripcion}</div>
             <div className="mt-6 border-t pt-4">
                <div className="h-40 overflow-y-auto mb-4 space-y-2">
                    {ticket.comentarios.map((c, i) => <div key={i} className="bg-gray-100 p-2 rounded"><b>{c.usuario}:</b> {c.mensaje}</div>)}
                    <div ref={endRef} />
                </div>
                <div className="flex gap-2"><input value={comentario} onChange={e => setComentario(e.target.value)} className="border p-2 flex-1 rounded" /><button onClick={handleEnviarComentario} className="bg-blue-600 text-white px-4 rounded">Enviar</button></div>
             </div>
        </div>
      </div>
    </div>
  );
}