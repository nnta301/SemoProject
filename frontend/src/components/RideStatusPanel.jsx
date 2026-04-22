import {
  AlertTriangle,
  Bike,
  Clock3,
  LocateFixed,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import { rideStages } from "../mock/mockData";
import {
  getAutoDecommissionReason,
  getGeofenceWarning,
} from "../services/alertService";
import { RIDE_STAGES } from "../services/bookingService";
import Button from "./Button";
import EmptyState from "./EmptyState";
import StatusBadge from "./StatusBadge";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("vi-VN");
}

export default function RideStatusPanel({
  ride,
  scooter,
  loading,
  userLocation,
  onReserve,
  onUnlock,
  onStartRide,
  onEndRide,
}) {
  if (!scooter) {
    return (
      <section className="panel">
        <div className="panel__header">
          <div>
            <h2 className="panel__title">Ride status</h2>
            <p className="panel__subtitle">
              Theo dõi luồng đặt xe, mở khóa và chuyến đi.
            </p>
          </div>
        </div>
        <div className="panel__body">
          <EmptyState
            icon={Bike}
            title="Chưa có xe nào được chọn"
            description="Chọn một xe ở danh sách hoặc trên bản đồ để xem trạng thái và thao tác."
          />
        </div>
      </section>
    );
  }

  const currentStage = rideStages.find((item) => item.key === ride.stage);
  const geofenceWarning = getGeofenceWarning(scooter);
  const lockReason = getAutoDecommissionReason(scooter);

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2 className="panel__title">Ride status</h2>
          <p className="panel__subtitle">
            Theo dõi luồng đặt xe, mở khóa và chuyến đi.
          </p>
        </div>
        <StatusBadge status={scooter.status} />
      </div>

      <div className="panel__body ride-panel">
        <div className="ride-panel__hero">
          <div>
            <h3>{scooter.name}</h3>
            <p>
              {currentStage?.description || "Trạng thái chuyến đi hiện tại."}
            </p>
          </div>
          <div className="page-chip">{currentStage?.label || ride.stage}</div>
        </div>

        <div className="ride-panel__meta">
          <div className="ride-meta-row">
            <MapPin size={16} />
            <span>{scooter.locationLabel}</span>
          </div>
          <div className="ride-meta-row">
            <LocateFixed size={16} />
            <span>
              {userLocation
                ? `Bạn đang ở: ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`
                : "Chưa lấy được định vị"}
            </span>
          </div>
          <div className="ride-meta-row">
            <Clock3 size={16} />
            <span>Cách bạn {(scooter.distanceKm ?? 0).toFixed(2)} km</span>
          </div>
        </div>

        {geofenceWarning ? (
          <div className="warning-note">
            <AlertTriangle size={18} />
            <div>
              <strong>Cảnh báo geofence</strong>
              <p style={{ margin: "2px 0 0" }}>{geofenceWarning}</p>
            </div>
          </div>
        ) : null}

        {lockReason ? (
          <div className="lock-banner">
            <ShieldAlert size={18} />
            <div>
              <strong>Xe bị khóa an toàn</strong>
              <p style={{ margin: "2px 0 0" }}>{lockReason}</p>
            </div>
          </div>
        ) : null}

        <div className="ride-timeline">
          <div>
            <strong>Đặt xe:</strong> {formatDate(ride.reservedAt)}
          </div>
          <div>
            <strong>Mở khóa:</strong> {formatDate(ride.unlockedAt)}
          </div>
          <div>
            <strong>Bắt đầu:</strong> {formatDate(ride.startedAt)}
          </div>
          <div>
            <strong>Kết thúc:</strong> {formatDate(ride.endedAt)}
          </div>
        </div>

        <div className="ride-actions">
          <Button
            onClick={onReserve}
            loading={loading}
            disabled={
              scooter.status !== "available" ||
              ride.stage !== RIDE_STAGES.IDLE ||
              Boolean(lockReason)
            }
          >
            Đặt xe
          </Button>

          <Button
            variant="secondary"
            onClick={onUnlock}
            loading={loading}
            disabled={
              ride.stage !== RIDE_STAGES.RESERVED || Boolean(lockReason)
            }
          >
            Mở khóa
          </Button>

          <Button
            variant="secondary"
            onClick={onStartRide}
            loading={loading}
            disabled={
              ride.stage !== RIDE_STAGES.UNLOCKED || Boolean(lockReason)
            }
          >
            Bắt đầu đi
          </Button>

          <Button
            variant="danger"
            onClick={onEndRide}
            loading={loading}
            disabled={
              ![RIDE_STAGES.UNLOCKED, RIDE_STAGES.RIDING].includes(ride.stage)
            }
          >
            Kết thúc chuyến
          </Button>
        </div>
      </div>
    </section>
  );
}
