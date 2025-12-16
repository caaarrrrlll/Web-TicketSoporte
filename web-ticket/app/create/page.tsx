"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTicket } from "@/utils/ticketStorage";
import { Ticket } from "@/types/ticket";
import { motion } from "framer-motion"; // Importamos Framer Motion

export default function CrearTicketPage() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<"alta" | "media" | "baja">("media");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulamos un pequeño retraso para que se vea la animación de carga
    setTimeout(() => {
      const user = JSON.parse(localStorage.getItem("sessionUser") || "{}");

      const nuevoTicket: Ticket = {
        id: Date.now(),
        titulo,
        descripcion,
        prioridad,
        estado: "pendiente",
        creadoPor: user.name || "usuario",
        fechaCreacion: new Date().toLocaleString(),
        leido: false,
        comentarios: [],
        historial: [
          {
            fecha: new Date().toLocaleString(),
            accion: "Ticket creado",
            usuario: user.name || "usuario",
          },
        ],
      };
      addTicket(nuevoTicket);
      router.push("/ticket");
    }, 600);
  }

  // Configuración visual de las prioridades para el selector
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
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        
        {/* HEADER DECORATIVO */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Nuevo Ticket
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            Describe el problema detalladamente para ayudarte mejor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {/* CAMPO TÍTULO */}
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

          {/* CAMPO DESCRIPCIÓN */}
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

          {/* SELECTOR DE PRIORIDAD VISUAL (GRID) */}
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
                  `}
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <span className={`text-sm font-semibold ${prioridad === p.id ? '' : 'text-gray-600'}`}>
                    {p.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* BOTÓN DE SUBMIT ANIMADO */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all
              ${isSubmitting 
                ? "bg-gray-400 cursor-not-allowed text-gray-100" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              }
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : (
              "Crear Ticket"
            )}
          </motion.button>

        </form>
      </div>
    </motion.div>
  );
}