"use client";

import { useEffect, useState } from "react";
import { getTicketsAction, addCommentAction } from "@/actions/ticketActions"; // <--- IMPORTAMOS LA NUEVA ACCIÓN
import { Ticket } from "@/types/ticket";
import { motion, AnimatePresence } from "framer-motion"; 
import Link from "next/link";
import { createClient } from "@/utils/supabase/client"; 

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSendingComment, setIsSendingComment] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProgreso: 0,
    resueltos: 0,
    criticos: 0
  });

  async function loadData() {
    try {
      const data = await getTicketsAction(); 
      const sortedData = data.sort((a: Ticket, b: Ticket) => b.id - a.id);
      setTickets(sortedData);

      const counts = {
        total: data.length,
        pendientes: data.filter(t => t.estado === "pendiente").length,
        enProgreso: data.filter(t => t.estado === "en_progreso").length,
        resueltos: data.filter(t => t.estado === "resuelto").length,
        criticos: data.filter(t => t.prioridad === "alta" && t.estado !== "resuelto").length
      };
      setStats(counts);
      
      if (selectedTicket) {
        const updatedSelected = sortedData.find(t => t.id === selectedTicket.id);
        if (updatedSelected) setSelectedTicket(updatedSelected);
      }

    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        loadData(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTicket]);

  async function handleSendComment() {
    if (!newComment.trim() || !selectedTicket) return;
    setIsSendingComment(true);
    let autor = "Usuario Web";
    try {
        const userLocal = JSON.parse(localStorage.getItem("sessionUser") || "{}");
        if (userLocal.name || userLocal.full_name) autor = userLocal.name || userLocal.full_name;
    } catch {}

    const comentarioObj = {
        usuario: autor,
        mensaje: newComment,
        fecha: new Date().toLocaleString()
    };

    try {
        await addCommentAction(selectedTicket.id, comentarioObj);
        setNewComment("");
        
        const updatedTicket = {
            ...selectedTicket,
            comentarios: [...(selectedTicket.comentarios || []), comentarioObj]
        };
        setSelectedTicket(updatedTicket);

    } catch (error) {
        alert("Error al enviar comentario");
    } finally {
        setIsSendingComment(false);
    }
  }

  const cards = [
    { label: "Total Tickets", value: stats.total, icon: "📂", color: "from-blue-600 to-indigo-700", textColor: "text-blue-50" },
    { label: "Pendientes", value: stats.pendientes, icon: "⏳", color: "from-yellow-500 to-orange-600", textColor: "text-yellow-50" },
    { label: "En Proceso", value: stats.enProgreso, icon: "⚙️", color: "from-purple-600 to-pink-600", textColor: "text-purple-50" },
    { label: "Resueltos", value: stats.resueltos, icon: "✅", color: "from-emerald-500 to-teal-600", textColor: "text-emerald-50" }
  ];

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-600 mt-1 font-medium">Bienvenido al sistema de gestión de tickets.</p>
        </div>
        
        <Link href="/create">
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
          >
            <span>+</span> Nuevo Ticket
          </motion.button>
        </Link>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div key={index} variants={itemVariants} className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${card.color} shadow-lg text-white`}>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className={`text-sm font-bold ${card.textColor} mb-1`}>{card.label}</p>
                  <h3 className="text-4xl font-extrabold">{card.value}</h3>
                </div>
                <span className="text-3xl bg-white/20 p-2 rounded-lg backdrop-blur-sm">{card.icon}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {stats.criticos > 0 && (
          <motion.div variants={itemVariants} className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-4 text-red-900 shadow-sm">
            <div className="bg-red-200 p-2 rounded-full text-xl">🔥</div>
            <div>
              <span className="font-extrabold">¡ATENCIÓN!</span> Tienes {stats.criticos} ticket(s) de prioridad ALTA pendientes.
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Últimos Tickets</h2>
            <Link href="/ticket" className="text-blue-700 text-sm hover:underline font-bold">Ver todos →</Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-gray-600 font-medium">No hay actividad reciente.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {tickets.slice(0, 4).map((ticket) => (
                  <div 
                    key={ticket.id} 
                    onClick={() => setSelectedTicket(ticket)} 
                    className="p-4 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${ticket.estado === 'resuelto' ? 'bg-emerald-500' : ticket.prioridad === 'alta' ? 'bg-red-600' : 'bg-blue-600'}`}></div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{ticket.titulo}</p>
                        <p className="text-xs text-gray-500 font-semibold">{ticket.creadoPor} • {ticket.fechaCreacion}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full border-2 font-bold capitalize ${ticket.estado === 'pendiente' ? 'bg-gray-100 text-gray-700 border-gray-300' : ticket.estado === 'en_progreso' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      {ticket.estado.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200 pointer-events-auto flex flex-col">
                
                <div className={`p-6 text-white ${selectedTicket.prioridad === 'alta' ? 'bg-red-600' : 'bg-slate-800'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
                        #{selectedTicket.id} • {selectedTicket.prioridad}
                      </p>
                      <h2 className="text-2xl font-bold">{selectedTicket.titulo}</h2>
                    </div>
                    <button onClick={() => setSelectedTicket(null)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                  <div className="mt-4 flex gap-4 text-sm font-medium opacity-90">
                    <span className="flex items-center gap-1">👤 {selectedTicket.creadoPor}</span>
                    <span className="flex items-center gap-1">📅 {selectedTicket.fechaCreacion}</span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  
                  <div className="flex gap-4">
                     <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 font-bold uppercase">Estado Actual</p>
                        <p className="text-gray-900 font-bold capitalize mt-1">{selectedTicket.estado.replace('_', ' ')}</p>
                     </div>
                     <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 font-bold uppercase">Prioridad</p>
                        <p className={`font-bold mt-1 uppercase ${selectedTicket.prioridad === 'alta' ? 'text-red-600' : 'text-gray-900'}`}>
                            {selectedTicket.prioridad}
                        </p>
                     </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Descripción del Problema</h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 text-gray-800 leading-relaxed font-medium">
                      {selectedTicket.descripcion}
                    </div>
                  </div>

                  {selectedTicket.imageUrl && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-2">📸 Evidencia Adjunta</h3>
                      <div className="relative h-56 w-full rounded-xl overflow-hidden border-2 border-gray-200">
                        <img src={selectedTicket.imageUrl} alt="Evidencia" className="object-cover w-full h-full" />
                      </div>
                      <a href={selectedTicket.imageUrl} target="_blank" className="text-blue-600 text-xs font-bold mt-2 block hover:underline">
                        Ver imagen completa ↗
                      </a>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        💬 Comentarios e Historial
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{selectedTicket.comentarios?.length || 0}</span>
                    </h3>
                    
                    <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                        {selectedTicket.comentarios && selectedTicket.comentarios.length > 0 ? (
                             selectedTicket.comentarios.map((c: any, i: number) => (
                                 <div key={i} className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm">
                                     <div className="flex justify-between items-center mb-1">
                                         <span className="font-bold text-gray-900">{c.usuario}</span>
                                         <span className="text-xs text-gray-400">{c.fecha}</span>
                                     </div>
                                     <p className="text-gray-700">{c.mensaje}</p>
                                 </div>
                             ))
                        ) : (
                            <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-400 text-xs">No hay comentarios aún. ¡Sé el primero!</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 items-start">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Escribe una respuesta o actualización..."
                            className="flex-1 p-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 text-sm focus:border-blue-600 focus:ring-0 outline-none min-h-[50px] resize-y font-medium"
                        />
                        <button
                            onClick={handleSendComment}
                            disabled={isSendingComment || !newComment.trim()}
                            className={`p-3 rounded-xl text-white font-bold transition-all shadow-md
                                ${isSendingComment || !newComment.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                            `}>
                            {isSendingComment ? (
                              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            )}
                        </button>
                    </div>

                  </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}