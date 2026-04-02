const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `请求失败：${response.status}`);
  }

  return response.json();
};

export const api = {
  searchStations: async (query) => {
    const params = new URLSearchParams({ q: query });
    const data = await request(`/api/railway/stations/search?${params.toString()}`);
    return data.result ?? [];
  },
  findRoute: (payload) => request('/api/railway/route', { method: 'POST', body: JSON.stringify(payload) }),
  listTrips: async () => {
    const data = await request('/api/trips');
    return data.result ?? [];
  },
  saveTrip: async (payload) => {
    const data = await request('/api/trips', { method: 'POST', body: JSON.stringify(payload) });
    return data.result;
  }
};
