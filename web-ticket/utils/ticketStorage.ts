import { Ticket } from "@/types/ticket";

const STORAGE_KEY = "tickets";

export function getTickets(): Ticket[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function saveTickets(tickets: Ticket[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

export function addTicket(ticket: Ticket) {
  const tickets = getTickets();
  tickets.unshift(ticket);
  saveTickets(tickets);
}

export function getTicketById(id: number): Ticket | undefined {
  return getTickets().find((t) => t.id === id);
}

export function updateTicket(updated: Ticket) {
  const tickets = getTickets().map((t) =>
    t.id === updated.id ? updated : t
  );
  saveTickets(tickets);
}
