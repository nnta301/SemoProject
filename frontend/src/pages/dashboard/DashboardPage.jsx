// Dashboard landing page backed by live scooter data from the API.
import { useEffect, useMemo, useState, useContext } from 'react'

import { SectionHeader } from '../../components/layout'
import { Card, Table, TextField, Button, Modal, Alert } from '../../components/ui'
import ScooterMap from '../../components/map/ScooterMap'
import { getAllScooters } from '../../features/scooters'
import { SCOOTER_STATUSES } from '../../constants/statuses'
import { formatBatteryLevel, formatDateTime, formatCurrency } from '../../utils/formatters'
import { startRental, endRental, getActiveRental } from '../../features/rentals'
import { AuthContext } from '../../contexts/authContext'
import { getApiErrorMessage } from '../../utils/apiError'

const statusMeta = {
  [SCOOTER_STATUSES.AVAILABLE]: { label: 'Available', className: 'is-available' },
  [SCOOTER_STATUSES.IN_USE]: { label: 'In use', className: 'is-in-use' },
  [SCOOTER_STATUSES.MAINTENANCE]: { label: 'Maintenance', className: 'is-maintenance' },
}

function getStatusLabel(status) {
  return statusMeta[status]?.label || status || 'Unknown'
}

function getStatusClassName(status) {
  return statusMeta[status]?.className || 'is-unknown'
}

