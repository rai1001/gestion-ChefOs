import { useMemo, useState } from "react";
import { buildBiweek } from "@/lib/calendar/biweek";
import { useBiweekData } from "@/lib/calendar/useBiweekData";

const TURN_LABELS: Record<string, { label: string; color: string }> = {
  M: { label: "M", color: "bg-amber-500/80 text-amber-950" },
  T: { label: "T", color: "bg-indigo-500/80 text-indigo-50" },
  V: { label: "V", color: "bg-emerald-500/80 text-emerald-950" },
  N: { label: "N", color: "bg-slate-500/80 text-slate-50" },
};

function DayHeader({ day, hasEvent }: { day: string; hasEvent?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300">
      <span className="font-semibold text-white">{day}</span>
      {hasEvent && <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]"></span>}
    </div>
  );
}

function Cell({ code, testId }: { code?: string; testId?: string }) {
  if (!code) return <div data-testid={testId} className="h-7 rounded bg-white/5 border border-white/10"></div>;
  const meta = TURN_LABELS[code] ?? { label: code, color: "bg-white/10 text-white" };
  return (
    <div data-testid={testId} className={`h-7 rounded border border-white/10 text-xs font-semibold flex items-center justify-center shadow-sm ${meta.color}`}>
      {meta.label}
    </div>
  );
}

export function BiweekGrid({ startDate }: { startDate: string }) {
  const start = useMemo(() => new Date(`${startDate}T00:00:00Z`), [startDate]);
  const biweek = useMemo(() => buildBiweek(start), [start]);
  const { eventsByDate, shiftsByEmployee, hasEvents, loading, error } = useBiweekData(biweek.rangeStart, biweek.rangeEnd);
  const [focus, setFocus] = useState<"q1" | "q2" | "both">("both");

  const employees = useMemo(() => Object.keys(shiftsByEmployee), [shiftsByEmployee]);
  const renderBlock = (days: typeof biweek.quincena1) => (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur shadow-xl">
      <div className="grid" style={{ gridTemplateColumns: `160px repeat(${days.length}, minmax(40px, 1fr))` }}>
        <div className="bg-slate-900/70 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">Empleado</div>
        {days.map((d) => (
          <div key={d.date} className="bg-slate-900/70 py-2 border-l border-white/5 flex items-center justify-center">
            <DayHeader day={`${d.dayLabel}`} hasEvent={hasEvents.has(d.date)} />
          </div>
        ))}
        {employees.length === 0 && (
          <div className="col-span-full px-4 py-6 text-sm text-slate-400">Sin empleados.</div>
        )}
        {employees.map((emp) => (
          <>
            <div key={`${emp}-label`} className="flex items-center gap-2 border-t border-white/5 bg-slate-900/60 px-4 py-2">
              <div className="h-8 w-8 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-semibold">
                {emp.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-white font-medium">{emp}</p>
                <p className="text-[11px] text-slate-400">Turnos</p>
              </div>
            </div>
            {days.map((d) => (
              <div key={`${emp}-${d.date}`} className="border-t border-l border-white/5 px-1 py-1">
                <Cell code={shiftsByEmployee[emp]?.[d.date]} testId={`cell-${emp}-${d.date}`} />
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center text-sm text-slate-300">
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-300">Calendario</span>
          <h2 className="text-xl font-semibold text-white">Doble quincena</h2>
          {loading && <span className="text-emerald-300 text-xs">Cargando…</span>}
          {error && <span className="text-rose-300 text-xs">{error}</span>}
        </div>
        <div className="flex gap-2 items-center text-xs text-slate-300">
          <button className={`rounded-full px-3 py-1 border border-white/10 ${focus === "both" ? "bg-white/10" : "bg-transparent"}`} onClick={() => setFocus("both")}>Ambas</button>
          <button className={`rounded-full px-3 py-1 border border-white/10 ${focus === "q1" ? "bg-white/10" : "bg-transparent"}`} onClick={() => setFocus("q1")}>1ª</button>
          <button className={`rounded-full px-3 py-1 border border-white/10 ${focus === "q2" ? "bg-white/10" : "bg-transparent"}`} onClick={() => setFocus("q2")}>2ª</button>
        </div>
      </div>

      {(focus === "both" || focus === "q1") && renderBlock(biweek.quincena1)}
      {(focus === "both" || focus === "q2") && renderBlock(biweek.quincena2)}
    </div>
  );
}
