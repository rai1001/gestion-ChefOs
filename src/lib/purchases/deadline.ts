export type SupplierConfig = {
  delivery_days?: number[]; // ISO 1=Mon ... 7=Sun
  cutoff_time?: string; // HH:MM 24h
  prep_hours?: number;
  ship_hours?: number;
};

const isoDow = (date: Date) => ((date.getDay() + 6) % 7) + 1; // JS 0=Sun -> ISO 1=Mon

function prevAllowed(date: Date, deliveryDays?: number[]) {
  if (!deliveryDays || deliveryDays.length === 0) return date;
  const allowed = new Set(deliveryDays);
  for (let i = 0; i < 8; i++) {
    const candidate = new Date(date);
    candidate.setDate(date.getDate() - i);
    if (allowed.has(isoDow(candidate))) return candidate;
  }
  return date;
}

function applyCutoff(date: Date, cutoff?: string) {
  if (!cutoff) return date;
  const [hh, mm] = cutoff.split(":");
  const cutoffDate = new Date(date);
  cutoffDate.setHours(Number(hh), Number(mm), 0, 0);
  if (date.getTime() > cutoffDate.getTime()) {
    const prev = new Date(cutoffDate);
    prev.setDate(prev.getDate() - 1);
    return prev;
  }
  return date;
}

export function computeOrderDeadline(eventDate: string, supplier: SupplierConfig) {
  const prep = supplier.prep_hours ?? 0;
  const ship = supplier.ship_hours ?? 0;
  // objetivo: llegada 48h antes del evento
  const event = new Date(eventDate);
  const targetArrival = new Date(event.getTime() - 48 * 3600 * 1000);
  const arrivalDay = prevAllowed(targetArrival, supplier.delivery_days);

  // restar prep+envío para obtener corte de pedido
  const orderDateTime = new Date(arrivalDay.getTime() - (prep + ship) * 3600 * 1000);
  const orderCutoff = applyCutoff(orderDateTime, supplier.cutoff_time);
  const finalOrder = prevAllowed(orderCutoff, supplier.delivery_days);

  return {
    order_date: finalOrder.toISOString().slice(0, 10),
    delivery_eta: arrivalDay.toISOString().slice(0, 10),
    target_arrival: targetArrival.toISOString().slice(0, 10),
    prep_hours: prep,
    ship_hours: ship,
  };
}

