import { NextRequest, NextResponse } from 'next/server';
import { listUpcomingEvents } from '@/lib/events/store';

const isE2E = process.env.NEXT_PUBLIC_E2E === '1' || process.env.E2E === '1';

export async function GET(req: NextRequest) {
  const days = Number(req.nextUrl.searchParams.get('days') ?? '30');
  if (isE2E) {
    const data = listUpcomingEvents(days);
    return NextResponse.json({ data, mode: 'e2e' });
  }
  return NextResponse.json({ data: [], mode: 'stub' });
}

