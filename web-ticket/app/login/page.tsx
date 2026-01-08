"use client";

import { useState } from "react";
import { loginAction } from "@/actions/authActions"; 
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await loginAction(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Credenciales incorrectas. Verifica tu correo o contraseña.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-900 p-4">    
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>
          
          <div className="relative z-10">
            <div className="inline-flex bg-white/10 p-3 rounded-2xl mb-4 border border-white/10 backdrop-blur-md shadow-inner">
               <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">WebTicket</h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">Plataforma de Soporte Corporativo</p>
          </div>
        </div>

        <div className="p-8 pt-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-red-50 border border-red-100 p-3 text-red-600 text-sm font-bold rounded-xl text-center">
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Correo Empresarial</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-gray-900 font-semibold"
                placeholder="ejemplo@gasintec.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-gray-900 font-semibold"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98]
                ${isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl"}
              `}>
              {isLoading ? "Validando..." : "Ingresar al Sistema"}
            </button>
          </form>
          
          <div
          className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500">¿Te olvidaste tu contraseña? 
            <a className="text-sm text-gray-500"> Contacta con el administrador</a></p>
          </div>
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400 font-medium">
              © 2026 Gasintec S.A. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}