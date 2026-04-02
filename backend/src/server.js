import express from 'express';
import cors from 'cors';
import { loadBaseData, saveTrips } from './dataStore.js';
import { searchStations } from './lib/railway/searchStations.js';
import { findRoute } from './lib/railway/findRoute.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const state = {
  stations: [],
  lines: [],
  segments: [],
  trips: []
};

const hydrate = async () => {
  const data = await loadBaseData();
  Object.assign(state, data);
};

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'railway-track-recorder-backend' });
});

app.get('/api/railway/stations/search', (req, res) => {
  const q = `${req.query.q ?? ''}`;
  const result = searchStations(state.stations, q);
  res.json({ q, result });
});

app.post('/api/railway/route', (req, res) => {
  const payload = req.body ?? {};
  const route = findRoute({
    stations: state.stations,
    segments: state.segments,
    fromStationId: payload.fromStationId,
    toStationId: payload.toStationId,
    viaStationIds: payload.viaStationIds ?? [],
    mode: payload.mode ?? 'auto'
  });

  if (!route.ok) {
    return res.status(200).json(route);
  }

  return res.json(route);
});

app.get('/api/trips', (_req, res) => {
  res.json({ result: state.trips });
});

app.post('/api/trips', async (req, res) => {
  const now = new Date().toISOString();
  const payload = req.body ?? {};

  if (!payload.fromStationId || !payload.toStationId) {
    return res.status(400).json({ message: '起点和终点不能为空。' });
  }

  const trip = {
    id: payload.id ?? `trip-${Date.now()}`,
    title: payload.title?.trim() || '未命名旅程',
    inputMode: payload.inputMode ?? 'manual',
    fromStationId: payload.fromStationId,
    toStationId: payload.toStationId,
    viaStationIds: payload.viaStationIds ?? [],
    routeMode: payload.routeMode ?? 'auto',
    trainNumber: payload.trainNumber ?? '',
    travelDate: payload.travelDate ?? '',
    note: payload.note ?? '',
    routeResult: payload.routeResult ?? null,
    createdAt: payload.createdAt ?? now,
    updatedAt: now
  };

  const index = state.trips.findIndex((item) => item.id === trip.id);
  if (index >= 0) {
    state.trips[index] = trip;
  } else {
    state.trips.unshift(trip);
  }

  await saveTrips(state.trips);
  return res.status(201).json({ result: trip });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Railway Track Recorder backend is running.' });
});

hydrate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to load data files.', error);
    process.exit(1);
  });
