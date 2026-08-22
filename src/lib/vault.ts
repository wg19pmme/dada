/**
 * ============================================================
 * 密码加密保险库（Vault）
 * ============================================================
 * 说明：
 *  - 用于把生图 API 上游配置（含 apiKey 等敏感字段）用用户的访问密码加密后落盘。
 *  - 算法：PBKDF2（SHA-256，迭代 120_000）派生 256 位密钥 + AES-GCM 加密。
 *  - 用途：部署到公开静态托管（如 Cloudflare Pages）时，key 不再写进源码/明文 localStorage，
 *    而是仅以密文形式保存；没有密码无法解密出 apiKey。
 *
 * 注意：纯前端直连上游时，Key 最终会在浏览器内存中出现（物理限制），
 *      本方案保证的是「磁盘上不落明文、没密码打不开」。
 * ============================================================
 */

const PBKDF2_ITERATIONS = 120_000
const SALT_BYTES = 16
const IV_BYTES = 12

export interface VaultPayload {
  /** 密文内容（加密后的 JSON） */
  data: string
  /** PBKDF2 盐（base64） */
  salt: string
  /** AES-GCM 初始向量（base64） */
  iv: string
}

/** localStorage 中保存密文的键 */
export const VAULT_STORAGE_KEY = 'gpt-image-playground.vault'
/** localStorage 中标记“是否已设置密码”的键（不保存密码本身） */
export const VAULT_LOCKED_KEY = 'gpt-image-playground.vault-locked'

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/** 把 Uint8Array 转成标准 ArrayBuffer，规避 TS 对 BufferSource 的 SharedArrayBuffer 约束 */
function toBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const passwordBytes = new TextEncoder().encode(password)
  const baseKey = await crypto.subtle.importKey('raw', toBuffer(passwordBytes), 'PBKDF2', false, [
    'deriveKey',
  ])
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/** 用密码加密任意 JSON 序列化数据，返回可持久化的密文对象 */
export async function encryptVault<T>(data: T, password: string): Promise<VaultPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveKey(password, salt)
  const plaintext = new TextEncoder().encode(JSON.stringify(data))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toBuffer(iv) },
    key,
    toBuffer(plaintext),
  )
  return {
    data: toBase64(new Uint8Array(ciphertext)),
    salt: toBase64(salt),
    iv: toBase64(iv),
  }
}

/** 用密码解密密文对象；密码错误会抛异常 */
export async function decryptVault<T>(payload: VaultPayload, password: string): Promise<T> {
  const salt = fromBase64(payload.salt)
  const iv = fromBase64(payload.iv)
  const key = await deriveKey(password, salt)
  const ciphertext = fromBase64(payload.data)
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toBuffer(iv) },
    key,
    toBuffer(ciphertext),
  )
  return JSON.parse(new TextDecoder().decode(plaintext)) as T
}

/** 读取本地密文；不存在返回 null */
export function readVaultPayload(): VaultPayload | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(VAULT_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as VaultPayload
  } catch {
    return null
  }
}

/** 写入本地密文 */
export function writeVaultPayload(payload: VaultPayload): void {
  window.localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(payload))
}

/** 清除本地密文 */
export function clearVaultPayload(): void {
  window.localStorage.removeItem(VAULT_STORAGE_KEY)
  window.localStorage.removeItem(VAULT_LOCKED_KEY)
}

/** 判断本地是否已设置密码（存在密文即视为已设置） */
export function isVaultConfigured(): boolean {
  return readVaultPayload() != null
}
