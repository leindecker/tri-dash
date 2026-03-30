import { NextResponse } from 'next/server';
import { randomBytes }  from 'crypto';
import { getSession, STRAVA } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  const state   = randomBytes(16).toString('hex');
  session.oauthState = state;
  await session.save();

  const url = new URL('https://www.strava.com/oauth/authorize');
  url.searchParams.set('client_id',       STRAVA.clientId);
  url.searchParams.set('response_type',   'code');
  url.searchParams.set('redirect_uri',    STRAVA.redirectUri);
  url.searchParams.set('approval_prompt', 'auto');
  url.searchParams.set('scope',           STRAVA.scope);
  url.searchParams.set('state',           state);

  return NextResponse.redirect(url.toString());
}
