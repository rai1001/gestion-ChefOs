"use client";
import { useEffect, useState } from "react";

type Shift = { id: string; shift_date: string; shift_code: "morning" | "evening"; status: string; employee_name?: string | null };

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState(new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10));

  async function load() {
    const params = new URLSearchParams();
    params.set("start", start);
    params.set("end", end);
    const res = await fetch(`/api/shifts?${params.toString()}`);
    const json = await res.json();
    setShifts(json.data ?? []);
  }

  useEffect(() => {
    load();
  }, [start, end]);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(new Date(start).getTime() + i * 86400000);
    return d.toISOString().slice(0, 10);
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Turnos</p>
        <h1 className="text-3xl font-semibold">Calendario semanal</h1>
        <p className="text-slate-300">Mañana 06-14 / Tarde 16-24</p>
      </header>

      <div className="flex gap-3 text-sm">
        <label className="flex items-center gap-2">
          Inicio
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded bg-slate-900 border border-white/10 px-2 py-1" />
        </label>
        <label className="flex items-center gap-2">
          Fin
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded bg-slate-900 border border-white/10 px-2 py-1" />
        </label>
      </div>

      <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3" data-testid="shifts-grid">
        <div className="grid grid-cols-4 md:grid-cols-8 text-xs text-slate-400">
          <div>Fecha</div>
          <div>Mañana</div>
          <div>Tarde</div>
        </div>
        <div className="space-y-2">
          {days.map((d) => {
            const morning = shifts.find((s) => s.shift_date === d && s.shift_code === "morning");
            const evening = shifts.find((s) => s.shift_date === d && s.shift_code === "evening");
            return (
              <div key={d} className="grid grid-cols-4 md:grid-cols-8 items-center text-sm rounded-lg border border-white/10 bg-white/5 p-2">
                <div className="col-span-2 md:col-span-2 text-slate-200">{d}</div>
                <div className="col-span-1 md:col-span-3">
                  {morning ? (
                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-100">
                      Mañana · {morning.status} {morning.employee_name ?? ""}
                    </span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </div>
                <div className="col-span-1 md:col-span-3">
                  {evening ? (
                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-100">
                      Tarde · {evening.status} {evening.employee_name ?? ""}
                    </span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
