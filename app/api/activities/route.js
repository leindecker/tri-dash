import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { mapActivity, weeksAgoTimestamp, getAccessTokenForUser } from '@/lib/strava';
import { getUserById } from '@/lib/db';

export async function GET(request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const weeks = Math.min(parseInt(searchParams.get('weeks') || '4'), 12);

  try {
    const accessToken = await getAccessTokenForUser(session.userId);
    if (!accessToken) {
      await session.destroy();
      return NextResponse.json({ error: 'Token missing' }, { status: 401 });
    }

    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${weeksAgoTimestamp(weeks)}&per_page=200`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (res.status === 401) {
      await session.destroy();
      return NextResponse.json({ error: 'Token revoked' }, { status: 401 });
    }

    const raw = await res.json();
    return NextResponse.json({ activities: raw.map(mapActivity) });

  } catch (err) {
    console.error('[activities]', err.message);
    return NextResponse.json({ error: 'Failed to fetch from Strava' }, { status: 502 });
  }
}
