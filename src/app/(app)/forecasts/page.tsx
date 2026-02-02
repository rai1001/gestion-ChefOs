"use client";
import { useEffect, useRef, useState } from "react";

interface DeltaRow {
  org_id: string;
  forecast_date: string;
  breakfasts: number;
  actual_breakfasts: number;
  delta: number;
}

export default function ForecastsPage() {
  const [rows, setRows] = useState<DeltaRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [savingReal, setSavingReal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [realDate, setRealDate] = useState("");
  const [realValue, setRealValue] = useState<number | "">("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // domingo
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      const res = await fetch("/api/forecasts/delta");
      const json = await res.json();
      const data = (json.data as DeltaRow[]) ?? [];
      data.sort((a, b) => a.forecast_date.localeCompare(b.forecast_date));
      setRows(data);
    } catch {
      setRows([]);
    }
  }

  async function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    const input = e.currentTarget.elements.namedItem("file") as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      setError("Selecciona un archivo CSV o XLSX");
      return;
    }
    setImporting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/forecasts/import", { method: "POST", body: form });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Error al importar");
      }
      setMessage("Importación completada");
      setSelectedFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refresh();
    } catch (err: any) {
      setError(err?.message ?? "Error al importar");
    } finally {
      setImporting(false);
    }
  }

  async function handleSaveReal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!realDate || realValue === "") {
      setError("Fecha y desayunos reales son obligatorios");
      return;
    }
    setSavingReal(true);
    try {
      const res = await fetch("/api/forecasts/real", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ forecast_date: realDate, actual_breakfasts: Number(realValue), org_id: "org-dev" }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Error al guardar real");
      }
      setMessage("Real guardado");
      await refresh();
    } catch (err: any) {
      setError(err?.message ?? "Error al guardar real");
    } finally {
      setSavingReal(false);
    }
  }

  async function handleReset() {
    setMessage("");
    setError("");
    setResetting(true);
    try {
      await fetch("/api/forecasts/reset", { method: "POST" });
      setMessage("Datos reseteados");
      await refresh();
    } catch (err: any) {
      setError(err?.message ?? "Error al resetear");
    } finally {
      setResetting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Previsión</p>
        <h1 className="text-3xl font-semibold">Previsión desayunos</h1>
        <p className="text-slate-300">Sube el Excel del día y registra el real para ver el delta.</p>
      </header>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Importar previsión (CSV/XLSX)</h2>
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="rounded-md border border-white/15 px-3 py-1 text-sm hover:bg-white/10 disabled:opacity-60"
          >
            {resetting ? "Reseteando..." : "Reset datos"}
          </button>
        </div>
        <form className="space-y-3" aria-label="forecast-import-form" onSubmit={handleImport}>
          <div className="flex flex-col gap-2 text-sm text-slate-200">
            <span>Archivo previsión</span>
            <input
              ref={fileInputRef}
              aria-label="Archivo previsión"
              name="file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name ?? "")}
              className="hidden"
              required
            />
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10"
              >
                Elegir archivo
              </button>
              <span className="text-xs text-slate-400">
                CSV/XLSX con columnas: fecha, ocupacion, desayunos.
              </span>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <button
              type="submit"
              disabled={importing}
              className="rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2 disabled:opacity-60"
            >
              {importing ? "Importando..." : "Subir"}
            </button>
            {selectedFileName && (
              <span className="text-xs text-slate-300 truncate">{selectedFileName}</span>
            )}
          </div>
          <p className="text-xs text-slate-400">Reemplaza por fecha (no suma). Columnas requeridas: fecha, ocupacion, desayunos.</p>
        </form>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Registrar real</h2>
        <form className="space-y-3" aria-label="forecast-real-form" onSubmit={handleSaveReal}>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <label className="text-sm text-slate-300">Fecha
              <input
                type="date"
                name="date"
                value={realDate}
                onChange={(e) => setRealDate(e.target.value)}
                className="mt-1 rounded bg-slate-900 border border-white/10 px-3 py-2"
              />
            </label>
            <label className="text-sm text-slate-300">Desayunos reales
              <input
                type="number"
                name="actual"
                value={realValue}
                onChange={(e) => setRealValue(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1 rounded bg-slate-900 border border-white/10 px-3 py-2"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={savingReal || !realDate || realValue === ""}
            className="rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2 disabled:opacity-60"
          >
            {savingReal ? "Guardando..." : "Guardar real"}
          </button>
        </form>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Semana en curso</h2>
          <span className="text-xs text-slate-400">{currentWeekRows.length} días</span>
        </div>
        {currentWeekRows.length === 0 && <p className="text-sm text-slate-400">No hay datos de esta semana.</p>}
        {currentWeekRows.length > 0 && (
          <table className="w-full text-sm" aria-label="forecast-current-week">
            <thead className="text-slate-300">
              <tr>
                <th className="text-left py-2">Fecha</th>
                <th className="text-right py-2">Previsto</th>
                <th className="text-right py-2">Real</th>
                <th className="text-right py-2">Delta</th>
              </tr>
            </thead>
            <tbody>
              {currentWeekRows.map((row) => (
                <tr key={row.forecast_date}>
                  <td className="py-2">{row.forecast_date}</td>
                  <td className="py-2 text-right">{row.breakfasts}</td>
                  <td className="py-2 text-right">{row.actual_breakfasts}</td>
                  <td className="py-2 text-right">{row.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Semana en curso</h2>
          <span className="text-xs text-slate-400">{rows.filter((r) => {
            const d = new Date(r.forecast_date);
            return d >= startOfWeek && d <= endOfWeek;
          }).length} días</span>
        </div>
        {rows.filter((r) => {
          const d = new Date(r.forecast_date);
          return d >= startOfWeek && d <= endOfWeek;
        }).length === 0 && <p className="text-sm text-slate-400">No hay datos de esta semana.</p>}
        {rows.filter((r) => {
          const d = new Date(r.forecast_date);
          return d >= startOfWeek && d <= endOfWeek;
        }).length > 0 && (
          <table className="w-full text-sm" aria-label="forecast-current-week">
            <thead className="text-slate-300">
              <tr>
                <th className="text-left py-2">Fecha</th>
                <th className="text-right py-2">Previsto</th>
                <th className="text-right py-2">Real</th>
                <th className="text-right py-2">Delta</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((r) => {
                  const d = new Date(r.forecast_date);
                  return d >= startOfWeek && d <= endOfWeek;
                })
                .map((row) => (
                  <tr key={row.forecast_date}>
                    <td className="py-2">{row.forecast_date}</td>
                    <td className="py-2 text-right">{row.breakfasts}</td>
                    <td className="py-2 text-right">{row.actual_breakfasts}</td>
                    <td className="py-2 text-right">{row.delta}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
        <h2 className="text-lg font-semibold">Delta previsto vs real</h2>
        {message && <p className="text-xs text-emerald-200">{message}</p>}
        {error && <p className="text-xs text-rose-300">{error}</p>}
        <table className="w-full text-sm" aria-label="forecast-delta-table">
          <thead className="text-slate-300">
            <tr>
              <th className="text-left py-2">Fecha</th>
              <th className="text-right py-2">Previsto</th>
              <th className="text-right py-2">Real</th>
              <th className="text-right py-2">Delta</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="py-2" colSpan={4}>Sin datos</td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.org_id + row.forecast_date} data-testid="delta-row">
                <td className="py-2">{row.forecast_date}</td>
                <td className="py-2 text-right">{row.breakfasts}</td>
                <td className="py-2 text-right">{row.actual_breakfasts}</td>
                <td className="py-2 text-right">{row.delta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
