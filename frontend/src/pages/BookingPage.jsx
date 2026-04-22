import {
  AlertTriangle,
  Battery,
  Bike,
  Filter,
  LocateFixed,
  MapPinned,
  Search,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import AppHeader from "../components/AppHeader";
import BookingMap from "../components/BookingMap";
import Button from "../components/Button";
import GeofenceWarningModal from "../components/GeofenceWarningModal";
import RideStatusPanel from "../components/RideStatusPanel";
import ScooterList from "../components/ScooterList";
import { useAuth } from "../contexts/AuthContext";
import {
  bookingService,
  createIdleRide,
  RIDE_STAGES,
} from "../services/bookingService";
import { getAutoDecommissionReason } from "../services/alertService";
import { scooterService } from "../services/scooterService";

export default function BookingPage() {
  const { user } = useAuth();

  const [scooters, setScooters] = useState([]);
  const [selectedScooterId, setSelectedScooterId] = useState(null);
  const [ride, setRide] = useState(createIdleRide());
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [onlyNearby, setOnlyNearby] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [showGeofenceModal, setShowGeofenceModal] = useState(false);

  const watchIdRef = useRef(null);
  const mountedRef = useRef(false);

  const selectedScooter = useMemo(
    () => scooters.find((item) => item.id === selectedScooterId) || null,
    [scooters, selectedScooterId],
  );

  async function loadInitialData(currentLocation = null) {
    const data = await scooterService.getScooters(currentLocation);
    const sorted = scooterService.sortScootersByDistance(data);
    setScooters(sorted);

    if (!selectedScooterId && sorted.length) {
      setSelectedScooterId(sorted[0].id);
    }
  }

  async function bootstrapLocationAndScooters() {
    try {
      const currentLocation = await scooterService.getCurrentPosition();
      setUserLocation(currentLocation);
      setLocationError("");
      await loadInitialData(currentLocation);

      watchIdRef.current = scooterService.watchCurrentPosition(
        (nextLocation) => {
          setUserLocation(nextLocation);

          setScooters((current) => {
            const updated = scooterService.enrichScootersWithUserLocation(
              current,
              nextLocation,
            );
            return scooterService.sortScootersByDistance(updated);
          });

          setRide((currentRide) => {
            if (!selectedScooterId) {
              return currentRide;
            }

            const activeScooter = scooters.find(
              (item) => item.id === selectedScooterId,
            );

            if (!activeScooter) {
              return currentRide;
            }

            return {
              ...currentRide,
              distanceKm:
                scooterService.calculateDistanceKm(
                  nextLocation.lat,
                  nextLocation.lng,
                  activeScooter.currentLat,
                  activeScooter.currentLng,
                ) ?? currentRide.distanceKm,
            };
          });
        },
        (error) => {
          setLocationError(error.message);
        },
      );
    } catch (error) {
      setLocationError(error.message);
      toast.error(error.message);
      await loadInitialData(null);
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    bootstrapLocationAndScooters();

    return () => {
      mountedRef.current = false;
      scooterService.clearPositionWatch(watchIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (!selectedScooter) {
      return;
    }

    if (
      selectedScooter.geoFence?.outOfZone &&
      [RIDE_STAGES.UNLOCKED, RIDE_STAGES.RIDING].includes(ride.stage)
    ) {
      setShowGeofenceModal(true);
    }
  }, [selectedScooter, ride.stage]);

  const filteredScooters = useMemo(() => {
    return scooters.filter((scooter) => {
      const bySearch =
        !search.trim() ||
        scooter.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        scooter.locationLabel
          .toLowerCase()
          .includes(search.trim().toLowerCase());

      const byStatus =
        statusFilter === "all" || scooter.status === statusFilter;
      const byNearby = !onlyNearby || (scooter.distanceKm ?? Infinity) <= 1.5;

      return bySearch && byStatus && byNearby;
    });
  }, [onlyNearby, scooters, search, statusFilter]);

  function handleSelectScooter(scooter) {
    setSelectedScooterId(scooter.id);

    if (ride.stage === RIDE_STAGES.IDLE) {
      setRide((current) => ({
        ...current,
        scooterId: scooter.id,
        distanceKm: scooter.distanceKm ?? 0,
      }));
    }
  }

  async function handleRefreshLocation() {
    try {
      const currentLocation = await scooterService.getCurrentPosition();
      setUserLocation(currentLocation);
      setLocationError("");

      setScooters((current) => {
        const enriched = scooterService.enrichScootersWithUserLocation(
          current,
          currentLocation,
        );
        return scooterService.sortScootersByDistance(enriched);
      });

      toast.success("Đã cập nhật vị trí hiện tại.");
    } catch (error) {
      setLocationError(error.message);
      toast.error(error.message);
    }
  }

  async function handleReserve() {
    if (!selectedScooter) {
      toast.error("Hãy chọn một xe trước.");
      return;
    }

    const lockReason = getAutoDecommissionReason(selectedScooter);

    if (lockReason) {
      toast.error(lockReason);
      return;
    }

    try {
      setLoading(true);
      const nextRide = await bookingService.reserveScooter(
        selectedScooter,
        user,
      );
      setRide({
        ...nextRide,
        scooterId: selectedScooter.id,
        distanceKm: selectedScooter.distanceKm ?? 0,
      });

      setScooters((current) =>
        scooterService.applyScooterPatch(current, selectedScooter.id, {
          status: "in_use",
        }),
      );

      toast.success("Đặt xe thành công.");
    } catch (error) {
      toast.error(error.message || "Không thể đặt xe.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock() {
    try {
      setLoading(true);
      const nextRide = await bookingService.unlockRide(ride);
      setRide(nextRide);
      toast.success("Mở khóa thành công.");
    } catch (error) {
      toast.error(error.message || "Không thể mở khóa.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStartRide() {
    try {
      setLoading(true);
      const nextRide = await bookingService.startRide(ride);
      setRide(nextRide);
      toast.success("Chuyến đi đã bắt đầu.");
    } catch (error) {
      toast.error(error.message || "Không thể bắt đầu chuyến đi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEndRide() {
    try {
      setLoading(true);
      const nextRide = await bookingService.endRide(ride);
      setRide(nextRide);

      if (selectedScooter) {
        setScooters((current) =>
          scooterService.applyScooterPatch(current, selectedScooter.id, {
            status: "available",
            geoFence: { outOfZone: false },
          }),
        );
      }

      toast.success("Đã kết thúc chuyến đi.");
    } catch (error) {
      toast.error(error.message || "Không thể kết thúc chuyến đi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulateGeofence() {
    if (!selectedScooter) {
      toast.error("Hãy chọn một xe trước.");
      return;
    }

    setScooters((current) =>
      scooterService.applyScooterPatch(current, selectedScooter.id, {
        geoFence: { outOfZone: true },
        currentLat: 21.0405,
        currentLng: 105.8705,
      }),
    );

    if ([RIDE_STAGES.UNLOCKED, RIDE_STAGES.RIDING].includes(ride.stage)) {
      setShowGeofenceModal(true);
    }

    toast("Đã bật cảnh báo geofence.");
  }

  async function handleDecommission(reasonKey) {
    if (!selectedScooter) {
      toast.error("Hãy chọn một xe trước.");
      return;
    }

    const patch =
      reasonKey === "overheat"
        ? {
            status: "decommissioned",
            health: { batteryOverheat: true, rapidBatteryDrop: false },
          }
        : {
            status: "decommissioned",
            health: { batteryOverheat: false, rapidBatteryDrop: true },
          };

    const nextScooter = {
      ...selectedScooter,
      ...patch,
      health: {
        ...selectedScooter.health,
        ...patch.health,
      },
    };

    try {
      setLoading(true);
      await scooterService.updateScooterStatus(nextScooter);

      setScooters((current) =>
        scooterService.applyScooterPatch(current, selectedScooter.id, patch),
      );

      toast.error(
        reasonKey === "overheat"
          ? "Xe đã bị khóa do pin quá nóng."
          : "Xe đã bị khóa do pin sụt nhanh.",
      );
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật trạng thái xe.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <AppHeader />

      <main className="dashboard">
        <section className="page-intro">
          <div>
            <h1>Customer booking portal</h1>
            <p>
              Tìm xe gần nhất, xem trực tiếp trên bản đồ, đặt xe, mở khóa và
              theo dõi geofence theo thời gian thực.
            </p>
          </div>

          <div className="page-chip-group">
            <div className="page-chip">
              <MapPinned size={16} />
              <span>
                {userLocation ? "Định vị đang hoạt động" : "Chưa có định vị"}
              </span>
            </div>
            <div className="page-chip">
              <Bike size={16} />
              <span>{filteredScooters.length} xe phù hợp</span>
            </div>
          </div>
        </section>

        <section className="booking-layout">
          <aside className="panel">
            <div className="panel__header">
              <div>
                <h2 className="panel__title">Bộ lọc xe</h2>
                <p className="panel__subtitle">
                  Tìm xe gần bạn hoặc chọn theo trạng thái.
                </p>
              </div>
              <SlidersHorizontal size={18} />
            </div>

            <div className="panel__body filter-stack">
              <div className="search-box">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm theo tên xe hoặc khu vực"
                />
              </div>

              <div className="filter-row">
                <Filter size={16} />
                <select
                  className="select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="available">Available</option>
                  <option value="in_use">In use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="decommissioned">Decommissioned</option>
                </select>
              </div>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={onlyNearby}
                  onChange={(event) => setOnlyNearby(event.target.checked)}
                />
                <span>Chỉ hiện xe trong bán kính 1,5 km</span>
              </label>

              <Button
                variant="secondary"
                icon={LocateFixed}
                onClick={handleRefreshLocation}
              >
                Cập nhật vị trí
              </Button>

              {locationError ? (
                <div className="form-message form-message--error">
                  {locationError}
                </div>
              ) : null}

              <ScooterList
                scooters={filteredScooters}
                selectedScooterId={selectedScooterId}
                onSelect={handleSelectScooter}
              />
            </div>
          </aside>

          <BookingMap
            userLocation={userLocation}
            scooters={filteredScooters}
            selectedScooter={selectedScooter}
            onSelectScooter={handleSelectScooter}
          />

          <div className="right-column-stack">
            <RideStatusPanel
              ride={ride}
              scooter={selectedScooter}
              loading={loading}
              userLocation={userLocation}
              onReserve={handleReserve}
              onUnlock={handleUnlock}
              onStartRide={handleStartRide}
              onEndRide={handleEndRide}
            />

            <section className="panel">
              <div className="panel__header">
                <div>
                  <h2 className="panel__title">Giả lập cảnh báo hệ thống</h2>
                  <p className="panel__subtitle">
                    Dùng cho geofence và auto-decommission.
                  </p>
                </div>
                <AlertTriangle size={18} />
              </div>

              <div className="panel__body filter-stack">
                <Button
                  variant="secondary"
                  icon={MapPinned}
                  onClick={handleSimulateGeofence}
                  disabled={!selectedScooter}
                >
                  Giả lập ra khỏi vùng
                </Button>

                <Button
                  variant="danger"
                  icon={Battery}
                  onClick={() => handleDecommission("overheat")}
                  disabled={!selectedScooter || loading}
                >
                  Pin quá nóng
                </Button>

                <Button
                  variant="danger"
                  icon={ShieldAlert}
                  onClick={() => handleDecommission("rapidDrop")}
                  disabled={!selectedScooter || loading}
                >
                  Pin sụt nhanh
                </Button>
              </div>
            </section>
          </div>
        </section>
      </main>

      <GeofenceWarningModal
        open={showGeofenceModal}
        scooterName={selectedScooter?.name}
        onClose={() => setShowGeofenceModal(false)}
      />
    </div>
  );
}
