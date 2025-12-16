"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { createClient } from "@/utils/supabase/client"; 
const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Tickets", href: "/ticket" },
  { label: "Crear ticket", href: "/create" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, toggleSidebar } = useSidebar();
  const supabase = createClient(); 
  const [userEmail, setUserEmail] = useState<string | null>("Cargando...");
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "Usuario");
      } else {
        setUserEmail(null);
      }
    }
    getUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh(); 
  }

  return (
    <aside
      className={`bg-slate-900 text-gray-100 flex flex-col transition-all duration-300
      ${isOpen ? "w-64" : "w-16"} overflow-hidden h-screen sticky top-0`}>
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
        {isOpen && <h1 className="text-xl font-bold">WebTicket</h1>}

        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-800 rounded-md">
          ☰
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition
                ${active ? "bg-slate-800" : "hover:bg-slate-800"}`}
              title={item.label}>
              {isOpen ? item.label : item.label.charAt(0)}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-300">
        {isOpen && (
          <div className="mb-2">
            <div className="font-semibold text-gray-100 truncate">{userEmail}</div>
            <div className="text-slate-500">En línea</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`mt-1 w-full text-left text-red-200 hover:text-red-100 hover:bg-slate-800 rounded-md px-3 py-2 transition flex items-center gap-2`}>
          <span>🚪</span>
          {isOpen && "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}