"use client";

import Link from "next/link";
import { useSidebar } from "@/context/SidebarContext";

const navItems = [
  { label: "Dashboard", href: "#", icon: "🏠" },
  { label: "Tickets", href: "/", icon: "🎫" },
  { label: "Crear ticket", href: "#", icon: "➕" },
];

export function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <aside
      className={`bg-slate-900 text-gray-100 flex flex-col transition-all duration-300
      ${isOpen ? "w-64" : "w-16"} overflow-hidden`}>
 
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
        {isOpen ? (
          <h1 className="text-xl font-bold">WebTicket</h1>
        ) : (
          <span></span>
        )}

        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-800 rounded-md">
          ☰
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800">
            <span>{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-300 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
          CM
        </div>
        {isOpen && (
          <div>
            <div className="font-semibold">Carlos Moreta</div>
            <div>Administrador</div>
          </div>
        )}
      </div>
    </aside>
  );
}
