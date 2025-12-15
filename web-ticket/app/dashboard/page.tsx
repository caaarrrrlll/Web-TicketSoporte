"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket } from "@/types/ticket";
import { getTickets } from "@/utils/ticketStorage";
import { TicketCard } from "@/components/TicketCard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("sessionUser");
    if (!stored) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(stored));
    setTickets(getTickets());
    const interval = setInterval(() => {
    setTickets(getTickets());
}, 5000);

return () => clearInterval(interval);
  }, [router]);
  if (!user) return null;

  const activos = tickets.filter(t => t.estado !== "resuelto");
  const criticos = tickets.filter(t => t.prioridad === "alta" && t.estado !== "resuelto");
  const resueltos = tickets.filter(t => t.estado === "resuelto");
  const ultimoActivo = activos.length > 0 ? activos[0] : null;
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 bg-white border rounded-xl shadow p-8">
        <h1 className="text-3xl font-semibold text-gray-800">
          Bienvenido, {user.name}
        </h1>
        <p className="text-sm text-gray-600">
          Rol: <b>{user.role}</b>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-xs text-gray-600">Tickets activos</p>
          <p className="text-3xl font-bold text-blue-600">
            {activos.length}
          </p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-xs text-gray-600">Críticos</p>
          <p className="text-3xl font-bold text-red-600">
            {criticos.length}
          </p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-xs text-gray-600">Resueltos</p>
          <p className="text-3xl font-bold text-green-600">
            {resueltos.length}
          </p>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Último ticket activo
        </h2>
        <button
          onClick={() => router.push("/ticket")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Ver todos
        </button>
      </div>

      {ultimoActivo ? (
        <TicketCard ticket={ultimoActivo} />
      ) : (
        <div className="bg-white border rounded-xl p-6 text-gray-600">
          No hay tickets activos
        </div>
      )}
    </div>
  );
}
