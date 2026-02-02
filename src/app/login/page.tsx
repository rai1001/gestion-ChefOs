"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/magic", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      setMessage("Enlace enviado. Revisa tu correo.");
    } catch (err: any) {
      setMessage(err?.message ?? "Error al enviar el enlace");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4">
      <div className="w-full max-w-md rounded-2xl bg-black/40 backdrop-blur border border-white/10 p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
        <p className="text-sm text-slate-300 mt-2 mb-6">
          Usa tu cuenta de Supabase (email magic link) para acceder a Cocina Hotels.
        </p>
        <form className="space-y-4" aria-label="login-form" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-slate-200">
            Correo electrónico
            <input
              type="email"
              name="email"
              placeholder="chef@hotel.com"
              className="mt-2 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2 transition disabled:opacity-60"
            disabled={loading}
            data-testid="magic-submit"
          >
            {loading ? "Enviando..." : "Enviar magic link"}
          </button>
          {message && <p className="text-sm text-emerald-200">{message}</p>}
        </form>
        <p className="text-xs text-slate-400 mt-6 text-center">
          ¿Problemas? <Link className="text-emerald-300" href="/">Volver</Link>
        </p>
      </div>
    </main>
  );
}
