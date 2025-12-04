"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    let users = JSON.parse(localStorage.getItem("users") || "[]");

    const exists = users.some((u: any) => u.email === email);
    if (exists) {
      setError("Este correo ya está registrado");
      return;
    }

    const newUser = { name, email, password };
    users.push(newUser);

    localStorage.setItem("users", JSON.stringify(users));

    router.push("/login");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-md p-6 rounded w-80"
      >
        <h1 className="text-xl font-bold mb-4">Crear cuenta</h1>

        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}

        <input
          type="text"
          placeholder="Nombre completo"
          className="border p-2 w-full mb-3 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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

        <button className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700">
          Registrarse
        </button>

        <p
          onClick={() => router.push("/login")}
          className="text-blue-600 text-sm text-center mt-3 hover:underline cursor-pointer"
        >
          Ya tengo cuenta
        </p>
      </form>
    </div>
  );
}
