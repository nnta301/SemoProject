// Session-scoped auth storage helpers with localStorage migration support.
import { STORAGE_KEYS } from '../constants/storageKeys'
// FIX 1: Import type-only đối tượng User của dự án phục vụ hàm ép kiểu cho Session
import type { User } from '../types/models'

function hasWindowStorage(): boolean {
  return typeof window !== 'undefined'
}

// FIX 2: Khai báo 'key' dạng string
function readRawValue(key: string): string | null {
  if (!hasWindowStorage()) {
    return null
  }

  const sessionValue = window.sessionStorage.getItem(key)
  if (sessionValue !== null) {
    return sessionValue
  }

  const legacyValue = window.localStorage.getItem(key)
  if (legacyValue !== null) {
    window.sessionStorage.setItem(key, legacyValue)
    window.localStorage.removeItem(key)
    return legacyValue
  }

  return null
}

// FIX 3: Khai báo 'key' và 'value' dạng string
function writeRawValue(key: string, value: string): void {
  if (!hasWindowStorage()) {
    return
  }

  window.sessionStorage.setItem(key, value)
  window.localStorage.removeItem(key)
}

// FIX 4: Khai báo 'key' dạng string
function removeRawValue(key: string): void {
  if (!hasWindowStorage()) {
    return
  }

  window.sessionStorage.removeItem(key)
  window.localStorage.removeItem(key)
}

// FIX 5: Khai báo 'rawValue' dạng string | null và kiểu trả về là any (do cấu trúc JSON.parse linh hoạt)
function parseStoredValue(rawValue: string | null): any {
  if (rawValue === null) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    return rawValue
  }
}

export function getAuthToken(): string | null {
  const storedToken = parseStoredValue(readRawValue(STORAGE_KEYS.AUTH_TOKEN))
  return typeof storedToken === 'string' && storedToken.trim() ? storedToken : null
}

// FIX 6: Khai báo tham số 'token' dạng string
export function setAuthToken(token: string): void {
  if (typeof token !== 'string' || !token.trim()) {
    removeAuthToken()
    return
  }

  writeRawValue(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(token))
}

export function removeAuthToken(): void {
  removeRawValue(STORAGE_KEYS.AUTH_TOKEN)
}

// FIX 7: Trả về kiểu User | null thay vì để tự suy luận lỏng lẻo
export function getAuthUser(): User | null {
  const storedUser = parseStoredValue(readRawValue(STORAGE_KEYS.AUTH_USER))
  return storedUser && typeof storedUser === 'object' ? (storedUser as User) : null
}

// FIX 8: Khai báo tham số 'user' nhận kiểu User chính xác của hệ thống
export function setAuthUser(user: User | null): void {
  if (!user || typeof user !== 'object') {
    removeAuthUser()
    return
  }

  writeRawValue(STORAGE_KEYS.AUTH_USER, JSON.stringify(user))
}

export function removeAuthUser(): void {
  removeRawValue(STORAGE_KEYS.AUTH_USER)
}

export function clearAuthSession(): void {
  removeAuthToken()
  removeAuthUser()
}