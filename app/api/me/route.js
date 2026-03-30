import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.athlete) return NextResponse.json({ athlete: null });

  const { id, firstname, lastname, profile } = session.athlete;
  return NextResponse.json({ athlete: { id, firstname, lastname, profile } });
}
