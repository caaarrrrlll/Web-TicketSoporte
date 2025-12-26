"use client";

import { useEffect, useState } from "react";
import { getTicketsAction, deleteTicketAction, updateTicketAction } from "@/actions/ticketActions";
import { Ticket } from "@/types/ticket";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client"; 

export default function TicketPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos los estados");
  const [filtroPrioridad, setFiltroPrioridad] = useState("Todas las prioridades");

  async function loadTickets() {
    try {
      const data = await getTicketsAction();
      setTickets(data);
    } catch (error) {
      console.error("Error cargando tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('tickets-list-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        loadTickets(); 
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("¿Estás seguro de que quieres eliminar este ticket?")) return;
    try {
      setTickets((prev) => prev.filter((t) => t.id !== id));
      await deleteTicketAction(id);
    } catch (error) { loadTickets(); }
  }

  async function handleStatusChange(ticket: Ticket, nuevoEstado: string, e: React.MouseEvent | React.ChangeEvent) {
    e.stopPropagation();
    const ticketActualizado = { ...ticket, estado: nuevoEstado as any };
    try {
      setTickets((prev) => prev.map((t) => (t.id === ticket.id ? ticketActualizado : t)));
      await updateTicketAction(ticketActualizado);
    } catch (error) { console.error(error); }
  }

  const toggleExpand = (id: number) => setExpandedTicketId(expandedTicketId === id ? null : id);
  const ticketsFiltrados = tickets.filter((ticket) => {
    const coincideTexto = ticket.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) || ticket.descripcion.toLowerCase().includes(filtroTexto.toLowerCase());
    const coincideEstado = filtroEstado === "Todos los estados" || ticket.estado.toLowerCase() === filtroEstado.toLowerCase();
    const coincidePrioridad = filtroPrioridad === "Todas las prioridades" || ticket.prioridad.toLowerCase() === filtroPrioridad.toLowerCase();
    return coincideTexto && coincideEstado && coincidePrioridad;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Tickets</h1>
        <Link href="/create">
          <button className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all">
            + Nuevo Ticket
          </button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-300 mb-8 flex flex-col md:flex-row gap-4">
        <input
          placeholder="🔍 Buscar por título..."
          className="flex-1 p-3 bg-white border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:ring-0 outline-none text-gray-900 placeholder-gray-600 font-medium"
          value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)}
        />
        <select
          className="p-3 bg-white border-2 border-gray-300 rounded-xl outline-none cursor-pointer text-gray-900 font-bold focus:border-blue-600"
          value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option>Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En Progreso</option>
          <option value="resuelto">Resuelto</option>
        </select>
        <select
          className="p-3 bg-white border-2 border-gray-300 rounded-xl outline-none cursor-pointer text-gray-900 font-bold focus:border-blue-600"
          value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)}>
          <option>Todas las prioridades</option>
          <option value="alta">🔥 Alta</option>
          <option value="media">🔧 Media</option>
          <option value="baja">☕ Baja</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-600 font-medium">Cargando tickets...</div>
      ) : ticketsFiltrados.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-lg font-medium">No se encontraron tickets.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ticketsFiltrados.map((ticket) => (
            <motion.div layout key={ticket.id} onClick={() => toggleExpand(ticket.id)}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden cursor-pointer group">
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${ticket.prioridad === 'alta' ? 'bg-red-600' : ticket.prioridad === 'media' ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
              
              <div className="p-5 pl-8">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                      {ticket.titulo}
                      {ticket.prioridad === 'alta' && <span className="bg-red-100 text-red-800 text-[11px] px-2 py-0.5 rounded-full border border-red-200 uppercase tracking-wide font-bold">Crítico</span>}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-2 font-medium">
                      <span>👤 {ticket.creadoPor}</span> • <span>📅 {ticket.fechaCreacion}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div onClick={(e) => e.stopPropagation()}>
                      <select value={ticket.estado} onChange={(e) => handleStatusChange(ticket, e.target.value, e)}
                        className={`text-xs font-bold py-1.5 px-3 rounded-full border-2 cursor-pointer outline-none uppercase tracking-wide ${ticket.estado === 'pendiente' ? 'bg-gray-100 text-gray-700 border-gray-300' : ticket.estado === 'en_progreso' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        <option value="pendiente">Pendiente</option>
                        <option value="en_progreso">En Progreso</option>
                        <option value="resuelto">Resuelto</option>
                      </select>
                    </div>
                    <button onClick={(e) => handleDelete(ticket.id, e)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedTicketId === ticket.id && (
                    <motion.div initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: "auto", opacity: 1, marginTop: 16 }} exit={{ height: 0, opacity: 0, marginTop: 0 }} className="overflow-hidden border-t border-gray-200">
                      <div className="pt-4 text-gray-800">
                        <p className="font-bold text-gray-900 mb-2">Descripción:</p>
                        <p className="bg-gray-50 p-4 rounded-xl border border-gray-300 text-gray-800 font-medium">{ticket.descripcion}</p>
                        {ticket.imageUrl && (
                          <div className="mt-4">
                            <p className="font-bold text-gray-900 mb-2">📸 Evidencia adjunta:</p>
                            <div className="relative h-48 w-full max-w-sm rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm cursor-pointer hover:shadow-md" onClick={() => window.open(ticket.imageUrl, '_blank')}>
                              <img src={ticket.imageUrl} alt="Evidencia" className="object-cover w-full h-full hover:scale-105 transition-transform" />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}