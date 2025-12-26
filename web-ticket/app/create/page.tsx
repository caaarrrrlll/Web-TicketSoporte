"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicketAction } from "@/actions/ticketActions"; 
import { Ticket } from "@/types/ticket";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser"; 
import { createClient } from "@/utils/supabase/client"; 

try { 
  emailjs.init("HxSntOEo44paa0rZl"); 
} catch(e) {
  console.log("EmailJS init warning:", e);
}

export default function CreateTicketPage() {
  const router = useRouter();
  const supabase = createClient(); 

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<"alta" | "media" | "baja">("media");
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

  async function sendEmailAlert(ticket: Ticket) {
    const SERVICE_ID = "service_0v2vmdd";   
    const TEMPLATE_ID = "template_pjxzm3s"; 
    const PUBLIC_KEY = "HxSntOEo44paa0rZl";   

    const templateParams = {
      to_name: "Admin",
      from_name: ticket.creadoPor,
      titulo: ticket.titulo,
      message: ticket.descripcion,
      prioridad: ticket.prioridad.toUpperCase(),
      fecha: ticket.fechaCreacion,
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      console.log("✅ Correo enviado correctamente");
    } catch (error) {
      console.error("❌ Error envío email (Revisa AdBlock):", error);
    }
  }

  async function uploadImage(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`; 
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tickets') 
        .upload(filePath, file);

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
      creadoPor: createdBy, 
      fechaCreacion: new Date().toLocaleString(),
      leido: false,
      comentarios: [],
      historial: [
        { fecha: new Date().toLocaleString(), accion: "Ticket creado", usuario: createdBy },
      ],
      imageUrl: uploadedImageUrl 
    };

    if (prioridad === "alta") {
        sendEmailAlert(nuevoTicket);
    }

    try {
      await createTicketAction(nuevoTicket);
      router.push("/ticket");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar ticket.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const prioridadesConfig = [
    { id: "baja", label: "Baja", emoji: "☕", colorClass: "bg-emerald-50 border-emerald-200 text-emerald-900", activeClass: "ring-2 ring-emerald-600 bg-emerald-100" },
    { id: "media", label: "Media", emoji: "🔧", colorClass: "bg-yellow-50 border-yellow-200 text-yellow-900", activeClass: "ring-2 ring-yellow-600 bg-yellow-100" },
    { id: "alta", label: "Alta", emoji: "🔥", colorClass: "bg-red-50 border-red-200 text-red-900", activeClass: "ring-2 ring-red-600 bg-red-100" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto">
      <div className="bg-white border-2 border-gray-300 rounded-2xl shadow-xl overflow-hidden">
        
        <div className={`p-6 text-white transition-colors duration-300 ${prioridad === 'alta' ? 'bg-red-600' : 'bg-gradient-to-r from-blue-700 to-indigo-700'}`}>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Crear Ticket
          </h1>
          <p className="text-blue-50 text-sm mt-1 font-medium">
            {prioridad === 'alta' ? "⚠️ ALERTA CRÍTICA" : "Adjunta capturas si es necesario."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-base font-bold text-gray-900">Título del problema</label>
            <input 
              className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-600 focus:border-blue-600 focus:ring-0 outline-none transition-all font-medium"
              placeholder="Ej: Error al cargar imágenes..." 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-gray-900">Descripción detallada</label>
            <textarea 
              className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-600 focus:border-blue-600 focus:ring-0 outline-none transition-all min-h-[120px] font-medium"
              placeholder="Explica qué pasó..." 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-gray-900 flex items-center gap-2">
              📸 Adjuntar Captura de Pantalla (Opcional)
            </label>
            <div className="border-2 border-dashed border-gray-400 rounded-xl p-6 hover:bg-gray-100 transition-colors text-center cursor-pointer relative bg-gray-50">
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {archivo ? (
                    <div className="text-emerald-700 font-bold flex items-center justify-center gap-2 text-lg">
                        ✅ Imagen lista: {archivo.name}
                    </div>
                ) : (
                    <div className="text-gray-700">
                        <span className="block text-2xl mb-2">☁️</span>
                        <span className="text-base font-medium">Haz clic aquí para subir una imagen</span>
                    </div>
                )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-gray-900">Nivel de Prioridad</label>
            <div className="grid grid-cols-3 gap-3">
              {prioridadesConfig.map((p) => (
                <div key={p.id} onClick={() => setPrioridad(p.id as any)}
                  className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-1 transition-all ${prioridad === p.id ? p.activeClass : `border-gray-200 bg-white hover:border-gray-400`}`}>
                  <span className="text-3xl">{p.emoji}</span>
                  <span className="text-sm font-bold text-gray-900">{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all ${isSubmitting ? "bg-gray-500" : prioridad === 'alta' ? "bg-red-700 hover:bg-red-800" : "bg-blue-700 hover:bg-blue-800"}`}>
            {isSubmitting ? "Guardando..." : "Crear Ticket"}
          </motion.button>

        </form>
      </div>
    </motion.div>
  );
}