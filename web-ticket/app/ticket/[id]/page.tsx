"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Ticket } from "@/types/ticket";
import { getTicketById, updateTicket } from "@/utils/ticketStorage";

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const found = getTicketById(Number(id));
    if (!found) {
      router.push("/ticket");
      return;
    }

    if (!found.leido) {
      const user = JSON.parse(localStorage.getItem("sessionUser") || "{}");

      const actualizado: Ticket = {
        ...found,
        leido: true,
        historial: [
          {
            fecha: new Date().toLocaleString(),
            accion: "Ticket marcado como leído",
            usuario: user.name || "usuario",
          },
          ...(Array.isArray(found.historial) ? found.historial : []),
        ],
        comentarios: Array.isArray(found.comentarios) ? found.comentarios : [],
      };

      updateTicket(actualizado);
      setTicket(actualizado);
      return;
    }

    setTicket({
      ...found,
      historial: Array.isArray(found.historial) ? found.historial : [],
      comentarios: Array.isArray(found.comentarios) ? found.comentarios : [],
    });
  }, [id, router]);

  if (!ticket) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">{ticket.titulo}</h1>
        <p className="text-gray-700 mb-4">{ticket.descripcion}</p>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6 text-gray-700">
          <div><b>Estado:</b> {ticket.estado}</div>
          <div><b>Prioridad:</b> {ticket.prioridad}</div>
          <div><b>Creado por:</b> {ticket.creadoPor}</div>
          <div><b>Fecha:</b> {ticket.fechaCreacion}</div>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-3">Historial</h2>
        {ticket.historial.map((h, i) => (
          <div key={i} className="border-l-4 border-blue-600 pl-4 mb-3 text-sm">
            <div className="font-medium text-gray-800">{h.accion}</div>
            <div className="text-gray-600">{h.fecha} — {h.usuario}</div>
          </div>
        ))}

        <button
          onClick={() => router.push("/ticket")}
          className="mt-6 text-blue-600 hover:underline">
          ← Volver
        </button>
      </div>
    </div>
  );
}
