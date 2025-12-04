import { Ticket } from "@/types/ticket";
import { TicketCard } from "@/components/TicketCard";

export default function HomePage() {
  return (
    <div>
      <div className="w-full bg-slate-900 text-white px-6 py-4 mb-6 -ml-6 -mr-6">
        <h1 className="text-2xl font-bold">Panel de Soporte</h1>
        <p className="text-sm text-slate-300">Visualización de tickets</p>
      </div>
      {ticketsMock.map((t) => (
        <TicketCard key={t.id} ticket={t} />
      ))}
    </div>
  );
}

const ticketsMock: Ticket[] = [
  {
    id: 1,
    titulo: "Falla en impresora de tickets",
    descripcion: "La impresora del punto de venta 3 dejó de imprimir al finalizar el pago.",
    estado: "pendiente",
    prioridad: "alta",
    creadoPor: "carlos.moreta",
    fechaCreacion: "04/12/2025 08:30",
  },
  {
    id: 2,
    titulo: "Alerta de tiempo de respuesta alto",
    descripcion: "El servicio de pagos está respondiendo por encima de 5 segundos.",
    estado: "en_progreso",
    prioridad: "media",
    creadoPor: "soporte.n1",
    fechaCreacion: "04/12/2025 08:10",
  },
  {
    id: 3,
    titulo: "Consulta de usuario sobre acceso",
    descripcion: "Usuario reporta que no puede ingresar al módulo de reportes.",
    estado: "resuelto",
    prioridad: "baja",
    creadoPor: "mesa.ayuda",
    fechaCreacion: "04/12/2025 07:50",
  },
];
