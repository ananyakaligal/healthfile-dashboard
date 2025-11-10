import crypto from 'crypto'
import { NextResponse } from 'next/server'

/**
 * Minimal encrypted cookie session helper (used instead of iron-session for App Router compatibility).
 * - SESSION_PASSWORD must be set in .env.local (32+ characters recommended)
 */

const COOKIE_NAME = 'healthfile-session'
const ALGO = 'aes-256-gcm'

function getSessionKey(): Buffer {
  const pwd = process.env.SESSION_PASSWORD
  if (!pwd) throw new Error('SESSION_PASSWORD is not set in environment')
  // Derive a 32-byte key from the password using scrypt
  return crypto.scryptSync(pwd, 'healthfile-salt', 32)
}

export function encryptSession(obj: any): string {
  const key = getSessionKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const plain = Buffer.from(JSON.stringify(obj), 'utf8')
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()])
  const tag = cipher.getAuthTag()
  // store as iv|tag|ciphertext base64
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decryptSession(token: string): any | null {
  try {
    const key = getSessionKey()
    const raw = Buffer.from(token, 'base64')
    const iv = raw.slice(0, 12)
    const tag = raw.slice(12, 28)
    const ciphertext = raw.slice(28)
    const decipher = crypto.createDecipheriv(ALGO, key, iv)
    decipher.setAuthTag(tag)
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return JSON.parse(plain.toString('utf8'))
  } catch (e) {
    return null
  }
}

export function setSessionCookie(resp: NextResponse, payload: any) {
  const token = encryptSession(payload)
  // cookie attributes: HttpOnly, Path=/, SameSite=Lax, secure in production
  const secure = process.env.NODE_ENV === 'production'
  const cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`
  resp.headers.append('Set-Cookie', cookie)
}

export function clearSessionCookie(resp: NextResponse) {
  resp.headers.append('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`)
}

export async function getSessionFromRequest(req: Request) {
  const cookieHeader = req.headers.get('cookie') || ''
  const match = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE_NAME + '='))
  if (!match) return null
  const token = decodeURIComponent(match.split('=')[1] || '')
  const data = decryptSession(token)
  return data
}
