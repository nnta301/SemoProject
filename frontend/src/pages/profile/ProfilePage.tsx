// Trang Hồ sơ & Ví — Tech Blue Luxury (tiếng Việt).
// Liên kết với API:
//   - depositToWallet → POST /api/users/wallet/deposit (qua features/users)
//   - changePassword  → PUT  /api/users/{id}/change-password
// Số dư hiển thị bằng định dạng VNĐ (vi-VN) qua utils/formatters.formatCurrency.
import { useState } from 'react'
// FIX 1: Import type-only chống lỗi verbatimModuleSyntax
import type { FormEvent, ChangeEvent } from 'react'
import {
  Wallet, ShieldCheck, User, Mail, BadgeCheck, Sparkles, Plus, KeyRound, Lock, Eye, EyeOff,
} from 'lucide-react'

import { SectionHeader } from '../../components/layout'
import { Alert, Button, Card, TextField } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'
import { changePassword, depositToWallet } from '../../features/users'
import { formatCurrency } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/apiError'
import { ROLES } from '../../constants/roles'

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000]

export default function ProfilePage() {
  const { user, setBalance } = useAuth()

  const [depositAmount, setDepositAmount] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const [loadingDeposit, setLoadingDeposit] = useState(false)
  const [loadingPwd, setLoadingPwd] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const balance = typeof user?.balance === 'number' ? user.balance : null
  const balanceDisplay = balance === null ? 'No data available' : formatCurrency(balance)

  // FIX 2: Khai báo FormEvent cho tham số event
  async function handleDeposit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoadingDeposit(true)
    setError('')
    setSuccess('')

    try {
      const amount = Number(depositAmount)
      if (!Number.isFinite(amount) || amount < 10000) {
        setError('The minimum top-up amount is 10,000 VND.')
        return
      }

      const response = await depositToWallet({ amount })
      const newBalance = response?.newBalance

      if (typeof newBalance === 'number') {
        setBalance(newBalance)
      }

      const niceAmount = formatCurrency(amount)
      setSuccess(
        response?.message
          ? `${response.message} (+${niceAmount})`
          : `Successfully topped up ${niceAmount}.`,
      )
      setDepositAmount('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to deposit money into wallet.'))
    } finally {
      setLoadingDeposit(false)
    }
  }

  // FIX 2: Khai báo FormEvent cho tham số event
  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoadingPwd(true)
    setError('')
    setSuccess('')

    try {
      if (!user?.id) {
        setError('Current user account could not be determined.')
        return
      }
      if (newPassword.length < 8) {
        setError('New password must be at least 8 characters long.')
        return
      }
      await changePassword(user.id, { currentPassword, newPassword })
      setSuccess('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to change password.'))
    } finally {
      setLoadingPwd(false)
    }
  }

  // FIX 3: Khai báo kiểu number cho tham số value
  function pickQuickAmount(value: number) {
    setDepositAmount(String(value))
  }

  // FIX 4: Định nghĩa cấu trúc kiểu dữ liệu cụ thể cho hàm render nút eyeBtn
  const eyeBtn = (
    visible: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    label: string
  ) => (
    <button
      type="button"
      aria-label={label}
      onClick={() => setter((v) => !v)}
      style={{
        background: 'transparent', border: 0, color: 'var(--text-muted)',
        cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0,
      }}
    >
      {visible ? <EyeOff size={18} strokeWidth={1.7} /> : <Eye size={18} strokeWidth={1.7} />}
    </button>
  )

  const roleLabel = user?.role === ROLES.ADMIN ? 'Administrator' : 'Customer'

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Account Profile"
        title="Your Account & Wallet"
        description="Manage your balance, history, and account security all in one place."/>
      {error && <Alert>{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      {/* Wallet hero */}
      <section className="wallet-card">
        <p className="wallet-card__label">Balance</p>
        <p className="wallet-card__balance">{balanceDisplay}</p>
        <p className="wallet-card__meta">
          Currency: <strong style={{ color: '#fff' }}>VND</strong> &nbsp;•&nbsp;
          Account holder:{' '}
          <strong style={{ color: '#fff' }}>{user?.fullName || user?.email || '—'}</strong>
        </p>
        <span className="wallet-card__chip">
          <Sparkles size={14} strokeWidth={1.9} /> SEMO • {roleLabel.toUpperCase()}
        </span>
      </section>

      <div className="two-column-grid">
        {/* Deposit card */}
        <Card>
          <SectionHeader
            eyebrow="Wallet"
            title="Top Up Wallet"
            description="Minimum top-up amount is 10,000 VND. Balance updates immediately after successful transaction."
            actions={<Wallet size={20} strokeWidth={1.7} style={{ color: 'var(--color-cyan-soft)' }} />}
          />

          <form className="form-grid" onSubmit={handleDeposit}>
            <div className="quick-amounts">
              {QUICK_AMOUNTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  className="quick-amount"
                  onClick={() => pickQuickAmount(v)}
                >
                  + {formatCurrency(v)}
                </button>
              ))}
            </div>

            <TextField
              label="Deposit Amount (VND)"
              type="number"
              min="10000"
              step="1000"
              name="depositAmount"
              value={depositAmount}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setDepositAmount(event.target.value)}
              placeholder="e.g., 100000"
              required
              leadingIcon={<Wallet size={18} strokeWidth={1.7} />}
              helpText={
                depositAmount && Number(depositAmount) >= 10000
                  ? `Will deposit ${formatCurrency(Number(depositAmount))} into your wallet.`
                  : 'Minimum 10,000 VND.'
              }
            />

            <Button
              type="submit"
              disabled={loadingDeposit}
              leadingIcon={<Plus size={18} strokeWidth={1.8} />}
            >
              {loadingDeposit ? 'Loading...' : 'Top Up Now'}
            </Button>
          </form>
        </Card>

        {/* Password card */}
        <Card>
          <SectionHeader
            eyebrow="Security"
            title="Change Password"
            description="Change your password regularly to protect your account."
            actions={<ShieldCheck size={20} strokeWidth={1.7} style={{ color: 'var(--color-cyan-soft)' }} />}
          />

          <form className="form-grid" onSubmit={handlePasswordChange}>
            <TextField
              label="Current Password"
              type={showCurrent ? 'text' : 'password'}
              name="currentPassword"
              value={currentPassword}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setCurrentPassword(event.target.value)}
              required
              leadingIcon={<Lock size={18} strokeWidth={1.7} />}
              trailingAction={eyeBtn(showCurrent, setShowCurrent, 'Show/Hide Current Password')}
            />
            <TextField
              label="New Password"
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              value={newPassword}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setNewPassword(event.target.value)}
              required
              leadingIcon={<KeyRound size={18} strokeWidth={1.7} />}
              trailingAction={eyeBtn(showNew, setShowNew, 'Show/Hide New Password')}
              helpText="Minimum 8 characters, use uppercase, lowercase and numbers."
            />
            <Button
              type="submit"
              disabled={loadingPwd}
              variant="secondary"
              leadingIcon={<ShieldCheck size={18} strokeWidth={1.8} />}
            >
              {loadingPwd ? 'Loading...' : 'Update Password'}
            </Button>
          </form>
        </Card>
      </div>

      {/* Account details */}
      <Card>
        <SectionHeader eyebrow="Information" title="Logged-in Account" />
        <div className="profile-details" style={{ marginTop: '0.6rem' }}>
          <div style={detailsRow}>
            <User size={18} strokeWidth={1.7} style={iconStyle} />
            <span><strong>Name:</strong> {user?.fullName || '—'}</span>
          </div>
          <div style={detailsRow}>
            <Mail size={18} strokeWidth={1.7} style={iconStyle} />
            <span><strong>Email:</strong> {user?.email || '—'}</span>
          </div>
          <div style={detailsRow}>
            <BadgeCheck size={18} strokeWidth={1.7} style={iconStyle} />
            <span><strong>Role:</strong> {roleLabel}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

const iconStyle = { color: 'var(--color-cyan-soft)', flexShrink: 0 }
const detailsRow = { display: 'flex', alignItems: 'center', gap: '0.6rem' }