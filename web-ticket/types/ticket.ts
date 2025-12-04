export type TicketEstado = "pendiente" | "en_progreso" | "resuelto";
export type TicketPrioridad = "baja" | "media" | "alta";

export interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: TicketEstado;
  prioridad: TicketPrioridad;
  creadoPor: string;
  fechaCreacion: string;
}
