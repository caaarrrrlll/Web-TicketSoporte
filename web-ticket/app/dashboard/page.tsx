"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket } from "@/types/ticket";
import { getTickets } from "@/utils/ticketStorage";
import { TicketCard } from "@/components/TicketCard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [animate, setAnimate] = useState(false);

  // para detectar nuevos críticos
  const prevCriticosRef = useRef<number>(0);

  useEffect(() => {
    const stored = localStorage.getItem("sessionUser");
    if (!stored) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(stored));
    setTickets(getTickets());

    const interval = setInterval(() => {
      setTickets((prev) => {
        const next = getTickets();

        if (next.length !== prev.length) {
          setAnimate(true);
          setTimeout(() => setAnimate(false), 250);
        }

        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const activos = useMemo(
    () => tickets.filter((t) => t.estado !== "resuelto"),
    [tickets]
  );

  const criticos = useMemo(
    () =>
      tickets.filter(
        (t) => t.prioridad === "alta" && t.estado !== "resuelto"
      ),
    [tickets]
  );

  const resueltos = useMemo(
    () => tickets.filter((t) => t.estado === "resuelto"),
    [tickets]
  );

  // 🔔 sonido solo si suben críticos
  useEffect(() => {
    const prev = prevCriticosRef.current;
    if (criticos.length > prev) {
      try {
        const ctx = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.frequency.value = 880;
        osc.connect(ctx.destination);
        osc.start();
        setTimeout(() => osc.stop(), 180);
      } catch {}
    }
    prevCriticosRef.current = criticos.length;
  }, [criticos.length]);

  const ultimoActivo =
    activos.slice().sort((a, b) => b.id - a.id)[0] || null;

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* BIENVENIDA */}
      <div className="mb-8 bg-white border border-gray-200 rounded-xl shadow p-8">
        <h1 className="text-3xl font-semibold text-gray-800">
          Bienvenido, {user.name}
        </h1>
        <p className="text-sm text-gray-600">
          Rol: <b>{user.role}</b>
        </p>
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Activos */}
        <div
          onClick={() => router.push("/ticket?estado=pendiente")}
          className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md transition"
        >
          <p className="text-xs text-gray-600">Tickets activos</p>
          <p
            className={`text-3xl font-bold text-blue-600 transition-transform duration-300 ${
              animate ? "scale-110" : "scale-100"
            }`}
          >
            {activos.length}
          </p>
        </div>

        {/* Críticos */}
        <div
          onClick={() => router.push("/ticket?prioridad=alta")}
          className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md transition"
        >
          <p className="text-xs text-gray-600">Críticos</p>
          <p
            className={`text-3xl font-bold text-red-600 transition-transform duration-300 ${
              animate ? "scale-110" : "scale-100"
            }`}
          >
            {criticos.length}
          </p>
        </div>

        {/* Resueltos */}
        <div
          onClick={() => router.push("/ticket?estado=resuelto")}
          className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md transition"
        >
          <p className="text-xs text-gray-600">Resueltos</p>
          <p
            className={`text-3xl font-bold text-green-600 transition-transform duration-300 ${
              animate ? "scale-110" : "scale-100"
            }`}
          >
            {resueltos.length}
          </p>
        </div>
      </div>

      {/* ÚLTIMO TICKET */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Último ticket activo
        </h2>

        <button
          onClick={() => router.push("/ticket")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Ver todos
        </button>
      </div>

      {ultimoActivo ? (
        <TicketCard ticket={ultimoActivo} />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-700">
          No hay tickets activos
        </div>
      )}
    </div>
  );
}
