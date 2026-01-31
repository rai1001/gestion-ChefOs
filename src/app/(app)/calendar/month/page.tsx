"use client";
import { useEffect, useMemo, useState } from "react";
import { buildMonthMatrix, groupByDate, labelShift } from "@/lib/calendar/utils";

type EventItem = { event_date: string; hall: string; name: string; attendees: number };
type ShiftItem = { shift_date: string; shift_code: "morning" | "evening"; status: string; employee_name?: string | null };

export default function CalendarMonthPage() {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [shifts, setShifts] = useState<ShiftItem[]>([]);

  const matrix = useMemo(() => buildMonthMatrix(monthDate), [monthDate]);
  const monthLabel = monthDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  async function loadData() {
    const start = matrix[0]?.date;
    const end = matrix[matrix.length - 1]?.date;
    const params = new URLSearchParams();
    if (start) params.set("from", start);
    if (end) params.set("to", end);
    const [evRes, shRes] = await Promise.all([fetch(`/api/events?${params}`), fetch(`/api/shifts?start=${start}&end=${end}`)]);
    const evJson = await evRes.json();
    const shJson = await shRes.json();
    setEvents(evJson.data ?? []);
    setShifts(shJson.data ?? []);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthDate]);

  const eventsByDay = useMemo(() => groupByDate(events, "event_date"), [events]);
  const shiftsByDay = useMemo(() => groupByDate(shifts, "shift_date"), [shifts]);

  function prevMonth() {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() - 1);
    setMonthDate(d);
  }
  function nextMonth() {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() + 1);
    setMonthDate(d);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Calendario</p>
          <h1 className="text-3xl font-semibold">Mes</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="rounded border border-white/10 px-2 py-1 hover:bg-white/10">
            ◀
          </button>
          <span className="text-sm text-slate-200">{monthLabel}</span>
          <button onClick={nextMonth} className="rounded border border-white/10 px-2 py-1 hover:bg-white/10">
            ▶
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 text-xs text-slate-400">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} className="px-2 py-1">
            {d}
          </div>
        ))}
      </div>

      <section className="grid grid-cols-7 gap-px bg-white/10 rounded-lg overflow-hidden" data-testid="calendar-month">
        {matrix.map((day) => {
          const evs = eventsByDay[day.date] ?? [];
          const shs = shiftsByDay[day.date] ?? [];
          return (
            <div key={day.date} className={`min-h-[120px] bg-slate-900 p-2 space-y-1 ${day.inMonth ? "" : "opacity-40"}`}>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>{day.date.slice(-2)}</span>
                <span className="text-[10px] text-slate-500">{evs.length + shs.length} items</span>
              </div>
              <div className="space-y-1">
                {evs.slice(0, 2).map((ev, idx) => (
                  <div key={idx} className="rounded bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 text-[11px] text-emerald-100">
                    {ev.name} · {ev.attendees}p
                  </div>
                ))}
                {evs.length > 2 && <div className="text-[10px] text-emerald-200">+{evs.length - 2} eventos</div>}
                {shs.slice(0, 2).map((sh, idx) => {
                  const l = labelShift(sh.status, sh.shift_code);
                  return (
                    <div key={idx} className={`rounded px-2 py-1 text-[11px] ${l.color}`}>
                      {l.text} {sh.employee_name ?? ""}
                    </div>
                  );
                })}
                {shs.length > 2 && <div className="text-[10px] text-slate-300">+{shs.length - 2} turnos</div>}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
