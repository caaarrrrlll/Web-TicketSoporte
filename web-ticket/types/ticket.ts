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
  prioridad: "alta" | "media" | "baja";
  estado: "pendiente" | "en_progreso" | "resuelto";
  category?: string; 
  assigned_to?: string; 
  creadoPor: string;
  fechaCreacion: string;
  leido: boolean;
  imageUrl?: string; 
  comentarios?: any[];
  historial?: any[];
}
