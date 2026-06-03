// Trang Đăng nhập — Tech Blue Luxury (tiếng Việt).
// Sử dụng `useAuth().login()` → gọi POST /api/auth/login qua features/auth.
import { useState } from 'react'
// FIX 1: Thêm type-only import cho SyntheticEvent chống lỗi verbatimModuleSyntax
import type { SyntheticEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, LogIn } from 'lucide-react'

import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { Alert, Button, Card, TextField } from '../../components/ui'
import { AuthShell } from '../../components/layout'
import { getApiErrorMessage } from '../../utils/apiError'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  // FIX 2: Định nghĩa rõ state error có thể là string hoặc null
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // FIX 3: Thêm kiểu dữ liệu SyntheticEvent cho tham số e
  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
      navigate(ROUTES.HOME, { replace: true })
    } catch (err) {
setError(getApiErrorMessage(err, 'Login failed. Please check your email and password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Semo • Tech Mobility"
      title="Welcome back."
      description="Log in to manage your electric scooter, trips, and wallet on a smart, safe, and luxurious interface."
    >
      <Card variant="glow">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__header">
            <h2 className="auth-form__title">Log in</h2>
            <p className="auth-form__subtitle">
              Use your registered email and password to continue.
            </p>
          </div>

          {error && <Alert>{error}</Alert>}

          <TextField
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            leadingIcon={<Mail size={18} strokeWidth={1.7} />}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            leadingIcon={<Lock size={18} strokeWidth={1.7} />}
            trailingAction={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  background: 'transparent',
                  border: 0,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.7} /> : <Eye size={18} strokeWidth={1.7} />}
              </button>
            }
          />

          <div className="auth-form__actions">
            <Button
              type="submit"
              disabled={loading}
              leadingIcon={<LogIn size={18} strokeWidth={1.8} />}
              trailingIcon={!loading ? <ArrowRight size={18} strokeWidth={1.8} /> : null}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
            <p className="auth-form__hint">
              Don't have an account?{' '}
              <Link className="auth-form__link" to={ROUTES.REGISTER}>
                Create a new account
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </AuthShell>
  )
}