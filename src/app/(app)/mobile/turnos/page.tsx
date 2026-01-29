"use client";
import { useEffect, useState } from "react";

type Shift = {
  id: string;
  name: string;
  shift_date: string;
  vacation?: boolean;
};

export default function MobileTurnosPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    fetch("/api/turnos")
      .then((r) => r.json())
      .then((json) => setShifts(json.data ?? []))
      .catch(() => setShifts([]));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Móvil</p>
        <h1 className="text-2xl font-semibold">Turnos y tareas</h1>
        <p className="text-slate-300">Turnos asignados y bloqueos por vacaciones/bajas.</p>
      </header>

      <section className="space-y-3" aria-label="shifts-list">
        {shifts.length === 0 && <div className="text-sm">Sin turnos</div>}
        {shifts.map((s) => (
          <div key={s.id} data-testid="shift-card" className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{s.name}</span>
              <span className="text-sm text-slate-300">{s.shift_date}</span>
            </div>
            {s.vacation ? (
              <p className="text-amber-300 text-sm">Bloqueado por vacaciones/baja</p>
            ) : (
              <p className="text-sm text-emerald-300">Disponible</p>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}

