import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session'

const DEFAULT_NEXTCLOUD_BASE = process.env.NEXTCLOUD_BASE || 'http://localhost:8080/remote.php/dav/files/'
const ENV_USER = process.env.NEXTCLOUD_USER
const ENV_APP_PASSWORD = process.env.NEXTCLOUD_APP_PASSWORD || ''

function buildAuthHeader(username: string, password: string) {
  const token = Buffer.from(`${username}:${password}`).toString('base64')
  return `Basic ${token}`
}

export async function POST(req: Request) {
  // Expect query params: patientName and fileName
  const url = new URL(req.url)
  const patientName = url.searchParams.get('patientName')
  const fileName = url.searchParams.get('fileName')

  if (!patientName || !fileName) {
    return NextResponse.json({ error: 'patientName and fileName query parameters are required' }, { status: 400 })
  }

  // Read raw body (file bytes)
  const buffer = await req.arrayBuffer()

  // determine credentials: prefer session
  const session = await getSessionFromRequest(req)
  let username = ENV_USER
  let password = ENV_APP_PASSWORD
  if (session?.user) {
    username = session.user.username
    password = session.user.password
  }

  if (!username || !password) {
    return NextResponse.json({ error: 'No Nextcloud credentials available' }, { status: 401 })
  }

  const targetPath = encodeURIComponent(patientName) + '/' + encodeURIComponent(fileName)
  const base = DEFAULT_NEXTCLOUD_BASE.endsWith('/') ? DEFAULT_NEXTCLOUD_BASE : DEFAULT_NEXTCLOUD_BASE + '/'
  const targetUrl = base + encodeURIComponent(username) + '/' + targetPath

  const res = await fetch(targetUrl, {
    method: 'PUT',
    headers: {
      Authorization: buildAuthHeader(username, password),
      'If-None-Match': '*',
    },
    body: Buffer.from(buffer),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    return NextResponse.json({ error: `PUT failed: ${res.status} ${res.statusText} - ${txt}` }, { status: 502 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
