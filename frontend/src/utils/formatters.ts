// Shared formatting helpers for money, dates, and display values.
const DEFAULT_LOCALE = 'vi-VN'
const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh'

// FIX 1: Định nghĩa kiểu dữ liệu cho value (số hoặc chuỗi số), currency và locale
export function formatCurrency(
  value: string | number, 
  currency: string = 'VND', 
  locale: string = DEFAULT_LOCALE
): string {
  const amount = Number(value)

  if (Number.isNaN(amount)) {
    return ''
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

// FIX 2: Định nghĩa value có thể là Date, chuỗi hoặc số timestamp
export function formatDate(value: Date | string | number | null | undefined, locale: string = DEFAULT_LOCALE): string {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

// FIX 3: Tương tự formatDate, thêm định nghĩa kiểu cho value, locale và timeZone
export function formatDateTime(
  value: Date | string | number | null | undefined, 
  locale: string = DEFAULT_LOCALE, 
  timeZone: string = DEFAULT_TIME_ZONE
): string {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(date)
}

// FIX 4: Định nghĩa value là số hoặc chuỗi đại diện mức pin
export function formatBatteryLevel(value: string | number): string {
  const level = Number(value)

  if (Number.isNaN(level)) {
    return ''
  }

  return `${level}%`
}

export function formatCoordinates(
  lat: string | number | null | undefined, // Thêm null | undefined vào đây
  lng: string | number | null | undefined
): string {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return ''
  }

  const latitude = Number(lat)
  const longitude = Number(lng)

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return ''
  }

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}