"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      (u: any) => u.email === email && u.password === password
    );

    if (!user) {
      setError("Credenciales incorrectas");
      return;
    }

    localStorage.setItem("sessionUser", JSON.stringify(user));
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        className="bg-white p-8 shadow-lg rounded-xl w-96 border border-gray-200"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Iniciar Sesión
        </h1>

        {error && (
          <p className="text-red-500 mb-3 text-sm font-medium">{error}</p>
        )}

        <input
          type="email"
          placeholder="Correo"
          className="border p-3 rounded w-full mb-4 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="border p-3 rounded w-full mb-4 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="bg-blue-600 text-white w-full py-3 rounded-lg hover:bg-blue-700 transition">
          Entrar
        </button>

        <p
          onClick={() => router.push("/register")}
          className="text-blue-600 text-sm text-center mt-4 cursor-pointer hover:underline">
          Crear una cuenta
        </p>
      </form>
    </div>
  );
}
