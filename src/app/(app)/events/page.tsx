"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";

interface EventRow {
  org_id: string;
  event_date: string;
  hall: string;
  name: string;
  event_type?: string | null;
  attendees: number;
  menu_name?: string | null;
  production_items?: number;
  purchases_items?: number;
}

const HALL_ORDER = ["ROSALIA", "PONDAL", "CASTELAO", "CURROS", "CUNQUEIRO", "HALL", "RESTAURANTE", "BAR"];

const normalizeHall = (hall: string) => hall.trim().toUpperCase();
const hallIndex = (hall: string) => {
  const idx = HALL_ORDER.findIndex((h) => h === normalizeHall(hall));
  return idx === -1 ? HALL_ORDER.length : idx;
};

const normalizeDate = (input: string) => {
  if (!input) return null;
  const trimmed = input.trim();
  // ISO already
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  // dd/mm/yy or dd/mm/yyyy or dd-mm-yy
  const m = trimmed.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (m) {
    const [, d, mth, y] = m;
    const year = y.length === 2 ? Number(`20${y}`) : Number(y);
    const dt = new Date(year, Number(mth) - 1, Number(d));
    return Number.isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
  }
  // simple day number => current month/year
  const asNum = Number(trimmed);
  if (!Number.isNaN(asNum) && asNum > 0 && asNum <= 31) {
    const today = new Date();
    const dt = new Date(today.getFullYear(), today.getMonth(), asNum);
    return dt.toISOString().slice(0, 10);
  }
  const native = new Date(trimmed);
  if (!Number.isNaN(native.getTime())) return native.toISOString().slice(0, 10);
  return null;
};

