import { NextResponse }             from 'next/server';
import { getSession, STRAVA }        from '@/lib/session';
import { mapActivity, weeksAgoTimestamp } from '@/lib/strava';

async function refreshIfNeeded(session) {
  const nowSecs = Math.floor(Date.now() / 1000);
  if (nowSecs < session.athlete.expires_at - 300) return;

  const res  = await fetch('https://www.strava.com/oauth/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     STRAVA.clientId,
      client_secret: STRAVA.clientSecret,
      grant_type:    'refresh_token',
      refresh_token: session.athlete.refresh_token,
    }),
  });
  const data = await res.json();
  if (data.access_token) {
    session.athlete.access_token  = data.access_token;
    session.athlete.refresh_token = data.refresh_token;
    session.athlete.expires_at    = data.expires_at;
    await session.save();
  }
}

export async function GET(request) {
  const session = await getSession();
  if (!session.athlete) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const weeks = Math.min(parseInt(searchParams.get('weeks') || '4'), 12);

  try {
    await refreshIfNeeded(session);

    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${weeksAgoTimestamp(weeks)}&per_page=200`,
      { headers: { Authorization: `Bearer ${session.athlete.access_token}` } }
    );

    if (res.status === 401) {
      session.destroy();
      return NextResponse.json({ error: 'Token revoked' }, { status: 401 });
    }

    const raw = await res.json();
    return NextResponse.json({ activities: raw.map(mapActivity) });

  } catch (err) {
    console.error('[activities]', err.message);
    return NextResponse.json({ error: 'Failed to fetch from Strava' }, { status: 502 });
  }
}
