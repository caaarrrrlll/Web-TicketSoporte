"use client";

import { useRouter } from "next/navigation";
import { Ticket } from "@/types/ticket";
import { updateTicket } from "@/utils/ticketStorage";
import React, { useRef, useEffect, useState } from 'react';
import { motion } from "framer-motion"; 

interface TicketCardProps {
  ticket: Ticket;
  onDelete?: () => void;
}

export function TicketCard({ ticket, onDelete }: TicketCardProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [animationDuration, setAnimationDuration] = useState('20s');

  useEffect(() => {
    if (contentRef.current && containerRef.current) {
      const content = contentRef.current;
      const container = containerRef.current;

      const checkOverflow = () => {
        if (content.scrollHeight > container.offsetHeight) {
          setIsOverflowing(true);
          const scrollHeight = content.scrollHeight;
          const duration = Math.max(15, scrollHeight * 0.2); 
          setAnimationDuration(`${duration}s`);
        } else {
          setIsOverflowing(false);
          setAnimationDuration('20s');
        }
      };
      setTimeout(checkOverflow, 100);
    }
  }, [ticket.descripcion]);
  const badgePrioridad =
    ticket.prioridad === "alta"
      ? "bg-red-100 text-red-700"
      : ticket.prioridad === "media"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

  const badgeEstado =
    ticket.estado === "pendiente"
      ? "bg-gray-100 text-gray-700"
      : ticket.estado === "en_progreso"
      ? "bg-blue-100 text-blue-700"
      : "bg-emerald-100 text-emerald-700";

  function cambiarEstado(e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation();
    const nuevoEstado = e.target.value as Ticket["estado"];
    const user = JSON.parse(localStorage.getItem("sessionUser") || "{}");

    const actualizado: Ticket = {
      ...ticket,
      estado: nuevoEstado,
      historial: [
        {
          fecha: new Date().toLocaleString(),
          accion: `Estado cambiado a ${nuevoEstado}`,
          usuario: user.name || "usuario",
        },
        ...(Array.isArray(ticket.historial) ? ticket.historial : []),
      ],
      comentarios: Array.isArray(ticket.comentarios) ? ticket.comentarios : [],
    };

    updateTicket(actualizado);
    window.location.reload();
  }

  const marqueeStyle = isOverflowing ? { animationDuration: animationDuration, animationTimingFunction: 'linear' } : {};
  const marqueeClass = isOverflowing ? 'animate-vertical-marquee will-change-transform' : '';

  return (
    <motion.div
      layout 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95 }} 
      whileHover={{ scale: 1.01, boxShadow: "0px 10px 20px rgba(0,0,0,0.05)" }} 
      transition={{ duration: 0.2 }} 
      onClick={() => router.push(`/ticket/${ticket.id}`)}
      className={`border rounded-xl p-5 mb-4 shadow-sm bg-white cursor-pointer relative overflow-hidden
        ${ticket.leido ? "border-gray-200" : "border-blue-400 ring-1 ring-blue-100"}
      `}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0"> 
          <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2 truncate">
            {ticket.titulo}
            {!ticket.leido && (
              <span className="text-xs font-semibold text-blue-700 shrink-0">
                • Nuevo
              </span>
            )}
          </h3>

          <div 
            ref={containerRef}
            className="mt-1 text-sm text-gray-700 h-14 overflow-hidden relative [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
            <p 
              ref={contentRef} 
              className={`whitespace-pre-wrap break-words ${marqueeClass}`}
              style={marqueeStyle}>
              {ticket.descripcion}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0 z-10 ml-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgePrioridad}`}>
            {ticket.prioridad.toUpperCase()}
          </span>

          <span className={`text-xs font-medium px-3 py-1 rounded-full ${badgeEstado}`}>
            {ticket.estado.replace("_", " ")}
          </span>

          {ticket.estado === "resuelto" && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-600 text-white animate-pulse">
              RESUELTO
            </span>
          )}

          <select
            value={ticket.estado}
            onClick={(e) => e.stopPropagation()}
            onChange={cambiarEstado}
            className="text-xs border rounded px-2 py-1 text-gray-800 bg-white hover:bg-gray-50 cursor-pointer focus:ring-2 focus:ring-blue-200 outline-none mt-1">
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="resuelto">Resuelto</option>
          </select>

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("¿Eliminar este ticket?")) {
                  onDelete();
                }
              }}
              className="text-xs text-red-600 hover:text-red-800 hover:underline mt-1"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600 pt-3 border-t border-gray-100">
        <span className="truncate">
          <span className="font-medium text-gray-700">Creado por:</span> {ticket.creadoPor}
        </span>
        <span className="truncate">
          <span className="font-medium text-gray-700">Fecha:</span> {ticket.fechaCreacion}
        </span>
        <span className="truncate">
          <span className="font-medium text-gray-700">ID:</span> #{ticket.id}
        </span>
      </div>
    </motion.div>
  );
}