import { scrypt, randomBytes, timingSafeEqual, createCipheriv, createDecipheriv } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

// 32 bytes = 64 hex chars for AES-256
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')

/**
 * Hash password using scrypt (stronger than bcrypt)
 * Format: salt:hash (both hex)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(32).toString('hex')
  const hash = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${hash.toString('hex')}`
}

/**
 * Verify password using timing-safe comparison (prevents timing attacks)
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false

  const hashBuffer = Buffer.from(hash, 'hex')
  const derivedHash = (await scryptAsync(password, salt, 64)) as Buffer
  return timingSafeEqual(hashBuffer, derivedHash)
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * Returns format: iv:authTag:ciphertext (all hex)
 */
export function encrypt(plaintext: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error('Invalid encryption key - must be 32 bytes (64 hex chars)')
  }

  const iv = randomBytes(12) // 96-bit IV for GCM
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Decrypt AES-256-GCM encrypted data
 */
export function decrypt(ciphertext: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error('Invalid encryption key')
  }

  const parts = ciphertext.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format')
  }

  const ivStr = parts[0]
  const authTagStr = parts[1]
  const encryptedStr = parts[2]

  if (!ivStr || !authTagStr || !encryptedStr) {
    throw new Error('Invalid ciphertext format parts')
  }

  const iv = Buffer.from(ivStr, 'hex')
  const authTag = Buffer.from(authTagStr, 'hex')
  const encrypted = Buffer.from(encryptedStr, 'hex')

  const decipher = createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}
