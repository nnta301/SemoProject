// Lightweight helpers for decoding JWT payload data on the client.

// FIX: Khai báo tường minh 'token' là string và kiểu trả về linh hoạt là any hoặc null
export function decodeJwtPayload(token: string): any | null {
  if (typeof token !== 'string' || !token.includes('.')) {
    return null
  }

  try {
    const payloadPart = token.split('.')[1]
    const normalizedPayload = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '=',
    )

    const decoded = atob(paddedPayload)
    return JSON.parse(decodeURIComponent(escape(decoded)))
  } catch {
    return null
  }
}