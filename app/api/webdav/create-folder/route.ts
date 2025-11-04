import { NextRequest, NextResponse } from 'next/server'

const NEXTCLOUD_URL = process.env.NEXTCLOUD_URL || 'http://localhost:8080/remote.php/dav/files/admin/'
const USERNAME = process.env.NEXTCLOUD_USER || 'admin'
const APP_PASSWORD = process.env.NEXTCLOUD_APP_PASSWORD || 'PdYXt-3di5x-Dazkb-iJJrt-DewBd'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { folderName, metadata } = body

    if (!folderName) {
      return NextResponse.json({ error: 'folderName is required' }, { status: 400 })
    }

    const url = `${NEXTCLOUD_URL}${encodeURIComponent(folderName)}/`
    const auth = Buffer.from(`${USERNAME}:${APP_PASSWORD}`).toString('base64')

    const response = await fetch(url, {
      method: 'MKCOL',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    // 405 means folder already exists, which is fine
    if (!response.ok && response.status !== 405) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Failed to create folder: ${response.status} ${errorText}` },
        { status: response.status }
      )
    }

    // Store metadata as JSON file if provided
    if (metadata) {
      const metadataUrl = `${url}patient-info.json`
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
