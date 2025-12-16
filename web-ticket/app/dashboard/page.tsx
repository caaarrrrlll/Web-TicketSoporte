"use client";

import { useEffect, useState } from "react";
import { getTicketsAction } from "@/actions/ticketActions"; // Reutilizamos tu acción
import { Ticket } from "@/types/ticket";
import { motion } from "framer-motion";
import Link from "next/link";

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

  // 1. Cargar datos reales
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getTicketsAction(); // Trae todos los tickets (ordenados por fecha)
        setTickets(data);

        // 2. Calcular estadísticas al instante
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
    loadData();
  }, []);

  // Configuración de las Tarjetas de Resumen
  const cards = [
    {
      label: "Total Tickets",
      value: stats.total,
      icon: "📂",
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-50"
    },
    {
      label: "Pendientes",
      value: stats.pendientes,
      icon: "⏳",
      color: "from-yellow-400 to-orange-500",
      textColor: "text-yellow-50"
    },
    {
      label: "En Proceso",
      value: stats.enProgreso,
      icon: "⚙️",
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-50"
    },
    {
      label: "Resueltos",
      value: stats.resueltos,
      icon: "✅",
      color: "from-emerald-400 to-teal-500",
      textColor: "text-emerald-50"
    }
  ];

  // Variante para la animación escalonada (Stagger)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1 // Cada elemento aparece 0.1s después del anterior
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      
      {/* HEADER + SALUDO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
          <p className="text-slate-500 mt-1">Bienvenido al sistema de gestión de tickets.</p>
        </div>
        
        {/* Botón de acción rápida */}
        <Link href="/create">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-slate-500/20 flex items-center gap-2"
          >
            <span>+</span> Nuevo Ticket
          </motion.button>
        </Link>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* 1. SECCIÓN DE TARJETAS (STATS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${card.color} shadow-lg text-white`}
            >
              {/* Círculo decorativo de fondo */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className={`text-sm font-medium ${card.textColor} mb-1`}>{card.label}</p>
                  <h3 className="text-4xl font-bold">{card.value}</h3>
                </div>
                <span className="text-3xl bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  {card.icon}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 2. ALERTA DE CRÍTICOS (Solo aparece si hay urgencias) */}
        {stats.criticos > 0 && (
          <motion.div 
            variants={itemVariants}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4 text-red-800"
          >
            <div className="bg-red-100 p-2 rounded-full">🔥</div>
            <div>
              <span className="font-bold">¡Atención!</span> Tienes {stats.criticos} ticket(s) de prioridad ALTA pendientes de resolver.
            </div>
          </motion.div>
        )}

        {/* 3. ACTIVIDAD RECIENTE */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Últimos Tickets</h2>
            <Link href="/ticket" className="text-blue-600 text-sm hover:underline font-medium">
              Ver todos →
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay actividad reciente. ¡Crea tu primer ticket!
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* Mostramos solo los 5 más recientes */}
                {tickets.slice(0, 5).map((ticket) => (
                  <div key={ticket.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      {/* Icono de estado pequeño */}
                      <div className={`w-2 h-2 rounded-full 
                        ${ticket.estado === 'resuelto' ? 'bg-emerald-500' : ticket.prioridad === 'alta' ? 'bg-red-500' : 'bg-blue-500'}
                      `}></div>
                      
                      <div>
                        <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {ticket.titulo}
                        </p>
                        <p className="text-xs text-slate-400">
                          {ticket.creadoPor} • {ticket.fechaCreacion}
                        </p>
                      </div>
                    </div>

                    <span className={`text-xs px-3 py-1 rounded-full border font-medium capitalize
                      ${ticket.estado === 'pendiente' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                        ticket.estado === 'en_progreso' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100'}
                    `}>
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