export default function EventsPage() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedEventHall, setSelectedEventHall] = useState<string>("");
  const [applyAllHalls, setApplyAllHalls] = useState<boolean>(true);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const [menuSource, setMenuSource] = useState<"bd" | "archivo">("bd");
  const [menu, setMenu] = useState<string>("Buffet continental");
  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [sheet, setSheet] = useState<EventRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [selectedImportFile, setSelectedImportFile] = useState<string>("");
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const calendarRows = useMemo(() => {
    return rows
      .map((r) => {
        const iso = normalizeDate(r.event_date);
        return iso ? { ...r, event_date: iso } : null;
      })
      .filter((r): r is EventRow => r !== null);
  }, [rows]);

  const sortedRows = useMemo(() => {
    return [...calendarRows].sort((a, b) => {
      if (a.event_date === b.event_date) {
        return hallIndex(a.hall) - hallIndex(b.hall);
      }
      return a.event_date < b.event_date ? -1 : 1;
    });
  }, [calendarRows]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventRow[]>();
    for (const r of calendarRows) {
      const list = map.get(r.event_date) ?? [];
      list.push(r);
      map.set(r.event_date, list);
    }
    for (const [date, list] of map.entries()) {
      list.sort((a, b) => hallIndex(a.hall) - hallIndex(b.hall) || a.name.localeCompare(b.name));
      map.set(date, list);
    }
    return map;
  }, [calendarRows]);

  const selectedDayEvents = selectedDate ? eventsByDay.get(selectedDate) ?? [] : [];

  const calendarDays = useMemo(() => {
    const start = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const end = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
    const days: { label: number; iso: string }[] = [];
    for (let d = 1; d <= end.getDate(); d++) {
      const dt = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), d);
      const iso = dt.toISOString().slice(0, 10);
      days.push({ label: d, iso });
    }
    const firstDay = start.getDay(); // 0-6 (D-L-M-X-J-V-S)
    const padding = Array.from({ length: firstDay }, () => null);
    return [...padding, ...days] as (null | { label: number; iso: string })[];
  }, [monthCursor]);

  const menusFromDb = ["Buffet continental", "Coffee break", "Cóctel finger food", "Gala 3 tiempos"];

  const refresh = useCallback(async () => {
    try {
    const res = await fetch("/api/events");
    const json = await res.json();
    const data = (json.data as EventRow[]) ?? [];
    setRows(data);
    const valid = data
      .map((d) => {
        const iso = normalizeDate(d.event_date);
        return iso ? { ...d, event_date: iso } : null;
      })
      .filter((d): d is EventRow => d !== null)
      .sort((a, b) => a.event_date.localeCompare(b.event_date));
    if (valid.length > 0) {
      const byDay = valid.reduce<Record<string, EventRow[]>>((acc, r) => {
        const list = acc[r.event_date] ?? [];
        list.push(r);
        acc[r.event_date] = list;
        return acc;
      }, {});
      const todayIso = new Date().toISOString().slice(0, 10);
      const candidate = byDay[todayIso]?.length ? todayIso : valid[0].event_date;
      const pick = byDay[selectedDate]?.length ? selectedDate : candidate;
      setSelectedDate(pick);
      const firstHall = (byDay[pick] ?? [])[0]?.hall ?? "";
      setSelectedEventHall(firstHall);
      const firstDate = new Date(valid[0].event_date);
      setMonthCursor(new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));
    } else {
      setSelectedDate("");
      setSelectedEventHall("");
    }
    setMessage("");
    } catch {
      setRows([]);
      setError("No se pudo cargar eventos");
    }
  }, [selectedDate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function importFile(file: File) {
    const form = new FormData();
    form.append("file", file);
    await fetch("/api/events/import", { method: "POST", body: form });
  }

  async function handleImport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    const input = e.currentTarget.elements.namedItem("file") as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      setError("Selecciona un archivo Excel (.xlsx)");
      return;
    }
    setImporting(true);
    try {
      await importFile(file);
      await refresh();
      setMessage("Eventos importados");
      setSelectedImportFile("");
      if (importInputRef.current) importInputRef.current.value = "";
    } catch (err: any) {
      setError(err?.message ?? "Error al importar");
    } finally {
      setImporting(false);
    }
  }

  async function handleAttach() {
    if (!selectedDate || (!applyAllHalls && !selectedEventHall)) return;
    setMessage("");
    setError("");
    setAttaching(true);
    try {
      let menuName = menu;
      if (menuSource === "archivo") {
        if (!menuFile) {
          setError("Selecciona un archivo de menú");
          setAttaching(false);
          return;
        }
        const form = new FormData();
        form.append("file", menuFile);
        const res = await fetch("/api/ocr?kind=menu", { method: "POST", body: form });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "OCR falló");
        }
        const { data } = await res.json();
        menuName = data?.items?.[0]?.name ?? (data?.text as string) ?? "Menú OCR";
      }

      await fetch(`/api/events/${selectedDate}/attach-menu`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          menu_name: menuName,
          org_id: "org-dev",
          hall: applyAllHalls ? null : selectedEventHall,
        }),
      });
      await refresh();
      setMessage("Menú adjunto");
    } catch (err: any) {
      setError(err?.message ?? "Error al adjuntar");
    } finally {
      setAttaching(false);
    }
  }

  async function handleSheet() {
    if (!selectedDate) return;
    if (!applyAllHalls && !selectedEventHall) return;
    setMessage("");
    setError("");
    setLoadingSheet(true);
    try {
      const hallParam = applyAllHalls ? "" : `?hall=${encodeURIComponent(selectedEventHall)}`;
      const breakdownParam = applyAllHalls && showBreakdown ? `${hallParam ? "&" : "?"}aggregate=false` : "";
      const res = await fetch(`/api/events/${selectedDate}/sheets${hallParam}${breakdownParam}`);
      const json = await res.json();
      setSheet(json.data ?? []);
      setMessage("Hoja generada");
    } catch (err: any) {
      setError(err?.message ?? "Error al generar hoja");
    } finally {
      setLoadingSheet(false);
    }
  }

  const upcoming = useMemo(() => {
    const today = new Date();
    const limit = new Date();
    limit.setDate(today.getDate() + 30);
    return sortedRows.filter((r) => {
      const d = new Date(r.event_date);
      return d >= today && d <= limit;
    });
  }, [sortedRows]);

  const handleSelectDate = (iso: string) => {
    const norm = normalizeDate(iso);
    if (!norm) {
      setSelectedDate("");
      setSelectedEventHall("");
      return;
    }
    setSelectedDate(norm);
    const firstHall = eventsByDay.get(norm)?.[0]?.hall ?? "";
    setSelectedEventHall(firstHall);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Eventos</p>
        <h1 className="text-3xl font-semibold">Calendario, menús y hojas de eventos</h1>
        <p className="text-slate-300">Importa XLSX (matriz fecha x salón), navega el mes, adjunta menú y genera compras/producción.</p>
        {message && <p className="text-xs text-emerald-200">{message}</p>}
        {error && <p className="text-xs text-rose-300">{error}</p>}
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 lg:col-span-1">
          <h2 className="text-lg font-semibold">Importar eventos (Excel)</h2>
          <form className="space-y-3" aria-label="events-import-form" onSubmit={handleImport}>
            <div className="flex flex-col gap-2 text-sm text-slate-200">
              <span>Archivo Excel/CSV</span>
              <input
                ref={importInputRef}
                aria-label="Archivo Eventos"
                name="file"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => setSelectedImportFile(e.target.files?.[0]?.name ?? "")}
                required
              />
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10"
                >
                  Elegir archivo
                </button>
                {selectedImportFile && <span className="text-xs text-slate-400 truncate">{selectedImportFile}</span>}
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <button
                type="submit"
                disabled={importing}
                className="rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2 disabled:opacity-60"
              >
                {importing ? "Importando..." : "Subir / Reimportar"}
              </button>
            </div>
          </form>
          <div className="text-[11px] text-slate-400 space-y-1">
            <p>Matriz por trimestre: fila 1 salones en orden ROSALIA, PONDAL, CASTELAO, CURROS, CUNQUEIRO, HALL, RESTAURANTE, BAR.</p>
            <p>Columna A: fechas por día del mes; celdas: "Nombre | Tipo | PAX". Reimportar reemplaza (idempotente).</p>
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 lg:col-span-2">
          <h2 className="text-lg font-semibold">Adjuntar menú y generar hojas</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm text-slate-300 flex flex-col gap-1">
              Fecha evento
              <input
                value={selectedDate || ""}
                onChange={(e) => handleSelectDate(e.target.value)}
                type="date"
                className="rounded bg-slate-900 border border-white/10 px-3 py-2"
              />
            </label>
            <label className="text-sm text-slate-300 flex flex-col gap-1">
              Salón seleccionado
              <select
                value={selectedEventHall}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedEventHall(val);
                  setApplyAllHalls(val === "ALL");
                }}
                className="rounded bg-slate-900 border border-white/10 px-3 py-2"
              >
                <option value="ALL">Todos los salones del día</option>
                {(eventsByDay.get(selectedDate) ?? []).map((ev) => (
                  <option key={ev.hall} value={ev.hall}>
                    {ev.hall}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <input
                  type="checkbox"
                  checked={applyAllHalls}
                  onChange={(e) => setApplyAllHalls(e.target.checked)}
                  className="accent-emerald-500"
                />
                Aplicar a todos los salones de esa fecha (un mismo evento repartido).
              </label>
            </label>
            <label className="text-sm text-slate-300 flex items-center gap-2 md:col-span-3">
              <input
                type="checkbox"
                checked={showBreakdown}
                onChange={(e) => setShowBreakdown(e.target.checked)}
                className="accent-emerald-500"
                disabled={!applyAllHalls}
              />
              <span className="text-xs text-slate-400">Ver desglose por salón (cuando aplicas a todos)</span>
            </label>
            <label className="text-sm text-slate-300 flex flex-col gap-1">
              Origen menú
              <select
                value={menuSource}
                onChange={(e) => setMenuSource(e.target.value as "bd" | "archivo")}
                className="rounded bg-slate-900 border border-white/10 px-3 py-2 text-sm"
              >
                <option value="bd">Base de datos</option>
                <option value="archivo">Archivo/imagen (OCR futura)</option>
              </select>
            </label>
            {menuSource === "bd" ? (
              <label className="text-sm text-slate-300 flex flex-col gap-1 md:col-span-3">
                Menú BD
                <select
                  value={menu}
                  onChange={(e) => setMenu(e.target.value)}
                  className="rounded bg-slate-900 border border-white/10 px-3 py-2 text-sm"
                >
                  {menusFromDb.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="text-sm text-slate-300 flex flex-col gap-1 md:col-span-3">
                Subir archivo / imagen (OCR Mistral)
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setMenuFile(e.target.files?.[0] ?? null)}
                  className="rounded bg-slate-900 border border-dashed border-white/20 px-3 py-2 text-sm"
                />
                <span className="text-[11px] text-slate-400">Procesamos con OCR server-side; máx 10MB.</span>
              </label>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAttach}
              disabled={attaching || !selectedDate || (!applyAllHalls && !selectedEventHall)}
              aria-label="adjuntar-menu"
              className="rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2 disabled:opacity-60"
            >
              {attaching ? "Adjuntando..." : applyAllHalls ? "Adjuntar menú a todos" : "Adjuntar solo a salón"}
            </button>
            <button
              type="button"
              onClick={handleSheet}
              disabled={loadingSheet || !selectedDate || !selectedEventHall}
              aria-label="generar-hoja"
              className="rounded-lg bg-white/10 border border-white/10 px-4 py-2 disabled:opacity-60"
            >
              {loadingSheet ? "Generando..." : "Generar hoja producción/compras"}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Adjunta menú al conjunto de eventos de esa fecha (por salón). La hoja muestra producción y compras escaladas por pax.
          </p>
        </section>
      </div>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Calendario mensual</h2>
          <div className="flex gap-2 text-sm">
            <button
              className="rounded-md border border-white/10 px-3 py-1 hover:bg-white/10"
              onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            >
              ‹ Mes
            </button>
            <button
              className="rounded-md border border-white/10 px-3 py-1 hover:bg-white/10"
              onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
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
                onClick={() => handleSelectDate(day.iso)}
                className={`h-20 rounded-lg border border-white/10 p-2 text-left transition-colors ${
                  selectedDate === day.iso ? "bg-emerald-500/20 border-emerald-300/40" : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>{day.label}</span>
                  {rows.some((r) => r.event_date === day.iso) && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(eventsByDay.get(day.iso) ?? []).slice(0, 3).map((ev) => (
                    <span
                      key={ev.hall}
                      className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-slate-200"
                    >
                      {ev.hall}
                    </span>
                  ))}
                  {(eventsByDay.get(day.iso)?.length ?? 0) > 3 && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                      +{(eventsByDay.get(day.iso)?.length ?? 0) - 3}
                    </span>
                  )}
                </div>
              </button>
            ),
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2 bg-slate-900/60 border border-white/5 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span>Eventos del {selectedDate || "—"}</span>
              <span className="text-xs text-slate-400">{selectedDayEvents.length} eventos</span>
            </div>
            {selectedDayEvents.length === 0 && <p className="text-xs text-slate-400">Sin eventos este día.</p>}
            <div className="space-y-2 max-h-48 overflow-auto pr-1">
              {selectedDayEvents.map((ev) => {
                const isSelected = selectedEventHall === ev.hall;
                return (
                  <button
                    key={ev.hall}
                    onClick={() => setSelectedEventHall(ev.hall)}
                    className={`w-full text-left rounded-md border px-3 py-2 text-sm ${
                      isSelected ? "border-emerald-300/40 bg-emerald-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{ev.hall}</span>
                      <span className="text-xs text-slate-400">{ev.attendees} pax</span>
                    </div>
                    <div className="text-slate-200">{ev.name}</div>
                    <div className="text-xs text-slate-400">{ev.event_type ?? "Tipo no indicado"}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="bg-slate-900/60 border border-white/5 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span>Próximos 30 días</span>
              <span className="text-xs text-slate-400">{upcoming.length}</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-auto pr-1 text-sm">
              {upcoming.length === 0 && <p className="text-xs text-slate-400">Sin eventos próximos.</p>}
              {upcoming.map((ev) => (
                <div key={`${ev.event_date}-${ev.hall}`} className="rounded-md border border-white/10 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{ev.hall}</span>
                    <span className="text-xs text-slate-400">{ev.event_date}</span>
                  </div>
                  <div className="text-slate-200">{ev.name}</div>
                  <div className="text-xs text-slate-400">{ev.attendees} pax · {ev.event_type ?? "Tipo"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Eventos importados</h2>
          <span className="text-xs text-slate-400">Ordenados por fecha y salón</span>
        </div>
        <table className="w-full text-sm" aria-label="events-table">
          <thead className="text-slate-300">
            <tr>
              <th className="text-left py-2">Fecha</th>
              <th className="text-left py-2">Salón</th>
              <th className="text-left py-2">Evento</th>
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
              <tr key={row.org_id + row.event_date + row.hall} data-testid="event-row" className="hover:bg-white/5">
                <td className="py-2">{row.event_date}</td>
                <td className="py-2">{row.hall}</td>
                <td className="py-2">{row.name} {row.event_type ? `(${row.event_type})` : ""}</td>
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
              <th className="text-left py-2">Salón</th>
              <th className="text-left py-2">Menú</th>
              <th className="text-right py-2">Producción (raciones)</th>
              <th className="text-right py-2">Compras (items)</th>
            </tr>
          </thead>
          <tbody>
            {sheet.length === 0 && (
              <tr><td className="py-2" colSpan={5}>Genera una hoja para verla aquí</td></tr>
            )}
            {sheet.map((row) => (
              <tr key={`${row.event_date}-${row.hall ?? "ALL"}`} className="hover:bg-white/5">
                <td className="py-2">{row.event_date}</td>
                <td className="py-2">{row.hall ?? "TODOS"}</td>
                <td className="py-2">{row.menu_name ?? "-"}</td>
                <td className="py-2 text-right">{row.production_items ?? 0}</td>
                <td className="py-2 text-right">{row.purchases_items ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
