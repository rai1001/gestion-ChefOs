"use client";
import { useEffect, useMemo, useState } from "react";
import { groupByDate } from "@/lib/calendar/utils";

type Employee = { id: string; name: string; hotel_id?: string | null };
type Shift = { id: string; shift_date: string; shift_code: "morning" | "evening"; status: string; employee_name?: string | null };

export default function CalendarWeekPage() {
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(new Date(start).getTime() + i * 86400000);
    return d.toISOString().slice(0, 10);
  }), [start]);

  useEffect(() => {
    fetch("/api/employees").then((r) => r.json()).then((j) => setEmployees(j.data ?? []));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ start, end: days[6] });
    fetch(`/api/shifts?${params.toString()}`).then((r) => r.json()).then((j) => setShifts(j.data ?? []));
  }, [start, days]);

  const shiftsByDay = useMemo(() => groupByDate(shifts, "shift_date"), [shifts]);

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
                  const dayShifts = (shiftsByDay[d] ?? []).filter((s) => s.employee_name === emp.name || !s.employee_name);
                  return (
                    <td key={d} className="px-2 py-2">
                      {dayShifts.length === 0 && <span className="text-slate-500 text-xs">—</span>}
                      {dayShifts.map((s) => (
                        <div key={s.id} className={`text-[11px] rounded px-2 py-1 ${s.shift_code === "morning" ? "bg-emerald-500/20 text-emerald-100" : "bg-blue-500/20 text-blue-100"}`}>
                          {s.shift_code === "morning" ? "Mañana" : "Tarde"} · {s.status}
                        </div>
                      ))}
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
