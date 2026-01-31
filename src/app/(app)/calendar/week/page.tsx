"use client";
import { useEffect, useMemo, useState } from "react";
import { groupByDate } from "@/lib/calendar/utils";

type Employee = { id: string; name: string; hotel_id?: string | null };
type Shift = { id: string; shift_date: string; shift_code: "morning" | "evening"; status: string; employee_name?: string | null };

export default function CalendarWeekPage() {
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activeCell, setActiveCell] = useState<{ emp: Employee; date: string } | null>(null);
  const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(new Date(start).getTime() + i * 86400000);
    return d.toISOString().slice(0, 10);
  }), [start]);

  useEffect(() => {
    fetch("/api/employees").then((r) => r.json()).then((j) => setEmployees(j.data ?? []));
  }, []);

  const loadShifts = async () => {
    const params = new URLSearchParams({ start, end: days[6] });
    const res = await fetch(`/api/shifts?${params.toString()}`);
    const json = await res.json();
    setShifts(json.data ?? []);
  };

  useEffect(() => {
    loadShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, days]);

  const shiftsByDay = useMemo(() => groupByDate(shifts, "shift_date"), [shifts]);

  async function createQuickShift(target: { emp: Employee; date: string }, type: "morning" | "evening" | "vacation" | "baja") {
    const payload = {
      org_id: "org-dev",
      shift_date: target.date,
      shift_code: type === "evening" ? "evening" : "morning",
      status: type === "vacation" || type === "baja" ? "cancelled" : "scheduled",
      employee_name:
        type === "vacation"
          ? `${target.emp.name} (Vacaciones)`
          : type === "baja"
          ? `${target.emp.name} (Baja)`
          : target.emp.name,
    };
    await fetch("/api/shifts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    setActiveCell(null);
    await loadShifts();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Calendario</p>
          <h1 className="text-3xl font-semibold">Semana por empleado</h1>
        </div>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded bg-slate-900 border border-white/10 px-2 py-1" />
      </header>

      <section className="overflow-x-auto" data-testid="calendar-week">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-slate-400">
              <th className="text-left py-2 pr-4">Empleado</th>
              {days.map((d) => (
                <th key={d} className="text-left py-2 px-2">{d.slice(-5)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && (
              <tr>
                <td className="py-3 text-slate-500" colSpan={days.length + 1}>Sin empleados.</td>
              </tr>
            )}
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t border-white/10">
                <td className="py-2 pr-4 text-slate-200">{emp.name}</td>
                {days.map((d) => {
                  const dayShifts = (shiftsByDay[d] ?? []).filter((s) => s.employee_name?.includes(emp.name) || !s.employee_name);
                  const isActive = activeCell && activeCell.emp.id === emp.id && activeCell.date === d;
                  return (
                    <td key={d} className="relative px-2 py-2">
                      <button
                        data-testid={`cell-${emp.id}-${d}`}
                        className="w-full text-left text-xs text-slate-200 rounded bg-white/5 border border-white/10 px-2 py-1 hover:bg-white/10"
                        onClick={() => setActiveCell({ emp, date: d })}
                      >
                        {dayShifts.length === 0 && <span className="text-slate-500 text-xs">Añadir</span>}
                        {dayShifts.map((s) => (
                          <div
                            key={s.id}
                            className={`text-[11px] rounded px-2 py-1 mt-1 ${
                              s.employee_name?.includes("Vacaciones")
                                ? "bg-amber-500/20 text-amber-100"
                                : s.employee_name?.includes("Baja")
                                ? "bg-rose-500/20 text-rose-100"
                                : s.shift_code === "morning"
                                ? "bg-emerald-500/20 text-emerald-100"
                                : "bg-blue-500/20 text-blue-100"
                            }`}
                          >
                            {s.employee_name ?? emp.name} · {s.shift_code === "morning" ? "Mañana" : "Tarde"}
                          </div>
                        ))}
                      </button>
                      {isActive && (
                        <div className="absolute z-10 mt-1 w-40 rounded-lg border border-white/20 bg-slate-900 shadow-xl p-2 space-y-1">
                          <p className="text-[11px] text-slate-300">Agregar turno</p>
                          <div className="grid grid-cols-2 gap-1">
                            <button className="text-[11px] rounded bg-emerald-500/20 text-emerald-100 px-2 py-1" onClick={() => createQuickShift({ emp, date: d }, "morning")}>
                              Mañana
                            </button>
                            <button className="text-[11px] rounded bg-blue-500/20 text-blue-100 px-2 py-1" onClick={() => createQuickShift({ emp, date: d }, "evening")}>
                              Tarde
                            </button>
                            <button className="text-[11px] rounded bg-amber-500/20 text-amber-100 px-2 py-1" onClick={() => createQuickShift({ emp, date: d }, "vacation")}>
                              Vacaciones
                            </button>
                            <button className="text-[11px] rounded bg-rose-500/20 text-rose-100 px-2 py-1" onClick={() => createQuickShift({ emp, date: d }, "baja")}>
                              Baja
                            </button>
                          </div>
                          <button className="text-[11px] text-slate-400 hover:text-white" onClick={() => setActiveCell(null)}>
                            Cerrar
                          </button>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
