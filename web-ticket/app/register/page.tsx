"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.some((u: any) => u.email === email)) {
      setError("Este correo ya está registrado");
      return;
    }

    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="bg-white p-6 shadow rounded w-80" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Crear Cuenta</h1>
        {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
        <input
          type="text"
          placeholder="Nombre"
          className="border p-2 rounded w-full mb-3"
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo"
          className="border p-2 rounded w-full mb-3"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="border p-2 rounded w-full mb-4"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="bg-green-600 text-white w-full py-3 rounded-lg hover:bg-green-700 transition">
          Registrarse
        </button>

        <p
          onClick={() => router.push("/login")}
          className="text-center text-blue-600 text-sm mt-3 cursor-pointer">
          Ya tengo una cuenta
        </p>
      </form>
    </div>
  );
}
