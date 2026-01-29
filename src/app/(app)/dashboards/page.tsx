"use client";
import { useEffect, useState } from "react";

type AlertSummary = { org_id: string; alert_count: number };
type ForecastDelta = { forecast_date: string; delta: number };

export default function DashboardsPage() {
  const [alerts, setAlerts] = useState<AlertSummary[]>([]);
  const [deltas, setDeltas] = useState<ForecastDelta[]>([]);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((json) => setAlerts(json.data ? [{ org_id: "org", alert_count: json.data.length }] : []));
    fetch("/api/forecasts/delta")
      .then((r) => r.json())
      .then((json) => setDeltas(json.data ?? []));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">KPIs</p>
        <h1 className="text-3xl font-semibold">Dashboards</h1>
        <p className="text-slate-300">Alertas y tendencias de previsión.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-sm text-slate-300">Alertas</p>
          <p className="text-3xl font-semibold" data-testid="alerts-count">
            {alerts[0]?.alert_count ?? 0}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:col-span-2">
          <p className="text-sm text-slate-300">Deltas previsión</p>
          <ul className="text-sm space-y-1" aria-label="delta-list">
            {deltas.length === 0 && <li>Sin datos</li>}
            {deltas.map((d) => (
              <li key={d.forecast_date} data-testid="delta-item">
                {d.forecast_date}: {d.delta}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

