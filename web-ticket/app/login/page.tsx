"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const user = users.find(
      (u: any) => u.email === email && u.password === password
    );

    if (!user) {
      setError("Credenciales incorrectas");
      return;
    }

    // Guardar sesión
    localStorage.setItem("sessionUser", JSON.stringify(user));

    router.push("/"); // Ir al panel
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md p-6 rounded w-80"
      >
        <h1 className="text-xl font-bold mb-4">Iniciar sesión</h1>

        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}

        <input
          type="email"
          placeholder="Correo"
          className="border p-2 w-full mb-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="border p-2 w-full mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">
          Entrar
        </button>

        <p
          onClick={() => router.push("/register")}
          className="text-blue-600 text-sm text-center mt-3 hover:underline cursor-pointer"
        >
          Crear cuenta
        </p>
      </form>
    </div>
  );
}
