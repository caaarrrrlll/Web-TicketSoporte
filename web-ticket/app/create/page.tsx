"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicketAction } from "@/actions/ticketActions"; 
import { createClient } from "@/utils/supabase/client"; 
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaUpload, FaCheck, FaArrowLeft, FaSpinner, FaMagic } from "react-icons/fa"; 
import Link from "next/link";

export default function CreateTicketPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  const [uploadSuccess, setUploadSuccess] = useState(false); 

  const [formData, setFormData] = useState({
    titulo: "",
    categoria: "soporte",
    descripcion: "",
    prioridad: "media", 
    imageUrl: "" 
  });

  const [showWarningModal, setShowWarningModal] = useState(false);

  const ticketPresets = [
    { label: "📶 Falla de Internet", title: "Sin conexión a Internet", cat: "soporte", desc: "No tengo acceso a la red ni a internet.", priority: "alta" },
    { label: "🖨️ Impresora Atascada", title: "Problema con Impresora", cat: "soporte", desc: "La impresora no responde o tiene papel atascado.", priority: "media" },
    { label: "📧 Correo Bloqueado", title: "No puedo acceder al correo", cat: "soporte", desc: "Me sale error de contraseña al intentar entrar a Outlook.", priority: "alta" },
    { label: "💻 PC Lenta", title: "Equipo muy lento", cat: "soporte", desc: "El computador tarda mucho en abrir programas.", priority: "baja" }
  ];

  const applyPreset = (preset: any) => {
    setFormData(prev => ({
        ...prev,
        titulo: preset.title,
        categoria: preset.cat,
        descripcion: preset.desc,
        prioridad: preset.priority
    }));
    if (preset.priority === 'alta') setShowWarningModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('evidence') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('evidence').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, imageUrl: data.publicUrl }));
      setUploadSuccess(true);
      
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("Error al subir la imagen. Intenta de nuevo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePriorityChange = (priority: string) => {
    if (priority === 'alta') setShowWarningModal(true);
    setFormData({ ...formData, prioridad: priority });
  };

  const cancelHighPriority = () => {
    setFormData({ ...formData, prioridad: 'media' });
    setShowWarningModal(false);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.titulo || !formData.descripcion) return alert("Por favor completa los campos obligatorios");
    if (isUploading) return alert("Espera a que termine de subir la imagen.");

    setIsSubmitting(true);
    try {
        const newTicket: any = {
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            estado: "pendiente",
            prioridad: formData.prioridad,
            category: formData.categoria,
            creadoPor: "Usuario", 
            historial: [{ 
                fecha: new Date().toLocaleString(), 
                mensaje: "Ticket creado exitosamente", 
                usuario: "Sistema" 
            }],
            comentarios: [],
            imageUrl: formData.imageUrl || null
        };

        await createTicketAction(newTicket);
        router.push("/dashboard");
    } catch (error) {
        alert("Error al crear ticket");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className={`p-6 text-white transition-colors duration-300 flex justify-between items-center ${formData.prioridad === 'alta' ? 'bg-red-600' : 'bg-slate-900'}`}>
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    {formData.prioridad === 'alta' && <FaExclamationTriangle className="animate-pulse" />}
                    Crear Ticket Corporativo
                </h1>
                {formData.prioridad === 'alta' ? (
                    <p className="text-red-100 text-sm font-bold mt-1 bg-red-800/30 inline-block px-2 py-0.5 rounded">
                        ⚠️ ALERTA CRÍTICA: Se notificará al personal inmediatamente.
                    </p>
                ) : (
                    <p className="text-slate-400 text-sm mt-1">Reporta una incidencia técnica.</p>
                )}
            </div>
            <Link href="/dashboard" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <FaArrowLeft />
            </Link>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <FaMagic className="text-purple-500" /> Relleno Rápido (Sugerencias)
                </label>
                <div className="flex flex-wrap gap-2">
                    {ticketPresets.map((preset, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className="text-xs font-bold px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors shadow-sm"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
                <input 
                    type="text" 
                    value={formData.titulo}
                    onChange={e => setFormData({...formData, titulo: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors font-medium text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Ej: Falla en servidor principal..."
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Departamento Responsable</label>
                <select 
                    value={formData.categoria}
                    onChange={e => setFormData({...formData, categoria: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors font-medium text-gray-900 bg-white">
                    <option value="soporte">🔧 Soporte Técnico (General)</option>
                    <option value="desarrollo">💻 Desarrollo / Software</option>
                    <option value="rrhh">👥 Recursos Humanos</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                <textarea 
                    value={formData.descripcion}
                    onChange={e => setFormData({...formData, descripcion: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors min-h-[120px] resize-none font-medium text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Detalles del problema..."
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Evidencia (Opcional)</label>
                <div className={`relative border-2 border-dashed rounded-xl transition-all group cursor-pointer bg-white ${uploadSuccess ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                    <input type="file" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" disabled={isUploading} />
                    
                    <div className="p-6 flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500">
                        {isUploading ? (
                            <>
                                <FaSpinner className="text-2xl mb-2 animate-spin text-blue-600" />
                                <span className="text-sm font-bold text-blue-600">Subiendo imagen...</span>
                            </>
                        ) : uploadSuccess ? (
                            <>
                                <FaCheck className="text-2xl mb-2 text-emerald-600" />
                                <span className="text-sm font-bold text-emerald-600">¡Imagen cargada correctamente!</span>
                                <span className="text-xs text-emerald-500">Clic para cambiarla</span>
                            </>
                        ) : (
                            <>
                                <FaUpload className="text-2xl mb-2" />
                                <span className="text-sm font-bold">Haz clic para subir imagen</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Prioridad</label>
                <div className="grid grid-cols-3 gap-4">
                    <button type="button" onClick={() => handlePriorityChange('baja')} className={`p-3 rounded-xl border-2 font-bold flex flex-col items-center gap-1 transition-all ${formData.prioridad === 'baja' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                      <span className="text-xl">☕</span> Baja
                    </button>
                    <button type="button" onClick={() => handlePriorityChange('media')} className={`p-3 rounded-xl border-2 font-bold flex flex-col items-center gap-1 transition-all ${formData.prioridad === 'media' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                      <span className="text-xl">🛠️</span> Media
                    </button>
                    <button type="button" onClick={() => handlePriorityChange('alta')} className={`p-3 rounded-xl border-2 font-bold flex flex-col items-center gap-1 transition-all ${formData.prioridad === 'alta' ? 'bg-red-50 border-red-600 text-red-700 shadow-lg shadow-red-100 scale-105' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                      <span className="text-xl">🔥</span> Alta
                    </button>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting || isUploading} 
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] ${formData.prioridad === 'alta' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-300'} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isSubmitting ? "Registrando..." : "Registrar Ticket"}
            </button>

        </form>
      </motion.div>

      <AnimatePresence>
        {showWarningModal && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 pointer-events-auto border-t-8 border-red-600">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4 text-3xl"><FaExclamationTriangle /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Estás seguro?</h3>
                            <p className="text-gray-600 text-sm mb-6">
                                Marcar este ticket como <span className="font-bold text-red-600">ALTA PRIORIDAD</span> enviará una notificación al personal. <br/><br/>
                            </p>
                            <div className="flex flex-col gap-3 w-full">
                                <button onClick={() => setShowWarningModal(false)} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-colors">Sí</button>
                                <button onClick={cancelHighPriority} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </div>
  );
}