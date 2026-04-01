const SPORT_MAP = {
  Swim: 'swim', Pool_Swim: 'swim',
  Ride: 'bike', VirtualRide: 'bike', EBikeRide: 'bike', MountainBikeRide: 'bike',
  Run:  'run',  VirtualRun:  'run',  TrailRun:  'run',
  WeightTraining: 'gym', Workout: 'gym', Crossfit: 'gym', Yoga: 'gym',
};

function estimateTSS(sport, mins) {
  if (!mins) return 0;
  const IF = { swim: 0.75, bike: 0.70, run: 0.75, gym: 0.55 };
  const h   = mins / 60;
  const if_ = IF[sport] || 0.70;
  return Math.round(h * if_ * if_ * 100);
}

function getMondayISO(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function weeksAgoTimestamp(weeks) {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - (weeks - 1) * 7);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

export function mapActivity(a) {
  const sport     = SPORT_MAP[a.sport_type] || SPORT_MAP[a.type] || 'run';
  const mins      = Math.round((a.moving_time || a.elapsed_time || 0) / 60);
  const distKm    = Math.round((a.distance || 0) / 100) / 10;
  const date      = new Date(a.start_date_local);
  const dayOfWeek = (date.getDay() + 6) % 7;

  return {
    id:        `strava_${a.id}`,
    stravaId:  a.id,
    source:    'strava',
    sport,
    day:       dayOfWeek,
    weekKey:   getMondayISO(date),
    desc:      a.name,
    mins,
    dist:      distKm,
    tss:       estimateTSS(sport, mins),
    avgSpeed:  a.average_speed          || null,
    avgHr:     a.average_heartrate     || null,
    maxHr:     a.max_heartrate         || null,
    elevGain:  a.total_elevation_gain  || 0,
    // power fields (may be present for rides with power meters)
    avgPower:  a.average_watts         || null,
    normPower: a.weighted_average_watts || a.weighted_average_power || null,
    maxPower:  a.max_watts             || null,
    startDate: a.start_date_local,
  };
}

import { getStravaTokensForUser, upsertStravaTokens } from '@/lib/db';

async function refreshTokenIfNeeded(userId, tokens) {
  const now = Math.floor(Date.now() / 1000);
  if (tokens.expires_at && tokens.expires_at > now + 60) {
    return tokens.access_token;
  }

  // refresh
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
    }),
  });
  const data = await res.json();
  if (!data.access_token) {
    console.error(`[strava] failed to refresh token for user ${userId}:`, data);
    throw new Error('Unable to refresh token');
  }

  upsertStravaTokens(userId, {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    scope: data.scope,
    token_type: data.token_type,
  });

  return data.access_token;
}

export async function getAccessTokenForUser(userId) {
  try {
    const tokens = getStravaTokensForUser(userId);
    if (!tokens) {
      console.warn(`[strava] no tokens found for user ${userId}`);
      return null;
    }
    return await refreshTokenIfNeeded(userId, tokens);
  } catch (err) {
    console.error('[strava] getAccessTokenForUser error:', err && err.message ? err.message : err);
    return null;
  }
}

