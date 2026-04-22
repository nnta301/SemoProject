import apiClient from "./apiClient";
import { geofenceBoundary, mockScooters } from "../mock/mockData";

function wait(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeStatus(status) {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  if (["available", "free"].includes(value)) {
    return "available";
  }

  if (
    ["active", "in_use", "busy", "reserved", "riding", "unlocked"].includes(
      value,
    )
  ) {
    return "in_use";
  }

  if (["maintenance", "repair"].includes(value)) {
    return "maintenance";
  }

  if (["decommissioned", "unsafe", "locked"].includes(value)) {
    return "decommissioned";
  }

  return "available";
}

function toBackendStatus(status) {
  switch (normalizeStatus(status)) {
    case "in_use":
      return "ACTIVE";
    case "maintenance":
      return "MAINTENANCE";
    case "decommissioned":
      return "DECOMMISSIONED";
    default:
      return "AVAILABLE";
  }
}

function getMockAt(index) {
  return clone(mockScooters[index % mockScooters.length]);
}

function isInsideBoundary(lat, lng, boundary = geofenceBoundary) {
  if (typeof lat !== "number" || typeof lng !== "number") {
    return true;
  }

  return (
    lat <= boundary.north &&
    lat >= boundary.south &&
    lng >= boundary.west &&
    lng <= boundary.east
  );
}

export function calculateDistanceKm(fromLat, fromLng, toLat, toLng) {
  if (
    [fromLat, fromLng, toLat, toLng].some((value) => typeof value !== "number")
  ) {
    return null;
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((earthRadiusKm * c).toFixed(2));
}

function computeMinutes(distanceKm) {
  if (typeof distanceKm !== "number") {
    return null;
  }

  return Math.max(1, Math.round(distanceKm * 4));
}

function buildFallbackNearUser(index, userLocation) {
  const fallback = getMockAt(index);

  if (!userLocation) {
    return fallback;
  }

  const latOffset = ((index % 3) - 1) * 0.0018;
  const lngOffset = ((index % 4) - 1.5) * 0.0015;

  return {
    ...fallback,
    currentLat: Number((userLocation.lat + latOffset).toFixed(6)),
    currentLng: Number((userLocation.lng + lngOffset).toFixed(6)),
  };
}

function hydrate(list = [], userLocation = null) {
  return list.map((item, index) => {
    const fallback = buildFallbackNearUser(index, userLocation);
    const currentLat = Number(item?.currentLat ?? fallback.currentLat);
    const currentLng = Number(item?.currentLng ?? fallback.currentLng);
    const distanceKm = userLocation
      ? calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          currentLat,
          currentLng,
        )
      : Number(fallback.distanceKm ?? 0);

    return {
      ...fallback,
      id: Number(item?.id ?? fallback.id),
      name: item?.name || item?.codeName || fallback.name,
      codeName: item?.codeName || item?.name || fallback.codeName,
      batteryLevel: Number(item?.batteryLevel ?? fallback.batteryLevel),
      status: normalizeStatus(item?.status),
      currentLat,
      currentLng,
      locationLabel:
        item?.locationLabel || fallback.locationLabel || fallback.name,
      geoFence: {
        outOfZone: !isInsideBoundary(currentLat, currentLng),
      },
      health: {
        batteryOverheat: false,
        rapidBatteryDrop: false,
      },
      distanceKm: distanceKm ?? 0,
      estimatedMinutesAway:
        computeMinutes(distanceKm) ??
        Number(fallback.estimatedMinutesAway ?? 0),
      speedKmh: 0,
    };
  });
}

function buildUpdatePayload(scooterLike) {
  return {
    name: scooterLike.codeName || scooterLike.name || `SEMO-${scooterLike.id}`,
    batteryLevel: Number(scooterLike.batteryLevel ?? 0),
    status: toBackendStatus(scooterLike.status),
  };
}

export async function getCurrentPosition() {
  if (!navigator.geolocation) {
    throw new Error("Trình duyệt không hỗ trợ định vị.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        }),
      (error) => {
        reject(new Error(error?.message || "Không thể lấy vị trí hiện tại."));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      },
    );
  });
}

export function watchCurrentPosition(onSuccess, onError) {
  if (!navigator.geolocation) {
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) =>
      onSuccess({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      }),
    (error) => {
      if (onError) {
        onError(new Error(error?.message || "Không thể theo dõi vị trí."));
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 3000,
    },
  );
}

export function clearPositionWatch(watchId) {
  if (watchId !== null && watchId !== undefined && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

export async function getScooters(userLocation = null) {
  try {
    const response = await apiClient.get("/api/scooters");

    if (Array.isArray(response.data)) {
      return hydrate(response.data, userLocation);
    }
  } catch {
    // fallback
  }

  await wait();
  return hydrate(mockScooters, userLocation);
}

export function applyScooterPatch(scooters, scooterId, patch) {
  return scooters.map((scooter) => {
    if (scooter.id !== scooterId) {
      return scooter;
    }

    const currentLat = patch.currentLat ?? scooter.currentLat;
    const currentLng = patch.currentLng ?? scooter.currentLng;

    return {
      ...scooter,
      ...patch,
      geoFence: {
        ...scooter.geoFence,
        ...(patch.geoFence || {}),
        outOfZone:
          patch.geoFence?.outOfZone ??
          !isInsideBoundary(currentLat, currentLng),
      },
      health: {
        ...scooter.health,
        ...(patch.health || {}),
      },
    };
  });
}

export async function updateScooterStatus(scooter) {
  await apiClient.put(
    `/api/scooters/${scooter.id}`,
    buildUpdatePayload(scooter),
  );
}

export function sortScootersByDistance(scooters = []) {
  return [...scooters].sort(
    (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
  );
}

export function enrichScootersWithUserLocation(
  scooters = [],
  userLocation = null,
) {
  if (!userLocation) {
    return scooters;
  }

  return scooters.map((scooter) => {
    const distanceKm = calculateDistanceKm(
      userLocation.lat,
      userLocation.lng,
      scooter.currentLat,
      scooter.currentLng,
    );

    return {
      ...scooter,
      distanceKm: distanceKm ?? scooter.distanceKm ?? 0,
      estimatedMinutesAway:
        computeMinutes(distanceKm) ?? scooter.estimatedMinutesAway ?? 0,
      geoFence: {
        ...scooter.geoFence,
        outOfZone:
          scooter.geoFence?.outOfZone ??
          !isInsideBoundary(scooter.currentLat, scooter.currentLng),
      },
    };
  });
}

export const scooterService = {
  getCurrentPosition,
  watchCurrentPosition,
  clearPositionWatch,
  getScooters,
  applyScooterPatch,
  updateScooterStatus,
  sortScootersByDistance,
  enrichScootersWithUserLocation,
  calculateDistanceKm,
};
