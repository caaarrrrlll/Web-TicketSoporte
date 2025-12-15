"use client";

import { useRouter } from "next/navigation";
import { Ticket } from "@/types/ticket";
import { updateTicket } from "@/utils/ticketStorage";

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const router = useRouter();

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
    };

    updateTicket(actualizado);
    window.location.reload(); 
  }

  return (
    <div
      onClick={() => router.push(`/ticket/${ticket.id}`)}
      className="border border-gray-200 rounded-xl p-5 mb-4 shadow-sm bg-white hover:shadow-md cursor-pointer transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">
            {ticket.titulo}
          </h3>
          <p className="text-sm text-gray-700 mt-1">
            {ticket.descripcion}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${badgePrioridad}`}>
            {ticket.prioridad.toUpperCase()}
          </span>

          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${badgeEstado}`}>
            {ticket.estado.replace("_", " ")}
          </span>

          <select
            value={ticket.estado}
            onClick={(e) => e.stopPropagation()}
            onChange={cambiarEstado}
            className="text-xs border rounded px-2 py-1">
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="resuelto">Resuelto</option>
          </select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500">
        <span>
          <b>Creado por:</b> {ticket.creadoPor}
        </span>
        <span>
          <b>Fecha:</b> {ticket.fechaCreacion}
        </span>
        <span>
          <b>ID:</b> #{ticket.id}
        </span>
      </div>
    </div>
  );
}
