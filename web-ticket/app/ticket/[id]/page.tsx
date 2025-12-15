"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Ticket } from "@/types/ticket";
import { getTicketById, updateTicket } from "@/utils/ticketStorage";

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comentario, setComentario] = useState("");

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!id) return;

    const found = getTicketById(Number(id));
    if (!found) {
      router.push("/ticket");
      return;
    }

    const normalizado: Ticket = {
      ...found,
      historial: Array.isArray(found.historial) ? found.historial : [],
      comentarios: Array.isArray(found.comentarios) ? found.comentarios : [],
      leido: found.leido ?? true,
    };

    if (!normalizado.leido) {
      const user = JSON.parse(localStorage.getItem("sessionUser") || "{}");
      normalizado.leido = true;
      normalizado.historial.unshift({
        fecha: new Date().toLocaleString(),
        accion: "Ticket abierto",
        usuario: user.name || "usuario",
      });
      updateTicket(normalizado);
    }

    setTicket(normalizado);
  }, [id, router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.historial.length, ticket?.comentarios.length]);

  function agregarComentario() {
    if (!ticket || !comentario.trim()) return;

    const user = JSON.parse(localStorage.getItem("sessionUser") || "{}");

    const actualizado: Ticket = {
      ...ticket,
      comentarios: [
        ...ticket.comentarios,
        {
          fecha: new Date().toLocaleString(),
          mensaje: comentario,
          usuario: user.name || "usuario",
        },
      ],
    };

    updateTicket(actualizado);
    setTicket(actualizado);
    setComentario("");
  }

  if (!ticket) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">

        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          {ticket.titulo}
        </h1>

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
            <div className="text-gray-600">
              {h.fecha} — {h.usuario}
            </div>
          </div>
        ))}

        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-3">
          Comentarios
        </h2>

        {ticket.comentarios.map((c, i) => (
          <div key={i} className="border-l-4 border-gray-300 pl-4 mb-3 text-sm">
            <div className="font-medium text-gray-800">{c.usuario}</div>
            <div className="text-gray-700">{c.mensaje}</div>
            <div className="text-gray-500 text-xs">{c.fecha}</div>
          </div>
        ))}

        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Escribe un comentario…"
          className="border p-3 rounded-lg w-full mt-3 text-gray-800 placeholder-gray-500"
        />

        <button
          onClick={agregarComentario}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Agregar comentario
        </button>

        <div ref={endRef} />

        <button
          onClick={() => router.push("/ticket")}
          className="mt-6 text-blue-600 hover:underline">
          ← Volver a tickets
        </button>
      </div>
    </div>
  );
}
