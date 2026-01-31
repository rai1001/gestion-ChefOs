import { describe, it, expect } from 'vitest';
import { computeOrderDeadline } from '@/lib/purchases/deadline';

describe('computeOrderDeadline', () => {
  it('backs up to delivery day and cutoff', () => {
    const res = computeOrderDeadline('2026-02-10', {
      delivery_days: [1, 3, 5], // LMXJV
      cutoff_time: '12:00',
      prep_hours: 24,
      ship_hours: 12,
    });
    // target arrival = 48h antes => 2026-02-08 (domingo), prev delivery day = viernes 2026-02-06
    expect(res.delivery_eta).toBe('2026-02-06');
    expect(res.order_date <= res.delivery_eta).toBe(true);
  });
});

