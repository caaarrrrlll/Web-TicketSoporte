"use client";

import { Ticket } from "@/types/ticket";

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <div className="border rounded-lg p-4 mb-3 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">{ticket.titulo}</h3>
        <span
          className={
            "text-xs font-semibold px-2 py-1 rounded-full " +
            (ticket.prioridad === "alta"
              ? "bg-red-100 text-red-700"
              : ticket.prioridad === "media"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700")
          }
        >
          {ticket.prioridad.toUpperCase()}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-2">
        {ticket.descripcion}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Estado: {ticket.estado}</span>
        <span>Creado por: {ticket.creadoPor}</span>
        <span>{ticket.fechaCreacion}</span>
      </div>
    </div>
  );
}
