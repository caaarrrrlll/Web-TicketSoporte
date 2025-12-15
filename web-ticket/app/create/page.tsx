"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTicket } from "@/utils/ticketStorage";
import { Ticket } from "@/types/ticket";

export default function CrearTicketPage() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<"alta" | "media" | "baja">("media");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("sessionUser") || "{}");

    const nuevoTicket: Ticket = {
  id: Date.now(),
  titulo,
  descripcion,
  prioridad,
  estado: "pendiente",
  creadoPor: user.name || "usuario",
  fechaCreacion: new Date().toLocaleString(),
  historial: [
    {
      fecha: new Date().toLocaleString(),
      accion: "Ticket creado",
      usuario: user.name || "usuario",
    },
  ],
  comentarios: [],
};


    addTicket(nuevoTicket);
    router.push("/ticket");
  }

  return (
    <div className="max-w-xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">

        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Crear ticket
        </h1>

        <label className="text-sm font-medium text-gray-700">Título</label>
        <input
          className="border p-3 rounded-lg w-full mt-2 mb-4"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <label className="text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          className="border p-3 rounded-lg w-full mt-2 mb-4 min-h-[120px]"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />

        <label className="text-sm font-medium text-gray-700">Prioridad</label>
        <select
          className="border p-3 rounded-lg w-full mt-2 mb-6"
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value as any)}>
            
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>

        <button className="bg-blue-600 text-white w-full py-3 rounded-lg hover:bg-blue-700 transition">
          Guardar ticket
        </button>
      </form>
    </div>
  );
}
