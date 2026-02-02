"use client";
import { useState } from "react";
import { BiweekGrid } from "./BiweekGrid";

export default function CalendarBiweekPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8 space-y-6">
      <header className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Calendario</p>
          <h1 className="text-3xl font-semibold">Vista doble quincena</h1>
        </div>
        <div className="flex gap-2 items-center text-sm text-slate-200">
          <label className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">Inicio</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded bg-slate-900 border border-white/10 px-2 py-1" />
          </label>
          <button className="rounded bg-white/10 px-3 py-1 text-xs border border-white/10" onClick={() => setStartDate(today)}>Hoy</button>
        </div>
      </header>

      <BiweekGrid startDate={startDate} />
    </main>
  );
}
