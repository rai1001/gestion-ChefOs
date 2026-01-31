export type CalendarDay = { date: string; inMonth: boolean };

// Returns 6 weeks (42 days) grid starting on Monday
export function buildMonthMatrix(base: Date): CalendarDay[] {
  const year = base.getFullYear();
  const month = base.getMonth();
  const first = new Date(Date.UTC(year, month, 1));
  const startDow = (first.getUTCDay() + 6) % 7; // Monday=0
  const gridStart = new Date(first);
  gridStart.setUTCDate(first.getUTCDate() - startDow);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setUTCDate(gridStart.getUTCDate() + i);
    const inMonth = d.getUTCMonth() === month;
    days.push({ date: d.toISOString().slice(0, 10), inMonth });
  }
  return days;
}

export function groupByDate<T extends Record<string, any>>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const k = (item[key] as string) ?? "";
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function labelShift(status: string, code: string) {
  if (status === "cancelled") return { text: "Cancelado", color: "bg-rose-500/20 text-rose-100" };
  if (status === "done") return { text: code === "morning" ? "Mañana" : "Tarde", color: "bg-emerald-500/20 text-emerald-100" };
  return { text: code === "morning" ? "Mañana" : "Tarde", color: "bg-blue-500/20 text-blue-100" };
}
