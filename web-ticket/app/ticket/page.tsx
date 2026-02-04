"use client";

import { useEffect, useState } from "react";
import { getTicketsAction, deleteTicketAction, updateTicketAction } from "@/actions/ticketActions";
import { Ticket } from "@/types/ticket";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client"; 
import { FaCalendarAlt, FaCamera, FaSearch, FaTools, FaUserCircle, FaBuilding, FaLaptopCode, FaTrashAlt, FaExternalLinkAlt, FaTimes, FaExpand } from "react-icons/fa";
import { toast } from 'sonner'; 

export default function TicketPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos los estados");
  const [filtroPrioridad, setFiltroPrioridad] = useState("Todas las prioridades");

  async function loadTickets() {
    try {
      const data = await getTicketsAction();
      const sortedData = data.sort((a: Ticket, b: Ticket) => b.id - a.id);
      setTickets(sortedData);
    } catch (error) {
      console.error("Error cargando tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadTickets(); }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('realtime-tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          console.log("Cambio detectado en DB:", payload); 
          loadTickets(); 
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Conectado a Realtime de Tickets ');
        }
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); 

  function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();

    toast("¿Estás seguro de que quieres eliminar este ticket?", {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          const ticketsAnteriores = [...tickets];
          setTickets((prev) => prev.filter((t) => t.id !== id));
          
          try {
            await deleteTicketAction(id);
            toast.success("Ticket eliminado correctamente");
          } catch (error) {
            setTickets(ticketsAnteriores);
            toast.error("Error al eliminar el ticket");
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {}
      },
    });
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

  const getCategoryBadge = (cat?: string) => {
    switch(cat) {
        case 'desarrollo': return { icon: <FaLaptopCode />, label: 'Desarrollo', class: 'bg-purple-100 text-purple-700 border-purple-200' };
        case 'rrhh': return { icon: <FaUserCircle />, label: 'RRHH', class: 'bg-pink-100 text-pink-700 border-pink-200' };
        default: return { icon: <FaTools />, label: 'Soporte', class: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
        case 'alta': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'; 
        case 'media': return 'bg-yellow-400'; 
        default: return 'bg-emerald-500'; 
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Tickets</h1>
            <p className="text-gray-500 font-medium mt-1">Administra y resuelve las incidencias reportadas.</p>
        </div>
        <Link href="/create">
          <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2">
            <span>+</span> Nuevo Ticket
          </button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Buscar por título o descripción..."
            className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-0 outline-none text-gray-900 font-medium transition-all"
            value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)}
          />
        </div>
        
        <select className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none cursor-pointer text-gray-700 font-bold focus:border-blue-500 hover:bg-gray-100 w-full md:w-auto" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option>Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En Progreso</option>
          <option value="resuelto">Resuelto</option>
        </select>
        
        <select className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none cursor-pointer text-gray-700 font-bold focus:border-blue-500 hover:bg-gray-100 w-full md:w-auto" value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)}>
          <option>Todas las prioridades</option>
          <option value="alta">Prioridad Alta</option>
          <option value="media">Prioridad Media</option>
          <option value="baja">Prioridad Baja</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div></div>
      ) : ticketsFiltrados.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300"><p className="text-gray-400 text-lg font-medium">No se encontraron tickets con estos filtros.</p></div>
      ) : (
        <div className="space-y-4">
          {ticketsFiltrados.map((ticket) => {
             const catInfo = getCategoryBadge(ticket.category);
             return (
                <motion.div layout key={ticket.id} onClick={() => toggleExpand(ticket.id)} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden cursor-pointer group">
                  
                  <div className={`absolute left-0 top-0 bottom-0 w-3 ${getPriorityColor(ticket.prioridad)}`} />

                  <div className="p-5 pl-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200">#{ticket.id}</span>
                            
                            <span className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${catInfo.class}`}>{catInfo.icon} {catInfo.label}</span>
                            
                            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                                {ticket.prioridad}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-700 transition-colors">{ticket.titulo}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mt-1">
                          <span className="flex items-center gap-1"><FaUserCircle className="text-gray-400"/> {ticket.creadoPor}</span>
                          <span>•</span>
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-gray-400" /> 
                              {ticket.fechaCreacion.toString().split(',')[0]}
                            </span>                        
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end mt-4 md:mt-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                        <div onClick={(e) => e.stopPropagation()}>
                          <select value={ticket.estado} onChange={(e) => handleStatusChange(ticket, e.target.value, e)} 
                          className={`text-xs font-bold py-2 px-4 rounded-lg border cursor-pointer outline-none uppercase tracking-wide transition-colors ${
                            ticket.estado === 'pendiente' ? 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200' : ticket.estado === 'en_progreso' ? 
                            'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}>
                            <option value="pendiente">⏳ Pendiente</option>
                            <option value="en_progreso">⚙️ En Progreso</option>
                            <option value="resuelto">✅ Resuelto</option>
                          </select>
                        </div>
                        <button onClick={(e) => handleDelete(ticket.id, e)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar"><FaTrashAlt /></button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedTicketId === ticket.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pt-4 mt-4 border-t border-gray-100 text-gray-800">
                            <div className="flex items-start gap-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="mt-1 text-gray-400"><FaBuilding /></div>
                                <div><p className="text-xs font-bold text-gray-500 uppercase">Descripción detallada</p><p className="text-sm font-medium text-gray-800 mt-1">{ticket.descripcion}</p></div>
                            </div>
                            
                            {ticket.imageUrl && (
                              <div className="mt-4">
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><FaCamera /> Evidencia</p>
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium"><FaExpand /> Clic para ampliar</span>
                                </div>
                                <div 
                                    className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex justify-center p-2 cursor-zoom-in hover:bg-gray-100 transition-colors group/img"
                                    onClick={(e) => { e.stopPropagation(); setSelectedImage(ticket.imageUrl || null); }}>
                                  <img src={ticket.imageUrl} alt="Evidencia" className="object-contain max-h-[300px] w-auto h-auto rounded-lg" />
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
             );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedImage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer">
                <button className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"><FaTimes className="w-8 h-8" /></button>
                <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} src={selectedImage} className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl pointer-events-none select-none" alt="Evidencia Fullscreen" />
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}