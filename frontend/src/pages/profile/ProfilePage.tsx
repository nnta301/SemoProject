// Trang Hồ sơ & Ví — Tech Blue Luxury (tiếng Việt).
// Liên kết với API:
//   - depositToWallet → POST /api/users/wallet/deposit (qua features/users)
//   - changePassword  → PUT  /api/users/{id}/change-password
// Số dư hiển thị bằng định dạng VNĐ (vi-VN) qua utils/formatters.formatCurrency.
import { useState } from 'react'
// FIX 1: Import type-only chống lỗi verbatimModuleSyntax
import type { SyntheticEvent, ChangeEvent } from 'react'
import {
  Wallet, ShieldCheck, User, Mail, BadgeCheck, Sparkles, Plus, KeyRound, Lock, Eye, EyeOff,
} from 'lucide-react'

import { SectionHeader,
  Alert, Button, Card, TextField
} from '@/components'
import { useAuth } from '@/hooks/useAuth'
import { changePassword, depositToWallet } from '@/features/users'
import { formatCurrency, getApiErrorMessage } from '@/utils'
import { ROLES } from '@/constants'

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

  // FIX 2: Khai báo SyntheticEvent cho tham số event
  async function handleDeposit(event: SyntheticEvent<HTMLFormElement>) {
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

  // FIX 2: Khai báo SyntheticEvent cho tham số event
  async function handlePasswordChange(event: SyntheticEvent<HTMLFormElement>) {
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
      className="bg-transparent border-0 text-text-muted cursor-pointer grid place-items-center p-0"
    >
      {visible ? <EyeOff size={18} strokeWidth={1.7} /> : <Eye size={18} strokeWidth={1.7} />}
    </button>
  )

  const roleLabel = user?.role === ROLES.ADMIN ? 'Administrator' : 'Customer'

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Account Profile"
        title="Your Account & Wallet"
        description="Manage your balance, history, and account security all in one place."/>
      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      {/* Wallet hero */}
      <section className="relative p-8 rounded-lg
        bg-[radial-gradient(circle_at_90%_0%,rgba(0,209,255,0.35),transparent_50%),linear-gradient(135deg,rgba(0,82,255,0.8)_0%,rgba(17,28,52,0.95)_100%)]
        border border-border-glow text-white overflow-hidden shadow-glow-cyan
        before:content-[''] before:absolute before:-top-1/2 before:right-[-20%]
        before:w-95 before:h-95 before:rounded-full
        before:bg-[radial-gradient(circle,rgba(0,209,255,0.3),transparent_70%)] before:blur-[20px] before:pointer-events-none"
      >
        <p className="relative m-0 text-[0.78rem] uppercase tracking-[0.2em] font-bold text-cyan-soft">
          Balance
        </p>
        <p className="relative mt-[0.45rem] mr-0 mb-[0.6rem] ml-0
          text-[clamp(2.2rem,4vw,3rem)] font-extrabold tracking-[-0.04em] leading-[1.05]"
        >
          {balanceDisplay}
        </p>
        <p className="relative m-0 text-[#e6eeff]/78 text-[0.92rem]">
          Currency: <strong className="text-white">VND</strong> &nbsp;•&nbsp;
          Account holder:{' '}
          <strong className="text-white">{user?.fullName || user?.email || '—'}</strong>
        </p>
        <span className="relative inline-flex items-center gap-[0.4rem] mt-4 padding
          px-[0.8rem] py-[0.35rem] rounded-full bg-black/28 border border-white/20
          text-[0.78rem] tracking-[0.08em] font-semibold"
        >
          <Sparkles size={14} strokeWidth={1.9} /> SEMO • {roleLabel.toUpperCase()}
        </span>
      </section>

      <div className="grid gap-[1.2rem] grid-cols-2 max-sm:grid-cols-1">
        {/* Deposit card */}
        <Card>
          <SectionHeader
            eyebrow="Wallet"
            title="Top Up Wallet"
            description="Minimum top-up amount is 10,000 VND. Balance updates immediately after successful transaction."
            actions={<Wallet size={20} strokeWidth={1.7} className="text-cyan-soft" />}
          />

          <form className="grid gap-5" onSubmit={handleDeposit}>
            <div className="flex gap-2 flex-wrap">
              {QUICK_AMOUNTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  className="p-[0.45rem_0.85rem] rounded-full border border-border-strong
                  bg-surface-muted text-text cursor-pointer text-[0.85rem] font-semibold
                    transition-all duration-180 ease-out hover:border-border-glow
                  hover:text-white hover:bg-brand-soft"
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
            actions={<ShieldCheck size={20} strokeWidth={1.7} className="text-cyan-soft" />}
          />

          <form className="grid gap-5" onSubmit={handlePasswordChange}>
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
        <div className="grid gap-3 mt-2 text-text [&_strong]:text-text-strong">
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