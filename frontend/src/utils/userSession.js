// Lightweight client-side persistence for user-only data that backend
// does not currently expose via GET endpoints (wallet balance snapshot,
// active rental, recent rentals history, uploaded avatar URL).
//
// Backend GET /api/users/{id} không trả balance, và không có endpoint
// GET /api/rentals/active. Trong khi chờ backend bổ sung, ta cache
// dữ liệu user-side để UI không bị "câm" sau khi reload.

const KEYS = {
  BALANCE: 'semo_user_balance',
  ACTIVE_RENTAL: 'semo_active_rental',
  RENTAL_HISTORY: 'semo_rental_history',
  AVATAR: 'semo_user_avatar',
}

function safeRead(key) {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function safeWrite(key, value) {
  if (typeof window === 'undefined') return
  if (value === null || value === undefined) {
    window.localStorage.removeItem(key)
    return
  }
  window.localStorage.setItem(key, JSON.stringify(value))
}

/* -------- Wallet balance snapshot -------- */

export function getBalanceSnapshot() {
  const value = safeRead(KEYS.BALANCE)
  return typeof value === 'number' ? value : null
}

export function setBalanceSnapshot(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return
  safeWrite(KEYS.BALANCE, value)
}

export function clearBalanceSnapshot() {
  safeWrite(KEYS.BALANCE, null)
}

/* -------- Active rental -------- */
// Shape: { id, scooterId, scooterName, startTime, status }

export function getActiveRental() {
  const value = safeRead(KEYS.ACTIVE_RENTAL)
  if (!value || typeof value !== 'object') return null
  return value
}

export function setActiveRental(rental) {
  safeWrite(KEYS.ACTIVE_RENTAL, rental)
}

export function clearActiveRental() {
  safeWrite(KEYS.ACTIVE_RENTAL, null)
}

/* -------- Rental history (last 20) -------- */

export function getRentalHistory() {
  const value = safeRead(KEYS.RENTAL_HISTORY)
  return Array.isArray(value) ? value : []
}

export function appendRentalHistory(entry) {
  if (!entry) return
  const next = [entry, ...getRentalHistory()].slice(0, 20)
  safeWrite(KEYS.RENTAL_HISTORY, next)
}

export function clearRentalHistory() {
  safeWrite(KEYS.RENTAL_HISTORY, null)
}

/* -------- Avatar URL -------- */

export function getAvatarUrl() {
  return safeRead(KEYS.AVATAR)
}

export function setAvatarUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return
  safeWrite(KEYS.AVATAR, url.trim())
}

export function clearAvatarUrl() {
  safeWrite(KEYS.AVATAR, null)
}