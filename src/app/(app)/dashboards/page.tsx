"use client";
import { useEffect, useState } from "react";

type AlertSummary = { org_id: string; alert_count: number };
type ForecastDelta = { forecast_date: string; delta: number };
type UpcomingEvent = { event_date: string; hall: string; name: string; attendees: number; event_type?: string | null };

export default function DashboardsPage() {
  const [alerts, setAlerts] = useState<AlertSummary[]>([]);
  const [deltas, setDeltas] = useState<ForecastDelta[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((json) => setAlerts(json.data ? [{ org_id: "org", alert_count: json.data.length }] : []));
    fetch("/api/forecasts/delta")
      .then((r) => r.json())
      .then((json) => setDeltas(json.data ?? []));
    fetch("/api/dashboards/events/upcoming?days=30")
      .then((r) => r.json())
      .then((json) => setUpcoming(json.data ?? []))
      .catch(() => setUpcoming([]));
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
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:col-span-2 space-y-3">
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

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Próximos eventos (30 días)</h2>
          <span className="text-xs text-slate-400">{upcoming.length}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {upcoming.length === 0 && <p className="text-sm text-slate-400">Sin eventos próximos.</p>}
          {upcoming.map((ev) => (
            <div key={`${ev.event_date}-${ev.hall}-${ev.name}`} className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-1">
              <div className="flex items-center justify-between text-sm text-slate-200">
                <span className="font-semibold">{ev.hall}</span>
                <span className="text-xs text-slate-400">{ev.event_date}</span>
              </div>
              <div className="text-slate-100">{ev.name}</div>
              <div className="text-xs text-slate-400">{ev.attendees} pax · {ev.event_type ?? "Tipo"}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