export default function DashboardPage() {
  const { user } = useContext(AuthContext)
  const [rentalScooterId, setRentalScooterId] = useState('')
  // rentalIdToEnd removed: backend assigns rental to user; we end activeRental only
  const [rentalLoading, setRentalLoading] = useState(false)
  const [rentalError, setRentalError] = useState(null)
  const [rentalSuccess, setRentalSuccess] = useState(null)
  const [rentalResult, setRentalResult] = useState(null)
  const [isRentalResultOpen, setIsRentalResultOpen] = useState(false)
  const [activeRental, setActiveRental] = useState(null)
  const [scooters, setScooters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // restore active rental on refresh for authenticated user
    let activeMounted = true
    async function restoreActive() {
      if (!user?.id) return
      try {
        const resp = await getActiveRental(Number(user.id))
        if (!activeMounted) return
        if (resp) setActiveRental(resp)
      } catch (err) {
        // ignore if no active rental or errors; keep UX simple
      }
    }

    restoreActive()

    let isActive = true

    async function loadScooters() {
      try {
        setLoading(true)
        setError(null)
        const data = await getAllScooters()

        if (!isActive) {
          return
        }

        setScooters(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!isActive) {
          return
        }

        setError(err?.response?.data?.message || err?.message || 'Unable to load scooters')
        setScooters([])
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadScooters()

    return () => {
      isActive = false
    }
  }, [])

  const summaryCards = useMemo(() => {
    const total = scooters.length
    const available = scooters.filter((scooter) => scooter.status === SCOOTER_STATUSES.AVAILABLE).length
    const inUse = scooters.filter((scooter) => scooter.status === SCOOTER_STATUSES.IN_USE).length
    const maintenance = scooters.filter((scooter) => scooter.status === SCOOTER_STATUSES.MAINTENANCE).length

    return [
      { label: 'Total scooters', value: total, note: 'Live from /api/scooters' },
      { label: 'Available', value: available, note: 'Ready to rent now' },
      { label: 'In use', value: inUse, note: 'Currently on trips' },
      { label: 'Maintenance', value: maintenance, note: 'Needs service attention' },
    ]
  }, [scooters])

  const scooterRows = useMemo(() => {
    return [...scooters]
      .sort((left, right) => {
        const leftTime = new Date(left.updatedAt || left.createdAt || 0).getTime()
        const rightTime = new Date(right.updatedAt || right.createdAt || 0).getTime()
        return rightTime - leftTime
      })
      .slice(0, 5)
  }, [scooters])

  const scooterColumns = [
    {
      key: 'id',
      label: 'ID',
      render: (row) => row.id,
    },
    {
      key: 'name',
      label: 'Scooter',
      render: (row) => row.name || `#${row.id}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <span className={`status-pill ${getStatusClassName(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
    {
      key: 'batteryLevel',
      label: 'Battery',
      render: (row) => formatBatteryLevel(row.batteryLevel),
    },
    {
      key: 'updatedAt',
      label: 'Last updated',
      render: (row) => formatDateTime(row.updatedAt || row.createdAt) || '-',
    },
  ]

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Overview"
        title="Dashboard"
        description="A live snapshot of the scooter fleet pulled directly from the API."
      />

      <div className="stats-grid">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <p className="stat-card__label">{card.label}</p>
            <div className="stat-card__value">{loading ? '—' : card.value}</div>
            <p className="stat-card__note">{card.note}</p>
          </Card>
        ))}
      </div>

      <Card>
        <SectionHeader
          eyebrow="Map view"
          title="Scooters around Bach Khoa"
          description="Live scooter positions rendered on a real OpenStreetMap layer using their current coordinates."
        />
        {error && <div className="ui-alert ui-alert--error dashboard__error">{error}</div>}
        <ScooterMap scooters={scooters} />
      </Card>

      <Card>
        <SectionHeader eyebrow="Rent" title="Start / End rental" description="Start a trip by scooter ID or end a trip using rental ID." />

        {rentalError && <Alert>{rentalError}</Alert>}
        {rentalSuccess && <Alert tone="success">{rentalSuccess}</Alert>}

        <div className="two-column-grid">
          <div>
            <h4>Start rental</h4>
            <p>Logged in as: {user?.email || '—'}</p>
            <TextField
              label="Scooter ID"
              value={rentalScooterId}
              onChange={(e) => setRentalScooterId(e.target.value)}
              type="number"
              placeholder="Enter scooter ID"
            />
            <Button
              onClick={async () => {
                setRentalLoading(true)
                setRentalError(null)
                setRentalSuccess(null)
                try {
                  const resp = await startRental({ userId: Number(user?.id), scooterId: Number(rentalScooterId) })
                  // Keep the rental as active so user can end it later.
                  setActiveRental(resp)
                  // clear input but do not auto-end or show success notification
                  setRentalScooterId('')
                } catch (err) {
                  setRentalError(getApiErrorMessage(err, 'Unable to start rental'))
                } finally {
                  setRentalLoading(false)
                }
              }}
              disabled={rentalLoading || !rentalScooterId}
            >
              {rentalLoading ? 'Starting…' : 'Start rental'}
            </Button>
          </div>

          <div>
            <h4>End rental</h4>
            <p>Rentals are assigned to your account automatically. Use the "End active rental" button below to finish and calculate price.</p>
          </div>
        </div>

        <Modal
          open={isRentalResultOpen}
          title="Rental result"
          onClose={() => setIsRentalResultOpen(false)}
          footer={<div className="modal-actions"><Button onClick={() => setIsRentalResultOpen(false)}>Close</Button></div>}
        >
          {rentalResult && (
            <div className="result-list">
              <div><strong>Rental ID:</strong> {rentalResult.id}</div>
              <div><strong>Status:</strong> {rentalResult.status}</div>
              <div><strong>Start:</strong> {formatDateTime(rentalResult.startTime) || '-'}</div>
              <div><strong>End:</strong> {formatDateTime(rentalResult.endTime) || '-'}</div>
              <div><strong>Total price:</strong> {formatCurrency(rentalResult.totalPrice)}</div>
            </div>
          )}
        </Modal>
        {activeRental && (
          <div className="card card--active-rental">
            <h4>Active rental</h4>
            <p>
              <strong>Rental ID:</strong> {activeRental.id} — <strong>Status:</strong> {activeRental.status}
            </p>
            <p>
              <strong>Scooter:</strong> {activeRental.scooterId || activeRental.scooter?.id || '-'}
            </p>
            <div className="card-actions">
              <Button
                tone="danger"
                onClick={async () => {
                  setRentalLoading(true)
                  setRentalError(null)
                  try {
                    const resp = await endRental(Number(activeRental.id))
                    setRentalResult(resp)
                    setRentalSuccess('Rental ended successfully')
                    setIsRentalResultOpen(true)
                    setActiveRental(null)
                  } catch (err) {
                    setRentalError(getApiErrorMessage(err, 'Unable to end active rental'))
                  } finally {
                    setRentalLoading(false)
                  }
                }}
                disabled={rentalLoading}
              >
                {rentalLoading ? 'Ending…' : 'End active rental'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <SectionHeader
          eyebrow="Fleet inventory"
          title="Recent scooters"
          description="The latest scooters returned by the backend, sorted by their last update time."
        />
        {error && <div className="ui-alert ui-alert--error dashboard__error">{error}</div>}
        <Table
          columns={scooterColumns}
          rows={scooterRows}
          rowKey={(row) => row.id}
          emptyMessage={loading ? 'Loading scooters…' : 'No scooters found yet.'}
        />
      </Card>
    </div>
  )
}