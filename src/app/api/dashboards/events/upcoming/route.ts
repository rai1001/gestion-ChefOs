import { NextRequest, NextResponse } from 'next/server';
import { listUpcomingEvents } from '@/lib/events/store';
import { supabaseClient } from '@/lib/supabase/client';

const isE2E = process.env.NEXT_PUBLIC_E2E === '1' || process.env.E2E === '1';

export async function GET(req: NextRequest) {
  const days = Number(req.nextUrl.searchParams.get('days') ?? '30');
  if (isE2E) {
    const data = listUpcomingEvents(days);
    return NextResponse.json({ data, mode: 'e2e' });
  }
  const supabase = supabaseClient();
  const { data, error } = await supabase
    .from('kpi_upcoming_events')
    .select('event_date, hall, name, event_type, attendees')
    .lte('event_date', new Date(Date.now() + days * 86400000).toISOString().slice(0, 10));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [], mode: 'prod' });
}

