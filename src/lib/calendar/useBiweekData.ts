import { useEffect, useState, useMemo } from "react";
import { mapShiftsByEmployee } from "./biweek";

export function useBiweekData(rangeStart: string, rangeEnd: string) {
  const [eventsByDate, setEventsByDate] = useState<Record<string, any[]>>({});
  const [shiftsByEmployee, setShiftsByEmployee] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const paramsEvents = new URLSearchParams({ from: rangeStart, to: rangeEnd });
        const paramsShifts = new URLSearchParams({ start: rangeStart, end: rangeEnd });
        const [evRes, shRes] = await Promise.all([
          fetch(`/api/events?${paramsEvents.toString()}`),
          fetch(`/api/shifts?${paramsShifts.toString()}`),
        ]);
        const evJson = await evRes.json();
        const shJson = await shRes.json();
        if (cancelled) return;
        const evs = (evJson.data ?? []) as any[];
        const byDate: Record<string, any[]> = {};
        for (const ev of evs) {
          if (!byDate[ev.event_date]) byDate[ev.event_date] = [];
          byDate[ev.event_date].push(ev);
        }
        setEventsByDate(byDate);
        setShiftsByEmployee(mapShiftsByEmployee(shJson.data ?? []));
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [rangeStart, rangeEnd]);

  const hasEvents = useMemo(() => new Set(Object.keys(eventsByDate)), [eventsByDate]);

  return { eventsByDate, shiftsByEmployee, hasEvents, loading, error };
}
