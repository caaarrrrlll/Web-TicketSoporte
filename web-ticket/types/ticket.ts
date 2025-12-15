export type Prioridad = "alta" | "media" | "baja";
export type Estado = "pendiente" | "en_progreso" | "resuelto";

export interface TicketHistory {
  fecha: string;
  accion: string;
  usuario: string;
}

export interface TicketComment {
  fecha: string;
  mensaje: string;
  usuario: string;
}

export interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: Estado;
  prioridad: Prioridad;
  creadoPor: string;
  fechaCreacion: string;
  historial: TicketHistory[];
  comentarios: TicketComment[];
  leido: boolean;
}
