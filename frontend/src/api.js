const checkResponse = async (response) => {
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload?.error?.message || 'Request failed');
  }
  return payload.data;
};

export const api = {
  getStations: () => fetch('/api/stations').then(checkResponse),
  getLines: () => fetch('/api/lines').then(checkResponse),
  getSegments: () => fetch('/api/segments').then(checkResponse),
  getTrips: () => fetch('/api/trips').then(checkResponse),
  getTripById: (id) => fetch(`/api/trips/${id}`).then(checkResponse),
  createTrip: (trip) =>
    fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip)
    }).then(checkResponse),
  deleteTrip: (id) =>
    fetch(`/api/trips/${id}`, {
      method: 'DELETE'
    }).then(checkResponse)
};
