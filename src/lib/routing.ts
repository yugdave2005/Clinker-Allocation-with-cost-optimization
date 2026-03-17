// ─── OSRM Route Fetcher with Rate-Limited Queue ──────────

interface RouteResult {
  coordinates: [number, number][]; // [lat, lng] pairs for Leaflet
  distanceKm: number;
  durationMin: number;
}

// Cache to avoid re-fetching same routes
const routeCache = new Map<string, RouteResult>();

// Rate-limited queue
const queue: (() => Promise<void>)[] = [];
let isProcessing = false;

async function processQueue() {
  isProcessing = true;
  while (queue.length > 0) {
    const task = queue.shift()!;
    await task();
    await new Promise((r) => setTimeout(r, 60)); // 60ms between calls
  }
  isProcessing = false;
}

export async function fetchRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  mode: 'ROAD' | 'RAIL' | 'BULK'
): Promise<RouteResult> {
  const cacheKey = `${from.lat},${from.lng}-${to.lat},${to.lng}-${mode}`;
  if (routeCache.has(cacheKey)) return routeCache.get(cacheKey)!;

  try {
    // OSRM expects lng,lat order
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.[0]) {
      return fallback(from, to);
    }

    const route = data.routes[0];
    // GeoJSON coords are [lng, lat] — flip for Leaflet [lat, lng]
    const coordinates: [number, number][] = route.geometry.coordinates.map(
      ([lng, lat]: number[]) => [lat, lng] as [number, number]
    );

    const result: RouteResult = {
      coordinates,
      distanceKm: route.distance / 1000,
      durationMin: Math.round(route.duration / 60),
    };

    routeCache.set(cacheKey, result);
    return result;
  } catch {
    return fallback(from, to);
  }
}

/**
 * Rate-limited route fetcher — use this in components.
 */
export function fetchRouteQueued(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  mode: 'ROAD' | 'RAIL' | 'BULK'
): Promise<RouteResult> {
  // Return cached immediately if available
  const cacheKey = `${from.lat},${from.lng}-${to.lat},${to.lng}-${mode}`;
  if (routeCache.has(cacheKey)) return Promise.resolve(routeCache.get(cacheKey)!);

  return new Promise((resolve) => {
    queue.push(async () => {
      const result = await fetchRoute(from, to, mode);
      resolve(result);
    });
    if (!isProcessing) processQueue();
  });
}

/**
 * Notify a global listener when a route finishes loading.
 */
let onRouteLoaded: (() => void) | null = null;
export function setOnRouteLoaded(cb: (() => void) | null) {
  onRouteLoaded = cb;
}
export function notifyRouteLoaded() {
  onRouteLoaded?.();
}

function fallback(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): RouteResult {
  return {
    coordinates: [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ],
    distanceKm: haversineKm(from, to),
    durationMin: 0,
  };
}

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
