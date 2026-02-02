export type BiweekDay = { date: string; dayLabel: string; dow: string; hasEvent?: boolean };

export function buildBiweek(start: Date) {
  const rangeStart = start.toISOString().slice(0, 10);
  const dates: BiweekDay[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    dates.push({
      date: d.toISOString().slice(0, 10),
      dayLabel: String(d.getUTCDate()),
      dow: d.toLocaleDateString("es-ES", { weekday: "short" }),
    });
  }
  return {
    quincena1: dates.slice(0, 15),
    quincena2: dates.slice(15, 30),
    rangeStart,
    rangeEnd: dates[29]?.date,
  };
}

export function mapShiftsByEmployee(shifts: { employee_name: string; shift_date: string; shift_code: string }[]) {
  const res: Record<string, Record<string, string>> = {};
  for (const s of shifts) {
    if (!s.employee_name || !s.shift_date) continue;
    res[s.employee_name] = res[s.employee_name] || {};
    res[s.employee_name][s.shift_date] = s.shift_code;
  }
  return res;
}
