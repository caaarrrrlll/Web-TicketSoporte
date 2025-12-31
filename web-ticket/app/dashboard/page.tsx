"use client";

import { useEffect, useState } from "react";
import { getTicketsAction, addCommentAction } from "@/actions/ticketActions"; 
import { createUserAction } from "@/actions/adminAction";
import { Ticket } from "@/types/ticket";
import { motion, AnimatePresence } from "framer-motion"; 
import Link from "next/link";
import { createClient } from "@/utils/supabase/client"; 
import { 
  FaBuilding, FaUserCircle, FaCalendarAlt, FaComments, FaTimes, 
  FaExpand, FaLaptopCode, FaTools, FaFolderOpen, 
  FaHourglassHalf, FaCog, FaCheck 
} from 'react-icons/fa'; 

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ fullName: "", email: "", password: "", roles: [] as string[] });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [stats, setStats] = useState({ total: 0, pendientes: 0, enProgreso: 0, resueltos: 0, criticos: 0 });

  async function loadData() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role && profile.role.includes('gerente')) setIsAdmin(true);
      }

      const data = await getTicketsAction(); 
      const sortedData = data.sort((a: Ticket, b: Ticket) => b.id - a.id);
      setTickets(sortedData);

      const counts = {
        total: data.length,
        pendientes: data.filter(t => t.estado === "pendiente").length,
        enProgreso: data.filter(t => t.estado === "en_progreso").length,
        resueltos: data.filter(t => t.estado === "resuelto").length,
        criticos: data.filter(t => t.prioridad === "alta" && t.estado !== "resuelto").length
      };
      setStats(counts);

      if (selectedTicket) {
        const updatedSelected = sortedData.find(t => t.id === selectedTicket.id);
        if (updatedSelected) setSelectedTicket(updatedSelected);
      }
    } catch (error) { 
      console.error("Error cargando dashboard:", error); 
    } finally { 
      setIsLoading(false); 
    }
  }

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'tickets' }, 
        (payload) => {
          console.log("Cambio en tiempo real detectado:", payload);
          loadData(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTicket]); 

  const getCategoryBadge = (cat?: string) => {
    switch(cat) {
        case 'desarrollo': return { icon: <FaLaptopCode />, label: 'Desarrollo', class: 'bg-purple-100 text-purple-700 border-purple-200' };
        case 'rrhh': return { icon: <FaUserCircle />, label: 'RRHH', class: 'bg-pink-100 text-pink-700 border-pink-200' };
        default: return { icon: <FaTools />, label: 'Soporte', class: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
        case 'alta': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
        case 'media': return 'bg-yellow-400';
        default: return 'bg-emerald-500';
    }
  };

  async function handleSendComment() {
    if (!newComment.trim() || !selectedTicket) return;
    setIsSendingComment(true);
    let autor = "Usuario Web";
    try {
        const userLocal = JSON.parse(localStorage.getItem("sessionUser") || "{}");
        if (userLocal.name || userLocal.full_name) autor = userLocal.name || userLocal.full_name;
    } catch {}
    const comentarioObj = { usuario: autor, mensaje: newComment, fecha: new Date().toLocaleString() };
    try {
        await addCommentAction(selectedTicket.id, comentarioObj);
        setNewComment("");
        const updatedTicket = { ...selectedTicket, comentarios: [...(selectedTicket.comentarios || []), comentarioObj] };
        setSelectedTicket(updatedTicket);
    } catch (error) { alert("Error al enviar comentario"); } finally { setIsSendingComment(false); }
  }

  const handleRoleToggle = (role: string) => {
    setNewUserForm(prev => {
      if (prev.roles.includes(role)) return { ...prev, roles: prev.roles.filter(r => r !== role) };
      else return { ...prev, roles: [...prev.roles, role] };
    });
  };

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (newUserForm.roles.length === 0) return alert("Debes asignar al menos un rol.");
    setIsCreatingUser(true);
    try {
      await createUserAction(newUserForm);
      alert("✅ Usuario creado exitosamente");
      setShowUserModal(false);
      setNewUserForm({ fullName: "", email: "", password: "", roles: [] });
    } catch (error: any) { alert("❌ Error: " + error.message); } finally { setIsCreatingUser(false); }
  }

  const cards = [
    { label: "Total Tickets", value: stats.total, icon: <FaFolderOpen />  , color: "from-blue-600 to-indigo-700", textColor: "text-blue-50" },
    { label: "Pendientes", value: stats.pendientes, icon: <FaHourglassHalf />, color: "from-yellow-500 to-orange-600", textColor: "text-yellow-50" },
    { label: "En Proceso", value: stats.enProgreso, icon: <FaCog />, color: "from-purple-600 to-pink-600", textColor: "text-purple-50" },
    { label: "Resueltos", value: stats.resueltos, icon: <FaCheck />, color: "from-emerald-500 to-teal-600", textColor: "text-emerald-50" }
  ];

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (isLoading) return <div className="flex items-center justify-center h-[80vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-800"></div></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-600 mt-1 font-medium">Bienvenido al sistema de gestión de tickets.</p>
        </div>
        <div className="flex gap-3">
            {isAdmin && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowUserModal(true)} className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 border border-purple-500">
                    <span><FaUserCircle /></span> Crear Usuario
                </motion.button>
            )}
            <Link href="/create">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
                    <span>+</span> Nuevo Ticket
                </motion.button>
            </Link>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div key={index} variants={itemVariants} className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${card.color} shadow-lg text-white`}>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex justify-between items-start relative z-10">
                <div><p className={`text-sm font-bold ${card.textColor} mb-1`}>{card.label}</p><h3 className="text-4xl font-extrabold">{card.value}</h3></div>
                <span className="text-3xl bg-white/20 p-2 rounded-lg backdrop-blur-sm">{card.icon}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {stats.criticos > 0 && (
          <motion.div variants={itemVariants} className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-4 text-red-900 shadow-sm">
            <div className="bg-red-200 p-2 rounded-full text-xl">🔥</div>
            <div><span className="font-extrabold">¡ATENCIÓN!</span> Tienes {stats.criticos} ticket(s) de prioridad ALTA pendientes.</div>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Últimos Tickets</h2>
            <Link href="/ticket" className="text-blue-700 text-sm hover:underline font-bold">Ver todos →</Link>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-gray-600 font-medium">No hay actividad reciente.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {tickets.slice(0, 4).map((ticket) => {
                  const catInfo = getCategoryBadge(ticket.category);
                  
                  return (
                    <div key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="relative overflow-hidden hover:bg-blue-50 cursor-pointer transition-colors group">
                        
                        <div className={`absolute left-0 top-0 bottom-0 w-2 ${getPriorityColor(ticket.prioridad)}`} />
                        
                        <div className="p-4 pl-6 flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${catInfo.class}`}>
                                        {catInfo.icon} {catInfo.label}
                                    </span>
                                    {ticket.prioridad === 'alta' && (
                                        <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                            🔥 Alta
                                        </span>
                                    )}
                                </div>
                                
                                <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors text-lg">{ticket.titulo}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mt-1">
                                    <span className="flex items-center gap-1"><FaUserCircle /> {ticket.creadoPor}</span>
                                    <span>•</span>
                                    <span>{ticket.fechaCreacion}</span>
                                </div>
                            </div>
                            
                            <span className={`text-xs px-3 py-1 rounded-full border-2 font-bold capitalize ${ticket.estado === 'pendiente' ? 'bg-gray-100 text-gray-700 border-gray-300' : ticket.estado === 'en_progreso' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                {ticket.estado.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTicket(null)} className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200 pointer-events-auto flex flex-col">
                
                <div className={`p-6 text-white ${selectedTicket.prioridad === 'alta' ? 'bg-red-600' : 'bg-slate-800'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">#{selectedTicket.id}</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{selectedTicket.prioridad}</span>
                        </div>
                        <h2 className="text-2xl font-bold leading-tight">{selectedTicket.titulo}</h2>
                    </div>
                    <button onClick={() => setSelectedTicket(null)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-2">Departamento</p>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 text-blue-700 p-2 rounded-lg"><FaBuilding className="w-5 h-5" /></div>
                            <span className="text-gray-900 font-bold capitalize">{selectedTicket.category || "Soporte General"}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-2">Reportado Por</p>
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 text-purple-700 p-2 rounded-lg"><FaUserCircle className="w-6 h-6" /></div>
                            <div>
                                <p className="text-gray-900 font-bold leading-none">{selectedTicket.creadoPor}</p>
                                <div className="flex items-center gap-1 text-gray-500 text-xs mt-1"><FaCalendarAlt className="w-3 h-3" /> <span>{selectedTicket.fechaCreacion}</span></div>
                            </div>
                        </div>
                      </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Descripción del Problema</h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 text-gray-800 font-medium whitespace-pre-wrap leading-relaxed">
                      {selectedTicket.descripcion}
                    </div>
                  </div>

                  {selectedTicket.imageUrl && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-2 flex justify-between items-center">
                          <span>📸 Evidencia Adjunta</span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium"><FaExpand /> Clic para ampliar</span>
                      </h3>
                      <div 
                        className="relative w-full rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 flex justify-center cursor-zoom-in hover:bg-gray-200 transition-colors"
                        onClick={() => setSelectedImage(selectedTicket.imageUrl || null)}>
                        <img 
                            src={selectedTicket.imageUrl} 
                            alt="Evidencia" 
                            className="object-contain max-h-[400px] w-auto" 
                        />
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaComments className="text-gray-400" /> Historial de Chat
                    </h3>
                    <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                        {selectedTicket.comentarios?.map((c: any, i: number) => (
                             <div key={i} className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-blue-900">{c.usuario}</span>
                                    <span className="text-xs text-gray-400">{c.fecha}</span>
                                </div>
                                <span className="text-gray-700 block">{c.mensaje}</span>
                             </div>
                        ))}
                        {(!selectedTicket.comentarios || selectedTicket.comentarios.length === 0) && (
                            <p className="text-center text-gray-400 text-sm py-4 italic">No hay comentarios aún.</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} className="flex-1 p-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 text-sm outline-none font-medium focus:border-blue-500 transition-colors resize-none h-14" placeholder="Escribe una respuesta..." />
                        <button onClick={handleSendComment} disabled={isSendingComment || !newComment.trim()} className={`px-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center ${!newComment.trim() ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                            {isSendingComment ? "..." : "Enviar"}
                        </button>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer">
                <button className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"><FaTimes className="w-8 h-8" /></button>
                <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} src={selectedImage} className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl pointer-events-none select-none" alt="Evidencia Fullscreen" />
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUserModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUserModal(false)} className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border-2 border-purple-100 pointer-events-auto overflow-hidden">
                <div className="bg-purple-700 p-6 text-white">
                  <h2 className="text-2xl font-bold"><FaUserCircle /> Crear Nuevo Usuario</h2>
                  <p className="text-purple-200 text-sm mt-1">Registra empleados y asigna roles.</p>
                </div>
                <form onSubmit={handleCreateUser} className="p-8 space-y-5">
                  <div><label className="block text-sm font-bold text-gray-900 mb-1">Nombre</label><input type="text" className="w-full p-3 border-2 border-gray-300 rounded-xl text-gray-900 font-medium outline-none focus:border-purple-600" value={newUserForm.fullName} onChange={e => setNewUserForm({...newUserForm, fullName: e.target.value})} required /></div>
                  <div><label className="block text-sm font-bold text-gray-900 mb-1">Correo</label><input type="email" className="w-full p-3 border-2 border-gray-300 rounded-xl text-gray-900 font-medium outline-none focus:border-purple-600" value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} required /></div>
                  <div><label className="block text-sm font-bold text-gray-900 mb-1">Contraseña</label><input type="password" className="w-full p-3 border-2 border-gray-300 rounded-xl text-gray-900 font-medium outline-none focus:border-purple-600" value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} required /></div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Roles</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['desarrollo', 'soporte', 'rrhh'].map((rol) => (
                        <div key={rol} onClick={() => handleRoleToggle(rol)} className={`cursor-pointer p-3 rounded-xl border-2 flex items-center gap-2 transition-all select-none ${newUserForm.roles.includes(rol) ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-gray-200 text-gray-600'}`}>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${newUserForm.roles.includes(rol) ? 'bg-purple-600 border-purple-600' : 'border-gray-400 bg-white'}`}>
                            {newUserForm.roles.includes(rol) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="font-bold capitalize">{rol}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-3 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancelar</button>
                    <button type="submit" disabled={isCreatingUser} className="flex-1 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-lg">{isCreatingUser ? "Creando..." : "Registrar"}</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}