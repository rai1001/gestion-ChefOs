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
  const [importing, setImporting] = useState(false);
  const [savingReal, setSavingReal] = useState(false);
  const [realDate, setRealDate] = useState("");
  const [realValue, setRealValue] = useState<number | "">("");
  const [message, setMessage] = useState<string>("");

  const demoRows = [
    { fecha: "2026-02-01", ocupacion: 150, desayunos: 140 },
    { fecha: "2026-02-02", ocupacion: 120, desayunos: 110 },
  ];

  useEffect(() => {
    fetch("/api/forecasts/delta")
      .then((r) => r.json())
      .then((json) => setRows(json.data ?? []))
      .catch(() => setRows([]));
  }, []);

  async function refresh() {
    const res = await fetch("/api/forecasts/delta");
    const json = await res.json();
    setRows(json.data ?? []);
  }

  async function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.file as unknown as HTMLInputElement;
    const file = input?.files?.[0];
    setImporting(true);
    try {
      if (file) {
        const form = new FormData();
        form.append("file", file);
        await fetch("/api/forecasts/import", { method: "POST", body: form });
        setMessage("Importación desde Excel completada");
      } else {
        await fetch("/api/forecasts/import", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ rows: demoRows }),
        });
        setMessage("Demo cargada (usa archivo para reemplazar)");
      }
      await refresh();
    } finally {
      setImporting(false);
    }
  }

  async function handleSaveReal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!realDate || realValue === "") return;
    setSavingReal(true);
    try {
      await fetch("/api/forecasts/real", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ forecast_date: realDate, breakfasts: Number(realValue), org_id: "org-dev" }),
      });
      setMessage("Real guardado");
      await refresh();
    } finally {
      setSavingReal(false);
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
        <h2 className="text-lg font-semibold">Importar Excel</h2>
        <form className="space-y-3" aria-label="forecast-import-form" onSubmit={handleImport}>
          <input aria-label="Archivo Excel" type="file" name="file" accept=".xlsx,.xls" className="text-sm" />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={importing}
              className="rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2 disabled:opacity-60"
            >
              {importing ? "Importando..." : "Subir / usar demo"}
            </button>
          </div>
          <p className="text-xs text-slate-400">Si no seleccionas archivo, cargamos demo.</p>
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
        <h2 className="text-lg font-semibold">Delta previsto vs real</h2>
        {message && <p className="text-xs text-emerald-200">{message}</p>}
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
