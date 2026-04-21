import { BatteryCharging, Gauge, MapPin, Navigation, ShieldAlert } from 'lucide-react'
import { getAutoDecommissionReason } from '../services/alertService'
import Button from './Button'
import StatusBadge from './StatusBadge'

export default function ScooterCard({ scooter, selected, onSelect }) {
    const lockReason = getAutoDecommissionReason(scooter)

    return (
        <article className={`scooter-card ${selected ? 'scooter-card--selected' : ''}`.trim()}>
            <div className="scooter-card__top">
                <div>
                    <h3 className="scooter-card__name">{scooter.name}</h3>
                    <div className="scooter-card__meta">{scooter.locationLabel}</div>
                </div>
                <StatusBadge status={scooter.status} />
            </div>

            <div className="scooter-card__stats">
                <div className="stat-chip">
                    <BatteryCharging size={16} />
                    <span>{scooter.batteryLevel}% pin</span>
                </div>

                <div className="stat-chip">
                    <Gauge size={16} />
                    <span>{scooter.estimatedMinutesAway ?? 0} phút</span>
                </div>

                <div className="stat-chip">
                    <Navigation size={16} />
                    <span>{(scooter.distanceKm ?? 0).toFixed(2)} km</span>
                </div>
            </div>

            <div className="scooter-card__location">
                <MapPin size={16} />
                <span>
                    {Number(scooter.currentLat).toFixed(5)}, {Number(scooter.currentLng).toFixed(5)}
                </span>
            </div>

            {scooter.geoFence?.outOfZone ? (
                <div className="warning-note">
                    <MapPin size={18} />
                    <div>
                        <strong>Geofence active</strong>
                        <p style={{ margin: '2px 0 0' }}>Xe đang ở ngoài vùng quy định.</p>
                    </div>
                </div>
            ) : null}

            {lockReason ? (
                <div className="lock-banner">
                    <ShieldAlert size={18} />
                    <div>
                        <strong>Xe đang bị khóa an toàn</strong>
                        <p style={{ margin: '2px 0 0' }}>{lockReason}</p>
                    </div>
                </div>
            ) : null}

            <div className="scooter-card__bottom">
                <span className="scooter-card__meta">
                    {scooter.status === 'available' ? 'Sẵn sàng để đặt' : 'Không thể đặt ngay lúc này'}
                </span>
                <Button
                    variant={selected ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => onSelect(scooter)}
                >
                    {selected ? 'Đang chọn' : 'Chọn xe'}
                </Button>
            </div>
        </article>
    )
}