"use client";
import { useEffect, useState } from "react";
import {
  getAlertSummary,
  getForecastDelta,
  getUpcomingEvents,
  getExpirySoon,
  getUpcomingTasks,
  getAlerts,
  getBreakfastForecast,
} from "@/lib/dashboards/queries";

type AlertSummary = { org_id: string; alert_count: number };
type ForecastDelta = { forecast_date: string; delta: number };
type UpcomingEvent = { event_date: string; hall: string; name: string; attendees: number; event_type?: string | null };
type ExpiryItem = { lot_id: string; product_id?: string; expires_at?: string };
type TaskItem = { id: string; title: string; due_date: string; shift: "morning" | "evening"; status: string; hall?: string | null };
type AlertItem = { title: string; date?: string; severity: "warn" | "danger" };
type BreakfastItem = { date: string; breakfasts: number };

export default function DashboardsPage() {
  const [alerts, setAlerts] = useState<AlertSummary[]>([]);
  const [deltas, setDeltas] = useState<ForecastDelta[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [alertList, setAlertList] = useState<AlertItem[]>([]);
  const [expiry, setExpiry] = useState<ExpiryItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [breakfasts, setBreakfasts] = useState<BreakfastItem[]>([]);
  const alertCount = alerts[0]?.alert_count ?? 0;
  const deltaAvg =
    deltas.length === 0 ? 0 : Math.round(deltas.reduce((acc, d) => acc + d.delta, 0) / deltas.length);
  const breakfastsSum = breakfasts.reduce((acc, b) => acc + (b.breakfasts ?? 0), 0);
  const tasksCount = tasks.length;
  const expiryCount = expiry.length;

  useEffect(() => {
    getAlertSummary("org-dev").then(setAlerts).catch(() => setAlerts([]));
    getForecastDelta("org-dev").then(setDeltas).catch(() => setDeltas([]));
    getUpcomingEvents("org-dev", 7).then(setUpcoming).catch(() => setUpcoming([]));
    getExpirySoon("org-dev", 7).then(setExpiry).catch(() => setExpiry([]));
    getUpcomingTasks("org-dev", 7).then(setTasks).catch(() => setTasks([]));
    getAlerts("org-dev").then(setAlertList).catch(() => setAlertList([]));
    getBreakfastForecast("org-dev", 7).then(setBreakfasts).catch(() => setBreakfasts([]));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">KPIs</p>
        <h1 className="text-3xl font-semibold">Dashboard operativo</h1>
        <p className="text-slate-300">Alertas, tareas, previsión de desayunos y caducidades próximas.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1" data-testid="card-alerts">
          <p className="text-sm text-slate-300">Alertas</p>
          <p className="text-3xl font-semibold" data-testid="alerts-count">
            {alertCount}
          </p>
          <p className="text-xs text-slate-400">Pendientes de revisión</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1" data-testid="card-tasks">
          <p className="text-sm text-slate-300">Tareas (7 días)</p>
          <p className="text-3xl font-semibold">{tasksCount}</p>
          <p className="text-xs text-slate-400">Pendientes / en curso</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1" data-testid="card-forecast">
          <p className="text-sm text-slate-300">Previsión desayunos (7d)</p>
          <p className="text-3xl font-semibold">{breakfastsSum}</p>
          <p className="text-xs text-slate-400">Suma prevista próximos 7 días</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1" data-testid="card-expiry">
          <p className="text-sm text-slate-300">Caducidades (≤7d)</p>
          <p className="text-3xl font-semibold">{expiryCount}</p>
          <p className="text-xs text-slate-400">Lotes a revisar</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3" data-testid="list-alerts">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Alertas recientes</p>
            <span className="text-xs text-slate-500">{alertList.length}</span>
          </div>
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

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3" data-testid="list-events">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Próximos eventos (7 días)</p>
            <span className="text-xs text-slate-500">{upcoming.length}</span>
          </div>
          <div className="space-y-2">
            {upcoming.length === 0 && <p className="text-sm text-slate-400">Sin eventos próximos.</p>}
            {upcoming.map((ev) => (
              <div key={`${ev.event_date}-${ev.hall}-${ev.name}`} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-1 text-sm">
                <div className="flex items-center justify-between text-slate-200">
                  <span className="font-semibold">{ev.hall}</span>
                  <span className="text-xs text-slate-400">{ev.event_date}</span>
                </div>
                <div className="text-slate-100">{ev.name}</div>
                <div className="text-xs text-slate-400">{ev.attendees} pax · {ev.event_type ?? "Tipo"}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3" data-testid="list-expiry">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Caducidades próximas (≤7 días)</p>
            <span className="text-xs text-slate-500">{expiry.length}</span>
          </div>
          <div className="space-y-2">
            {expiry.length === 0 && <p className="text-sm text-slate-400">Sin caducidades.</p>}
            {expiry.map((lot) => (
              <div key={lot.lot_id} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-100">{lot.product_id ?? "Producto"}</span>
                  <span className="text-xs text-slate-400">{lot.expires_at ?? "-"}</span>
                </div>
                <p className="text-[11px] text-slate-500">Lote {lot.lot_id}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3" data-testid="list-tasks">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Tareas próximas (7 días)</p>
            <span className="text-xs text-slate-500">{tasks.length}</span>
          </div>
          <div className="space-y-2">
            {tasks.length === 0 && <p className="text-sm text-slate-400">Sin tareas.</p>}
            {tasks.map((t) => (
              <div key={t.id} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <div className="flex items-center justify-between text-slate-200">
                  <span className="font-semibold">{t.title}</span>
                  <span className="text-xs text-slate-400">{t.due_date}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {t.shift === "morning" ? "Mañana" : "Tarde"} · {t.status} · {t.hall ?? "Hall"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
