// Minimal WebDAV client for NextCloud (browser-friendly, no external deps)
// Usage:
//  import { setAppPassword, getPatientFolders, uploadFileToPatientFolder } from '@/lib/webdav'
//  setAppPassword('your-app-password-here')
//  const folders = await getPatientFolders()
//  await uploadFileToPatientFolder('patientName', file)

const NEXTCLOUD_BASE = 'http://localhost:8080/remote.php/dav/files/admin/';
let appPassword: string | null = null;

export function setAppPassword(pw: string | null) {
  appPassword = pw;
}

function getAuthHeader(): string {
  if (!appPassword) throw new Error('App password not set. Call setAppPassword(appPassword) first.');
  const token = btoa(`admin:${appPassword}`);
  return `Basic ${token}`;
}

function ensureTrailingSlash(url: string) {
  return url.endsWith('/') ? url : url + '/';
}

/**
 * List folders (collections) in the root NextCloud files directory.
 * Returns an array of folder names (strings).
 */
export async function getPatientFolders(): Promise<string[]> {
  // If running in browser, call our server-side proxy
  if (typeof window !== 'undefined') {
    const res = await fetch('/api/webdav/list', {
      // ensure cookies are sent for authentication (same-origin)
      credentials: 'same-origin',
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Proxy /api/webdav/list failed: ${res.status} ${res.statusText} - ${txt}`)
    }
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    return data.folders || []
  }

  // Server-side (fallback) - use direct PROPFIND
  const url = ensureTrailingSlash(NEXTCLOUD_BASE)

  const propfindBody = `<?xml version="1.0" encoding="utf-8"?>\n<d:propfind xmlns:d="DAV:">\n  <d:prop>\n    <d:resourcetype/>\n  </d:prop>\n</d:propfind>`

  const res = await fetch(url, {
    method: 'PROPFIND',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/xml; charset=utf-8',
      Depth: '1',
    } as any,
    body: propfindBody,
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`PROPFIND failed: ${res.status} ${res.statusText} - ${txt}`)
  }

  const text = await res.text()

  // Parse XML response in Node using simple regex approach
  const folderNames: string[] = []
  const responseRegex = /<d:response[\s\S]*?<\/d:response>/gi
  const hrefRegex = /<d:href>([\s\S]*?)<\/d:href>/i
  const collectionRegex = /<d:collection\s*\/?>/i
  const basePath = new URL(url).pathname

  const responses = text.match(responseRegex) || []
  for (const r of responses) {
    if (!collectionRegex.test(r)) continue
    const m = r.match(hrefRegex)
    if (!m) continue
    let href = decodeURIComponent(m[1] || '')
    if (href.startsWith(basePath)) href = href.slice(basePath.length)
    if (href.startsWith('/')) href = href.slice(1)
    if (href.endsWith('/')) href = href.slice(0, -1)
    if (!href) continue
    const name = href.split('/')[0]
    if (name && !folderNames.includes(name)) folderNames.push(name)
  }

  return folderNames
}

/**
 * Upload a File object into a patient's folder. Creates the file at
 * http://localhost:8080/remote.php/dav/files/admin/{patientName}/{file.name}
 */
export async function uploadFileToPatientFolder(patientName: string, file: File): Promise<void> {
  if (!patientName) throw new Error('patientName is required');
  if (!file) throw new Error('file is required');

  // If running in browser, proxy the upload through our server API to avoid CORS
  if (typeof window !== 'undefined') {
    const arrayBuffer = await file.arrayBuffer()
    const encodedPatient = encodeURIComponent(patientName)
    const encodedName = encodeURIComponent(file.name)
    const res = await fetch(`/api/webdav/upload?patientName=${encodedPatient}&fileName=${encodedName}`, {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: arrayBuffer,
      credentials: 'same-origin',
    })

    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Proxy upload failed: ${res.status} ${res.statusText} - ${txt}`)
    }

    return
  }

  // Server-side direct PUT
  const folderPath = encodeURIComponent(patientName) + '/'
  const filePath = folderPath + encodeURIComponent((file as any).name)
  const url = ensureTrailingSlash(NEXTCLOUD_BASE) + filePath

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: getAuthHeader(),
      'If-None-Match': '*',
    } as any,
    body: (file as any),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`PUT failed: ${res.status} ${res.statusText} - ${txt}`)
  }
}

/**
 * Create a new patient folder in Nextcloud with metadata
 */
export async function createPatientFolder(patientName: string, metadata?: any): Promise<void> {
  if (!patientName) throw new Error('patientName is required');

  // If running in browser, call our server-side proxy
  if (typeof window !== 'undefined') {
    const res = await fetch('/api/webdav/create-folder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folderName: patientName, metadata }),
      credentials: 'same-origin',
    })

    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Failed to create folder: ${res.status} ${res.statusText} - ${txt}`)
    }

    return
  }

  // Server-side direct MKCOL
  const url = ensureTrailingSlash(NEXTCLOUD_BASE) + encodeURIComponent(patientName) + '/'

  const res = await fetch(url, {
    method: 'MKCOL',
    headers: {
      Authorization: getAuthHeader(),
    } as any,
  })

  if (!res.ok && res.status !== 405) { // 405 means folder already exists
    const txt = await res.text()
    throw new Error(`MKCOL failed: ${res.status} ${res.statusText} - ${txt}`)
  }

  // If metadata provided, store it as a JSON file
  if (metadata) {
    const metadataUrl = url + 'patient-info.json'
    const metadataRes = await fetch(metadataUrl, {
      method: 'PUT',
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      } as any,
      body: JSON.stringify(metadata, null, 2),
    })

    if (!metadataRes.ok) {
      console.warn('Failed to store metadata, but folder was created')
    }
  }
}

export function clearAppPassword() {
  appPassword = null;
}
