"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicketAction } from "@/utils/actions/ticketActions"; 
import { Ticket } from "@/types/ticket";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser"; 

export default function CrearTicketPage() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<"alta" | "media" | "baja">("media");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function playAlertSound() {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playBeep = (startTime: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.value = freq;
      osc.start(startTime);
      osc.stop(startTime + 0.1);
      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
    };
    const now = ctx.currentTime;
    playBeep(now, 880);       
    playBeep(now + 0.15, 880); 
  }

  async function sendEmailAlert(ticket: Ticket) {
    const SERVICE_ID = "service_0v2vmdd";   
    const TEMPLATE_ID = "template_pjxzm3s"; 
    const PUBLIC_KEY = "HxSntOEo44paa0rZl";   

    const templateParams = {
      to_name: "Admin",
      from_name: ticket.creadoPor,
      titulo: ticket.titulo,
      message: ticket.descripcion,
      prioridad: ticket.prioridad.toUpperCase(),
      fecha: ticket.fechaCreacion,
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    } catch (error) {
      console.error("Error al enviar email:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    if (prioridad === "alta") {
      playAlertSound();
    }

    let createdBy = "Usuario Web";
    try {
        const userLocal = JSON.parse(localStorage.getItem("sessionUser") || "{}");
        if (userLocal.name || userLocal.full_name) {
            createdBy = userLocal.name || userLocal.full_name;
        }
    } catch {}

    const nuevoTicket: Ticket = {
      id: 0, 
      titulo,
      descripcion,
      prioridad,
      estado: "pendiente",
      creadoPor: createdBy, 
      fechaCreacion: new Date().toLocaleString(),
      leido: false,
      comentarios: [],
      historial: [
        {
          fecha: new Date().toLocaleString(),
          accion: "Ticket creado",
          usuario: createdBy,
        },
      ],
    };

    if (prioridad === "alta") {
        sendEmailAlert(nuevoTicket);
    }

    try {
      await createTicketAction(nuevoTicket);
      router.push("/ticket");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar el ticket en la base de datos.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const prioridadesConfig = [
    { 
      id: "baja", 
      label: "Baja", 
      emoji: "☕",
      colorClass: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
      activeClass: "ring-2 ring-emerald-500 bg-emerald-100"
    },
    { 
      id: "media", 
      label: "Media", 
      emoji: "🔧",
      colorClass: "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100",
      activeClass: "ring-2 ring-yellow-500 bg-yellow-100"
    },
    { 
      id: "alta", 
      label: "Alta", 
      emoji: "🔥",
      colorClass: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
      activeClass: "ring-2 ring-red-500 bg-red-100"
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        <div className={`p-6 text-white transition-colors duration-300 ${prioridad === 'alta' ? 'bg-red-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Nuevo Ticket
          </h1>
          <p className="text-blue-50 text-sm mt-1">
            {prioridad === 'alta' 
              ? "⚠️ ALERTA CRÍTICA: Se notificará a los administradores inmediatamente." 
              : "Describe el problema detalladamente para ayudarte mejor."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Título del problema
            </label>
            <input
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
              placeholder="Ej: Error al cargar imágenes..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              Descripción detallada
            </label>
            <textarea
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 min-h-[150px] resize-y"
              placeholder="Explica qué pasó, pasos para reproducirlo, etc..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Nivel de Prioridad
            </label>
            <div className="grid grid-cols-3 gap-3">
              {prioridadesConfig.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPrioridad(p.id as any)}
                  className={`
                    cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-center gap-1 transition-all duration-200
                    ${prioridad === p.id ? p.activeClass : `border-gray-200 bg-white hover:border-gray-300`}
                  `}>
                  <span className="text-2xl">{p.emoji}</span>
                  <span className={`text-sm font-semibold ${prioridad === p.id ? '' : 'text-gray-600'}`}>
                    {p.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all
              ${isSubmitting 
                ? "bg-gray-400 cursor-not-allowed text-gray-100" 
                : prioridad === 'alta'
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/30"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              }
            `}>
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {prioridad === 'alta' ? "Notificando y Guardando..." : "Guardando..."}
              </span>
            ) : (
              prioridad === 'alta' ? "CREAR TICKET CRÍTICO" : "Crear Ticket"
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}