"use client";
import { useEffect, useState } from "react";

interface EventRow {
  org_id: string;
  event_date: string;
  attendees: number;
  menu_name?: string | null;
}

export default function EventsPage() {
  const [rows, setRows] = useState<EventRow[]>([]);

  useEffect(() => {
    // TODO: fetch real events list when API available
    setRows([]);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Eventos</p>
        <h1 className="text-3xl font-semibold">Eventos con import idempotente</h1>
        <p className="text-slate-300">Importa Excel, adjunta menú y genera hojas.</p>
      </header>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Importar eventos</h2>
        <form className="space-y-3" aria-label="events-import-form">
          <input aria-label="Archivo Eventos" type="file" name="file" accept=".xlsx,.xls" className="text-sm" />
          <button type="button" className="rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2">Subir</button>
        </form>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Adjuntar menú y generar hoja</h2>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input placeholder="Fecha evento" className="rounded bg-slate-900 border border-white/10 px-3 py-2" />
          <input placeholder="Menú" className="rounded bg-slate-900 border border-white/10 px-3 py-2" />
          <button className="rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2">Adjuntar</button>
          <button className="rounded-lg bg-white/10 border border-white/10 px-4 py-2">Generar hoja</button>
        </div>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
        <h2 className="text-lg font-semibold">Listado de eventos</h2>
        <table className="w-full text-sm" aria-label="events-table">
          <thead className="text-slate-300">
            <tr>
              <th className="text-left py-2">Fecha</th>
              <th className="text-right py-2">Asistentes</th>
              <th className="text-left py-2">Menú</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td className="py-2" colSpan={3}>Sin datos</td></tr>
            )}
            {rows.map((row) => (
              <tr key={row.org_id + row.event_date} data-testid="event-row">
                <td className="py-2">{row.event_date}</td>
                <td className="py-2 text-right">{row.attendees}</td>
                <td className="py-2 text-left">{row.menu_name ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
