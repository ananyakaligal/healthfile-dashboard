import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session'

const DEFAULT_NEXTCLOUD_URL = process.env.NEXTCLOUD_URL || 'http://localhost:8080/remote.php/dav/files/'
const ENV_USER = process.env.NEXTCLOUD_USER
const ENV_APP_PASSWORD = process.env.NEXTCLOUD_APP_PASSWORD

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { folderName, metadata } = body

    if (!folderName) {
      return NextResponse.json({ error: 'folderName is required' }, { status: 400 })
    }

    // prefer session credentials, fall back to environment creds
    const session = await getSessionFromRequest(request)
    let username = ENV_USER
    let password = ENV_APP_PASSWORD
    if (session?.user) {
      username = session.user.username
      password = session.user.password
    }

    if (!username || !password) {
      return NextResponse.json({ error: 'No Nextcloud credentials available' }, { status: 401 })
    }

    const baseUrl = DEFAULT_NEXTCLOUD_URL.endsWith('/') ? DEFAULT_NEXTCLOUD_URL : DEFAULT_NEXTCLOUD_URL + '/'
    const url = `${baseUrl}${encodeURIComponent(username)}/${encodeURIComponent(folderName)}/`
    const auth = Buffer.from(`${username}:${password}`).toString('base64')

    const response = await fetch(url, {
      method: 'MKCOL',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    // 405 means folder already exists, which is fine
    if (!response.ok && response.status !== 405) {
      const errorText = await response.text().catch(() => '')
      return NextResponse.json(
        { error: `Failed to create folder: ${response.status} ${errorText}` },
        { status: response.status }
      )
    }

    // Store metadata as JSON file if provided
    if (metadata) {
      const metadataUrl = `${baseUrl}${encodeURIComponent(username)}/${encodeURIComponent(folderName)}/patient-info.json`
      const metadataRes = await fetch(metadataUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata, null, 2),
      })

      if (!metadataRes.ok) {
        console.warn('Failed to store metadata, but folder was created')
      }
    }

    return NextResponse.json({ success: true, message: 'Folder created' })
  } catch (error: any) {
    console.error('Create folder error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
