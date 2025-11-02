import { NextResponse } from 'next/server'

const NEXTCLOUD_BASE = process.env.NEXTCLOUD_BASE || 'http://localhost:8080/remote.php/dav/files/admin/'
const NEXTCLOUD_USER = process.env.NEXTCLOUD_USER || 'admin'
const NEXTCLOUD_APP_PASSWORD = process.env.NEXTCLOUD_APP_PASSWORD || ''

function buildAuthHeader() {
  const token = Buffer.from(`${NEXTCLOUD_USER}:${NEXTCLOUD_APP_PASSWORD}`).toString('base64')
  return `Basic ${token}`
}

export async function GET() {
  // Perform a PROPFIND to list top-level collections
  const propfindBody = `<?xml version="1.0" encoding="utf-8"?>\n<d:propfind xmlns:d="DAV:">\n  <d:prop>\n    <d:resourcetype/>\n  </d:prop>\n</d:propfind>`

  const res = await fetch(NEXTCLOUD_BASE, {
    method: 'PROPFIND',
    headers: {
      Authorization: buildAuthHeader(),
      'Content-Type': 'application/xml; charset=utf-8',
      Depth: '1',
    },
    body: propfindBody,
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    return NextResponse.json({ error: `PROPFIND failed: ${res.status} ${res.statusText} - ${txt}` }, { status: 502 })
  }

  const text = await res.text()

  // Very small XML parse to extract hrefs that are collections.
  const folderNames: string[] = []
  const responseRegex = /<d:response[\s\S]*?<\/d:response>/gi
  const hrefRegex = /<d:href>([\s\S]*?)<\/d:href>/i
  const collectionRegex = /<d:collection\s*\/?>/i

  const basePath = new URL(NEXTCLOUD_BASE).pathname

  const responses = text.match(responseRegex) || []
  for (const r of responses) {
    if (!collectionRegex.test(r)) continue
    const m = r.match(hrefRegex)
    if (!m) continue
    let href = decodeURIComponent(m[1] || '')
    // normalize
    if (href.startsWith(basePath)) href = href.slice(basePath.length)
    if (href.startsWith('/')) href = href.slice(1)
    if (href.endsWith('/')) href = href.slice(0, -1)
    if (!href) continue
    const name = href.split('/')[0]
    if (name && !folderNames.includes(name)) folderNames.push(name)
  }

  return NextResponse.json({ folders: folderNames })
}
