import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

// Ensure a secure session password is set in production
const TOKEN_ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;
if (process.env.NODE_ENV === 'production') {
  if (!TOKEN_ENCRYPTION_KEY || TOKEN_ENCRYPTION_KEY.length < 32) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be set to a secure value (>= 32 characters) in production');
  }
}

const SESSION_OPTIONS = {
  cookieName: 'tri_session',
  // In development we allow a fallback for convenience, but in production TOKEN_ENCRYPTION_KEY is required
  password: TOKEN_ENCRYPTION_KEY || 'dev-secret-must-be-at-least-32-chars!!',
  cookieOptions: {
    secure:   process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 7,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
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
