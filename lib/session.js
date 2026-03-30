import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

const SESSION_OPTIONS = {
  cookieName: 'tri_session',
  password:   process.env.SESSION_SECRET || 'dev-secret-must-be-at-least-32-chars!!',
  cookieOptions: {
    secure:   process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 7,
  },
};

export async function getSession() {
  const cookieStore = cookies();
  return getIronSession(cookieStore, SESSION_OPTIONS);
}

export const STRAVA = {
  clientId:     process.env.STRAVA_CLIENT_ID,
  clientSecret: process.env.STRAVA_CLIENT_SECRET,
  get redirectUri() {
    const base = process.env.APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    return `${base}/api/auth/callback`;
  },
  scope: 'read,activity:read',
};

export const APP_URL =
  process.env.APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
