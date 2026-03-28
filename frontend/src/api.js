const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.success) {
    throw new Error(payload?.error?.message ?? `Request failed: ${response.status}`);
  }

  return payload.data;
}

export const api = {
  getStations: () => request('/api/stations'),
  getLines: () => request('/api/lines'),
  getTrips: () => request('/api/trips'),
  getTripDetail: (tripId) => request(`/api/trips/${tripId}`),
  createTrip: (input) => request('/api/trips', { method: 'POST', body: JSON.stringify(input) }),
  deleteTrip: (tripId) => request(`/api/trips/${tripId}`, { method: 'DELETE' })
};
