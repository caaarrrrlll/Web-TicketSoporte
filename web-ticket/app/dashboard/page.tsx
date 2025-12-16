"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket } from "@/types/ticket";
import { getTickets } from "@/utils/ticketStorage";
import { TicketCard } from "@/components/TicketCard";
import { motion } from "framer-motion"; 

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [animate, setAnimate] = useState(false);

  const prevCriticosRef = useRef<number>(0);

  useEffect(() => {
    const stored = localStorage.getItem("sessionUser");
    if (!stored) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(stored));
    setTickets(getTickets());

    const interval = setInterval(() => {
      setTickets((prev) => {
        const next = getTickets();
        if (next.length !== prev.length) {
          setAnimate(true);
          setTimeout(() => setAnimate(false), 250);
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const activos = useMemo(() => tickets.filter((t) => t.estado !== "resuelto"), [tickets]);
  const criticos = useMemo(() => tickets.filter((t) => t.prioridad === "alta" && t.estado !== "resuelto"), [tickets]);
  const resueltos = useMemo(() => tickets.filter((t) => t.estado === "resuelto"), [tickets]);

  useEffect(() => {
    const prev = prevCriticosRef.current;
    if (criticos.length > prev) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.frequency.value = 880;
        osc.connect(ctx.destination);
        osc.start();
        setTimeout(() => osc.stop(), 180);
      } catch {}
    }
    prevCriticosRef.current = criticos.length;
  }, [criticos.length]);

  const ultimoActivo = activos.slice().sort((a, b) => b.id - a.id)[0] || null;

  if (!user) return null;

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-5xl mx-auto">

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <h1 className="text-3xl font-semibold text-gray-800">
          Bienvenido, {user.name} 👋
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Rol: <b className="uppercase">{user.role}</b>
        </p>
      </motion.div>
      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div
          variants={itemVars}
          whileHover={{ scale: 1.03 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={() => router.push("/ticket?estado=pendiente")}
          className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow">
          <p className="text-xs text-gray-600 uppercase font-bold tracking-wide">Tickets activos</p>
          <p className={`text-3xl font-bold text-blue-600 mt-2 ${animate ? "scale-110" : "scale-100"}`}>
            {activos.length}
          </p>
        </motion.div>
        <motion.div
          variants={itemVars}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/ticket?prioridad=alta")}
          className="bg-white border-l-4 border-l-red-500 border-y border-r border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow">
          <p className="text-xs text-red-600 uppercase font-bold tracking-wide">Críticos</p>
          <p className={`text-3xl font-bold text-red-600 mt-2 ${animate ? "scale-110" : "scale-100"}`}>
            {criticos.length}
          </p>
        </motion.div>
        <motion.div
          variants={itemVars}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/ticket?estado=resuelto")}
          className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow">
          <p className="text-xs text-gray-600 uppercase font-bold tracking-wide">Resueltos</p>
          <p className={`text-3xl font-bold text-green-600 mt-2 ${animate ? "scale-110" : "scale-100"}`}>
            {resueltos.length}
          </p>
        </motion.div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }} >
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Último ticket activo
          </h2>
          <button
            onClick={() => router.push("/ticket")}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline">
            Ver todos →
          </button>
        </div>

        {ultimoActivo ? (
          <TicketCard ticket={ultimoActivo} />
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
            <p>¡Todo limpio! No hay tickets activos 🎉</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}