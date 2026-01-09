"use client";

import { useEffect, useState } from "react"; 
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { FaTicketAlt, FaChartPie, FaPlusCircle, FaSignOutAlt,  FaUserCircle, FaBars} from "react-icons/fa";
import { motion } from "framer-motion";
import { useSidebar } from "@/context/SidebarContext";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { isOpen, toggleSidebar } = useSidebar ? useSidebar() : { isOpen: true, toggleSidebar: () => {} };

  const [userName, setUserName] = useState("Cargando...");
  const [userRole, setUserRole] = useState(""); 

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .single();

          if (profile?.full_name) {
            setUserName(profile.full_name);
          } else {
            setUserName(user.email?.split('@')[0] || "Usuario");
          }

          if (profile?.role && profile.role.length > 0) {
             setUserRole(profile.role[0]); 
          }
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
        setUserName("Usuario");
      }
    };

    fetchUserProfile();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("sessionUser");
    router.refresh();
    router.push("/login");
  }

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FaChartPie /> },
    { name: "Tickets", path: "/ticket", icon: <FaTicketAlt /> },
    { name: "Nuevo Ticket", path: "/create", icon: <FaPlusCircle /> },
  ];

  return (
    <>
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`bg-slate-900 text-white w-64 min-h-screen flex flex-col shadow-2xl transition-all duration-300 z-50 fixed md:relative ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        
        <div className="h-24 flex items-center px-8 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 text-blue-500">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-900/50">
                <FaTicketAlt className="text-xl" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-white tracking-wide leading-none">WebTicket</h1>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Corporativo</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menú Principal</p>
          
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group font-medium ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                  <span className={`text-lg ${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div layoutId="activeDot" className="absolute right-4 w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
            <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 border border-slate-700/50">
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                    {userName !== "Cargando..." ? userName.charAt(0).toUpperCase() : <FaUserCircle />}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-white truncate capitalize" title={userName}>
                        {userName}
                    </p>
                    
                    <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors mt-0.5 w-full text-left">
                        <FaSignOutAlt /> Cerrar Sesión
                    </button>
                </div>
            </div>
            <p className="text-center text-[10px] text-slate-600 mt-3">v2.5.0 Gasintec Release</p>
        </div>
      </motion.aside>

      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={toggleSidebar}
        />
      )}
    </>
  );
}