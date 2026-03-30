import { NextResponse } from 'next/server';
import { getSession, APP_URL } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  session.destroy();
  return NextResponse.redirect(`${APP_URL}/?logout=ok`);
}
