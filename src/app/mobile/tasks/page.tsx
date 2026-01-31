"use client";

import { useEffect, useMemo, useState } from "react";

type TaskRow = {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "done";
  due_date: string;
  shift: "morning" | "evening";
  hall?: string | null;
  priority?: string | null;
};

const today = new Date().toISOString().slice(0, 10);

export default function MobileTasksPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(false);
  const shift = (searchParams?.shift as "morning" | "evening") ?? "morning";

  const shiftLabel = useMemo(() => (shift === "morning" ? "Turno mañana (06-14)" : "Turno tarde (16-24)"), [shift]);

  async function refresh() {
    setLoading(true);
    const qs = new URLSearchParams({ from: today, to: today, shift });
    const res = await fetch(`/api/tasks?${qs.toString()}`);
    const json = await res.json();
    setTasks(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [shift]);

  async function handleStart(id: string) {
    await fetch(`/api/tasks/${id}/start`, { method: "POST" });
    await refresh();
  }

  async function handleFinish(id: string) {
    await fetch(`/api/tasks/${id}/finish`, { method: "POST" });
    await refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-6 space-y-4">
      <header className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300">Cocina · Tareas</p>
        <h1 className="text-2xl font-semibold">Hoy · {shiftLabel}</h1>
        <div className="flex gap-2">
          <a
            href="/mobile/tasks?shift=morning"
            className={`px-3 py-1 rounded-full text-sm ${shift === "morning" ? "bg-emerald-500 text-black" : "bg-white/10 text-white"}`}
          >
            Mañana
          </a>
          <a
            href="/mobile/tasks?shift=evening"
            className={`px-3 py-1 rounded-full text-sm ${shift === "evening" ? "bg-emerald-500 text-black" : "bg-white/10 text-white"}`}
          >
            Tarde
          </a>
        </div>
      </header>

      {loading && <p className="text-slate-300 text-sm">Cargando…</p>}

      <section className="space-y-3">
        {tasks.length === 0 && !loading && <p className="text-sm text-slate-300">Sin tareas en este turno.</p>}
        {tasks.map((task) => (
          <article key={task.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-semibold">{task.title}</p>
                <p className="text-xs text-slate-400">
                  {task.hall ?? "Hall"} · Prioridad {task.priority ?? "medium"}
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
            <div className="flex gap-2">
              <button
                className="flex-1 rounded-md border border-white/15 px-3 py-2 text-sm font-medium hover:bg-white/10 disabled:opacity-50"
                onClick={() => handleStart(task.id)}
                disabled={task.status !== "pending"}
              >
                Empezar
              </button>
              <button
                className="flex-1 rounded-md border border-white/15 px-3 py-2 text-sm font-medium hover:bg-white/10 disabled:opacity-50"
                onClick={() => handleFinish(task.id)}
                disabled={task.status !== "in_progress"}
              >
                Terminar
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
