"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Ticket } from "@/types/ticket";
import { getTickets, deleteTicket } from "@/utils/ticketStorage";
import { TicketCard } from "@/components/TicketCard";
import { AnimatePresence, motion } from "framer-motion"; 

export default function TicketListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");

  const estadoQuery = searchParams.get("estado");
  const prioridadQuery = searchParams.get("prioridad");

  useEffect(() => {
    setTickets(getTickets());
    const interval = setInterval(() => {
      setTickets(getTickets());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtrados = useMemo(() => {
    return tickets
      .filter((t) => {
        const okEstado = !estadoQuery || t.estado === estadoQuery;
        const okPrioridad = !prioridadQuery || t.prioridad === prioridadQuery;
        const texto = t.titulo.toLowerCase() + " " + t.descripcion.toLowerCase();
        const okSearch = texto.includes(search.toLowerCase());
        return okEstado && okPrioridad && okSearch;
      })
      .sort((a, b) => {
        if (a.prioridad === "alta" && b.prioridad !== "alta") return -1;
        if (a.prioridad !== "alta" && b.prioridad === "alta") return 1;
        return b.id - a.id;
      });
  }, [tickets, estadoQuery, prioridadQuery, search]);

  function aplicarFiltro(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/ticket?${params.toString()}`);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Tickets</h1>
        <button
          onClick={() => router.push("/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-transform">
          Crear ticket
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por título o descripción…"
        className="border p-3 rounded-lg w-full mb-4 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-100 outline-none transition-shadow"
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={estadoQuery || ""}
          onChange={(e) => aplicarFiltro("estado", e.target.value || null)}
          className="border rounded px-3 py-2 text-sm text-gray-800 bg-white">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En progreso</option>
          <option value="resuelto">Resuelto</option>
        </select>
        
        <select
          value={prioridadQuery || ""}
          onChange={(e) => aplicarFiltro("prioridad", e.target.value || null)}
          className="border rounded px-3 py-2 text-sm text-gray-800 bg-white">
          <option value="">Todas las prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>

        {(estadoQuery || prioridadQuery) && (
          <button
            onClick={() => router.push("/ticket")}
            className="text-sm text-blue-600 hover:underline">
            Limpiar filtros
          </button>
        )}
      </div>
      <motion.div layout className="flex flex-col gap-0">
        <AnimatePresence mode="popLayout">
          {filtrados.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-6 text-gray-700 text-center">
              No hay tickets para mostrar ☕
            </motion.div>
          ) : (
            filtrados.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onDelete={() => {
                  deleteTicket(ticket.id);
                  setTickets(getTickets());
                }}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}