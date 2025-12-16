"use client";

import { useEffect, useState } from "react";
import { getTicketsAction, deleteTicketAction, updateTicketAction } from "@/actions/ticketActions";
import { Ticket } from "@/types/ticket";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function TicketPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null);

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos los estados");
  const [filtroPrioridad, setFiltroPrioridad] = useState("Todas las prioridades");

  // Cargar tickets inicial
  useEffect(() => {
    loadTickets();
  }, []);

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

  // --- ACCIONES ---

  // 1. Eliminar Ticket
  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation(); // Evita que se expanda la tarjeta al hacer click en borrar
    if (!confirm("¿Estás seguro de que quieres eliminar este ticket?")) return;

    try {
      // Actualizamos UI inmediatamente (Optimistic UI)
      setTickets((prev) => prev.filter((t) => t.id !== id));
      // Borramos en Servidor
      await deleteTicketAction(id);
    } catch (error) {
      alert("Error al eliminar");
      loadTickets(); // Revertimos si falla
    }
  }

  // 2. Cambiar Estado
  async function handleStatusChange(ticket: Ticket, nuevoEstado: string, e: React.MouseEvent | React.ChangeEvent) {
    e.stopPropagation(); // Evita expansión
    
    const ticketActualizado = { ...ticket, estado: nuevoEstado as any };

    try {
      // UI Inmediata
      setTickets((prev) => prev.map((t) => (t.id === ticket.id ? ticketActualizado : t)));
      // Guardar en Servidor
      await updateTicketAction(ticketActualizado);
    } catch (error) {
      console.error("Error actualizando estado", error);
    }
  }

  // 3. Expandir/Colapsar
  const toggleExpand = (id: number) => {
    setExpandedTicketId(expandedTicketId === id ? null : id);
  };

  // --- LÓGICA DE FILTRADO ---
  const ticketsFiltrados = tickets.filter((ticket) => {
    const coincideTexto =
      ticket.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      ticket.descripcion.toLowerCase().includes(filtroTexto.toLowerCase());

    const coincideEstado =
      filtroEstado === "Todos los estados" ||
      ticket.estado.toLowerCase() === filtroEstado.toLowerCase();

    const coincidePrioridad =
      filtroPrioridad === "Todas las prioridades" ||
      ticket.prioridad.toLowerCase() === filtroPrioridad.toLowerCase();

    return coincideTexto && coincideEstado && coincidePrioridad;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Tickets</h1>
        <Link href="/crear">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all">
            Crear ticket
          </button>
        </Link>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
        <input
          placeholder="Buscar..."
          className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
        />
        <select
          className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none cursor-pointer"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option>Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En Progreso</option>
          <option value="resuelto">Resuelto</option>
        </select>
        <select
          className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none cursor-pointer"
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value)}
        >
          <option>Todas las prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>

      {/* LISTA DE TICKETS */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500">Cargando tickets...</div>
      ) : ticketsFiltrados.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No se encontraron tickets</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ticketsFiltrados.map((ticket) => (
            <motion.div
              layout
              key={ticket.id}
              onClick={() => toggleExpand(ticket.id)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden cursor-pointer group"
            >
              {/* Franja de Color Prioridad */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 
                ${ticket.prioridad === 'alta' ? 'bg-red-500' : ticket.prioridad === 'media' ? 'bg-yellow-500' : 'bg-emerald-500'}
              `} />

              <div className="p-5 pl-7">
                {/* CABECERA DE LA TARJETA */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                      {ticket.titulo}
                      {ticket.prioridad === 'alta' && (
                        <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-wide">
                          Crítico
                        </span>
                      )}
                    </h3>
                    
                    {/* Resumen corto (visible siempre) */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                      <span className="flex items-center gap-1">👤 {ticket.creadoPor}</span>
                      <span>•</span>
                      <span>📅 {ticket.fechaCreacion}</span>
                    </div>
                  </div>

                  {/* CONTROLES RÁPIDOS (Estado y Borrar) */}
                  <div className="flex items-center gap-2">
                    {/* Selector de Estado (Click stopPropagation para no expandir) */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        value={ticket.estado}
                        onChange={(e) => handleStatusChange(ticket, e.target.value, e)}
                        className={`text-xs font-bold py-1 px-3 rounded-full border cursor-pointer outline-none appearance-none text-center
                          ${ticket.estado === 'pendiente' ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200' : 
                            ticket.estado === 'en_progreso' ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' : 
                            'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}
                        `}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_progreso">En Progreso</option>
                        <option value="resuelto">Resuelto</option>
                      </select>
                    </div>

                    {/* Botón Borrar */}
                    <button
                      onClick={(e) => handleDelete(ticket.id, e)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar ticket"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>

                {/* DETALLES EXPANDIBLES */}
                <AnimatePresence>
                  {expandedTicketId === ticket.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      className="overflow-hidden border-t border-gray-100"
                    >
                      <div className="pt-4 text-sm text-gray-600 leading-relaxed">
                        <p className="font-semibold text-gray-800 mb-1">Descripción:</p>
                        <p className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          {ticket.descripcion}
                        </p>
                        <div className="mt-4 flex justify-end">
                           <span className="text-xs text-blue-500 font-medium cursor-pointer hover:underline">
                             Ver historial completo →
                           </span>
                        </div>
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