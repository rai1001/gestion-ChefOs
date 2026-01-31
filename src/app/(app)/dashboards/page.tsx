"use client";
import { useEffect, useState } from "react";
import { getAlertSummary, getForecastDelta, getUpcomingEvents } from "@/lib/dashboards/queries";

type AlertSummary = { org_id: string; alert_count: number };
type ForecastDelta = { forecast_date: string; delta: number };
type UpcomingEvent = { event_date: string; hall: string; name: string; attendees: number; event_type?: string | null };

export default function DashboardsPage() {
  const [alerts, setAlerts] = useState<AlertSummary[]>([]);
  const [deltas, setDeltas] = useState<ForecastDelta[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [alertList, setAlertList] = useState<{ title: string; date: string; severity: "warn" | "danger" }[]>([]);
  const alertCount = alerts[0]?.alert_count ?? 0;
  const deltaAvg =
    deltas.length === 0 ? 0 : Math.round(deltas.reduce((acc, d) => acc + d.delta, 0) / deltas.length);

  useEffect(() => {
    getAlertSummary("org-dev").then(setAlerts).catch(() => setAlerts([]));
    getForecastDelta("org-dev").then(setDeltas).catch(() => setDeltas([]));
    getUpcomingEvents("org-dev", 30).then(setUpcoming).catch(() => setUpcoming([]));

    // stub alert list for UI; in prod fetch /api/alerts with details
    const stubAlerts = [
      { title: "Pedido retrasado PROV-21", date: "2026-02-10", severity: "warn" as const },
      { title: "Recepción incompleta ALB-884", date: "2026-02-09", severity: "danger" as const },
    ];
    setAlertList(stubAlerts);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">KPIs</p>
        <h1 className="text-3xl font-semibold">Dashboards</h1>
        <p className="text-slate-300">Alertas, previsión y eventos próximos.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
          <p className="text-sm text-slate-300">Alertas</p>
          <p className="text-3xl font-semibold" data-testid="alerts-count">
            {alertCount}
          </p>
          <p className="text-xs text-slate-400">Pendientes de revisión</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
          <p className="text-sm text-slate-300">Próximos eventos (30d)</p>
          <p className="text-3xl font-semibold">{upcoming.length}</p>
          <p className="text-xs text-slate-400">Sumariza salones y tipos</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
          <p className="text-sm text-slate-300">Δ desayunos promedio</p>
          <p className="text-3xl font-semibold">{deltaAvg}</p>
          <p className="text-xs text-slate-400">Delta medio de previsión vs real</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Deltas previsión</p>
            <span className="text-xs text-slate-500">{deltas.length} días</span>
          </div>
          <div className="space-y-2">
            {deltas.length === 0 && <p className="text-sm text-slate-400">Sin datos</p>}
            {deltas.map((d) => {
              const width = Math.min(100, Math.abs(d.delta) * 5); // simple bar width
              return (
                <div key={d.forecast_date} data-testid="delta-item" className="flex items-center gap-3 text-sm">
                  <span className="w-24 text-slate-200">{d.forecast_date}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full ${d.delta >= 0 ? "bg-emerald-400/80" : "bg-rose-400/80"}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className={`w-12 text-right ${d.delta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                    {d.delta}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <p className="text-sm text-slate-300">Alertas recientes</p>
          <div className="space-y-2">
            {alertList.length === 0 && <p className="text-xs text-slate-500">Sin alertas cargadas.</p>}
            {alertList.map((a, idx) => (
              <div
                key={idx}
                className={`rounded-md border px-3 py-2 text-sm ${
                  a.severity === "danger"
                    ? "border-rose-400/40 bg-rose-500/10 text-rose-100"
                    : "border-amber-300/40 bg-amber-500/10 text-amber-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{a.title}</span>
                  <span className="text-[11px] text-slate-200">{a.date}</span>
                </div>
              </div>
            ))}
          </div>
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
