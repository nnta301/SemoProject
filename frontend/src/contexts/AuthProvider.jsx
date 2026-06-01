// Provider giữ trạng thái xác thực, lưu trữ session và các action liên quan.
// Đã giữ nguyên cấu trúc cũ; bổ sung tiện ích `setBalance(newBalance)` cho ví người dùng.
import { useCallback, useMemo, useState } from 'react'

import { ROLES } from '../constants/roles'
import { decodeJwtPayload } from '../utils/jwt'
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  setAuthToken,
  setAuthUser,
} from '../utils/authSession'
import { login as loginRequest, register as registerRequest } from '../features/auth/api'
import { AuthContext } from './authContext'

function readStoredUser() {
  const storedUser = getAuthUser()
  if (storedUser) return storedUser

  const token = getAuthToken()
  if (!token) return null

  const payload = decodeJwtPayload(token)
  if (!payload) return null

  return {
    id: payload.userId ?? null,
    email: payload.sub ?? '',
    fullName: '',
    role: payload.role ?? ROLES.CUSTOMER,
    balance: null,
  }
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getAuthToken())
  const [user, setUserState] = useState(() => readStoredUser())

  const isAuthenticated = Boolean(token)
  const isAdmin = user?.role === ROLES.ADMIN

  const login = useCallback(async (request) => {
    const response = await loginRequest(request)
    const nextUser = {
      id: response.userId,
      email: response.email,
      fullName: response.fullName,
      role: response.role,
      balance: response.balance ?? null, // sẽ là null nếu backend chưa trả balance trong LoginResponseDTO
    }

    setTokenState(response.token)
    setUserState(nextUser)
    setAuthToken(response.token)
    setAuthUser(nextUser)

    return response
  }, [])

  const register = useCallback(async (request) => registerRequest(request), [])

  const logout = useCallback(() => {
    setTokenState(null)
    setUserState(null)
    clearAuthSession()
  }, [])

  const updateUser = useCallback((nextUser) => {
    setUserState(nextUser)
    setAuthUser(nextUser)
  }, [])

  // Cập nhật riêng số dư ví — dùng cho ProfilePage sau khi gọi deposit thành công.
  const setBalance = useCallback((newBalance) => {
    setUserState((current) => {
      const next = { ...(current || {}), balance: Number(newBalance) }
      setAuthUser(next)
      return next
    })
  }, [])

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
      setBalance,
    }),
    [isAdmin, isAuthenticated, login, logout, register, setBalance, token, updateUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
