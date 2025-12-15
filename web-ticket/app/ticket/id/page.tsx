"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Ticket } from "@/types/ticket";
import { getTicketById, updateTicket } from "@/utils/ticketStorage";

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comentario, setComentario] = useState("");

  useEffect(() => {
    const found = getTicketById(Number(id));
    if (!found) {
      router.push("/ticket");
      return;
    }
    setTicket(found);
  }, [id, router]);

  function agregarComentario() {
    if (!ticket || !comentario.trim()) return;

    const user = JSON.parse(localStorage.getItem("sessionUser") || "{}");

    const actualizado: Ticket = {
      ...ticket,
      comentarios: [
        {
          fecha: new Date().toLocaleString(),
          mensaje: comentario,
          usuario: user.name || "usuario",
        },
        ...ticket.comentarios,
      ],
    };

    updateTicket(actualizado);
    setTicket(actualizado);
    setComentario("");
  }

  if (!ticket) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border rounded-xl shadow-lg p-8">

        <h1 className="text-2xl font-semibold mb-2">{ticket.titulo}</h1>
        <p className="text-gray-600 mb-4">{ticket.descripcion}</p>

        {/* Comentarios */}
        <h2 className="text-lg font-semibold mb-3">Comentarios</h2>

        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="border p-3 rounded-lg w-full mb-3"
          placeholder="Escribe un comentario..."
        />

        <button
          onClick={agregarComentario}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-6"
        >
          Agregar comentario
        </button>

        {ticket.comentarios.length === 0 && (
          <p className="text-sm text-gray-500">Sin comentarios</p>
        )}

        {ticket.comentarios.map((c, i) => (
          <div key={i} className="border-l-4 border-blue-500 pl-4 mb-3">
            <div className="font-medium">{c.usuario}</div>
            <div className="text-sm">{c.mensaje}</div>
            <div className="text-xs text-gray-500">{c.fecha}</div>
          </div>
        ))}

        <button
          onClick={() => router.push("/ticket")}
          className="mt-6 text-blue-600 hover:underline"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}
