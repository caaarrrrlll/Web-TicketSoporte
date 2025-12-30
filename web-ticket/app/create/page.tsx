"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicketAction, getDestinatariosAction } from "@/actions/ticketActions"; 
import { sendEmailAction } from "@/actions/emailAction"; 
import { Ticket } from "@/types/ticket";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client"; 
import { FaFire, FaTools, FaCoffee } from "react-icons/fa";

export default function CreateTicketPage() {
  const router = useRouter();
  const supabase = createClient(); 

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<"alta" | "media" | "baja">("media");
  const [categoria, setCategoria] = useState("soporte");
  
  const [archivo, setArchivo] = useState<File | null>(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  function playAlertSound() {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playBeep = (startTime: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.value = freq;
      osc.start(startTime);
      osc.stop(startTime + 0.1);
      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
    };
    const now = ctx.currentTime;
    playBeep(now, 880);       
    playBeep(now + 0.15, 880); 
  }

  async function uploadImage(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`; 
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from('tickets').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('tickets').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    if (prioridad === "alta") playAlertSound();

    let createdBy = "Usuario Web";
    try {
        const userLocal = JSON.parse(localStorage.getItem("sessionUser") || "{}");
        if (userLocal.name || userLocal.full_name) createdBy = userLocal.name || userLocal.full_name;
    } catch {}

    let uploadedImageUrl = undefined;
    if (archivo) {
        const url = await uploadImage(archivo);
        if (url) uploadedImageUrl = url;
    }

    const nuevoTicket: Ticket = {
      id: 0, 
      titulo,
      descripcion,
      prioridad,
      estado: "pendiente",
      // @ts-ignore
      category: categoria, 
      creadoPor: createdBy, 
      fechaCreacion: new Date().toLocaleString(),
      leido: false,
      comentarios: [],
      historial: [
        { fecha: new Date().toLocaleString(), accion: "Ticket creado", usuario: createdBy },
      ],
      imageUrl: uploadedImageUrl 
    };

    try {
      await createTicketAction(nuevoTicket);
      if (prioridad === "alta") {
        const listaDestinatarios = await getDestinatariosAction();
        if (listaDestinatarios && listaDestinatarios.length > 0) {
            const linkPlataforma = typeof window !== 'undefined' ? `${window.location.origin}/ticket` : 'http://localhost:3000/ticket';
            
            await sendEmailAction({
              to: listaDestinatarios.join(','), 
              subject: `🚨 ALERTA [${categoria.toUpperCase()}]: ${titulo}`,
              ticketData: {
                titulo,
                descripcion,
                prioridad: prioridad.toUpperCase(),
                creadoPor: createdBy,
                link: linkPlataforma
              }
            });
        }
      }
      router.push("/ticket");
    } catch (error) {
      console.error("Error general:", error);
      alert("Error al procesar el ticket.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const prioridadesConfig = [
    { 
      id: "baja", 
      label: "Baja", 
      emoji: <FaCoffee className="w-8 h-8 text-emerald-600" />, 
      colorClass: "bg-emerald-50 border-emerald-200 text-emerald-900", 
      activeClass: "ring-2 ring-emerald-600 bg-emerald-100" 
    },
    { 
      id: "media", 
      label: "Media", 
      emoji: <FaTools className="w-8 h-8 text-yellow-600" />, 
      colorClass: "bg-yellow-50 border-yellow-200 text-yellow-900", 
      activeClass: "ring-2 ring-yellow-600 bg-yellow-100" 
    },
    { 
      id: "alta", 
      label: "Alta", 
      emoji: <FaFire className="w-8 h-8 text-red-600" />, 
      colorClass: "bg-red-50 border-red-200 text-red-900", 
      activeClass: "ring-2 ring-red-600 bg-red-100" 
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <div className="bg-white border-2 border-gray-300 rounded-2xl shadow-xl overflow-hidden">
        <div className={`p-6 text-white transition-colors duration-300 ${prioridad === 'alta' ? 'bg-red-600' : 'bg-gradient-to-r from-blue-700 to-indigo-700'}`}>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Crear Ticket Corporativo
          </h1>
          <p className="text-blue-50 text-sm mt-1 font-medium">
            {prioridad === 'alta' ? "⚠️ ALERTA CRÍTICA: Se notificará al personal." : "Reporte de incidencia regular."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-base font-bold text-gray-900">Título</label>
            <input className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-600 focus:border-blue-600 font-medium outline-none" placeholder="Ej: Falla en servidor..." value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-gray-900">Departamento Responsable</label>
            <select 
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-medium outline-none focus:border-blue-600 appearance-none cursor-pointer">
                <option value="soporte">🔧 Soporte Técnico (General)</option>
                <option value="desarrollo">💻 Desarrollo / Sistemas</option>
                <option value="rrhh">👥 Recursos Humanos</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-gray-900">Descripción</label>
            <textarea className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-600 focus:border-blue-600 font-medium outline-none min-h-[120px]" placeholder="Detalles del problema..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-gray-900 flex items-center gap-2">📸 Evidencia (Opcional)</label>
            <div className="border-2 border-dashed border-gray-400 rounded-xl p-6 hover:bg-gray-100 text-center cursor-pointer relative bg-gray-50">
                <input type="file" accept="image/*" onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {archivo ? <div className="text-emerald-700 font-bold">✅ Archivo listo: {archivo.name}</div> : <div className="text-gray-700 font-medium">Haz clic para subir imagen</div>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-gray-900">Prioridad</label>
            <div className="grid grid-cols-3 gap-3">
              {prioridadesConfig.map((p) => (
                <div key={p.id} onClick={() => setPrioridad(p.id as any)} className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-1 ${prioridad === p.id ? p.activeClass : `border-gray-200 bg-white hover:border-gray-400`}`}>
                  <span className="text-3xl">{p.emoji}</span>
                  <span className="text-sm font-bold text-gray-900">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg ${isSubmitting ? "bg-gray-500" : prioridad === 'alta' ? "bg-red-700" : "bg-blue-700"}`}>
            {isSubmitting ? "Procesando..." : "Registrar Ticket"}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}