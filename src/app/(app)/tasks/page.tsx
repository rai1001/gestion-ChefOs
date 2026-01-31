"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

type TaskRow = {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "done";
  due_date: string;
  shift: "morning" | "evening";
  priority: "low" | "medium" | "high";
  hall?: string | null;
  servings?: number | null;
};

type LotRow = {
  id: string;
  label_id: string;
  expires_at: string;
};

const todayIso = new Date().toISOString().slice(0, 10);
const defaultFrom = todayIso;
const defaultTo = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [lots, setLots] = useState<LotRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingLabel, setCreatingLabel] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [shift, setShift] = useState<"morning" | "evening">("morning");
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [applying, setApplying] = useState(false);

  const filtersLabel = useMemo(() => `${fromDate} → ${toDate} · ${shift === "morning" ? "Mañana" : "Tarde"}`, [fromDate, toDate, shift]);

  const refresh = useCallback(async () => {
    const query = new URLSearchParams();
    if (fromDate) query.set("from", fromDate);
    if (toDate) query.set("to", toDate);
    if (shift) query.set("shift", shift);
    const resTasks = await fetch(`/api/tasks?${query.toString()}`);
    const jsonTasks = await resTasks.json();
    const dataTasks = (jsonTasks.data as TaskRow[]) ?? [];
    setTasks(dataTasks);
    if (!selectedTask && dataTasks.length > 0) setSelectedTask(dataTasks[0].id);

    const resLots = await fetch("/api/labels");
    const jsonLots = await resLots.json();
    setLots(jsonLots.data ?? []);
  }, [fromDate, toDate, shift, selectedTask]);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  async function handleStart(id: string) {
    // Optimistic update so e2e can see the status immediately
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "in_progress" } : t)));
    await fetch(`/api/tasks/${id}/start`, { method: "POST" });
    await refresh();
  }

  async function handleFinish(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "done" } : t)));
    await fetch(`/api/tasks/${id}/finish`, { method: "POST" });
    await refresh();
  }

  async function handleApplyProduction() {
    setApplying(true);
    setMessage("");
    await fetch("/api/tasks/apply", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ org_id: "org-dev", event_date: fromDate }),
    });
    await refresh();
    setApplying(false);
    setMessage("Hoja aplicada a tareas");
  }

  async function handleCreateLabel() {
    if (!selectedTask || !expiresAt) return;
    setCreatingLabel(true);
    try {
      await fetch("/api/labels", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          task_id: selectedTask,
          expires_at: expiresAt,
          org_id: "org-dev",
        }),
      });
      setMessage("Etiqueta creada");
      await refresh();
    } catch (e: any) {
      setMessage(e?.message ?? "Error");
    } finally {
      setCreatingLabel(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 md:px-8 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Producción</p>
        <h1 className="text-3xl md:text-4xl font-semibold">Producción y etiquetas</h1>
        <p className="text-slate-300">Tareas por turno (15 días), mise en place, inicio/fin y creación de etiquetas.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <label className="flex items-center gap-2">
          Desde
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded bg-slate-900 border border-white/10 px-2 py-1" />
        </label>
        <label className="flex items-center gap-2">
          Hasta
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded bg-slate-900 border border-white/10 px-2 py-1" />
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setShift("morning")}
            className={`px-3 py-1 rounded-md border ${shift === "morning" ? "bg-emerald-500 text-black border-emerald-400" : "border-white/15"}`}
          >
            Turno mañana
          </button>
          <button
            onClick={() => setShift("evening")}
            className={`px-3 py-1 rounded-md border ${shift === "evening" ? "bg-emerald-500 text-black border-emerald-400" : "border-white/15"}`}
          >
            Turno tarde
          </button>
        </div>
        <button
          onClick={refresh}
          className="rounded-md border border-white/15 px-3 py-1 hover:bg-white/10 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Cargando..." : "Recargar"}
        </button>
        {message && <span className="text-emerald-200 text-xs">{message}</span>}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Tareas ({filtersLabel})</h2>
              <p className="text-xs text-slate-400">Start/Finish; terminar solo si está iniciada.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleApplyProduction}
                disabled={applying}
                className="rounded-md bg-emerald-500 text-black font-semibold px-3 py-1 text-sm disabled:opacity-60"
              >
                {applying ? "Aplicando..." : "Aplicar hoja de producción"}
              </button>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-200">{tasks.length} tareas</span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {tasks.length === 0 && <p className="text-sm text-slate-300 py-2">Sin tareas en el rango</p>}
            {tasks.map((task) => (
              <article key={task.id} data-testid="task-row" className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-xs text-slate-400">
                      {task.due_date} · {task.shift === "morning" ? "Mañana" : "Tarde"} · {task.hall ?? "Hall"}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full ${
                      task.status === "done"
                        ? "bg-emerald-500/20 text-emerald-200"
                        : task.status === "in_progress"
                        ? "bg-amber-500/20 text-amber-200"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex flex-wrap gap-2">
                  <span className="rounded bg-white/10 px-2 py-1">Pax {task.servings ?? "-"}</span>
                  <span className="rounded bg-white/10 px-2 py-1">Prioridad {task.priority}</span>
                  {task.hall && <span className="rounded bg-white/10 px-2 py-1">{task.hall}</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-xs rounded-md border border-white/15 px-2 py-1 hover:bg-white/10 disabled:opacity-50"
                    onClick={() => handleStart(task.id)}
                    disabled={task.status !== "pending"}
                  >
                    Empezar
                  </button>
                  <button
                    className="text-xs rounded-md border border-white/15 px-2 py-1 hover:bg-white/10 disabled:opacity-50"
                    onClick={() => handleFinish(task.id)}
                    disabled={task.status !== "in_progress"}
                  >
                    Terminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Etiquetas e inventario</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-sky-500/20 text-sky-200">{lots.length} lotes</span>
          </div>
          <div className="grid gap-3">
            <label className="text-sm text-slate-300 flex flex-col gap-1">
              Tarea
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="rounded bg-slate-900 border border-white/10 px-3 py-2 text-sm"
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-300 flex flex-col gap-1">
              Caducidad
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="rounded bg-slate-900 border border-white/10 px-3 py-2"
              />
            </label>
            <button
              type="button"
              onClick={handleCreateLabel}
              disabled={creatingLabel || !selectedTask || !expiresAt}
              className="rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2 disabled:opacity-60"
            >
              {creatingLabel ? "Generando etiqueta..." : "Generar etiqueta + lote"}
            </button>
            <p className="text-[11px] text-slate-400">Solo se crea si la tarea está en estado done.</p>
          </div>
          <div className="divide-y divide-white/10">
            {lots.length === 0 && <p className="text-sm text-slate-300 py-2">Sin etiquetas</p>}
            {lots.map((lot) => (
              <div key={lot.id} data-testid="lot-row" className="py-3">
                <p className="font-semibold">{lot.label_id}</p>
                <p className="text-xs text-slate-400">Lote: {lot.id}</p>
                <p className="text-xs text-slate-300">Caduca: {lot.expires_at}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
