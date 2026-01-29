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
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Producción</p>
        <h1 className="text-3xl font-semibold">Producción y etiquetas</h1>
        <p className="text-slate-300">Tareas de mise en place y etiquetas con lote.</p>
      </header>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Turnos y tareas</h2>
        <table className="w-full text-sm" aria-label="tasks-table">
          <thead className="text-slate-300">
            <tr>
              <th className="text-left py-2">Tarea</th>
              <th className="text-left py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr>
                <td className="py-2" colSpan={2}>Sin tareas</td>
              </tr>
            )}
            {tasks.map((task) => (
              <tr key={task.id} data-testid="task-row">
                <td className="py-2">{task.title}</td>
                <td className="py-2">{task.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Etiquetas e inventario</h2>
        <table className="w-full text-sm" aria-label="lots-table">
          <thead className="text-slate-300">
            <tr>
              <th className="text-left py-2">Lote</th>
              <th className="text-left py-2">Etiqueta</th>
              <th className="text-left py-2">Caduca</th>
            </tr>
          </thead>
          <tbody>
            {lots.length === 0 && (
              <tr>
                <td className="py-2" colSpan={3}>Sin etiquetas</td>
              </tr>
            )}
            {lots.map((lot) => (
              <tr key={lot.id} data-testid="lot-row">
                <td className="py-2">{lot.id}</td>
                <td className="py-2">{lot.label_id}</td>
                <td className="py-2">{lot.expires_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
