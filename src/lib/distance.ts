const MAX_DISTANCE_KM = 999.999;
const DISTANCE_DECIMALS = 3;

export function parseDistanceKm(value: string | number): number {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Distance must be a valid number.");
    }
    return normalizeDistanceKm(value);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Distance is required.");
  }

  const parsed = Number(trimmed.replace(",", "."));
  if (!Number.isFinite(parsed)) {
    throw new Error("Distance must be a valid number.");
  }

  return normalizeDistanceKm(parsed);
}

function normalizeDistanceKm(value: number): number {
  if (value < 0) {
    throw new Error("Distance cannot be negative.");
  }

  if (value > MAX_DISTANCE_KM) {
    throw new Error(`Distance must be ${MAX_DISTANCE_KM} km or less.`);
  }

  const factor = 10 ** DISTANCE_DECIMALS;
  return Math.round(value * factor) / factor;
}

export function formatDistanceKm(value: string | number): string {
  const km = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(km)) {
    return "–";
  }

  const formatted = km.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: DISTANCE_DECIMALS,
  });

  return `${formatted} km`;
}

export function distanceKmToStorage(value: number): string {
  return normalizeDistanceKm(value).toFixed(DISTANCE_DECIMALS);
}
