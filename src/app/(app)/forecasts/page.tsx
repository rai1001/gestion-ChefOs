"use client";
import { useEffect, useState } from "react";

interface DeltaRow {
  org_id: string;
  forecast_date: string;
  breakfasts: number;
  actual_breakfasts: number;
  delta: number;
}

export default function ForecastsPage() {
  const [rows, setRows] = useState<DeltaRow[]>([]);

  useEffect(() => {
    fetch("/api/forecasts/delta")
      .then((r) => r.json())
      .then((json) => setRows(json.data ?? []))
      .catch(() => setRows([]));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Previsión</p>
        <h1 className="text-3xl font-semibold">Previsión desayunos</h1>
        <p className="text-slate-300">Sube el Excel del día y registra el real para ver el delta.</p>
      </header>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Importar Excel</h2>
        <form className="space-y-3" aria-label="forecast-import-form">
          <input aria-label="Archivo Excel" type="file" name="file" accept=".xlsx,.xls" className="text-sm" />
          <button type="button" className="rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2">Subir</button>
        </form>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Registrar real</h2>
        <form className="space-y-3" aria-label="forecast-real-form">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <label className="text-sm text-slate-300">Fecha
              <input type="date" name="date" className="mt-1 rounded bg-slate-900 border border-white/10 px-3 py-2" />
            </label>
            <label className="text-sm text-slate-300">Desayunos reales
              <input type="number" name="actual" className="mt-1 rounded bg-slate-900 border border-white/10 px-3 py-2" />
            </label>
          </div>
          <button type="button" className="rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2">Guardar</button>
        </form>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
        <h2 className="text-lg font-semibold">Delta previsto vs real</h2>
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
