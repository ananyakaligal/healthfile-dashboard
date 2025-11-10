import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/session'

export async function POST() {
  const resp = NextResponse.json({ ok: true })
  clearSessionCookie(resp)
  return resp
}
