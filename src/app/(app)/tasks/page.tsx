"use client";
import { useCallback, useEffect, useState } from "react";

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

const demoTasks: TaskRow[] = [
  { id: "task-1", title: "Mise en place desayuno", status: "pending" },
  { id: "task-2", title: "Salsas buffet", status: "pending" },
  { id: "task-3", title: "Reposición bollería", status: "pending" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [lots, setLots] = useState<LotRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingLabel, setCreatingLabel] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");

  const refresh = useCallback(async () => {
    const resTasks = await fetch("/api/tasks");
    const jsonTasks = await resTasks.json();
    const dataTasks = (jsonTasks.data as TaskRow[]) ?? [];
    if (dataTasks.length === 0) {
      // seed demo
      for (const t of demoTasks) {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...t }),
        });
      }
      const res2 = await fetch("/api/tasks");
      const json2 = await res2.json();
      setTasks(json2.data ?? []);
      setSelectedTask(demoTasks[0].id);
      setMessage("Demo de tareas cargada (pending)");
    } else {
      setTasks(dataTasks);
      if (!selectedTask && dataTasks.length > 0) setSelectedTask(dataTasks[0].id);
    }

    const resLots = await fetch("/api/labels");
    const jsonLots = await resLots.json();
    setLots(jsonLots.data ?? []);
  }, [selectedTask]);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  async function handleStart(id: string) {
    await fetch(`/api/tasks/${id}/start`, { method: "POST" });
    await refresh();
  }

  async function handleFinish(id: string) {
    await fetch(`/api/tasks/${id}/finish`, { method: "POST" });
    await refresh();
  }

  async function handleReset() {
    setLoading(true);
    await fetch("/api/tasks", { method: "DELETE" });
    await refresh();
    setLoading(false);
  }

  async function handleCreateTask() {
    if (!newTaskTitle.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: newTaskTitle, org_id: "org-dev" }),
    });
    setNewTaskTitle("");
    await refresh();
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
        <p className="text-slate-300">Tareas de mise en place y etiquetas con lote.</p>
      </header>

      <div className="flex items-center gap-3 text-sm text-slate-300">
        <button
          onClick={refresh}
          className="rounded-md border border-white/15 px-3 py-1 hover:bg-white/10 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Cargando..." : "Recargar"}
        </button>
        <button
          onClick={handleReset}
          className="rounded-md border border-white/15 px-3 py-1 hover:bg-white/10 disabled:opacity-60"
          disabled={loading}
        >
          Reset demo
        </button>
        {message && <span className="text-emerald-200 text-xs">{message}</span>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Turnos y tareas</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-200">
              {tasks.length} tareas
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <label className="md:col-span-2 flex flex-col gap-1">
              Nueva tarea
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Ej: Mise en place cena"
                className="rounded bg-slate-900 border border-white/10 px-3 py-2"
              />
            </label>
            <button onClick={handleCreateTask} className="md:self-end rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2">
              Añadir
            </button>
          </div>
          <div className="divide-y divide-white/10">
            {tasks.length === 0 && <p className="text-sm text-slate-300 py-2">Sin tareas</p>}
            {tasks.map((task) => (
              <div key={task.id} data-testid="task-row" className="py-3 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-xs text-slate-400">ID: {task.id}</p>
                </div>
                <div className="flex items-center gap-2">
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
                  {task.status === "pending" && (
                    <button
                      className="text-xs rounded-md border border-white/15 px-2 py-1 hover:bg-white/10"
                      onClick={() => handleStart(task.id)}
                    >
                      Iniciar
                    </button>
                  )}
                  {task.status === "in_progress" && (
                    <button
                      className="text-xs rounded-md border border-white/15 px-2 py-1 hover:bg-white/10"
                      onClick={() => handleFinish(task.id)}
                    >
                      Terminar
                    </button>
                  )}
                </div>
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
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-300 flex flex-col gap-1">
              Tarea
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="rounded bg-slate-900 border border-white/10 px-3 py-2 text-sm"
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
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
              className="md:col-span-2 rounded-lg bg-emerald-500 text-black font-semibold px-4 py-2 disabled:opacity-60"
            >
              {creatingLabel ? "Generando etiqueta..." : "Generar etiqueta + lote"}
            </button>
            <p className="md:col-span-2 text-[11px] text-slate-400">
              La etiqueta solo se crea si la tarea está en estado <strong>done</strong>.
            </p>
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
