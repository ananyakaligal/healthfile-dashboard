import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session'

const NEXTCLOUD_BASE = process.env.NEXTCLOUD_BASE || 'http://localhost:8080/remote.php/dav/files/'

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { username, password } = session.user

  // Perform a PROPFIND to list the user's top-level collections
  const propfindBody = `<?xml version="1.0" encoding="utf-8"?>\n<d:propfind xmlns:d="DAV:">\n  <d:prop>\n    <d:resourcetype/>\n  </d:prop>\n</d:propfind>`

  const targetUrl = `${NEXTCLOUD_BASE}${encodeURIComponent(username)}/`

  const auth = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`

  try {
    const res = await fetch(targetUrl, {
      method: 'PROPFIND',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/xml; charset=utf-8',
        Depth: '1',
      },
      body: propfindBody,
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.error('PROPFIND failed', res.status, res.statusText, txt)
      return NextResponse.json({ error: `PROPFIND failed: ${res.status} ${res.statusText}`, detail: txt }, { status: res.status })
    }

    const text = await res.text()

    // Very small XML parse to extract hrefs that are collections.
    const folderNames: string[] = []
    const responseRegex = /<d:response[\s\S]*?<\/d:response>/gi
    const hrefRegex = /<d:href>([\s\S]*?)<\/d:href>/i
    const collectionRegex = /<d:collection\s*\/?/i

    const basePath = new URL(targetUrl).pathname

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
  } catch (error) {
    console.error('List error', error)
    return NextResponse.json({ message: 'List error', detail: String(error) }, { status: 500 })
  }
}
