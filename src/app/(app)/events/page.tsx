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
  const [menuSource, setMenuSource] = useState<"bd" | "archivo">("bd");
  const [menu, setMenu] = useState<string>("Buffet continental");
  const [sheet, setSheet] = useState<EventRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => (a.event_date < b.event_date ? -1 : 1)),
    [rows],
  );

  const calendarDays = useMemo(() => {
    const start = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const end = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
    const days: { label: number; iso: string }[] = [];
    for (let d = 1; d <= end.getDate(); d++) {
      const dt = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), d);
      const iso = dt.toISOString().slice(0, 10);
      days.push({ label: d, iso });
    }
    const firstDay = start.getDay(); // 0-6
    const padding = Array.from({ length: firstDay }, () => null);
    return [...padding, ...days] as (null | { label: number; iso: string })[];
  }, [monthCursor]);

  const menusFromDb = ["Buffet continental", "Coffee break", "Cóctel finger food", "Gala 3 tiempos"];

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
              Origen menú
              <div className="flex gap-2">
                <select
                  value={menuSource}
                  onChange={(e) => setMenuSource(e.target.value as "bd" | "archivo")}
                  className="flex-1 rounded bg-slate-900 border border-white/10 px-3 py-2 text-sm"
                >
                  <option value="bd">Base de datos</option>
                  <option value="archivo">Archivo/imagen (OCR futura)</option>
                </select>
              </div>
            </label>
            {menuSource === "bd" ? (
              <label className="text-sm text-slate-300 flex flex-col gap-1 md:col-span-2">
                Menú BD
                <select
                  value={menu}
                  onChange={(e) => setMenu(e.target.value)}
                  className="rounded bg-slate-900 border border-white/10 px-3 py-2 text-sm"
                >
                  {menusFromDb.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="text-sm text-slate-300 flex flex-col gap-1 md:col-span-2 opacity-70">
                Subir archivo / imagen (OCR próximamente)
                <input
                  type="file"
                  disabled
                  className="rounded bg-slate-900 border border-dashed border-white/20 px-3 py-2 text-sm"
                />
                <span className="text-[11px] text-slate-400">En esta versión usa menú de BD; OCR llegará en la siguiente iteración.</span>
              </label>
            )}
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
          <h2 className="text-lg font-semibold">Calendario mensual (stub)</h2>
          <div className="flex gap-2 text-sm">
            <button
              className="rounded-md border border-white/10 px-3 py-1 hover:bg-white/10"
              onClick={() =>
                setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
              }
            >
              ‹ Mes
            </button>
            <button
              className="rounded-md border border-white/10 px-3 py-1 hover:bg-white/10"
              onClick={() =>
                setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
              }
            >
              Mes ›
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-xs text-slate-300">
          {["D", "L", "M", "X", "J", "V", "S"].map((d) => (
            <div key={d} className="text-center text-slate-400">{d}</div>
          ))}
          {calendarDays.map((day, idx) =>
            day === null ? (
              <div key={`pad-${idx}`} />
            ) : (
              <button
                key={day.iso}
                onClick={() => setSelectedDate(day.iso)}
                className={`h-16 rounded-lg border border-white/10 p-2 text-left transition-colors ${
                  selectedDate === day.iso ? "bg-emerald-500/20 border-emerald-300/40" : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>{day.label}</span>
                  {rows.some((r) => r.event_date === day.iso) && (
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  )}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {rows.find((r) => r.event_date === day.iso)?.menu_name ?? ""}
                </div>
              </button>
            ),
          )}
        </div>
        <p className="text-[11px] text-slate-400">
          Click en una fecha para precargar el adjunte de menú y generar hojas. CRUD calendario completo pendiente (stub).
        </p>
      </section>

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
              <th className="text-right py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 && (
              <tr><td className="py-2" colSpan={5}>Sin datos</td></tr>
            )}
            {sortedRows.map((row) => (
              <tr key={row.org_id + row.event_date} data-testid="event-row" className="hover:bg-white/5">
                <td className="py-2">{row.event_date}</td>
                <td className="py-2 text-right">{row.attendees}</td>
                <td className="py-2 text-left">{row.menu_name ?? "-"}</td>
                <td className="py-2 text-right">{row.production_items ?? "—"}</td>
                <td className="py-2 text-right">
                  <span className={`rounded-full px-2 py-1 text-[11px] ${
                    row.menu_name ? "bg-emerald-500/20 text-emerald-100" : "bg-white/10 text-slate-300"
                  }`}>
                    {row.menu_name ? "Menú adjunto" : "Pendiente menú"}
                  </span>
                </td>
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
              <th className="text-right py-2">Compras (proveedor est.)</th>
            </tr>
          </thead>
          <tbody>
            {sheet.length === 0 && (
              <tr><td className="py-2" colSpan={4}>Genera una hoja para verla aquí</td></tr>
            )}
            {sheet.map((row) => (
              <tr key={row.event_date} className="hover:bg-white/5">
                <td className="py-2">{row.event_date}</td>
                <td className="py-2">{row.menu_name ?? "-"}</td>
                <td className="py-2 text-right">{row.production_items ?? 0}</td>
                <td className="py-2 text-right text-slate-300">Auto-calculada (stub)</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
