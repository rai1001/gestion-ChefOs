"use client";
import { useEffect, useState } from "react";

type TaskRow = {
  id: string;
  title: string;
  status: string;
};

type LotRow = {
  id: string;
  label_id: string;
  expires_at: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [lots, setLots] = useState<LotRow[]>([]);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((json) => setTasks(json.data ?? []))
      .catch(() => setTasks([]));
    fetch("/api/labels")
      .then((r) => r.json())
      .then((json) => setLots(json.data ?? []))
      .catch(() => setLots([]));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 md:px-8 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Producción</p>
        <h1 className="text-3xl md:text-4xl font-semibold">Producción y etiquetas</h1>
        <p className="text-slate-300">Tareas de mise en place y etiquetas con lote.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Turnos y tareas</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-200">
              {tasks.length} tareas
            </span>
          </div>
          <div className="divide-y divide-white/10">
            {tasks.length === 0 && <p className="text-sm text-slate-300 py-2">Sin tareas</p>}
            {tasks.map((task) => (
              <div key={task.id} data-testid="task-row" className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-xs text-slate-400">ID: {task.id}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
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
            ))}
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Etiquetas e inventario</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-sky-500/20 text-sky-200">
              {lots.length} lotes
            </span>
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
