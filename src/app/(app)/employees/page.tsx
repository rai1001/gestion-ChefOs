"use client";
import { useEffect, useState, FormEvent } from "react";

type Hotel = { id: string; name: string };
type Employee = { id: string; name: string; role: string; email?: string | null; hotel_id?: string | null };

export default function EmployeesPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [hotelId, setHotelId] = useState<string | "">("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("staff");
  const [email, setEmail] = useState("");

  async function loadHotels() {
    const res = await fetch("/api/hotels");
    const json = await res.json();
    setHotels(json.data ?? []);
    if (!hotelId && json.data?.[0]?.id) setHotelId(json.data[0].id);
  }

  async function loadEmployees() {
    const qs = hotelId ? `?hotel_id=${hotelId}` : "";
    const res = await fetch(`/api/employees${qs}`);
    const json = await res.json();
    setEmployees(json.data ?? []);
  }

  useEffect(() => {
    loadHotels();
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [hotelId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, role, email, hotel_id: hotelId || null, org_id: "org-dev" }),
    });
    const json = await res.json().catch(() => ({}));
    const emp = json.data ?? { id: `tmp-${Date.now()}`, name, role, email, hotel_id: hotelId || null };
    setEmployees((prev) => [emp, ...prev]);
    setName("");
    setEmail("");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Organización</p>
        <h1 className="text-3xl font-semibold">Empleados</h1>
        <p className="text-slate-300">Asigna personal a hoteles.</p>
      </header>

      <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold">Nuevo empleado</h2>
        <form className="grid gap-3 md:grid-cols-4" onSubmit={onSubmit}>
          <input className="rounded bg-slate-900 border border-white/10 px-3 py-2" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="rounded bg-slate-900 border border-white/10 px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select className="rounded bg-slate-900 border border-white/10 px-3 py-2" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="staff">Staff</option>
            <option value="chef">Chef</option>
            <option value="server">Sala</option>
            <option value="manager">Manager</option>
          </select>
          <select className="rounded bg-slate-900 border border-white/10 px-3 py-2" value={hotelId} onChange={(e) => setHotelId(e.target.value)}>
            <option value="">Sin hotel</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          <button className="md:col-span-4 rounded-lg bg-emerald-500 text-black font-semibold py-2">Crear empleado</button>
        </form>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Empleados</h2>
          <span className="text-xs text-slate-400">{employees.length}</span>
        </div>
        <div className="grid gap-2" data-testid="employee-list">
          {employees.length === 0 && <p className="text-sm text-slate-400">Sin empleados.</p>}
          {employees.map((e) => (
            <div key={e.id} data-testid="employee-row" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm flex justify-between">
              <span>{e.name}</span>
              <span className="text-slate-400">{e.role}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
