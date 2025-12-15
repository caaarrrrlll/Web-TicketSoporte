"use client";

import { useEffect, useState } from "react";
import { Ticket } from "@/types/ticket";
import { TicketCard } from "@/components/TicketCard";
import { getTickets } from "@/utils/ticketStorage";

export default function TicketPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [estado, setEstado] = useState("todos");
  const [prioridad, setPrioridad] = useState("todas");

  useEffect(() => {
  setTickets(getTickets());

  const interval = setInterval(() => {
    setTickets(getTickets());
  }, 5000); 

  return () => clearInterval(interval);
}, []);


  const filtrados = tickets.filter((t) => {
    const okEstado = estado === "todos" || t.estado === estado;
    const okPrioridad = prioridad === "todas" || t.prioridad === prioridad;
    return okEstado && okPrioridad;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Tickets</h1>

        <div className="flex gap-4">
          <select
            className="border p-2 rounded text-gray-800"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}>
              
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="resuelto">Resuelto</option>
          </select>

          <select
            className="border p-2 rounded text-gray-800"
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value)}>

            <option value="todas">Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      </div>

      {filtrados.length === 0 && (
        <div className="bg-white p-6 rounded border text-gray-600">
          No hay tickets con esos filtros
        </div>
      )}

      {filtrados.map((t) => (
        <TicketCard key={t.id} ticket={t} />
      ))}
    </div>
  );
}
