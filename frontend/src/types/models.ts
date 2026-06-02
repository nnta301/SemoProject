// src/types/models.ts

// --- Core Models từ Backend ---
export interface User {
  id: number | null
  email: string
  fullName: string
  role: 'ADMIN' | 'CUSTOMER'
  balance: number | null
  phoneNumber?: string
}

export interface Scooter {
  id: number | string
  name: string
  codeName?: string
  batteryLevel: number
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | string
  currentLat: number | string | null
  currentLng: number | string | null
  temperature?: number | string
  createdAt?: string
  updatedAt?: string
}

export interface Rental {
  id: number | string
  userId: number | string
  scooterId: number | string
  startTime: string
  endTime?: string | null
  status: 'ACTIVE' | 'COMPLETED' | string
  totalPrice?: number
}

// --- Các kiểu dữ liệu dùng chung cho Map / Analytics ---
export interface LatLngPos {
  lat: number
  lng: number
}

export interface Station {
  lat: number | string
  lng: number | string
  name?: string
}