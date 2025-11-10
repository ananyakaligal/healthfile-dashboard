import { NextResponse } from 'next/server'
import { setSessionCookie } from '@/lib/session'

const NEXTCLOUD_BASE = process.env.NEXTCLOUD_BASE || 'http://localhost:8080/remote.php/dav/files/'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { username, password } = body as { username?: string; password?: string }

  if (!username || !password) {
    return NextResponse.json({ message: 'Username and password required' }, { status: 400 })
  }

  const url = `${NEXTCLOUD_BASE}${encodeURIComponent(username)}/`

  const propfindBody = `<?xml version="1.0" encoding="utf-8"?>\n<d:propfind xmlns:d="DAV:">\n  <d:prop>\n    <d:resourcetype/>\n  </d:prop>\n</d:propfind>`

  const auth = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`

  try {
    const res = await fetch(url, {
      method: 'PROPFIND',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/xml; charset=utf-8',
        Depth: '1',
      },
      body: propfindBody,
    })

    if (!res.ok) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

  // credentials valid — set encrypted session cookie (stored under `user`)
  const resp = NextResponse.json({ ok: true })
  setSessionCookie(resp, { user: { username, password } })
    return resp
  } catch (error) {
    console.error('Login error', error)
    return NextResponse.json({ message: 'Login failed' }, { status: 500 })
  }
}
