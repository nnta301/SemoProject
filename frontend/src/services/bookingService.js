import apiClient from "./apiClient";

export const RIDE_STAGES = {
  IDLE: "idle",
  RESERVED: "reserved",
  UNLOCKED: "unlocked",
  RIDING: "riding",
  COMPLETED: "completed",
};

function wait(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveBackendUserId(user) {
  const directNumericId = Number(user?.backendUserId ?? user?.id);

  if (Number.isInteger(directNumericId) && directNumericId > 0) {
    return directNumericId;
  }

  const extracted = Number(String(user?.id || "").replace(/\D/g, ""));

  if (Number.isInteger(extracted) && extracted > 0) {
    return extracted;
  }

  return Number(import.meta.env.VITE_RENTAL_USER_ID || 1);
}

function createRideFromRentalResponse(rental, user) {
  return {
    rentalId: rental?.id ?? null,
    stage: RIDE_STAGES.RESERVED,
    scooterId: Number(rental?.scooterId ?? null),
    reservedAt: rental?.startTime || new Date().toISOString(),
    unlockedAt: null,
    startedAt: null,
    endedAt: null,
    riderName: user?.name || "Customer",
    backendStatus: rental?.status || "ACTIVE",
    totalPrice: Number(rental?.totalPrice ?? 0),
    distanceKm: 0,
    warningActive: false,
  };
}

export function createIdleRide() {
  return {
    rentalId: null,
    stage: RIDE_STAGES.IDLE,
    scooterId: null,
    reservedAt: null,
    unlockedAt: null,
    startedAt: null,
    endedAt: null,
    riderName: null,
    backendStatus: null,
    totalPrice: 0,
    distanceKm: 0,
    warningActive: false,
  };
}

export async function reserveScooter(scooter, user) {
  const payload = {
    userId: resolveBackendUserId(user),
    scooterId: Number(scooter?.id),
  };

  const response = await apiClient.post("/api/rentals/start", payload);
  return createRideFromRentalResponse(response.data, user);
}

export async function unlockRide(ride) {
  await wait();

  return {
    ...ride,
    stage: RIDE_STAGES.UNLOCKED,
    unlockedAt: ride.unlockedAt || new Date().toISOString(),
  };
}

export async function startRide(ride) {
  await wait();

  return {
    ...ride,
    stage: RIDE_STAGES.RIDING,
    startedAt: ride.startedAt || new Date().toISOString(),
  };
}

export async function endRide(ride) {
  if (!ride?.rentalId) {
    throw new Error("Không tìm thấy rentalId để kết thúc chuyến đi.");
  }

  const response = await apiClient.put(`/api/rentals/${ride.rentalId}/end`);
  const rental = response.data || {};

  return {
    ...ride,
    stage: RIDE_STAGES.COMPLETED,
    endedAt: rental?.endTime || new Date().toISOString(),
    backendStatus: rental?.status || "COMPLETED",
    totalPrice: Number(rental?.totalPrice ?? 0),
    warningActive: false,
  };
}

export const bookingService = {
  RIDE_STAGES,
  createIdleRide,
  reserveScooter,
  unlockRide,
  startRide,
  endRide,
};
