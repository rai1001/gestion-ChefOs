"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";

interface EventRow {
  org_id: string;
  event_date: string;
  attendees: number;
  menu_name?: string | null;
  production_items?: number;
}

const demoRows: EventRow[] = [
  { org_id: "org-dev", event_date: "2026-02-01", attendees: 120, menu_name: "Buffet continental" },
  { org_id: "org-dev", event_date: "2026-02-02", attendees: 80, menu_name: null },
];

export default function EventsPage() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [menu, setMenu] = useState<string>("Buffet continental");
  const [sheet, setSheet] = useState<EventRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [loadingSheet, setLoadingSheet] = useState(false);

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => (a.event_date < b.event_date ? -1 : 1)),
    [rows],
  );

  async function refresh() {
    const res = await fetch("/api/events");
    const json = await res.json();
    setRows(json.data ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function importFile(file: File) {
    const form = new FormData();
    form.append("file", file);
    await fetch("/api/events/import", { method: "POST", body: form });
  }

  async function handleImport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.file as unknown as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await importFile(file);
      await refresh();
    } finally {
      setImporting(false);
    }
  }

  async function loadDemo() {
    setImporting(true);
    try {
      await fetch("/api/events/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rows: demoRows }),
      });
      await refresh();
    } finally {
      setImporting(false);
    }
  }

  async function handleAttach() {
    if (!selectedDate) return;
    setAttaching(true);
    try {
      await fetch(`/api/events/${selectedDate}/attach-menu`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ menu_name: menu, org_id: "org-dev" }),
      });
      await refresh();
    } finally {
      setAttaching(false);
    }
  }

  async function handleSheet() {
    if (!selectedDate) return;
    setLoadingSheet(true);
    try {
      const res = await fetch(`/api/events/${selectedDate}/sheets`);
      const json = await res.json();
      setSheet(json.data ?? []);
    } finally {
      setLoadingSheet(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Eventos</p>
        <h1 className="text-3xl font-semibold">Importar, adjuntar menú y generar hojas</h1>
        <p className="text-slate-300">
          Idempotente por fecha: reimportar reemplaza. Adjunta menú (BD o archivo) y genera hoja de producción/compras.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Importar eventos (Excel)</h2>
            <button
              type="button"
              onClick={loadDemo}
              className="rounded-lg border border-white/20 px-3 py-1 text-xs text-slate-200 hover:bg-white/5"
            >
              Cargar demo
            </button>
          </div>
          <form className="space-y-3" aria-label="events-import-form" onSubmit={handleImport}>
            <input aria-label="Archivo Eventos" name="file" type="file" accept=".xlsx,.xls" className="text-sm" />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={importing}
                className="rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2 disabled:opacity-60"
              >
                {importing ? "Importando..." : "Subir / Reimportar"}
              </button>
            </div>
          </form>
          <p className="text-xs text-slate-400">
            Idempotente: misma fecha → reemplaza versión anterior. Hash guardado en import table.
          </p>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Adjuntar menú y generar hoja</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-300 flex flex-col gap-1">
              Fecha evento
              <input
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                type="date"
                className="rounded bg-slate-900 border border-white/10 px-3 py-2"
              />
            </label>
            <label className="text-sm text-slate-300 flex flex-col gap-1">
              Menú (BD / archivo)
              <input
                value={menu}
                onChange={(e) => setMenu(e.target.value)}
                placeholder="Buffet, Cóctel, Gala..."
                className="rounded bg-slate-900 border border-white/10 px-3 py-2"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAttach}
              disabled={attaching || !selectedDate}
              className="rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2 disabled:opacity-60"
            >
              {attaching ? "Adjuntando..." : "Adjuntar menú"}
            </button>
            <button
              type="button"
              onClick={handleSheet}
              disabled={loadingSheet || !selectedDate}
              className="rounded-lg bg-white/10 border border-white/10 px-4 py-2 disabled:opacity-60"
            >
              {loadingSheet ? "Generando..." : "Generar hoja producción/compras"}
            </button>
          </div>
          <p className="text-xs text-slate-400">OCR futura: hoy permite menú BD/texto y adjunto manual.</p>
        </section>
      </div>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Eventos importados</h2>
          <span className="text-xs text-slate-400">CRUD completo pendiente de calendario (stub mensual)</span>
        </div>
        <table className="w-full text-sm" aria-label="events-table">
          <thead className="text-slate-300">
            <tr>
              <th className="text-left py-2">Fecha</th>
              <th className="text-right py-2">Asistentes</th>
              <th className="text-left py-2">Menú</th>
              <th className="text-right py-2">Producción</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 && (
              <tr><td className="py-2" colSpan={4}>Sin datos</td></tr>
            )}
            {sortedRows.map((row) => (
              <tr key={row.org_id + row.event_date} data-testid="event-row" className="hover:bg-white/5">
                <td className="py-2">{row.event_date}</td>
                <td className="py-2 text-right">{row.attendees}</td>
                <td className="py-2 text-left">{row.menu_name ?? "-"}</td>
                <td className="py-2 text-right">{row.production_items ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Hoja de producción / compras</h2>
          <span className="text-xs text-slate-400">Generada al adjuntar menú + asistentes</span>
        </div>
        <table className="w-full text-sm" aria-label="event-sheets-table">
          <thead className="text-slate-300">
            <tr>
              <th className="text-left py-2">Fecha</th>
              <th className="text-left py-2">Menú</th>
              <th className="text-right py-2">Producción (raciones)</th>
            </tr>
          </thead>
          <tbody>
            {sheet.length === 0 && (
              <tr><td className="py-2" colSpan={3}>Genera una hoja para verla aquí</td></tr>
            )}
            {sheet.map((row) => (
              <tr key={row.event_date} className="hover:bg-white/5">
                <td className="py-2">{row.event_date}</td>
                <td className="py-2">{row.menu_name ?? "-"}</td>
                <td className="py-2 text-right">{row.production_items ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
