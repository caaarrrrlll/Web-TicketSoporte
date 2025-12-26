"use client";

import { useEffect, useState } from "react";
import { getTicketsAction } from "@/actions/ticketActions"; 
import { Ticket } from "@/types/ticket";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client"; 

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      setTickets(data);

      const counts = {
        total: data.length,
        pendientes: data.filter(t => t.estado === "pendiente").length,
        enProgreso: data.filter(t => t.estado === "en_progreso").length,
        resueltos: data.filter(t => t.estado === "resuelto").length,
        criticos: data.filter(t => t.prioridad === "alta" && t.estado !== "resuelto").length
      };
      setStats(counts);
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
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'tickets' }, 
        (payload) => {
          console.log('Cambio detectado en BD:', payload);
          loadData(); 
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
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
                {tickets.slice(0, 5).map((ticket) => (
                  <div key={ticket.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
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
    </div>
  );
}