// Provider that owns auth state, persistence, and session actions.
import { useCallback, useMemo } from 'react'

import { ROLES } from '../constants/roles'
import { STORAGE_KEYS } from '../constants/storageKeys'
import { decodeJwtPayload } from '../utils/jwt'
import { login as loginRequest, register as registerRequest } from '../features/auth/api'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { AuthContext } from './authContext'

function readStoredUser() {
  const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER)

  if (storedUser) {
    try {
      return JSON.parse(storedUser)
    } catch {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
    }
  }

  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  if (!token) {
    return null
  }

  const payload = decodeJwtPayload(token)
  if (!payload) {
    return null
  }

  return {
    id: payload.userId ?? null,
    email: payload.sub ?? '',
    fullName: '',
    role: payload.role ?? ROLES.CUSTOMER,
  }
}

export function AuthProvider({ children }) {
  const [token, setToken, clearToken] = useLocalStorage(STORAGE_KEYS.AUTH_TOKEN, null)
  const [user, setUser, clearUser] = useLocalStorage(STORAGE_KEYS.AUTH_USER, readStoredUser())

  const isAuthenticated = Boolean(token)
  const isAdmin = user?.role === ROLES.ADMIN

  const login = useCallback(async (request) => {
    const response = await loginRequest(request)
    const nextUser = {
      id: response.userId,
      email: response.email,
      fullName: response.fullName,
      role: response.role,
    }

    setToken(response.token)
    setUser(nextUser)

    return response
  }, [setToken, setUser])

  const register = useCallback(async (request) => {
    const response = await registerRequest(request)
    return response
  }, [])

  const logout = useCallback(() => {
    clearToken()
    clearUser()
  }, [clearToken, clearUser])

  const updateUser = useCallback(
    (nextUser) => {
      setUser(nextUser)
    },
    [setUser],
  )

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
      updateUser,
    }),
    [isAdmin, isAuthenticated, login, logout, register, token, updateUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
