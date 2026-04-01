import { NextResponse } from 'next/server';
import { getSession, STRAVA, APP_URL } from '@/lib/session';
import { getOrCreateUserFromAthlete, upsertStravaTokens } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const session = await getSession();

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/?error=access_denied`);
  }
  if (!state || state !== session.oauthState) {
    return NextResponse.redirect(`${APP_URL}/?error=invalid_state`);
  }

  delete session.oauthState;

  try {
    const res = await fetch('https://www.strava.com/oauth/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:     STRAVA.clientId,
        client_secret: STRAVA.clientSecret,
        code,
        grant_type:    'authorization_code',
      }),
    });
    const data = await res.json();
    if (!data.access_token) throw new Error(data.message || 'No token');

    // Persist user and tokens server-side instead of keeping them inside the session cookie
    const user = getOrCreateUserFromAthlete({
      id: data.athlete.id,
      firstname: data.athlete.firstname,
      lastname: data.athlete.lastname,
      profile: data.athlete.profile_medium,
    });

    upsertStravaTokens(user.id, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      scope: data.scope,
      token_type: data.token_type,
    });

    // Store only user id in the session cookie
    session.userId = user.id;
    await session.save();

    return NextResponse.redirect(`${APP_URL}/?auth=ok`);

  } catch (err) {
    console.error('[callback]', err.message);
    return NextResponse.redirect(`${APP_URL}/?error=token_exchange_failed`);
  }
}
