"use client";

import { useRouter } from "next/navigation";
import { Ticket } from "@/types/ticket";
import { updateTicket } from "@/utils/ticketStorage";

interface TicketCardProps {
  ticket: Ticket;
  onDelete?: () => void; // 👈 ahora es válido
}

export function TicketCard({ ticket, onDelete }: TicketCardProps) {
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
      comentarios: Array.isArray(ticket.comentarios)
        ? ticket.comentarios
        : [],
    };

    updateTicket(actualizado);
    window.location.reload();
  }

  return (
    <div
      onClick={() => router.push(`/ticket/${ticket.id}`)}
      className={`border rounded-xl p-5 mb-4 shadow-sm bg-white hover:shadow-md cursor-pointer transition
        ${ticket.leido ? "border-gray-200" : "border-blue-400 ring-1 ring-blue-100"}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
            {ticket.titulo}
            {!ticket.leido && (
              <span className="text-xs font-semibold text-blue-700">
                • Nuevo
              </span>
            )}
          </h3>

          <p className="text-sm text-gray-700 mt-1">
            {ticket.descripcion}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
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
            className="text-xs border rounded px-2 py-1 text-gray-800"
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="resuelto">Resuelto</option>
          </select>

          {/* 🗑️ ELIMINAR */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("¿Eliminar este ticket?")) {
                  onDelete();
                }
              }}
              className="text-xs text-red-600 hover:underline"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
        <span>
          <span className="font-medium text-gray-700">Creado por:</span>{" "}
          {ticket.creadoPor}
        </span>
        <span>
          <span className="font-medium text-gray-700">Fecha:</span>{" "}
          {ticket.fechaCreacion}
        </span>
        <span>
          <span className="font-medium text-gray-700">ID:</span> #{ticket.id}
        </span>
      </div>
    </div>
  );
}
