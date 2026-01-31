"use client";
import { useEffect, useState, FormEvent } from "react";

type Hotel = { id: string; name: string; created_by?: string | null };

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/hotels");
    const json = await res.json();
    setHotels(json.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/hotels", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, org_id: "org-dev" }),
      });
      const json = await res.json().catch(() => ({}));
      setName("");
      const created = json?.data ?? { id: `tmp-${Date.now()}`, name };
      setHotels((prev) => [created, ...prev]);
      if (!res.ok) {
        setMessage(json?.error ?? "Guardado local (sin Supabase)");
      } else {
        setMessage("Hotel creado");
      }
    } catch (err: any) {
      setHotels((prev) => [{ id: `tmp-${Date.now()}`, name }, ...prev]);
      setMessage(err?.message ?? "Guardado local");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Organización</p>
        <h1 className="text-3xl font-semibold">Hoteles</h1>
        <p className="text-slate-300">Crea y lista tus hoteles.</p>
      </header>

      <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold">Nuevo hotel</h2>
        <form className="flex flex-col gap-3 md:flex-row md:items-center" onSubmit={onSubmit}>
          <input
            className="flex-1 rounded-lg bg-slate-900 border border-white/10 px-3 py-2"
            placeholder="Nombre del hotel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-semibold disabled:opacity-60"
            disabled={loading}
            data-testid="hotel-submit"
          >
            {loading ? "Creando..." : "Crear hotel"}
          </button>
        </form>
        {message && <p className="text-sm text-emerald-200" data-testid="hotel-message">{message}</p>}
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Lista</h2>
          <span className="text-xs text-slate-400">{hotels.length} hoteles</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2" data-testid="hotel-list">
          {hotels.length === 0 && <p className="text-sm text-slate-400">Sin hoteles.</p>}
          {hotels.map((h) => (
            <article key={h.id} data-testid="hotel-row" className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-1">
              <p className="font-semibold">{h.name}</p>
              <p className="text-xs text-slate-400">{h.id}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
