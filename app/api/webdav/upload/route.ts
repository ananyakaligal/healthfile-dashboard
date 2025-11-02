import { NextResponse } from 'next/server'

const NEXTCLOUD_BASE = process.env.NEXTCLOUD_BASE || 'http://localhost:8080/remote.php/dav/files/admin/'
const NEXTCLOUD_USER = process.env.NEXTCLOUD_USER || 'admin'
const NEXTCLOUD_APP_PASSWORD = process.env.NEXTCLOUD_APP_PASSWORD || ''

function buildAuthHeader() {
  const token = Buffer.from(`${NEXTCLOUD_USER}:${NEXTCLOUD_APP_PASSWORD}`).toString('base64')
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

  const targetPath = encodeURIComponent(patientName) + '/' + encodeURIComponent(fileName)
  const targetUrl = (NEXTCLOUD_BASE.endsWith('/') ? NEXTCLOUD_BASE : NEXTCLOUD_BASE + '/') + targetPath

  const res = await fetch(targetUrl, {
    method: 'PUT',
    headers: {
      Authorization: buildAuthHeader(),
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
