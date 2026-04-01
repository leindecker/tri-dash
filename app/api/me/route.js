import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUserById } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ athlete: null });

  const user = getUserById(session.userId);
  if (!user) return NextResponse.json({ athlete: null });

  const { strava_athlete_id: id, firstname, lastname, profile } = user;
  return NextResponse.json({ athlete: { id, firstname, lastname, profile } });
}
